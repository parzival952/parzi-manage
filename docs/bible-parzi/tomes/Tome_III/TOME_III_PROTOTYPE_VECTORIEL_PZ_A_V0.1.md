# Tome III — Prototype vectoriel PZ A v0.1

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Version archivée ; remplacée comme base technique par PZ A v0.2 |
| Décision source | TIII-D020 modifiée et validée |
| Piste source | Variante A de la troisième exploration PZ |
| Usage public | Interdit sans décision fondatrice séparée |
| Contrôle juridique | Non effectué |

## 1. Objet

Ce dossier transforme la piste raster A en une géométrie vectorielle contrôlable. La forme a été redessinée manuellement sur une grille ; elle n'est pas un tracé automatique de la planche générée.

Le prototype combine :

- une silhouette extérieure de `P`, attribuable au nom PARZI ;
- un `Z` en espace négatif, afin que le symbole reste monochrome ;
- une légère tension diagonale dans la jambe du `P`, sans produire une flèche ou une arme.

Cette construction ne prouve ni l'originalité juridique ni la disponibilité du signe.

## 2. Livrables

| Fichier | Fonction |
|---|---|
| `explorations/vector/parzi-pz-a-v0.1-symbol.svg` | Symbole maître de recherche, monochrome et transparent |
| `explorations/vector/parzi-pz-a-v0.1-construction.svg` | Grille, emprise et règles géométriques |
| `explorations/vector/parzi-pz-a-v0.1-construction.png` | Aperçu raster vérifié de la construction |
| `explorations/vector/parzi-pz-a-v0.1-size-tests.svg` | Tests natifs à 16, 24, 32 et 64 pixels |
| `explorations/vector/parzi-pz-a-v0.1-size-tests.png` | Aperçu raster vérifié des tests |
| `explorations/vector/parzi-pz-a-v0.1-symbol-384.png` | Aperçu transparent du symbole à 512 pixels |

## 3. Géométrie de travail

| Élément | Valeur |
|---|---|
| Canevas | `96 × 96` unités |
| Emprise extérieure | `x = 16–86`, `y = 10–86` |
| Couronne du P | départ `y = 10`, retour `y = 62` |
| Jambe du P | `x = 16–40`, terminaison diagonale à `x = 34` |
| Contreforme Z | `x = 29–68`, `y = 24–55` |
| Zone de protection provisoire | 12 unités autour de l'emprise utile |
| Couleur | `currentColor` ; aucune couleur propriétaire imposée |
| Effets | aucun dégradé, contour, ombre, texture ou volume |

## 4. Tests de taille et de contraste

| Taille | Fond clair | Fond sombre | Verdict provisoire |
|---:|---|---|---|
| 16 px | P lisible ; Z comprimé | P lisible ; Z comprimé | Expérimental ; correction optique requise |
| 24 px | P et Z lisibles | P et Z lisibles | Réussi techniquement |
| 32 px | silhouette stable | silhouette stable | Réussi techniquement |
| 64 px | géométrie nette | géométrie nette | Réussi techniquement |

Le fonctionnement monochrome et l'inversion clair/sombre sont confirmés pour le prototype. La lisibilité à 16 pixels n'est pas encore assez robuste pour déclarer la forme compatible favicon.

## 5. Analyse CTO

### Forces

- les deux lettres sont réunies dans une seule forme ;
- le symbole reste identifiable sans or ni effet ;
- la silhouette fonctionne en positif et en négatif ;
- la construction peut endosser plusieurs produits PARZI ;
- aucune hache, arme ou référence à un sport particulier n'est présente.

### Faiblesses

- la lecture immédiate reste d'abord celle d'un `P` ;
- la contreforme `Z` devient fragile à 16 pixels ;
- la sémantique contexte–preuve–action n'est pas encore perceptible sans explication ;
- un monogramme `PZ` peut appartenir à un territoire graphique déjà encombré ;
- le wordmark propriétaire n'est pas encore dessiné.

## 6. Décision de l'itération

Le prototype PZ A v0.1 est **conservé comme base de recherche**, mais il n'est pas sélectionné comme logo maître.

La prochaine itération devra modifier une seule variable à la fois :

1. renforcer optiquement le `Z` et le pont inférieur pour le test 16 pixels ;
2. comparer cette correction à la v0.1 sans changer la silhouette générale ;
3. tester ensuite un wordmark original `PARZI` ;
4. lancer seulement après cela une recherche structurée de similarité.

Aucun fichier de PARZI Manage ne doit consommer ce prototype avant une validation séparée.

## 7. Traçabilité

La v0.1 reste conservée comme référence de comparaison. La correction PZ A v0.2 devient la base technique de travail, sans constituer pour autant une sélection du logo maître.
