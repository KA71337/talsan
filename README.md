# TalSan

Website of **TalSan** — sales of generators, stabilizers and regulators, repair of stabilizers and regulators,
technical consulting. Production: **https://talsanpower.com**

- Next.js (App Router), public site in Azerbaijani, admin panel at `/admin`.
- Content (products, services, categories, settings, uploaded images) is stored in this repository
  (`data/`) and edited from the admin panel through the GitHub Contents API (server-side token).

## Scripts

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
node scripts/prepare-logo.mjs   # regenerate logo / favicon / OG image from assets/brand/talsan-logo-source.jpg
```

## Environment variables (Vercel → Settings → Environment Variables)

Secrets are server-side only — never prefix them with `NEXT_PUBLIC_`, never commit them.

```ini
GITHUB_TOKEN=            # fine-grained token, Contents: Read and write, only KA71337/talsan
GITHUB_OWNER=KA71337
GITHUB_REPO=talsan
GITHUB_BRANCH=main
GITHUB_PRODUCTS_PATH=data/products.json
ADMIN_PASSWORD=          # admin login: username "admin"
SESSION_SECRET=          # random, at least 32 characters
NEXT_PUBLIC_SITE_URL=https://talsanpower.com   # optional, production default
```

Optional: `GITHUB_SERVICES_PATH`, `GITHUB_CATEGORIES_PATH`, `GITHUB_SETTINGS_PATH`, `GITHUB_UPLOADS_DIR`.

## SEO

- Primary domain `https://talsanpower.com` (canonical, Open Graph, sitemap, JSON-LD).
  `talsan.vercel.app` permanently redirects to it.
- `/robots.txt` and `/sitemap.xml` are generated (`src/app/robots.ts`, `src/app/sitemap.ts`);
  `/admin` and `/api/admin` are excluded from indexing.

## Brand assets

`assets/brand/talsan-logo-source.jpg` is the original logo supplied by the client.
`scripts/prepare-logo.mjs` removes the black background (no redraw, original proportions) and writes
`public/brand/talsan-logo.png`, `public/brand/talsan-og.png`, `src/app/icon.png`, `src/app/apple-icon.png`.
The logo has white lettering — always place it on a dark surface.