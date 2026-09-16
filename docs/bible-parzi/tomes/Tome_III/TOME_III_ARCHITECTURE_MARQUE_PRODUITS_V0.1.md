# Tome III — Architecture de marque des produits v0.1

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Architecture conservée ; proportions précisées par la micro-charte v0.2 |
| Décisions sources | TIII-D001, TIII-D002, TIII-D016, TIII-D022 et TIII-D023 |
| Marque mère | PARZI |
| Produits testés | PARZI Manage et PARZI Academy |
| Actifs maîtres | PZ A v0.2 et wordmark PARZI v0.2, gelés |
| Typographie des descripteurs | Police système de démonstration ; non sélectionnée |

## 1. Principes confirmés

- PARZI reste la marque mère dominante ;
- les produits suivent la forme `PARZI + descripteur` ;
- PARZI Manage reste le premier produit ;
- Academy est testé comme produit endossé futur, sans déclaration de disponibilité ;
- le symbole et le wordmark maîtres ne changent pas selon le produit ;
- aucun territoire couleur produit n'est appliqué dans cette étude ;
- le descripteur identifie le produit sans devenir une sous-marque indépendante.

## 2. Comparaison des compositions

![Architecture produit PARZI v0.1](explorations/vector/parzi-product-architecture-v0.1.png)

### Endossement horizontal

Le symbole, le wordmark PARZI, un séparateur neutre et le descripteur vivent sur une même ligne.

Forces : attribution immédiate, lecture naturelle de `PARZI Manage`, clarté pour les nouveaux publics.

Limite : longueur importante, particulièrement avec `Academy` ou de futurs descripteurs plus longs.

### Endossement empilé

Le descripteur est placé sous le bloc maître PARZI et reste aligné avec le wordmark.

Forces : meilleure compacité, hiérarchie stable, adaptation aux espaces étroits.

Limite : le descripteur peut être confondu avec une signature si l'espacement ou le contraste sont mal contrôlés.

## 3. Système responsive recommandé

![Système produit responsive PARZI v0.1](explorations/vector/parzi-product-responsive-v0.1.png)

| Largeur disponible | Format recommandé | Raison |
|---:|---|---|
| 320 px et plus | Endossement horizontal | Nom complet immédiatement lisible |
| 220 à 319 px | Endossement empilé | Hiérarchie maintenue sans compression excessive |
| moins de 220 px | Symbole seul + libellé d'interface séparé | Accessibilité et lisibilité supérieures |

Ces seuils sont documentaires. Ils doivent être vérifiés dans des supports réels avant de devenir des règles de charte.

Dans le format compact, `Manage` ou `Academy` reste du texte d'interface accessible. Il ne doit pas être fusionné dans une image, et le symbole seul ne doit pas obliger l'utilisateur à deviner le produit.

## 4. Matrice d'usage

| Contexte | Horizontal | Empilé | Symbole + libellé |
|---|---:|---:|---:|
| En-tête de site large | Recommandé | Possible | Non recommandé |
| Document institutionnel | Recommandé | Possible | Non recommandé |
| Carte ou panneau étroit | Limité | Recommandé | Possible |
| Barre latérale réduite | Non recommandé | Limité | Recommandé |
| Favicon ou icône d'application | Interdit | Interdit | Symbole seul, avec nom accessible hors image |
| Signature de produit | Recommandé | Recommandé selon format | Non recommandé |

## 5. Règles provisoires

1. ne jamais redessiner `PARZI` pour l'adapter à la longueur d'un produit ;
2. conserver la même taille relative du symbole et du wordmark ;
3. garder le descripteur visuellement secondaire mais parfaitement lisible ;
4. utiliser la casse éditoriale `Manage` et `Academy` dans les lockups de travail ;
5. ne pas attribuer de couleur définitive à Manage ou Academy dans cette phase ;
6. ne pas utiliser l'or comme couleur de produit ;
7. ne pas compresser le lockup complet sous le seuil utile ;
8. fournir un nom accessible lorsque seul le symbole est affiché ;
9. ne pas convertir les maquettes présentes en actifs publics ;
10. exiger une validation distincte avant toute intégration.

## 6. Décision CTO

Le système à trois niveaux est retenu comme **architecture responsive de recherche** :

- horizontal comme format principal ;
- empilé comme alternative officielle pour espace étroit ;
- symbole accompagné d'un libellé accessible comme mode compact.

Cette décision démontre que le symbole PZ A v0.2 et le wordmark PARZI v0.2 peuvent endosser Manage et Academy sans modification. Elle ne valide ni la typographie des descripteurs, ni les couleurs, ni le logo final.

## 7. Livrables

| Fichier | Fonction |
|---|---|
| `explorations/vector/parzi-product-architecture-v0.1.svg` | Comparaison vectorielle des deux compositions |
| `explorations/vector/parzi-product-architecture-v0.1.png` | Aperçu vérifié de l'architecture |
| `explorations/vector/parzi-product-responsive-v0.1.svg` | Tests vectoriels de réduction et de bascule |
| `explorations/vector/parzi-product-responsive-v0.1.png` | Aperçu vérifié du système responsive |

## 8. Étape suivante

La prochaine étape doit définir les zones de protection, les rapports de taille et la typographie provisoire des descripteurs sans toucher au symbole ou au wordmark maîtres. Une recherche de similarité et une revue juridique restent obligatoires avant toute sélection finale.

## 9. Précision v0.2

La micro-charte v0.2 conserve les formats horizontal, empilé et compact, mais retire le soulignement décoratif visible sous les descripteurs empilés de la première planche. La hiérarchie doit provenir de l'alignement, de la taille et de l'espacement, pas d'un trait susceptible de devenir un faux code produit.

Les proportions, zones de protection et règles typographiques actives se trouvent dans `TOME_III_MICRO_CHARTE_LOCKUPS_V0.2.md`.
