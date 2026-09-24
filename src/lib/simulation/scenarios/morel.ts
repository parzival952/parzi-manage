// Mise en situation « Le dossier Morel » — commission et double représentation.
//
// Lucas Morel, ton client, va signer à l'AS Cordemont. Le directeur sportif
// propose de régler ta commission, puis de te faire représenter aussi le club,
// puis un « petit extra discret ». Un investisseur propose un montage. Enfin,
// Lucas te demande qui te paie. Fidèle aux leçons « Éthique, déontologie &
// conflits d'intérêts », « La rémunération de l'agent », « Les règlements sur
// les agents », « Montages à éviter » et « Facturer et encaisser une
// commission ». Commission occulte, fausse facture ou TPO = « Faute grave ».
// Personnages, clubs et montants FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const DS = "Paul Vasseur · AS Cordemont";
const LUCAS = "Lucas Morel";
const INVESTISSEUR = "Karl Brenner · investisseur";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  commission: {
    title: "Qui paie la commission ?",
    speaker: DS,
    line: () =>
      "« On est d'accord sur le salaire de Lucas. Pour votre commission, le club peut la prendre en charge. Combien, et sur quelle base ? »",
    next: "double",
    choices: [
      {
        id: "clair",
        requires: "mandat",
        label:
          "« 8 % de la rémunération brute de Lucas, comme prévu dans son mandat. Si le club la règle à sa place, on l'écrit dans le contrat avec l'accord écrit de Lucas, et je facture à chaque échéance. »",
        effect: () => ({
          trust: 12,
          flags: ["commission-claire"],
          method: 7,
          lesson: "commission",
          reply: "« Clair et carré. On l'intègre au contrat. »",
          feedback:
            "Qui paie, combien, sur quelle base, à quelles échéances : tout est écrit et cohérent avec le mandat. C'est ce qui sécurise ta commission.",
        }),
      },
      {
        id: "flou",
        label: "« Un pourcentage de son salaire, dans les limites légales. On l'écrira dans le contrat. »",
        effect: () => ({
          trust: 4,
          flags: ["commission-floue"],
          method: 4,
          lesson: "commission",
          reply: "« D'accord… il faudra préciser. »",
          feedback:
            "Correct sur le principe, mais flou : quel pourcentage, sur quelle base, à quelles échéances ? Un flou aujourd'hui, c'est un litige demain.",
        }),
      },
      {
        id: "gonfle",
        label: "« 15 % du contrat, payés d'avance à la signature. »",
        effect: () => ({
          trust: -12,
          flags: ["plafond"],
          method: 0,
          lesson: "facturer-commission",
          reply: "« 15 % ? Vous connaissez le plafond ? » Il note ton erreur.",
          feedback:
            "En France, le Code du sport plafonne la rémunération de l'agent à 10 % du contrat (à vérifier au moment de l'opération). Au-dessus, et sans lien avec le mandat, la clause est contestable, et le club le sait.",
        }),
      },
      {
        id: "oral",
        label: "« On verra ça entre nous, pas besoin de l'écrire. »",
        effect: () => ({
          trust: -8,
          flags: ["oral"],
          method: 0,
          lesson: "commission",
          reply: "« Comme vous voulez… » Rien n'est écrit.",
          feedback: "Une commission promise à l'oral n'existe pas. Sans écrit, tu n'as aucun recours si le club ne paie pas.",
        }),
      },
    ],
  },

  double: {
    title: "La double représentation",
    speaker: DS,
    line: () =>
      "« Autre chose : on aimerait que vous nous représentiez aussi sur cette opération. On vous verserait une commission de notre côté. »",
    next: "extra",
    choices: [
      {
        id: "encadrer",
        requires: "texte",
        label:
          "« C'est possible seulement avec l'accord écrit de toutes les parties : Lucas et vous. Chacun saura qui me paie et combien. Sinon, je reste uniquement l'agent de Lucas. »",
        effect: () => ({
          trust: 10,
          flags: ["double-encadree"],
          method: 7,
          lesson: "deontologie",
          reply: "« C'est carré. On prépare les accords, et vous en parlez à Lucas. »",
          feedback:
            "Double représentation encadrée : accord écrit de toutes les parties et transparence totale sur qui te paie. Sans ça, on refuse.",
        }),
      },
      {
        id: "refuser",
        label: "« Non. Sur cette opération, je représente Lucas, et seulement lui. »",
        effect: () => ({
          trust: 5,
          flags: ["double-refusee"],
          method: 6,
          lesson: "deontologie",
          reply: "« Entendu. »",
          feedback: "Refuser est toujours une réponse sûre : un seul mandant, aucun conflit d'intérêts.",
        }),
      },
      {
        id: "cacher",
        label: "« D'accord. Mais inutile d'en parler à Lucas. »",
        effect: () => ({
          trust: -5,
          flags: ["conflit"],
          method: 0,
          lesson: "deontologie",
          reply: "« …Si vous le dites. »",
          feedback:
            "Être payé des deux côtés sans le dire à ton client, c'est le conflit d'intérêts type. Le jour où Lucas l'apprend, tu perds ton joueur, et ta licence est en jeu.",
        }),
      },
    ],
  },

  extra: {
    title: "L'aparté",
    speaker: DS,
    line: () => "(En aparté) « Entre nous : si Lucas signe cette semaine, on peut vous verser un petit extra en direct. Discret. »",
    next: "investisseur",
    choices: [
      {
        id: "refus-net",
        label: "« Non. Tout ce que je perçois est écrit, connu de toutes les parties et déclaré. Rien d'autre. »",
        effect: () => ({
          trust: 8,
          method: 7,
          lesson: "deontologie",
          reply: "« Message reçu. » Il n'insiste pas, et semble même rassuré.",
          feedback:
            "Réponse de pro : tout ce qui est perçu est écrit, connu de toutes les parties et déclaré. Un club respecte un agent qui ne se vend pas.",
        }),
      },
      {
        id: "extra-discret",
        label: "« Discret, ça me va. Combien ? »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "deontologie",
          reply: "Trois mois plus tard, un contrôle des flux fait apparaître le versement. Une enquête est ouverte.",
          feedback:
            "Commission occulte : c'est la faute qui met fin à une carrière. Si ça doit rester caché, ne le fais pas.",
        }),
      },
      {
        id: "fausse-facture",
        label: "« Faites-moi plutôt une facture de « conseil » à part, ce sera plus propre. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "montages-a-eviter",
          reply: "La facture de complaisance passe… jusqu'au premier contrôle.",
          feedback:
            "Une fausse facture reste une commission occulte déguisée. Prête-noms, fausses factures, contrats parallèles : tout ce qui doit rester caché est interdit.",
        }),
      },
    ],
  },

  investisseur: {
    title: "L'investisseur",
    speaker: INVESTISSEUR,
    line: () =>
      "« Je peux financer une partie du transfert, en échange de 20 % sur la future revente de Lucas. Tout le monde y gagne. »",
    next: "lucas",
    choices: [
      {
        id: "refus-tpo",
        label:
          "« Non : détenir une part des droits économiques d'un joueur, c'est de la TPO, interdite par la FIFA. On ne fera pas ça. »",
        effect: () => ({
          trust: 6,
          method: 7,
          lesson: "montages-a-eviter",
          replySpeaker: DS,
          reply: "L'investisseur raccroche. Le directeur sportif, lui, apprécie : « Bien vu. »",
          feedback: "Tu reconnais la TPO déguisée et tu refuses en expliquant pourquoi. Les mains propres, et une réputation qui grandit.",
        }),
      },
      {
        id: "hesiter",
        label: "« Pourquoi pas… Je vais en parler au club. »",
        effect: () => ({
          trust: -8,
          flags: ["hesite"],
          method: 1,
          lesson: "montages-a-eviter",
          replySpeaker: DS,
          reply: "« Vous nous proposez de la TPO ? Non merci. » Le club te regarde autrement.",
          feedback:
            "Hésiter sur un montage interdit, c'est déjà te décrédibiliser. La TPO est interdite : la réponse est non, tout de suite.",
        }),
      },
      {
        id: "accepter-tpo",
        label: "« Intéressant. Envoyez-moi le montage, on le fera passer discrètement. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "montages-a-eviter",
          reply: "Le montage est découvert à l'enregistrement du transfert. Sanctions pour le club, le joueur… et toi.",
          feedback:
            "TPO déguisée : interdite par la FIFA, elle expose joueur, club et agent à de lourdes sanctions. Une seule affaire suffit à te bannir du métier.",
        }),
      },
    ],
  },

  lucas: {
    title: "La question de Lucas",
    speaker: LUCAS,
    line: () => "« Avant de signer, une question : dans ce transfert, qui te paie, et combien ? »",
    next: "fin",
    choices: [
      {
        id: "tout-montrer",
        label:
          "« Je te montre tout : ma commission, qui la paie, et chaque accord écrit. Tu signes seulement si tout est clair pour toi. »",
        effect: (s) =>
          has(s, "conflit")
            ? {
                trust: -20,
                flags: ["decouvert"],
                end: "rupture",
                method: 3,
                lesson: "deontologie",
                reply: "« Attends… le club te paie aussi ? Et tu ne me l'avais pas dit ? »",
                feedback:
                  "Tu montres enfin tout, et Lucas découvre l'accord caché avec le club. La transparence arrive trop tard : elle devait venir AVANT de dire oui au club.",
              }
            : {
                trust: 12,
                method: 7,
                lesson: "deontologie",
                reply: "« Merci. Avec toi, au moins, je sais où je mets les pieds. »",
                feedback:
                  "Transparence totale avec ton client : c'est une protection, pas une faiblesse. Il signe en confiance.",
              },
      },
      {
        id: "priorites",
        requires: "joueur",
        label:
          "« Tout est écrit, et tu as chaque document. Et on a obtenu ce que tu voulais : trois ans et un club européen. »",
        effect: (s) =>
          has(s, "conflit")
            ? {
                trust: -20,
                flags: ["decouvert"],
                end: "rupture",
                method: 2,
                lesson: "deontologie",
                reply: "« Chaque document ? » Il feuillette, et tombe sur l'accord avec le club.",
                feedback:
                  "Tu parles de ses priorités, mais un accord caché finit toujours par apparaître. Un client qui déteste les surprises ne pardonne pas celle-là.",
              }
            : {
                trust: 14,
                method: 7,
                lesson: "commission",
                reply: "« Trois ans, l'Europe, et tout sur la table. Je signe. »",
                feedback:
                  "Tu réponds à sa question ET à ses priorités, documents à l'appui. C'est comme ça qu'on garde un joueur toute une carrière.",
              },
      },
      {
        id: "esquiver",
        label: "« Ne t'inquiète pas, c'est réglé entre le club et moi. »",
        effect: () => ({
          trust: -10,
          flags: ["opaque"],
          method: 1,
          lesson: "deontologie",
          reply: "« Justement, c'est ça qui m'inquiète. »",
          feedback:
            "Chaque partie doit savoir qui te paie. Esquiver la question de ton propre client, c'est semer le doute au pire moment.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "conflit", points: 20, text: "Commission du club cachée au joueur" },
  { flag: "plafond", points: 10, text: "Commission au-dessus du plafond légal" },
  { flag: "oral", points: 10, text: "Commission non écrite" },
  { flag: "opaque", points: 10, text: "Réponse opaque au joueur sur ta rémunération" },
  { flag: "hesite", points: 5, text: "Hésitation sur un montage interdit" },
];

const GRADES: [number, string][] = [
  [85, "Agent irréprochable"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function morelResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const integrite = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!has(s, "commission-claire")) {
    missed.push(
      "Relire le mandat avant le rendez-vous t'aurait permis de répondre précisément : pourcentage, base, qui paie, échéances, le tout écrit.",
    );
  }
  if (!has(s, "double-encadree") && !has(s, "double-refusee") && s.history.length >= 2) {
    missed.push(
      "La double représentation n'est possible qu'avec l'accord écrit de toutes les parties, chacune sachant qui te paie. Sinon, on refuse.",
    );
  }

  const tiles = [
    { label: "Confiance", value: `${relation}/40` },
    { label: "Intégrité", value: `${integrite}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en intégrité.`);

  if (s.outcome === "faute") {
    return {
      outcome: "faute",
      score: Math.min(15, methode),
      grade: "Faute grave",
      headline:
        "Commission occulte ou montage interdit : ce sont les fautes qui coûtent une licence. Ta réputation ne se perd qu'une fois.",
      tiles: [
        { label: "Confiance", value: "—" },
        { label: "Intégrité", value: "0/25" },
        { label: "Méthode", value: `${methode}/35` },
        { label: "Transfert", value: "compromis" },
      ],
      notes: [],
      missed,
    };
  }

  if (s.outcome === "rupture") {
    return {
      outcome: "rupture",
      score: Math.min(30, relation + methode),
      grade: "Mandat perdu",
      headline: has(s, "decouvert")
        ? "« Tu étais payé par le club et tu me l'as caché. » Lucas met fin à ton mandat."
        : "« Je préfère travailler avec quelqu'un de plus clair. » Lucas met fin à ton mandat.",
      tiles: [...tiles, { label: "Transfert", value: "sans toi" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + integrite + methode));
  const headline =
    integrite === 25
      ? "Lucas signe à Cordemont. Ta commission est écrite et facturable, et chaque partie sait qui te paie."
      : has(s, "decouvert") || has(s, "opaque")
        ? "Lucas signe, mais il ne te regarde plus de la même façon. La confiance a pris un coup."
        : "Lucas signe à Cordemont. Quelques points restent à clarifier pour la prochaine fois.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [...tiles, { label: "Transfert", value: "signé" }],
    notes,
    missed,
  };
}

export const MOREL: Scenario = {
  id: "dossier-morel",
  title: "Le dossier Morel",
  pitch: "Ta commission, une double représentation, un « extra discret » et un investisseur : garde les mains propres.",
  theme: "Commission & éthique",
  chapterId: "contrats-mandats",
  chapters: ["fondamentaux", "contrats-mandats", "transferts-internationaux", "fiscalite-statut"],
  lessons: ["deontologie", "commission", "reglement-agents", "montages-a-eviter", "facturer-commission"],
  intro: {
    heading: "Garde les mains propres",
    text: "Lucas Morel, 26 ans, défenseur et ton client sous mandat exclusif, va signer à l'AS Cordemont. Le salaire est bouclé. Reste à parler de ta commission, et plusieurs propositions vont arriver sur la table. Certaines sont légitimes, d'autres non.",
    stats: [
      { label: "Ton client", value: "Lucas · 26 ans" },
      { label: "Club acheteur", value: "AS Cordemont" },
      { label: "Ton mandat", value: "exclusif" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Attention : certaines propositions sont des fautes graves qui arrêtent la partie. Personnages et montants fictifs.",
  },
  preps: [
    {
      id: "mandat",
      title: "Relire ton mandat avec Lucas",
      detail: "Vérifier ce qui est prévu pour ta rémunération.",
      intel:
        "Ton mandat exclusif prévoit 8 % de la rémunération brute de Lucas, payés par lui, ou par le club si Lucas l'accepte par écrit. Facturation à chaque échéance.",
    },
    {
      id: "texte",
      title: "Vérifier le règlement en vigueur",
      detail: "Relire les règles sur les commissions et la double représentation.",
      intel:
        "Plafond français : 10 % du contrat. Représenter aussi le club n'est possible qu'avec l'accord écrit de toutes les parties, et chacune doit savoir qui te paie.",
    },
    {
      id: "joueur",
      title: "Faire le point avec Lucas",
      detail: "Connaître ses priorités avant la signature.",
      intel:
        "Lucas veut un contrat de trois ans dans un club européen. Il te fait confiance, mais il déteste les surprises : il veut tout savoir.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["commission", "double", "extra", "investisseur", "lucas"],
  initialVars: {},
  initialTrust: 50,
  ruptureAt: 20,
  trustLabel: "Confiance des parties",
  endLines: {
    rupture: "Lucas met fin à ton mandat.",
    faute: "Faute grave. L'affaire éclate.",
    accord: "Les signatures sont posées. Voyons ce que vaut ton dossier…",
  },
  panel: (s) => ({
    title: "L'opération",
    rows: [
      { label: "Ton mandant", value: "Lucas Morel" },
      {
        label: "Commission",
        value: has(s, "commission-claire")
          ? "8 %, écrite"
          : has(s, "plafond")
            ? "15 % ⚠"
            : has(s, "oral")
              ? "à l'oral ⚠"
              : has(s, "commission-floue")
                ? "floue"
                : "—",
      },
      {
        label: "Double représentation",
        value: has(s, "double-encadree")
          ? "accord écrit de tous"
          : has(s, "double-refusee")
            ? "refusée"
            : has(s, "conflit")
              ? "cachée au joueur ⚠"
              : "—",
      },
      { label: "« Extra » du club", value: chose(s, "refus-net") ? "refusé" : "—" },
      { label: "Montage investisseur", value: chose(s, "refus-tpo") ? "refusé" : has(s, "hesite") ? "hésitation ⚠" : "—" },
    ],
    footer: "Si ça doit rester caché, ne le fais pas.",
  }),
  result: morelResult,
};
