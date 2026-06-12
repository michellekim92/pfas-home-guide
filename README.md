# PFAS Home Guide

Mobile-first app: **awareness → hotspot guides → product swaps**.

No signup. No account.

## Flow

1. **Home** — revolving stats, room-by-room PFAS hotspot list
2. **Item detail** — why PFAS, swaps, Amazon product picks
3. **Top Swaps** — ranked high-impact changes
4. **Shop** — all product categories

## Run locally

Double-click `Launch PFAS Home Guide.command` (or open `index.html` in this folder).

## Deploy (HTTPS public URL)

Static site—no build step. **Vercel** is a good fit: free HTTPS, a stable `*.vercel.app` URL, optional custom domain, and auto-deploy when connected to GitHub.

### Option A — Vercel dashboard (recommended)

1. Push this repo to GitHub (see `scripts/setup-github-pages.sh` if you haven’t yet).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** your GitHub repo.
3. Vercel should detect a static site. Use these settings if asked:
   - **Framework Preset:** Other
   - **Build Command:** leave empty
   - **Output Directory:** leave empty (root)
4. Click **Deploy**. Your live URL will look like:

   `https://pfas-home-guide.vercel.app`

   (exact name depends on your project name on Vercel.)

Future pushes to `main` redeploy automatically.

### Option B — Vercel CLI from this folder

```bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

First run opens a browser to log in. `--prod` publishes to your production URL. Use `./scripts/deploy-vercel.sh --preview` for a temporary preview link.

### Custom domain (optional)

In the Vercel project → **Settings → Domains**, add e.g. `pfashomeguide.com` and follow the DNS steps. HTTPS is automatic.

### GitHub Pages (alternative)

`.github/workflows/deploy.yml` can still publish to GitHub Pages if you prefer. Enable **Settings → Pages → Source: GitHub Actions** on the repo.

## Affiliate tag

Edit `AMAZON_AFFILIATE_TAG` in `js/data.js` with your real Amazon Associates ID (e.g. `yourname-20`).

Until you set a real tag, product links open plain Amazon URLs (no commission). The placeholder `YOURTAG-20` is **not** used — it breaks links on Amazon’s side.

## Concepts

Design explorations in `concepts/` — start with `concepts/design-styles.html` for 10 visual directions.
