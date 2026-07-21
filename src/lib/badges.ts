// Moteur de badges PARZI Academy — pur (aucune I/O).
// Chaque badge se calcule à partir de l'activité réelle (progression) : jamais offert,
// jamais inventé. Réf : academy-catalogue-badges.md + academy-systeme-progression.md §4.
// V1 : un socle de badges branchés sur ce qu'on suit déjà (leçons, chapitres, quiz
// parfaits, série, niveau). Le catalogue complet (400+) s'ajoute au même endroit.

export type BadgeTier = "bronze" | "argent" | "or" | "platine" | "diamant" | "obsidienne" | "legende";

export const TIER_TONE: Record<BadgeTier, string> = {
  bronze: "#b08d57", argent: "#c9ccd1", or: "#e9c36a",
  platine: "#dfe4ea", diamant: "#7fd4ff", obsidienne: "#9a6bff", legende: "#E4002B",
};

export type BadgeStats = {
  level: number; xp: number; streak: number; best: number;
  lessons: number; chapters: number; perfect: number;
};

export type BadgeDef = {
  id: string; name: string; family: string; tier: BadgeTier;
  icon: string; desc: string;
  need: (s: BadgeStats) => boolean;
  // progression vers l'obtention (0..1) pour les badges non encore obtenus
  progress?: (s: BadgeStats) => number;
};

const ratio = (v: number, t: number) => Math.max(0, Math.min(1, v / t));

export const BADGES: BadgeDef[] = [
  // Académie / assiduité
  { id: "premier-pas", name: "Premier Pas", family: "Académie", tier: "bronze", icon: "🚀",
    desc: "Valider ta toute première leçon.", need: (s) => s.lessons >= 1, progress: (s) => ratio(s.lessons, 1) },
  { id: "rituel", name: "Rituel", family: "Académie", tier: "bronze", icon: "📘",
    desc: "Valider 5 leçons.", need: (s) => s.lessons >= 5, progress: (s) => ratio(s.lessons, 5) },
  { id: "studieux", name: "Studieux", family: "Formation", tier: "argent", icon: "📚",
    desc: "Valider 15 leçons.", need: (s) => s.lessons >= 15, progress: (s) => ratio(s.lessons, 15) },
  { id: "insatiable", name: "Insatiable", family: "Formation", tier: "or", icon: "🔥",
    desc: "Valider 40 leçons.", need: (s) => s.lessons >= 40, progress: (s) => ratio(s.lessons, 40) },
  // Chapitres
  { id: "fondations", name: "Fondations", family: "Académie", tier: "bronze", icon: "🧱",
    desc: "Compléter un chapitre entier.", need: (s) => s.chapters >= 1, progress: (s) => ratio(s.chapters, 1) },
  { id: "batisseur", name: "Bâtisseur", family: "Académie", tier: "argent", icon: "🏗️",
    desc: "Compléter 3 chapitres.", need: (s) => s.chapters >= 3, progress: (s) => ratio(s.chapters, 3) },
  // Quiz
  { id: "sans-faute", name: "Sans Faute", family: "Quiz", tier: "argent", icon: "🎯",
    desc: "Réussir un quiz avec 100 %.", need: (s) => s.perfect >= 1, progress: (s) => ratio(s.perfect, 1) },
  { id: "serie-noire", name: "Série Noire", family: "Quiz", tier: "or", icon: "💯",
    desc: "Réussir 10 quiz à 100 %.", need: (s) => s.perfect >= 10, progress: (s) => ratio(s.perfect, 10) },
  // Persévérance / série
  { id: "regulier", name: "Régulier", family: "Persévérance", tier: "bronze", icon: "📅",
    desc: "Atteindre une série de 3 jours.", need: (s) => s.best >= 3, progress: (s) => ratio(s.best, 3) },
  { id: "sept-jours", name: "7 Jours", family: "Persévérance", tier: "argent", icon: "🔥",
    desc: "Atteindre une série de 7 jours.", need: (s) => s.best >= 7, progress: (s) => ratio(s.best, 7) },
  { id: "trente-jours", name: "30 Jours", family: "Persévérance", tier: "or", icon: "⚡",
    desc: "Atteindre une série de 30 jours.", need: (s) => s.best >= 30, progress: (s) => ratio(s.best, 30) },
  { id: "cent-jours", name: "100 Jours", family: "Persévérance", tier: "diamant", icon: "💎",
    desc: "Atteindre une série de 100 jours.", need: (s) => s.best >= 100, progress: (s) => ratio(s.best, 100) },
  // Rangs / niveaux
  { id: "espoir", name: "Espoir", family: "Expertise", tier: "argent", icon: "⭐",
    desc: "Atteindre le niveau 10.", need: (s) => s.level >= 10, progress: (s) => ratio(s.level, 10) },
  { id: "analyste", name: "Analyste", family: "Expertise", tier: "or", icon: "🧠",
    desc: "Atteindre le niveau 20.", need: (s) => s.level >= 20, progress: (s) => ratio(s.level, 20) },
  { id: "expert", name: "Expert", family: "Expertise", tier: "platine", icon: "🏅",
    desc: "Atteindre le niveau 50.", need: (s) => s.level >= 50, progress: (s) => ratio(s.level, 50) },
  { id: "legende", name: "Légende", family: "Expertise", tier: "legende", icon: "👑",
    desc: "Atteindre le niveau 90.", need: (s) => s.level >= 90, progress: (s) => ratio(s.level, 90) },
];

export type EvaluatedBadge = BadgeDef & { earned: boolean; pct: number };

export function evaluateBadges(s: BadgeStats): EvaluatedBadge[] {
  return BADGES.map((b) => ({
    ...b,
    earned: b.need(s),
    pct: b.need(s) ? 1 : b.progress ? b.progress(s) : 0,
  }));
}

/** Badges obtenus, puis les plus proches d'être débloqués. */
export function sortBadges(list: EvaluatedBadge[]): EvaluatedBadge[] {
  return [...list].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return b.pct - a.pct;
  });
}
