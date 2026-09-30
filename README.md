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

## 🌐 Mise en ligne (GitHub Pages)

Le build est prêt dans [`docs/`](./docs/) — il ne reste qu'à **activer GitHub Pages**
(une seule fois) :

1. Ouvrez : **https://github.com/gondodanjaures-crypto/doxa-studio.io/settings/pages**
2. **Source** : *Deploy from a branch* (Déployer depuis une branche)
3. **Branche** : `arena/01a0f055-doxa-studio-io` — **Dossier** : `/docs` → **Save**
4. ~1 minute plus tard, le site est en ligne sur :
   **https://gondodanjaures-crypto.github.io/doxa-studio.io/**

Pour publier une nouvelle version du site après une modification :

```bash
cd "doxa-studio-web-strategy (3)"
npm run deploy:pages   # rebuild + copie vers ../../docs/
cd ../.. && git add docs && git commit -m "deploy" && git push
```

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
