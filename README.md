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

The site is a static folder—no build step. **GitHub Pages** gives a free stable HTTPS URL like `https://yourusername.github.io/pfas-home-guide/`.

### One-time setup

1. **Create an empty repo** on GitHub (no README): [github.com/new?name=pfas-home-guide](https://github.com/new?name=pfas-home-guide)
2. **Run the setup script** from this folder (it pushes `main`):

   ```bash
   chmod +x scripts/setup-github-pages.sh
   ./scripts/setup-github-pages.sh
   ```

   Or manually:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pfas-home-guide.git
   git push -u origin main
   ```

3. **Enable Pages** — repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
4. Wait for the **Actions** tab workflow to finish (~1–2 min). Your URL is:

   `https://YOUR_USERNAME.github.io/pfas-home-guide/`

Pushes to `main` auto-deploy via `.github/workflows/deploy.yml`.

### Custom domain (optional)

Buy a domain (e.g. `pfashomeguide.com`), then in **Settings → Pages → Custom domain** enter it and follow DNS instructions. Add a `CNAME` file in the repo root with that domain if GitHub prompts you.

### Alternatives

- **Netlify** or **Cloudflare Pages** — connect the same repo; both offer free HTTPS and custom domains.
- **Netlify Drop** — drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop) for a quick preview URL (less ideal as a permanent Associates URL).

## Affiliate tag

Edit `AMAZON_AFFILIATE_TAG` in `js/data.js` with your real Amazon Associates ID (e.g. `yourname-20`).

Until you set a real tag, product links open plain Amazon URLs (no commission). The placeholder `YOURTAG-20` is **not** used — it breaks links on Amazon’s side.

## Concepts

Design explorations in `concepts/` — start with `concepts/design-styles.html` for 10 visual directions.
