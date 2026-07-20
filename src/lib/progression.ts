// Moteur de progression PARZI — pur (aucune I/O), réutilisable par tous les produits.
// Courbe : XP cumulée pour atteindre le niveau L = 100 × (L-1)^1.6 (arrondi à la dizaine).
// Réf : academy-systeme-progression.md §1-3.

export const MAX_LEVEL = 100;

const round10 = (x: number) => Math.round(x / 10) * 10;

/** XP cumulée nécessaire pour ATTEINDRE ce niveau (niveau 1 = 0). */
export function cumulativeXp(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) level = MAX_LEVEL;
  return round10(100 * Math.pow(level - 1, 1.6));
}

export function levelFromXp(xp: number): number {
  let lvl = 1;
  while (lvl < MAX_LEVEL && cumulativeXp(lvl + 1) <= xp) lvl++;
  return lvl;
}

export type Rank = { name: string; min: number; max: number; tone: string };

// 12 rangs prestigieux (academy doc §3).
export const RANKS: Rank[] = [
  { name: "Découverte", min: 1, max: 4, tone: "#8A8F98" },
  { name: "Apprenti", min: 5, max: 9, tone: "#A7ADB5" },
  { name: "Espoir", min: 10, max: 19, tone: "#C9CCD1" },
  { name: "Analyste", min: 20, max: 29, tone: "#D6A9AE" },
  { name: "Recruteur", min: 30, max: 39, tone: "#C9CCD1" },
  { name: "Professionnel", min: 40, max: 49, tone: "#E4818D" },
  { name: "Expert", min: 50, max: 59, tone: "#E4002B" },
  { name: "Élite", min: 60, max: 69, tone: "#E4002B" },
  { name: "Master", min: 70, max: 79, tone: "#A30020" },
  { name: "Champion", min: 80, max: 89, tone: "#A30020" },
  { name: "Légende", min: 90, max: 99, tone: "#C9A45C" },
  { name: "PARZI ICON", min: 100, max: 100, tone: "#C9A45C" },
];

export function rankFromLevel(level: number): Rank {
  return RANKS.find((r) => level >= r.min && level <= r.max) ?? RANKS[0];
}

export type LevelInfo = {
  level: number; rank: Rank;
  xp: number; intoLevel: number; span: number; nextLevelXp: number; pct: number;
  isMax: boolean;
};

export function levelInfo(xp: number): LevelInfo {
  const level = levelFromXp(xp);
  const base = cumulativeXp(level);
  const next = cumulativeXp(level + 1);
  const span = Math.max(1, next - base);
  const intoLevel = xp - base;
  const isMax = level >= MAX_LEVEL;
  return {
    level, rank: rankFromLevel(level), xp,
    intoLevel, span, nextLevelXp: next,
    pct: isMax ? 100 : Math.max(0, Math.min(100, (intoLevel / span) * 100)),
    isMax,
  };
}

// Barème XP (academy doc §1).
export const XP = {
  lessonBase: 15,
  quizPass: 30,     // score ≥ 70 %
  quizPerfect: 15,  // bonus score = 100 %
  chapterComplete: 75,
};

/** XP gagnée à la première complétion d'une leçon, selon le score de quiz (0-100). */
export function lessonXp(score: number): number {
  let x = XP.lessonBase;
  if (score >= 70) x += XP.quizPass;
  if (score >= 100) x += XP.quizPerfect;
  return x;
}

/** Nouveau streak à partir de la dernière date active (AAAA-MM-JJ) et d'aujourd'hui. */
export function nextStreak(lastActive: string, today: string, current: number): number {
  if (lastActive === today) return Math.max(1, current);
  const y = new Date(today + "T00:00:00Z");
  y.setUTCDate(y.getUTCDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  if (lastActive === yesterday) return current + 1;
  return 1; // rupture → on repart à 1 (le meilleur streak est conservé ailleurs)
}
