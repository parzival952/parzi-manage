# Action manuelle minimale — créer la branche R-001

## Depuis GitHub Web

1. Ouvrir le dépôt `parzival952/parzi-manage`.
2. Vérifier que `main` pointe sur le commit `6827199fffd5f5427f40ea0b8fb9f6340680c2cb`.
3. Ouvrir le sélecteur de branche.
4. Saisir : `hardening/tome-lxxvii-v0`
5. Choisir **Create branch from main**.
6. Ne pas fusionner et ne pas déployer.
7. Ajouter ensuite les fichiers de ce dossier à la racine de la branche.
8. Ouvrir une pull request en brouillon vers `main`.

## Commandes Git équivalentes

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b hardening/tome-lxxvii-v0 6827199fffd5f5427f40ea0b8fb9f6340680c2cb
git push -u origin hardening/tome-lxxvii-v0
```

Ne jamais ajouter `parzi_backup_2026-07-22.sql` au dépôt.
