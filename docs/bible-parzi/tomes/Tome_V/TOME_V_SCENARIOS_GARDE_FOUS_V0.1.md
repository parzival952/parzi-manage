# Tome V — Scénarios de garde-fous du premier parcours

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Contre-audit documentaire proposé |
| Scénarios | TV-S001 à TV-S040 |
| Nature | Attendus produit et métier ; aucun test technique exécuté |
| Effet applicatif | Aucun |

## 1. Méthode

Chaque scénario tente de faire franchir au parcours une frontière que l’enthousiasme commercial pourrait masquer.

Un scénario est **satisfait documentairement** lorsque la Constitution, le registre et la carte produisent l’attendu indiqué. Cela ne prouve pas que le produit actuel l’implémente.

Résultats possibles :

- **AUTORISER** : la progression peut continuer sous les autres portes ;
- **PRÉPARER SEULEMENT** : travail interne ou synthétique, sans action externe ;
- **BLOQUER** : aucune progression vers le contact ;
- **CLORE** : fin de la finalité de contact ;
- **CONTESTER / ESCALADER** : gel et revue compétente ;
- **MODE SÛR** : suspension d’actions externes.

## 2. Autorité et modes

| ID | Situation | Attendu | Porte | Risque contré |
|---|---|---|---|---|
| TV-S001 | Un aspirant termine toutes les leçons Academy et veut contacter une cible réelle | PRÉPARER SEULEMENT ; Academy ne confère aucune autorité | P1 | Confusion formation/licence |
| TV-S002 | L’utilisateur choisit « je suis agent » à l’onboarding sans soumettre de contrôle | PRÉPARER SEULEMENT | P1 | Auto-attribution d’un droit |
| TV-S003 | Une vérification est `pending`, mais l’utilisateur a déjà un numéro de licence | PRÉPARER SEULEMENT | P1 | Action avant contrôle |
| TV-S004 | Le statut global est `verified`, mais le territoire et la validité ne sont pas connus | BLOQUER M3 jusqu’à claim précis | P1 | Badge universel trompeur |
| TV-S005 | L’autorité était valide hier et expire aujourd’hui avant l’envoi | MODE SÛR ; nouvelle vérification | P1/P8 | Course à l’expiration |
| TV-S006 | Un administrateur de plateforme veut se vérifier lui-même pour tester | BLOQUER et séparer les fonctions | P1 | Conflit d’intérêts |
| TV-S007 | Un agent autorisé en France prépare une approche relevant d’un autre territoire | PRÉPARER ou BLOQUER selon le cas ; aucune portée universelle | P1/P2 | Extraterritorialité implicite |
| TV-S008 | Un abonnement supérieur promet de débloquer le contact malgré un claim absent | BLOQUER | P1 | Autorité achetable |

## 3. Sources, identité et représentation

| ID | Situation | Attendu | Porte | Risque contré |
|---|---|---|---|---|
| TV-S009 | Une fiche publique ne mentionne aucun agent | État `inconnu`, RECHERCHE SEULEMENT | P5 | Absence transformée en vérité |
| TV-S010 | Un ami affirme qu’un joueur vient de quitter son agent | État `déclaré` non suffisant, vérifier ; pas de contact | P3/P5 | Rumeur et conflit |
| TV-S011 | Une base indique une fin de mandat la semaine dernière | Revalidation requise ; ne pas inférer de disponibilité | P3/P5 | Donnée ancienne |
| TV-S012 | Le joueur déclare directement, dans un contexte admissible, ne pas être représenté | P5 peut ouvrir sous les autres portes ; conserver contexte et date | P5 | Surinterprétation d’une déclaration |
| TV-S013 | Deux agents revendiquent la même relation | CONTESTER / ESCALADER ; geler le contact et la transition | P5/P10 | Arbitrage implicite |
| TV-S014 | Un fichier de mille contacts est acheté à un courtier | BLOQUER l’import et le contact | P3/P6 | Vente de données et spam |
| TV-S015 | Un stagiaire scrape des profils sociaux publics | BLOQUER ; public ≠ librement réutilisable | P3 | Scraping opportuniste |
| TV-S016 | Une introduction est envoyée par un contact commun sans accord de la personne | PRÉPARER SEULEMENT ; demander une introduction consentie, sans transmettre de données excessives | P3/P6 | Faux consentement par tiers |
| TV-S017 | La personne accepte explicitement une introduction limitée | AUTORISER la qualification, pas un mandat | P3/P6 | Extension silencieuse de finalité |
| TV-S018 | La source autorisée retire ultérieurement ses droits d’usage | MODE SÛR ; revoir les fiches et actions dérivées | P3 | Droits périmés |

## 4. Mineurs et personnes vulnérables

| ID | Situation | Attendu | Porte | Risque contré |
|---|---|---|---|---|
| TV-S019 | La fiche indique dix-sept ans | BLOQUER et rendre invisible au parcours pilote | P4 | Ciblage d’un mineur |
| TV-S020 | L’âge n’est pas connu, mais la personne joue en équipe senior | BLOQUER ; aucune déduction de majorité | P4 | Majorité supposée |
| TV-S021 | L’âge affiché sur deux sources est contradictoire | CONTESTER, BLOQUER et minimiser la recherche | P4 | Donnée incohérente |
| TV-S022 | Le mineur est très prometteur et son parent a un numéro public | BLOQUER ; ne pas contourner par le parent | P4/P6 | Contournement protecteur |
| TV-S023 | Le club formateur propose une mise en relation avec un mineur | BLOQUER le parcours Tome V ; chantier séparé requis | P4 | Autorité présumée du club |
| TV-S024 | L’utilisateur saisit `18` par défaut pour franchir le formulaire | BLOQUER si la majorité n’est pas prouvée ; journaliser la contradiction | P4 | Contournement par valeur par défaut |

## 5. Proposition, IA et vérité

| ID | Situation | Attendu | Porte | Risque contré |
|---|---|---|---|---|
| TV-S025 | L’IA invente l’intérêt d’un club pour rendre le message convaincant | BLOQUER le brouillon ; incident qualité | P7 | Hallucination à enjeu élevé |
| TV-S026 | L’agent connaît réellement un recruteur mais n’a aucune permission de citer son nom | Omettre ou anonymiser ; ne pas utiliser la relation comme pression | P7 | Réseau détourné |
| TV-S027 | Une estimation de valeur marchande est disponible sans méthode ni date | Marquer manquante ou inutilisable, jamais fait | P7 | Estimation déguisée |
| TV-S028 | Le débutant veut utiliser « agence internationale » grâce au branding PARZI | BLOQUER ; identité exacte exigée | P7 | Fausse puissance |
| TV-S029 | L’IA propose « opportunité à saisir avant vendredi » sans échéance réelle | Retirer ; aucune fausse urgence | P7 | Manipulation |
| TV-S030 | L’utilisateur demande un mandat « conforme FIFA et FFF » généré sur mesure | Refuser la conformité ; fournir au plus une checklist et une orientation | P10 | Pseudo-conseil juridique |
| TV-S031 | Une source contient une statistique flatteuse non vérifiée | Étiqueter manquante/contestée et exclure du message | P3/P7 | Claim non prouvé |
| TV-S032 | L’IA classe les cibles par « faciles à convaincre » | Rejeter le score | P2/P7 | Notation de vulnérabilité/docilité |

## 6. Contact, refus et transition

| ID | Situation | Attendu | Porte | Risque contré |
|---|---|---|---|---|
| TV-S033 | Toutes les portes sont ouvertes et l’agent a validé le message | AUTORISER un contact unique tracé | P8 | Envoi non contrôlé |
| TV-S034 | L’agent sélectionne vingt fiches et confirme un envoi groupé | BLOQUER le lot | P8 | Prospection de masse |
| TV-S035 | La personne répond « pas intéressé » | CLORE ; aucune relance | P9 | Pression après refus |
| TV-S036 | Aucun retour au premier message ; le contexte autorise encore une relance | Une seule relance humaine et contextualisée, puis attente | P6/P9 | Séquence automatique |
| TV-S037 | Aucun retour après la relance | CLORE | P9 | Harcèlement |
| TV-S038 | La personne accepte un échange de quinze minutes | Passer à conversation consentie, sans inférer de mandat | P9 | Consentement étendu |
| TV-S039 | Après un rendez-vous, l’agent déplace la fiche dans « mes joueurs » | BLOQUER la transition directe | P10 | Relation inventée |
| TV-S040 | Un mandat externe est signé puis déclaré dans PARZI | Enregistrer comme déclaration ou preuve selon contrôle ; ne pas attribuer automatiquement le résultat à PARZI | P10 | Causalité et statut non contrôlés |

## 7. Couverture des décisions

| Domaine | Scénarios | Décisions principales couvertes |
|---|---|---|
| Autorité et modes | TV-S001 à TV-S008 | TV-D004 à TV-D006, TV-D014, TV-D044 |
| Source et représentation | TV-S009 à TV-S018 | TV-D009, TV-D010, TV-D012 à TV-D017 |
| Mineurs | TV-S019 à TV-S024 | TV-D011, TV-D014, TV-D042 |
| Proposition et IA | TV-S025 à TV-S032 | TV-D022 à TV-D031, TV-D038 |
| Contact et transition | TV-S033 à TV-S040 | TV-D018 à TV-D021, TV-D032, TV-D035 à TV-D037 |

## 8. Résultat du contre-audit documentaire interne

La version 0.1 produit un attendu sûr pour les quarante scénarios :

- huit scénarios d’autorité ;
- dix scénarios de source ou de représentation ;
- six scénarios de protection des mineurs ;
- huit scénarios de vérité et d’IA ;
- huit scénarios de contact et de transition.

Ce résultat signifie seulement que les documents sont cohérents à ce niveau de lecture. Il ne signifie pas :

- que le produit actuel possède ces portes ;
- que les règles juridiques sont validées ;
- que les sources sont disponibles ;
- que l’interface résiste aux contournements ;
- que le segment accepte l’effort demandé ;
- qu’un pilote réel est autorisé.

## 9. Scénarios encore nécessaires avant exécution

Un futur test technique devra ajouter :

- concurrence de sessions et expiration d’autorité pendant une action ;
- incohérence entre cache, serveur et journal ;
- import partiel et rollback ;
- export de données et captures d’écran ;
- opposition reçue sur un autre canal ;
- suppression, correction et conservation minimale ;
- indisponibilité d’une source de vérification ;
- compromission d’un compte ;
- injection de prompt via une source ;
- fuite de données entre agents ;
- manipulation par un administrateur ou un support ;
- tests propres à chaque Country Pack.

Ils ne doivent être écrits comme tests exécutoires qu’après choix d’architecture et autorisation.

## 10. Seuil de suspension proposé

Toute expérimentation future passe immédiatement en mode sûr si elle révèle :

- exposition d’un mineur ;
- contact après opposition ;
- donnée sans provenance utilisée pour agir ;
- action externe sans confirmation humaine ;
- claim professionnel trompeur ;
- conflit de représentation ignoré ;
- source acquise sans droits ;
- fuite entre utilisateurs ;
- document juridique présenté à tort comme conforme.

La croissance ou les retours positifs ne compensent pas ces événements.
