# NPS LifeMap – Retirement Intelligence Engine

A React + Vite application for retirement corpus projection, pension readiness scoring, scenario comparison, and reverse retirement planning.

## Local Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Deploy on Vercel

This repository is configured for Vercel with [`vercel.json`](vercel.json):

- `framework`: `vite`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- SPA rewrite to `index.html`

### Option 1: Deploy via GitHub (recommended)

1. Push the latest code to GitHub.
2. In Vercel, click **Add New Project**.
3. Import this repository.
4. Vercel will auto-detect settings from `vercel.json`.
5. Click **Deploy**.

### Option 2: Deploy via Vercel CLI

Install CLI (if needed):

```bash
npm i -g vercel
```

Deploy:

```bash
vercel
```

For production deploy:

```bash
vercel --prod
```
