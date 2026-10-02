# BeautyRevenue — site statique

Un seul fichier : `index.html`. Aucun serveur, aucune base de données, aucune dépendance à installer.

## Mettre en ligne sur Vercel (3 minutes)

Option A — depuis GitHub (recommandé, mises à jour faciles)
1. Créez un dépôt GitHub (public ou privé) et déposez-y `index.html`.
2. Sur https://vercel.com → "Add New… → Project" → importez le dépôt.
3. Framework : "Other". Ne touchez à rien. Cliquez "Deploy".
   → Vous obtenez une URL du type https://beautyrevenue.vercel.app à partager.

Option B — sans GitHub, en ligne de commande
1. Installez Node.js, puis : `npm i -g vercel`
2. Dans ce dossier : `vercel` (puis `vercel --prod`)

Option C — le plus rapide pour tester : https://app.netlify.com/drop
Glissez ce dossier dans la page, l'URL est prête en 10 secondes.

## Ce que votre testeur pourra faire
- Se connecter : demo@institut-lumiere.fr / beauty2026
- Importer SA base clientes (export CSV Planity, Kiute, Treatwell ou Excel)
- Voir les opportunités calculées sur ses vraies clientes
- Préparer et envoyer de vrais SMS / WhatsApp / e-mails depuis son téléphone

## Important
- Toutes les données restent dans le navigateur du testeur (localStorage). Rien n'est envoyé à un serveur.
- Chaque testeur a donc SA propre base, isolée. Pour repartir de zéro : Paramètres → "Réinitialiser les données de démo".
- Le formulaire de contact ouvre la messagerie du visiteur avec un e-mail prérempli vers bonjour@beautyrevenue.fr.
