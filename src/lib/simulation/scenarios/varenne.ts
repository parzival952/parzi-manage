// Mise en situation « Le dossier Varenne » — vendre un joueur inconnu.
//
// Lucas Varenne, 21 ans, milieu relayeur de l'AS Brévannes (National). Tu as
// deux minutes au téléphone pour convaincre le directeur sportif du Stade de
// Lorval (Ligue 2) de s'y intéresser. Fidèle aux leçons « Détecter un
// talent », « Évaluer un joueur et sa valeur » et « Data & vidéo dans le
// scouting moderne » : parler de ce qu'on a vu en vrai, des chiffres sur un
// échantillon solide, dire les limites, défendre une valeur réaliste, et ne
// jamais survendre. Personnages et clubs FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const DS = "Christophe Aubry · directeur sportif du Stade de Lorval";
const PLUS_TARD = "Le lendemain";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  pitch: {
    title: "Le pitch",
    speaker: DS,
    line: () => "« Vous avez deux minutes. Pourquoi je devrais m'intéresser à un joueur de National ? »",
    next: "buts",
    choices: [
      {
        id: "profil",
        requires: "terrain",
        label:
          "« Parce qu'il colle à votre jeu : relayeur, gros volume de pressing, et il demande le ballon même mené 3-0. Je l'ai vu trois fois, dont une défaite à l'extérieur. Ses limites : le jeu de tête, et il baisse après 70 minutes. »",
        effect: () => ({
          trust: 10,
          flags: ["honnete"],
          method: 7,
          lesson: "detection",
          reply: "« Vu trois fois, dont un match difficile… D'accord, je vous écoute. »",
          feedback:
            "Tu parles de ce que tu as vu en vrai, dans un match difficile, et tu donnes tout de suite ses limites. Un directeur sportif reconnaît immédiatement quelqu'un qui a fait le travail.",
        }),
      },
      {
        id: "chiffres",
        requires: "data",
        label:
          "« 2,1 passes clés par match, dans le top 3 du National à son poste, sur 28 matchs. Je vous ai préparé 12 séquences vidéo, dont 3 où il se trompe. »",
        effect: () => ({
          trust: 8,
          flags: ["dossier"],
          method: 7,
          lesson: "data-video",
          reply: "« Même les séquences où il se trompe ? C'est rare. Envoyez. »",
          feedback:
            "Des chiffres sur un vrai échantillon, et une vidéo qui montre aussi les erreurs : ton dossier est crédible parce qu'il ne cache rien.",
        }),
      },
      {
        id: "crack",
        label: "« C'est un crack, le meilleur milieu du National. Dans deux ans il joue en Ligue 1, je vous le garantis. »",
        effect: () => ({
          trust: -10,
          flags: ["survente"],
          method: 0,
          lesson: "evaluation",
          reply: "« On me dit ça dix fois par semaine. »",
          feedback:
            "« Le meilleur », « je vous le garantis » : un directeur sportif entend ça tous les jours. Survendre une fois, c'est perdre ta crédibilité pour dix dossiers.",
        }),
      },
      {
        id: "highlights",
        label: "« Regardez sa compilation : dribbles, buts, gestes techniques. Ça parle tout seul. »",
        effect: () => ({
          trust: -3,
          method: 2,
          lesson: "detection",
          reply: "« Une compilation, tout le monde en a une. »",
          feedback:
            "Une compilation montre ses cinq meilleures minutes de la saison, pas les 90 minutes d'un match dur. Ça ne convainc pas un professionnel.",
        }),
      },
    ],
  },

  buts: {
    title: "Les buts",
    speaker: DS,
    line: () => "« 7 buts pour un milieu, pas mal. Il marque souvent comme ça ? »",
    next: "limites",
    choices: [
      {
        id: "penalties",
        requires: "data",
        label:
          "« Honnêtement, 4 sont des penalties. Sa vraie valeur, c'est la dernière passe : 9 passes décisives, et le plus de passes clés de son équipe. »",
        effect: () => ({
          trust: 10,
          flags: ["honnete"],
          method: 7,
          lesson: "data-video",
          reply: "« Vous auriez pu ne pas me le dire. Je l'aurais vu, remarquez. »",
          feedback:
            "Tu corriges toi-même un chiffre flatteur avant qu'il le découvre. C'est exactement ce qui rend ton argumentaire imparable.",
        }),
      },
      {
        id: "verifier",
        label: "« Je vous envoie le détail de ses buts et de ses passes ce soir, pour que vous jugiez sur pièces. »",
        effect: () => ({
          trust: 3,
          method: 5,
          lesson: "data-video",
          reply: "« Faites. »",
          feedback:
            "Bon réflexe : sur pièces plutôt que sur parole. Avec la data en main, tu aurais pu dire tout de suite que 4 buts sont des penalties.",
        }),
      },
      {
        id: "finisseur",
        label: "« Oui, c'est un vrai finisseur. »",
        effect: () => ({
          trust: 2,
          flags: ["cache"],
          method: 0,
          lesson: "data-video",
          reply: "« Intéressant. »",
          feedback:
            "4 de ses 7 buts sont des penalties : le directeur sportif le verra à la première vidéo. Un chiffre flatteur présenté comme une qualité, c'est ta crédibilité qui paiera.",
        }),
      },
    ],
  },

  limites: {
    title: "Les défauts",
    speaker: DS,
    line: () => "« Et ses défauts ? Tout le monde en a. »",
    next: "prix",
    choices: [
      {
        id: "lucide",
        requires: "terrain",
        label:
          "« Jeu de tête faible, et il baisse après 70 minutes. Le deuxième se travaille avec votre préparateur physique ; le premier, il faudra faire avec. »",
        effect: () => ({
          trust: 10,
          flags: ["honnete"],
          method: 7,
          lesson: "evaluation",
          reply: "« Ça, c'est une réponse. »",
          feedback:
            "Une évaluation précise : les lacunes, lesquelles sont corrigibles, et comment. C'est ce qui distingue un agent d'un vendeur.",
        }),
      },
      {
        id: "general",
        label: "« Il doit encore progresser physiquement, comme tous les jeunes. »",
        effect: () => ({
          trust: 2,
          method: 4,
          lesson: "evaluation",
          reply: "« Comme tous les jeunes, oui… »",
          feedback:
            "Trop vague. L'avoir vu jouer t'aurait permis d'être précis : jeu de tête faible, baisse de régime après 70 minutes.",
        }),
      },
      {
        id: "aucun",
        label: "« Franchement, je n'en vois pas. »",
        effect: () => ({
          trust: -12,
          flags: ["survente"],
          method: 0,
          lesson: "detection",
          reply: "« Alors vous ne l'avez pas assez regardé. »",
          feedback:
            "Le piège classique : tomber amoureux de son joueur. Un agent qui ne voit aucun défaut n'est plus crédible.",
        }),
      },
    ],
  },

  prix: {
    title: "Le prix",
    speaker: DS,
    line: () => "« Son club en demande 300 000 €. Nous, on peut mettre 150 000. »",
    next: "suite",
    choices: [
      {
        id: "structure",
        requires: "contexte",
        label:
          "« Il lui reste un an de contrat : son club sait qu'il peut le perdre libre l'été prochain. Un milieu de National est parti récemment en Ligue 2 pour 200 000 €. Proposez 150 000 € fixes, 50 000 € de bonus selon les matchs joués et 15 % à la revente : son club peut l'accepter. »",
        effect: () => ({
          trust: 10,
          flags: ["prix"],
          method: 7,
          lesson: "evaluation",
          reply: "« 150 fixes, 50 de bonus, 15 % à la revente… Ça, je peux le défendre devant mon président. »",
          feedback:
            "Tu lis l'horloge du contrat, tu t'appuies sur un comparable, et tu proposes un montage qui rapproche les deux prix. Une valeur défendable, pas une valeur souhaitée.",
        }),
      },
      {
        id: "bonus",
        label: "« On peut rapprocher les positions avec des bonus liés aux matchs joués. »",
        effect: () => ({
          trust: 4,
          method: 5,
          lesson: "negocier-transfert",
          reply: "« Pourquoi pas. Il faudra me chiffrer ça. »",
          feedback:
            "La bonne idée, mais sans chiffres ni arguments. La durée de contrat restante et un comparable récent t'auraient donné du poids.",
        }),
      },
      {
        id: "cher",
        label: "« Il en vaut 500 000, croyez-moi. À ce prix-là, vous faites une affaire. »",
        effect: () => ({
          trust: -10,
          flags: ["survente"],
          method: 0,
          lesson: "evaluation",
          reply: "« 500 000 pour un joueur de National ? On n'est pas sur la même planète. »",
          feedback:
            "Tu confonds la valeur que tu souhaites et la valeur réelle. Le marché ne se trompe pas longtemps, et le directeur sportif non plus.",
        }),
      },
      {
        id: "bluff",
        label: "« Deux clubs de Ligue 1 sont sur lui. Il faut vous décider cette semaine. »",
        effect: () => ({
          end: "rupture",
          method: 0,
          lesson: "techniques-nego",
          replySpeaker: PLUS_TARD,
          reply: "Christophe Aubry appelle deux collègues de Ligue 1 : aucun ne connaît Lucas. « Je n'aime pas qu'on me mente. »",
          feedback:
            "Un faux concurrent, ça se vérifie en deux coups de fil dans un milieu aussi petit. Tu perds le dossier, et la confiance de ce directeur sportif pour longtemps.",
        }),
      },
    ],
  },

  suite: {
    title: "La suite",
    speaker: DS,
    line: () => "« Bon. Je peux venir le voir jouer ? »",
    next: "fin",
    choices: [
      {
        id: "invitation",
        label:
          "« Bien sûr. Samedi, il joue à domicile contre un gros du championnat : je vous place en tribune et je vous envoie le lien du direct si vous ne pouvez pas venir. Je vous donne aussi le numéro de son entraîneur : il vous dira la même chose que moi. »",
        effect: () => ({
          trust: 10,
          flags: ["suite"],
          method: 7,
          lesson: "detection",
          reply: "« Un gros match, et son entraîneur au téléphone. Je viens samedi. »",
          feedback:
            "Tu invites à voir le joueur en vrai, dans un match exigeant, et tu offres une référence indépendante. Tu n'as rien à cacher, et ça se sent.",
        }),
      },
      {
        id: "delai",
        label: "« Oui, mais je veux une réponse écrite avant lundi, sinon je le propose ailleurs. »",
        effect: () => ({
          trust: -2,
          method: 3,
          lesson: "techniques-nego",
          reply: "« Je ne signe pas un joueur que je n'ai pas vu, et encore moins en trois jours. »",
          feedback:
            "Mettre la pression avant même qu'il ait vu le joueur, c'est braquer ton interlocuteur. Laisse-lui le temps de venir.",
        }),
      },
      {
        id: "video",
        label: "« Pas la peine, la vidéo suffit. »",
        effect: () => ({
          trust: -4,
          method: 1,
          lesson: "detection",
          reply: "« Pour moi, non. »",
          feedback:
            "La vidéo complète l'œil, elle ne le remplace pas. Un directeur sportif qui veut voir ton joueur en vrai, c'est une chance, pas une formalité.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "survente", points: 10, text: "Joueur survendu" },
  { flag: "cache", points: 10, text: "Chiffre flatteur présenté sans le contexte" },
];

const GRADES: [number, string][] = [
  [85, "Dénicheur crédible"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function varenneResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const credibilite = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!has(s, "terrain")) {
    missed.push("Aller le voir jouer en vrai, surtout dans un match difficile, pour parler de lui avec des faits.");
  }
  if (!chose(s, "penalties") && s.history.length >= 2) {
    missed.push(
      "Dire toi-même que 4 de ses 7 buts sont des penalties : le directeur sportif le verra de toute façon, et ta franchise te rend crédible.",
    );
  }
  if (!chose(s, "lucide") && s.history.length >= 3) {
    missed.push("Donner ses vraies limites (jeu de tête, fin de match) et comment les travailler.");
  }
  if (!chose(s, "structure") && s.history.length >= 4) {
    missed.push(
      "S'appuyer sur la durée de contrat restante et un comparable récent pour proposer un montage : fixe, bonus, pourcentage à la revente.",
    );
  }
  if (!chose(s, "invitation") && s.history.length >= 5) {
    missed.push("Inviter le directeur sportif à voir un gros match, et lui donner une référence indépendante (son entraîneur).");
  }

  const tiles = [
    { label: "Confiance du directeur sportif", value: `${relation}/40` },
    { label: "Crédibilité", value: `${credibilite}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en crédibilité.`);

  if (s.outcome !== "accord") {
    return {
      outcome: "rupture",
      score: Math.min(30, relation + methode),
      grade: "Crédibilité perdue",
      headline: chose(s, "bluff")
        ? "Personne en Ligue 1 ne connaît Lucas. Christophe Aubry ne reprendra plus tes appels."
        : "« On va s'arrêter là. » Le directeur sportif raccroche.",
      tiles: [...tiles, { label: "Lucas", value: "écarté" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + credibilite + methode));
  const signe = credibilite === 25 && s.trust >= 75 && chose(s, "invitation");
  const headline = signe
    ? chose(s, "structure")
      ? "Christophe Aubry vient voir Lucas samedi. Deux semaines plus tard, Lorval le signe : 150 000 € fixes, 50 000 € de bonus, 15 % à la revente. Et il te rappelle pour un autre profil."
      : "Christophe Aubry vient voir Lucas samedi, et repart convaincu. Reste à trouver le bon prix avec son club."
    : credibilite < 25
      ? "Lorval accepte de regarder Lucas, mais le directeur sportif reste méfiant : il a senti que tu survendais."
      : "Lorval garde Lucas en tête. Rien n'est fait : à toi de relancer avec des faits.";
  return {
    outcome: "accord",
    score,
    grade: gradeFor(score, GRADES),
    headline,
    tiles: [...tiles, { label: "Lucas", value: signe && chose(s, "structure") ? "signé à Lorval" : "sur la liste" }],
    notes,
    missed,
  };
}

export const VARENNE: Scenario = {
  id: "dossier-varenne",
  title: "Le dossier Varenne",
  pitch: "Deux minutes au téléphone pour faire recruter un joueur de National par un club de Ligue 2. Sans survendre.",
  theme: "Vendre un joueur inconnu",
  chapterId: "scouting-evaluation",
  chapters: ["scouting-evaluation"],
  lessons: ["detection", "evaluation", "data-video"],
  intro: {
    heading: "Faire exister un inconnu",
    text: "Lucas Varenne, 21 ans, milieu relayeur de l'AS Brévannes, joue en National. Personne ne le connaît, et c'est ton joueur. Christophe Aubry, directeur sportif du Stade de Lorval (Ligue 2), t'accorde un appel. À toi de le convaincre, avec des faits.",
    stats: [
      { label: "Joueur", value: "Lucas · 21 ans" },
      { label: "Niveau", value: "National" },
      { label: "Au bout du fil", value: "un club de Ligue 2" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Attention : certaines erreurs arrêtent la partie. Personnages et clubs fictifs.",
  },
  preps: [
    {
      id: "terrain",
      title: "Aller le voir jouer",
      detail: "Trois matchs en tribune, dont un à l'extérieur.",
      intel:
        "Tu l'as vu trois fois, dont une défaite 3-0 à l'extérieur : il demande le ballon même quand ça va mal, pressing énorme. Mais son jeu de tête est faible, et il baisse physiquement après 70 minutes.",
    },
    {
      id: "data",
      title: "Monter un dossier data et vidéo",
      detail: "Ses chiffres de la saison, et un montage honnête.",
      intel:
        "Sur 28 matchs : 2,1 passes clés par match (top 3 du National à son poste), 9 passes décisives. Attention : 4 de ses 7 buts sont des penalties. Montage : 12 séquences, dont 3 où il se trompe.",
    },
    {
      id: "contexte",
      title: "Étudier le club acheteur et son contrat",
      detail: "Ce que cherche Lorval, et ce que vaut vraiment Lucas.",
      intel:
        "Lorval joue en 4-3-3 avec un pressing haut et cherche un relayeur ; budget d'environ 150 000 €. Lucas a encore un an de contrat ; son club en demande 300 000 €. Un milieu de National est parti récemment en Ligue 2 pour 200 000 €.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["pitch", "buts", "limites", "prix", "suite"],
  initialVars: {},
  initialTrust: 40,
  ruptureAt: 15,
  trustLabel: "Confiance du directeur sportif",
  endLines: {
    rupture: "Le directeur sportif raccroche.",
    faute: "Le directeur sportif raccroche.",
    accord: "Fin de l'appel. Voyons ce qu'il en retient…",
  },
  panel: (s) => ({
    title: "Le dossier Lucas",
    rows: [
      { label: "Joueur", value: "21 ans · milieu relayeur · National" },
      { label: "Vu en vrai", value: has(s, "terrain") ? "3 matchs" : "non" },
      { label: "Buts", value: has(s, "data") ? "7, dont 4 penalties" : "7" },
      { label: "Contrat", value: has(s, "contexte") ? "1 an restant" : "?" },
      { label: "Survente", value: has(s, "survente") || has(s, "cache") ? "oui ⚠" : "non" },
    ],
    footer: "Des faits, les limites, une valeur défendable.",
  }),
  result: varenneResult,
};
