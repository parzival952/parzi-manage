# Tome IV — Registre des décisions utilisateurs et responsabilités

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 1.0 |
| Date | 23 juillet 2026 |
| Périmètre | Décisions TIV-D001 à TIV-D045 |
| Statut global | Recommandations CTO amendées approuvées par le fondateur |
| Source | Tome IV — dossier maître v0.2 |
| Dépendances | Tomes I, II et III — Constitutions centrales v1.0 |
| Effet applicatif | Aucun sans autorisation séparée |
| Décision fondatrice | Instruction « je valide les recommandations cto amendées du tome IV v0.2. » du 23 juillet 2026 |

## Règle d’utilisation

Statuts autorisés :

- **Proposée**
- **Validée**
- **Modifiée et validée**
- **Expérimentale**
- **Reportée**
- **Suspendue**
- **Remplacée**
- **Rejetée**

Une décision validée peut rester non exécutoire. Elle n’autorise pas automatiquement code, compte, rôle, donnée, migration, contrat, déploiement ou communication publique.

## Recommandation globale du CTO

- **Approbation constitutionnelle recommandée** : TIV-D001 à TIV-D011, TIV-D016, TIV-D018 à TIV-D020, TIV-D025, TIV-D028, TIV-D030 à TIV-D032, TIV-D034 à TIV-D040 et TIV-D042 à TIV-D045.
- **Principes avec conception ou exécution différée** : TIV-D012, TIV-D017, TIV-D021, TIV-D026, TIV-D029 et TIV-D033.
- **Règles recommandées comme non négociables** : TIV-D013 à TIV-D015, TIV-D022 à TIV-D024, TIV-D027 et TIV-D041.
- **Expérimentation recommandée** : aucune permission ; seuls les noms finaux des rôles et les seuils de recherche restent à tester sans modifier les principes.
- **Rejet recommandé** : aucun à ce stade.

## Registre

| ID | Décision proposée | Avis CTO | Condition principale | Statut fondateur | Décision ou réserve du fondateur | Date |
|---|---|---|---|---|---|---|
| TIV-D001 | Conserver l’agent de football professionnel francophone comme utilisateur d’entrée | Approuver | Toute extension de rôle, pays ou sport exige une preuve séparée | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D002 | Séparer personne, compte, affirmation, vérification, appartenance, relation, consentement, permission, responsabilité et preuve | Approuver | Aucun raccourci ne doit transformer une dimension en une autre | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D003 | Considérer le compte comme moyen d’accès et non comme preuve générale d’identité ou d’autorité | Approuver | Authentification et autorisation restent distinctes | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D004 | Définir tout rôle par contexte, périmètre, durée, attribution et révocation | Approuver | Interdire les rôles globaux permanents sans justification | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D005 | Traiter le joueur comme personne et sujet de données avant de le traiter comme utilisateur ou dossier | Approuver | Prévoir provenance, correction, visibilité et recours ; une donnée inconnue ne prouve pas une absence ; réserver la qualification juridique des responsabilités de traitement | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D006 | Modéliser clubs et agences comme organisations composées de membres individuels | Approuver | Ne jamais réduire une organisation à un compte partagé ; vérifier séparément l’organisation et le pouvoir de son représentant | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D007 | Définir une équipe comme contexte de collaboration, non comme rôle unique | Approuver | Utiliser memberships, affectations et responsabilités explicites | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D008 | Distinguer aspirant, nouvel agent sans joueur, agent indépendant, agent établi, dirigeant et membre d’agence comme segments de recherche | Approuver | Ne créer ni hiérarchie de valeur ni droit automatique ; un segment ne produit jamais un rôle workspace ni une permission | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D009 | Limiter l’aspirant à l’apprentissage et aux capacités non réservées jusqu’à preuve d’autorité | Approuver | Academy ne confère pas un droit d’exercer | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D010 | Séparer dossier joueur privé, données externes, profil contrôlé et contenu public | Approuver | Toute transition entre espaces doit être explicite | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D011 | Séparer dossier CRM privé d’un club et futur profil officiel PARZI Club | Approuver | Une note interne ne devient jamais une déclaration du club ; le profil officiel exige organisation et représentant contrôlés | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D012 | Adopter à terme un modèle combinant rôle, attributs, relations, consentements et classe de risque | Approuver le principe ; conception différée | Définir chaque politique par action et ressource avant implémentation | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D013 | Appliquer refus par défaut, moindre privilège et contrôle serveur à toutes les permissions métier | Approuver, non négociable | L’interface ne constitue jamais l’unique barrière | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D014 | Interdire qu’un abonnement, un prix ou un plan confère identité, autorité, consentement ou priorité injuste | Approuver, non négociable | Facturer une valeur, jamais la confiance ou l’accès privé | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D015 | Interdire les comptes partagés d’agence, de club ou d’équipe pour les actions métier | Approuver, non négociable | Chaque action doit rester attribuable et révocable | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D016 | Appliquer les six espaces de confiance : privé, workspace, relationnel, réseau contrôlé, public et audit restreint | Approuver | Rendre explicite tout changement d’audience | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D017 | Définir une permission par sujet, action, ressource, contexte, finalité, conditions, durée et contrôle | Approuver le principe ; formalisation différée | Utiliser ce contrat avant toute nouvelle politique | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D018 | Distinguer consentement, délégation, appartenance, mandat et permission | Approuver | Conserver preuve, durée et mécanisme de fin propres à chaque notion ; le consentement seul ne prouve pas toute conformité ; une revendication concurrente place la relation en état contesté | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D019 | Exiger un cycle de vie complet pour chaque accès et relation de représentation | Approuver | Invitation, activation, revue, suspension, révocation, fin ou transfert de représentation, contrôle des exports récents et clôture | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D020 | Définir l’accès ou la relation dormante, expirée, sans propriétaire ou sans revue comme dette d’autorisation | Approuver | Inclure droits post-mandat et accès résiduels ; mesurer et résorber la dette sans noter les personnes | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D021 | Remplacer le statut global de vérification par des affirmations précises et historisées au plus tard dans R-028 avant le Go/No-Go pilote | Approuver le principe ; modèle détaillé différé | Conserver autorité, territoire, validité, source, état et recours ; l’état technique provisoire ne constitue pas un claim public suffisant | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D022 | Interdire tout usage vague de `vérifié` comme approbation générale d’une personne | Approuver, non négociable | Afficher l’objet et les limites du contrôle ; pendant la transition, ne jamais présenter `agent_status=verified` seul comme preuve territoriale ou temporelle | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D023 | Bloquer toute fonction ou donnée pilote concernant des mineurs sans gouvernance, autorité, minimisation, consentement applicable, visibilité, conservation, modération et validation juridique dédiés | Approuver, non négociable | Le code permet actuellement de saisir un âge dès 15 ans sans modèle de représentant légal : traiter cette capacité comme risque présent, sans prétendre que des mineurs existent en production | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D024 | Interdire tout matching ou vente d’accès à un contact avant validation juridique et protections anti-spam | Approuver, non négociable | Aucun paiement ne doit être lié à une introduction | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D025 | Positionner l’espace joueur futur comme contrôle du parcours et de la visibilité, jamais comme promesse de carrière | Approuver | Montrer limites, choix et recours | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D026 | Donner au joueur, selon le cadre applicable, visibilité sur audience, finalité, partage, correction, recours et retrait | Approuver le principe ; politique détaillée différée | Distinguer données privées, relationnelles et publiques ; prévoir un canal minimal de demande même avant l’espace Player | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D027 | Interdire la surveillance cachée des membres d’une agence et l’accès universel implicite du dirigeant | Approuver, non négociable | L’accès exceptionnel à une donnée privée ne peut être auto-justifié : nécessité établie, autorisation indépendante, audit et notification de la personne sauf interdiction compétente motivée | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D028 | Adopter comme base de travail les rôles workspace propriétaire, administrateur, agent responsable, collaborateur, analyste, opérations et lecture | Approuver comme taxonomie initiale | Tester les noms et permissions ; ne déduire aucun rôle d’un segment TIV-D008 | Expérimentale | Taxonomie initiale approuvée pour expérimentation ; noms et périmètres non définitifs | 23 juillet 2026 |
| TIV-D029 | Prévoir des accès temporaires et limités pour collaborateurs externes, support et audit | Approuver le principe ; exécution différée | Justification, expiration, journalisation et révocation obligatoires | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D030 | Séparer et caractériser administration plateforme, support, vérification, modération, sécurité/incident, conformité/protection des données et facturation | Approuver | Définir pour chaque fonction ce qu’elle peut et ne peut pas voir ; éviter les pouvoirs cumulés non contrôlés | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D031 | Remplacer la liste d’e-mails administrateurs par un RBAC persistant et audité selon la roadmap autorisée | Approuver | La mesure actuelle reste provisoire, jamais cible durable | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D032 | Interdire à un vérificateur de décider sa propre vérification | Approuver | Identifier conflits, délégation et recours | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D033 | Exiger un second contrôle indépendant avant toute activation d’une action D3 concernant un mineur, une mise en relation monétisée ou une identité irréversiblement modifiée ; étudier les autres seuils D3 | Approuver le noyau ; seuils complémentaires différés | Les fonctions aujourd’hui fermées restent fermées ; le contrôle n’autorise aucune ouverture | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D034 | Rendre visible tout cumul de rôles sensibles | Approuver | Permettre revue, séparation ou escalade | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D035 | Interdire l’usurpation silencieuse d’un utilisateur par le support | Approuver | Vérifier le demandeur ; tout accès exceptionnel est limité, audité et notifié a posteriori à la personne concernée, sauf interdiction compétente motivée | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D036 | Attribuer à chaque décision propriétaire, décideur autorisé, exécutant et personnes concernées selon le besoin | Approuver | Conserver les objections et transferts de responsabilité | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D037 | Séquencer l’ouverture : agent individuel, équipe d’agence, espaces Player/Club, puis réseau et réputation | Approuver | La roadmap exécutoire reste R-001 à R-030 jusqu’au Go/No-Go | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D038 | Construire la réputation par preuves objectives avant toute évaluation subjective | Approuver | Une évaluation future exige relation prouvée, modération et droit de réponse | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D039 | Fonder chaque persona sur un travail réel, des contraintes, des risques et une preuve révisable | Approuver | Interdire citations et succès fictifs présentés comme recherche | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D040 | Adopter l’échelle persona U0 Concept à U4 Étendu | Approuver | Ne pas utiliser U0 ou U1 comme preuve d’expansion | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D041 | Interdire les scores secrets de valeur, qualité ou docilité des agents, joueurs et membres | Approuver, non négociable | Ne prohibe pas un indice explicitement défini, explicable et contestable ; le Score actuel reste soumis à R-023 et le modèle cible au Tome XXIII, sans docilité ni disponibilité personnelle comme mesure de valeur | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D042 | Valider les personas par entretiens séparés selon segment et pouvoir réel | Approuver | Ne pas improviser de recherche avec des mineurs | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D043 | Adapter rôles, titres et autorités par Country Pack et Sport Pack | Approuver | Vérifier localement définition de l’agent, organisations, mineurs, résidence et transferts de données ; une traduction ou un badge ne rend pas un rôle universel | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D044 | Déléguer aux Tomes V, VI et VII les parcours détaillés agent sans joueur, joueur et club | Approuver | Le Tome IV conserve acteurs et frontières, pas les parcours complets | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |
| TIV-D045 | Gouverner toute modification structurante du Tome IV par décision, preuve, impact et version | Approuver | Synchroniser constitution, registre, dossier et registre maître | Validée | Approuvée selon la recommandation CTO amendée | 23 juillet 2026 |

## Réserves et conceptions différées

### TIV-D012 et TIV-D017 — Modèle d’autorisation

Le principe de combinaison des rôles, attributs, relations et consentements est recommandé. Le Tome IV ne choisit ni bibliothèque, ni schéma final, ni syntaxe de politique.

### TIV-D021 — PARZI ID

Le modèle précis des affirmations, autorités et preuves appartient au domaine PARZI ID. Le statut technique actuel peut subsister pendant le durcissement, mais il ne constitue pas un claim public suffisant. R-028 doit fermer cet écart avant le Go/No-Go pilote.

### TIV-D023 — Mineurs

La validation de ce principe maintient les fonctions fermées. Le formulaire local autorise actuellement un âge dès 15 ans sans modèle de représentant légal ; cette capacité est un risque présent à traiter. Aucun mineur en production n’est affirmé par ce constat. La décision ne valide aucun formulaire, aucune base légale et aucun lancement.

### TIV-D024 — Matching

La note historique contient une alerte juridique importante. Le présent registre conserve le blocage et exige une revue compétente ; il ne produit pas lui-même un avis juridique.

### TIV-D028 — Noms des rôles workspace

La taxonomie sert de base de recherche. Les noms, périmètres et combinaisons devront être testés auprès de vraies équipes avant implémentation.

### TIV-D027 et TIV-D035 — Accès exceptionnel

Une justification saisie par la personne qui demande l’accès ne constitue pas une autorisation indépendante. Les exceptions exigent nécessité, périmètre minimal, décision séparée, audit et notification de la personne concernée, sauf interdiction compétente et motivée. Le support vérifie aussi l’identité du demandeur avant toute action sensible.

### TIV-D033 — Second contrôle

Un double contrôle généralisé peut créer lenteur et contournement. Le noyau obligatoire concerne les actions D3 nommées dans la décision et s’applique avant leur activation. Les autres seuils restent à définir selon risque, irréversibilité et conflit d’intérêts.

### TIV-D041 — Score et valeur humaine

La règle interdit la notation secrète ou comportementale d’une personne. Elle ne valide pas le moteur actuel comme score sportif. Celui-ci reste soumis à R-023 ; le modèle cible explicable et contestable relève notamment du Tome XXIII.

### TIV-D043 — Expansion

Chaque Country Pack conserve des verrous distincts pour définition locale de l’agent, authenticité des organisations, mineurs, résidence et transferts de données. Leur mention ne constitue pas une analyse juridique du pays.

### TIV-D040 — Échelle U0 à U4

L’échelle structure la maturité d’un persona. Les seuils chiffrés d’entretiens ne sont pas fixés artificiellement ; la diversité et la répétition du motif comptent autant que le volume.

## Décision fondatrice reçue

> « je valide les recommandations cto amendées du tome IV v0.2. » — Fondateur PARZI, 23 juillet 2026.

Cette instruction valide les quarante-quatre décisions recommandées pour approbation et maintient TIV-D028 comme taxonomie expérimentale. Les conceptions différées, les réserves juridiques, les personas U0 et les conditions d’exécution restent ouverts.

La validation est documentaire. Elle n’autorise aucun développement, aucune migration, aucun déploiement, aucune ouverture d’accès ni aucun commit.

## Formule de modification future

Le fondateur peut également modifier une décision individuellement :

> Pour TIV-[identifiant], je décide : [valider, modifier et valider, expérimenter, reporter, suspendre, remplacer ou rejeter]. Condition ou motif : [texte].

## Après une future modification

1. mettre à jour le statut, la décision et la date ;
2. conserver les réserves et modifications ;
3. synchroniser la Constitution centrale ;
4. contrôler l’alignement avec les Tomes I à III ;
5. mettre à jour le registre maître et le plan de reconstruction ;
6. publier une version documentaire 1.0 si la portée est validée ;
7. demander séparément toute autorisation de commit ou d’exécution.
