// Trophées PARZI Academy — purs (aucune I/O). Plus rares que les badges, à collectionner.
// Calculés sur l'activité réelle. Certains sont SECRETS : masqués jusqu'à l'obtention.
// Réf : academy-systeme-progression.md §5 (raretés commun→mythique + trophées secrets).
import type { BadgeStats } from "./badges";

export type Rarity = "commun" | "rare" | "epique" | "legendaire" | "mythique";

export const RARITY_TONE: Record<Rarity, string> = {
  commun: "#8A8F98", rare: "#c9ccd1", epique: "#E4002B", legendaire: "#E9C36A", mythique: "#9a6bff",
};
export const RARITY_LABEL: Record<Rarity, string> = {
  commun: "Commun", rare: "Rare", epique: "Épique", legendaire: "Légendaire", mythique: "Mythique",
};

export type TrophyStats = BadgeStats & { totalLessons: number };

export type TrophyDef = {
  id: string; name: string; rarity: Rarity; icon: string; desc: string;
  secret?: boolean;
  need: (s: TrophyStats) => boolean;
  progress?: (s: TrophyStats) => number;
};

const r = (v: number, t: number) => Math.max(0, Math.min(1, v / t));

export const TROPHIES: TrophyDef[] = [
  // Communs
  { id: "eveil", name: "Éveil", rarity: "commun", icon: "✦", desc: "Accumuler 100 XP.", need: (s) => s.xp >= 100, progress: (s) => r(s.xp, 100) },
  { id: "premiere-marche", name: "Première Marche", rarity: "commun", icon: "🪜", desc: "Atteindre le niveau 2.", need: (s) => s.level >= 2, progress: (s) => r(s.level, 2) },
  { id: "decouvreur", name: "Découvreur", rarity: "commun", icon: "🧭", desc: "Compléter ton premier chapitre.", need: (s) => s.chapters >= 1, progress: (s) => r(s.chapters, 1) },
  // Rares
  { id: "millier", name: "Le Millier", rarity: "rare", icon: "🎖️", desc: "Accumuler 1 000 XP.", need: (s) => s.xp >= 1000, progress: (s) => r(s.xp, 1000) },
  { id: "perfectionniste", name: "Perfectionniste", rarity: "rare", icon: "🎯", desc: "Réussir 3 quiz avec 100 %.", need: (s) => s.perfect >= 3, progress: (s) => r(s.perfect, 3) },
  { id: "constance", name: "Constance", rarity: "rare", icon: "🔥", desc: "Tenir une série de 7 jours.", need: (s) => s.best >= 7, progress: (s) => r(s.best, 7) },
  // Épiques
  { id: "erudit", name: "Érudit", rarity: "epique", icon: "📚", desc: "Accumuler 5 000 XP.", need: (s) => s.xp >= 5000, progress: (s) => r(s.xp, 5000) },
  { id: "sans-faille", name: "Sans Faille", rarity: "epique", icon: "💯", desc: "Réussir 10 quiz avec 100 %.", need: (s) => s.perfect >= 10, progress: (s) => r(s.perfect, 10) },
  { id: "marathonien", name: "Marathonien", rarity: "epique", icon: "⚡", desc: "Tenir une série de 30 jours.", need: (s) => s.best >= 30, progress: (s) => r(s.best, 30) },
  // Légendaires
  { id: "maitre-savoir", name: "Maître du Savoir", rarity: "legendaire", icon: "🏆", desc: "Accumuler 25 000 XP.", need: (s) => s.xp >= 25000, progress: (s) => r(s.xp, 25000) },
  { id: "immortel", name: "Immortel", rarity: "legendaire", icon: "💎", desc: "Tenir une série de 100 jours.", need: (s) => s.best >= 100, progress: (s) => r(s.best, 100) },
  { id: "sommet", name: "Le Sommet", rarity: "legendaire", icon: "🗻", desc: "Atteindre le niveau 90.", need: (s) => s.level >= 90, progress: (s) => r(s.level, 90) },
  // Mythiques
  { id: "parzi-icon", name: "PARZI Icon", rarity: "mythique", icon: "👑", desc: "Atteindre le niveau 100.", need: (s) => s.level >= 100, progress: (s) => r(s.level, 100) },
  // Secrets (masqués jusqu'à l'obtention)
  { id: "encyclopedie", name: "Encyclopédie", rarity: "epique", icon: "📖", secret: true, desc: "Valider TOUTES les leçons disponibles.", need: (s) => s.totalLessons > 0 && s.lessons >= s.totalLessons },
  { id: "sans-filet", name: "Sans Filet", rarity: "legendaire", icon: "🕊️", secret: true, desc: "Avoir un 100 % sur chacune de tes leçons validées (min. 3).", need: (s) => s.lessons >= 3 && s.perfect >= s.lessons },
  { id: "increvable", name: "Increvable", rarity: "mythique", icon: "🛡️", secret: true, desc: "Atteindre une série de 50 jours.", need: (s) => s.best >= 50 },
];

export type EvaluatedTrophy = TrophyDef & { earned: boolean; pct: number };

export function evaluateTrophies(s: TrophyStats): EvaluatedTrophy[] {
  return TROPHIES.map((t) => ({ ...t, earned: t.need(s), pct: t.need(s) ? 1 : t.progress ? t.progress(s) : 0 }));
}

const RARITY_ORDER: Rarity[] = ["mythique", "legendaire", "epique", "rare", "commun"];
export function sortTrophies(list: EvaluatedTrophy[]): EvaluatedTrophy[] {
  return [...list].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    const ro = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    if (a.earned && ro !== 0) return ro; // les obtenus : plus rares d'abord
    return b.pct - a.pct;
  });
}
