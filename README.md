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

Enable **Settings → Pages → Deploy from branch → `main` / root** if you prefer GitHub hosting instead of Vercel.

## Stripe membership

Monthly subscription with **7-day free trial** via Stripe Checkout.

### 1. Install Stripe CLI and log in

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Or download the CLI from [github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases).

### 2. Create product + price

```bash
chmod +x scripts/setup-stripe.sh
./scripts/setup-stripe.sh
```

This prints a `STRIPE_PRICE_ID` to add in Vercel.

### 3. Add environment variables in Vercel

Project → **Settings** → **Environment Variables**:

| Variable | Where to get it |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PRICE_ID` | Output of `setup-stripe.sh` |
| `STRIPE_TRIAL_DAYS` | `7` (optional) |
| `SITE_URL` | Your live Vercel URL |

Redeploy after saving.

### 4. Local API testing (optional)

```bash
npm install
npx vercel dev
```

In another terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copy the `whsec_...` secret to `STRIPE_WEBHOOK_SECRET` in Vercel for production webhooks.

### API routes

- `POST /api/create-checkout-session` — starts Stripe Checkout
- `POST /api/stripe-webhook` — subscription events (production)

## Before Amazon Associates review

In `js/data.js`, set:

- `SITE_CONTACT_EMAIL` — your contact email (shown on About and Privacy)
- `AMAZON_AFFILIATE_TAG` — your Associates tracking ID after approval

The site includes Amazon disclosure, health disclaimer, About, and Privacy pages in the footer.

## Affiliate tag

Edit `AMAZON_AFFILIATE_TAG` in `js/data.js` with your real Amazon Associates ID (e.g. `yourname-20`).

Until you set a real tag, product links open plain Amazon URLs (no commission). The placeholder `YOURTAG-20` is **not** used — it breaks links on Amazon’s side.

## Concepts

Design explorations in `concepts/` — start with `concepts/design-styles.html` for 10 visual directions.
