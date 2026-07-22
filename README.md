# London by Arash

A personal shortlist of places in London worth your time — curated across seven categories and served as a fast, offline-capable static site.

**Live:** [london.arashnassirpour.com](https://london.arashnassirpour.com)

---

## What's in the guide

| Section | Theme |
|---|---|
| **Explore** | Wonder Wander — museums, galleries & culture |
| **Views** | Sky High — the best skyline spots |
| **Shopping** | Retail Therapy Zone |
| **Breakfast** | Rise & Dine — brunch & morning spots |
| **Restaurants** | Food for Your Soul — lunch & dinner |
| **Pubs** | Pint Stops — pubs & bars |
| **Apps** | App Arsenal — useful London apps |

---

## How it works

The site content is a Google Sites export that is gzip-compressed, base64-encoded, and split into small chunks stored in `site.part00`–`site.part05`. At runtime, the browser reassembles those chunks (via the `payload/` JS fragments), decompresses them with the native `DecompressionStream` API, and writes the full HTML to the page — no server required.

A thin layer of JavaScript sits on top:

| File | Purpose |
|---|---|
| `landing-motion.js` | Animated landing page entrance |
| `london-now.js` | Live London widget on the homepage (Unsplash photos) |
| `photos.js` | Handles venue photo loading and display |
| `organizer.js` | Sorts and filters venue cards |
| `safe-page-cleanup.js` | Removes Google Sites UI artefacts |

---

## Repository layout

```
.
├── index.html              # Entry point — bootstraps the decompressed site
├── site.part00–05          # Base64 chunks of the gzip-compressed site archive
├── payload/
│   └── p01.js – p10.js     # JS payload that assembles the site in-browser
├── images/                 # Venue photos (copied into _site at build time)
├── scripts/
│   ├── rename_deployed_titles.py      # Rewrites section names in the built output
│   └── cache_google_site_images.py    # Injects photo-loader for original Google Site images
├── landing-motion.js       # Landing page animations
├── london-now.js           # Live homepage widget (requires UNSPLASH_ACCESS_KEY secret)
├── photos.js               # Venue photo logic
├── organizer.js            # Card sort / filter
├── safe-page-cleanup.js    # Post-render cleanup pass
└── .github/workflows/
    └── deploy-pages.yml    # CI/CD — builds and deploys to GitHub Pages
```

---

## Deployment

Pushes to `main` trigger the **Deploy London Guide** GitHub Actions workflow, which:

1. Unpacks the `site.part*` archive into `_site/`
2. Injects the landing page motion script
3. Renames section titles (e.g. "Restaurants" → "Food for Your Soul")
4. Injects a photo-loader for original Google Site images
5. Copies uploaded venue photos into `_site/images/`
6. Injects the live London homepage widget (reads `UNSPLASH_ACCESS_KEY` secret)
7. Runs the safe page cleanup pass
8. Deploys to GitHub Pages via `actions/deploy-pages`
9. Persists any repacked `site.part*` changes back to the repo

The site is live at the custom domain configured in `CNAME`.

---

## Secrets

| Secret | Used by |
|---|---|
| `UNSPLASH_ACCESS_KEY` | `london-now.js` — fetches live London photos for the homepage widget |