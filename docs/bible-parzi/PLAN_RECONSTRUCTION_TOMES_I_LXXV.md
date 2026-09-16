# Plan de reconstruction des Tomes I à LXXV

## Objet

Ce document organise la reconstruction future des Tomes I à LXXV avant toute construction produit fondée sur eux. Il ne constitue pas les tomes eux-mêmes et n’attribue pas aux archives des intitulés qui n’y ont pas été retrouvés.

Les titres inscrits dans le registre maître sont donc des **titres provisoires reconstruits**. Ils servent à séparer les sujets, ordonner les dépendances et préparer une rédaction tome par tome.

## Constat documentaire

- Aucun fichier autonome correspondant à un Tome I, II, III, et ainsi de suite jusqu’au Tome LXXV n’a été retrouvé dans le corpus consulté.
- Une synthèse reconstruite conserve huit blocs conceptuels : I–X, XI–XX, XXI–XXX, XXXI–XL, XLI–L, LI–LX, LXI–LXX et LXXI–LXXV.
- Les Tomes LXXVI et LXXVII existent comme documents complets.
- Le Tome LXXVIII est annoncé comme document futur, conditionné par la clôture vérifiée de R-001 à R-030.

## Avancement

| Périmètre | État au 23 juillet 2026 | Prochaine action |
|---|---|---|
| Tome I | Constitution centrale version 1.0 validée; dossier maître v0.5 et registre des trente décisions conservés | Maintenir les décisions et délégations; aucune exécution automatique |
| Tome II | Constitution centrale et registre version 1.0 validés : trente-quatre décisions validées, deux expérimentales et six principes à exécution différée | Maintenir les décisions et délégations ; aucune exécution automatique |
| Tome III | Constitution centrale et registre version 1.0 validés : quarante décisions validées, une modifiée, quatre expérimentales ; cahier du nouveau logo ouvert | Effectuer la validation physique d'impression du prototype ; poursuivre la recherche sans déploiement |
| Tome IV | Constitution centrale et registre version 1.0 validés : quarante-quatre décisions validées et TIV-D028 expérimentale ; personas U0 et réserves conservés | Maintenir les décisions ; déléguer les parcours détaillés aux Tomes V à VII |
| Tome V | Proposition CTO v0.1 : dossier maître, Constitution, quarante-huit décisions, carte à onze portes P0–P10, quarante scénarios et protocole terrain ; maturité U0 | Faire contre-auditer, intégrer les amendements puis soumettre les recommandations CTO amendées au fondateur ; aucune expérimentation réelle |
| Tomes VI à LXXV | À reconstruire individuellement | Attendre la décision sur le Tome V avant d’ouvrir le Tome VI |

## Tâches personnelles en attente

- [ ] **Tome III — Valider physiquement le prototype de logo** : imprimer l'épreuve et la fiche A4 à 100 % sans ajustement, vérifier que l'étalon mesure entre 99,5 et 100,5 mm, observer les seuils bloquants de 40 mm et 8 mm, puis conserver la fiche remplie et une photographie nette. Référence : `tomes/Tome_III/TOME_III_PROTOCOLE_VALIDATION_IMPRESSION_V0.1.md`.
- [x] **Comprendre l'utilité de la Bible PARZI** : synthèse fournie sur l'utilité des Tomes, leur hiérarchie, leur lien avec les décisions produit, les registres, les contre-audits et la traduction contrôlée vers les tickets R.

## Sources autorisées

La reconstruction doit respecter cet ordre de preuve :

1. code et migrations approuvés du dépôt ;
2. état réel contrôlé de Supabase et Vercel, sans exposition de secrets ;
3. Tome LXXVI pour le verdict d’audit ;
4. Tome LXXVII pour le plan de remédiation ;
5. Bible PARZI maître, arbre de l’univers et synthèse I–LXXV ;
6. documents historiques de vision et de stratégie ;
7. anciennes idées, uniquement comme backlog conceptuel.

## Architecture des 75 tomes

| Ensemble | Tomes | Fonction documentaire |
|---|---:|---|
| Fondation de marque et ambition | I–X | Définir la vision, les publics, la marque, les principes de vérité et les frontières de l’univers PARZI. |
| PARZI Manage, cockpit de l’agent | XI–XX | Décrire le noyau opérationnel de l’agent et les responsabilités de ses modules. |
| Intelligence, Score et Rank | XXI–XXX | Séparer données, signaux, scores, classement, opportunités et radar. |
| Academy, progression et réputation | XXXI–XL | Encadrer apprentissage, progression, preuves, attestations et intégrité. |
| Réseau et profils | XLI–L | Définir identités, profils, confiance, relations, modération et accès. |
| Monétisation et extensions | LI–LX | Définir les modèles économiques sans transformer les concepts hors MVP en promesses. |
| Données, conformité et infrastructure | LXI–LXX | Fixer la sécurité, la confidentialité, la production, la qualité et l’accessibilité. |
| Gel et préparation de l’audit | LXXI–LXXV | Séparer vision, périmètre pilote, preuves et passage à l’audit réel. |

## Méthode de rédaction future

Chaque tome devra être traité individuellement selon la séquence suivante :

1. confirmer son titre provisoire et son propriétaire fonctionnel ;
2. rassembler uniquement les sources listées dans le registre ;
3. séparer explicitement le contenu retrouvé, le contenu reconstruit et les décisions nouvelles ;
4. définir les termes, frontières, données sources et résultats attendus ;
5. relever les contradictions avec le produit réel et les Tomes LXXVI–LXXVII ;
6. faire valider le tome avant de l’utiliser comme base de construction produit ;
7. mettre à jour le registre sans réécrire silencieusement l’historique.

## Gabarit minimal d’un futur tome

- Statut documentaire et version
- Sources utilisées
- Contenu historique retrouvé
- Hypothèses de reconstruction
- Objet et périmètre
- Définitions
- Produits concernés et propriétaire fonctionnel
- Règles métier
- Données nécessaires et provenance
- Dépendances avec les autres tomes
- Limites, risques et éléments hors périmètre
- Décisions à valider
- Conséquences possibles sur le produit, sans exécution automatique

## Garde-fous

- Aucun titre provisoire ne doit être présenté comme le titre historique original.
- Une idée conceptuelle ne devient pas une fonctionnalité autorisée par sa seule présence dans un tome reconstruit.
- PARZI Score ne doit pas être présenté comme une note sportive avant l’existence de données fiables et licenciées.
- PARZI Rank doit rester un classement relatif, distinct du Score.
- Une attestation PARZI ne doit pas être présentée comme une licence officielle ou un droit d’exercer.
- La réputation doit reposer d’abord sur des preuves objectives ; les évaluations subjectives exigent modération et droit de réponse.
- Les produits connectés et de performance restent hors MVP tant que leur gouvernance de données et leur preuve de mesure ne sont pas établies.
- Le chantier R-001 à R-030 demeure gouverné par les Tomes LXXVI et LXXVII ; la reconstruction documentaire ne modifie pas automatiquement ce backlog.

## Incohérences et collisions à résoudre pendant la rédaction

1. **Absence des originaux I–LXXV** : les intitulés individuels sont reconstruits, pas retrouvés.
2. **PARZI Social / PARZI Network** : les anciennes sources parlent parfois de « Social » ; l’arbre canonique retient « PARZI Network ».
3. **PARZI Score actuel / Score cible** : le produit audité ne prouve pas encore une note de performance sportive ; le futur tome devra maintenir cette distinction.
4. **OVR Academy / compétence professionnelle** : la progression pédagogique ne mesure pas le droit d’exercer ni la qualité professionnelle globale.
5. **Diplôme / attestation** : le vocabulaire historique doit être corrigé vers une attestation interne vérifiable, distincte d’une licence officielle.
6. **Agency Health / complétude opérationnelle** : un indicateur décoratif ne doit pas être présenté comme une santé d’agence réelle.
7. **Réseau et réputation / mineurs** : consentement, modération, confidentialité et droit de réponse doivent précéder toute ouverture communautaire.
8. **Extensions / périmètre pilote** : marketplace, white-label, objets connectés et modules long terme ne sont pas des ordres d’implémentation avant validation.

## Porte de sortie de cette phase

La phase de cadrage est terminée lorsque les 75 titres, sujets, produits et dépendances du registre sont relus et approuvés. La rédaction pourra alors commencer par le Tome I, un tome à la fois. Aucun commit ni changement applicatif n’est requis pour cette validation documentaire.
