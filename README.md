# Doxa Studio — site officiel

Site vitrine de **Doxa Studio**, agence de communication et de production visuelle
à Abidjan (Côte d'Ivoire) : motion design, 3D & architecture, identité visuelle,
production vidéo.

> 📁 Tout le code du site est dans le dossier [`doxa-studio-web-strategy (3)/`](./doxa-studio-web-strategy%20(3)/)
> (Vite + React 19 + TypeScript + Tailwind 4). Le dossier [`docs/`](./docs/) contient
> le **build de production** (fichier unique) publié par GitHub Pages.

## 🖥️ Développement local

```bash
cd "doxa-studio-web-strategy (3)"
npm ci            # installer les dépendances
npm run dev       # serveur de développement (http://localhost:5173)
```

## ✅ Tests

```bash
npm run typecheck # vérification TypeScript
npm run build     # build de production (dist/index.html — fichier unique)
npm test          # smoke test : monte le bundle et vérifie le rendu réel (19 assertions)
```

Le smoke test (jsdom) vérifie notamment : le montage de React, les sections
principales, un seul `<h1>`, les `alt` d'images, l'absence d'erreurs JavaScript.

## 🌐 Mise en ligne

### Option 1 : Netlify (recommandée)

Le [`netlify.toml`](./netlify.toml) à la racine configure tout (build, publication,
redirections, en-têtes). Dans le tableau de bord Netlify :

1. **Add new site → Import an existing project → Deploy with GitHub** :
   https://app.netlify.com/teams/gondodanjaures/projects
2. Choisissez le dépôt `gondodanjaures-crypto/doxa-studio.io`
3. **Branch to deploy** : `arena/01a0f055-doxa-studio-io` ⚠️ (le code est sur cette branche)
   — le reste est détecté automatiquement grâce au `netlify.toml` → **Deploy**.
4. **Site configuration → Site name → Change site name** : `doxa-studio`
   → le site est sur **https://doxa-studio.netlify.app** (HTTPS gratuit) 🎉

Le site se redéploie automatiquement à chaque `git push` sur cette branche.

#### Variante : déploiement automatique par GitHub Actions (token chez GitHub)

Si vous préférez que ce soit GitHub Actions qui déploie sur Netlify (utile pour
automatiser sans donner l'accès à votre compte à personne) :

1. **Netlify** : https://app.netlify.com/user/applications#personal-access-tokens
   → « New access token » → copiez-le *(ne le partagez jamais dans une discussion)*.
2. **Netlify** : Site configuration → General → **Site ID** → copiez-le.
3. **GitHub** : https://github.com/gondodanjaures-crypto/doxa-studio.io/settings/secrets/actions
   → « New repository secret » × 2 :
   - `NETLIFY_AUTH_TOKEN` = votre token Netlify
   - `NETLIFY_SITE_ID` = votre Site ID
4. Le workflow « Deploy to Netlify » (`.github/workflows/deploy-netlify.yml`)
   publie le site à chaque push. Le token reste stocké chez GitHub.

#### Astuce : déploiement instantané sans rien connecter (Netlify Drop)

Téléchargez [`docs/index.html`](./docs/index.html) (le site déjà construit) et
glissez-le sur https://app.netlify.com/drop → puis renommez le site en `doxa-studio`
(Site configuration → Site name).

### Option 2 : GitHub Pages (alternative)

Le site se déploie aussi via GitHub Actions (`.github/workflows/deploy-pages.yml`).
Activez GitHub Pages une fois : **https://github.com/gondodanjaures-crypto/doxa-studio.io/settings/pages**

1. Connectez-vous à GitHub avec le compte propriétaire du dépôt (`gondodanjaures-crypto`)
   **dans un navigateur** (Chrome, Safari…) — les réglages ne sont pas dans l'app GitHub.
2. **Source** : choisissez **« GitHub Actions »** → *Save*
   (ou *Deploy from a branch* → `arena/01a0f055-doxa-studio-io` → `/docs`).
3. Le site est en ligne sur : **https://gondodanjaures-crypto.github.io/doxa-studio.io/**

> ⚠️ Avec l'option « GitHub Actions », autorisez aussi la branche à déployer :
> Settings → Environments → `github-pages` → *Deployment branches and tags* →
> ajoutez `arena/01a0f055-doxa-studio-io`.

## 🏷️ Nom de domaine gratuit

### Option retenue : DigitalPlat FreeDomain (vrai domaine, usage libre)

Extensions disponibles : `*.us.kg`, `*.dpdns.org`, `*.qzz.io`, `*.xx.kg`, `*.qd.je`
(ex. **doxa-studio.us.kg**), gratuites et sans restriction commerciale.
Inscription manuelle (~15 min, validation automatique) :

1. **Créer un compte** : https://dash.domain.digitalplat.org/
   (email + mot de passe, vérification par email, lien avec votre GitHub pour la vérification d'identité)
2. **Enregistrer le domaine** : rechercher `doxa-studio` → choisir l'extension
   (ex. `doxa-studio.us.kg`) → soumettre (validation en général ~15 min).
3. **DNS** : DigitalPlat délègue vers des *nameservers* externes — créez un compte
   gratuit sur [Cloudflare](https://dash.cloudflare.com/) (ou Hostry), ajoutez le
   domaine et recopiez les 2 *nameservers* Cloudflare dans la fiche domaine DigitalPlat.
4. Chez Cloudflare, ajoutez l'enregistrement :
   `CNAME  doxa-studio  →  gondodanjaures-crypto.github.io`
5. Dans **Settings → Pages → Custom domain** du dépôt GitHub : saisir
   `doxa-studio.us.kg` (le fichier `docs/CNAME` peut aussi le faire automatiquement).
6. Cochez **Enforce HTTPS** → le certificat est généré automatiquement.

### Alternatives gratuites (sous-domaines)

| Service | Exemple | Accès commercial | Délai |
|---|---|---|---|
| **GitHub Pages** | `gondodanjaures-crypto.github.io/doxa-studio.io/` | ✅ | immédiat (1 clic) |
| **Open Domains** | `doxa-studio.is-cool.dev`, `doxa-studio.living-the.life`… | ✅ | 3–5 jours ([dashboard](https://open-domains.com/dashboard)) |
| **is-a.dev** | `doxa-studio.is-a.dev` | ❌ sites non commerciaux uniquement | — |

> 💡 **Conseil pro** : pour une agence, un domaine payant du type `doxa-studio.ci`
> ou `doxa-studio.com` (≈ 5–15 €/an chez OVH, Namecheap…) reste le plus crédible.
> Il suffira de l'ajouter dans *Custom domain* des GitHub Pages.

## ⚙️ Fonctionnalités du site

- Vitrine : hero animé, services, portfolio (filtres), showreel, fondateur, méthode, contact
- Thème jour/nuit automatique (basculable) + mode sombre 19h→6h30
- Espace **Studio / Admin** (3 rôles : super, manager, éditeur) avec gestion de contenu
- **Devis & pro forma** via Supabase (Edge Function `proforma`, config dans `index.html`)
- Synchronisation cloud optionnelle (JSONBlob) — voir `src/data/cloud.ts`

## 📞 Contact

- 📧 gondodanjaures@gmail.com
- 📞 +225 07 47 27 68 79 / +225 01 02 47 03 06
- 📍 Abidjan, Côte d'Ivoire
