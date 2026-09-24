// Mise en situation « Le dossier Marchand » — sponsor & droits d'image.
//
// Théo Marchand, 22 ans, révélation offensive du FC Aurelle, intéresse la
// marque Solvane. Problème : l'équipementier du club, Kairon, est un
// concurrent direct. Périmètre de l'image (collective / individuelle),
// transparence avec le club, exclusivité et durée, réseaux sociaux et clause
// de moralité, et une « commission » cachée proposée par la marque. Fidèle aux
// leçons « Image, marque personnelle & sponsors », « Réseaux sociaux » et
// « Éthique, déontologie & conflits d'intérêts ». Personnages, clubs et
// marques FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const THEO = "Théo Marchand";
const MARQUE = "Inès Lambert · marque Solvane";
const CLUB = "Le directeur marketing du FC Aurelle";
const LENDEMAIN = "Le lendemain";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  offre: {
    title: "L'offre",
    speaker: MARQUE,
    line: () =>
      "« On veut Théo comme ambassadeur Solvane : 150 000 € par an, avec l'exclusivité sur tout, y compris ses publications. On signe cette semaine ? »",
    next: "club",
    choices: [
      {
        id: "perimetre",
        requires: "contrat",
        label:
          "« Merci, on est intéressés. Mais l'équipementier de son club, c'est Kairon : Théo ne pourra jamais porter Solvane en match ni pour le club, et son contrat réserve au club l'image collective. On parle donc d'un contrat sur son image individuelle, hors activités du club. »",
        effect: () => ({
          trust: 6,
          flags: ["perimetre"],
          method: 7,
          lesson: "image-sponsors",
          reply: "« Bien sûr, on connaît la règle. Parlons de l'image individuelle. »",
          feedback:
            "Tu poses le périmètre avant même de parler d'argent : l'image collective au club, l'image individuelle au joueur. C'est ce qui évite le conflit joueur-club-sponsor.",
        }),
      },
      {
        id: "ecrit",
        label: "« Envoyez-moi le projet de contrat : je le relis avec Théo et un avocat avant de vous répondre. »",
        effect: () => ({
          trust: 3,
          method: 5,
          lesson: "image-sponsors",
          reply: "« Je vous l'envoie ce soir. »",
          feedback:
            "Bon réflexe : rien sans écrit ni relecture. En connaissant déjà le contrat de Théo avec son club, tu aurais pu cadrer le périmètre tout de suite.",
        }),
      },
      {
        id: "signer",
        label: "« 150 000 € ? Parfait, on signe cette semaine. »",
        effect: () => ({
          trust: 6,
          flags: ["precipite"],
          method: 0,
          lesson: "image-sponsors",
          reply: "« Super, je prépare le contrat ! »",
          feedback:
            "Tu t'engages sans avoir vérifié ce que le contrat de Théo avec son club autorise, ni ce que vaut son image sur le marché. L'image est un actif : on ne la brade pas au premier sponsor venu.",
        }),
      },
    ],
  },

  club: {
    title: "Le club",
    speaker: CLUB,
    line: () =>
      "« On a entendu parler de Solvane. Je vous rappelle que notre équipementier, c'est Kairon. Si Théo signe avec un concurrent, on va avoir un problème. »",
    next: "clauses",
    choices: [
      {
        id: "transparence",
        requires: "contrat",
        label:
          "« C'est pour ça que je voulais vous en parler avant de signer. Le contrat Solvane portera uniquement sur son image individuelle, hors activités du club. En match, à l'entraînement et pour vos opérations, il porte Kairon, comme le prévoit son contrat. Je vous envoie la clause pour validation. »",
        effect: () => ({
          trust: 6,
          flags: ["club-ok"],
          method: 7,
          lesson: "image-sponsors",
          reply: "« Si c'est cadré comme ça, pas de souci. Envoyez-moi la clause. »",
          feedback:
            "Transparence et contrat en main : le club est rassuré, parce que tu sais exactement ce qui lui appartient et ce qui appartient à Théo.",
        }),
      },
      {
        id: "prevenir",
        label: "« Merci de nous le signaler. Rien n'est signé : je relis le contrat de Théo et je reviens vers vous avant toute signature. »",
        effect: () => ({
          trust: 3,
          flags: ["club-ok"],
          method: 6,
          lesson: "image-sponsors",
          reply: "« Merci. On attend votre retour. »",
          feedback:
            "Honnête et prudent. Avec le contrat de Théo déjà relu, tu aurais pu rassurer le club tout de suite en lui expliquant le périmètre.",
        }),
      },
      {
        id: "rassurer",
        label: "« Ne vous inquiétez pas, ça ne vous concerne pas. »",
        effect: () => ({
          trust: 0,
          flags: ["conflit"],
          method: 1,
          lesson: "image-sponsors",
          reply: "« Ça nous concerne, justement. On en reparlera. »",
          feedback:
            "Le club a des droits sur l'image collective de Théo et des engagements envers son équipementier. L'écarter, c'est préparer le conflit.",
        }),
      },
      {
        id: "cacher",
        label: "« Rien n'est signé, il n'y a rien à dire. » (Alors que tu comptes signer demain.)",
        effect: () => ({
          trust: 0,
          flags: ["cache"],
          method: 0,
          lesson: "deontologie",
          reply: "« Très bien. Tenez-moi informé. »",
          feedback:
            "Un mensonge par omission au club de ton joueur. Le jour où il découvre le contrat, ta parole ne vaut plus rien, et c'est Théo qui en subit les conséquences.",
        }),
      },
    ],
  },

  clauses: {
    title: "Les clauses",
    speaker: MARQUE,
    line: () =>
      "« Pour ce prix, on veut l'exclusivité sur toutes les catégories, cinq ans, et le droit de réutiliser ses photos et vidéos sans limite de durée. »",
    next: "reseaux",
    choices: [
      {
        id: "cadrer",
        requires: "marche",
        label:
          "« L'exclusivité, oui, mais sur les chaussures et le textile seulement : Théo doit rester libre dans les autres catégories. Trois ans, et vos droits sur ses images s'arrêtent avec le contrat. Et vu le marché pour son profil, on vise 200 000 € par an, plus des bonus liés aux sélections. »",
        effect: () => ({
          trust: 10,
          flags: ["cadre"],
          method: 7,
          lesson: "image-sponsors",
          reply: "« …200 000, avec les bonus sélection. C'est jouable. »",
          feedback:
            "Exclusivité limitée à la catégorie, durée maîtrisée, droits qui s'arrêtent avec le contrat, et un prix fondé sur le marché : l'image de Théo est protégée ET valorisée.",
        }),
      },
      {
        id: "duree",
        label: "« D'accord pour l'exclusivité, mais sur trois ans, et vos droits sur ses images s'arrêtent avec le contrat. »",
        effect: () => ({
          trust: 4,
          method: 5,
          lesson: "image-sponsors",
          reply: "« Trois ans, entendu. »",
          feedback:
            "Tu protèges l'essentiel (durée et fin des droits). Mais une exclusivité sur toutes les catégories bloque Théo pour d'autres marques, et le prix n'a pas été discuté.",
        }),
      },
      {
        id: "tout-accepter",
        label: "« Tout ça me va. »",
        effect: () => ({
          trust: 0,
          flags: ["brade"],
          method: 0,
          lesson: "image-sponsors",
          reply: "« Parfait ! »",
          feedback:
            "Cinq ans d'exclusivité sur tout, des images réutilisables à vie, au prix de départ : tu brades l'image de Théo pour des années.",
        }),
      },
    ],
  },

  reseaux: {
    title: "Les réseaux",
    speaker: THEO,
    line: () =>
      "« Solvane veut que je poste trois fois par semaine avec leurs produits. Et hier soir, j'ai failli répondre à un supporter qui m'insultait… Je poste ce que je veux, non ? »",
    next: "signature",
    choices: [
      {
        id: "charte",
        requires: "reseaux",
        label:
          "« Tes réseaux, c'est ton image, et ton image a maintenant un contrat. On limite à un post par semaine, relu ensemble, avec la mention « collaboration commerciale » bien visible, comme la loi l'exige. Et la règle : sur un sujet sensible, ou quand tu es énervé, tu m'appelles avant de publier. Le contrat prévoit une clause de moralité : une polémique peut suffire à tout arrêter. »",
        effect: () => ({
          trust: 8,
          flags: ["charte"],
          method: 7,
          lesson: "reseaux-sociaux",
          reply: "« Un post par semaine, et je t'appelle avant de m'énerver. Deal. »",
          feedback:
            "Tu cadres sans interdire : un rythme réaliste, la mention obligatoire, et une règle simple contre les messages impulsifs. Tu protèges Théo, parfois contre lui-même.",
        }),
      },
      {
        id: "conseil",
        label: "« Tu postes ce que tu veux, mais évite les polémiques, et on relit ensemble les posts Solvane. »",
        effect: () => ({
          trust: 4,
          method: 5,
          lesson: "reseaux-sociaux",
          reply: "« OK, je ferai attention. »",
          feedback:
            "Le bon esprit, mais trop vague. Une règle concrète (on s'appelle avant de publier sur un sujet sensible) et la mention « collaboration commerciale » auraient mieux protégé Théo.",
        }),
      },
      {
        id: "libre",
        label: "« C'est ta vie, fais comme tu le sens. »",
        effect: () => ({
          trust: 4,
          flags: ["laisser"],
          method: 0,
          lesson: "reseaux-sociaux",
          reply: "« Cool. »",
          feedback:
            "Un contrat d'image engage aussi ce que Théo publie. Le laisser seul face aux réseaux, c'est laisser la prochaine polémique décider de son contrat.",
        }),
      },
      {
        id: "repondre",
        label: "« Réponds-lui, qu'il comprenne à qui il parle ! »",
        effect: () => ({
          end: "rupture",
          method: 0,
          lesson: "reseaux-sociaux",
          replySpeaker: LENDEMAIN,
          reply: "Le message de Théo fait le tour des réseaux. Solvane suspend les discussions, et le club le convoque.",
          feedback:
            "Pousser son joueur à répondre à chaud, c'est allumer soi-même la polémique. Une marque ne s'associe pas à un joueur qui s'embrase en public.",
        }),
      },
    ],
  },

  signature: {
    title: "La signature",
    speaker: MARQUE,
    line: () =>
      "« On est d'accord sur l'essentiel. Une dernière chose : on vous verse 20 000 €, à vous, pour avoir « facilité » l'accord. Pas besoin d'en parler à Théo. »",
    next: "fin",
    choices: [
      {
        id: "transparent",
        label:
          "« Non. Je suis l'agent de Théo : ce que je perçois sur ce contrat est prévu dans mon mandat, et il le sait. Si vous avez 20 000 € de plus, ils vont à Théo, dans son contrat. »",
        effect: () => ({
          trust: 10,
          flags: ["loyal"],
          method: 7,
          lesson: "deontologie",
          reply: "« …Entendu. On ajoute 20 000 € à la prime de signature de Théo. »",
          feedback:
            "Tu refuses l'argent caché ET tu le fais basculer au profit de ton joueur. Un seul mandant, une seule rémunération, connue de lui.",
        }),
      },
      {
        id: "non-merci",
        label: "« Non merci, ce n'est pas nécessaire. »",
        effect: () => ({
          trust: 3,
          method: 5,
          lesson: "deontologie",
          reply: "« Comme vous voulez. »",
          feedback:
            "Tu refuses, c'est l'essentiel. Mais tu aurais pu faire profiter Théo de ce budget, et lui dire qu'on te l'avait proposé.",
        }),
      },
      {
        id: "encaisser",
        label: "« Entre nous, ça me va. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "deontologie",
          reply: "« Parfait. Je vous fais le virement. »",
          feedback:
            "Faute grave : toucher de l'argent de la marque dans le dos de ton joueur, c'est un conflit d'intérêts. Tu n'es plus son agent, tu es payé par l'autre camp.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "precipite", points: 10, text: "Engagement pris avant d'avoir vérifié le contrat du joueur" },
  { flag: "cache", points: 10, text: "Contrat caché au club" },
  { flag: "brade", points: 10, text: "Image bradée (exclusivité totale, droits illimités)" },
  { flag: "conflit", points: 5, text: "Club écarté alors qu'il a des droits sur l'image collective" },
  { flag: "laisser", points: 5, text: "Réseaux sociaux laissés sans cadre" },
];

const GRADES: [number, string][] = [
  [85, "Gardien de l'image"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function marchandResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const posture = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!has(s, "contrat")) {
    missed.push(
      "Relire le contrat de Théo avant tout : l'image collective appartient au club, et son équipementier est un concurrent de Solvane.",
    );
  }
  if (!chose(s, "cadrer") && s.history.length >= 3) {
    missed.push(
      "Limiter l'exclusivité à la catégorie de la marque, arrêter l'usage des images avec le contrat, et négocier au prix du marché.",
    );
  }
  if (!chose(s, "charte") && s.history.length >= 4) {
    missed.push(
      "Poser une règle simple pour les réseaux : posts relus, mention « collaboration commerciale », et un appel avant de publier sur un sujet sensible.",
    );
  }
  if (!chose(s, "transparent") && s.history.length >= 5) {
    missed.push("Refuser tout versement caché de la marque, et le faire profiter à ton joueur : ce que tu perçois est prévu dans ton mandat.");
  }

  const tiles = [
    { label: "Confiance de Théo", value: `${relation}/40` },
    { label: "Posture", value: `${posture}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en posture.`);

  if (s.outcome === "faute") {
    return {
      outcome: "faute",
      score: Math.min(15, methode),
      grade: "Faute grave",
      headline:
        "Une commission cachée versée par la marque, dans le dos de ton joueur : c'est un conflit d'intérêts. Théo l'apprend, met fin au mandat, et ta licence est en jeu.",
      tiles: [
        { label: "Confiance de Théo", value: "—" },
        { label: "Posture", value: "0/25" },
        { label: "Méthode", value: `${methode}/35` },
        { label: "Contrat", value: "annulé" },
      ],
      notes: [],
      missed,
    };
  }

  if (s.outcome === "rupture") {
    return {
      outcome: "rupture",
      score: Math.min(30, relation + methode),
      grade: "Contrat perdu",
      headline: "Le message de Théo fait le tour des réseaux. Solvane se retire, et le club le convoque.",
      tiles: [...tiles, { label: "Contrat", value: "perdu" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + posture + methode));
  const montant = chose(s, "cadrer") ? "200 000 €/an" : "150 000 €/an";
  const headline = has(s, "cache")
    ? "Le club découvre le contrat Solvane dans la presse. Convocation, tension, et Théo se retrouve au milieu."
    : posture === 25 && s.trust >= 80
      ? "Théo signe avec Solvane : exclusivité limitée à sa catégorie, validée par le club, et une prime de signature en plus. Son image est protégée, et elle rapporte."
      : has(s, "brade")
        ? "Théo signe, mais pour cinq ans d'exclusivité sur tout : il devra refuser toutes les prochaines marques."
        : "Théo signe avec Solvane. Quelques réglages auraient rendu le contrat irréprochable.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [...tiles, { label: "Contrat", value: montant }],
    notes,
    missed,
  };
}

export const MARCHAND: Scenario = {
  id: "dossier-marchand",
  title: "Le dossier Marchand",
  pitch: "Une marque veut ton attaquant, mais l'équipementier de son club est un concurrent. Image, exclusivité, réseaux : protège son image et fais-la rapporter.",
  theme: "Sponsor & droits d'image",
  chapterId: "gestion-carriere",
  chapters: ["gestion-carriere", "medias-communication"],
  lessons: ["image-sponsors", "reseaux-sociaux"],
  intro: {
    heading: "Son image a un prix",
    text: "Théo Marchand, 22 ans, attaquant du FC Aurelle, est la révélation de la saison. La marque Solvane veut en faire son ambassadeur. Problème : l'équipementier de son club, Kairon, est son concurrent direct. À toi de décrocher un bon contrat sans abîmer ni son image, ni sa relation avec le club.",
    stats: [
      { label: "Joueur", value: "Théo · 22 ans" },
      { label: "La marque", value: "Solvane" },
      { label: "Équipementier du club", value: "Kairon (concurrent)" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Attention : certaines erreurs arrêtent la partie. Personnages, clubs et marques fictifs.",
  },
  preps: [
    {
      id: "contrat",
      title: "Relire le contrat de Théo avec son club",
      detail: "Savoir ce qui appartient au club et ce qui reste à Théo.",
      intel:
        "Le club exploite l'image collective (maillot, photos d'équipe, opérations du club). Théo garde son image individuelle, mais ne peut pas porter une marque concurrente de Kairon dans les activités du club. Tout partenariat personnel doit être signalé au club.",
    },
    {
      id: "marche",
      title: "Sonder le marché des sponsors",
      detail: "Savoir ce que vaut l'image de Théo, et ce que les marques demandent d'habitude.",
      intel:
        "Pour un attaquant révélation de sa saison, les contrats d'équipementier tournent autour de 150 000 à 250 000 € par an, avec des bonus en cas de sélection. Les marques demandent l'exclusivité sur leur catégorie, rarement sur tout.",
    },
    {
      id: "reseaux",
      title: "Analyser ses réseaux sociaux",
      detail: "Comprendre comment Théo publie, et les risques.",
      intel:
        "Théo a 300 000 abonnés, très engagés. Il a déjà supprimé deux messages impulsifs cette saison. Le projet de contrat Solvane prévoit une clause de moralité : une polémique peut permettre à la marque de rompre.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["offre", "club", "clauses", "reseaux", "signature"],
  initialVars: {},
  initialTrust: 45,
  ruptureAt: 20,
  trustLabel: "Confiance de Théo",
  endLines: {
    rupture: "Solvane se retire. Le contrat est perdu.",
    faute: "Faute grave. Le dossier t'échappe.",
    accord: "Le contrat est prêt. Voyons ce qu'il vaut…",
  },
  panel: (s) => ({
    title: "Le dossier Théo",
    rows: [
      { label: "Périmètre", value: has(s, "perimetre") ? "image individuelle seulement" : has(s, "contrat") ? "à cadrer" : "?" },
      { label: "Club informé", value: has(s, "club-ok") ? "oui" : has(s, "cache") ? "non ⚠" : "—" },
      { label: "Exclusivité", value: chose(s, "cadrer") ? "sa catégorie · 3 ans" : has(s, "brade") ? "tout · 5 ans ⚠" : chose(s, "duree") ? "tout · 3 ans" : "—" },
      { label: "Prix", value: chose(s, "cadrer") ? "200 000 €/an + bonus" : "150 000 €/an" },
      { label: "Réseaux", value: has(s, "charte") ? "règles posées" : has(s, "laisser") ? "sans cadre ⚠" : "—" },
    ],
    footer: "L'image est un actif : on la cadre par écrit.",
  }),
  result: marchandResult,
};
