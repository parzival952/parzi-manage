// Mise en situation « Le dossier Lemaire » — gérer une crise médiatique.
//
// Soir de défaite : une vidéo de Théo Lemaire « en soirée la veille du match »
// devient virale. Le joueur veut répondre à chaud, un journaliste appelle, le
// club veut communiquer, le sponsor s'inquiète. Principes des leçons
// « Communication de crise », « Maîtriser les réseaux sociaux », « Gérer la
// relation avec les médias » et « Préparer une prise de parole » : vite mais
// sans panique, une seule voix, jamais de mensonge, le joueur jamais seul.
// Personnages et clubs FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const THEO = "Théo Lemaire";
const JOURNALISTE = "Julie Marchal · journaliste";
const CLUB = "Service presse · Valcourt";
const SPONSOR = "Sabine Roux · sponsor";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  story: {
    title: "La réaction à chaud",
    speaker: THEO,
    line: () => "« T'as vu ce qu'ils disent ? J'ai écrit une story pour les remettre à leur place. Je la poste, là. »",
    next: "journaliste",
    choices: [
      {
        id: "stop",
        label:
          "« Ne poste rien. Personne ne répond à chaud : on se rappelle dans dix minutes et on décide ensemble de la suite. »",
        effect: () => ({
          trust: 10,
          method: 7,
          lesson: "reseaux-sociaux",
          reply: "« …OK. Mais il faudra qu'on réponde. »",
          feedback: "Tu coupes le bruit : jamais de réponse à chaud, et jamais le joueur seul face à la polémique.",
        }),
      },
      {
        id: "laisser",
        label: "« C'est ton compte, fais comme tu le sens. »",
        effect: () => ({
          trust: -20,
          flags: ["story"],
          method: 0,
          lesson: "reseaux-sociaux",
          reply: "La story part. Dix minutes plus tard, elle est reprise partout : « Lemaire s'en prend à ses supporters ».",
          feedback: "Laisser le joueur répondre seul, en pleine émotion, transforme une polémique en crise.",
        }),
      },
      {
        id: "reecrire",
        label: "« Envoie-moi ta story, je la réécris pour qu'elle passe mieux, et tu la postes. »",
        effect: () => ({
          trust: -5,
          flags: ["story-douce"],
          method: 2,
          lesson: "communication-crise",
          reply: "Tu adoucis le texte. La story part quand même, et relance le sujet.",
          feedback:
            "Mieux que rien, mais tu réagis encore à chaud, sans plan ni accord du club. La réponse arrive trop tôt, et seule.",
        }),
      },
    ],
  },

  journaliste: {
    title: "L'appel du journaliste",
    speaker: JOURNALISTE,
    line: () =>
      "« Bonsoir. Je publie un article dans une heure sur la vidéo de Théo. Vous confirmez qu'il était en boîte la veille du match ? »",
    next: "club",
    choices: [
      {
        id: "verite",
        requires: "faits",
        label:
          "« Non, et je peux le prouver : la vidéo date d'il y a trois semaines, un jour de repos. Je vous envoie les éléments. Pour le reste, le club et Théo s'exprimeront ensemble. »",
        effect: () => ({
          trust: 15,
          flags: ["dementi-prouve"],
          method: 7,
          lesson: "relation-medias",
          reply: "« Si c'est daté, je corrige mon angle. Merci pour la précision. »",
          feedback:
            "Tu dis la vérité, preuves à l'appui, sans t'emporter. Un journaliste sérieux corrige, et tu gardes le reste pour la parole commune.",
        }),
      },
      {
        id: "silence",
        label: "« Je ne commente pas ce soir. Une communication officielle suivra. »",
        effect: () => ({
          trust: 3,
          method: 5,
          lesson: "relation-medias",
          reply: "« Très bien, j'écris que l'entourage ne commente pas. »",
          feedback:
            "Le silence est une réponse valable quand on ne sait pas encore. Sans avoir vérifié les faits, tu ne pouvais pas faire mieux, mais l'article sort sans correction.",
        }),
      },
      {
        id: "mensonge",
        label: "« C'est un montage, cette vidéo est fausse. »",
        effect: () => ({
          trust: -25,
          flags: ["mensonge"],
          method: 0,
          lesson: "communication-crise",
          reply: "« Fausse ? J'ai trois sources qui disent le contraire. » Ton démenti devient le sujet.",
          feedback:
            "Jamais de mensonge : dire la vérité ou se taire. Un démenti faux, démonté en une heure, aggrave tout et te grille auprès de la presse.",
        }),
      },
      {
        id: "off",
        label: "« Entre nous, en off : oui, il sort souvent. Mais ne l'écrivez pas. »",
        effect: () => ({
          trust: -20,
          flags: ["off"],
          method: 0,
          lesson: "relation-medias",
          reply: "L'article sort avec : « Selon son entourage, le joueur a l'habitude de sortir. »",
          feedback:
            "Rien n'est vraiment « off » : ne dis jamais en off ce qui te détruirait en on. Tu viens d'enfoncer ton propre joueur.",
        }),
      },
    ],
  },

  club: {
    title: "L'appel du club",
    speaker: CLUB,
    line: () => "« On veut publier un communiqué ce soir. Vous comptez communiquer de votre côté ? »",
    next: "sponsor",
    choices: [
      {
        id: "valider",
        requires: "club",
        label:
          "« On valide votre texte, avec un ajout : la date réelle de la vidéo. Publication commune dans dix minutes, et Théo ne dit rien d'autre ce soir. »",
        effect: () => ({
          trust: 15,
          flags: ["une-voix"],
          method: 7,
          lesson: "communication-crise",
          reply: "« Parfait, on l'ajoute. C'est en ligne dans dix minutes. »",
          feedback:
            "Tu avais appelé le club avant la tempête : le message commun est prêt, et il sort vite. Une seule voix, au bon moment.",
        }),
      },
      {
        id: "aligner",
        label:
          "« Non : une seule voix. On valide ensemble un message court, publié par le club, et Théo ne dit rien d'autre ce soir. »",
        effect: () => ({
          trust: 12,
          flags: ["une-voix"],
          method: 7,
          lesson: "communication-crise",
          reply: "« Parfait. Je vous envoie le texte dans vingt minutes. »",
          feedback: "Une seule voix, joueur, agent et club alignés : c'est la règle d'or d'une crise.",
        }),
      },
      {
        id: "separe",
        label: "« On fera notre propre communiqué. On ne veut pas dépendre de vous. »",
        effect: () => ({
          trust: -12,
          flags: ["deux-voix"],
          method: 1,
          lesson: "communication-crise",
          reply: "Deux communiqués sortent, qui ne disent pas tout à fait la même chose. La presse titre sur « le malaise ».",
          feedback: "Deux voix, deux versions : la crise se nourrit des contradictions.",
        }),
      },
      {
        id: "accuser",
        label: "« Le club aurait dû protéger Théo. C'est aussi votre faute. »",
        effect: () => ({
          trust: -10,
          method: 0,
          lesson: "communication-crise",
          reply: "« On en reparlera. » Le ton se refroidit.",
          feedback:
            "Attaquer le club en pleine crise te prive de ton meilleur allié et abîme la relation pour la suite.",
        }),
      },
    ],
  },

  sponsor: {
    title: "Le sponsor s'inquiète",
    speaker: SPONSOR,
    line: () =>
      "« On voit la vidéo partout. Nos équipes demandent si on suspend la campagne de lundi. Qu'est-ce qui se passe ? »",
    next: "parole",
    choices: [
      {
        id: "transparence",
        label:
          "« Je vous appelle d'abord vous, en privé : voici les faits, et voici ce que nous publions avec le club. Je vous tiens au courant à chaque étape. »",
        effect: () => ({
          trust: 10,
          method: 7,
          lesson: "image-sponsors",
          reply: "« Merci de nous prévenir avant la presse. On maintient, on reste en contact. »",
          feedback: "Le partenaire est informé en premier, en privé, avec des faits et un plan : c'est ce qui le garde.",
        }),
      },
      {
        id: "minimiser",
        label: "« Ce n'est rien, ça passera en deux jours. »",
        effect: () => ({
          trust: -8,
          method: 1,
          lesson: "image-sponsors",
          reply: "« Pour nous, ce n'est pas rien. On suspend en attendant d'y voir clair. »",
          feedback:
            "Minimiser une inquiétude légitime te fait paraître inconscient du risque. Donne des faits et un plan.",
        }),
      },
      {
        id: "garantir",
        label: "« Je vous garantis qu'il ne se passera plus jamais rien de ce genre. »",
        effect: () => ({
          trust: -5,
          flags: ["promesse"],
          method: 1,
          lesson: "communication-crise",
          reply: "« Vous ne pouvez pas garantir ça… » Le doute s'installe.",
          feedback:
            "Une garantie impossible à tenir te décrédibilise. Engage-toi sur ce que tu maîtrises : les faits, le plan, le suivi.",
        }),
      },
    ],
  },

  parole: {
    title: "La prise de parole",
    speaker: THEO,
    line: () => "« Le club propose que je réponde à deux questions demain, après l'entraînement. Je dis quoi ? »",
    next: "fin",
    choices: [
      {
        id: "preparer",
        requires: "plan",
        label:
          "« On prépare trois messages : les faits, ton engagement envers le club et les supporters, le prochain match. Deux sujets qu'on n'aborde pas, une phrase de sortie. On répète ce soir. »",
        effect: () => ({
          trust: 12,
          method: 7,
          lesson: "prise-de-parole",
          reply: "Le lendemain, Théo reste calme et bref. Le sujet s'éteint dans la journée.",
          feedback: "Messages clés, limites, phrase de sortie : un joueur préparé garde le contrôle.",
        }),
      },
      {
        id: "court",
        label:
          "« On prépare ensemble ce soir : un message simple sur les faits et le prochain match, et tu ne réponds à rien d'autre. »",
        effect: () => ({
          trust: 6,
          method: 5,
          lesson: "prise-de-parole",
          reply: "Théo s'en tient au message. Deux questions pièges restent sans réponse claire, mais rien ne dérape.",
          feedback:
            "Bonne base : un message et des limites. Avec une phrase de sortie et une répétition, il aurait été imperméable.",
        }),
      },
      {
        id: "naturel",
        label: "« Sois toi-même, dis ce que tu ressens. »",
        effect: () => ({
          trust: -10,
          flags: ["improvise"],
          method: 1,
          lesson: "prise-de-parole",
          reply: "Théo s'emporte contre « ceux qui jugent sans savoir ». La phrase tourne en boucle toute la journée.",
          feedback:
            "Envoyer le joueur sans préparation, c'est le laisser se faire piéger. Une prise de parole se prépare comme une négociation.",
        }),
      },
      {
        id: "refuser",
        label: "« Refuse. Ne dis rien du tout. »",
        effect: () => ({
          trust: -3,
          method: 3,
          lesson: "relation-medias",
          reply: "Théo décline. Certains y voient une fuite, mais le sujet retombe lentement.",
          feedback:
            "Le silence peut fonctionner, mais le club proposait ici un cadre sûr pour clore le sujet. Une parole brève et préparée aurait été plus forte.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "mensonge", points: 15, text: "Faux démenti à la presse" },
  { flag: "off", points: 15, text: "Confidence « en off » qui enfonce le joueur" },
  { flag: "story", points: 10, text: "Story publiée à chaud par le joueur" },
  { flag: "deux-voix", points: 10, text: "Deux communiqués contradictoires" },
  { flag: "improvise", points: 10, text: "Prise de parole improvisée" },
  { flag: "story-douce", points: 5, text: "Réponse publiée trop tôt, sans le club" },
  { flag: "promesse", points: 5, text: "Garantie impossible à tenir" },
];

const GRADES: [number, string][] = [
  [85, "Gestionnaire de crise"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

const HOURS = ["22 h 47", "23 h 05", "23 h 30", "0 h 10", "le lendemain"];

function lemaireResult(s: SimState): Result {
  const methode = methodPoints(s);
  const image = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const maitrise = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!has(s, "dementi-prouve")) {
    missed.push(
      "Vérifier les faits avec Théo avant tout t'aurait permis de démentir preuves à l'appui : la vidéo datait d'un jour de repos, trois semaines plus tôt.",
    );
  }
  if (!has(s, "une-voix")) {
    missed.push(
      "Parler d'une seule voix avec le club, avec un message validé ensemble, évite les contradictions qui nourrissent la crise.",
    );
  }
  if (!chose(s, "preparer") && s.history.length === 5) {
    missed.push(
      "Un plan de crise préparé à froid prévoit la prise de parole : trois messages, ce qu'on ne dira pas, une phrase de sortie, et une répétition.",
    );
  }

  const tiles = [
    { label: "Image du joueur", value: `${image}/40` },
    { label: "Maîtrise", value: `${maitrise}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en maîtrise.`);

  if (s.outcome !== "accord") {
    return {
      outcome: "rupture",
      score: Math.min(30, image + methode),
      grade: "Crise hors de contrôle",
      headline: "Le sponsor suspend son contrat et le club met Théo à l'écart. La tempête t'a échappé.",
      tiles: [...tiles, { label: "Sponsor", value: "suspendu" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, image + maitrise + methode));
  const sponsorKept = chose(s, "transparence");
  const headline =
    maitrise === 25 && s.trust >= 80
      ? "Deux jours plus tard, plus personne n'en parle. Le sponsor maintient la campagne."
      : has(s, "mensonge") || has(s, "off")
        ? "La tempête retombe, mais ta crédibilité auprès de la presse en a pris un coup."
        : "La tempête retombe, avec quelques dégâts à réparer.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [...tiles, { label: "Sponsor", value: sponsorKept ? "maintenu" : "suspendu" }],
    notes,
    missed,
  };
}

export const LEMAIRE: Scenario = {
  id: "dossier-lemaire",
  title: "Le dossier Lemaire",
  pitch: "Une vidéo de ton joueur devient virale un soir de défaite. Tu as une soirée pour reprendre la main.",
  theme: "Crise médiatique",
  chapterId: "medias-communication",
  chapters: ["medias-communication"],
  lessons: ["communication-crise", "reseaux-sociaux", "relation-medias", "prise-de-parole"],
  intro: {
    heading: "Éteins l'incendie",
    text: "22 h 40, soir de défaite. Une vidéo de Théo Lemaire, ton attaquant de 24 ans à l'Olympique de Valcourt, tourne sur les réseaux : on le voit faire la fête, soi-disant la veille du match. Le hashtag grimpe et ton téléphone sonne. Tu as une soirée pour reprendre la main.",
    stats: [
      { label: "Joueur", value: "Théo · 24 ans" },
      { label: "Club", value: "Valcourt (L1)" },
      { label: "Temps", value: "une soirée" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Personnages fictifs.",
  },
  preps: [
    {
      id: "faits",
      title: "Vérifier les faits avec Théo",
      detail: "Lui demander calmement quand et où la vidéo a été tournée.",
      intel:
        "La vidéo date d'il y a trois semaines, un jour de repos, pour son anniversaire. Rien à voir avec le match. Tu as la date et des témoins.",
    },
    {
      id: "club",
      title: "Appeler le service presse du club",
      detail: "Savoir ce que le club prévoit avant que tout le monde parle.",
      intel: "Le club est prêt à publier un message commun si vous vous alignez. Il demande une seule chose : aucune déclaration séparée.",
    },
    {
      id: "plan",
      title: "Ressortir ton plan de crise",
      detail: "Le plan préparé à froid, au début de la saison.",
      intel:
        "Ton plan prévoit : Théo ne publie rien, un seul porte-parole, un message validé avec le club, le sponsor prévenu en premier, et une prise de parole préparée.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["story", "journaliste", "club", "sponsor", "parole"],
  initialVars: {},
  initialTrust: 50,
  ruptureAt: 15,
  trustLabel: "Image du joueur",
  endLines: {
    rupture: "La polémique s'emballe. La crise est hors de contrôle.",
    faute: "La polémique s'emballe. La crise est hors de contrôle.",
    accord: "La nuit est passée. Voyons ce qu'il reste de la tempête…",
  },
  panel: (s) => ({
    title: "La crise",
    rows: [
      { label: "Heure", value: HOURS[Math.min(s.history.length, HOURS.length - 1)] },
      {
        label: "Story de Théo",
        value: has(s, "story") ? "publiée ⚠" : has(s, "story-douce") ? "publiée, adoucie" : s.history.length ? "pas publiée" : "prête à partir ⚠",
      },
      {
        label: "Presse",
        value: has(s, "dementi-prouve")
          ? "angle corrigé"
          : has(s, "mensonge")
            ? "faux démenti ⚠"
            : has(s, "off")
              ? "confidence publiée ⚠"
              : chose(s, "silence")
                ? "pas de commentaire"
                : "—",
      },
      { label: "Club", value: has(s, "une-voix") ? "une seule voix" : has(s, "deux-voix") ? "deux communiqués ⚠" : "—" },
      {
        label: "Sponsor",
        value: chose(s, "transparence") ? "rassuré" : chose(s, "minimiser") || chose(s, "garantir") ? "inquiet ⚠" : "—",
      },
    ],
    footer: "Vite mais sans panique · une seule voix · jamais de mensonge.",
  }),
  result: lemaireResult,
};
