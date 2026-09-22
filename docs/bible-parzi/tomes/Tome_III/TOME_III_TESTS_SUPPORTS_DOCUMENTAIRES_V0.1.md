# Tome III — Tests des supports documentaires v0.1

## Cartouche

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Date | 23 juillet 2026 |
| Statut | Tests documentaires numériques ; impression réelle non effectuée |
| Produit représenté | PARZI Manage uniquement |
| Actifs utilisés | PZ A v0.2, wordmark PARZI v0.2 et micro-charte produit v0.2 |
| Usage public | Interdit |
| Effet applicatif | Aucun |

## 1. Objectif

Cette étape vérifie que le système de recherche reste cohérent hors de sa planche de construction. Trois supports internes sont testés :

- en-tête de note interne ;
- carte de présentation institutionnelle ;
- signature monochrome de document.

Les contenus sont explicitement factices et ne constituent ni slogan, ni claim, ni preuve de disponibilité.

## 2. Tests de contexte

![Tests des supports documentaires PARZI Manage](explorations/vector/parzi-document-supports-v0.1.png)

| Support | Résultat | Réserve |
|---|---|---|
| En-tête de note interne | Hiérarchie claire ; nom du produit lisible | Valider sur un document complet |
| Carte institutionnelle sombre | Inversion stable ; symbole reconnaissable | Ne pas transformer la maquette en communication publique |
| Signature monochrome | Bonne présence sans dominer le contenu | Définir le minimum réel après impression |

Academy n'est pas utilisé dans ces supports afin de ne pas simuler un lancement ou une disponibilité publique.

## 3. Épreuve monochrome A4

![Épreuve monochrome A4 PARZI Manage](explorations/vector/parzi-monochrome-print-proof-v0.1.png)

Le fichier vectoriel est défini au format A4 paysage en millimètres. Les dimensions physiques ne peuvent être évaluées correctement qu'en imprimant le SVG ou un PDF dérivé à 100 %, sans ajustement automatique de page.

### Lockup complet

| Largeur physique | Verdict numérique provisoire |
|---:|---|
| 60 mm | Confortable |
| 40 mm | Minimum de travail proposé |
| 25 mm | À éviter ; descripteur trop fragile |

### Symbole seul

| Dimension physique | Verdict numérique provisoire |
|---:|---|
| 12 mm | Robuste |
| 8 mm | Minimum de travail proposé |
| 6 mm | Fragile ; impression réelle obligatoire |

Ces seuils ne valent pas pour la broderie, la gravure, la sérigraphie, la découpe ou les supports texturés.

## 4. Contrôle monochrome

- le symbole et le wordmark fonctionnent avec une seule encre ;
- l'inversion blanc sur noir reste lisible ;
- aucune couleur produit n'est nécessaire ;
- le séparateur peut être rendu plus léger par une trame de la même encre ;
- aucun dégradé, effet ou volume n'est requis.

## 5. Décision CTO

Les trois supports passent le contrôle documentaire numérique.

Les seuils provisoires sont :

- lockup complet à 40 mm minimum ;
- symbole seul à 8 mm minimum ;
- en dessous, utiliser une autre composition ou supprimer le lockup complet.

Cette décision autorise uniquement la poursuite des tests. Elle ne transforme pas les prototypes en actifs de production et ne remplace pas une épreuve imprimée réelle.

## 6. Livrables

| Fichier | Fonction |
|---|---|
| `explorations/vector/parzi-document-supports-v0.1.svg` | Planche vectorielle des trois contextes |
| `explorations/vector/parzi-document-supports-v0.1.png` | Aperçu vérifié des supports |
| `explorations/vector/parzi-monochrome-print-proof-v0.1.svg` | Épreuve A4 en dimensions physiques |
| `explorations/vector/parzi-monochrome-print-proof-v0.1.png` | Aperçu numérique de l'épreuve |

## 7. Étape suivante

Le protocole de validation réelle est maintenant défini dans `TOME_III_PROTOCOLE_VALIDATION_IMPRESSION_V0.1.md`. Sans impression effectuée et fiche remplie, aucune taille physique ne doit être déclarée définitive.
