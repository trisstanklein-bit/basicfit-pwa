# Basic-Fit — PWA (première version)

Cette version reprend le fichier HTML fourni et ajoute le minimum nécessaire pour en faire une PWA installable :
- `manifest.webmanifest` : nom, icône et affichage plein écran ;
- `sw.js` : mise en cache des fichiers de l'application pour une ouverture hors connexion ;
- `icon.svg`, `icon-192.png`, `icon-512.png` : icônes ;
- `index.html` : page d'origine avec les balises PWA et l'enregistrement du service worker.

## Publication gratuite avec GitHub Pages

1. Connecte-toi à https://github.com/ et crée un compte si nécessaire.
2. Clique sur **New repository**.
3. Nom du dépôt : `basicfit-pwa`.
4. Choisis **Public**, puis **Create repository**.
5. Sur la page du dépôt, clique sur **Add file → Upload files**.
6. Dépose les fichiers contenus dans ce dossier (pas le dossier ZIP lui-même) : `index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`.
7. Clique sur **Commit changes**.
8. Ouvre **Settings → Pages**.
9. Dans **Build and deployment**, choisis **Deploy from a branch**.
10. Sélectionne la branche **main** et le dossier **/(root)**, puis **Save**.
11. Attends la publication. GitHub affichera une adresse du type `https://TON-PSEUDO.github.io/basicfit-pwa/`.

## Installation sur iPhone

1. Ouvre l'adresse GitHub Pages dans Safari (pas dans un navigateur intégré à une autre application).
2. Appuie sur **Partager**.
3. Choisis **Sur l'écran d'accueil**.
4. Active **Ouvrir comme app web** si l'option apparaît.
5. Appuie sur **Ajouter**.

## Tester le mode hors connexion

Après avoir ouvert l'application une première fois avec une connexion Internet, ouvre-la une seconde fois. Tu peux ensuite activer le mode avion et vérifier que la page se lance toujours.

## Important : synchronisation Mac ↔ iPhone

Cette première version ne synchronise pas encore les charges et les séances entre appareils. Le fichier d'origine utilise `localStorage`, qui reste propre à chaque navigateur/appareil. GitHub Pages ne fournit pas de base de données.

La prochaine étape sera d'ajouter Supabase :
- authentification personnelle par e-mail ;
- base de données distante ;
- règles de sécurité pour que seul ton compte puisse lire/modifier tes données ;
- synchronisation entre Mac et iPhone.

Ne saisis pas de clé secrète Supabase dans un dépôt public. Seule une clé publique `anon`/publishable pourra être utilisée côté navigateur, avec les règles de sécurité correctement activées.
