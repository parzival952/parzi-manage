// Mise en situation « Le dossier Rivière » — le joueur d'un confrère.
//
// Nolan Rivière, 21 ans, est sous mandat exclusif avec un autre agent, Marc
// Vidal. Son père veut que tu prennes la place, tout de suite, que tu appelles
// le club dans le dos de Vidal, et il attend « un geste ». Fidèle aux leçons
// « Les règlements sur les agents », « Le mandat de représentation »,
// « Éthique, déontologie & conflits d'intérêts », « Prospecter » et « Bâtir
// son réseau » : respecter le mandat d'un confrère, ne jamais le dénigrer,
// refuser tout avantage, et garder la porte ouverte avec un suivi daté.
// Personnages et clubs FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const PERE = "Patrick Rivière · père de Nolan";
const PLUS_TARD = "Quelques semaines plus tard";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  appel: {
    title: "L'appel",
    speaker: PERE,
    line: () =>
      "« Bonjour. Je suis le père de Nolan Rivière, l'ailier de Valbonne. Son agent, Marc Vidal, ne fait rien. On veut que ce soit vous. Envoyez-moi un mandat, Nolan signe cette semaine. »",
    next: "vidal",
    choices: [
      {
        id: "cadre",
        requires: "mandat",
        label:
          "« Merci pour votre confiance. Mais Nolan est sous mandat exclusif avec M. Vidal jusqu'au 31 mars. Tant qu'il court, je ne signe rien et je ne négocie pas pour lui : un deuxième mandat par-dessus le premier exposerait Nolan autant que moi. »",
        effect: () => ({
          trust: 5,
          flags: ["cadre"],
          method: 7,
          lesson: "reglement-agents",
          reply: "« Ah. Je ne savais pas que ça pouvait retomber sur lui. »",
          feedback:
            "Tu connais la situation avant qu'il te la raconte, et tu poses le cadre sans fermer la porte. Expliquer que la règle protège aussi Nolan la rend acceptable.",
        }),
      },
      {
        id: "question",
        label: "« Merci de penser à moi. Avant tout : Nolan a-t-il signé un mandat avec M. Vidal ? Jusqu'à quand ? »",
        effect: () => ({
          trust: 3,
          flags: ["cadre"],
          method: 5,
          lesson: "mandat",
          reply: "« Oui, un mandat exclusif, jusqu'à fin mars je crois. Et alors ? »",
          feedback:
            "Bon réflexe : la première question, dès qu'on te propose un joueur, c'est « est-il sous mandat, et jusqu'à quand ? ». L'avoir vérifié avant l'appel t'aurait rendu encore plus crédible.",
        }),
      },
      {
        id: "sec",
        label: "« Il a déjà un agent. Je ne peux rien pour vous. Au revoir. »",
        effect: () => ({
          trust: -25,
          method: 2,
          lesson: "prospection",
          reply: "« Très bien. On trouvera quelqu'un d'autre. » Il raccroche.",
          feedback:
            "Tu respectes le mandat, c'est bien, mais tu claques la porte à un joueur qui sera libre dans trois mois. Respecter la règle n'empêche pas de rester courtois et de garder le contact.",
        }),
      },
      {
        id: "signer",
        label: "« Avec plaisir. Je vous envoie mon mandat ce soir, on réglera la question de M. Vidal après. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "reglement-agents",
          replySpeaker: PLUS_TARD,
          reply: "Marc Vidal découvre le deuxième mandat et saisit les instances : Nolan est lié à deux agents exclusifs en même temps.",
          feedback:
            "Faute grave : faire signer un mandat à un joueur déjà sous mandat exclusif avec un confrère est interdit. Tu t'exposes à une sanction, et tu mets Nolan en difficulté au pire moment de sa carrière.",
        }),
      },
    ],
  },

  vidal: {
    title: "Le confrère",
    speaker: PERE,
    line: () => "« Vidal ? Il ne nous rappelle jamais. Tout le monde sait que c'est un escroc, non ? »",
    next: "club",
    choices: [
      {
        id: "faits",
        requires: "reseau",
        label:
          "« Je ne le crois pas : M. Vidal est respecté par les clubs, et d'après mes informations il discute déjà avec un club de Ligue 1 pour Nolan. Votre vrai problème, c'est peut-être qu'il ne vous tient pas au courant. Vous le lui avez dit ? »",
        effect: () => ({
          trust: 8,
          flags: ["faits"],
          method: 7,
          lesson: "reseau",
          reply: "« …Un club de Ligue 1 ? Il ne nous a rien dit. »",
          feedback:
            "Ton réseau te donne les faits, et tu t'en sers pour défendre un confrère plutôt que pour l'enfoncer. Le père découvre que le problème, c'est la communication, pas le travail.",
        }),
      },
      {
        id: "reserve",
        label: "« Je ne commenterai pas le travail d'un confrère. Si quelque chose ne va pas, le premier pas, c'est de lui en parler directement. »",
        effect: () => ({
          trust: 0,
          method: 6,
          lesson: "deontologie",
          reply: "« Hum. Vous êtes bien diplomate. »",
          feedback:
            "Bonne réserve : on ne dénigre pas un confrère. Avec des faits (un coup de fil à ton réseau), tu aurais pu aller plus loin et l'aider vraiment.",
        }),
      },
      {
        id: "denigrer",
        label: "« Entre nous, vous n'avez pas tort : sa réputation n'est pas terrible. »",
        effect: () => ({
          trust: 6,
          flags: ["denigrement"],
          method: 0,
          lesson: "reseau",
          reply: "« Je le savais ! » Le soir même, il répète ta phrase à Vidal… et à deux autres parents.",
          feedback:
            "Le père est ravi, mais le milieu est petit et tout se sait. Dénigrer un confrère pour récupérer son joueur, c'est te fermer des portes, y compris chez les clubs qui travaillent avec lui.",
        }),
      },
    ],
  },

  club: {
    title: "Le club",
    speaker: PERE,
    line: () =>
      "« Le SC Aubrac, en Ligue 1, veut Nolan. Appelez leur directeur sportif demain, vous. Vidal n'a pas besoin de le savoir. »",
    next: "geste",
    choices: [
      {
        id: "droit-info",
        requires: "cadre",
        label:
          "« Non : tant que M. Vidal a le mandat, c'est lui qui parle au club pour Nolan. En revanche, vous pouvez lui demander un point écrit sur ses discussions avec Aubrac. C'est votre droit, et c'est la meilleure façon de savoir s'il travaille. »",
        effect: () => ({
          trust: 6,
          flags: ["loyal"],
          method: 7,
          lesson: "mandat",
          reply: "« Un point écrit… D'accord, je le lui demande dès demain. »",
          feedback:
            "Tu refuses d'intervenir, et tu donnes au père un vrai moyen d'agir : exiger des nouvelles de l'agent en place. Tu l'aides sans rien enfreindre.",
        }),
      },
      {
        id: "refus",
        label:
          "« Je ne peux pas. Appeler un club dans le dos de l'agent de Nolan fragiliserait le transfert, et un club sérieux se méfie d'un joueur qui semble avoir deux agents. »",
        effect: () => ({
          trust: 3,
          flags: ["loyal"],
          method: 6,
          lesson: "deontologie",
          reply: "« Je n'avais pas vu ça comme ça. »",
          feedback:
            "Juste, et bien expliqué : l'ingérence nuirait d'abord à Nolan. Il manque une piste concrète pour le père, comme demander un point écrit à son agent.",
        }),
      },
      {
        id: "appeler",
        label: "« D'accord, j'appelle discrètement, juste pour prendre la température. »",
        effect: () => ({
          trust: 8,
          flags: ["ingerence"],
          method: 0,
          lesson: "deontologie",
          reply: "« Parfait ! » Le lendemain, le directeur sportif d'Aubrac appelle Vidal : « Nolan a deux agents ? »",
          feedback:
            "Intervenir dans un dossier couvert par le mandat d'un confrère, c'est de l'ingérence. Le club doute, le transfert se fragilise, et Vidal a de quoi se plaindre de toi.",
        }),
      },
    ],
  },

  geste: {
    title: "Le « geste »",
    speaker: PERE,
    line: () =>
      "« Soyons clairs : l'agent de Nolan, ce sera celui qui fera un geste pour la famille. Vidal nous avait promis 20 000 €, on ne les a jamais vus. Vous pouvez faire mieux ? »",
    next: "suite",
    choices: [
      {
        id: "ligne",
        requires: "famille",
        label:
          "« Non. Je ne paie personne pour obtenir un mandat, ni la famille ni un intermédiaire : c'est interdit, et c'est ce genre de promesse qui vous a déjà déçu une fois. Ce que je vous promets, c'est du travail, et tout ce qui me concerne sera écrit. »",
        effect: () => ({
          trust: 8,
          flags: ["ligne"],
          method: 7,
          lesson: "deontologie",
          reply: "« …Vous êtes le premier à nous dire non en face. Ça me plaît. »",
          feedback:
            "Tu savais que la famille avait déjà été déçue par une promesse d'argent : tu t'en sers pour transformer ton refus en preuve de sérieux.",
        }),
      },
      {
        id: "non",
        label: "« Non, ce n'est pas comme ça que je travaille. »",
        effect: () => ({
          trust: -2,
          method: 6,
          lesson: "deontologie",
          reply: "« Hum. On verra bien. »",
          feedback:
            "La bonne réponse, mais sèche. Expliquer pourquoi (c'est interdit, et c'est justement ce qui les a déçus) aurait transformé ce refus en argument.",
        }),
      },
      {
        id: "flou",
        label: "« On verra ça le moment venu. »",
        effect: () => ({
          trust: 4,
          flags: ["ambigu"],
          method: 1,
          lesson: "deontologie",
          reply: "« Je note. On en reparlera. »",
          feedback:
            "Laisser planer le doute, c'est une promesse implicite. Le père reviendra la réclamer, et tu devras choisir entre la faute et la déception.",
        }),
      },
      {
        id: "payer",
        label: "« Je peux faire un geste. En liquide, ce sera plus simple. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "deontologie",
          replySpeaker: PLUS_TARD,
          reply: "Le père en parle à un autre agent, qui le répète. L'histoire remonte jusqu'aux instances.",
          feedback:
            "Faute grave : payer une famille pour obtenir un mandat, en liquide de surcroît, est interdit. C'est exactement le genre de dossier qui coûte une licence.",
        }),
      },
    ],
  },

  suite: {
    title: "La suite",
    speaker: PERE,
    line: () => "« Bon. Alors, concrètement, on fait quoi ? »",
    next: "fin",
    choices: [
      {
        id: "echeance",
        requires: "cadre",
        label:
          "« Trois choses. Un : vous demandez à M. Vidal un point écrit sur Aubrac. Deux : si, à l'échéance du 31 mars, Nolan veut changer d'agent, il sera libre, et on en reparlera dans le délai que permettent les règlements. Trois : d'ici là, je ne lui parle pas de sa carrière, mais je note une date dans mon suivi, et vous avez mon numéro. »",
        effect: () => ({
          trust: 12,
          flags: ["plan"],
          method: 7,
          lesson: "prospection",
          reply: "« Clair et honnête. On se reparle en mars. »",
          feedback:
            "Un plan concret, dans les règles, et un suivi daté. Tu ne prends rien à ton confrère, et tu restes le premier nom sur la liste si Nolan change d'agent.",
        }),
      },
      {
        id: "plus-tard",
        label: "« Revenez vers moi quand son mandat sera terminé. »",
        effect: () => ({
          trust: 3,
          flags: ["plan"],
          method: 4,
          lesson: "prospection",
          reply: "« D'accord… si on pense à vous d'ici là. »",
          feedback:
            "Correct sur le fond, mais passif : sans date notée dans ton suivi, un prospect s'oublie, et un concurrent plus organisé le récupère.",
        }),
      },
      {
        id: "resilier",
        label: "« Envoyez à M. Vidal une lettre de résiliation dès demain, je vous prépare le modèle. »",
        effect: () => ({
          trust: 8,
          flags: ["incitation"],
          method: 0,
          lesson: "litiges",
          reply: "« Parfait, ça bouge enfin ! »",
          feedback:
            "Pousser un joueur à rompre le mandat d'un confrère, et lui rédiger la lettre, c'est t'impliquer dans un litige qui n'est pas le tien. Si la rupture est abusive, c'est toi qu'on accusera de l'avoir provoquée.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "ingerence", points: 15, text: "Ingérence dans le dossier d'un confrère" },
  { flag: "incitation", points: 15, text: "Incitation à rompre le mandat d'un confrère" },
  { flag: "denigrement", points: 5, text: "Dénigrement d'un confrère" },
  { flag: "ambigu", points: 5, text: "Promesse d'argent laissée dans le flou" },
];

const GRADES: [number, string][] = [
  [85, "Agent loyal et redoutable"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function riviereResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const posture = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!has(s, "mandat")) {
    missed.push(
      "Vérifier la situation contractuelle avant l'appel t'aurait permis de poser le cadre tout de suite : mandat exclusif avec Vidal jusqu'au 31 mars.",
    );
  }
  if (!has(s, "faits") && s.history.length >= 2) {
    missed.push(
      "Un coup de fil à ton réseau t'aurait appris que Vidal travaillait déjà (un club de Ligue 1) : le vrai problème était la communication, pas le travail.",
    );
  }
  if (!has(s, "ligne") && s.history.length >= 4) {
    missed.push(
      "Refuser tout « geste » en expliquant pourquoi (c'est interdit, et c'est ce qui les a déjà déçus) transforme un refus en preuve de sérieux.",
    );
  }
  if (!chose(s, "echeance") && s.history.length >= 5) {
    missed.push(
      "Une suite concrète et datée (point écrit demandé à Vidal, rendez-vous à l'échéance, date notée dans ton suivi) garde le prospect sans rien enfreindre.",
    );
  }

  const tiles = [
    { label: "Confiance du père", value: `${relation}/40` },
    { label: "Posture", value: `${posture}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en posture.`);

  if (s.outcome === "faute") {
    return {
      outcome: "faute",
      score: Math.min(15, methode),
      grade: "Faute grave",
      headline: chose(s, "payer")
        ? "Payer une famille pour obtenir un mandat est interdit. L'affaire remonte aux instances : ta licence est en jeu."
        : "Nolan se retrouve lié à deux agents exclusifs. Marc Vidal saisit les instances : tu risques une sanction, et Nolan aussi.",
      tiles: [
        { label: "Confiance du père", value: "—" },
        { label: "Posture", value: "0/25" },
        { label: "Méthode", value: `${methode}/35` },
        { label: "Nolan", value: "dossier bloqué" },
      ],
      notes: [],
      missed,
    };
  }

  if (s.outcome === "rupture") {
    return {
      outcome: "rupture",
      score: Math.min(30, relation + methode),
      grade: "Prospect perdu",
      headline: "« On trouvera quelqu'un d'autre. » Le 1er avril, Nolan signe avec un autre agent.",
      tiles: [...tiles, { label: "Nolan", value: "perdu" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + posture + methode));
  const headline =
    has(s, "ingerence") || has(s, "incitation")
      ? "Le père est content, mais Marc Vidal apprend que tu t'es mêlé de son dossier. Le milieu est petit : ta réputation en prend un coup."
      : posture === 25 && s.trust >= 70
        ? "Le 1er avril, à l'échéance de son mandat, Nolan te choisit. Et Marc Vidal, qui sait que tu as joué franc-jeu, te recommande un autre joueur."
        : s.trust >= 50
          ? "Le père te rappelle en mars. Rien n'est signé, mais la porte est grande ouverte."
          : "Le père te remercie poliment. À toi de rester dans son radar d'ici mars.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [...tiles, { label: "Nolan", value: "porte ouverte" }],
    notes,
    missed,
  };
}

export const RIVIERE: Scenario = {
  id: "dossier-riviere",
  title: "Le dossier Rivière",
  pitch: "Le père d'un joueur sous mandat avec un confrère veut que tu prennes sa place, tout de suite. Jusqu'où peux-tu aller ?",
  theme: "Agent concurrent",
  chapterId: "business-reseau",
  chapters: ["business-reseau", "cadre-juridique"],
  lessons: ["prospection", "reseau", "reglement-agents"],
  intro: {
    heading: "Le joueur d'un autre",
    text: "Nolan Rivière, 21 ans, ailier de l'US Valbonne (Ligue 2), est la révélation de la saison. Il a déjà un agent, Marc Vidal. Ce soir, son père t'appelle : il ne supporte plus Vidal et veut que tu le remplaces. Tout de suite.",
    stats: [
      { label: "Joueur", value: "Nolan · 21 ans" },
      { label: "Son agent", value: "Marc Vidal" },
      { label: "Au bout du fil", value: "son père" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Attention : certaines erreurs sont des fautes graves qui arrêtent la partie. Personnages fictifs.",
  },
  preps: [
    {
      id: "mandat",
      title: "Vérifier la situation contractuelle",
      detail: "Savoir si Nolan est sous mandat, avec qui, et jusqu'à quand.",
      intel:
        "Nolan est sous mandat exclusif avec Marc Vidal jusqu'au 31 mars. Tant qu'il court, tu ne peux ni négocier pour Nolan ni lui faire signer un autre mandat.",
    },
    {
      id: "reseau",
      title: "Appeler ton réseau",
      detail: "Savoir ce que les clubs pensent de Nolan, et de son agent.",
      intel:
        "Le SC Aubrac (Ligue 1) suit Nolan, et Marc Vidal est déjà en discussion avec eux. Les clubs le décrivent comme sérieux, mais peu bavard avec ses joueurs.",
    },
    {
      id: "famille",
      title: "Te renseigner sur la famille",
      detail: "Comprendre ce qui compte pour le père.",
      intel:
        "Le père gère la carrière de Nolan. Il a déjà changé deux fois d'agent, et on dit qu'on lui a promis de l'argent pour signer, sans jamais le lui verser.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["appel", "vidal", "club", "geste", "suite"],
  initialVars: {},
  initialTrust: 40,
  ruptureAt: 20,
  trustLabel: "Confiance du père",
  endLines: {
    rupture: "Le père raccroche. Nolan ne sera pas ton joueur.",
    faute: "Faute grave. Le dossier t'échappe.",
    accord: "Le père raccroche. Voyons ce que vaut cet appel…",
  },
  panel: (s) => ({
    title: "Le dossier Nolan",
    rows: [
      { label: "Joueur", value: "21 ans · ailier · Ligue 2" },
      { label: "Mandat en cours", value: has(s, "cadre") ? "exclusif Vidal → 31/03" : "?" },
      { label: "Club intéressé", value: s.history.length >= 2 || has(s, "reseau") ? "SC Aubrac (L1)" : "—" },
      { label: "Geste demandé", value: chose(s, "ligne") || chose(s, "non") ? "refusé" : has(s, "ambigu") ? "dans le flou ⚠" : "—" },
      { label: "Ingérence", value: has(s, "ingerence") || has(s, "incitation") ? "oui ⚠" : "non" },
    ],
    footer: "Le mandat d'un confrère se respecte, même quand il ne te plaît pas.",
  }),
  result: riviereResult,
};
