// Mise en situation « Le dossier Mbaye » — négocier le contrat de son joueur.
//
// L'élève joue l'agent de Yanis Mbaye face au directeur sportif d'un club
// acheteur. Personnages, clubs et montants sont FICTIFS et pédagogiques.

import {
  gradeFor,
  has,
  methodPoints,
  type Effect,
  type NodeDef,
  type Result,
  type Scenario,
  type SimState,
} from "../engine";

/** Repères du dossier (en milliers d'euros brut par mois). */
export const DOSSIER = {
  joueur: "Yanis Mbaye",
  profil: "22 ans · milieu offensif · FC Rivemont (Ligue 2)",
  salaireActuel: 20,
  cible: 45,
  plancher: 32,
  club: "Olympique de Valcourt (Ligue 1)",
  interlocuteur: "Marc Delorme, directeur sportif",
};

/** Plafond secret du club sur le fixe mensuel (k€). */
const CLUB_MAX_FIXE = 42;
const DS = "Marc Delorme · Valcourt";

const k = (n: number) => `${n.toLocaleString("fr-FR")} 000 €`;
const capFixe = (n: number) => Math.min(n, CLUB_MAX_FIXE);

type MbayeEffect = Omit<Effect, "vars"> & { salary?: number; signing?: number; years?: number; perfBonus?: boolean };

/** Traduit les champs du contrat en variables du moteur. */
function fx(e: MbayeEffect): Effect {
  const { salary, signing, years, perfBonus, ...rest } = e;
  const vars: Record<string, number> = {};
  if (salary !== undefined) vars.salary = salary;
  if (signing !== undefined) vars.signing = signing;
  if (years !== undefined) vars.years = years;
  if (perfBonus !== undefined) vars.perfBonus = perfBonus ? 1 : 0;
  return Object.keys(vars).length ? { ...rest, vars } : rest;
}

const NODES: Record<string, NodeDef> = {
  ouverture: {
    title: "L'ouverture",
    speaker: DS,
    line: () =>
      "« On suit Yanis depuis un moment, il nous plaît. Avant d'aller plus loin : qu'attendez-vous pour lui ? »",
    next: "contre",
    choices: [
      {
        id: "ancre",
        label:
          "« Avec 11 passes décisives et les salaires des milieux comparables en Ligue 1, nous visons 48 000 € brut par mois sur 4 ans. »",
        effect: () => fx({
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
        effect: () => fx({
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
        effect: () => fx({
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
    speaker: DS,
    line: (s) => `« Alors, ${k(s.vars.salary)} brut par mois : qu'en dites-vous ? »`,
    next: "besoin",
    choices: [
      {
        id: "silence",
        label: "Tu ne réponds pas tout de suite. Tu laisses le silence s'installer.",
        effect: (s) => {
          const salary = capFixe(s.vars.salary + 4);
          return fx({
            salary,
            method: 6,
            lesson: "techniques-nego",
            reply: `« … Bon. Je peux faire un effort : ${k(salary)}. »`,
            feedback:
              "Le silence met une pression saine : c'est l'autre qui comble le vide, en améliorant son offre sans que tu aies rien lâché.",
          });
        },
      },
      {
        id: "planb",
        label: "« Nous avons une autre proposition écrite. Il faudra faire mieux. »",
        effect: (s) => {
          if (has(s, "planb")) {
            const salary = capFixe(s.vars.salary + 6);
            return fx({
              salary,
              trust: -5,
              method: 6,
              lesson: "preparer-nego",
              reply: `« Je sais qu'il est suivi ailleurs… Montons à ${k(salary)}. »`,
              feedback:
                "Ta solution de repli (MESORE) est réelle : l'argument pèse et le club monte. Plus ton plan B est solide, plus tu négocies fort.",
            });
          }
          return fx({
            trust: -15,
            flags: ["bluff"],
            method: 0,
            lesson: "preparer-nego",
            reply: `« Alors je ne vous retiens pas. Je reste à ${k(s.vars.salary)}. »`,
            feedback:
              "Bluff : tu n'avais pas d'autre offre. Le club l'a senti, ta crédibilité en prend un coup. Un plan B se prépare AVANT d'entrer dans la pièce.",
          });
        },
      },
      {
        id: "accepter",
        label: "« Ça nous va, avançons sur cette base. »",
        effect: () => fx({
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
    speaker: DS,
    line: () => "« Pour être franc, le fixe nous pose problème. Notre masse salariale est très tendue. »",
    next: "structure",
    choices: [
      {
        id: "ecouter",
        label: "« Qu'est-ce qui coince exactement : le montant sur toute la durée, ou cette saison en particulier ? »",
        effect: () => fx({
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
        effect: () => fx({
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
        effect: (s) => fx({
          salary: Math.max(s.vars.salary - 3, 0),
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
    speaker: DS,
    line: () => "« Si on fait un effort sur le fixe, il nous faudrait Yanis sur 5 ans. »",
    next: "pression",
    choices: [
      {
        id: "montage",
        requires: "besoin",
        label:
          "« 5 ans, d'accord : 40 000 € de fixe, et une prime à la signature de 400 000 € versée pour moitié l'été prochain. Ça soulage votre saison. »",
        effect: (s) => fx({
          salary: Math.max(s.vars.salary, 40),
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
        effect: (s) => fx({
          salary: capFixe(s.vars.salary + 2),
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
        effect: () => fx({
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
    speaker: DS,
    line: () => "« Il me faut votre réponse ce soir. Sinon, on passe à un autre profil. »",
    next: "fin",
    choices: [
      {
        id: "temps",
        label: "« Je dois en parler à Yanis. Je vous rappelle demain à 9 h. »",
        effect: (s) =>
          has(s, "club")
            ? fx({
                method: 7,
                lesson: "techniques-nego",
                reply:
                  "« …Entendu. Demain 9 h. » Tu sais que, sans titulaire et avec le mercato qui ferme, il ne partira pas ailleurs.",
                feedback:
                  "Tu ne décides pas à chaud, et ta préparation te dit que l'ultimatum est un bluff : le club a besoin de ton joueur.",
              })
            : fx({
                trust: -5,
                method: 5,
                lesson: "techniques-nego",
                reply: "« Demain 9 h. Pas plus tard. »",
                feedback:
                  "Bon réflexe : jamais de décision à chaud. Sans savoir que le club était pressé, tu as pris un petit risque, qui passe cette fois.",
              }),
      },
      {
        id: "signer",
        label: "« D'accord, on signe ce soir. »",
        effect: () => fx({
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
        effect: (s) => fx({
          signing: s.vars.signing + 150,
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

/** Valeur mensuelle équivalente du contrat pour le joueur (k€). */
export function monthlyValue(s: SimState): number {
  const { salary, signing, years, perfBonus } = s.vars;
  const value = salary + signing / (years * 12) + (perfBonus ? 2 : 0);
  return Math.round(value * 10) / 10;
}

const GRADES: [number, string][] = [
  [85, "Négociateur confirmé"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function mbayeResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 25);
  const missed: string[] = [];
  if (!s.history.some((t) => t.choiceId === "montage")) {
    missed.push(
      has(s, "besoin")
        ? "Tu avais compris le vrai besoin du club, mais tu ne t'en es pas servi pour construire le montage."
        : "En posant une question ouverte sur le blocage, tu aurais découvert que le problème du club était sa trésorerie de la saison, et débloqué un montage bien plus avantageux.",
    );
  }

  if (s.outcome !== "accord") {
    const score = Math.min(30, methode + relation);
    return {
      outcome: s.outcome === "faute" ? "faute" : "rupture",
      score,
      grade: "Rupture",
      headline: "« Il s'est passé quoi ? On avait un club en Ligue 1… » Yanis reste à Rivemont.",
      tiles: [
        { label: "Valeur obtenue", value: "0/40" },
        { label: "Relation club", value: `${relation}/25` },
        { label: "Méthode", value: `${methode}/35` },
        { label: "Contrat / mois", value: "—" },
      ],
      notes: [],
      missed,
    };
  }

  const value = monthlyValue(s);
  const valeur = Math.round(Math.max(0, Math.min(1, (value - 30) / 18)) * 40);
  const threshold = has(s, "joueur") ? 38 : DOSSIER.cible;
  const happy = value >= threshold;
  const belowFloor = value < DOSSIER.plancher;
  const notes: string[] = [];
  let joueur = 0;
  let headline: string;
  if (happy) {
    headline = has(s, "joueur")
      ? "« C'est exactement ce qu'on s'était dit. Merci ! » Yanis signe, serein."
      : "« Franchement, c'est au-dessus de ce que j'espérais. » Yanis signe.";
  } else if (has(s, "a-chaud")) {
    joueur = -10;
    headline = "Yanis découvre le contrat une fois signé : « Tu aurais pu m'en parler avant… » La confiance est entamée.";
  } else {
    joueur = -5;
    headline = has(s, "joueur")
      ? "« C'est un peu moins que ce qu'on visait… » Yanis signe, mais sans enthousiasme."
      : "« Je pensais valoir plus que ça. » Yanis attendait plus : ses attentes n'avaient pas été alignées sur le marché.";
  }
  if (joueur < 0) notes.push(`Joueur déçu : ${joueur} points.`);
  if (belowFloor) {
    notes.push("Accord sous ton point de rupture : -10 points.");
    missed.push("L'accord est sous ton point de rupture (32 000 €) : tu aurais dû refuser plutôt que signer à ce prix.");
  }

  const score = Math.max(0, Math.min(100, valeur + relation + methode + joueur - (belowFloor ? 10 : 0)));
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [
      { label: "Valeur obtenue", value: `${valeur}/40` },
      { label: "Relation club", value: `${relation}/25` },
      { label: "Méthode", value: `${methode}/35` },
      { label: "Contrat / mois", value: `${value.toLocaleString("fr-FR")} k€` },
    ],
    notes,
    missed,
  };
}

export const MBAYE: Scenario = {
  id: "dossier-mbaye",
  title: "Le dossier Mbaye",
  pitch: "Négocie le contrat de ton joueur face au directeur sportif d'un club de Ligue 1.",
  theme: "Négociation",
  chapterId: "art-negociation",
  chapters: ["art-negociation"],
  lessons: ["negociation", "preparer-nego", "techniques-nego", "negocier-transfert"],
  intro: {
    heading: "Place ton joueur en Ligue 1",
    text: `Tu es l'agent de ${DOSSIER.joueur} (${DOSSIER.profil}). L'${DOSSIER.club} le veut. Tu as rendez-vous avec ${DOSSIER.interlocuteur}, pour négocier le contrat de ton joueur.`,
    stats: [
      { label: "Salaire actuel", value: `${k(DOSSIER.salaireActuel)}/mois` },
      { label: "Ta cible", value: `${k(DOSSIER.cible)}/mois` },
      { label: "Ton point de rupture", value: `${k(DOSSIER.plancher)}/mois` },
    ],
    note: "5 moments clés, 3 réponses possibles à chaque fois, aucune bonne réponse évidente. À la fin : ta note sur 100 et le débrief de chaque décision. Personnages et montants fictifs.",
  },
  preps: [
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
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["ouverture", "contre", "besoin", "structure", "pression"],
  initialVars: { salary: 0, signing: 0, years: 4, perfBonus: 0 },
  initialTrust: 60,
  ruptureAt: 20,
  trustLabel: "Relation avec le club",
  endLines: {
    rupture: "« Je crois qu'on va s'arrêter là. » Marc Delorme se lève. La confiance est rompue.",
    faute: "« Je crois qu'on va s'arrêter là. » Marc Delorme se lève.",
    accord: "Poignée de main. L'accord est trouvé. Voyons ce qu'il vaut…",
  },
  panel: (s) => ({
    title: "Sur la table",
    rows: [
      { label: "Fixe mensuel", value: s.vars.salary ? k(s.vars.salary) : "—" },
      { label: "Prime à la signature", value: s.vars.signing ? k(s.vars.signing) : "—" },
      { label: "Durée", value: `${s.vars.years} ans` },
      { label: "Primes d'objectifs", value: s.vars.perfBonus ? "oui" : "non" },
      ...(s.vars.salary ? [{ label: "Valeur / mois pour Yanis", value: `${monthlyValue(s).toLocaleString("fr-FR")} k€` }] : []),
    ],
    footer: `Cible ${DOSSIER.cible} k€ · rupture ${DOSSIER.plancher} k€`,
  }),
  result: mbayeResult,
};
