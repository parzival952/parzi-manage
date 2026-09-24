// Mise en situation « Le dossier Benali » — le transfert à l'étranger.
//
// Yanis Benali, 25 ans, défenseur central du Stade Brélaz, reçoit une offre
// d'un club étranger hors UE, Kaya Spor. Brut ou net, éligibilité (quota
// d'étrangers), montage « droits d'image » offshore, contribution de
// solidarité qui change le net du club vendeur, et une clôture de mercato
// dans trois jours. Fidèle aux leçons « Jouer à l'étranger », « La mécanique
// d'un transfert international », « Indemnités de formation & solidarité » et
// « Montages à éviter ». Personnages et clubs FICTIFS.

import { gradeFor, has, methodPoints, type NodeDef, type Result, type Scenario, type SimState } from "../engine";

const YANIS = "Yanis Benali";
const DS = "Murat Demir · directeur sportif de Kaya Spor";
const PRESIDENT = "Le président du Stade Brélaz";
const VENDREDI = "Vendredi, 23 h";

const chose = (s: SimState, id: string) => s.history.some((t) => t.choiceId === id);

const NODES: Record<string, NodeDef> = {
  offre: {
    title: "L'offre",
    speaker: DS,
    line: () => "« Nous offrons 2 millions d'euros par an à Yanis, sur trois ans. C'est une offre exceptionnelle. Il faut signer avant vendredi. »",
    next: "eligibilite",
    choices: [
      {
        id: "net",
        requires: "fiscal",
        label:
          "« Merci. Avant d'aller plus loin : 2 millions brut ou net ? Nous voulons un salaire net garanti en euros, versé chaque mois, et une clause qui protège Yanis en cas de retard de paiement. »",
        effect: () => ({
          trust: 8,
          flags: ["net"],
          method: 7,
          lesson: "clauses-cles",
          reply: "« …C'est du brut. Pour un net garanti, je dois consulter mon président. »",
          feedback:
            "La question qui change tout. À l'étranger, un salaire s'annonce souvent en brut, et l'impôt local peut être lourd. Un net garanti et une clause en cas d'impayé protègent Yanis.",
        }),
      },
      {
        id: "ecrit",
        label: "« Pouvez-vous nous envoyer l'offre par écrit, avec le détail : brut, net, primes, avantages ? »",
        effect: () => ({
          trust: 3,
          method: 5,
          lesson: "clauses-cles",
          reply: "« Bien sûr, ce soir. »",
          feedback:
            "Bon réflexe : une offre se juge par écrit. En connaissant la fiscalité locale et les risques d'impayés, tu aurais pu exiger tout de suite un net garanti.",
        }),
      },
      {
        id: "accepter",
        label: "« 2 millions ? Excellent, on signe ! »",
        effect: () => ({
          trust: 5,
          flags: ["brut"],
          method: 1,
          lesson: "clauses-cles",
          reply: "« Parfait. Je prépare le contrat. »",
          feedback:
            "Tu acceptes sans savoir si c'est du brut ou du net, ni ce qui se passe si le club paie en retard. Yanis risque une mauvaise surprise sur sa fiche de paie.",
        }),
      },
      {
        id: "bluff",
        label: "« 2 millions ? Un autre club nous en offre le double. »",
        effect: () => ({
          end: "rupture",
          method: 0,
          lesson: "techniques-nego",
          reply: "« Alors qu'il signe là-bas. » Kaya Spor retire son offre dans l'heure.",
          feedback:
            "Un bluff sans offre réelle derrière, à trois jours de la clôture : le club n'a aucune raison d'attendre. Tu perds la seule offre sur la table.",
        }),
      },
    ],
  },

  eligibilite: {
    title: "Le quota",
    speaker: YANIS,
    line: () => "« Tu crois que je pourrai jouer là-bas dès la première journée ? »",
    next: "montage",
    choices: [
      {
        id: "quota",
        requires: "admin",
        label:
          "« Pas encore sûr : la ligue limite le nombre de joueurs étrangers, et Kaya en a déjà 13 sur 14 autorisés. J'ai demandé au club de nous confirmer par écrit qu'il y a une place pour toi avant toute signature. »",
        effect: () => ({
          trust: 10,
          flags: ["eligible"],
          method: 7,
          lesson: "jouer-a-letranger",
          reply: "« Je n'y avais même pas pensé. Heureusement que tu vérifies. »",
          feedback:
            "L'éligibilité d'abord : un transfert parfait sur le papier ne vaut rien si le joueur ne peut pas être enregistré. Tu as vérifié avant de promettre.",
        }),
      },
      {
        id: "verifier",
        label: "« Je vérifie les règles d'éligibilité de la ligue pour cette saison avant de te répondre. »",
        effect: () => ({
          trust: 4,
          flags: ["eligible"],
          method: 6,
          lesson: "jouer-a-letranger",
          reply: "« OK, tiens-moi au courant. »",
          feedback:
            "Juste : on ne promet rien avant d'avoir vérifié. L'avoir préparé en amont t'aurait donné la réponse tout de suite, avec le quota exact.",
        }),
      },
      {
        id: "promettre",
        label: "« Évidemment ! Avec ton niveau, aucun souci. »",
        effect: () => ({
          trust: 6,
          flags: ["promesse"],
          method: 0,
          lesson: "jouer-a-letranger",
          reply: "« Top, je le dis à ma femme ! »",
          feedback:
            "Le niveau sportif ne dit rien de l'éligibilité administrative. Hors UE, quotas et permis décident : promettre sans vérifier, c'est s'exposer à une humiliation.",
        }),
      },
    ],
  },

  montage: {
    title: "Le montage",
    speaker: DS,
    line: () =>
      "« Pour que Yanis paie moins d'impôts, on vous propose : 1,2 million en salaire officiel, et 800 000 € versés par une société à Malte, au titre de ses « droits d'image ». Tout le monde fait ça. »",
    next: "indemnite",
    choices: [
      {
        id: "refus-montage",
        requires: "fiscal",
        label:
          "« Non. Un contrat d'image doit correspondre à une vraie exploitation de l'image de Yanis et être déclaré. Là, c'est un salaire déguisé. Tout sera dans le contrat officiel, déclaré, ou il n'y aura pas d'accord. »",
        effect: () => ({
          trust: 6,
          flags: ["propre"],
          method: 7,
          lesson: "montages-a-eviter",
          reply: "« …Très bien. Tout dans le contrat, alors. »",
          feedback:
            "Tu reconnais le montage et tu expliques pourquoi il est dangereux. Si ça doit rester caché, on ne le fait pas : c'est Yanis qui paierait le redressement.",
        }),
      },
      {
        id: "avocat",
        label: "« Je ne signe rien de ce type sans l'avis d'un avocat fiscaliste. Pour l'instant, c'est non. »",
        effect: () => ({
          trust: 3,
          flags: ["propre"],
          method: 6,
          lesson: "montages-a-eviter",
          reply: "« Comme vous voulez. »",
          feedback:
            "Prudent et juste. En connaissant les règles, tu aurais pu dire tout de suite pourquoi ce montage ne tient pas : pas d'exploitation réelle de l'image, pas de contrat d'image.",
        }),
      },
      {
        id: "accepter-montage",
        label: "« Parfait. Moins on déclare, mieux c'est pour tout le monde. »",
        effect: () => ({
          end: "faute",
          method: 0,
          lesson: "montages-a-eviter",
          reply: "« Je savais qu'on s'entendrait. » Le contrat parallèle est signé le soir même.",
          feedback:
            "Faute grave : un salaire déguisé versé par une société offshore, c'est un montage frauduleux. Au premier contrôle, Yanis subit un redressement, et tu risques ta licence.",
        }),
      },
    ],
  },

  indemnite: {
    title: "Le prix",
    speaker: PRESIDENT,
    line: () => "« Kaya propose 5 millions pour Yanis. Nous, on veut 5 millions nets dans nos caisses. Pas un centime de moins. »",
    next: "cloture",
    choices: [
      {
        id: "solidarite",
        requires: "formation",
        label:
          "« Attention : Yanis a été formé à l'AS Carvin, pas chez vous. Sur un transfert international, environ 5 % de l'indemnité reviennent aux clubs formateurs, au titre de la solidarité. Sur 5 millions, vous toucherez donc un peu moins. Pour 5 millions nets, il faudrait que Kaya monte à environ 5,26 millions, ou compense avec des bonus. »",
        effect: () => ({
          trust: 6,
          flags: ["net-vendeur"],
          method: 7,
          lesson: "formation-solidarite",
          reply: "« Je n'avais pas fait le calcul. Merci de le dire maintenant, pas après. »",
          feedback:
            "Tu anticipes la contribution de solidarité : le prix affiché n'est pas ce que le club encaisse. Le dire avant évite une crise au moment de signer.",
        }),
      },
      {
        id: "bonus",
        label: "« On peut combler l'écart avec des bonus : matchs joués, qualification européenne. »",
        effect: () => ({
          trust: 3,
          method: 5,
          lesson: "negocier-transfert",
          reply: "« Pourquoi pas. Faites une proposition. »",
          feedback:
            "Bonne idée pour débloquer un prix figé. Mais le club croit encore toucher 5 millions : il manque la contribution de solidarité dans ton calcul.",
        }),
      },
      {
        id: "ignorer",
        label: "« 5 millions, c'est 5 millions. Je dis à Kaya que vous acceptez. »",
        effect: () => ({
          trust: 0,
          flags: ["surprise"],
          method: 1,
          lesson: "formation-solidarite",
          reply: "« Parfait. »",
          feedback:
            "Le club croit encaisser 5 millions. Quand la contribution de solidarité sera retenue, il découvrira un net plus faible, au pire moment de la signature.",
        }),
      },
    ],
  },

  cloture: {
    title: "La clôture",
    speaker: YANIS,
    line: () => "« Tout le monde est d'accord. Le mercato ferme vendredi à minuit. On fait quoi maintenant ? »",
    next: "fin",
    choices: [
      {
        id: "dossier",
        requires: "admin",
        label:
          "« On boucle aujourd'hui : passeport, contrat, visite médicale. Je relance les deux clubs pour qu'ils saisissent le transfert dans le TMS dès mercredi, et on suit le certificat international de transfert. Tant que tout n'est pas validé, on n'annonce rien. »",
        effect: () => ({
          trust: 12,
          flags: ["boucle"],
          method: 7,
          lesson: "mecanique-transfert-int",
          reply: "« Mercredi, pas vendredi. Je comprends mieux pourquoi. »",
          feedback:
            "Tu anticipes la mécanique : TMS, certificat international de transfert, documents prêts 48 h avant. Tant que tout n'est pas validé, rien n'est fait.",
        }),
      },
      {
        id: "relance",
        label: "« Je relance les clubs jeudi pour qu'ils finalisent. »",
        effect: () => ({
          trust: 2,
          method: 4,
          lesson: "mecanique-transfert-int",
          reply: "« Jeudi ? C'est pas un peu juste ? »",
          feedback:
            "Ça passe, de justesse. Un document manquant ou un certificat en retard, et le transfert meurt à minuit. Le pro boucle tout 48 h avant la clôture.",
        }),
      },
      {
        id: "annoncer",
        label: "« C'est fait ! Tu peux l'annoncer sur tes réseaux. »",
        effect: () => ({
          end: "rupture",
          method: 0,
          lesson: "mecanique-transfert-int",
          replySpeaker: VENDREDI,
          reply: "Un document manque dans le TMS, le certificat de transfert n'arrive pas. Minuit : le mercato ferme. Yanis reste à Brélaz, et tout le monde a vu son annonce.",
          feedback:
            "« Accord trouvé » ne veut pas dire « joueur qualifié ». Tant que le TMS n'est pas bouclé et le certificat validé, rien n'est fait, et on n'annonce rien.",
        }),
      },
    ],
  },
};

const PENALTIES: { flag: string; points: number; text: string }[] = [
  { flag: "brut", points: 10, text: "Offre acceptée sans vérifier brut, net et garanties" },
  { flag: "promesse", points: 10, text: "Éligibilité promise sans vérification" },
  { flag: "surprise", points: 5, text: "Contribution de solidarité oubliée" },
];

const GRADES: [number, string][] = [
  [85, "Agent international"],
  [70, "Solide, encore quelques réflexes à prendre"],
  [50, "À affiner"],
  [0, "À revoir"],
];

function benaliResult(s: SimState): Result {
  const methode = methodPoints(s);
  const relation = Math.round((s.trust / 100) * 40);
  const applied = PENALTIES.filter((p) => has(s, p.flag));
  const rigueur = Math.max(0, 25 - applied.reduce((sum, p) => sum + p.points, 0));

  const missed: string[] = [];
  if (!chose(s, "net")) {
    missed.push("Demander si l'offre est brute ou nette, puis exiger un net garanti en euros avec une clause en cas de retard de paiement.");
  }
  if (!has(s, "eligible") && s.history.length >= 2) {
    missed.push("Vérifier l'éligibilité (quota de joueurs étrangers) avant de promettre quoi que ce soit à Yanis.");
  }
  if (!chose(s, "solidarite") && s.history.length >= 4) {
    missed.push(
      "Anticiper la contribution de solidarité (environ 5 % pour les clubs formateurs) : le club vendeur touche moins que le prix affiché.",
    );
  }
  if (!chose(s, "dossier") && s.history.length >= 5) {
    missed.push("Boucler les documents 48 h avant la clôture (TMS, certificat international de transfert), et ne rien annoncer avant.");
  }

  const tiles = [
    { label: "Confiance de Yanis", value: `${relation}/40` },
    { label: "Rigueur", value: `${rigueur}/25` },
    { label: "Méthode", value: `${methode}/35` },
  ];
  const notes = applied.map((p) => `${p.text} : -${p.points} en rigueur.`);

  if (s.outcome === "faute") {
    return {
      outcome: "faute",
      score: Math.min(15, methode),
      grade: "Faute grave",
      headline:
        "Salaire déguisé, société offshore, droits d'image fictifs : c'est un montage frauduleux. Au premier contrôle, Yanis subit un redressement, et tu risques ta licence.",
      tiles: [
        { label: "Confiance de Yanis", value: "—" },
        { label: "Rigueur", value: "0/25" },
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
      grade: "Transfert raté",
      headline: chose(s, "bluff")
        ? "Kaya Spor retire son offre : le bluff n'a pas pris. Yanis reste à Brélaz."
        : "Minuit, le mercato ferme sans que le transfert soit enregistré. Yanis reste à Brélaz, après l'avoir annoncé à tout le monde.",
      tiles: [...tiles, { label: "Transfert", value: "raté" }],
      notes,
      missed,
    };
  }

  const score = Math.max(0, Math.min(100, relation + rigueur + methode));
  const headline =
    rigueur === 25 && s.trust >= 80
      ? "Yanis signe à Kaya Spor avec un net garanti en euros. Tout est déclaré et enregistré à temps : premier match dans dix jours."
      : has(s, "brut")
        ? "Yanis signe, puis découvre sa première fiche de paie : les « 2 millions » étaient bruts."
        : "Yanis signe à Kaya Spor. Quelques réglages auraient rendu le dossier irréprochable.";
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

export const BENALI: Scenario = {
  id: "dossier-benali",
  title: "Le dossier Benali",
  pitch: "Un club étranger veut ton défenseur, et le mercato ferme vendredi. Brut ou net, quota, montage fiscal, prix réel : tout se joue en trois jours.",
  theme: "Transfert à l'étranger",
  chapterId: "transferts-internationaux",
  chapters: ["transferts-internationaux"],
  lessons: ["jouer-a-letranger", "mecanique-transfert-int", "formation-solidarite"],
  intro: {
    heading: "Trois jours pour un transfert",
    text: "Yanis Benali, 25 ans, défenseur central du Stade Brélaz, est courtisé par Kaya Spor, un club étranger hors Union européenne. L'offre est belle, le mercato ferme vendredi à minuit, et tout le monde veut aller vite. À toi de faire en sorte que ce transfert soit bon pour Yanis, et qu'il aille au bout.",
    stats: [
      { label: "Joueur", value: "Yanis · 25 ans" },
      { label: "Club intéressé", value: "Kaya Spor (hors UE)" },
      { label: "Clôture", value: "vendredi minuit" },
    ],
    note: "5 moments clés, 3 ou 4 réponses possibles à chaque fois. Attention : certaines erreurs arrêtent la partie. Personnages et clubs fictifs.",
  },
  preps: [
    {
      id: "fiscal",
      title: "Faire le point fiscal et contractuel",
      detail: "Comprendre ce que Yanis toucherait vraiment là-bas.",
      intel:
        "Là-bas, les offres s'annoncent souvent en brut, et l'impôt local est élevé. Des retards de salaire ont été signalés dans cette ligue : il faut un net garanti et une clause en cas d'impayé. Un « contrat d'image » sans vraie exploitation de l'image, c'est un salaire déguisé.",
    },
    {
      id: "admin",
      title: "Préparer le dossier administratif",
      detail: "Éligibilité, documents et calendrier du transfert.",
      intel:
        "La ligue limite le nombre de joueurs étrangers : Kaya en a déjà 13 sur 14 autorisés. Le transfert passera par le TMS de la FIFA et un certificat international de transfert : passeport, contrat et visite médicale doivent être prêts 48 h avant la clôture.",
    },
    {
      id: "formation",
      title: "Retracer la formation de Yanis",
      detail: "Savoir quels clubs l'ont formé, et ce que ça change.",
      intel:
        "Yanis a été formé à l'AS Carvin, de 12 à 23 ans. Il n'est arrivé au Stade Brélaz que l'été dernier, à 24 ans. Sur un transfert international, environ 5 % de l'indemnité reviennent aux clubs formateurs (contribution de solidarité) : le club vendeur touche moins que le prix affiché.",
    },
  ],
  prepCount: 2,
  nodes: NODES,
  order: ["offre", "eligibilite", "montage", "indemnite", "cloture"],
  initialVars: {},
  initialTrust: 50,
  ruptureAt: 20,
  trustLabel: "Confiance de Yanis",
  endLines: {
    rupture: "Le transfert tombe à l'eau.",
    faute: "Faute grave. Le dossier est compromis.",
    accord: "Les deux clubs sont d'accord. Voyons ce que vaut ce transfert…",
  },
  panel: (s) => ({
    title: "Le dossier Yanis",
    rows: [
      {
        label: "Salaire",
        value: has(s, "net") ? "net garanti en € (demandé)" : has(s, "brut") ? "2 M€ brut ⚠" : "2 M€ (brut ? net ?)",
      },
      { label: "Quota étrangers", value: has(s, "admin") ? "13/14 occupés" : "?" },
      { label: "Montage offshore", value: has(s, "propre") ? "refusé" : "—" },
      { label: "Net du club vendeur", value: has(s, "net-vendeur") ? "≈ 4,75 M€ sur 5 M€" : "—" },
      { label: "Clôture", value: "vendredi minuit" },
    ],
    footer: "Vérifier avant de promettre. Déclarer, toujours.",
  }),
  result: benaliResult,
};
