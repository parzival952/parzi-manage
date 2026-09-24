// Mise en situation « Le dossier Traoré » — signer le mandat d'un joueur mineur.
//
// L'élève doit gagner la confiance de Noah (17 ans) et de sa mère, qui détient
// l'autorité parentale, face à un entourage qui parle argent et à des agents
// concurrents. Les lignes rouges (argent ou cadeau pour obtenir une
// signature) mettent fin à la partie : « faute grave ».
//
// Fidèle aux leçons « Trouver et approcher un joueur », « La protection des
// joueurs mineurs », « Le mandat de représentation » et « Gérer l'entourage du
// joueur ». Personnages FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const MERE = "Mme Traoré · mère de Noah";
const ONCLE = "Karim · l'oncle";
const NOAH = "Noah Traoré";

const NODES: Record<string, NodeDef> = {
  contact: {
    title: "Le premier contact",
    speaker: MERE,
    line: () => "« Encore un agent… C'est le quatrième ce mois-ci. Qu'est-ce que vous voulez à Noah ? »",
    next: "argent",
    choices: [
      {
        id: "valeur",
        requires: "voir-jouer",
        label:
          "« Je suis venu voir Noah jouer trois fois. Je vous propose un rendez-vous, avec lui, pour vous montrer ce que j'ai observé. Sans rien signer. »",
        effect: () => ({
          trust: 15,
          flags: ["valeur"],
          method: 7,
          lesson: "approche",
          reply: "« …Trois fois ? Les autres ne l'ont jamais vu jouer. D'accord, venez samedi. »",
          feedback:
            "Tu apportes de la valeur avant de parler mandat : c'est ce qui distingue un agent sérieux d'un opportuniste.",
        }),
      },
      {
        id: "presentation",
        label:
          "« Je suis agent licencié. J'aimerais vous rencontrer, vous et Noah, pour vous expliquer comment je travaille. Sans engagement. »",
        effect: () => ({
          trust: 5,
          method: 5,
          lesson: "approche",
          reply: "« Bon… Samedi, un quart d'heure. »",
          feedback:
            "Correct et respectueux : tu passes par la famille et tu ne presses pas. Il te manque un vrai plus pour sortir du lot.",
        }),
      },
      {
        id: "promesse",
        label: "« Noah a un potentiel énorme. Avec moi, il signe pro en Ligue 1 d'ici un an, je vous le garantis. »",
        effect: () => ({
          trust: -10,
          flags: ["promesse"],
          method: 0,
          lesson: "approche",
          reply: "« Les trois autres m'ont dit la même chose. » Elle accepte un rendez-vous, sans conviction.",
          feedback:
            "Promesse creuse : personne ne peut garantir une carrière. La famille l'a déjà entendue trois fois, et elle te range avec les autres.",
        }),
      },
      {
        id: "seul",
        label: "« Je préfère d'abord en parler seul avec Noah, entre nous. »",
        effect: () => ({
          trust: -20,
          flags: ["contournement"],
          method: 0,
          lesson: "mineurs",
          reply: "« Il a 17 ans. Rien ne se fera sans moi. » Elle accepte quand même de te voir, méfiante.",
          feedback:
            "Noah est mineur : on passe toujours par ses représentants légaux. Vouloir l'isoler est le pire signal que tu puisses envoyer.",
        }),
      },
    ],
  },

  argent: {
    title: "La question de l'argent",
    speaker: ONCLE,
    line: () => "« Bon, soyons concrets. Il y a combien pour la famille si Noah signe avec vous ? »",
    next: "projet",
    choices: [
      {
        id: "ligne",
        label:
          "« Rien. Je ne verse ni argent ni cadeau à la famille d'un joueur : c'est interdit, et ça mettrait Noah en danger. Mon travail, c'est sa carrière. »",
        effect: () => ({
          trust: 10,
          flags: ["ligne-rouge"],
          method: 7,
          lesson: "mineurs",
          replySpeaker: MERE,
          reply: "L'oncle grimace. La mère, elle, hoche la tête : « Ça, au moins, c'est clair. »",
          feedback:
            "Tu poses la ligne rouge tout de suite, calmement. La famille sait à quoi s'en tenir, et la mère, qui décide, est rassurée.",
        }),
      },
      {
        id: "cadeau",
        label: "« Pour vous remercier de votre confiance, je peux faire un geste : 3 000 € à la signature. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "mineurs",
          replySpeaker: MERE,
          reply: "« Pardon ? » La mère se lève. « On ne vend pas mon fils. »",
          feedback:
            "Faute grave : proposer de l'argent à la famille d'un mineur pour obtenir sa signature est interdit. Pour un agent licencié, c'est une sanction lourde, et pour Noah, un vrai danger.",
        }),
      },
      {
        id: "esquive",
        label: "« On verra ça plus tard. Parlons d'abord du sportif. »",
        effect: () => ({
          trust: -5,
          flags: ["esquive"],
          method: 2,
          lesson: "gerer-entourage",
          reply: "« Plus tard, d'accord. Mais on en reparlera. »",
          feedback:
            "Le flou laisse l'oncle espérer une contrepartie. Il fallait poser la règle clairement, tout de suite : aucun argent pour la famille.",
        }),
      },
    ],
  },

  projet: {
    title: "Le projet",
    speaker: MERE,
    line: () => "« Moi, ce qui compte, c'est qu'il ait son bac. Le foot, ça peut s'arrêter du jour au lendemain. »",
    next: "concurrence",
    choices: [
      {
        id: "bac",
        requires: "famille",
        label:
          "« Je suis d'accord avec vous. Mon plan : il termine sa terminale au centre de formation, et on vise un premier contrat pro dans le club qui l'a formé, là où il jouera. Le bac fait partie du plan. »",
        effect: () => ({
          trust: 15,
          flags: ["scolarite"],
          method: 7,
          lesson: "plan-carriere",
          reply: "« Vous êtes le premier à me parler du bac. »",
          feedback:
            "Tu t'es renseigné sur la famille et tu construis un plan qui répond à SA priorité. Le temps de jeu et la scolarité passent avant le prestige.",
        }),
      },
      {
        id: "plan",
        label:
          "« Je comprends. On construira un plan de carrière ensemble, étape par étape, en tenant compte de sa scolarité. »",
        effect: () => ({
          trust: 8,
          flags: ["scolarite"],
          method: 5,
          lesson: "plan-carriere",
          reply: "« D'accord. Il faudra me le montrer, ce plan. »",
          feedback:
            "Bonne réponse, mais générique : sans connaître la famille, tu ne peux pas encore proposer un plan précis.",
        }),
      },
      {
        id: "etranger",
        label:
          "« À son niveau, il faut foncer : un club étranger s'intéresse à lui, on pourrait le faire partir dès cet été. »",
        effect: () => ({
          trust: -15,
          flags: ["etranger"],
          method: 0,
          lesson: "mineurs",
          reply: "« À 17 ans ? Tout seul, dans un autre pays ? »",
          feedback:
            "Noah est mineur : un transfert international est en principe interdit, sauf exceptions strictes. Et tu ignores la priorité de la famille : sa scolarité.",
        }),
      },
    ],
  },

  concurrence: {
    title: "La concurrence",
    speaker: NOAH,
    line: () =>
      "« Un autre agent m'a dit qu'il me trouvait un club pro direct. Et il offre des crampons à tous les joueurs qu'il rencontre… »",
    next: "signature",
    choices: [
      {
        id: "honnete",
        label:
          "« Je ne vais dénigrer personne. Voilà ce que je fais concrètement, et ce que je ne ferai jamais. Compare calmement avec ta mère, et prends ton temps. »",
        effect: () => ({
          trust: 8,
          method: 7,
          lesson: "approche",
          reply: "« …OK. Vous, au moins, vous ne me mettez pas la pression. »",
          feedback:
            "Tu restes professionnel : pas de dénigrement, pas de pression. Tu laisses la famille décider, et c'est ce qui la convainc.",
        }),
      },
      {
        id: "denigrer",
        label: "« Ce type est un escroc. Fuis-le. »",
        effect: () => ({
          trust: -8,
          flags: ["denigrement"],
          method: 1,
          lesson: "approche",
          reply: "« Vous le connaissez ? » Noah paraît gêné.",
          feedback:
            "Dénigrer un concurrent te fait paraître aussi peu fiable que lui. Montre ce que tu fais, pas ce que font les autres.",
        }),
      },
      {
        id: "surenchere",
        label: "« Moi, je t'offre des crampons et un maillot dédicacé si tu signes. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "mineurs",
          replySpeaker: MERE,
          reply: "La mère intervient : « Donc vous faites comme les autres. On arrête là. »",
          feedback:
            "Faute grave : offrir un cadeau à un mineur pour obtenir sa signature est une incitation interdite. Tu te mets hors-jeu, quelle que soit la valeur du cadeau.",
        }),
      },
    ],
  },

  signature: {
    title: "La signature",
    speaker: MERE,
    line: () => "« Bon. Si on signe avec vous, comment ça se passe ? »",
    next: "fin",
    choices: [
      {
        id: "cadre",
        requires: "cadre",
        label:
          "« Un mandat écrit, signé par Noah et par vous, pour une durée limitée, avec ma rémunération écrite noir sur blanc. Je vous le laisse une semaine : relisez-le, montrez-le à qui vous voulez. »",
        effect: () => ({
          trust: 10,
          method: 7,
          lesson: "mandat",
          reply: "« Une semaine pour relire ? Là, j'ai confiance. » Une semaine plus tard, elle signe avec Noah.",
          feedback:
            "Mandat propre : écrit, à durée limitée, rémunération transparente, signé par le mineur ET son représentant légal. Et tu laisses le temps de relire : c'est ce qui fait signer.",
        }),
      },
      {
        id: "generique",
        label: "« On fait un mandat écrit, je vous explique tout, et on signe quand vous êtes prêts. »",
        effect: () => ({
          trust: 4,
          method: 4,
          lesson: "mandat",
          reply: "« D'accord. » Quelques jours plus tard, elle signe avec Noah.",
          feedback:
            "Correct, mais flou : durée, rémunération, qui signe… Préciser le cadre rassure la famille et te protège.",
        }),
      },
      {
        id: "cesoir",
        label: "« On signe ce soir, je vous expliquerai les détails après. »",
        effect: () => ({
          trust: -12,
          flags: ["precipitation"],
          method: 0,
          lesson: "mandat",
          reply: "« Ce soir ? Sans lire ? » Elle finit par signer, à contrecœur.",
          feedback:
            "Faire signer dans la précipitation, sans laisser relire : c'est exactement ce qu'on reproche aux agents peu scrupuleux.",
        }),
      },
      {
        id: "sans-mere",
        label: "« Noah peut signer seul, vous n'avez pas besoin d'être là. »",
        effect: () => ({
          end: "rupture",
          method: 0,
          lesson: "mineurs",
          reply: "« Il est mineur. Sans moi, rien. Et sans vous, désormais. »",
          feedback:
            "Pour un mineur, ses représentants légaux signent avec lui. Proposer de t'en passer, c'est un mandat sans valeur et la confiance détruite.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "promesse", points: 10, text: "Promesse de carrière impossible à tenir" },
  { flag: "contournement", points: 10, text: "Tentative de parler au mineur sans sa mère" },
  { flag: "etranger", points: 15, text: "Projet de départ à l'étranger pour un mineur" },
  { flag: "precipitation", points: 10, text: "Signature le soir même, sans relecture" },
  { flag: "esquive", points: 5, text: "Réponse floue sur l'argent" },
  { flag: "denigrement", points: 5, text: "Dénigrement d'un concurrent" },
];

const GRADES: [number, string][] = [
  [85, "Agent de confiance"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function traoreResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const integrite = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!has(s, "valeur")) {
    missed.push(
      "Aller voir Noah jouer et apporter une analyse honnête AVANT de parler mandat t'aurait distingué des autres agents dès le premier contact.",
    );
  }
  if (!s.history.some((t) => t.choiceId === "cadre")) {
    missed.push(
      "Présenter un mandat écrit, à durée limitée, avec ta rémunération claire, signé par Noah ET sa mère, et laisser le temps de le relire : c'est ce qui rassure le plus une famille.",
    );
  }

  if (s.outcome === "faute") {
    return {
      outcome: "faute",
      score: Math.min(15, methode),
      grade: "Faute grave",
      headline:
        "La famille met fin à la discussion. Proposer un avantage pour obtenir la signature d'un mineur peut coûter sa licence à un agent.",
      tiles: [
        { label: "Confiance famille", value: "—" },
        { label: "Intégrité", value: "0/25" },
        { label: "Méthode", value: `${methode}/35` },
        { label: "Mandat", value: "non signé" },
      ],
      notes: [],
      missed,
    };
  }

  if (s.outcome === "rupture") {
    return {
      outcome: "rupture",
      score: Math.min(30, relation + methode),
      grade: "Pas de mandat",
      headline: "« Merci, mais on va travailler avec quelqu'un d'autre. » Noah signe avec un autre agent.",
      tiles: [
        { label: "Confiance famille", value: `${relation}/40` },
        { label: "Intégrité", value: `${integrite}/25` },
        { label: "Méthode", value: `${methode}/35` },
        { label: "Mandat", value: "non signé" },
      ],
      notes: applied.map((p) => `${p.text} : -${p.points} en intégrité.`),
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + integrite + methode));
  const headline = has(s, "precipitation")
    ? "Le mandat est signé, mais la mère le racontera à d'autres familles : « Il nous a fait signer le soir même. »"
    : integrite === 25 && s.trust >= 80
      ? "« On a confiance en vous. » Noah et sa mère signent le mandat."
      : "Noah et sa mère signent le mandat.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [
      { label: "Confiance famille", value: `${relation}/40` },
      { label: "Intégrité", value: `${integrite}/25` },
      { label: "Méthode", value: `${methode}/35` },
      { label: "Mandat", value: "signé" },
    ],
    notes: applied.map((p) => `${p.text} : -${p.points} en intégrité.`),
    missed,
  };
}

export const TRAORE: Scenario = {
  id: "dossier-traore",
  title: "Le dossier Traoré",
  pitch: "Gagne la confiance d'un joueur de 17 ans et de sa mère, et fais signer un mandat propre.",
  theme: "Mandat & mineurs",
  chapterId: "gestion-carriere",
  chapters: ["gestion-carriere", "contrats-mandats", "psychologie-humain"],
  lessons: ["approche", "mandat", "mineurs", "gerer-entourage"],
  intro: {
    heading: "Signe ton premier mandat",
    text: "Noah Traoré, 17 ans, milieu gauche au centre de formation du FC Rivemont, est suivi par plusieurs agents. Sa mère, qui détient l'autorité parentale, se méfie. Ton objectif : gagner la confiance de la famille et faire signer un mandat propre.",
    stats: [
      { label: "Joueur", value: "17 ans · mineur" },
      { label: "Qui décide", value: "Sa mère" },
      { label: "Concurrents", value: "3 agents" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Attention : certaines erreurs sont des fautes graves qui arrêtent la partie. Personnages fictifs.",
  },
  preps: [
    {
      id: "voir-jouer",
      title: "Aller voir Noah jouer",
      detail: "Assister à trois matchs et préparer une analyse honnête de son jeu.",
      intel: "Tu l'as vu trois fois : excellent pied gauche, doit gagner en intensité défensive. Aucun autre agent ne s'est déplacé.",
    },
    {
      id: "famille",
      title: "Te renseigner sur la famille",
      detail: "Comprendre qui décide et ce qui compte pour eux.",
      intel: "Sa mère élève seule ses trois enfants et décide de tout. Sa priorité : que Noah ait son bac. L'oncle, lui, parle surtout d'argent.",
    },
    {
      id: "cadre",
      title: "Relire le cadre d'un mandat pour un mineur",
      detail: "Revoir les règles : représentants légaux, durée, rémunération.",
      intel: "Pour un mineur, tout passe par ses représentants légaux. Le mandat est écrit, à durée limitée, avec une rémunération claire. Aucun avantage pour la famille.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["contact", "argent", "projet", "concurrence", "signature"],
  initialVars: {},
  initialTrust: 45,
  ruptureAt: 20,
  trustLabel: "Confiance de la famille",
  endLines: {
    rupture: "« Merci, mais on va s'arrêter là. » La famille ne signera pas avec toi.",
    faute: "Faute grave. La famille met fin à la discussion.",
    accord: "La mère prend le stylo. Voyons ce que vaut ce mandat…",
  },
  panel: (s) => ({
    title: "Le dossier",
    rows: [
      { label: "Joueur", value: "Noah, 17 ans" },
      { label: "Qui signe", value: "Noah + sa mère" },
      { label: "Promesses faites", value: has(s, "promesse") ? "oui ⚠" : "aucune" },
      {
        label: "Argent pour la famille",
        value: has(s, "ligne-rouge") ? "refusé clairement" : has(s, "esquive") ? "resté flou ⚠" : "pas encore abordé",
      },
      { label: "Scolarité", value: has(s, "scolarite") ? "dans le plan" : "—" },
      { label: "Mandat", value: s.outcome === "accord" ? "signé" : "pas encore signé" },
    ],
    footer: "Mineur : ses représentants légaux à chaque étape.",
  }),
  result: traoreResult,
};
