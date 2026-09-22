// PARZI Academy — Glossaire du métier d'agent (données versionnées).
// Définitions pédagogiques et volontairement concises. Les règles et montants
// précis évoluent (et font parfois l'objet de contentieux) : le glossaire donne
// le sens, pas la valeur réglementaire du jour — toujours vérifier le texte en
// vigueur (FFF / FIFA) avant d'agir.

export type GlossaireTerme = { terme: string; def: string };
export type GlossaireCategorie = { titre: string; termes: GlossaireTerme[] };

export const GLOSSAIRE: GlossaireCategorie[] = [
  {
    titre: "Instances & gouvernance",
    termes: [
      { terme: "FIFA", def: "Instance mondiale du football. Édicte les règles internationales, dont le statut et le transfert des joueurs." },
      { terme: "UEFA", def: "Confédération européenne. Organise les compétitions continentales (Ligue des champions…) et décline les règles à l'échelle européenne." },
      { terme: "FFF", def: "Fédération Française de Football : instance nationale qui réglemente le football en France." },
      { terme: "LFP", def: "Ligue de Football Professionnel : organise la Ligue 1 et la Ligue 2, sous l'égide de la FFF." },
      { terme: "DNCG", def: "Direction Nationale du Contrôle de Gestion : contrôle la santé financière des clubs professionnels français." },
      { terme: "Confédération", def: "Regroupement continental de fédérations (UEFA en Europe, CAF en Afrique, CONMEBOL en Amérique du Sud…)." },
    ],
  },
  {
    titre: "Licence & réglementation",
    termes: [
      { terme: "Licence d'agent", def: "Autorisation officielle d'exercer, obtenue traditionnellement en réussissant un examen." },
      { terme: "Intermédiaire", def: "Terme réglementaire désignant la personne qui représente un joueur ou un club dans une transaction." },
      { terme: "RSTP", def: "« Regulations on the Status and Transfer of Players » (FIFA) : le règlement de référence sur le statut et le transfert des joueurs." },
      { terme: "FFAR", def: "« FIFA Football Agent Regulations » : cadre FIFA des agents (examen, plafonds de commission, enregistrement). Plusieurs dispositions ont été contestées — vérifie ce qui s'applique réellement." },
      { terme: "Registre des agents", def: "Répertoire officiel des agents licenciés, tenu par les fédérations." },
      { terme: "Article 19 (RSTP)", def: "Protection des mineurs : les transferts internationaux de joueurs de moins de 18 ans sont interdits, sauf exceptions strictement définies." },
    ],
  },
  {
    titre: "Mandats & contrats",
    termes: [
      { terme: "Mandat", def: "Contrat par lequel un joueur (ou un club) confie à l'agent le pouvoir de le représenter." },
      { terme: "Mandat exclusif", def: "Mandat où un seul agent représente le joueur sur la période convenue." },
      { terme: "Contrat de travail (joueur pro)", def: "Engage le joueur et le club : durée, salaire, primes, obligations réciproques." },
      { terme: "Clause libératoire", def: "Montant fixé au contrat qui permet de déclencher le départ du joueur (souvent en le « rachetant »)." },
      { terme: "Clause de rachat (buy-back)", def: "Droit, pour le club vendeur, de racheter ultérieurement le joueur à un prix convenu." },
      { terme: "Sell-on (% à la revente)", def: "Part d'un futur transfert reversée au club (ou à l'agent) d'origine." },
      { terme: "Prime à la signature", def: "Somme versée au joueur au moment où il signe." },
      { terme: "Clauses conditionnelles (bonus)", def: "Sommes liées à des objectifs atteints : nombre de matchs, buts, montée, sélection…" },
      { terme: "Droits à l'image", def: "Droits liés à l'exploitation commerciale de l'image du joueur, à cadrer entre joueur, club et sponsors." },
    ],
  },
  {
    titre: "Transferts",
    termes: [
      { terme: "Mercato (fenêtre de transfert)", def: "Période durant laquelle les transferts sont autorisés (été et hiver)." },
      { terme: "Transfert sec", def: "Transfert définitif d'un joueur, sans qu'un autre joueur entre dans l'échange." },
      { terme: "Prêt", def: "Mise à disposition temporaire d'un joueur à un autre club." },
      { terme: "Option d'achat", def: "Droit d'acheter définitivement un joueur à l'issue d'un prêt (parfois « obligatoire » sous conditions)." },
      { terme: "Indemnité de transfert", def: "Somme versée au club vendeur pour libérer le joueur avant la fin de son contrat." },
      { terme: "TMS", def: "« Transfer Matching System » (FIFA) : plateforme qui enregistre et vérifie les transferts internationaux." },
      { terme: "CIT (ITC)", def: "Certificat International de Transfert : document qui autorise l'enregistrement d'un joueur venant d'une autre fédération." },
      { terme: "Indemnité de formation & solidarité", def: "Sommes dues aux clubs ayant formé le joueur, lors de certains transferts." },
      { terme: "Joueur libre", def: "Joueur sans contrat, qui peut signer ailleurs sans indemnité de transfert." },
      { terme: "Arrêt Bosman", def: "Décision européenne de 1995 instaurant la libre circulation des joueurs en fin de contrat au sein de l'UE." },
    ],
  },
  {
    titre: "Détection & évaluation",
    termes: [
      { terme: "Scouting (détection)", def: "Repérage et suivi des joueurs à potentiel." },
      { terme: "Recruteur (scout)", def: "Professionnel chargé d'observer et d'évaluer les joueurs." },
      { terme: "Cellule de recrutement", def: "Service du club dédié à l'identification des cibles." },
      { terme: "Directeur sportif (DS)", def: "Responsable de la stratégie sportive du club et interlocuteur clé de l'agent." },
      { terme: "Data (stats avancées)", def: "Indicateurs chiffrés de performance utilisés pour évaluer un joueur." },
      { terme: "xG (expected goals)", def: "« Buts attendus » : mesure la qualité des occasions créées ou concédées." },
      { terme: "Projection", def: "Estimation du potentiel d'évolution futur d'un joueur, au-delà de son niveau actuel." },
    ],
  },
  {
    titre: "Négociation, business & litiges",
    termes: [
      { terme: "Commission", def: "Rémunération de l'agent, souvent un pourcentage du salaire ou du montant du transfert. Des plafonds existent et évoluent — à vérifier." },
      { terme: "BATNA", def: "« Best Alternative To a Negotiated Agreement » : ta meilleure solution de repli si la négociation échoue." },
      { terme: "Point de rupture", def: "Seuil (prix, conditions) en dessous duquel tu refuses l'accord." },
      { terme: "Ancrage", def: "Technique consistant à poser en premier une référence qui cadre la suite de la négociation." },
      { terme: "Conflit d'intérêts", def: "Situation où l'agent sert des intérêts opposés (ex. joueur et club) sans transparence ni accord — à proscrire." },
      { terme: "DRC (FIFA)", def: "« Dispute Resolution Chamber » : chambre de la FIFA qui tranche les litiges entre clubs, joueurs et parties." },
      { terme: "TAS (CAS)", def: "Tribunal Arbitral du Sport (Lausanne) : instance d'arbitrage et d'appel pour les litiges sportifs internationaux." },
      { terme: "Commissions juridictionnelles (FFF/LFP)", def: "Instances nationales qui traitent les litiges du football professionnel français." },
    ],
  },
];

export const GLOSSAIRE_COUNT = GLOSSAIRE.reduce(
  (n, c) => n + c.termes.length,
  0,
);
