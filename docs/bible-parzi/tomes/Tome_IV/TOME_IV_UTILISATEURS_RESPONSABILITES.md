# TOME IV — Utilisateurs, rôles et responsabilités

## Cartouche documentaire

| Champ | Valeur |
|---|---|
| Statut | Dossier maître archivé après validation constitutionnelle |
| Version | 0.2 |
| Date | 23 juillet 2026 |
| Sujet | Agents, aspirants, joueurs, clubs, équipes et fonctions de confiance |
| Produits concernés | PARZI Manage ; PARZI Academy ; PARZI Player ; PARZI Club ; PARZI ID |
| Dépendances | Tomes I, II et III — versions 1.0 |
| Autorité supérieure | Tomes LXXVI et LXXVII pour l’état audité et les remédiations |
| Contre-audit | Rapport indépendant du 23 juillet 2026 intégré avec vérification locale |
| Autorité active | Constitution centrale et registre des décisions du Tome IV v1.0 |
| Validation fondatrice | Recommandations CTO amendées approuvées le 23 juillet 2026 |
| Effet applicatif | Aucun sans décision, ticket et autorisation séparés |

## 1. Note d’intégrité

Le document historique autonome correspondant au Tome IV n’a pas été retrouvé. Le présent tome est une reconstruction fondée sur :

- la Bible PARZI maître ;
- la synthèse reconstruite des Tomes I à LXXV ;
- le Playbook PARZI Manage ;
- les notes historiques « Agents sans joueurs » et « Côté joueurs & réputation » ;
- l’Arbre de l’univers PARZI ;
- les décisions non négociables ;
- les Constitutions et registres validés des Tomes I à III ;
- le code et les migrations présents sur la branche de travail ;
- les constats des Tomes LXXVI et LXXVII.

Quatre niveaux de contenu sont distingués :

- **[SOURCE]** : contenu explicitement retrouvé ;
- **[DÉCISION ANTÉRIEURE]** : règle déjà validée dans les Tomes I à III ;
- **[ÉTAT RÉEL]** : capacité ou limite observable dans le dépôt local ;
- **[PROPOSITION CTO]** : recommandation nouvelle soumise au fondateur.

Le Tome IV définit qui PARZI sert et sous quelles responsabilités. Il ne prouve pas que chaque rôle, espace ou permission est déjà construit.

### 1.1 Carte de provenance

| Source retrouvée | Élément retenu | Limite conservée |
|---|---|---|
| Bible PARZI maître | Agent licencié, aspirant, joueur, club et vérificateur ; séparation des produits | Document consolidé, pas preuve d’usage par tous ces publics |
| Synthèse I–LXXV | Agent comme point d’entrée ; profils, sécurité et permissions comme blocs futurs | Synthèse reconstruite, pas tome original autonome |
| Playbook PARZI Manage | Besoins de l’agent, réseau de contacts et liste historique d’utilisateurs | Vision large sous l’ancien nom ; aucune ouverture de rôle prouvée |
| Vision — Agents sans joueurs | Douleur du premier portefeuille et besoin de crédibilité | Hypothèses marché et données à valider ; aucune promesse de mandat |
| Vision — Côté joueurs & réputation | Inscription volontaire, visibilité contrôlée et confiance objective d’abord | Alerte juridique explicite ; le consentement seul ne règle pas toute conformité |
| Arbre de l’univers PARZI | Propriété fonctionnelle de Manage, ID, Player, Club et Network | Architecture cible, pas disponibilité actuelle |
| Tomes I à III validés | Personne souveraine, agent francophone d’entrée, preuve, autorité humaine et marque honnête | Règles supérieures ; détails utilisateurs délégués au Tome IV |
| Code et migrations de la branche | Compte, profil, parcours, propriété individuelle et vérification provisoire | État local de travail, pas preuve de déploiement ni modèle final |

## 2. Question du Tome IV

Le Tome I fixe pourquoi PARZI doit exister. Le Tome II fixe l’amélioration recherchée. Le Tome III fixe la marque qui porte cette promesse.

Le Tome IV répond à la question :

> **Qui peut utiliser PARZI, au nom de qui, dans quel contexte, avec quelle autorité et sous quelle responsabilité ?**

Cette question précède les parcours détaillés. Sans elle, un produit mondial devient rapidement une accumulation de comptes, de badges et de boutons dont personne ne peut expliquer les droits réels.

## 3. Thèse centrale

**[PROPOSITION CTO]** PARZI ne doit pas réduire un utilisateur à un e-mail ou à un intitulé de rôle. Le modèle durable sépare au minimum :

1. la personne ;
2. son compte d’accès ;
3. ses affirmations d’identité ou de titre ;
4. les vérifications portant sur ces affirmations ;
5. ses appartenances à des organisations ;
6. ses relations avec d’autres acteurs ;
7. les consentements applicables ;
8. l’autorisation précise d’effectuer une action ;
9. la preuve de ce qui a été décidé ou exécuté.

Une même personne peut être aspirante aujourd’hui, agent licencié demain, membre de plusieurs structures, responsable d’un joueur dans un contexte et simple observatrice dans un autre. Les droits ne doivent donc jamais être déduits d’une étiquette permanente et globale.

## 4. Vocabulaire normatif

| Terme | Définition proposée | Ce que le terme ne signifie pas |
|---|---|---|
| Personne | Être humain concerné par une action ou une donnée | Compte technique ou organisation |
| Compte | Moyen d’authentification rattaché à une personne ou à un service autorisé | Preuve automatique d’identité ou de profession |
| Organisation | Entité structurée : agence, club, académie ou partenaire | Personne unique ou compte partagé |
| Rôle | Fonction exercée dans un contexte défini | Droit universel et permanent |
| Titre professionnel | Affirmation réglementée ou reconnue par une autorité | Badge marketing général |
| Vérification | Contrôle daté d’un objet précis selon une méthode et une source | Approbation globale de la personne |
| Appartenance | Lien entre une personne et une organisation, avec durée et statut | Propriété de toutes les données de l’organisation |
| Relation | Lien métier entre acteurs : mandat, emploi, contact, représentation ou collaboration | Consentement implicite à tout partage |
| Consentement | Autorisation libre, compréhensible, finalisée, prouvable et retirable lorsque applicable | Acceptation générale et irréversible |
| Permission | Autorisation de réaliser une action sur une ressource dans un contexte | Visibilité d’un bouton dans l’interface |
| Responsabilité | Obligation humaine ou organisationnelle attachée à une décision | Simple capacité technique |
| Sujet de données | Personne à laquelle des données se rapportent | Utilisateur forcément connecté |
| Délégation | Autorité limitée transmise par un acteur habilité | Transfert définitif ou pouvoir illimité |

## 5. Vérité actuelle du produit

### 5.1 Ce qui existe localement

**[ÉTAT RÉEL]** Le produit local dispose notamment :

- d’une authentification par compte Supabase ;
- d’un profil rattaché à un `user_id` ;
- d’un choix d’entrée `agent` ou `aspirant` ;
- d’états de vérification agent `none`, `pending`, `verified` et `rejected` ;
- d’un portefeuille et de données métier isolés par propriétaire individuel `user_id` ;
- d’une console de vérification administrative provisoire ;
- de contrôles serveur en cours de durcissement dans le chantier R-001 à R-030.

### 5.2 Ce qui n’existe pas encore comme domaine complet

**[ÉTAT RÉEL]** Le dépôt ne contient pas encore de modèle durable pour :

- les workspaces d’agence ;
- les membres et rôles d’équipe persistants ;
- les comptes joueurs ;
- les comptes clubs et leurs membres ;
- les représentants légaux de mineurs ;
- les consentements et délégations relationnelles ;
- un RBAC persistant et audité ;
- la séparation complète des fonctions de vérification ;
- les partages temporaires entre organisations ;
- la réputation relationnelle vérifiée.

Les tables `players` et `clubs` représentent aujourd’hui des dossiers appartenant à un utilisateur. Elles ne prouvent pas que le joueur ou le club concerné possède un compte, a consenti au contenu ou peut le corriger.

Le formulaire joueur local accepte un âge minimal de 15 ans, tandis que le schéma ne porte ni représentant légal ni politique dédiée aux mineurs. Ce constat prouve une capacité de saisie à risque, pas l’existence de données réelles de mineurs en production.

### 5.3 Conséquence documentaire

La Bible décrit un univers plus large que le produit actuel. Le Tome IV doit donc afficher trois statuts sans ambiguïté :

| Statut | Sens |
|---|---|
| Acteur d’entrée | Public effectivement prioritaire pour le produit pilote |
| Rôle spécialisé | Fonction nécessaire à l’exploitation mais non assimilée à un public commercial |
| Acteur futur | Public documenté, dont le produit ou l’accès n’est pas encore autorisé |

## 6. Carte des acteurs

| Acteur | Statut actuel proposé | Besoin principal | Produit propriétaire | Risque majeur |
|---|---|---|---|---|
| Agent de football francophone | Acteur d’entrée | Organiser portefeuille, relations, échéances et décisions | PARZI Manage | Lui donner une autorité non prouvée ou exposer ses données |
| Aspirant agent | Acteur d’entrée limité | Apprendre, pratiquer et préparer un parcours | PARZI Academy | Confondre formation PARZI et droit d’exercer |
| Vérificateur | Rôle spécialisé | Contrôler une affirmation et tracer la décision | PARZI ID | Pouvoir excessif, conflit d’intérêts ou preuve insuffisante |
| Administrateur de plateforme | Rôle spécialisé | Exploiter et sécuriser la plateforme | Socle transversal | Accès global permanent et non audité |
| Joueur représenté | Sujet de données ; acteur futur | Contrôler son dossier, ses partages et ses objectifs | PARZI Player | Être traité comme un objet sans recours |
| Joueur sans agent | Acteur futur | Structurer son parcours et choisir sa visibilité | PARZI Player | Promesse de carrière, spam ou matching juridiquement risqué |
| Représentant légal | Acteur futur protégé | Autoriser et surveiller les usages concernant un mineur | PARZI Player / ID | Consentement inadéquat ou contourné |
| Club | Organisation future | Déclarer des besoins et gérer des relations autorisées | PARZI Club | Confondre dossier CRM et espace officiel du club |
| Membre d’un club | Acteur futur | Agir au nom d’un club selon sa fonction | PARZI Club / ID | Compte partagé ou représentation non vérifiée |
| Agence | Organisation future | Partager un contexte de travail gouverné | PARZI Manage | Dilution de responsabilité et fuite entre portefeuilles |
| Membre d’agence | Acteur futur proche | Collaborer avec un périmètre précis | PARZI Manage | Rôle trop large ou accès conservé après départ |
| Scout ou analyste externe | Collaborateur futur | Contribuer à un dossier limité | Manage / Detection | Accès latéral à des données inutiles |
| Fédération, autorité, fournisseur | Partie prenante externe | Fournir ou confirmer une source selon accord | ID / Data | Présenter une intégration ou approbation inexistante |

## 7. L’agent comme utilisateur d’entrée

**[SOURCE]** Le Playbook place l’agent sportif au centre de PARZI Manage. Les Tomes I à III ont ensuite validé l’agent de football francophone comme utilisateur d’entrée.

**[PROPOSITION CTO]** Le terme `agent` doit être segmenté sans créer des classes sociales figées.

| Segment | Situation | Travail à accomplir | Besoin distinct | Limite à préserver |
|---|---|---|---|---|
| Aspirant | Prépare le métier ou l’examen | Apprendre et s’exercer | Parcours pédagogique, cas et repères | Aucun droit professionnel implicite |
| Nouvel agent sans joueur | Licence obtenue, portefeuille vide | Construire une méthode et qualifier de premières pistes | Scouting réaliste, préparation, crédibilité opérationnelle | Aucune promesse de mandat ou d’accès privilégié |
| Agent indépendant actif | Portefeuille existant | Centraliser et anticiper | Cockpit individuel fiable | Ne pas lui imposer un modèle d’agence |
| Agent établi | Volume et réseau plus importants | Prioriser, déléguer et suivre | Automatisation contrôlée et collaboration | Ne pas confondre volume et autorité |
| Dirigeant d’agence | Responsabilité d’organisation | Gouverner équipe, portefeuilles et risques | Workspace, délégations et audit | Ne pas voir toutes les données par défaut |
| Agent membre d’agence | Agit au sein d’une structure | Collaborer sur un périmètre attribué | Accès par mission, mandat ou équipe | Préserver ses responsabilités personnelles |

Ces segments orientent la recherche et l’expérience. Ils ne doivent pas devenir des scores de valeur, des badges hiérarchiques ou des permissions automatiques.

Un segment de recherche ne produit jamais un rôle de workspace. La correspondance entre une personne, un rôle et une permission est attribuée explicitement et peut être révoquée.

## 8. L’aspirant agent

**[SOURCE]** La Bible maître distingue l’aspirant, qui apprend et prépare le métier, de l’agent dont le titre est vérifié.

**[PROPOSITION CTO]** L’aspirant doit pouvoir :

- utiliser Academy ;
- comprendre les règles et leurs limites ;
- pratiquer sur des cas fictifs identifiés ;
- conserver une progression privée ;
- préparer une future demande de vérification ;
- accéder à des outils génériques ne constituant pas un exercice réservé.

Il ne doit pas pouvoir, du seul fait de son inscription :

- apparaître comme agent vérifié ;
- agir au nom d’un joueur ;
- obtenir des coordonnées protégées ;
- recevoir une introduction payante ;
- utiliser une attestation PARZI comme droit d’exercer ;
- contourner un contrôle en choisissant le parcours `agent`.

Le choix d’onboarding actuel est une préférence de parcours. Il ne doit pas devenir la source de vérité d’un titre professionnel.

## 9. Le joueur

### 9.1 Sujet de données avant d’être utilisateur

**[PROPOSITION CTO]** Un joueur existe dans le système comme sujet de données avant de posséder éventuellement un compte. Cette distinction impose :

- une provenance pour les données ;
- une base ou autorisation de traitement adaptée ;
- un responsable du dossier ;
- des mécanismes de correction et de contestation ;
- des règles de visibilité ;
- une durée de conservation ;
- une séparation entre notes privées légitimes et contenu partageable.

Un dossier saisi par un agent n’est pas automatiquement le profil officiel du joueur.

La qualification de l’agent, de PARZI ou d’autres parties comme responsables ou co-responsables du traitement dépend du contexte et doit être réservée à une analyse juridique compétente. Le produit doit néanmoins prévoir un canal minimal de demande de correction ou de recours avant même l’ouverture d’un espace Player.

### 9.2 Joueur représenté

Le joueur représenté doit, à terme et selon le cadre juridique applicable, pouvoir comprendre :

- qui gère son dossier ;
- sur quelle relation ou quel mandat ;
- quelles informations sont privées, partagées ou publiques ;
- quels documents sont déposés ;
- avec qui une information a été partagée ;
- comment demander une correction ou retirer un consentement applicable.

### 9.3 Joueur sans agent

**[SOURCE]** La note historique propose une inscription volontaire, une visibilité optionnelle et le choix des agents autorisés à contacter le joueur.

**[PROPOSITION CTO]** Cette direction reste stratégique mais ne doit pas être lancée avant :

- validation juridique du modèle de mise en relation et de rémunération ;
- règles anti-spam ;
- vérification suffisante des agents ;
- consentement et visibilité révocables ;
- protection des mineurs ;
- modération et recours ;
- prévention des promesses de carrière ;
- mesure des préjudices indirects.

La promesse acceptable est d’aider à **structurer un parcours**, jamais de promettre une carrière professionnelle.

## 10. Mineurs et représentants légaux

**[DÉCISION ANTÉRIEURE]** Les Tomes I et II imposent une protection renforcée lorsque des mineurs, une identité ou une autorité sensible sont concernés.

**[PROPOSITION CTO]** Toute fonction concernant un mineur doit rester fermée tant qu’elle ne définit pas :

- l’âge et le pays applicables ;
- l’identité du représentant légal ;
- le lien entre le représentant et le mineur ;
- le consentement ou l’autorité requis ;
- la finalité précise ;
- la visibilité par défaut ;
- la durée et le retrait ;
- les accès d’urgence et leur audit ;
- le signalement, la modération et le recours ;
- la validation juridique compétente.

L’invisibilité par défaut est la position de sécurité proposée. Un simple bouton parental ou une date de naissance ne constitue pas une gouvernance des mineurs.

### 10.1 Risque présent dans le dossier agent

**[ÉTAT RÉEL]** Le code local permet de saisir un joueur âgé de 15 à 17 ans. Aucun champ de représentant légal, reçu de consentement, règle de conservation dédiée ou séparation des exports n’est modélisé.

**[PROPOSITION CTO]** Tant qu’un spécialiste compétent et un ticket autorisé n’ont pas défini les contrôles adaptés, aucune donnée professionnelle réelle concernant un mineur ne doit entrer dans le pilote. Avant Go/No-Go, une vérification doit distinguer capacité du schéma, données effectivement présentes et mesures de fermeture. Le présent tome n’affirme pas que la production contient un mineur.

## 11. Le club

### 11.1 Une organisation, pas une personne

Un club ne doit pas être modélisé comme un compte générique. Des personnes agissent pour lui selon des fonctions, des périmètres et des périodes.

Rôles possibles à valider ultérieurement :

- direction sportive ;
- recrutement ;
- scouting ;
- administration contractuelle ;
- direction d’académie ;
- staff autorisé ;
- direction ou représentant légal.

### 11.2 Dossier CRM et espace officiel

Le `club` du CRM de l’agent et le futur espace PARZI Club sont deux objets différents :

| Objet | Auteur | Autorité | Usage |
|---|---|---|---|
| Dossier club privé | Agent ou agence | Contexte interne déclaré | Préparation et suivi relationnel |
| Profil officiel du club | Membres autorisés du club | Organisation vérifiée | Besoins, informations et interactions contrôlées |

Les deux peuvent être reliés, mais jamais fusionnés silencieusement. Une note interne d’agent ne devient pas une déclaration du club.

Le contrôle d’un club exige deux preuves distinctes : authenticité de l’organisation et pouvoir actuel de la personne qui agit pour elle. Un domaine e-mail ou une déclaration ne suffit pas automatiquement.

## 12. L’agence et les équipes

### 12.1 L’équipe est un contexte de collaboration

**[PROPOSITION CTO]** Une équipe n’est pas un rôle unique. Elle est un ensemble de membres, d’objets, de responsabilités et de règles réunis dans un workspace.

Le workspace doit permettre :

- une propriété organisationnelle explicite ;
- des membres individuels authentifiés ;
- des rôles limités ;
- des affectations par portefeuille, joueur, dossier ou fonction ;
- des invitations expirables ;
- la suspension et la révocation immédiate ;
- un historique d’accès et d’action ;
- un transfert contrôlé des responsabilités ;
- une exportabilité conforme aux droits des parties.

### 12.2 Rôles d’équipe initiaux proposés

| Rôle de workspace | Finalité | Accès initial proposé | Interdiction principale |
|---|---|---|---|
| Propriétaire | Gouvernance contractuelle du workspace | Facturation, gouvernance et désignation d’administrateurs | Accès métier universel automatique |
| Administrateur d’agence | Gérer membres et paramètres | Membres, politiques et affectations autorisées | Accéder aux notes privées ; aucune auto-justification hiérarchique n’est admise |
| Agent responsable | Porter la relation ou le mandat | Dossiers attribués et actions métier | Étendre seul son périmètre |
| Collaborateur | Contribuer à une mission | Objets explicitement partagés | Export massif ou délégation |
| Analyste / scout | Produire observations et rapports | Dossiers ou campagnes attribués | Accès aux salaires, mandats ou données non nécessaires |
| Opérations | Suivre tâches et documents | Flux opérationnels attribués | Décision professionnelle ou signature |
| Lecture / audit | Consulter un périmètre | Lecture datée et limitée | Mutation ou partage secondaire |

Ces noms sont provisoires. Leur validation documentaire n’autorise pas leur implémentation.

### 12.3 Aucun compte partagé

Chaque action doit rester attribuable à une personne ou à un service identifié. Les comptes partagés d’agence ou de club sont incompatibles avec la révocation, la preuve et la responsabilité.

## 13. Administrateur, support et vérificateur

### 13.1 Fonctions distinctes

Le terme `admin` cache plusieurs responsabilités qui doivent être séparées :

| Fonction | Peut | Ne doit pas pouvoir par défaut |
|---|---|---|
| Administration plateforme | Gérer configuration et exploitation autorisées | Lire tous les dossiers métier |
| Support | Aider sur un incident avec accès temporaire et tracé | Se substituer silencieusement à l’utilisateur |
| Vérification PARZI ID | Examiner une affirmation et sa preuve | Modifier le portefeuille métier |
| Modération | Traiter un contenu ou signalement | Décider d’un titre professionnel sans mandat |
| Sécurité | Investiguer un événement selon procédure | Maintenir un accès permanent non contrôlé |
| Conformité / protection des données | Conseiller, contrôler et traiter les demandes selon la fonction désignée | Se substituer automatiquement au décideur métier ou juridique |
| Facturation | Gérer abonnement et paiement | Accéder aux notes sportives ou relationnelles |

Les responsabilités détaillées de ces fonctions restent U0. Elles sont décrites dans les fiches de validation afin d’éviter que leurs permissions soient improvisées.

### 13.2 Limite du produit actuel

**[ÉTAT RÉEL]** L’autorisation administrative observée repose encore sur une liste d’adresses e-mail configurée. Cette solution peut servir de garde provisoire pendant le durcissement, mais elle ne constitue pas le modèle durable.

Le futur système doit définir rôles persistants, attribution, expiration, justification, séparation des fonctions, journalisation et revue périodique.

## 14. Modèle d’autorisation proposé

### 14.1 Question complète

Une autorisation ne répond pas seulement à « quel est ton rôle ? ». Elle répond :

> **Quelle personne, authentifiée comment, porte quelle affirmation vérifiée, au titre de quelle appartenance ou relation, veut effectuer quelle action sur quelle ressource, pour quelle finalité, à quel moment et sous quelles contraintes ?**

### 14.2 Combinaison de contrôles

**[PROPOSITION CTO]** Le modèle cible combine :

- **RBAC** : rôle dans une organisation ou une fonction ;
- **ABAC** : attributs comme statut, territoire, échéance ou sensibilité ;
- **ReBAC** : relation avec la ressource, le joueur ou l’organisation ;
- **consentement** : autorisation de la personne concernée lorsque nécessaire ;
- **classe de risque** : contrôles D0 à D3 validés par le Tome II.

Aucun de ces mécanismes ne suffit seul.

### 14.3 Forme minimale d’une permission

| Dimension | Exemple |
|---|---|
| Sujet | Membre d’agence authentifié |
| Action | Lire, créer, corriger, partager, exporter, décider ou administrer |
| Ressource | Dossier joueur, document, tâche, profil ou vérification |
| Contexte | Workspace, mandat, équipe ou relation attribuée |
| Finalité | Préparer un rendez-vous ou traiter une vérification |
| Conditions | Statut actif, territoire, consentement, heure ou appareil |
| Durée | Permanente justifiée, temporaire ou action unique |
| Contrôle | Confirmation, double contrôle ou audit |

## 15. Espaces de confiance

Le Tome I a validé six espaces. Le Tome IV les applique aux utilisateurs :

| Espace | Exemple | Règle proposée |
|---|---|---|
| Privé individuel | Notes personnelles d’un agent | Non visible au workspace sans choix explicite |
| Workspace | Tâches partagées d’une agence | Accès par appartenance et affectation |
| Relationnel | Document partagé agent-joueur | Accès fondé sur relation, finalité et durée |
| Réseau contrôlé | Profil visible à des acteurs autorisés | Visibilité choisie, audience compréhensible et retrait |
| Public | Information volontairement publiée | Revue de confidentialité, droits et exactitude |
| Audit restreint | Preuve de vérification ou événement de sécurité | Accès spécialisé, journalisé et limité |

Le passage d’un espace à un autre est une action explicite. L’ajout d’un membre à une équipe ne transforme pas automatiquement toutes les données privées en données de workspace.

## 16. Principes d’accès

**[PROPOSITION CTO]** Les règles suivantes constituent le socle :

1. refus par défaut ;
2. moindre privilège ;
3. contrôle au serveur ;
4. propriété ou relation prouvée ;
5. finalité compréhensible ;
6. accès limité dans le temps lorsque possible ;
7. révocation effective ;
8. audit proportionné ;
9. séparation des fonctions sensibles ;
10. absence d’accès supplémentaire acheté par le simple paiement ;
11. recours et correction ;
12. mode dégradé sûr lorsque la preuve manque.

L’interface peut expliquer un droit, mais ne doit jamais être son unique barrière.

## 17. Vérification professionnelle

**[DÉCISION ANTÉRIEURE]** Le terme `vérifié` exige objet, autorité, méthode, date, territoire, validité et recours.

**[PROPOSITION CTO]** L’état global `verified` peut subsister techniquement pendant la transition, mais il ne doit jamais être le seul libellé ou la seule preuve présentée à un utilisateur. Son remplacement par un modèle précis relève de R-028 et doit intervenir avant le Go/No-Go pilote. Le modèle durable sépare :

- affirmation concernée ;
- type de titre ;
- autorité émettrice ;
- pays et territoire ;
- numéro ou référence ;
- période de validité ;
- source et preuve ;
- contrôleur et date ;
- état actif, expiré, suspendu, révoqué ou contesté ;
- historique et recours.

Une vérification d’un titre ne prouve ni honnêteté générale, ni qualité de service, ni succès, ni compétence sur tous les territoires.

Avant R-028, toute présentation du statut existant doit préciser qu’elle ne prouve pas à elle seule territoire, période ni portée professionnelle complète.

## 18. Consentement, délégation et mandat

Ces trois notions ne sont pas interchangeables :

| Notion | Question | Exemple |
|---|---|---|
| Consentement | La personne accepte-t-elle cet usage précis ? | Visibilité optionnelle d’un profil |
| Délégation | Qui autorise qui à agir sur un périmètre ? | Agent responsable donnant lecture à un analyste |
| Mandat / base professionnelle | Quelle relation autorise ou encadre l’action métier ? | Représentation d’un joueur selon un accord applicable |

Chaque preuve doit être versionnée, datée, limitée et révocable ou expirante selon sa nature. Le retrait d’un consentement n’efface pas forcément toutes les obligations légales, mais doit arrêter les usages qui en dépendaient.

La fin ou le transfert d’une représentation déclenche une décision explicite sur accès futur, cessation d’usage, conservation justifiée, information du joueur et données partageables. Deux revendications concurrentes placent la relation en état `contesté` ; PARZI ne déduit aucune exclusivité d’un simple dossier.

## 19. Cycle de vie d’un accès

| Étape | Contrôle attendu |
|---|---|
| Invitation | Auteur habilité, périmètre, rôle et expiration visibles |
| Acceptation | Personne authentifiée et conditions comprises |
| Activation | Vérifications et dépendances satisfaites |
| Utilisation | Contrôle serveur et journalisation proportionnée |
| Évolution | Changement explicite, justification et notification adaptée |
| Suspension | Accès sensible interrompu sans détruire la preuve |
| Révocation | Session et permissions effectivement retirées |
| Départ | Révocation, revue proportionnée des exports récents et transfert contrôlé des responsabilités |
| Fin de représentation | Cessation des usages non justifiés, conservation décidée et information appropriée |
| Conservation | Durées et obligations appliquées par catégorie |
| Révision | Revue périodique des accès dormants ou trop larges |

Un accès sans propriétaire, sans date de revue ou sans moyen de révocation devient une dette d’autorisation.

## 20. Matrice de responsabilités initiale

La matrice suivante ne remplace pas une politique technique. Elle fixe les frontières à tester.

| Capacité | Agent vérifié | Aspirant | Joueur | Membre club | Équipe agence | Vérificateur |
|---|---:|---:|---:|---:|---:|---:|
| Academy | Autorisé | Autorisé | Hors périmètre initial | Hors périmètre initial | Selon personne | Hors fonction |
| Portefeuille privé | Selon propriété | Démo pédagogique uniquement | Vue future contrôlée | Non | Selon affectation future | Non |
| CRM et prospection sensibles | Selon titre et territoire | Non | Non | Non | Selon rôle futur | Non |
| Soumettre une preuve de titre | Oui | Possible en transition | Non | Possible pour représentation future | Individuel | Non |
| Décider une vérification | Non sur soi-même | Non | Non | Non | Non | Selon fonction séparée |
| Corriger ses données | Oui | Oui | Futur droit contrôlé | Futur droit contrôlé | Selon ressource | Selon procédure |
| Partager un dossier joueur | Selon relation et autorité futures | Non | Futur consentement/contrôle | Futur besoin autorisé | Selon délégation | Non |
| Administrer des membres | Futur si rôle workspace | Non | Non | Futur si rôle club | Futur si rôle agence | Non |
| Accéder aux preuves d’audit | Seulement celles qui le concernent | Idem | Idem | Idem | Selon rôle restreint | Selon dossier attribué |

`Non` signifie refus dans le contexte décrit, pas impossibilité éternelle. Toute extension exige une décision et une preuve propres.

## 21. Responsabilité des décisions

Le Tome II distingue le propriétaire d’une décision et les rôles de collaboration. Le Tome IV propose les fonctions suivantes :

- **propriétaire** : répond de la fermeture et de la qualité de la décision ;
- **décideur autorisé** : possède l’autorité pour statuer ;
- **exécutant** : réalise l’action approuvée ;
- **contributeur** : apporte information ou analyse ;
- **personne consultée** : donne expertise ou objection ;
- **personne concernée** : subit ou reçoit l’effet ;
- **auditeur** : contrôle la conformité sans devenir décideur ;
- **signalant** : remonte un fait ou un risque par un canal protégé et traçable ;
- **autorité d’escalade** : intervient lorsque preuve ou pouvoir manque.

Une personne peut cumuler certains rôles dans une petite structure, mais le système doit rendre le cumul visible. Les actions D3 peuvent exiger une séparation ou un second contrôle.

## 22. Personae et preuves

### 22.1 Persona comme hypothèse, pas comme fiction marketing

**[PROPOSITION CTO]** Chaque persona doit porter :

- un segment précis ;
- une situation observable ;
- un travail répété à accomplir ;
- les outils actuels ;
- les contraintes et pouvoirs réels ;
- les données nécessaires ;
- le risque principal ;
- les hypothèses non prouvées ;
- la date et la source des entretiens ;
- la condition de révision ou d’abandon.

Nom, photo fictive, âge décoratif ou citation inventée ne constituent pas une preuve utilisateur.

### 22.2 Niveaux de preuve persona

| Niveau | Preuve | Usage autorisé |
|---|---|---|
| U0 — Concept | Idée issue de vision ou hypothèse | Cadrage et questions uniquement |
| U1 — Signal | Quelques témoignages ou observations | Prototype exploratoire |
| U2 — Motif | Problème répété dans plusieurs contextes | Priorisation prudente |
| U3 — Validé pilote | Usage réel et bénéfice observé sur un pilote | Décision produit pilotée |
| U4 — Étendu | Réplication sur segments, pays ou sports définis | Expansion contrôlée |

Le paiement n’est pas à lui seul une preuve de sécurité, de représentativité ou d’adéquation à tous les segments.

## 23. Plan de validation utilisateur proposé

Avant de déclarer les personas du Tome IV validés, mener des entretiens séparés avec, au minimum :

- agents nouvellement licenciés sans portefeuille ;
- agents indépendants actifs ;
- agents d’agence ou dirigeants ;
- aspirants ou candidats à la licence ;
- joueurs majeurs représentés ;
- joueurs majeurs sans agent ;
- parents ou représentants de jeunes joueurs, après protocole adapté ;
- professionnels de recrutement club ;
- personnes responsables de conformité ou vérification.

Les entretiens avec mineurs ne sont pas requis pour valider le Tome IV documentaire et ne doivent pas être improvisés.

Questions transversales :

1. quelle décision ou tâche se répète réellement ?
2. qui a aujourd’hui l’autorité de la prendre ?
3. quelles informations sont partagées, avec qui et pourquoi ?
4. qu’est-ce qui ne doit jamais être visible à un collègue ?
5. comment un accès est-il accordé puis retiré ?
6. où surviennent erreurs, conflits ou contournements ?
7. quelle preuve manque avant d’agir ?
8. quelle conséquence serait inacceptable ?

## 24. Séquencement recommandé

### P0 — Pilote de confiance

- agent individuel authentifié ;
- parcours aspirant limité à Academy ;
- vérification professionnelle plus précise ;
- vérificateur séparé et audité ;
- ressources strictement isolées par utilisateur ;
- cycle de compte, support et droits de sortie.

### P1 — Collaboration d’agence

- workspace ;
- membres individuels ;
- rôles et affectations ;
- invitations, départs et audit ;
- objets privés versus partagés ;
- aucun accès global implicite du dirigeant.

### P2 — Espaces Player et Club fermés

- profils et organisations vérifiés ;
- relations et consentements ;
- besoins et partages contrôlés ;
- correction, recours et modération ;
- validation juridique pays par pays.

### P3 — Réseau, matching et réputation

- ouverture uniquement après densité suffisante des deux côtés ;
- anti-spam et équité ;
- cadre juridique validé ;
- preuves relationnelles ;
- réputation objective avant évaluations subjectives ;
- droit de réponse et modération.

Ce séquencement documente une direction. La roadmap exécutoire reste R-001 à R-030 jusqu’au Go/No-Go prévu.

## 25. Risques structurants

| Risque | Effet | Réponse proposée |
|---|---|---|
| E-mail utilisé comme rôle | Escalade de privilège | RBAC persistant et revu |
| Compte d’agence partagé | Actions non attribuables | Comptes individuels et memberships |
| Joueur réduit à un dossier | Absence de contrôle et conflit | Sujet de données, correction et relation explicite |
| Club CRM présenté comme profil officiel | Fausse autorité | Séparer dossier privé et espace vérifié |
| Statut `verified` trop large | Halo de confiance trompeur | Claims précis et expirants |
| Accès lié au prix | Pay-to-access injuste | Valeur payante distincte de l’autorité |
| Départ d’un membre non traité | Fuite durable | Révocation, transfert et revue |
| Parent ou mineur mal modélisé | Préjudice élevé | Gouvernance dédiée et lancement bloqué |
| Âge mineur déjà saisissable | Risque présent avant Player | Bloquer les données réelles de mineurs du pilote jusqu’à contrôle compétent et ticket autorisé |
| Matching prématuré | Risque juridique et spam | Revue compétente et ouverture contrôlée |
| Administrateur omnipotent | Abus ou incident massif | Séparation des fonctions et accès temporaire |
| Fin ou transfert de mandat absent | Usage résiduel et conflit | État de relation, cessation, conservation et recours |
| Deux agents revendiquent le même joueur | Décision implicite illégitime | État contesté et escalade sans arbitrage automatique |
| Faux club ou faux représentant | Collecte trompeuse de données | Vérifier organisation et pouvoir du représentant séparément |
| Export massif avant départ | Exfiltration malgré révocation | Limites proportionnées et revue des exports récents |
| Persona fictif présenté comme recherche | Mauvaise stratégie | Registre de preuves U0–U4 |
| Expansion mondiale par traduction | Rôles illégitimes localement | Country Packs et expertise locale |

## 26. Anti-personas et usages refusés

Le produit ne doit pas être conçu pour :

- une personne cherchant à se présenter comme agent sans titre applicable ;
- une agence voulant surveiller secrètement toute activité personnelle de ses membres ;
- un club demandant un accès général aux dossiers privés des agents ;
- un acteur achetant des coordonnées ou une priorité de contact ;
- un joueur ou intermédiaire cherchant une promesse de carrière garantie ;
- un administrateur voulant contourner la traçabilité ;
- un service automatisé agissant extérieurement sans responsabilité humaine ;
- un utilisateur tentant de publier ou traiter les données d’un mineur sans cadre adapté.

Refuser un usage incompatible protège l’écosystème et la valeur long terme de PARZI.

## 27. Internationalisation et multisport

**[DÉCISION ANTÉRIEURE]** L’ambition mondiale ne permet pas de prétendre qu’un rôle, une licence ou un mandat signifie la même chose partout.

Chaque ouverture doit définir :

- terminologie locale des métiers ;
- autorités et titres ;
- territoires et périodes ;
- règles de représentation ;
- seuils d’âge et responsabilités ;
- obligations de consentement et de données ;
- résidence des données et conditions de transfert transfrontalier ;
- verrou mineurs spécifique au pays ;
- langues, support et recours ;
- rôles propres au sport ;
- partenaires ou experts responsables de la validation.

Le noyau technique peut être commun. L’autorité professionnelle ne l’est pas automatiquement.

## 28. Mesure saine

Mesures utiles proposées :

- temps nécessaire pour comprendre et obtenir un accès légitime ;
- taux d’invitations expirées ou révoquées correctement ;
- accès dormants ou trop larges détectés ;
- incidents de permission ;
- demandes de correction et délai de résolution ;
- compréhension réelle des audiences de partage ;
- erreurs de vérification et recours ;
- tâches répétées et résultats observés par segment ;
- valeur et confiance séparées par persona.

Mesures interdites comme raccourci :

- score secret de qualité d’un agent ;
- classement des joueurs selon leur docilité ou leur disponibilité ;
- prestige d’un club utilisé comme niveau d’autorité ;
- volume de données consultées comme productivité ;
- refus d’une recommandation traité comme mauvais comportement.

Cette interdiction ne prohibe pas tout indice explicite. Un Score ou Rank appliqué à une personne doit avoir objet, formule, données, limites, contestation et gouvernance propres. Le Score actuel reste soumis à R-023 ; le modèle cible est délégué au Tome XXIII et aux tomes de preuve concernés.

## 29. Délégations aux tomes suivants

| Sujet | Tome propriétaire |
|---|---|
| Parcours de l’agent sans joueur | Tome V |
| Consentement et valeur de l’espace joueur | Tome VI |
| Besoins, relations et accès club | Tome VII |
| Gouvernance de preuve et traçabilité | Tome VIII |
| Adaptation multisport | Tome IX |
| Propriété fonctionnelle des produits | Tome X |
| Workspaces et collaboration détaillée | Tomes Manage concernés, à confirmer dans XI–XX |
| PARZI ID et profils de confiance | Bloc XLI–L |
| Sécurité, données et conformité | Bloc LXI–LXX |

Le Tome IV fixe les acteurs et frontières. Il ne doit pas absorber silencieusement les parcours, politiques juridiques ou modèles de données détaillés de ces tomes.

## 30. Contre-audit des collisions documentaires

### 30.1 Utilisateurs historiques versus utilisateurs réels

Le Playbook nomme agents, agences, scouts, clubs, académies et consultants. Cette liste décrit une ambition commerciale historique. Elle ne prouve ni compte, ni parcours, ni permission pour chacun. Le Tome IV retient donc l’agent comme entrée et classe les autres rôles par maturité.

### 30.2 `Consentement = conformité réglée`

La note « Côté joueurs & réputation » affirme que l’inscription volontaire et consentie règle le risque de conformité. Cette formulation est trop absolue. Le consentement ne remplace pas finalité, minimisation, sécurité, droits, conservation, gouvernance des mineurs, contrats, transferts éventuels ni autre base applicable. Le Tome IV conserve l’inscription volontaire comme bonne direction de contrôle, pas comme conclusion juridique.

### 30.3 `Sans agent connu = sans agent`

L’absence d’agent dans une source ou un dossier ne prouve pas l’absence de représentation. Toute future détection doit distinguer :

- absence déclarée par le joueur ;
- absence confirmée selon une source autorisée ;
- information inconnue ou périmée ;
- mandat arrivant à échéance, avec source et droit d’usage ;
- donnée contestée.

Le radar historique reste conceptuel tant que cette provenance n’existe pas.

### 30.4 `Choix agent = agent autorisé`

Le parcours local permet de choisir `agent` ou `aspirant`. Ce choix oriente l’expérience ; il ne prouve pas une licence. Le statut professionnel et les permissions sensibles restent des contrôles séparés.

### 30.5 Dossiers `players` et `clubs` versus espaces Player et Club

Les tables actuelles appartiennent à l’utilisateur agent. Elles ne créent aucune identité connectée du joueur ou du club, aucun consentement et aucun droit de correction direct. Les futurs espaces ne doivent pas hériter silencieusement de toute donnée privée existante.

### 30.6 Propriété individuelle versus collaboration d’agence

Le filtrage actuel par `user_id` est cohérent avec le pilote individuel et nécessaire à son isolation. Il ne doit pas être contourné pour simuler une équipe. La collaboration exige un domaine workspace explicite, construit plus tard selon la roadmap autorisée.

### 30.7 Vérification actuelle versus PARZI ID cible

Les états actuels forment une première brique utile, mais ne représentent pas encore toute la précision territoriale, temporelle et historique définie par PARZI ID. Le Tome IV reconnaît la progression sans attribuer au système actuel une portée supérieure à ce qu’il stocke.

### 30.8 Prix et automatisations historiques

Les niveaux de prix, volumes gratuits et automatisations cités dans les notes de vision restent des hypothèses historiques. Ils ne définissent ni permission ni promesse actuelle et ne sont pas validés par ce tome.

### 30.9 Contre-audit indépendant du 23 juillet 2026

Le contre-audit externe a conclu `GO sous réserves`. Ses recommandations principales ont été intégrées après vérification locale : limitation du statut global `verified`, contrôles D3, séparation segment/rôle, frontière du Score, fonctions de confiance, fin de représentation, signalement, support, authenticité des organisations, risque mineur présent et verrous internationaux.

Trois formulations ont été corrigées plutôt que reprises littéralement :

- le code permet la saisie d’un âge mineur, mais aucune présence de mineur en production n’est affirmée ;
- un second contrôle est exigé avant activation des actions D3 nommées, sans prétendre que ces fonctions sont ouvertes aujourd’hui ;
- l’interdiction des scores secrets ne supprime pas un indice explicable et contestable ; le moteur actuel relève de R-023 et la cible du Tome XXIII.

Le registre d’intégration `TOME_IV_INTEGRATION_CONTRE_AUDIT_V0.1.md` conserve la disposition détaillée des remarques.

## 31. Recommandation CTO

Le Tome IV peut devenir une fondation majeure de l’empire PARZI s’il refuse deux simplifications dangereuses : `un compte = une identité` et `un rôle = tous les droits`.

La recommandation est d’adopter :

- l’agent de football francophone comme utilisateur d’entrée ;
- l’aspirant comme parcours limité et honnête ;
- le joueur comme sujet de données avant d’être un compte ;
- le club et l’agence comme organisations composées de membres individuels ;
- les équipes comme contextes de collaboration, non comme comptes partagés ;
- la séparation personne, identité, vérification, appartenance, relation, consentement et permission ;
- le refus par défaut et le moindre privilège ;
- un séquencement agent individuel, équipe d’agence, espaces Player/Club, puis réseau ;
- la validation des personas par preuves U0 à U4 ;
- une gouvernance spécifique des mineurs, des vérificateurs et des administrateurs.

Ces recommandations doivent être décidées dans le registre. Leur validation documentaire ne déclenchera aucun développement, aucune migration et aucune ouverture publique.
