# Tome III — Prototype PZ A v0.2 et wordmark PARZI v0.1

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Symbole conservé ; wordmark v0.1 archivé au profit de la v0.2 |
| Symbole | PZ A v0.2 |
| Wordmark | PARZI v0.1 |
| Police externe | Aucune |
| Usage public | Interdit sans décision fondatrice séparée |
| Contrôle juridique | Non effectué |

## 1. Correction optique du symbole

La v0.2 conserve l'idée de la v0.1, mais replace les points critiques sur des multiples de six unités. Sur un canevas de 96 unités réduit à 16 pixels, six unités correspondent à un pixel.

Modifications principales :

- emprise extérieure régularisée à `x = 12–84`, `y = 12–84` ;
- largeur de la jambe renforcée ;
- contreforme `Z` alignée de `x = 30–66`, `y = 24–54` ;
- couronne et retour du `P` simplifiés ;
- réduction des pixels partiellement couverts au rendu 16 pixels.

La comparaison automatisée avec le même moteur de rendu produit :

| Mesure à 16 px | v0.1 | v0.2 |
|---|---:|---:|
| Boîte occupée | `13 × 14 px` | `12 × 12 px` |
| Pixels majoritairement opaques | 74 | 84 |
| Pixels faiblement ou partiellement couverts | 53 | 10 |

Ces mesures montrent une rasterisation plus stable. Elles ne remplacent pas les tests sur écrans, navigateurs et systèmes d'exploitation réels.

## 2. Verdict symbole v0.2

| Test | Verdict |
|---|---|
| 16 px clair | Techniquement acceptable ; confirmation réelle requise |
| 16 px sombre | Techniquement acceptable ; confirmation réelle requise |
| 24 px | Réussi |
| 64 px | Réussi |
| Monochrome | Réussi |
| Reconnaissance du P | Forte |
| Reconnaissance du Z | Présente, secondaire |
| Originalité juridique | Non évaluée |

PZ A v0.2 devient la **base technique de travail**. Cette promotion remplace uniquement la v0.1 dans le processus de recherche ; elle ne sélectionne pas le logo maître.

## 3. Wordmark PARZI v0.1

Le mot `PARZI` est dessiné avec cinq glyphes vectoriels et ne dépend d'aucune police installée ou commerciale.

Choix de construction :

- capitales géométriques à épaisseur forte ;
- courbes cohérentes pour `P` et `R` ;
- `A` à contreforme triangulaire ;
- `Z` diagonal simple ;
- `I` doté de terminaisons horizontales pour résister visuellement au reste du mot.

### Forces

- lecture immédiate de `PARZI` ;
- compatibilité monochrome ;
- maîtrise des formes et absence de dépendance typographique ;
- association équilibrée avec le symbole PZ A v0.2.

### Faiblesses

- personnalité encore trop proche d'une capitale géométrique générique ;
- `I` plus mécanique que les autres lettres ;
- rythme `A–R` et `Z–I` à corriger optiquement ;
- distinction juridique et culturelle non évaluée.

Le wordmark v0.1 est conservé comme **base typographique**, pas comme dessin final.

## 4. Lockups provisoires

![Lockups provisoires PZ A v0.2 et PARZI v0.1](explorations/vector/parzi-lockups-v0.1.png)

Les compositions horizontale et verticale démontrent la compatibilité générale du symbole et du mot. Les espacements, zones de protection et rapports de taille ne sont pas encore normatifs.

## 5. Livrables

| Fichier | Fonction |
|---|---|
| `explorations/vector/parzi-pz-a-v0.2-symbol.svg` | Symbole monochrome corrigé |
| `explorations/vector/parzi-pz-a-v0.2-symbol-preview.png` | Aperçu sur fond ivoire |
| `explorations/vector/parzi-pz-a-v0.2-comparison.svg` | Comparaison native v0.1/v0.2 |
| `explorations/vector/parzi-pz-a-v0.2-comparison.png` | Aperçu raster de la comparaison |
| `explorations/vector/parzi-wordmark-v0.1.svg` | Wordmark autonome sans police externe |
| `explorations/vector/parzi-wordmark-v0.1-preview.png` | Aperçu raster du wordmark |
| `explorations/vector/parzi-lockups-v0.1.svg` | Compositions vectorielles provisoires |
| `explorations/vector/parzi-lockups-v0.1.png` | Aperçu raster des compositions |

## 6. Décision de l'itération

- archiver PZ A v0.1 ;
- poursuivre avec PZ A v0.2 comme base technique ;
- conserver le wordmark v0.1 uniquement comme squelette ;
- rechercher une singularité typographique mesurée pour le wordmark v0.2 ;
- ne rien intégrer dans PARZI Manage ;
- ne rien présenter comme logo final ou marque disponible.

La prochaine étape graphique doit se concentrer sur le wordmark, sans modifier simultanément le symbole v0.2. Ce gel temporaire permet de comparer les progrès au lieu de déplacer toutes les variables à chaque itération.

## 7. Traçabilité du wordmark

Le wordmark v0.1 reste l'archive du squelette géométrique. Le wordmark v0.2 devient la base typographique de recherche après ajout de contreformes symétriques et de terminaisons propres, sans modifier le symbole PZ A v0.2.
