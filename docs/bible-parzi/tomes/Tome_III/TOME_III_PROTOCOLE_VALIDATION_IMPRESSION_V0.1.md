# Tome III — Protocole de validation d'impression v0.1

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Protocole prêt ; aucune impression consignée |
| Épreuve | `parzi-monochrome-print-proof-v0.1.svg` |
| Fiche | `parzi-print-validation-form-v0.1.svg` |
| Seuils candidats | Lockup 40 mm ; symbole 8 mm |
| Usage public | Interdit |

## 1. Objectif

Le protocole vérifie si les minimums numériques proposés résistent à une impression physique courante. Il ne contrôle ni la propriété intellectuelle, ni la perception culturelle, ni les procédés spécialisés.

Les résultats portent uniquement sur :

- la silhouette extérieure ;
- l'ouverture et la lecture du `Z` ;
- la lisibilité du wordmark et du descripteur ;
- la netteté des bords ;
- l'inversion monochrome.

## 2. Matériel

### Minimum obligatoire

- une imprimante laser ou jet d'encre ;
- une feuille A4 blanche non texturée ;
- une règle graduée en millimètres ;
- l'épreuve vectorielle A4 ;
- une fiche d'observation imprimée.

### Couverture recommandée

- une imprimante laser et une imprimante jet d'encre ;
- papier bureautique 80 g/m² ;
- papier non couché de 120 à 160 g/m² ;
- observation immédiate puis, pour le jet d'encre, après séchage.

Si un seul procédé est disponible, le résultat reste limité à ce procédé et la décision générale doit être marquée conditionnelle.

## 3. Préparation de l'impression

1. ouvrir `parzi-monochrome-print-proof-v0.1.svg` dans un logiciel conservant les dimensions physiques ;
2. choisir le format A4 paysage ;
3. sélectionner `100 %`, `taille réelle` ou équivalent ;
4. désactiver `ajuster à la page`, `réduire les pages surdimensionnées` et toute mise à l'échelle automatique ;
5. imprimer en noir ou niveaux de gris, sans amélioration photographique ;
6. mesurer immédiatement l'étalon de 100 mm.

L'impression est valide si l'étalon mesure entre **99,5 et 100,5 mm**. Hors de cette tolérance, ne noter aucun spécimen : corriger les réglages et réimprimer.

## 4. Spécimens

| Spécimen | Rôle dans le test |
|---|---|
| Lockup 60 mm | Référence confortable |
| Lockup 40 mm | Seuil candidat bloquant |
| Lockup 25 mm | Stress test non bloquant |
| Symbole 12 mm | Référence confortable |
| Symbole 8 mm | Seuil candidat bloquant |
| Symbole 6 mm | Stress test non bloquant |
| Inversion 60 mm | Référence sombre |
| Inversion 40 mm | Seuil d'inversion bloquant |

Un échec à 25 mm ou 6 mm ne rejette pas le système. Il confirme seulement que ces tailles ne doivent pas être autorisées.

## 5. Méthode d'observation

Observer à lumière normale, sans loupe, puis consigner :

- à 30 cm : finesse des bords et fermeture des contreformes ;
- à 60 cm : lecture normale de document ;
- à 1 m : reconnaissance générale de la silhouette.

Pour chaque critère :

- `2` : net, stable et immédiatement lisible ;
- `1` : limite mais utilisable ;
- `0` : échec ou ambiguïté.

La photographie agrandie peut documenter un défaut, mais elle ne remplace pas le verdict à distance réelle.

## 6. Porte de validation

### Passe

La décision `PASSE` exige :

- étalon valide ;
- aucun score `0` sur le lockup 40 mm ;
- aucun score `0` sur la silhouette et le `Z` du symbole 8 mm ;
- aucun score `0` sur l'inversion 40 mm ;
- descripteur `Manage` lisible à 40 mm ;
- absence de fermeture, bavure ou rupture modifiant le signe ;
- résultats concordants sur laser et jet d'encre, si les deux sont disponibles.

### Conditionnel

La décision `CONDITIONNEL` s'applique lorsqu'un seuil échoue mais une taille supérieure passe. Les nouveaux minimums sont alors inscrits sur la fiche.

Elle s'applique aussi lorsque le test ne couvre qu'un seul procédé d'impression.

### Rejet

La décision `REJET` s'applique si :

- le `Z` disparaît ou se ferme à 8 mm ;
- le lockup reste illisible à une taille supérieure à 40 mm ;
- l'inversion détruit la silhouette ;
- les défauts exigent une modification de géométrie plutôt qu'un relèvement de taille.

## 7. Conservation des preuves

Conserver ensemble :

- l'épreuve imprimée ou une photographie nette et non recadrée ;
- la fiche remplie ;
- le modèle d'imprimante et le papier ;
- le réglage d'échelle ;
- la mesure de l'étalon ;
- la date et le verdict.

Ne pas publier ces éléments comme identité officielle. Ils appartiennent au dossier de recherche.

## 8. Fiche imprimable

![Fiche de validation d'impression](explorations/vector/parzi-print-validation-form-v0.1.png)

Le SVG A4 portrait est la version à imprimer. Le PNG sert uniquement d'aperçu.

## 9. Décision CTO

Le protocole est prêt, mais aucun résultat physique n'est encore enregistré. Les seuils 40 mm et 8 mm restent donc candidats.

La prochaine décision ne pourra être prise qu'après réception d'une fiche remplie et d'une mesure valide de l'étalon 100 mm.

## 10. Limites

Ce protocole ne couvre pas :

- broderie ;
- sérigraphie textile ;
- gravure ;
- découpe vinyle ;
- gaufrage ;
- supports réfléchissants ou texturés ;
- affichage écran ;
- recherche juridique ou culturelle.
