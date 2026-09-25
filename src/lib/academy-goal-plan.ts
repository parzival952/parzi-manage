// Accueil personnalisé PARZI Academy : à partir des réponses « Faisons
// connaissance » (objectif, échéance de l'examen), un message et un rythme
// conseillé. Fonctions pures, testées.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Horizon de l'examen, en semaines, compté depuis la fin de l'inscription. */
export const HORIZON_WEEKS: Record<string, number> = {
  "moins-3-mois": 12,
  "3-6-mois": 24,
  "plus-6-mois": 36,
};

export const GOAL_HEADLINES: Record<string, string> = {
  licence: "Cap sur ta licence d'agent",
  lancer: "Cap sur ton lancement comme agent",
  proche: "Pour bien accompagner ton proche",
  decouvrir: "Découvre le métier à ton rythme",
};

export type Pace =
  | { kind: "rythme"; weeksLeft: number; perWeek: number }
  | { kind: "termine" }
  | { kind: "libre" };

/**
 * Rythme conseillé pour couvrir les leçons restantes avant l'examen.
 * « libre » : pas d'échéance (ou inconnue) ; « termine » : tout est vu.
 */
export function examPace(opts: {
  horizon: string | null | undefined;
  startedAt: Date | string | null | undefined;
  now: Date;
  remainingLessons: number;
}): Pace {
  if (opts.remainingLessons <= 0) return { kind: "termine" };
  const weeks = opts.horizon ? HORIZON_WEEKS[opts.horizon] : undefined;
  if (!weeks) return { kind: "libre" };
  const start = opts.startedAt ? new Date(opts.startedAt) : opts.now;
  const elapsed = Number.isNaN(start.getTime()) ? 0 : Math.max(0, Math.floor((opts.now.getTime() - start.getTime()) / WEEK_MS));
  const weeksLeft = Math.max(1, weeks - elapsed);
  return { kind: "rythme", weeksLeft, perWeek: Math.ceil(opts.remainingLessons / weeksLeft) };
}

/** Phrase affichée sous le titre de l'accueil. */
export function paceSentence(p: Pace): string {
  if (p.kind === "termine") return "Tu as vu toutes les leçons : place aux révisions et à l'examen blanc.";
  if (p.kind === "libre") return "Pas encore de date d'examen : 2 à 3 leçons par semaine suffisent pour avancer sereinement.";
  const lecons = p.perWeek > 1 ? `${p.perWeek} leçons` : "1 leçon";
  const semaines = p.weeksLeft > 1 ? `${p.weeksLeft} semaines` : "1 semaine";
  return `Examen visé dans environ ${semaines} : vise ${lecons} par semaine pour tout couvrir à temps.`;
}
