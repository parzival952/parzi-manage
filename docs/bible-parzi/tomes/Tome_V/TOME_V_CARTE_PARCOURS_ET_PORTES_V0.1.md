# Tome V — Carte du parcours et portes de sécurité

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Spécification documentaire proposée |
| Couverture | Modes, états, portes, sorties, responsabilités et mode sûr |
| Exécution | Aucune ; aucun test technique exécuté |

## 1. Lecture générale

Le parcours n’est pas un tunnel qui pousse vers un message. C’est une machine à décisions réversibles.

```text
ORIENTATION
    ↓
AUTORITÉ ──fermée──→ APPRENDRE / PRÉPARER
    ↓ ouverte
TERRAIN D’ACTION
    ↓
SOURCE → FICHE MINIMALE → QUALIFICATION
                           ├─ bloquée → corriger ou clore
                           ├─ recherche seulement → compléter
                           └─ admissible → préparer
                                             ↓
                                      DÉCISION HUMAINE
                                      ├─ annuler / clore
                                      └─ contacter
                                             ↓
                                          RÉPONSE
                   ┌─────────────────────────┼─────────────────────────┐
                 refus                    silence              consentement
                   ↓                        ↓                         ↓
                 clore        relance admissible ou clore     conversation
                                                                     ↓
                                                      transition externe contrôlée
                                                                     ↓
                                                               apprentissage
```

À chaque étape, la sortie sûre est aussi importante que la progression.

## 2. Modes

### M0 — Découverte

**Public :** tout nouvel utilisateur.

**Capacités :** comprendre les chemins, les limites et les données requises.

**Interdictions :** aucune collecte sensible, aucune recommandation de personne, aucune action externe.

### M1 — Apprentissage

**Public :** aspirant ou utilisateur sans autorité professionnelle applicable.

**Capacités :** Academy, cas synthétiques, quiz, simulation, préparation de méthode.

**Interdictions :** données réelles identifiantes de cibles, export, contact, mandat, accès privilégié.

### M2 — Préparation professionnelle

**Public :** affirmation non soumise, en attente, incomplète ou hors contexte.

**Capacités :** terrain d’action, proposition de valeur, sources autorisées, dossiers synthétiques ou anonymisés.

**Interdictions :** action externe facilitée, donnée réelle sensible, statut public de confiance.

### M3 — Action professionnelle contrôlée

**Public :** autorité précise, active et applicable.

**Capacités :** qualifier une cible adulte, préparer puis confirmer une approche admissible.

**Interdictions :** automatisation, mineurs, source sans droits, représentation inconnue présentée comme absente, contact acheté.

### MS — Mode sûr

**Déclencheurs :** autorité expirée, contradiction, incident, opposition, conflit, source révoquée, règle indisponible ou panne d’un contrôle critique.

**Effet :** geler les actions externes, préserver les preuves nécessaires, expliquer le motif et permettre correction ou recours.

## 3. États d’une fiche de recherche

| Code | État | Signification | Action suivante autorisée |
|---|---|---|---|
| S0 | Brouillon | Informations incomplètes, aucune qualification | Compléter ou supprimer |
| S1 | Recherche seulement | Source ou porte encore à établir | Recherche admissible, sans contact |
| S2 | Bloquée | Une condition interdit la progression | Corriger si possible, contester ou clore |
| S3 | À qualifier | Données minimales présentes, portes non résolues | Examiner les portes |
| S4 | Admissible à préparer | Portes personne et source résolues | Préparer une proposition |
| S5 | Prête pour décision humaine | Brouillon, preuves et risques visibles | Confirmer ou annuler |
| S6 | Contactée | Action externe unique tracée | Attendre, traiter la réponse |
| S7 | Relance consommée | Relance admissible effectuée | Attendre puis clore si silence |
| S8 | Conversation consentie | La personne accepte de poursuivre | Construire la relation sans inférer de mandat |
| S9 | Refusée / close | Refus, opposition, inadmissibilité ou abandon | Ne plus contacter ; conservation minimale |
| S10 | Transition de représentation | Formalisation envisagée hors du simple parcours | Contrôle distinct, externe tant que non construit |
| S11 | Portefeuille prouvé | Relation documentée selon le modèle futur | Ouvrir dossier privé approprié |
| S12 | Contestée | Informations ou revendications incompatibles | Geler et orienter vers résolution compétente |

Les états ne mesurent ni potentiel, ni qualité, ni docilité. Ils décrivent le travail restant et la permission applicable.

## 4. Portes

### P0 — Orientation

| Question | Réponse ouverte | Réponse fermée |
|---|---|---|
| L’utilisateur comprend-il les deux modes ? | Choix explicite | Représenter les limites |
| Sait-il que PARZI ne promet aucun mandat ? | Continuer | Exiger compréhension |
| Le cas est-il réel ou synthétique ? | Étiqueter | Refuser l’ambiguïté |

**Preuve minimale :** choix, contexte, date.

### P1 — Autorité professionnelle

| Contrôle | Ouvert si | Fermé si |
|---|---|---|
| Identité du compte | personne authentifiée | session absente ou incohérente |
| Objet du contrôle | titre ou autorité nommée | badge vague |
| Autorité source | organisme compétent identifié | source interne non suffisante |
| Territoire | compatible avec l’action | absent ou hors périmètre |
| Validité | active à la date utile | expirée, suspendue, révoquée |
| État | non contesté | pending, rejected, contested |

**Sortie fermée :** M1 ou M2, jamais M3.

### P2 — Terrain et finalité

| Contrôle | Ouvert si | Fermé si |
|---|---|---|
| Territoire de travail | limité et compatible | « partout » sans base |
| Catégorie | adulte explicitement | mineur ou âge inconnu visé |
| Besoin | précis et compréhensible | simple désir de volume |
| Proposition | compétence réelle | promesse ou prestige inventé |
| Finalité | recherche professionnelle légitime | revente de contact, publicité cachée, autre |
| Exclusions | définies | aucune limite |

**Preuve minimale :** thèse datée, auteur, raisons et exclusions.

### P3 — Source et droits d’usage

| Contrôle | Ouvert si | Fermé si |
|---|---|---|
| Source | identifiée | inconnue ou « trouvée sur internet » |
| Date | suffisamment fraîche | obsolète sans revalidation |
| Finalité source | compatible | incompatible ou non documentée |
| Conditions | autorisent l’usage envisagé | interdites, absentes ou contestées |
| Import | ciblé et nécessaire | massif ou opportuniste |
| Sensibilité | minimisée | collecte excessive |

**Sortie fermée :** S1 si une recherche sûre est possible, S2 sinon.

### P4 — Majorité et protection

| État | Décision pilote |
|---|---|
| Adulte suffisamment établi | Peut poursuivre |
| Adulte seulement supposé | Bloqué jusqu’à preuve proportionnée |
| Âge absent | Bloqué |
| Données contradictoires | Contesté et bloqué |
| Mineur | Bloqué et invisible au parcours |

**Règle :** aucune estimation visuelle ou déduction par compétition ne suffit.

### P5 — Représentation et conflit

| État | Décision |
|---|---|
| Représenté confirmé | Contact de représentation bloqué |
| Non-représenté déclaré directement dans un cadre admissible | Peut poursuivre sous autres contrôles |
| Inconnu | Recherche seulement |
| Ancienne information | Revalidation requise |
| Contesté | Gel et résolution compétente |
| « Aucun agent affiché » | Inconnu, jamais non-représenté |

**Règle :** une échéance de mandat ne prouve pas sa fin, son absence de renouvellement ni la disponibilité de la personne.

### P6 — Contact

| Contrôle | Ouvert si | Fermé si |
|---|---|---|
| Canal | compatible avec le contexte et les règles | canal interdit ou détourné |
| Coordonnée | provenance admissible | achat, fuite, scraping ou tiers non autorisé |
| Finalité | unique et annoncée | multiple ou cachée |
| Historique | aucun refus/opposition actif | refus, opposition, blocage ou clôture |
| Fréquence | premier contact ou relance encore admissible | répétition ou séquence |
| Sortie | possibilité claire de décliner | pression ou absence de sortie |

**Règle :** disponibilité technique d’un canal ≠ permission.

### P7 — Exactitude de la proposition

| Contrôle | Ouvert si | Fermé si |
|---|---|---|
| Identité agent | exacte | agence, rôle ou expérience exagérés |
| Relations clubs | prouvées et pertinentes | intérêt inventé ou ambigu |
| Compétences | démontrables | affirmations vagues non prouvées |
| Statistiques | source, date et contexte | chiffre sans source |
| Estimations | nommées comme telles | présentées comme faits |
| Promesses | aucune garantie | carrière, contrat, sélection ou revenu promis |

### P8 — Décision humaine

| Contrôle | Ouvert si | Fermé si |
|---|---|---|
| Agent autorisé | relit et confirme | envoi par défaut ou par IA |
| Portes | toutes ouvertes | une porte inconnue ou fermée |
| Version du message | visible | texte modifié après confirmation |
| Risques | visibles | masqués par le score ou l’interface |
| Action | unique et explicite | lot ou automation |

**Trace :** décideur, version, heure, canal, finalité et motif.

### P9 — Réponse, opposition et clôture

| Réponse | État suivant | Règle |
|---|---|---|
| Consent à converser | S8 | Ne pas inférer de mandat |
| Demande plus tard | Attente datée | Pas de relance avant la date convenue |
| Déjà représenté | S9 ou S12 | Fermer ou examiner le conflit sans pression |
| Refus | S9 | Aucun nouveau contact de même finalité |
| Opposition générale | S9 protégée | Conservation minimale pour la respecter |
| Silence premier message | attente ou relance admissible | Une seule selon contexte |
| Silence après relance | S9 | Clôture |
| Réponse hostile ou plainte | MS | Geler, préserver, escalader |

### P10 — Transition de représentation

| Contrôle | Condition cible |
|---|---|
| Volonté | explicite et libre des parties |
| Identités | suffisamment établies |
| Autorité agent | valide dans le contexte |
| Représentation existante | absente ou situation résolue |
| Document | source, version, territoire et revue adaptés |
| Périmètre | explicite |
| Durée et fin | explicites |
| Conseils | orientation compétente lorsque nécessaire |
| Traçabilité | événement distinct, non inféré |

**Position actuelle :** porte non construite ; transition marquée externe.

## 5. Responsabilités

| Décision | Propriétaire | Décideur | Assistance PARZI | Personne concernée |
|---|---|---|---|---|
| Choix du mode | Utilisateur | Utilisateur | Explique les limites | — |
| Contrôle d’autorité | Fonction de vérification distincte | Vérificateur autorisé | Conserve preuve et état | Agent |
| Terrain | Agent | Agent | Structure et challenge | Futurs contacts indirectement |
| Admission d’une source | Gouvernance produit/donnée | Fonction autorisée | Applique le contrat | Personnes dans la source |
| Qualification cible | Agent | Agent sous politique | Signale inconnues et blocages | Joueur |
| Contact | Agent | Agent autorisé | Prépare, ne décide pas | Joueur ou contact |
| Opposition | Plateforme + agent | Politique ferme | Bloque les suites | Opposant |
| Transition | Parties et professionnels compétents | Parties autorisées | Documente sans imposer | Joueur et agent |
| Incident | Sécurité/conformité distinctes | Autorité désignée | Passe en mode sûr | Toutes personnes concernées |

## 6. Événements de preuve

Chaque transition importante produit un événement documentaire :

| Événement | Contenu minimal |
|---|---|
| Mode choisi | mode, motif, date, version des limites |
| Autorité contrôlée | claim, source, territoire, validité, état, contrôleur |
| Source examinée | type, référence autorisée, date, finalité, résultat |
| Porte résolue | porte, résultat, preuve, décideur, prochaine revue |
| Message confirmé | version, décideur, canal, finalité, timestamp |
| Réponse classée | catégorie factuelle, source, date, sans interprétation psychologique |
| Opposition reçue | périmètre, date, effet de blocage |
| Fiche close | motif, conservation décidée, date |
| Transition externe | déclaration, état de preuve, aucune causalité automatique |

## 7. Mode dégradé

| Panne ou doute | Comportement sûr |
|---|---|
| Service de vérification indisponible | Ne pas ouvrir M3 ; conserver M1/M2 |
| Source inaccessible | Marquer ancienne ou manquante ; fermer P3 |
| Règle territoriale non disponible | Fermer P6 |
| IA indisponible | Permettre revue manuelle sans perte de preuves |
| Journalisation indisponible | Interdire l’action externe |
| Opposition non synchronisée | Suspendre toute action sur la personne |
| Conflit de représentation découvert | Passer S12 et geler |
| Incohérence d’âge | Fermer P4 et masquer des flux d’action |

Le mode dégradé ne doit jamais « laisser passer pour ne pas bloquer le business ».

## 8. Contrat d’interface

L’interface future devrait :

- montrer pourquoi une porte est ouverte ou fermée ;
- employer des verbes exacts : rechercher, qualifier, préparer, décider, contacter, clore ;
- éviter « disponible », « accessible » ou « sans agent » sans preuve ;
- afficher les inconnues avant le score ou la recommandation ;
- donner une sortie sûre à chaque étape ;
- distinguer une simulation d’un cas réel ;
- ne jamais célébrer un volume de contacts ;
- célébrer une qualification propre, une correction et une clôture respectée ;
- permettre contestation et correction ;
- ne pas utiliser de compte à rebours ou urgence artificielle.

## 9. Critères documentaires d’acceptation

La carte est cohérente si :

1. aucun chemin ne transforme une auto-déclaration en action professionnelle ;
2. aucun chemin pilote n’atteint un mineur ;
3. aucune information absente ne devient « sans agent » ;
4. aucune source publique ne crée seule un droit de contact ;
5. aucune IA ne déclenche une action externe ;
6. un refus et une opposition ferment effectivement le parcours ;
7. une conversation positive ne devient pas mandat ;
8. une cible ne devient pas portefeuille sans transition ;
9. toute panne critique ferme la porte concernée ;
10. l’utilisateur comprend comment corriger ou clore.

## 10. Questions ouvertes

- Quel vocabulaire les agents comprennent-ils sans confondre vérification et approbation ?
- Quel niveau de provenance est assez utile sans rendre la saisie impossible ?
- Comment établir proportionnellement la majorité sans surcollecter ?
- Quelles sources directes sont réellement utilisées par les nouveaux agents ?
- Quelle proposition de valeur possèdent-ils avant leur premier mandat ?
- Quel délai et quelle règle locale rendent une relance admissible ?
- Comment préserver une opposition en minimisant les données ?
- Quel événement constitue une première relation légitime selon les utilisateurs ?
- Quand la transition de représentation doit-elle quitter le simple CRM ?
- Quelles portes doivent rester entièrement humaines ?

Ces questions exigent recherche et revue compétente. La carte ne les résout pas artificiellement.
