# Setly — suivi de séances de musculation (PWA)

Application web installable (iPhone, Mac, Android) pour suivre ses séries, ses charges et sa progression. Elle fonctionne hors connexion et se synchronise entre appareils grâce à Supabase.

## Fonctionnalités

- 4 séances par semaine (Push A, Pull, Jambes, Push B) avec échauffement, circuit abdos et liens « Comment faire ».
- Séries à cocher, charge par exercice, rappel de la dernière charge et de l'écart.
- Minuteur de repos automatique avec bip, vibration (selon l'appareil) et écran maintenu allumé pendant la séance.
- Navigation par semaine : revoir ou compléter une séance passée, ou préparer la suivante.
- Historique, records par exercice, charges regroupées par séance, graphique d'activité.
- Onglet **Plans** : plusieurs programmes, un seul actif à la fois. Ton programme d'origine (« Mon programme ») est verrouillé : on le duplique pour le modifier, ou on part de zéro. Séances, exercices, séries, répétitions, repos, RPE, notes et liens se saisissent à la main ; l'échauffement et le circuit d'abdos sont communs.
- Poids de corps avec courbe d'évolution.
- Synchronisation Mac ↔ iPhone, fusion sans perte des modifications faites sur deux appareils.
- Export / import JSON dans le panneau « Compte ».

## Fichiers du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page |
| `styles.css` | Mise en forme |
| `app.js` | Programme, séances, historique, minuteur |
| `sync.js` | Connexion et synchronisation Supabase |
| `supabase.js` | Bibliothèque Supabase hébergée dans le dépôt (voir ci-dessous) |
| `sw.js` | Service worker : mode hors connexion et mises à jour |
| `manifest.webmanifest` | Nom, couleurs et icônes de l'app |
| `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-1024.png`, `icon-maskable-512.png` | Icônes |

> Les noms internes `basicfit-v1` et `basicfit-base-v1` sont conservés volontairement : les renommer ferait perdre les données déjà enregistrées.

## Publication sur GitHub Pages

1. Ouvre ton dépôt sur github.com.
2. **Add file → Upload files**.
3. Glisse **tous les fichiers du dossier** (pas le dossier lui-même) : les fichiers de même nom remplacent les anciens.
4. **Commit changes**.
5. Dans **Settings → Pages**, vérifie : *Deploy from a branch*, branche `main`, dossier `/(root)`.
6. Attends 1 à 2 minutes que la publication se termine (onglet **Actions**).

### Télécharger `supabase.js`

1. Ouvre dans ton navigateur : `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js`
2. Enregistre la page sous le nom exact `supabase.js` (Fichier → Enregistrer sous, format « Code source » ou « Tous les fichiers »), ou copie tout le texte dans un fichier `supabase.js`.
3. Ajoute-le au dépôt avec les autres fichiers.

Si `supabase.js` est absent, l'app tente de charger la bibliothèque depuis internet : la synchronisation marche alors seulement avec une connexion.

## Installation sur iPhone

1. Ouvre l'adresse `https://TON-PSEUDO.github.io/basicfit-pwa/` dans **Safari**.
2. **Partager → Sur l'écran d'accueil → Ajouter**.

## Mettre à jour l'app

1. Remplace les fichiers modifiés dans GitHub.
2. **Dans `sw.js`, change le numéro de version** : `setly-pwa-v15` devient `setly-pwa-v16`, et ainsi de suite. Sans cela, les appareils gardent l'ancienne version en cache.
3. Ouvre l'app : un bandeau « Nouvelle version disponible » apparaît. Touche **Mettre à jour**.
4. Vérifie la version affichée en bas du panneau « Compte » (bouton en haut à droite).

## Configuration Supabase

La table et ses règles de sécurité doivent être en place. Dans **SQL Editor**, exécute (les règles déjà existantes provoqueront une erreur « already exists » sans gravité) :

```sql
create table if not exists public.workout_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workout_data enable row level security;

create policy "lecture de ses données" on public.workout_data
  for select using (auth.uid() = user_id);

create policy "création de ses données" on public.workout_data
  for insert with check (auth.uid() = user_id);

create policy "modification de ses données" on public.workout_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

À vérifier aussi dans le tableau de bord :

- **Row Level Security** activé sur `workout_data` (sinon n'importe qui possédant la clé publique pourrait lire les données).
- **Inscriptions publiques désactivées** (Authentication → paramètres de connexion), puisque l'app est personnelle.
- Seule la clé **publishable / anon** figure dans `sync.js`. Ne mets jamais la clé `service_role` dans le dépôt.

## Comment fonctionne la synchronisation

L'app garde en mémoire le dernier état synchronisé et fait une fusion à trois voies à chaque synchronisation : une modification (ou suppression) faite sur un appareil est conservée, et celles faites sur un autre appareil aussi. En cas de modification de la même donnée des deux côtés, la version de l'appareil en cours l'emporte.

Elle se déclenche à la connexion, après chaque saisie (avec un court délai), au retour de la connexion réseau et quand l'app revient au premier plan.

## Sauvegarde

Panneau « Compte » → **Exporter** : crée un fichier `setly-sauvegarde-AAAA-MM-JJ.json` (sur iPhone, enregistre-le dans Fichiers). **Importer** remplace les données de l'appareil par celles du fichier, puis les synchronise.

## Dépannage

- **Le bandeau de mise à jour n'apparaît pas** : vérifie que le numéro de version de `sw.js` a changé, ferme complètement l'app (balayage vers le haut) et rouvre-la.
- **Rien ne se synchronise** : ouvre le panneau « Compte » et lis le message. « Bibliothèque non chargée » signifie que `supabase.js` est absent et que le réseau est coupé.
- **Mauvais affichage après une mise à jour** : tous les fichiers doivent avoir été envoyés ensemble. Renvoie-les, change le numéro de version de `sw.js`, puis mets à jour.
