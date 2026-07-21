// PARZI Academy — contenu pédagogique (données) + progression de l'utilisateur (persistée).
// Le contenu est du code (versionné, pas de CMS en v1) ; la progression est en base (dual-mode).
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { levelInfo, lessonXp, nextStreak, type LevelInfo } from "./progression";

// ---------- Contenu ----------

export type QuizQuestion = { q: string; options: string[]; answer: number; explain?: string };
export type Lesson = {
  id: string; title: string; minutes: number;
  intro: string; blocks: string[]; quiz: QuizQuestion[];
};
export type Chapter = { id: string; title: string; subtitle: string; lessons: Lesson[] };

export const COURSE: { id: string; title: string; chapters: Chapter[] } = {
  id: "devenir-agent",
  title: "Devenir agent de joueur",
  chapters: [
    {
      id: "fondamentaux",
      title: "Les fondamentaux du métier",
      subtitle: "Ce qu'est vraiment le travail d'agent — et ce qu'il n'est pas.",
      lessons: [
        {
          id: "role",
          title: "Le rôle réel d'un agent",
          minutes: 4,
          intro: "Un agent n'est pas un chasseur de commissions : c'est le gestionnaire de carrière d'un joueur.",
          blocks: [
            "L'agent de joueur (ou « intermédiaire ») représente les intérêts d'un joueur — ou parfois d'un club — dans ses relations contractuelles. Son métier ne se résume pas à négocier un salaire : il conseille sur les choix de carrière, gère l'image, anticipe les échéances, et protège son client des mauvaises décisions.",
            "Le quotidien réel : beaucoup de relationnel, de la veille permanente sur le marché, de l'administratif (mandats, contrats), et des moments courts mais décisifs de négociation. La valeur d'un agent se mesure sur la durée d'une carrière, pas sur un transfert isolé.",
            "La règle d'or du métier : la confiance. Un joueur confie sa carrière — donc sa vie professionnelle — à son agent. Tout se construit et se détruit sur cette confiance.",
          ],
          quiz: [
            { q: "Quelle est la mission première d'un agent ?", options: ["Toucher une commission sur chaque transfert", "Gérer et protéger la carrière de son client dans la durée", "Trouver le salaire le plus élevé à court terme"], answer: 1, explain: "La carrière se gère sur la durée : c'est ça, le vrai métier." },
            { q: "Sur quoi repose la relation agent-joueur ?", options: ["Le contrat uniquement", "La confiance", "La notoriété de l'agent"], answer: 1 },
          ],
        },
        {
          id: "licence",
          title: "Licence & réglementation",
          minutes: 5,
          intro: "Exercer comme agent est encadré. Connaître le cadre, c'est éviter des erreurs qui coûtent cher.",
          blocks: [
            "En France, la profession d'agent sportif est régie par le Code du sport et la fédération (FFF pour le football). Historiquement, il faut réussir un examen pour obtenir la licence d'agent sportif. Au niveau international, la FIFA a réintroduit un système de licence avec examen pour les agents opérant sur les transferts internationaux.",
            "Le cadre évolue régulièrement (les règles FIFA sur les agents ont fait l'objet de plusieurs décisions juridiques récentes). Un bon agent suit ces évolutions : ce qui est vrai une saison peut changer la suivante. C'est un point où l'on ne s'appuie jamais sur une info datée.",
            "Point non négociable : la protection des mineurs. Les règles encadrant les joueurs mineurs sont strictes et protectrices. Tout manquement expose à de lourdes sanctions — et surtout, met en danger un jeune.",
          ],
          quiz: [
            { q: "Comment obtient-on traditionnellement une licence d'agent ?", options: ["En payant une cotisation", "En réussissant un examen", "En étant recommandé par un club"], answer: 1 },
            { q: "Concernant les joueurs mineurs, la réglementation est :", options: ["Souple", "Inexistante", "Stricte et protectrice"], answer: 2, explain: "La protection des mineurs est une ligne rouge du métier." },
          ],
        },
        {
          id: "mandat",
          title: "Le mandat de représentation",
          minutes: 5,
          intro: "Sans mandat, tu n'es pas l'agent du joueur. Le mandat, c'est ta légitimité écrite.",
          blocks: [
            "Le mandat est le contrat qui lie l'agent à son client. Il définit la durée, l'étendue (exclusif ou non), et la rémunération. Un mandat exclusif signifie que le joueur ne peut être représenté que par toi sur la période — c'est la base d'une relation sérieuse.",
            "La durée est encadrée (souvent limitée, ex. deux ans, renouvelable). L'échéance d'un mandat est un moment critique : le laisser expirer, c'est risquer de perdre son client. Un agent organisé suit ses échéances des mois à l'avance — jamais au dernier moment.",
            "La rémunération de l'agent est elle aussi encadrée (souvent exprimée en pourcentage du salaire brut du joueur). Transparence totale : les zones grises en matière de commission sont le meilleur moyen de perdre sa licence et sa réputation.",
          ],
          quiz: [
            { q: "Qu'est-ce qu'un mandat exclusif ?", options: ["Le joueur peut avoir plusieurs agents", "Seul cet agent représente le joueur sur la période", "Un contrat avec un club"], answer: 1 },
            { q: "Pourquoi suivre l'échéance d'un mandat à l'avance ?", options: ["Pour augmenter sa commission", "Pour ne pas risquer de perdre son client", "Ce n'est pas important"], answer: 1, explain: "C'est exactement ce que les alertes de Parzi Manage automatisent." },
          ],
        },
      ],
    },
    {
      id: "premiers-pas",
      title: "Décrocher son premier joueur",
      subtitle: "Le moment le plus dur d'une carrière d'agent. On l'aborde en méthode.",
      lessons: [
        {
          id: "approche",
          title: "Trouver et approcher un joueur",
          minutes: 5,
          intro: "On ne signe pas un joueur par chance : on construit une relation avant d'avoir quoi que ce soit à signer.",
          blocks: [
            "Le premier joueur vient rarement d'un grand club : il vient souvent de divisions inférieures, de centres de formation, ou de ton propre réseau local. L'observation régulière (matchs, scouting) est la base — tu dois voir jouer, pas juste lire des statistiques.",
            "L'approche se fait avec respect et patience. Un jeune joueur (et sa famille) a besoin de confiance avant tout. Se présenter, montrer qu'on comprend son parcours, apporter de la valeur AVANT de parler mandat : c'est ce qui distingue un agent sérieux d'un opportuniste.",
            "Ton atout de débutant, c'est le travail et la disponibilité. Un joueur négligé par les grosses agences peut trouver chez toi une attention que personne d'autre ne lui donne. C'est là que se gagne un premier mandat.",
          ],
          quiz: [
            { q: "D'où vient souvent le premier joueur d'un agent ?", options: ["D'un club de Ligue 1", "De divisions inférieures ou de son réseau local", "D'un transfert international"], answer: 1 },
            { q: "Avant de parler mandat, il faut d'abord :", options: ["Promettre un gros contrat", "Construire la confiance et apporter de la valeur", "Faire signer le plus vite possible"], answer: 1 },
          ],
        },
        {
          id: "negociation",
          title: "Les bases de la négociation",
          minutes: 6,
          intro: "Négocier, ce n'est pas gagner contre l'autre : c'est construire un accord que les deux camps veulent tenir.",
          blocks: [
            "Une bonne négociation se prépare plus qu'elle ne s'improvise. Avant de parler, tu dois connaître : la valeur de marché de ton joueur, les besoins réels du club, la marge dont tu disposes, et ton point de rupture (le seuil en dessous duquel tu dis non).",
            "Écouter vaut mieux que parler. Le club qui exprime son besoin te donne les clés de l'accord. L'agent qui écoute comprend ce qui compte vraiment pour l'autre — parfois ce n'est pas le montant, mais le timing, la durée, ou une clause précise.",
            "Un accord durable est un accord équilibré. Un club qui se sent floué se vengera au prochain dossier ; un joueur surpayé mais mal intégré échouera. Le bon agent protège la relation à long terme, pas juste la commission du jour.",
          ],
          quiz: [
            { q: "Qu'est-ce qu'un « point de rupture » en négociation ?", options: ["Le moment où on s'énerve", "Le seuil en dessous duquel on refuse l'accord", "La commission de l'agent"], answer: 1 },
            { q: "En négociation, la meilleure posture est :", options: ["Parler le plus possible", "Écouter pour comprendre le besoin de l'autre", "Imposer son chiffre d'emblée"], answer: 1, explain: "Écouter, c'est trouver les clés de l'accord." },
          ],
        },
      ],
    },
  ],
};

// Index plat pour la navigation.
export const ALL_LESSONS: { chapter: Chapter; lesson: Lesson }[] = COURSE.chapters.flatMap((c) =>
  c.lessons.map((l) => ({ chapter: c, lesson: l })),
);
export const LESSON_COUNT = ALL_LESSONS.length;

export function findLesson(lessonId: string): { chapter: Chapter; lesson: Lesson; index: number } | null {
  const idx = ALL_LESSONS.findIndex((x) => x.lesson.id === lessonId);
  if (idx < 0) return null;
  return { ...ALL_LESSONS[idx], index: idx };
}

// ---------- Attributs de la carte agent (OVR) ----------
// Chaque leçon nourrit un domaine de compétence. Les scores partent d'un socle
// et montent avec les leçons validées + le niveau. Rien d'inventé : tout dérive
// de l'activité réelle. De nouveaux cours enrichiront chaque domaine.

export type AttrKey = "SCO" | "NEG" | "JUR" | "BUS" | "IA" | "MGT";
export const ATTR_DEFS: { key: AttrKey; label: string }[] = [
  { key: "SCO", label: "Scouting" },
  { key: "NEG", label: "Négociation" },
  { key: "JUR", label: "Juridique" },
  { key: "BUS", label: "Business" },
  { key: "IA", label: "IA" },
  { key: "MGT", label: "Management" },
];
const LESSON_ATTR: Record<string, AttrKey> = {
  role: "MGT", licence: "JUR", mandat: "JUR", approche: "SCO", negociation: "NEG",
};

export type AttrScore = { key: AttrKey; label: string; score: number };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function computeAttributes(done: Set<string>, level: number): { ovr: number; attrs: AttrScore[] } {
  const counts: Record<string, number> = {};
  for (const id of done) { const a = LESSON_ATTR[id]; if (a) counts[a] = (counts[a] ?? 0) + 1; }
  const attrs: AttrScore[] = ATTR_DEFS.map(({ key, label }) => ({
    key, label,
    score: clamp(40 + (counts[key] ?? 0) * 10 + Math.floor(level / 4), 40, 99),
  }));
  const ovr = Math.round(attrs.reduce((s, a) => s + a.score, 0) / attrs.length);
  return { ovr, attrs };
}

// ---------- Progression persistée (dual-mode) ----------

export type Progress = {
  xp: number; streak: number; best_streak: number; last_active: string;
  done: Set<string>; perfect: number; info: LevelInfo;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

/** Nombre de chapitres entièrement complétés (toutes leurs leçons validées). */
export function chaptersCompleted(done: Set<string>): number {
  return COURSE.chapters.filter((c) => c.lessons.every((l) => done.has(l.id))).length;
}

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

export type CompletionResult = {
  already: boolean; xpGained: number; leveledUp: boolean;
  newLevel: number; info: LevelInfo; streak: number;
};

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
