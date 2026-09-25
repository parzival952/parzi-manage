// Quiz libre — types et réglages partagés avec le navigateur (aucune question ici :
// la banque de questions reste côté serveur, voir ./index.ts).

export type QuizLevel = 1 | 2 | 3 | 4;
export type QuizMode = "serie" | "chrono" | "libre";

export const LEVELS: { level: QuizLevel; label: string; detail: string }[] = [
  { level: 1, label: "Débutant", detail: "Le vocabulaire et les idées clés du métier." },
  { level: 2, label: "Intermédiaire", detail: "Appliquer une règle à une situation simple." },
  { level: 3, label: "Confirmé", detail: "Cas pratiques, nuances et erreurs classiques." },
  { level: 4, label: "Expert", detail: "Cas complexes et arbitrages de professionnel." },
];

export const MODES: { mode: QuizMode; label: string; detail: string }[] = [
  { mode: "serie", label: "Série de 10", detail: "10 questions, correction expliquée, XP à gagner." },
  { mode: "chrono", label: "Chrono", detail: "10 questions, 20 secondes chacune. Plus tu réponds vite, plus tu marques." },
  { mode: "libre", label: "Sans fin", detail: "Les questions s'enchaînent. Vise la plus longue série sans faute." },
];

export const SERIE_LENGTH = 10;
export const CHRONO_LENGTH = 10;
export const CHRONO_SECONDS = 20;
/** Points au chrono : 100 par bonne réponse + 5 par seconde restante. */
export const CHRONO_BASE = 100;
export const CHRONO_PER_SECOND = 5;
export const CHRONO_MAX = CHRONO_LENGTH * (CHRONO_BASE + CHRONO_SECONDS * CHRONO_PER_SECOND);

/** Paliers d'XP d'une série (total cumulé), multipliés par le niveau. Versés une seule fois. */
export const SERIE_TIERS: { min: number; xp: number }[] = [
  { min: 6, xp: 10 },
  { min: 8, xp: 20 },
  { min: 10, xp: 30 },
];

export function serieXp(score: number, level: QuizLevel): number {
  let xp = 0;
  for (const t of SERIE_TIERS) if (score >= t.min) xp = t.xp;
  return xp * level;
}

export function serieXpMax(level: QuizLevel): number {
  return SERIE_TIERS[SERIE_TIERS.length - 1].xp * level;
}

export function chronoPoints(correct: boolean, ms: number): number {
  if (!correct) return 0;
  const left = Math.max(0, CHRONO_SECONDS - Math.ceil(Math.max(0, ms) / 1000));
  return CHRONO_BASE + left * CHRONO_PER_SECOND;
}

/** Question telle qu'envoyée au navigateur : options dans l'ordre d'affichage. */
export type DrawnQuestion = {
  id: string;
  chapter: string;
  lesson: string;
  level: QuizLevel;
  q: string;
  options: string[];
  /** Indice (dans l'ordre affiché) de la bonne réponse. */
  answer: number;
  explain: string;
};

/** Réponse renvoyée au serveur : l'option choisie, par son texte (-1 / "" = pas de réponse). */
export type QuizAnswer = { id: string; choice: string; ms?: number };

export type QuizBest = { bestScore: number; xpAwarded: number; plays: number };
export type QuizBests = Record<string, QuizBest>; // clé : `${level}-${mode}`

export type QuizRecord = {
  score: number;
  bestScore: number;
  xpGained: number;
  xpAwarded: number;
  correct: number;
  total: number;
};

export function bestKey(level: QuizLevel, mode: QuizMode): string {
  return `${level}-${mode}`;
}
