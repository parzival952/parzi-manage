# Modèles d'e-mails Supabase Auth — PARZI Academy

Copie versionnée des modèles installés dans Supabase (projet prod
`dpwdsahhehulighndjpa`) → Authentication → Emails → Templates.
Supabase ne lit pas ces fichiers : après modification, recoller le HTML dans
le tableau de bord.

| Fichier | Modèle Supabase | Sujet |
| --- | --- | --- |
| `confirm-signup.html` | Confirm sign up | Confirme ton adresse e-mail · PARZI Academy |
| `reset-password.html` | Reset password | Nouveau mot de passe · PARZI Academy |

Envoi : SMTP personnalisé Resend (`smtp.resend.com:465`, utilisateur `resend`),
expéditeur « PARZI Academy » <noreply@parziacademy.fr>, domaine
`parziacademy.fr` vérifié chez Resend (DKIM + SPF via `send`/`rsend`, DMARC).
La clé SMTP est un secret : elle n'est stockée que dans Supabase.

Le lien du modèle « Reset password » ouvre `/academy/nouveau-mot-de-passe`
(adresse passée en `redirect_to` par `/academy/mot-de-passe-oublie`, autorisée
par la règle `https://www.parziacademy.fr/**` des Redirect URLs).
