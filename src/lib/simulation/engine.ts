// Moteur des mises en situation PARZI Academy.
//
// Chaque scénario (voir ./scenarios) décrit une préparation, une suite de
// moments clés à choix, et sa propre façon de noter la partie. Le moteur est
// générique, pur et déterministe : même préparation + mêmes choix → même
// résultat. Aucune IA, aucune base de données. Le serveur s'en sert pour
// rejouer une partie et recalculer le score avant de créditer l'XP.

import { seededRandom } from "../answer-order";

export type Outcome = "en-cours" | "accord" | "rupture" | "faute";

export type Prep = { id: string; title: string; detail: string; intel: string };

export type Turn = {
  node: string;
  title: string;
  speaker: string;
  line: string; // ce que disait l'interlocuteur avant ton choix
  choiceId: string;
  label: string;
  replySpeaker: string;
  reply: string;
  feedback: string;
  method: number; // points de méthode (0-7)
  lesson: string; // id de la leçon à relire
};

export type SimState = {
  scenarioId: string;
  prep: string[];
  node: string; // "fin" quand la partie est terminée
  vars: Record<string, number>;
  trust: number; // jauge de relation, 0-100
  flags: string[];
  history: Turn[];
  outcome: Outcome;
};

export type Effect = {
  reply: string;
  replySpeaker?: string;
  feedback: string;
  method: number;
  lesson: string;
  vars?: Record<string, number>; // nouvelles valeurs (remplacent les anciennes)
  trust?: number; // variation
  flags?: string[];
  end?: "rupture" | "faute"; // fin immédiate de la partie
};

export type ChoiceDef = {
  id: string;
  label: string;
  requires?: string; // flag ou préparation nécessaire pour voir ce choix
  effect: (s: SimState) => Effect;
};

export type NodeDef = {
  title: string;
  speaker: string;
  line: (s: SimState) => string;
  choices: ChoiceDef[];
  next: string; // id du moment suivant, ou "fin"
};

export type Tile = { label: string; value: string };

export type Result = {
  outcome: Exclude<Outcome, "en-cours">;
  score: number; // 0-100
  grade: string;
  headline: string; // réaction finale (joueur, famille…)
  tiles: Tile[]; // 4 tuiles du bilan
  notes: string[]; // malus expliqués
  missed: string[]; // ce qui a échappé à l'élève
};

export type Scenario = {
  id: string;
  title: string; // « Le dossier Mbaye »
  pitch: string; // une phrase pour la liste des scénarios
  theme: string; // « Négociation », « Mandat & mineurs »…
  chapterId: string; // chapitre principal (lien retour)
  chapters: string[]; // chapitres qui proposent ce scénario
  lessons: string[]; // leçons qui proposent ce scénario
  intro: { heading: string; text: string; stats: Tile[]; note: string };
  preps: Prep[];
  prepCount: number;
  nodes: Record<string, NodeDef>;
  order: string[];
  initialVars: Record<string, number>;
  initialTrust: number;
  ruptureAt: number; // la partie s'arrête si la jauge tombe à ce niveau ou dessous
  trustLabel: string;
  endLines: { rupture: string; faute: string; accord: string };
  panel: (s: SimState) => { title: string; rows: Tile[]; footer?: string };
  result: (s: SimState) => Result;
};

export const has = (s: SimState, f: string) => s.flags.includes(f) || s.prep.includes(f);

export function initialState(sc: Scenario, prep: string[] = []): SimState {
  return {
    scenarioId: sc.id,
    prep: [...prep],
    node: sc.order[0],
    vars: { ...sc.initialVars },
    trust: sc.initialTrust,
    flags: [],
    history: [],
    outcome: "en-cours",
  };
}

/** Préparation valide : exactement prepCount éléments distincts et connus. */
export function validPrep(sc: Scenario, prep: string[]): boolean {
  const ids = new Set(sc.preps.map((p) => p.id));
  return prep.length === sc.prepCount && new Set(prep).size === prep.length && prep.every((p) => ids.has(p));
}

export type ShownNode = {
  id: string;
  title: string;
  speaker: string;
  line: string;
  choices: { id: string; label: string }[];
};

/** Moment en cours tel qu'affiché (choix verrouillés retirés, ordre mélangé). */
export function currentNode(sc: Scenario, s: SimState): ShownNode | null {
  if (s.node === "fin") return null;
  const def = sc.nodes[s.node];
  return {
    id: s.node,
    title: def.title,
    speaker: def.speaker,
    line: def.line(s),
    choices: shuffled(
      def.choices.filter((c) => !c.requires || has(s, c.requires)).map((c) => ({ id: c.id, label: c.label })),
      `simulation:${sc.id}:${s.node}:${s.prep.join("+")}`,
    ),
  };
}

// La meilleure réponse est souvent écrite en premier dans les scénarios : on
// mélange l'ordre d'affichage (déterministe) pour qu'elle ne soit pas toujours
// au même endroit.
function shuffled<T>(list: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Joue un choix. Choix inconnu ou verrouillé → état inchangé (même objet). */
export function choose(sc: Scenario, s: SimState, choiceId: string): SimState {
  if (s.node === "fin") return s;
  const def = sc.nodes[s.node];
  const choice = def.choices.find((c) => c.id === choiceId);
  if (!choice || (choice.requires && !has(s, choice.requires))) return s;

  const e = choice.effect(s);
  const trust = Math.max(0, Math.min(100, s.trust + (e.trust ?? 0)));
  const turn: Turn = {
    node: s.node,
    title: def.title,
    speaker: def.speaker,
    line: def.line(s),
    choiceId,
    label: choice.label,
    replySpeaker: e.replySpeaker ?? def.speaker,
    reply: e.reply,
    feedback: e.feedback,
    method: e.method,
    lesson: e.lesson,
  };
  const next: SimState = {
    ...s,
    vars: { ...s.vars, ...(e.vars ?? {}) },
    trust,
    flags: [...s.flags, ...(e.flags ?? []).filter((f) => !s.flags.includes(f))],
    history: [...s.history, turn],
  };

  if (e.end) return { ...next, node: "fin", outcome: e.end };
  if (trust <= sc.ruptureAt) return { ...next, node: "fin", outcome: "rupture" };
  if (def.next === "fin") return { ...next, node: "fin", outcome: "accord" };
  return { ...next, node: def.next };
}

/**
 * Rejoue une partie à partir de la préparation et des choix envoyés par le
 * navigateur. Renvoie null si la préparation est invalide, si un choix est
 * inconnu ou verrouillé, ou si la partie n'est pas terminée.
 */
export function replay(sc: Scenario, prep: unknown, choices: unknown): SimState | null {
  if (!Array.isArray(prep) || !prep.every((p) => typeof p === "string") || !validPrep(sc, prep)) return null;
  if (!Array.isArray(choices) || choices.length > sc.order.length) return null;
  let s = initialState(sc, prep);
  for (const c of choices) {
    if (typeof c !== "string") return null;
    const next = choose(sc, s, c);
    if (next === s) return null;
    s = next;
  }
  return s.node === "fin" ? s : null;
}

/** Toutes les parties possibles pour une préparation (tests). */
export function allPaths(sc: Scenario, prep: string[]): SimState[] {
  const out: SimState[] = [];
  const walk = (s: SimState) => {
    const node = currentNode(sc, s);
    if (!node) {
      out.push(s);
      return;
    }
    for (const c of node.choices) walk(choose(sc, s, c.id));
  };
  walk(initialState(sc, prep));
  return out;
}

/** Toutes les préparations possibles (combinaisons de prepCount parmi preps). */
export function allPreps(sc: Scenario): string[][] {
  const ids = sc.preps.map((p) => p.id);
  const out: string[][] = [];
  const pick = (start: number, acc: string[]) => {
    if (acc.length === sc.prepCount) return void out.push(acc);
    for (let i = start; i < ids.length; i++) pick(i + 1, [...acc, ids[i]]);
  };
  pick(0, []);
  return out;
}

/** Somme des points de méthode, plafonnée à 35. */
export function methodPoints(s: SimState): number {
  return Math.min(35, s.history.reduce((sum, t) => sum + t.method, 0));
}

export function gradeFor(score: number, labels: [number, string][]): string {
  return labels.find(([min]) => score >= min)?.[1] ?? labels[labels.length - 1][1];
}

// ── XP ──────────────────────────────────────────────────────────────────
// L'XP d'une simulation s'ajoute à l'XP du compte (academy_progress.xp).
// Elle se gagne par PALIERS de meilleur score, une seule fois chacun, par
// scénario : rejouer pour le même résultat ne rapporte rien, progresser
// rapporte la différence. Le score est recalculé côté serveur (replay).

export const XP_TIERS: { min: number; xp: number }[] = [
  { min: 85, xp: 100 },
  { min: 70, xp: 60 },
  { min: 50, xp: 30 },
];

export const XP_MAX = XP_TIERS[0].xp;

/** XP totale associée à un score (palier atteint). */
export function xpForScore(score: number): number {
  return XP_TIERS.find((t) => score >= t.min)?.xp ?? 0;
}

/** Prochain palier à viser après ce meilleur score (null si tout est obtenu). */
export function nextTier(bestScore: number): { min: number; xp: number } | null {
  const reached = xpForScore(bestScore);
  const next = [...XP_TIERS].reverse().find((t) => t.xp > reached);
  return next ? { min: next.min, xp: next.xp - reached } : null;
}
