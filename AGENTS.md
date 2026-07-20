<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# i18n — convention obligatoire

Tout texte visible passe par les fichiers `src/messages/*.json`, jamais codé en dur.
- Composant **serveur** : `const { t } = await getServerT();` puis `t("section.cle")`.
- Composant **client** : `const t = useT();` (le composant doit être sous `<I18nProvider>`, déjà monté dans le layout racine).
- Ajouter une langue = un nouveau fichier `src/messages/<code>.json` enregistré dans `src/lib/i18n.ts`. RTL géré via `RTL_LOCALES`.
- Langue par défaut : FR. La locale est lue depuis le cookie `pm_locale` (sélecteur dans Réglages).
- Dates/nombres/devises : toujours via `Intl` avec la locale courante.
<!-- END:nextjs-agent-rules -->
