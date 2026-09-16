# Tome IV — Scénarios d’autorisation et de responsabilité v0.2

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.2 |
| Date | 23 juillet 2026 |
| Statut | Scénarios documentaires ; aucune politique technique créée |
| Référence | Constitution et registre du Tome IV v1.0 |
| Usage | Contre-audit futur des parcours, permissions et tests |
| Effet applicatif | Aucun |

## 1. Objectif

Ces scénarios transforment les principes du Tome IV en résultats attendus compréhensibles. Ils ne prescrivent ni schéma SQL, ni bibliothèque d’autorisation, ni interface.

Chaque scénario précise : acteur, contexte, demande, décision attendue, raison et preuve à conserver.

## 2. Légende

| Décision | Sens |
|---|---|
| Autoriser | Les preuves et conditions suffisent dans le périmètre décrit |
| Refuser | Une règle interdit l’action |
| Escalader | Une autorité, une preuve ou une décision compétente manque |
| Autoriser sous conditions | L’action exige durée, confirmation, limitation ou second contrôle |

## 3. Scénarios d’entrée et de titre

### S01 — L’aspirant choisit le parcours `agent`

| Champ | Valeur |
|---|---|
| Acteur | Personne sans titre professionnel vérifié |
| Demande | Accéder à une fonction métier sensible après avoir choisi `agent` à l’onboarding |
| Décision attendue | Refuser ou rediriger vers la vérification adaptée |
| Raison | Le choix de parcours n’est pas une preuve d’autorité |
| Preuve | Événement de refus minimal, sans exposer de données métier |

### S02 — Titre actif dans le territoire applicable

| Champ | Valeur |
|---|---|
| Acteur | Agent dont l’affirmation applicable est active et contrôlée |
| Demande | Utiliser une capacité autorisée dans son portefeuille individuel |
| Décision attendue | Autoriser si propriété, relation et conditions de l’action sont satisfaites |
| Raison | Titre et propriété sont nécessaires mais ne remplacent pas les autres contrôles |
| Preuve | Identifiant de politique, objet de vérification et ressource concernée |

### S03 — Titre expiré

| Champ | Valeur |
|---|---|
| Acteur | Agent dont le titre pertinent a expiré |
| Demande | Lancer une nouvelle action professionnelle sensible |
| Décision attendue | Refuser ou escalader selon la règle locale |
| Raison | Un ancien contrôle n’accorde pas une autorité permanente |
| Preuve | Date d’expiration, décision et procédure de renouvellement |

### S04 — Titre vérifié dans un autre territoire

| Champ | Valeur |
|---|---|
| Acteur | Professionnel contrôlé dans un territoire A |
| Demande | Agir comme si le contrôle était valable dans un territoire B |
| Décision attendue | Escalader ou refuser |
| Raison | Une vérification n’est pas universelle |
| Preuve | Territoires comparés et règle ayant motivé la décision |

## 4. Scénarios de portefeuille individuel

### S05 — Lecture de sa propre ressource

| Champ | Valeur |
|---|---|
| Acteur | Utilisateur authentifié |
| Demande | Lire un dossier dont il est le propriétaire autorisé |
| Décision attendue | Autoriser selon la sensibilité et le statut requis |
| Raison | Propriété prouvée et action cohérente |
| Preuve | Contrôle de propriété ; journal seulement si proportionné |

### S06 — Identifiant d’un dossier appartenant à un autre compte

| Champ | Valeur |
|---|---|
| Acteur | Utilisateur authentifié A |
| Demande | Lire ou modifier une ressource du compte B par URL ou formulaire manipulé |
| Décision attendue | Refuser sans révéler l’existence de la ressource |
| Raison | Isolation et moindre divulgation |
| Preuve | Événement de sécurité pseudonymisé et sans contenu du dossier |

### S07 — Donnée d’agent inconnue

| Champ | Valeur |
|---|---|
| Acteur | Agent consultant une fiche joueur |
| Demande | Traiter l’absence de donnée d’agent comme preuve que le joueur est libre |
| Décision attendue | Refuser la conclusion ; afficher `inconnu` |
| Raison | Absence de donnée et absence de représentation sont distinctes |
| Preuve | Provenance, fraîcheur et état de l’information |

## 5. Scénarios d’agence et d’équipe

### S08 — Collaborateur affecté à un dossier

| Champ | Valeur |
|---|---|
| Acteur | Membre actif d’une agence avec affectation limitée |
| Demande | Lire et compléter les champs nécessaires du dossier attribué |
| Décision attendue | Autoriser dans le périmètre de l’affectation |
| Raison | Rôle, relation et ressource concordent |
| Preuve | Membership, affectation, politique et action |

### S09 — Dirigeant non affecté demandant une note privée

| Champ | Valeur |
|---|---|
| Acteur | Dirigeant de l’agence |
| Demande | Lire une note classée privée individuelle d’un membre |
| Décision attendue | Refuser par défaut |
| Raison | La hiérarchie organisationnelle ne transforme pas le privé en workspace |
| Preuve | Refus et mécanisme d’escalade en cas d’obligation exceptionnelle |

### S10 — Invitation d’un analyste externe

| Champ | Valeur |
|---|---|
| Acteur | Agent responsable habilité |
| Demande | Donner accès en lecture à deux dossiers pendant sept jours |
| Décision attendue | Autoriser sous conditions |
| Raison | Périmètre et durée explicites, sans délégation secondaire |
| Preuve | Auteur, destinataire, objets, expiration et acceptation |

### S11 — Départ d’un membre

| Champ | Valeur |
|---|---|
| Acteur | Administrateur d’agence habilité |
| Demande | Clôturer l’appartenance d’un membre |
| Décision attendue | Révoquer sessions et accès, puis transférer les responsabilités de façon contrôlée |
| Raison | La continuité ne justifie pas de conserver un accès |
| Preuve | Heure de révocation, ressources transférées et exceptions justifiées |

### S12 — Compte partagé d’agence

| Champ | Valeur |
|---|---|
| Acteur | Plusieurs personnes utilisant le même identifiant |
| Demande | Réaliser des actions métier |
| Décision attendue | Refuser le modèle et migrer vers des comptes individuels |
| Raison | Attribution, révocation et audit impossibles |
| Preuve | Plan de correction sans publier les identifiants concernés |

## 6. Scénarios joueur et partage

### S13 — Dossier agent présenté comme profil officiel

| Champ | Valeur |
|---|---|
| Acteur | Agent possédant un dossier privé |
| Demande | Publier ce dossier comme profil officiel du joueur |
| Décision attendue | Refuser ou exiger un flux de contrôle distinct |
| Raison | Propriété du dossier et autorité du joueur sont différentes |
| Preuve | Source des champs, audience et validation applicable |

### S14 — Partage volontaire limité d’un joueur majeur

| Champ | Valeur |
|---|---|
| Acteur | Joueur majeur dans un futur espace Player |
| Demande | Rendre certains champs visibles à une audience définie pendant une période |
| Décision attendue | Autoriser sous conditions et permettre le retrait applicable |
| Raison | Audience, finalité, contenu et durée sont compréhensibles |
| Preuve | Reçu de consentement ou d’autorisation et historique des changements |

### S15 — Retrait de visibilité

| Champ | Valeur |
|---|---|
| Acteur | Joueur ayant activé une visibilité optionnelle |
| Demande | Retirer cette visibilité |
| Décision attendue | Retirer l’exposition future sans délai indu ; conserver seulement les preuves justifiées |
| Raison | Contrôle réel et absence de rétention artificielle |
| Preuve | Date du retrait, surfaces désactivées et conservation résiduelle justifiée |

### S16 — Paiement pour contacter un joueur

| Champ | Valeur |
|---|---|
| Acteur | Agent ou intermédiaire |
| Demande | Acheter les coordonnées ou une introduction individuelle |
| Décision attendue | Refuser |
| Raison | Le paiement ne crée ni consentement ni autorité ; risque juridique signalé |
| Preuve | Règle commerciale et juridique applicable, sans stocker de donnée inutile |

## 7. Scénarios mineurs

### S17 — Profil d’un mineur visible par défaut

| Champ | Valeur |
|---|---|
| Acteur | Compte ou dossier concernant un mineur |
| Demande | Apparaître automatiquement dans un radar ou une recherche |
| Décision attendue | Refuser |
| Raison | Invisibilité par défaut et gouvernance dédiée absente |
| Preuve | Contrôle d’âge applicable et politique de blocage |

### S18 — Adulte se déclarant représentant légal

| Champ | Valeur |
|---|---|
| Acteur | Adulte connecté |
| Demande | Autoriser une visibilité au nom d’un mineur sur simple déclaration |
| Décision attendue | Escalader ; ne pas ouvrir la visibilité |
| Raison | Le lien et l’autorité doivent être prouvés selon le cadre applicable |
| Preuve | Demande minimale, statut et procédure sans conserver de document excessif |

### S19 — Contact direct non autorisé d’un mineur

| Champ | Valeur |
|---|---|
| Acteur | Professionnel ou compte tiers |
| Demande | Envoyer un message direct à un mineur hors flux autorisé |
| Décision attendue | Refuser, signaler selon le risque et proposer le canal protégé approprié |
| Raison | Protection renforcée et prévention du contournement |
| Preuve | Événement de sécurité et traitement de modération proportionné |

## 8. Scénarios club

### S20 — Recruteur officiellement rattaché à un club

| Champ | Valeur |
|---|---|
| Acteur | Membre club dont l’appartenance et la fonction sont actives |
| Demande | Publier un besoin dans le périmètre attribué |
| Décision attendue | Autoriser sous politique et revue adaptées |
| Raison | Personne, organisation, fonction et action concordent |
| Preuve | Membership, fonction, date et auteur du besoin |

### S21 — Ancien membre du club

| Champ | Valeur |
|---|---|
| Acteur | Personne dont l’appartenance a pris fin |
| Demande | Modifier un besoin officiel historique |
| Décision attendue | Refuser |
| Raison | La relation passée n’accorde pas d’autorité actuelle |
| Preuve | Date de fin et décision de refus |

### S22 — Estimation d’agent attribuée au club

| Champ | Valeur |
|---|---|
| Acteur | Agent préparant une fiche CRM |
| Demande | Présenter un budget ou besoin estimé comme déclaration officielle du club |
| Décision attendue | Refuser la qualification officielle ; marquer `estimé` et sourcer |
| Raison | L’auteur et l’état de l’information doivent rester visibles |
| Preuve | Provenance, date, confiance qualitative et correction |

## 9. Scénarios de vérification et administration

### S23 — Vérificateur examinant sa propre demande

| Champ | Valeur |
|---|---|
| Acteur | Personne cumulant demandeur et vérificateur |
| Demande | Approuver son propre titre |
| Décision attendue | Refuser et réaffecter |
| Raison | Conflit d’intérêts direct |
| Preuve | Réaffectation et motif, sans altérer la demande originale |

### S24 — Support nécessitant un accès exceptionnel

| Champ | Valeur |
|---|---|
| Acteur | Membre support habilité |
| Demande | Consulter temporairement une information pour résoudre un incident |
| Décision attendue | Autoriser sous conditions si aucune solution moins intrusive n’existe |
| Raison | Finalité, périmètre, durée et justification explicites |
| Preuve | Ticket, approbation appropriée, accès et clôture |

### S25 — Administrateur technique voulant exporter les portefeuilles

| Champ | Valeur |
|---|---|
| Acteur | Administrateur de plateforme |
| Demande | Exporter toutes les données métier pour une analyse non approuvée |
| Décision attendue | Refuser |
| Raison | Le rôle technique ne confère ni finalité ni droit sur les données |
| Preuve | Refus et éventuelle demande formelle de projet distinct |

### S26 — Révocation d’une vérification

| Champ | Valeur |
|---|---|
| Acteur | Autorité interne habilitée selon procédure |
| Demande | Révoquer une affirmation après preuve nouvelle |
| Décision attendue | Autoriser sous contrôle, conserver historique et informer les surfaces dépendantes |
| Raison | La confiance doit pouvoir expirer ou être corrigée |
| Preuve | Source, décideur, date, motif, recours et effets appliqués |

## 10. Scénarios de réputation et automatisation

### S27 — Avis anonyme sans relation prouvée

| Champ | Valeur |
|---|---|
| Acteur | Compte quelconque |
| Demande | Noter publiquement un agent |
| Décision attendue | Refuser |
| Raison | Relation, modération et droit de réponse manquent |
| Preuve | Règle de refus ; ne pas publier le contenu |

### S28 — Priorité commerciale déguisée

| Champ | Valeur |
|---|---|
| Acteur | Organisation ayant payé une option |
| Demande | Apparaître comme recommandation organique ou contact prioritaire |
| Décision attendue | Refuser ou séparer explicitement le placement commercial |
| Raison | La confiance et l’autorité ne sont pas achetables |
| Preuve | Nature commerciale, audience et règle de présentation |

### S29 — IA prête à envoyer un message externe

| Champ | Valeur |
|---|---|
| Acteur | Utilisateur autorisé aidé par PARZI |
| Demande | Envoyer automatiquement un message contenant des données relationnelles |
| Décision attendue | Exiger la confirmation proportionnée et afficher destinataire, contenu et données |
| Raison | Responsabilité humaine et décision TII-D015 |
| Preuve | Confirmation, version envoyée et auteur humain |

### S30 — Donnée métier interprétée comme instruction

| Champ | Valeur |
|---|---|
| Acteur | Service assisté par IA |
| Demande | Suivre une instruction cachée dans une note ou un document métier |
| Décision attendue | Refuser l’instruction non fiable et poursuivre selon la politique système |
| Raison | Les données métier ne définissent pas l’autorité de l’outil |
| Preuve | Incident technique sans exposer le contenu sensible inutilement |

## 11. Scénarios complémentaires issus du contre-audit

### S31 — Ingénierie sociale contre le support

| Champ | Valeur |
|---|---|
| Acteur | Personne contactant le support sans preuve suffisante |
| Demande | Réinitialiser un accès, modifier un e-mail ou obtenir une information sensible |
| Décision attendue | Refuser l’action sensible et déclencher la procédure de vérification du demandeur |
| Raison | La connaissance d’informations personnelles ne prouve pas l’identité |
| Preuve | Méthode de contrôle, décision et signal de risque sans stocker de secret supplémentaire |

### S32 — Partage de façade entre deux organisations

| Champ | Valeur |
|---|---|
| Acteur | Membres de deux agences distinctes |
| Demande | Partager massivement des portefeuilles sous couvert d’un consentement générique |
| Décision attendue | Refuser le partage global ; exiger objet, finalité, minimisation, personnes concernées et durée |
| Raison | Un accord latéral ne contourne ni cloisonnement ni droits des sujets de données |
| Preuve | Organisations, ressources, finalité, autorité et résultat du contrôle |

### S33 — Demande de correction contestée par l’agent

| Champ | Valeur |
|---|---|
| Acteur | Joueur concerné par un dossier privé d’agent |
| Demande | Corriger une donnée que l’agent affirme devoir conserver |
| Décision attendue | Placer la donnée en état contesté, accuser réception et orienter vers l’autorité compétente |
| Raison | PARZI ne doit ni ignorer la demande ni supprimer automatiquement une preuve justifiée |
| Preuve | Demande, réponse, état contesté, délai et décision compétente ultérieure |

### S34 — Profil ou preuve synthétique fabriqué

| Champ | Valeur |
|---|---|
| Acteur | Utilisateur ou service automatisé |
| Demande | Publier un faux profil, une fausse preuve ou un contenu imitant un joueur, club ou autorité |
| Décision attendue | Refuser, préserver une preuve proportionnée et transmettre au canal de sécurité ou modération |
| Raison | Provenance, consentement et authenticité manquent |
| Preuve | Élément nécessaire à l’enquête, auteur, décision et retrait sans rediffusion inutile |

### S35 — Fin ou transfert d’une représentation

| Champ | Valeur |
|---|---|
| Acteur | Agent A dont la relation avec un joueur prend fin |
| Demande | Continuer à utiliser, partager ou prospecter avec le dossier comme avant |
| Décision attendue | Refuser les usages qui ne disposent plus d’autorité ; décider séparément conservation, accès et transfert légitime |
| Raison | Une relation passée ne produit pas un droit permanent |
| Preuve | Date, source de fin, usages arrêtés, conservation justifiée et information appropriée |

### S36 — Revendications concurrentes de représentation

| Champ | Valeur |
|---|---|
| Acteur | Agents A et B revendiquant le même joueur |
| Demande | Obtenir une exclusivité d’accès ou faire retirer l’autre agent |
| Décision attendue | Placer la relation en état contesté, geler les actions sensibles et escalader |
| Raison | Un dossier ou une déclaration ne donne pas à PARZI l’autorité de trancher le conflit |
| Preuve | Revendications, sources, décisions temporaires et autorité saisie |

### S37 — Faux club ou faux représentant

| Champ | Valeur |
|---|---|
| Acteur | Personne utilisant le nom ou le domaine d’une organisation |
| Demande | Créer un profil officiel et recevoir des dossiers joueurs |
| Décision attendue | Refuser jusqu’au contrôle séparé de l’organisation et du pouvoir actuel du représentant |
| Raison | Identité personnelle et représentation organisationnelle sont distinctes |
| Preuve | Sources, organisation, fonction, période et résultat de vérification |

### S38 — Export massif avant départ

| Champ | Valeur |
|---|---|
| Acteur | Membre encore habilité mais sur le départ |
| Demande | Exporter un volume inhabituel de dossiers ou documents |
| Décision attendue | Appliquer les limites proportionnées, alerter selon politique et soumettre l’exception à une revue indépendante |
| Raison | Une permission de lecture ne produit pas automatiquement un droit d’exfiltration massive |
| Preuve | Volume, finalité déclarée, politique, décision et notification appropriée |

### S39 — Accès exceptionnel à une note privée

| Champ | Valeur |
|---|---|
| Acteur | Dirigeant ou administrateur d’organisation |
| Demande | Lire la note privée d’un membre pour une raison présentée comme exceptionnelle |
| Décision attendue | Refuser l’auto-autorisation ; exiger nécessité, approbateur distinct, périmètre minimal, audit et notification sauf interdiction compétente |
| Raison | La hiérarchie ne transforme pas le privé en donnée organisationnelle |
| Preuve | Motif, approbateur, champs consultés, durée et notification |

### S40 — Ouverture d’un nouveau pays

| Champ | Valeur |
|---|---|
| Acteur | Équipe PARZI préparant un Country Pack |
| Demande | Ouvrir inscriptions et traitements après simple traduction |
| Décision attendue | Refuser tant que définition locale de l’agent, organisations, mineurs, résidence, transferts de données, support et recours ne sont pas validés |
| Raison | Une langue ne crée ni autorité ni conformité locale |
| Preuve | Responsables locaux, avis compétents, politiques, tests et décision Go/No-Go du pays |

## 12. Porte de qualité future

Une future politique d’autorisation ne doit pas être considérée prête si elle ne démontre pas au minimum :

- refus des accès croisés ;
- distinction parcours et titre ;
- expiration territoriale des contrôles sensibles ;
- partage temporaire réellement révoqué ;
- départ d’un membre sans accès résiduel ;
- séparation privé/workspace ;
- refus des comptes partagés ;
- blocage des scénarios mineurs non gouvernés ;
- séparation administrateur, support et vérificateur ;
- audit lisible sans collecte excessive ;
- comportement sûr lorsque relation, consentement ou provenance manque.
- fin ou transfert de représentation sans accès résiduel injustifié ;
- vérification séparée de l’organisation et de son représentant ;
- support résistant à l’ingénierie sociale ;
- export inhabituel soumis à une politique proportionnée ;
- ouverture internationale bloquée sans Country Pack complet.

## 13. État actuel

Ces quarante scénarios forment un corpus de contre-audit documentaire. Ils ne prouvent pas que le produit actuel les satisfait. Leur traduction en tests appartient aux tickets et tomes spécialisés, après autorisation.
