// Simulation de négociation PARZI Academy — « Le dossier Mbaye ».
//
// L'élève joue l'agent de Yanis Mbaye face au directeur sportif d'un club
// acheteur. Scénario à choix, déterministe (même choix → même résultat),
// sans IA ni base de données : tout le moteur est ici, en fonctions pures,
// et le composant client ne fait qu'afficher l'état.
//
// Personnages, clubs et montants sont FICTIFS et pédagogiques.

import { seededRandom } from "./answer-order";

export type PrepId = "club" | "planb" | "joueur";
export type Flag = PrepId | "besoin" | "bluff" | "a-chaud";

export type Prep = { id: PrepId; title: string; detail: string; intel: string };

export const PREPS: Prep[] = [
  {
    id: "club",
    title: "Te renseigner sur la situation du club",
    detail: "Appeler ton réseau pour savoir où en est l'Olympique de Valcourt.",
    intel: "Leur milieu titulaire est blessé pour 4 mois et le mercato ferme dans 5 jours : ils sont pressés.",
  },
  {
    id: "planb",
    title: "Sécuriser un plan B",
    detail: "Obtenir une offre écrite d'un autre club avant le rendez-vous.",
    intel: "Le FC Brémont a envoyé une offre écrite à 35 000 € brut par mois. Ta solution de repli (MESORE) est solide.",
  },
  {
    id: "joueur",
    title: "Aligner les attentes de Yanis",
    detail: "Faire le point avec ton joueur sur la réalité du marché.",
    intel: "Yanis a compris le marché : il signe à partir de 38 000 € par mois si le projet sportif est bon.",
  },
];

export const PREP_COUNT = 2;

/** Repères du dossier (en milliers d'euros brut par mois). */
export const DOSSIER = {
  joueur: "Yanis Mbaye",
  profil: "22 ans · milieu offensif · FC Rivemont (Ligue 2)",
  stats: "11 passes décisives, 6 buts cette saison",
  salaireActuel: 20,
  cible: 45,
  plancher: 32,
  club: "Olympique de Valcourt (Ligue 1)",
  interlocuteur: "Marc Delorme, directeur sportif",
};

/** Plafond secret du club sur le fixe mensuel (k€). */
const CLUB_MAX_FIXE = 42;
const RUPTURE_CONFIANCE = 20;

export type SimState = {
  prep: PrepId[];
  node: NodeId | "fin";
  salary: number; // fixe mensuel sur la table (k€), 0 = pas encore d'offre
  signing: number; // prime à la signature (k€)
  years: number;
  perfBonus: boolean;
  trust: number; // relation avec le club, 0-100
  flags: Flag[];
  history: Turn[];
  outcome: "en-cours" | "accord" | "rupture";
};

export type Turn = {
  node: NodeId;
  title: string;
  line: string; // ce que disait le directeur sportif avant ton choix
  choiceId: string;
  label: string;
  reply: string;
  feedback: string;
  method: number; // points de méthode (0-7)
  lesson: string; // id de la leçon à relire
};

type Effect = {
  reply: string;
  feedback: string;
  method: number;
  lesson: string;
  salary?: number;
  signing?: number;
  years?: number;
  perfBonus?: boolean;
  trust?: number; // variation
  flags?: Flag[];
};

type ChoiceDef = {
  id: string;
  label: string;
  requires?: Flag;
  effect: (s: SimState) => Effect;
};

type NodeDef = {
  title: string;
  line: (s: SimState) => string;
  choices: ChoiceDef[];
  next: NodeId | "fin";
};

export type NodeId = "ouverture" | "contre" | "besoin" | "structure" | "pression";

const k = (n: number) => `${n.toLocaleString("fr-FR")} 000 €`;
const has = (s: SimState, f: Flag) => s.flags.includes(f) || s.prep.includes(f as PrepId);
const capFixe = (n: number) => Math.min(n, CLUB_MAX_FIXE);

const NODES: Record<NodeId, NodeDef> = {
  ouverture: {
    title: "L'ouverture",
    line: () =>
      "« On suit Yanis depuis un moment, il nous plaît. Avant d'aller plus loin : qu'attendez-vous pour lui ? »",
    next: "contre",
    choices: [
      {
        id: "ancre",
        label:
          "« Avec 11 passes décisives et les salaires des milieux comparables en Ligue 1, nous visons 48 000 € brut par mois sur 4 ans. »",
        effect: () => ({
          salary: 32,
          method: 7,
          lesson: "techniques-nego",
          reply: "« C'est ambitieux… mais je vois que vous avez préparé le dossier. Nous pourrions partir sur 32 000 €. »",
          feedback:
            "Ancrage réussi : ton chiffre est ambitieux mais argumenté. Toute la discussion se cale désormais sur ta référence.",
        }),
      },
      {
        id: "delirant",
        label: "« Pas moins de 80 000 € par mois. Il vaut ça, point. »",
        effect: () => ({
          salary: 25,
          trust: -20,
          method: 0,
          lesson: "techniques-nego",
          reply: "« Soyons sérieux. Notre offre, c'est 25 000 €. »",
          feedback:
            "Un ancrage délirant te décrédibilise : l'autre ne le prend pas comme référence et commence à se méfier de toi.",
        }),
      },
      {
        id: "attendre",
        label: "« Faites-nous d'abord votre proposition. »",
        effect: () => ({
          salary: 25,
          method: 2,
          lesson: "techniques-nego",
          reply: "« Très bien : 25 000 € brut par mois sur 4 ans. »",
          feedback:
            "Tu laisses le club ancrer : la discussion part de SON chiffre, et il est bas. Proposer en premier, avec un chiffre crédible, fixe le cadre.",
        }),
      },
    ],
  },

  contre: {
    title: "La première offre",
    line: (s) => `« Alors, ${k(s.salary)} brut par mois : qu'en dites-vous ? »`,
    next: "besoin",
    choices: [
      {
        id: "silence",
        label: "Tu ne réponds pas tout de suite. Tu laisses le silence s'installer.",
        effect: (s) => {
          const salary = capFixe(s.salary + 4);
          return {
            salary,
            method: 6,
            lesson: "techniques-nego",
            reply: `« … Bon. Je peux faire un effort : ${k(salary)}. »`,
            feedback:
              "Le silence met une pression saine : c'est l'autre qui comble le vide, en améliorant son offre sans que tu aies rien lâché.",
          };
        },
      },
      {
        id: "planb",
        label: "« Nous avons une autre proposition écrite. Il faudra faire mieux. »",
        effect: (s) => {
          if (has(s, "planb")) {
            const salary = capFixe(s.salary + 6);
            return {
              salary,
              trust: -5,
              method: 6,
              lesson: "preparer-nego",
              reply: `« Je sais qu'il est suivi ailleurs… Montons à ${k(salary)}. »`,
              feedback:
                "Ta solution de repli (MESORE) est réelle : l'argument pèse et le club monte. Plus ton plan B est solide, plus tu négocies fort.",
            };
          }
          return {
            trust: -15,
            flags: ["bluff"],
            method: 0,
            lesson: "preparer-nego",
            reply: `« Alors je ne vous retiens pas. Je reste à ${k(s.salary)}. »`,
            feedback:
              "Bluff : tu n'avais pas d'autre offre. Le club l'a senti, ta crédibilité en prend un coup. Un plan B se prépare AVANT d'entrer dans la pièce.",
          };
        },
      },
      {
        id: "accepter",
        label: "« Ça nous va, avançons sur cette base. »",
        effect: () => ({
          method: 0,
          lesson: "techniques-nego",
          reply: "« Parfait, voilà qui est constructif. »",
          feedback:
            "Tu acceptes la première offre : c'est une concession sans contrepartie, et le signal que tu pouvais céder encore.",
        }),
      },
    ],
  },

  besoin: {
    title: "Le vrai blocage",
    line: () => "« Pour être franc, le fixe nous pose problème. Notre masse salariale est très tendue. »",
    next: "structure",
    choices: [
      {
        id: "ecouter",
        label: "« Qu'est-ce qui coince exactement : le montant sur toute la durée, ou cette saison en particulier ? »",
        effect: () => ({
          trust: 10,
          flags: ["besoin"],
          method: 7,
          lesson: "negociation",
          reply: "« …Cette saison. L'été prochain, deux gros contrats se terminent et on respire. »",
          feedback:
            "Tu as trouvé le vrai besoin : ce n'est pas le montant, c'est la trésorerie de la saison. Une question ouverte vaut plus qu'un argument.",
        }),
      },
      {
        id: "camper",
        label: "« Ce n'est pas notre problème. Yanis vaut ce prix. »",
        effect: () => ({
          trust: -10,
          method: 1,
          lesson: "negociation",
          reply: "« Alors on risque de ne pas s'entendre. »",
          feedback:
            "Tu campes sans comprendre l'autre. Ferme sur le fond, oui, mais sans écoute tu passes à côté de la clé de l'accord.",
        }),
      },
      {
        id: "baisser",
        label: "« Je comprends. On peut baisser notre demande de 3 000 €. »",
        effect: (s) => ({
          salary: Math.max(s.salary - 3, 0),
          trust: 3,
          method: 0,
          lesson: "techniques-nego",
          reply: "« Merci, c'est apprécié. »",
          feedback:
            "Concession gratuite : tu baisses sans rien obtenir en échange, et sans même savoir ce qui bloquait vraiment.",
        }),
      },
    ],
  },

  structure: {
    title: "Le montage",
    line: () => "« Si on fait un effort sur le fixe, il nous faudrait Yanis sur 5 ans. »",
    next: "pression",
    choices: [
      {
        id: "montage",
        requires: "besoin",
        label:
          "« 5 ans, d'accord : 40 000 € de fixe, et une prime à la signature de 400 000 € versée pour moitié l'été prochain. Ça soulage votre saison. »",
        effect: (s) => ({
          salary: Math.max(s.salary, 40),
          signing: 400,
          years: 5,
          trust: 5,
          method: 7,
          lesson: "negociation",
          reply: "« Là, vous me parlez. Ça règle mon problème de cette saison. On peut le faire. »",
          feedback:
            "Montage gagnant : tu as répondu au vrai besoin du club (sa trésorerie) sans rien lâcher sur la valeur pour ton joueur.",
        }),
      },
      {
        id: "troc",
        label: "« 5 ans, si vous ajoutez des primes d'objectifs : matchs joués et passes décisives. »",
        effect: (s) => ({
          salary: capFixe(s.salary + 2),
          years: 5,
          perfBonus: true,
          method: 6,
          lesson: "techniques-nego",
          reply: "« Des primes liées aux performances… c'est défendable en interne. D'accord, et on ajoute 2 000 € au fixe. »",
          feedback:
            "Concession réciproque : tu donnes la durée, tu obtiens des primes. Jamais un cadeau, toujours un troc.",
        }),
      },
      {
        id: "cede",
        label: "« D'accord pour 5 ans. »",
        effect: () => ({
          years: 5,
          method: 1,
          lesson: "techniques-nego",
          reply: "« Très bien. »",
          feedback:
            "Tu donnes une année de plus sans contrepartie. La durée est une monnaie d'échange : elle aurait dû t'acheter quelque chose.",
        }),
      },
    ],
  },

  pression: {
    title: "La pression du temps",
    line: () => "« Il me faut votre réponse ce soir. Sinon, on passe à un autre profil. »",
    next: "fin",
    choices: [
      {
        id: "temps",
        label: "« Je dois en parler à Yanis. Je vous rappelle demain à 9 h. »",
        effect: (s) =>
          has(s, "club")
            ? {
                method: 7,
                lesson: "techniques-nego",
                reply:
                  "« …Entendu. Demain 9 h. » Tu sais que, sans titulaire et avec le mercato qui ferme, il ne partira pas ailleurs.",
                feedback:
                  "Tu ne décides pas à chaud, et ta préparation te dit que l'ultimatum est un bluff : le club a besoin de ton joueur.",
              }
            : {
                trust: -5,
                method: 5,
                lesson: "techniques-nego",
                reply: "« Demain 9 h. Pas plus tard. »",
                feedback:
                  "Bon réflexe : jamais de décision à chaud. Sans savoir que le club était pressé, tu as pris un petit risque, qui passe cette fois.",
              },
      },
      {
        id: "signer",
        label: "« D'accord, on signe ce soir. »",
        effect: () => ({
          flags: ["a-chaud"],
          method: 0,
          lesson: "techniques-nego",
          reply: "« Parfait, je vous envoie le contrat. »",
          feedback:
            "Décision à chaud, sans consulter ton joueur. Un ultimatum sert souvent à te faire céder : le pro prend le temps de vérifier.",
        }),
      },
      {
        id: "geste",
        requires: "planb",
        label: "« L'autre club attend aussi ma réponse. Un dernier geste et c'est fait. »",
        effect: (s) => ({
          signing: s.signing + 150,
          trust: -5,
          method: 5,
          lesson: "preparer-nego",
          reply: "« Vous êtes dur en affaires… 150 000 € de plus à la signature. C'est mon dernier mot. »",
          feedback:
            "Ton plan B te permet d'obtenir un dernier geste. Efficace, mais à doser : la relation avec ce club compte pour tes prochains dossiers.",
        }),
      },
    ],
  },
};

export const NODE_ORDER: NodeId[] = ["ouverture", "contre", "besoin", "structure", "pression"];

export function initialState(prep: PrepId[] = []): SimState {
  return {
    prep: [...prep],
    node: "ouverture",
    salary: 0,
    signing: 0,
    years: 4,
    perfBonus: false,
    trust: 60,
    flags: [],
    history: [],
    outcome: "en-cours",
  };
}

/** Valide la préparation : exactement PREP_COUNT éléments distincts et connus. */
export function validPrep(prep: string[]): prep is PrepId[] {
  const ids = new Set(PREPS.map((p) => p.id as string));
  return prep.length === PREP_COUNT && new Set(prep).size === prep.length && prep.every((p) => ids.has(p));
}

export type ShownNode = { id: NodeId; title: string; line: string; choices: { id: string; label: string }[] };

/** Étape en cours telle qu'affichée (choix verrouillés retirés). */
export function currentNode(s: SimState): ShownNode | null {
  if (s.node === "fin") return null;
  const def = NODES[s.node];
  return {
    id: s.node,
    title: def.title,
    line: def.line(s),
    choices: shuffled(
      def.choices.filter((c) => !c.requires || has(s, c.requires)).map((c) => ({ id: c.id, label: c.label })),
      `simulation:${s.node}:${s.prep.join("+")}`,
    ),
  };
}

// La meilleure réponse est écrite en premier dans le scénario : on mélange
// l'ordre d'affichage (déterministe) pour qu'elle ne soit pas toujours en haut.
function shuffled<T>(list: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Joue un choix. Choix inconnu ou verrouillé → état inchangé. */
export function choose(s: SimState, choiceId: string): SimState {
  if (s.node === "fin") return s;
  const def = NODES[s.node];
  const choice = def.choices.find((c) => c.id === choiceId);
  if (!choice || (choice.requires && !has(s, choice.requires))) return s;

  const e = choice.effect(s);
  const trust = Math.max(0, Math.min(100, s.trust + (e.trust ?? 0)));
  const turn: Turn = {
    node: s.node,
    title: def.title,
    line: def.line(s),
    choiceId,
    label: choice.label,
    reply: e.reply,
    feedback: e.feedback,
    method: e.method,
    lesson: e.lesson,
  };
  const next: SimState = {
    ...s,
    salary: e.salary ?? s.salary,
    signing: e.signing ?? s.signing,
    years: e.years ?? s.years,
    perfBonus: e.perfBonus ?? s.perfBonus,
    trust,
    flags: [...s.flags, ...(e.flags ?? []).filter((f) => !s.flags.includes(f))],
    history: [...s.history, turn],
  };

  if (trust <= RUPTURE_CONFIANCE) {
    return { ...next, node: "fin", outcome: "rupture" };
  }
  if (def.next === "fin") return { ...next, node: "fin", outcome: "accord" };
  return { ...next, node: def.next };
}

/** Valeur mensuelle équivalente du contrat pour le joueur (k€). */
export function monthlyValue(s: SimState): number {
  const value = s.salary + s.signing / (s.years * 12) + (s.perfBonus ? 2 : 0);
  return Math.round(value * 10) / 10;
}

export type Result = {
  outcome: "accord" | "rupture";
  score: number; // 0-100
  grade: string;
  value: number;
  parts: { valeur: number; relation: number; methode: number; joueur: number };
  playerHappy: boolean;
  playerLine: string;
  belowFloor: boolean;
  missed: string[];
};

const GRADES: [number, string][] = [
  [85, "Négociateur confirmé"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

/** Bilan de fin de partie. */
export function result(s: SimState): Result {
  const methode = Math.min(35, s.history.reduce((sum, t) => sum + t.method, 0));
  const relation = Math.round((s.trust / 100) * 25);
  const missed: string[] = [];
  if (!s.history.some((t) => t.choiceId === "montage")) {
    missed.push(
      has(s, "besoin")
        ? "Tu avais compris le vrai besoin du club, mais tu ne t'en es pas servi pour construire le montage."
        : "En posant une question ouverte sur le blocage, tu aurais découvert que le problème du club était sa trésorerie de la saison, et débloqué un montage bien plus avantageux.",
    );
  }

  if (s.outcome === "rupture") {
    return {
      outcome: "rupture",
      score: Math.min(30, methode + relation),
      grade: "Rupture",
      value: 0,
      parts: { valeur: 0, relation, methode, joueur: 0 },
      playerHappy: false,
      playerLine: "« Il s'est passé quoi ? On avait un club en Ligue 1… » Yanis reste à Rivemont.",
      belowFloor: false,
      missed,
    };
  }

  const value = monthlyValue(s);
  const valeur = Math.round(Math.max(0, Math.min(1, (value - 30) / 18)) * 40);
  const threshold = has(s, "joueur") ? 38 : DOSSIER.cible;
  const playerHappy = value >= threshold;
  const belowFloor = value < DOSSIER.plancher;
  let joueur = 0;
  let playerLine: string;
  if (playerHappy) {
    playerLine = has(s, "joueur")
      ? "« C'est exactement ce qu'on s'était dit. Merci ! » Yanis signe, serein."
      : "« Franchement, c'est au-dessus de ce que j'espérais. » Yanis signe.";
  } else if (has(s, "a-chaud")) {
    joueur = -10;
    playerLine = "Yanis découvre le contrat une fois signé : « Tu aurais pu m'en parler avant… » La confiance est entamée.";
  } else {
    joueur = -5;
    playerLine = has(s, "joueur")
      ? "« C'est un peu moins que ce qu'on visait… » Yanis signe, mais sans enthousiasme."
      : "« Je pensais valoir plus que ça. » Yanis attendait plus : ses attentes n'avaient pas été alignées sur le marché.";
  }
  if (belowFloor) {
    missed.push("L'accord est sous ton point de rupture (32 000 €) : tu aurais dû refuser plutôt que signer à ce prix.");
  }

  const score = Math.max(0, Math.min(100, valeur + relation + methode + joueur - (belowFloor ? 10 : 0)));
  const grade = GRADES.find(([min]) => score >= min)?.[1] ?? "À revoir";
  return {
    outcome: "accord",
    score,
    grade,
    value,
    parts: { valeur, relation, methode, joueur },
    playerHappy,
    playerLine,
    belowFloor,
    missed,
  };
}

/** Tous les enchaînements de choix possibles pour une préparation (tests). */
export function allPaths(prep: PrepId[]): SimState[] {
  const out: SimState[] = [];
  const walk = (s: SimState) => {
    const node = currentNode(s);
    if (!node) {
      out.push(s);
      return;
    }
    for (const c of node.choices) walk(choose(s, c.id));
  };
  walk(initialState(prep));
  return out;
}

// ── XP ──────────────────────────────────────────────────────────────────
// L'XP de la simulation s'ajoute à l'XP du compte (academy_progress.xp).
// Elle se gagne par PALIERS de meilleur score, une seule fois chacun :
// rejouer pour le même résultat ne rapporte rien, progresser rapporte la
// différence. Le score est toujours recalculé côté serveur (rejeu des choix).

export const SCENARIO_ID = "dossier-mbaye";

export const XP_TIERS: { min: number; xp: number; label: string }[] = [
  { min: 85, xp: 100, label: "Négociateur confirmé" },
  { min: 70, xp: 60, label: "Solide" },
  { min: 50, xp: 30, label: "Accord correct" },
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

/**
 * Rejoue une partie à partir de la préparation et des choix envoyés par le
 * navigateur. Renvoie null si la préparation est invalide, si un choix est
 * inconnu ou verrouillé, ou si la partie n'est pas terminée.
 */
export function replay(prep: unknown, choices: unknown): SimState | null {
  if (!Array.isArray(prep) || !prep.every((p) => typeof p === "string") || !validPrep(prep)) return null;
  if (!Array.isArray(choices) || choices.length > NODE_ORDER.length) return null;
  let s = initialState(prep);
  for (const c of choices) {
    if (typeof c !== "string") return null;
    const next = choose(s, c);
    if (next === s) return null;
    s = next;
  }
  return s.node === "fin" ? s : null;
}
