// PARZI Academy — progression de l'utilisateur (persistée, dual-mode SQLite/PG).
// Le CONTENU pédagogique (cours, leçons, quiz, attributs) vit dans academy-course.ts
// et reste importable depuis "@/lib/academy" via les ré-exports ci-dessous.
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { levelFromXp, levelInfo, lessonXp, nextStreak, type LevelInfo } from "./progression";

// ---------- Contenu (ré-exporté depuis academy-course.ts) ----------
export {
  COURSE,
  ALL_LESSONS,
  LESSON_COUNT,
  findLesson,
  chaptersCompleted,
  ATTR_DEFS,
  computeAttributes,
} from "./academy-course";
export type { QuizQuestion, Lesson, Chapter, AttrKey, AttrScore } from "./academy-course";

// ---------- Progression persistée (dual-mode) ----------

export type Progress = {
  xp: number; streak: number; best_streak: number; last_active: string;
  done: Set<string>; perfect: number; info: LevelInfo;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export async function getProgress(uid: string): Promise<Progress> {
  let xp = 0, streak = 0, best = 0, last = "", perfect = 0;
  const done = new Set<string>();
  if (usePostgres()) {
    const rows = (await pg()`SELECT xp, streak, best_streak, last_active FROM academy_progress WHERE user_id = ${uid}`) as unknown as { xp: number; streak: number; best_streak: number; last_active: string | null }[];
    if (rows[0]) { xp = rows[0].xp; streak = rows[0].streak; best = rows[0].best_streak; last = rows[0].last_active ?? ""; }
    const d = (await pg()`SELECT lesson_id, score FROM academy_done WHERE user_id = ${uid}`) as unknown as { lesson_id: string; score: number }[];
    for (const r of d) { done.add(r.lesson_id); if (r.score >= 100) perfect++; }
  } else {
    const row = db().prepare("SELECT xp, streak, best_streak, last_active FROM academy_progress WHERE user_id = ?").get(uid) as { xp: number; streak: number; best_streak: number; last_active: string } | undefined;
    if (row) { xp = row.xp; streak = row.streak; best = row.best_streak; last = row.last_active ?? ""; }
    const d = db().prepare("SELECT lesson_id, score FROM academy_done WHERE user_id = ?").all(uid) as { lesson_id: string; score: number }[];
    for (const r of d) { done.add(r.lesson_id); if (r.score >= 100) perfect++; }
  }
  return { xp, streak, best_streak: best, last_active: last, done, perfect, info: levelInfo(xp) };
}

// ---------- Hall of Fame / Classement ----------

export type HofRow = { user_id: string; name: string; xp: number; level: number };
export type HofWeek = { user_id: string; name: string; wxp: number };
export type HallOfFame = { general: HofRow[]; weekly: HofWeek[]; myRank: number; totalUsers: number };

const nameOf = (email: string) => (email ? email.split("@")[0] : "Agent");
// XP d'une leçon selon le score, reproduit en SQL pour agréger la semaine.
const WEEK_XP_SQL = "SUM(15 + CASE WHEN score >= 70 THEN 30 ELSE 0 END + CASE WHEN score >= 100 THEN 15 ELSE 0 END)";

export async function getHallOfFame(uid: string): Promise<HallOfFame> {
  if (usePostgres()) {
    const sql = pg();
    const gen = (await sql`SELECT ap.user_id, ap.xp, COALESCE(p.email,'') AS email
      FROM academy_progress ap LEFT JOIN profiles p ON p.user_id = ap.user_id
      ORDER BY ap.xp DESC, ap.user_id LIMIT 20`) as unknown as { user_id: string; xp: number; email: string }[];
    const wk = (await sql.unsafe(`SELECT ad.user_id, COALESCE(p.email,'') AS email, ${WEEK_XP_SQL} AS wxp
      FROM academy_done ad LEFT JOIN profiles p ON p.user_id = ad.user_id
      WHERE ad.created_at >= now() - interval '7 days'
      GROUP BY ad.user_id, p.email ORDER BY wxp DESC LIMIT 20`)) as unknown as { user_id: string; email: string; wxp: number }[];
    const tot = (await sql`SELECT COUNT(*)::int AS n FROM academy_progress`) as unknown as { n: number }[];
    const mine = (await sql`SELECT xp FROM academy_progress WHERE user_id = ${uid}`) as unknown as { xp: number }[];
    const myXp = mine[0]?.xp ?? 0;
    const rk = (await sql`SELECT COUNT(*)::int AS n FROM academy_progress WHERE xp > ${myXp}`) as unknown as { n: number }[];
    return {
      general: gen.map((r) => ({ user_id: r.user_id, name: nameOf(r.email), xp: r.xp, level: levelFromXp(r.xp) })),
      weekly: wk.map((r) => ({ user_id: r.user_id, name: nameOf(r.email), wxp: Number(r.wxp) })),
      myRank: (rk[0]?.n ?? 0) + 1, totalUsers: tot[0]?.n ?? 0,
    };
  }
  const d = db();
  const gen = d.prepare("SELECT ap.user_id, ap.xp, COALESCE(p.email,'') AS email FROM academy_progress ap LEFT JOIN profiles p ON p.user_id = ap.user_id ORDER BY ap.xp DESC LIMIT 20").all() as { user_id: string; xp: number; email: string }[];
  const wk = d.prepare(`SELECT ad.user_id, COALESCE(p.email,'') AS email, ${WEEK_XP_SQL} AS wxp FROM academy_done ad LEFT JOIN profiles p ON p.user_id = ad.user_id WHERE ad.created_at >= datetime('now','-7 days') GROUP BY ad.user_id ORDER BY wxp DESC LIMIT 20`).all() as { user_id: string; email: string; wxp: number }[];
  const tot = (d.prepare("SELECT COUNT(*) AS n FROM academy_progress").get() as { n: number }).n;
  const myXp = (d.prepare("SELECT xp FROM academy_progress WHERE user_id = ?").get(uid) as { xp: number } | undefined)?.xp ?? 0;
  const rk = (d.prepare("SELECT COUNT(*) AS n FROM academy_progress WHERE xp > ?").get(myXp) as { n: number }).n;
  return {
    general: gen.map((r) => ({ user_id: r.user_id, name: nameOf(r.email), xp: r.xp, level: levelFromXp(r.xp) })),
    weekly: wk.map((r) => ({ user_id: r.user_id, name: nameOf(r.email), wxp: Number(r.wxp) })),
    myRank: rk + 1, totalUsers: tot,
  };
}

export type CompletionResult = {
  already: boolean; xpGained: number; leveledUp: boolean;
  newLevel: number; info: LevelInfo; streak: number;
};

/** Ajoute un bonus d'XP (certification, défi…). Upsert sur academy_progress. */
export async function addBonusXp(uid: string, amount: number): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO academy_progress (user_id, xp) VALUES (${uid}, ${amount})
      ON CONFLICT (user_id) DO UPDATE SET xp = academy_progress.xp + ${amount}`;
    return;
  }
  db().prepare("INSERT INTO academy_progress (user_id, xp) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET xp = xp + ?").run(uid, amount, amount);
}

/** Activité du jour (pour les défis quotidiens) : leçons validées et 100 % aujourd'hui. */
export async function getTodayActivity(uid: string): Promise<{ lessons: number; perfect: number }> {
  if (usePostgres()) {
    const rows = (await pg()`SELECT COUNT(*)::int AS lessons, COUNT(*) FILTER (WHERE score >= 100)::int AS perfect
      FROM academy_done WHERE user_id = ${uid} AND created_at::date = current_date`) as unknown as { lessons: number; perfect: number }[];
    return { lessons: rows[0]?.lessons ?? 0, perfect: rows[0]?.perfect ?? 0 };
  }
  const row = db().prepare("SELECT COUNT(*) AS lessons, SUM(CASE WHEN score >= 100 THEN 1 ELSE 0 END) AS perfect FROM academy_done WHERE user_id = ? AND date(created_at) = date('now')").get(uid) as { lessons: number; perfect: number | null } | undefined;
  return { lessons: row?.lessons ?? 0, perfect: Number(row?.perfect ?? 0) };
}

/** Valide une leçon : idempotent (pas d'XP en double), met à jour XP + streak. */
export async function completeLesson(uid: string, lessonId: string, score: number): Promise<CompletionResult> {
  const before = await getProgress(uid);
  if (before.done.has(lessonId)) {
    return { already: true, xpGained: 0, leveledUp: false, newLevel: before.info.level, info: before.info, streak: before.streak };
  }
  const gained = lessonXp(score);
  const today = todayStr();
  const newStreak = nextStreak(before.last_active, today, before.streak);
  const newXp = before.xp + gained;
  const newBest = Math.max(before.best_streak, newStreak);
  const newInfo = levelInfo(newXp);

  if (usePostgres()) {
    await pg()`INSERT INTO academy_done (user_id, lesson_id, score) VALUES (${uid}, ${lessonId}, ${score})
      ON CONFLICT (user_id, lesson_id) DO NOTHING`;
    await pg()`INSERT INTO academy_progress (user_id, xp, streak, best_streak, last_active)
      VALUES (${uid}, ${newXp}, ${newStreak}, ${newBest}, ${today}::date)
      ON CONFLICT (user_id) DO UPDATE SET xp = ${newXp}, streak = ${newStreak}, best_streak = ${newBest}, last_active = ${today}::date`;
  } else {
    db().prepare("INSERT OR IGNORE INTO academy_done (user_id, lesson_id, score) VALUES (?,?,?)").run(uid, lessonId, score);
    db().prepare(`INSERT INTO academy_progress (user_id, xp, streak, best_streak, last_active) VALUES (?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET xp=excluded.xp, streak=excluded.streak, best_streak=excluded.best_streak, last_active=excluded.last_active`)
      .run(uid, newXp, newStreak, newBest, today);
  }
  return { already: false, xpGained: gained, leveledUp: newInfo.level > before.info.level, newLevel: newInfo.level, info: newInfo, streak: newStreak };
}
