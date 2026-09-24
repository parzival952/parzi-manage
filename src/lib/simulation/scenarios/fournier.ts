// Mise en situation « Le dossier Fournier » — le joueur qui veut partir.
//
// Hugo Fournier, 29 ans, en fin de contrat et toujours sans club en juillet,
// appelle pour annoncer qu'il veut changer d'agent : il n'a plus de nouvelles,
// et un concurrent lui promet un club en Turquie. Fidèle aux leçons « Les
// conversations difficiles », « Construire la relation dans la durée », « Le
// mental de la performance » et « Litiges & résolution des conflits » : écouter,
// assumer avec des faits, jamais de décision à chaud, un plan concret, une
// communication régulière, et l'amiable plutôt que la menace.
// Personnages et clubs FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const HUGO = "Hugo Fournier";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  appel: {
    title: "L'annonce",
    speaker: HUGO,
    line: () =>
      "« Je vais être direct : je veux changer d'agent. Ça fait deux mois que je n'ai pas de nouvelles, et je suis toujours sans club. »",
    next: "concurrent",
    choices: [
      {
        id: "ecouter",
        label: "« Merci de me le dire en face. Avant de répondre, je veux comprendre : qu'est-ce qui t'a manqué, précisément ? »",
        effect: () => ({
          trust: 10,
          flags: ["besoin"],
          method: 7,
          lesson: "conversations-difficiles",
          reply: "« …Des nouvelles. Savoir où on en est. Je me suis senti seul tout l'été. »",
          feedback:
            "Tu accueilles la critique sans te défendre et tu cherches le vrai problème. Écouter d'abord, c'est déjà reprendre la main.",
        }),
      },
      {
        id: "defendre",
        label: "« Je bosse pour toi tous les jours. Tu ne te rends pas compte du travail que je fais. »",
        effect: () => ({
          trust: -10,
          method: 1,
          lesson: "conversations-difficiles",
          reply: "« Alors pourquoi je n'en sais rien ? »",
          feedback:
            "Te justifier sans écouter confirme son ressenti : il ne voit pas ton travail parce que tu ne le lui montres pas.",
        }),
      },
      {
        id: "menacer",
        label: "« Tu es sous mandat exclusif jusqu'en décembre. Si tu pars, je t'attaque. »",
        effect: () => ({
          trust: -25,
          flags: ["menace"],
          method: 0,
          lesson: "litiges",
          reply: "« Donc c'est comme ça. » Il raccroche.",
          feedback:
            "Brandir le contentieux dès la première minute détruit la relation. Un agent qui menace ses joueurs se coupe du marché : l'amiable d'abord, toujours.",
        }),
      },
    ],
  },

  concurrent: {
    title: "Le concurrent",
    speaker: HUGO,
    line: () =>
      "« Stéphane Roche, d'une grosse agence, m'a dit qu'il avait un club en Turquie pour moi. Toi, tu as quoi ? »",
    next: "mental",
    choices: [
      {
        id: "assumer",
        requires: "bilan",
        label:
          "« Je te dois la vérité : je t'ai proposé à onze clubs cet été, deux ont montré de l'intérêt, sans offre. Et j'ai eu tort de ne pas te tenir au courant. Ça, c'est ma faute. »",
        effect: () => ({
          trust: 15,
          flags: ["assume"],
          method: 7,
          lesson: "conversations-difficiles",
          reply: "« …Onze clubs ? Je ne savais pas. Merci d'être honnête. »",
          feedback:
            "Des faits, et ta part de responsabilité assumée sans détour. Une mauvaise nouvelle dite en face, avec des faits, renforce la confiance au lieu de la détruire.",
        }),
      },
      {
        id: "verifier",
        requires: "marche",
        label:
          "« Demande-lui le nom du club et une offre écrite. De mon côté, je n'ai trouvé aucune trace d'une offre turque pour toi. Je ne critique personne : je veux juste qu'on parte de faits. »",
        effect: () => ({
          trust: 8,
          flags: ["verifie"],
          method: 6,
          lesson: "conversations-difficiles",
          reply: "« Il m'a dit qu'il ne pouvait pas encore donner le nom… »",
          feedback:
            "Tu ramènes la discussion aux faits sans dénigrer le concurrent. Le doute change de camp, sans que tu aies dit un mot contre lui.",
        }),
      },
      {
        id: "denigrer",
        label: "« Roche ? C'est un vendeur de rêve, il dit ça à tout le monde. »",
        effect: () => ({
          trust: -8,
          flags: ["denigrement"],
          method: 1,
          lesson: "relation",
          reply: "« Tu dis ça parce qu'il essaie de te prendre ton joueur. »",
          feedback:
            "Dénigrer un concurrent te fait paraître sur la défensive. Montre ce que tu fais, pas ce que font les autres.",
        }),
      },
      {
        id: "surencherir",
        label: "« Moi aussi, j'ai un super club pour toi, je te le garantis. Je ne peux juste pas encore dire lequel. »",
        effect: () => ({
          trust: -12,
          flags: ["promesse"],
          method: 0,
          lesson: "conversations-difficiles",
          reply: "« Tu fais exactement comme lui. »",
          feedback:
            "Une promesse creuse pour garder un joueur, c'est la pire réponse : tu perds ta crédibilité, et bientôt ton joueur.",
        }),
      },
    ],
  },

  mental: {
    title: "À bout",
    speaker: HUGO,
    line: () =>
      "« Franchement, je suis à bout. J'ai 29 ans, pas de club, ma femme s'inquiète. Je veux juste que ça bouge, n'importe où. »",
    next: "plan",
    choices: [
      {
        id: "apaiser",
        label:
          "« C'est normal d'être à bout. On ne décide rien ce soir, sous la pression. On se voit demain avec un vrai plan. Et si tu veux, je te mets en contact avec un préparateur mental qui a aidé d'autres joueurs dans ta situation. »",
        effect: () => ({
          trust: 10,
          method: 7,
          lesson: "mental-performance",
          reply: "« Demain, d'accord. Et oui pour le préparateur. »",
          feedback:
            "Tu normalises, tu évites la décision à chaud, et tu l'orientes vers le bon professionnel sans jouer au psy.",
        }),
      },
      {
        id: "paniquer",
        label: "« OK. Je prends la première offre qui tombe, n'importe laquelle. »",
        effect: () => ({
          trust: -5,
          flags: ["panique"],
          method: 1,
          lesson: "mental-performance",
          reply: "« …N'importe laquelle ? Même en quatrième division ? »",
          feedback:
            "Céder à la panique du joueur, c'est prendre une décision de carrière à chaud. Ton rôle est de l'aider à respirer, pas d'amplifier l'urgence.",
        }),
      },
      {
        id: "minimiser",
        label: "« Relax, ça va se débloquer. C'est toujours comme ça en été. »",
        effect: () => ({
          trust: -8,
          method: 1,
          lesson: "mental-performance",
          reply: "« Facile à dire, pour toi. »",
          feedback: "Minimiser l'angoisse d'un joueur sans club, c'est lui dire que tu ne comprends pas ce qu'il vit.",
        }),
      },
    ],
  },

  plan: {
    title: "Le plan",
    speaker: HUGO,
    line: () => "(Le lendemain) « Alors, ton plan ? »",
    next: "decision",
    choices: [
      {
        id: "bremont",
        requires: "marche",
        label:
          "« Le FC Brémont cherche un milieu d'expérience en Ligue 2, avec deux ans de contrat possibles. J'ai rendez-vous jeudi avec leur directeur sportif. Je t'appelle juste après, et chaque lundi je te fais un point, même s'il n'y a rien de neuf. »",
        effect: () => ({
          trust: 15,
          flags: ["plan"],
          method: 7,
          lesson: "relation",
          reply: "« Un club concret, et un point chaque lundi. Là, on parle. »",
          feedback:
            "Une piste concrète ET une communication régulière : tu réponds exactement à ce qui lui a manqué.",
        }),
      },
      {
        id: "point-lundi",
        label:
          "« Je relance les deux clubs intéressés cette semaine, j'élargis à la Ligue 2 et à l'étranger, et je te fais un point chaque lundi, même quand il n'y a rien de neuf. »",
        effect: () => ({
          trust: 9,
          flags: ["plan"],
          method: 6,
          lesson: "relation",
          reply: "« D'accord. Chaque lundi, hein. »",
          feedback:
            "Un plan clair et, surtout, une communication régulière : c'est ce qui lui a manqué. Sans piste concrète, c'est un peu moins convaincant.",
        }),
      },
      {
        id: "confiance",
        label: "« Je vais activer mon réseau. Fais-moi confiance. »",
        effect: () => ({
          trust: -10,
          method: 1,
          lesson: "relation",
          reply: "« C'est ce que tu m'as dit en juin. »",
          feedback: "« Fais-moi confiance », sans plan ni rendez-vous, c'est exactement ce qui l'a fait douter.",
        }),
      },
    ],
  },

  decision: {
    title: "La porte de sortie",
    speaker: HUGO,
    line: () => "« OK. Mais si je veux quand même partir, ça se passe comment ? »",
    next: "fin",
    choices: [
      {
        id: "amiable",
        requires: "mandat",
        label:
          "« Alors on se sépare proprement : une résiliation d'un commun accord, par écrit. Ma commission reste due uniquement sur les dossiers que j'ai lancés, et on l'écrit. Je préfère te garder, mais je ne te retiendrai pas de force. »",
        effect: () => ({
          trust: 12,
          method: 7,
          lesson: "litiges",
          reply: "« …Tu me laisses vraiment le choix. Alors je reste. On se donne jusqu'à décembre. »",
          feedback:
            "Tu connais ton mandat et tu proposes une sortie propre et écrite, sans menace. C'est justement ce qui le convainc de rester.",
        }),
      },
      {
        id: "libre",
        label: "« Tu es libre. Si tu veux partir, dis-le-moi, et on trouvera une solution ensemble. »",
        effect: () => ({
          trust: 6,
          method: 5,
          lesson: "litiges",
          reply: "« Merci. Je reste, pour l'instant. »",
          feedback:
            "Bonne posture, mais floue : une séparation se fait par écrit, d'un commun accord, en précisant le sort de ta commission.",
        }),
      },
      {
        id: "retenir",
        label: "« Tu ne peux pas partir, le mandat te l'interdit. Point. »",
        effect: () => ({
          trust: -15,
          flags: ["menace"],
          method: 0,
          lesson: "litiges",
          reply: "« Alors je vais voir un avocat. »",
          feedback:
            "Retenir un joueur par la contrainte, c'est garantir le conflit. Et un joueur qui reste contre son gré ne te fera plus jamais confiance.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "menace", points: 15, text: "Menace de contentieux contre ton propre joueur" },
  { flag: "promesse", points: 10, text: "Promesse de club impossible à tenir" },
  { flag: "denigrement", points: 5, text: "Dénigrement du concurrent" },
  { flag: "panique", points: 5, text: "Décision de carrière prise à chaud" },
];

const GRADES: [number, string][] = [
  [85, "Agent de confiance"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function fournierResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const posture = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!chose(s, "ecouter")) {
    missed.push("Écouter d'abord, en lui demandant ce qui lui a manqué, t'aurait donné la clé : il se sentait seul, sans nouvelles.");
  }
  if (!has(s, "assume") && s.history.length >= 2) {
    missed.push(
      "Faire ton bilan avant l'appel t'aurait permis de répondre avec des faits (onze clubs contactés) et de reconnaître ton erreur : le manque de nouvelles.",
    );
  }
  if (!has(s, "plan") && s.history.length >= 4) {
    missed.push("Un plan concret et un point régulier, même sans nouvelle, répondaient exactement à ce qui lui a manqué.");
  }

  const tiles = [
    { label: "Confiance de Hugo", value: `${relation}/40` },
    { label: "Posture", value: `${posture}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en posture.`);

  if (s.outcome !== "accord") {
    return {
      outcome: "rupture",
      score: Math.min(30, relation + methode),
      grade: "Joueur perdu",
      headline: has(s, "menace")
        ? "Hugo passe par un avocat et met fin au mandat. Il signe avec Stéphane Roche."
        : "Hugo met fin au mandat. Il signe avec Stéphane Roche.",
      tiles: [...tiles, { label: "Hugo", value: "parti" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + posture + methode));
  const headline =
    s.trust >= 80
      ? "Hugo reste, et il te le dit : « Tu m'as dit les choses en face. » Trois semaines plus tard, il signe deux ans."
      : s.trust >= 50
        ? "Hugo reste. À toi de tenir le point du lundi, chaque semaine."
        : "Hugo reste, du bout des lèvres. La confiance est fragile.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [...tiles, { label: "Hugo", value: "reste" }],
    notes,
    missed,
  };
}

export const FOURNIER: Scenario = {
  id: "dossier-fournier",
  title: "Le dossier Fournier",
  pitch: "Ton joueur, sans club en juillet, veut te quitter pour un autre agent. Une conversation pour tout rattraper.",
  theme: "Conversation difficile",
  chapterId: "psychologie-humain",
  chapters: ["psychologie-humain", "gestion-carriere"],
  lessons: ["conversations-difficiles", "relation", "mental-performance", "litiges"],
  intro: {
    heading: "Ne perds pas ton joueur",
    text: "Hugo Fournier, 29 ans, milieu de terrain, est en fin de contrat et toujours sans club en juillet. Tu ne lui as pas donné de nouvelles depuis deux mois. Ce soir, il t'appelle pour te dire qu'il veut changer d'agent. Un concurrent lui promet un club en Turquie.",
    stats: [
      { label: "Joueur", value: "Hugo · 29 ans" },
      { label: "Situation", value: "sans club" },
      { label: "Ton mandat", value: "jusqu'en décembre" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Personnages fictifs.",
  },
  preps: [
    {
      id: "bilan",
      title: "Faire le bilan honnête de ton travail",
      detail: "Rassembler ce que tu as vraiment fait pour Hugo cet été.",
      intel:
        "Tu l'as proposé à onze clubs. Deux ont montré de l'intérêt, sans offre. Ton erreur : tu ne l'as presque pas tenu informé depuis juin.",
    },
    {
      id: "marche",
      title: "Sonder le marché",
      detail: "Appeler ton réseau sur les milieux d'expérience.",
      intel:
        "Le FC Brémont (Ligue 2) cherche un milieu d'expérience, deux ans de contrat possibles. Aucune trace d'une offre turque réelle pour Hugo.",
    },
    {
      id: "mandat",
      title: "Relire ton mandat",
      detail: "Savoir exactement ce qui est prévu en cas de départ.",
      intel:
        "Mandat exclusif jusqu'au 31 décembre. Une résiliation anticipée est possible d'un commun accord, par écrit. Ta commission reste due sur les dossiers que tu as lancés.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["appel", "concurrent", "mental", "plan", "decision"],
  initialVars: {},
  initialTrust: 35,
  ruptureAt: 15,
  trustLabel: "Confiance de Hugo",
  endLines: {
    rupture: "Hugo raccroche. C'est fini entre vous.",
    faute: "Hugo raccroche. C'est fini entre vous.",
    accord: "Hugo raccroche, apaisé. Voyons ce que vaut cette conversation…",
  },
  panel: (s) => ({
    title: "Le dossier Hugo",
    rows: [
      { label: "Situation", value: "29 ans · sans club" },
      { label: "Mandat", value: "exclusif → 31/12" },
      { label: "Ce qui lui manque", value: has(s, "besoin") ? "des nouvelles" : "—" },
      { label: "Plan", value: chose(s, "bremont") ? "Brémont + point le lundi" : has(s, "plan") ? "point le lundi" : "—" },
      { label: "Menace de procès", value: has(s, "menace") ? "oui ⚠" : "non" },
    ],
    footer: "Faits · respect · une voie de sortie.",
  }),
  result: fournierResult,
};
