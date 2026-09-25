// Quiz libre PARZI Academy : banque de questions (serveur uniquement), tirage,
// correction et enregistrement des meilleurs résultats.
//
// La banque (questions.json) est rédigée à partir du texte des leçons ; dans le
// fichier, la bonne réponse est TOUJOURS la première option : l'ordre est
// mélangé au tirage. Dual-mode : Postgres (prod) / SQLite (démo).
import { db } from "../db";
import { pg, usePostgres } from "../pg";
import BANK from "./questions.json";
import {
  CHRONO_LENGTH,
  CHRONO_MAX,
  SERIE_LENGTH,
  bestKey,
  chronoPoints,
  serieXp,
  type DrawnQuestion,
  type QuizAnswer,
  type QuizBests,
  type QuizLevel,
  type QuizMode,
  type QuizRecord,
} from "./types";

export type BankQuestion = {
  id: string;
  chapter: string;
  lesson: string;
  level: QuizLevel;
  q: string;
  options: string[];
  explain: string;
};

export const QUESTIONS = BANK as BankQuestion[];
const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export const QUIZ_COUNT = QUESTIONS.length;

export function isLevel(v: unknown): v is QuizLevel {
  return v === 1 || v === 2 || v === 3 || v === 4;
}
export function isMode(v: unknown): v is QuizMode {
  return v === "serie" || v === "chrono" || v === "libre";
}

export function countByLevel(chapter?: string | null): Record<QuizLevel, number> {
  const out: Record<QuizLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const q of QUESTIONS) if (!chapter || q.chapter === chapter) out[q.level]++;
  return out;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toDrawn(q: BankQuestion, rand: () => number): DrawnQuestion {
  const options = shuffle(q.options, rand);
  return {
    id: q.id,
    chapter: q.chapter,
    lesson: q.lesson,
    level: q.level,
    q: q.q,
    options,
    answer: options.indexOf(q.options[0]),
    explain: q.explain,
  };
}

/**
 * Tire `count` questions du niveau (et du module, si précisé), sans reprendre
 * celles déjà vues (`exclude`) tant qu'il en reste. Ordre des options mélangé.
 */
export function drawQuestions(
  level: QuizLevel,
  chapter: string | null,
  count: number,
  exclude: string[] = [],
  rand: () => number = Math.random,
): DrawnQuestion[] {
  const pool = QUESTIONS.filter((q) => q.level === level && (!chapter || q.chapter === chapter));
  const seen = new Set(exclude);
  const fresh = pool.filter((q) => !seen.has(q.id));
  const source = fresh.length > 0 ? fresh : pool; // tout vu : on recommence
  return shuffle(source, rand)
    .slice(0, Math.max(0, count))
    .map((q) => toDrawn(q, rand));
}

export class InvalidQuizError extends Error {}

type Graded = { score: number; correct: number; total: number };

/** Recorrige une partie côté serveur. Refuse toute partie incohérente. */
export function gradeRun(level: QuizLevel, mode: QuizMode, answers: unknown): Graded {
  if (!Array.isArray(answers)) throw new InvalidQuizError("Réponses absentes");
  const expected = mode === "serie" ? SERIE_LENGTH : mode === "chrono" ? CHRONO_LENGTH : null;
  if (expected !== null && answers.length !== expected) throw new InvalidQuizError("Nombre de réponses invalide");
  if (answers.length === 0 || answers.length > QUIZ_COUNT) throw new InvalidQuizError("Nombre de réponses invalide");

  const ids = new Set<string>();
  const results: { ok: boolean; ms: number }[] = [];
  for (const raw of answers as unknown[]) {
    const a = raw as Partial<QuizAnswer>;
    if (!a || typeof a.id !== "string" || typeof a.choice !== "string") throw new InvalidQuizError("Réponse invalide");
    const q = BY_ID.get(a.id);
    if (!q || q.level !== level) throw new InvalidQuizError("Question inconnue");
    // Une même question ne compte qu'une fois par partie (sauf en « sans fin »,
    // où la banque peut être parcourue plusieurs fois).
    if (mode !== "libre") {
      if (ids.has(a.id)) throw new InvalidQuizError("Question en double");
      ids.add(a.id);
    }
    const ms = typeof a.ms === "number" && Number.isFinite(a.ms) ? a.ms : 0;
    results.push({ ok: a.choice === q.options[0], ms });
  }

  const correct = results.filter((r) => r.ok).length;
  if (mode === "serie") return { score: correct, correct, total: results.length };
  if (mode === "chrono") {
    const score = Math.min(CHRONO_MAX, results.reduce((s, r) => s + chronoPoints(r.ok, r.ms), 0));
    return { score, correct, total: results.length };
  }
  // Sans fin : la plus longue série de bonnes réponses d'affilée.
  let run = 0;
  let best = 0;
  for (const r of results) {
    run = r.ok ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { score: Math.min(1000, best), correct, total: results.length };
}

/** Enregistre la partie : meilleur résultat, et XP des paliers (série seulement). */
export async function recordQuizRun(
  uid: string,
  level: QuizLevel,
  mode: QuizMode,
  answers: unknown,
): Promise<QuizRecord> {
  const g = gradeRun(level, mode, answers);
  const tierXp = mode === "serie" ? serieXp(g.score, level) : 0;

  if (usePostgres()) {
    return pg().begin(async (sql) => {
      await sql`INSERT INTO academy_quiz_bests (user_id, level, mode) VALUES (${uid}, ${level}, ${mode})
        ON CONFLICT (user_id, level, mode) DO NOTHING`;
      const rows = (await sql`SELECT best_score, xp_awarded FROM academy_quiz_bests
        WHERE user_id = ${uid} AND level = ${level} AND mode = ${mode} FOR UPDATE`) as unknown as {
        best_score: number;
        xp_awarded: number;
      }[];
      const prev = rows[0] ?? { best_score: 0, xp_awarded: 0 };
      const gained = Math.max(0, tierXp - prev.xp_awarded);
      const bestScore = Math.max(prev.best_score, g.score);
      const xpAwarded = prev.xp_awarded + gained;
      await sql`UPDATE academy_quiz_bests
        SET best_score = ${bestScore}, xp_awarded = ${xpAwarded}, plays = plays + 1, updated_at = now()
        WHERE user_id = ${uid} AND level = ${level} AND mode = ${mode}`;
      if (gained > 0) {
        await sql`INSERT INTO academy_progress (user_id, xp) VALUES (${uid}, ${gained})
          ON CONFLICT (user_id) DO UPDATE SET xp = academy_progress.xp + ${gained}`;
      }
      return { score: g.score, bestScore, xpGained: gained, xpAwarded, correct: g.correct, total: g.total };
    }) as Promise<QuizRecord>;
  }

  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    d.prepare("INSERT OR IGNORE INTO academy_quiz_bests (user_id, level, mode) VALUES (?, ?, ?)").run(uid, level, mode);
    const prev = d
      .prepare("SELECT best_score, xp_awarded FROM academy_quiz_bests WHERE user_id = ? AND level = ? AND mode = ?")
      .get(uid, level, mode) as { best_score: number; xp_awarded: number };
    const gained = Math.max(0, tierXp - prev.xp_awarded);
    const bestScore = Math.max(prev.best_score, g.score);
    const xpAwarded = prev.xp_awarded + gained;
    d.prepare(
      "UPDATE academy_quiz_bests SET best_score = ?, xp_awarded = ?, plays = plays + 1, updated_at = datetime('now') WHERE user_id = ? AND level = ? AND mode = ?",
    ).run(bestScore, xpAwarded, uid, level, mode);
    if (gained > 0) {
      d.prepare("INSERT INTO academy_progress (user_id, xp) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET xp = xp + ?").run(
        uid,
        gained,
        gained,
      );
    }
    d.exec("COMMIT");
    return { score: g.score, bestScore, xpGained: gained, xpAwarded, correct: g.correct, total: g.total };
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

/** Meilleurs résultats de l'élève, par niveau et par mode. Jamais bloquant. */
export async function getQuizBests(uid: string): Promise<QuizBests> {
  const out: QuizBests = {};
  try {
    const rows = usePostgres()
      ? ((await pg()`SELECT level, mode, best_score, xp_awarded, plays FROM academy_quiz_bests WHERE user_id = ${uid}`) as unknown as {
          level: number;
          mode: string;
          best_score: number;
          xp_awarded: number;
          plays: number;
        }[])
      : (db()
          .prepare("SELECT level, mode, best_score, xp_awarded, plays FROM academy_quiz_bests WHERE user_id = ?")
          .all(uid) as { level: number; mode: string; best_score: number; xp_awarded: number; plays: number }[]);
    for (const r of rows) {
      if (isLevel(Number(r.level)) && isMode(r.mode)) {
        out[bestKey(Number(r.level) as QuizLevel, r.mode)] = {
          bestScore: Number(r.best_score),
          xpAwarded: Number(r.xp_awarded),
          plays: Number(r.plays),
        };
      }
    }
  } catch (e) {
    console.error("[quiz-libre] lecture des meilleurs résultats impossible", e);
  }
  return out;
}
