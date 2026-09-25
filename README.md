# Poste 31

Le jeu pour apprendre par cœur la légende des cartes de course d'orientation, un petit circuit par jour.
Chaque enfant du club se crée un compte avec **un pseudo, un mot de passe et une question secrète** : pas d'adresse e-mail, pas de vrai nom. Sa progression le suit d'un appareil à l'autre, et il reste connecté sur son téléphone sans avoir à retaper son mot de passe.

Le tout tourne gratuitement :

- **GitHub Pages** héberge le site (gratuit pour un dépôt public) ;
- **Supabase**, offre Free, garde les comptes et la progression (500 Mo de base : des milliers de joueurs, chacun pèse quelques kilo-octets).

Compte environ 20 minutes pour tout installer, une seule fois.

---

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html`, `app.js`, `styles.css`, `favicon.svg` | le site |
| `config.js` | l'adresse de ta base Supabase (à remplir à l'étape 3) |
| `maps/` | les cartes du mode « Lecture de carte » |
| `supabase/schema.sql` | les tables et fonctions à installer dans Supabase (étape 2) |
| `.github/workflows/reveil-supabase.yml` | empêche Supabase de mettre la base en veille (étape 6) |
| `.nojekyll` | dit à GitHub de publier les fichiers tels quels |

---

## Étape 1 : créer la base Supabase

1. Va sur [supabase.com](https://supabase.com) et clique sur **Start your project**. Le plus simple est de te connecter avec ton compte GitHub.
2. Clique sur **New project** :
   - **Name** : `poste31`
   - **Database Password** : clique sur *Generate a password* et garde-le dans un coin (le site n'en a pas besoin, mais Supabase peut te le demander un jour).
   - **Region** : *West EU (Paris)* ou *Central EU (Frankfurt)*.
   - Plan : **Free**.
   - Si des options de sécurité s'affichent (*Data API*, *Security*…), laisse les réglages proposés par défaut.
3. Clique sur **Create new project** et attends 1 à 2 minutes que le projet soit prêt.

## Étape 2 : installer les tables

1. Dans le menu de gauche du projet, ouvre **SQL Editor**, puis **New query**.
2. Ouvre le fichier `supabase/schema.sql` avec un éditeur de texte, copie **tout** son contenu et colle-le dans l'éditeur.
3. Clique sur **Run**. Si Supabase affiche un avertissement sur des opérations « destructives », confirme : le script ne supprime aucune donnée (il peut être relancé sans risque).
4. Tu dois voir *Success. No rows returned*.

## Étape 3 : relier le site à la base (`config.js`)

1. Dans Supabase, clique sur le bouton **Connect** en haut de la page du projet (ou va dans **Project Settings → API Keys**).
2. Copie deux valeurs :
   - l'adresse du projet (**Project URL**), du genre `https://abcdefghijkl.supabase.co` ;
   - la clé publique **publishable**, qui commence par `sb_publishable_`. Si tu ne vois que l'ancienne clé **anon** (qui commence par `eyJ`), elle marche aussi.
3. Ouvre `config.js` avec un éditeur de texte (Bloc-notes, TextEdit en mode texte brut…) et colle-les entre les apostrophes :

   ```js
   window.POSTE31_CONFIG = {
     supabaseUrl: 'https://abcdefghijkl.supabase.co',
     supabaseKey: 'sb_publishable_xxxxxxxxxxxxxxxx'
   };
   ```

> Cette clé est faite pour être visible dans un site web : elle ne permet que ce que le fichier `schema.sql` autorise.
> Par contre, ne mets **jamais** la clé secrète (`sb_secret_…` ou `service_role`) dans `config.js`.

Tu peux aussi faire cette étape après l'envoi sur GitHub : ouvre `config.js` sur GitHub, clique sur le crayon ✏️, colle les valeurs, puis **Commit changes**.

## Étape 4 : mettre le site sur GitHub

1. Sur [github.com](https://github.com), clique sur **+ → New repository**.
   - **Repository name** : `poste31`
   - Choisis **Public** (GitHub Pages est gratuit pour les dépôts publics).
   - Clique sur **Create repository**.
2. Sur la page du dépôt vide, clique sur le lien **uploading an existing file**.
3. Glisse-dépose le contenu du dossier : `index.html`, `app.js`, `styles.css`, `config.js`, `favicon.svg`, `README.md`, et les dossiers `maps` et `supabase`.
4. Clique sur **Commit changes**.

Les fichiers qui commencent par un point (`.nojekyll`, `.github`) sont souvent cachés par l'ordinateur et ne partent pas avec un glisser-déposer : ce n'est pas grave, le site fonctionne sans `.nojekyll`, et l'étape 6 explique comment ajouter le « réveil ».

## Étape 5 : allumer GitHub Pages

1. Dans le dépôt, va dans **Settings → Pages**.
2. Sous **Build and deployment**, choisis **Source : Deploy from a branch**, puis **Branch : main** et le dossier **/ (root)**. Clique sur **Save**.
3. Attends une ou deux minutes, puis recharge la page : l'adresse du site s'affiche en haut, du genre
   `https://ton-pseudo-github.github.io/poste31/`
4. Ouvre-la et crée-toi un compte pour tester.

Si le site affiche « Site presque prêt », c'est que `config.js` est encore vide ou mal rempli (étape 3).

## Étape 6 : empêcher la mise en veille (recommandé)

Supabase met en pause un projet gratuit qui n'a presque pas servi pendant une semaine (vacances scolaires, par exemple). Pour l'éviter, un petit robot GitHub envoie une requête à la base chaque matin.

1. Dans le dépôt GitHub, clique sur **Add file → Create new file**.
2. Comme nom de fichier, tape exactement : `.github/workflows/reveil-supabase.yml`
   (les `/` créent les dossiers tout seuls).
3. Copie-colle le contenu du fichier `.github/workflows/reveil-supabase.yml` du dossier, puis **Commit changes**.
4. Pour vérifier : onglet **Actions → Réveil Supabase → Run workflow**. Au bout de quelques secondes, une coche verte doit apparaître.

Bon à savoir :

- Si personne ne modifie le dépôt pendant 60 jours, GitHub peut désactiver ce robot et t'envoie alors un e-mail. Il suffit de le réactiver dans l'onglet **Actions** (bouton *Enable workflow*).
- Si la base est quand même en pause : ouvre le projet sur [supabase.com/dashboard](https://supabase.com/dashboard) et clique sur **Restore project**. Les comptes et la progression sont conservés (Supabase permet de restaurer un projet en pause pendant un an). Pendant la pause, les enfants voient « Pas de connexion au serveur » : leur progression reste sur leur téléphone et repart dès que la base est revenue.

---

## Donner le jeu aux enfants

- Envoie-leur l'adresse du site (ou affiche-la en QR code au club).
- Sur téléphone, ils peuvent l'ajouter à l'écran d'accueil comme une appli :
  - iPhone (Safari) : bouton **Partager → Sur l'écran d'accueil** ;
  - Android (Chrome) : menu **⋮ → Ajouter à l'écran d'accueil**.
- Consignes à leur donner :
  - un **pseudo**, pas leur vrai nom ;
  - un mot de passe d'au moins 6 caractères ;
  - une **question secrète** dont ils connaissent la réponse par cœur : elle sert si le mot de passe est oublié.
- Ils restent connectés sur leur appareil (la connexion se prolonge toute seule tant qu'ils jouent). Sur une tablette partagée du club, ils doivent appuyer sur **Se déconnecter** en bas de l'accueil.

Ce que le site garde : le pseudo, le mot de passe et la réponse secrète **chiffrés** (personne ne peut les relire, même toi), la question secrète et la progression dans le jeu. Rien d'autre : pas d'e-mail, pas de nom, pas de publicité ni de traceur.

---

## Espace entraîneur

Tout se fait dans Supabase, **SQL Editor → New query** : colle une des requêtes ci-dessous, remplace le pseudo, puis **Run**.

**Voir les joueurs et leur progression**

```sql
select p.username as pseudo,
       p.created_at::date as inscrit_le,
       (select count(*) from jsonb_each(coalesce(g.data->'cards', '{}'::jsonb)) c
         where (c.value->>'b')::int >= 4) as symboles_maitrises,
       (select count(*) from jsonb_object_keys(coalesce(g.data->'days', '{}'::jsonb))) as jours_joues,
       g.updated_at::date as derniere_partie
from p31_private.players p
left join p31_private.progress g on g.player_id = p.id
order by symboles_maitrises desc, p.username;
```

**Remettre un mot de passe à zéro** (l'enfant a oublié son mot de passe *et* sa réponse secrète)

```sql
update p31_private.players
   set pass_hash = extensions.crypt('nouveau123', extensions.gen_salt('bf', 8)),
       failed_attempts = 0, locked_until = null
 where username = 'pseudo_de_l_enfant';

delete from p31_private.sessions
 where player_id = (select id from p31_private.players where username = 'pseudo_de_l_enfant');
```

Donne-lui `nouveau123` (ou le mot de passe que tu as choisi) : il pourra en changer via « Mot de passe oublié ? ».

**Débloquer un compte** (après 5 mauvais mots de passe, le compte est bloqué 10 minutes)

```sql
update p31_private.players set failed_attempts = 0, locked_until = null
 where username = 'pseudo_de_l_enfant';
```

**Changer un pseudo** (par exemple si un enfant a mis son vrai nom)

```sql
update p31_private.players set username = 'nouveau_pseudo'
 where username = 'ancien_pseudo';
```

Le nouveau pseudo doit être en minuscules, 3 à 20 caractères (lettres sans accent, chiffres, `.`, `-`, `_`).

**Supprimer un compte** (et toute sa progression)

```sql
delete from p31_private.players where username = 'pseudo_de_l_enfant';
```

---

## Comment c'est protégé

- Les tables sont dans un schéma privé (`p31_private`) que le site ne peut pas lire : il passe uniquement par les fonctions `p31_*` de `schema.sql`.
- Mots de passe et réponses secrètes sont chiffrés avec bcrypt. Les réponses ne tiennent pas compte des majuscules, des accents ni des espaces en trop.
- Après 5 erreurs, le compte est bloqué 10 minutes. Au-delà de 60 inscriptions en une heure, les nouvelles inscriptions sont mises en attente (contre les robots).
- La connexion est un jeton aléatoire gardé dans un cookie du navigateur (`p31_session`, 400 jours, prolongé automatiquement). La base n'en garde qu'une empreinte. Changer de mot de passe déconnecte les autres appareils.
- La progression est enregistrée sur l'appareil **et** sur le compte : on peut jouer hors connexion, tout repart au retour du réseau.

## Mettre à jour le site

Modifie ou remplace les fichiers directement sur GitHub (**Add file → Upload files** écrase les anciens) : le site se met à jour en une ou deux minutes. Si une nouvelle version de `schema.sql` arrive, relance-la dans le SQL Editor : les comptes sont conservés.

## À propos des cartes

Les modes sur carte utilisent deux cartes (`maps/chamrousse.jpg` et `maps/les-grives.jpg`). Comme le dépôt est public, n'importe qui peut les télécharger : vérifie que les clubs qui les ont dessinées sont d'accord. Sinon, supprime le dossier `maps` : le reste du jeu fonctionne, seuls les modes « Lecture de carte » et « Touche la carte » afficheront une erreur.
La carte de la Coupe Jurassienne n'est pas incluse : elle porte une mention interdisant sa reproduction.
