// PARZI Academy — Fiches & modèles COMMENTÉS (données versionnées).
// But pédagogique : montrer la structure d'un mandat et les points clés d'un
// contrat, avec, pour chaque élément, « pourquoi ça compte » et « ce qu'il faut
// vérifier ». Ce ne sont PAS des documents juridiques prêts à l'emploi : à
// adapter au droit applicable et aux règlements en vigueur, et à faire valider
// par un juriste. Les montants/plafonds évoluent — vérifier le texte du jour.

export type ModeleSection = { clause: string; commentaire: string };
export type Modele = {
  id: string;
  titre: string;
  sousTitre: string;
  intro: string;
  sections: ModeleSection[];
};

export const MODELES: Modele[] = [
  {
    id: "mandat",
    titre: "Modèle de mandat de représentation",
    sousTitre: "La structure d'un mandat, clause par clause",
    intro:
      "Le mandat est le socle de ta relation avec le joueur : pas de mandat écrit, pas de mission — ni de commission. Voici les rubriques à ne jamais oublier.",
    sections: [
      { clause: "Parties", commentaire: "Identifie précisément le joueur et l'agent licencié. Si le joueur est mineur, le représentant légal doit être partie au mandat — c'est obligatoire et protecteur." },
      { clause: "Objet du mandat", commentaire: "Définis le périmètre exact : recherche de club, négociation d'un contrat, renégociation, gestion d'image ? Un objet flou crée les litiges." },
      { clause: "Exclusivité", commentaire: "Exclusif ou non. L'exclusivité protège ton travail, mais engage le joueur : sois transparent sur ce qu'elle implique." },
      { clause: "Durée", commentaire: "Durée déterminée (souvent plafonnée par les règlements). Évite toute reconduction tacite abusive ; vérifie la durée maximale en vigueur." },
      { clause: "Rémunération / commission", commentaire: "Base de calcul, pourcentage, qui paie (joueur ou club) et échéancier. Vérifie le plafond applicable — il est mouvant et parfois contesté." },
      { clause: "Obligations de l'agent", commentaire: "Diligence, information régulière, transparence. Un reporting clair renforce la confiance et te protège en cas de contestation." },
      { clause: "Confidentialité", commentaire: "Protège les informations sensibles (salaires, intentions, contacts). Utile pour le joueur comme pour toi." },
      { clause: "Résiliation", commentaire: "Conditions et préavis de sortie. Prévoir une fin propre évite les conflits — et le fait de ne pas être payé pour un travail déjà accompli." },
      { clause: "Droit applicable & litiges", commentaire: "Précise la juridiction et les instances compétentes (commissions fédérales, arbitrage). En cas de désaccord, tu sais où aller." },
      { clause: "Date & signatures", commentaire: "Daté et signé par toutes les parties (et le représentant légal pour un mineur). Un mandat non signé ne vaut rien." },
    ],
  },
  {
    id: "contrat",
    titre: "Contrat du joueur — points clés à vérifier",
    sousTitre: "La checklist de lecture avant de signer",
    intro:
      "Le contrat de travail est rédigé côté club : ton rôle est de le lire ligne par ligne et de défendre ton joueur. Le salaire brut affiché n'est qu'une partie de l'histoire.",
    sections: [
      { clause: "Durée & dates", commentaire: "Début, fin, cohérence avec le projet de carrière. Une durée trop longue enferme, trop courte fragilise." },
      { clause: "Salaire & structure", commentaire: "Brut/net, évolution annuelle, part fixe/variable. Compare à la réalité du marché et du club." },
      { clause: "Primes & bonus conditionnels", commentaire: "Définis clairement les déclencheurs (matchs joués, buts, maintien, montée, sélection). Un bonus flou ne se paie jamais." },
      { clause: "Clause libératoire", commentaire: "Montant, fenêtres d'activation, à qui elle profite. C'est un levier majeur de départ : négocie-la, ne la subis pas." },
      { clause: "Intéressement à la revente (sell-on)", commentaire: "Pourcentage et assiette (sur le net vendeur ?). Peut valoir plus que la commission initiale." },
      { clause: "Droits à l'image", commentaire: "Répartition entre club et joueur, périmètre d'exploitation. À cadrer tôt, surtout pour un joueur qui monte." },
      { clause: "Avantages (logement, véhicule…)", commentaire: "À chiffrer : ils font partie de la rémunération réelle." },
      { clause: "Clauses défavorables", commentaire: "Traque les baisses de salaire automatiques (relégation), pénalités disproportionnées, engagements déséquilibrés. Repère-les et renégocie." },
      { clause: "Assurances & blessures", commentaire: "Que se passe-t-il en cas de blessure longue ? La protection du joueur doit être explicite." },
      { clause: "Résiliation & discipline", commentaire: "Motifs de rupture, conséquences financières. Anticipe les scénarios de sortie." },
    ],
  },
];
