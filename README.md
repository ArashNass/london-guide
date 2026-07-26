# London by Arash

A personal shortlist of places in London worth your time — curated across seven categories and served as a fast static site.

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

The deployed site's HTML, CSS and JS live in a gzip-compressed, base64-encoded tarball, split into six chunks: `site.part00`–`site.part05`. That archive is the source of truth for what's live — there is no separate `_site/` or `dist/` checked into the repo.

Each page ships **real, pre-rendered HTML** for its recommendation cards (so search engines and link previews see actual content), plus a small amount of JavaScript for interactivity:

- `assets/data.min.js` — the full list of recommendations (`window.LONDON_DATA`)
- `assets/site.js` — renders/filters cards on category pages and powers the search box and detail dialog
- `assets/home-photo-rotator.js` — rotates photos on the homepage category tiles
- `landing-motion.js`, `london-status.js`, `safe-page-cleanup.js`, `direct-image-test.js` — small enhancement scripts injected by the deploy workflow (see below)

`london-now.js` is a disabled stub (the live homepage widget it used to power was removed); it is not wired into any page.

---

## Repository layout

```
.
├── site.part00–05           # Base64 chunks of the gzip-compressed, deployed site archive
│                             # (decode with `cat site.part0* | base64 -d | tar -xz`)
├── images/                   # Venue photos, copied into the built site at deploy time
├── scripts/
│   ├── rename_deployed_titles.py    # Rewrites section names in the archive, rebuilds site.part*
│   ├── cache_google_site_images.py  # Injects a photo-loader for original Google Site images
│   └── enhance_seo.py               # Adds canonical/OG/Twitter meta, robots.txt, sitemap.xml
├── landing-motion.js         # Landing page animations (copied into the built site)
├── london-status.js          # TfL/weather widget (copied into the built site)
├── safe-page-cleanup.js      # Post-render cleanup pass (copied into the built site)
├── direct-image-test.js      # Image-loading diagnostics (copied into the built site)
├── london-now.js             # Disabled stub, not currently used
└── .github/workflows/
    └── deploy-pages.yml      # CI/CD — builds and deploys to GitHub Pages
```

---

## Deployment

Pushes to `main` trigger the **Deploy London Guide** GitHub Actions workflow, which:

1. Unpacks the `site.part*` archive into `_site/`
2. Injects the landing page motion script
3. Renames section titles if needed and re-verifies the archive (e.g. "Restaurants" → "Food for Your Soul")
4. Injects a photo-loader for original Google Site images
5. Copies uploaded venue photos into `_site/images/`
6. Strips any leftover homepage widget script tag
7. Injects the London status widget
8. Runs the safe page cleanup pass
9. Adds canonical/OG meta tags, `robots.txt` and `sitemap.xml`
10. Deploys to GitHub Pages via `actions/deploy-pages`
11. Persists any repacked `site.part*` changes back to the repo

The site is live at the custom domain configured in `CNAME`.

---

## Adding a new recommendation

There's no separate JSON source file — the recommendation data lives inside the deployed archive itself, at `assets/data.min.js`. To add or edit one:

1. Decode the archive: `cat site.part0* | base64 -d | tar -xz -C _site`
2. Edit the relevant entry in `_site/assets/data.min.js` (a `window.LONDON_DATA = [...]` array of objects with `id`, `name`, `category`, `type`, `area`, `zone`, `address`, `description`, and `image`)
3. Add the matching card markup for the item's category page in `_site/<category>/index.html` (the `#cards` container), so the change is visible without JavaScript — the same markup that `assets/site.js`'s `card()` function renders at runtime
4. Update the count next to the search box in `_site/<category>/index.html` (`#count`)
5. Re-run `python3 scripts/rename_deployed_titles.py _site --parts-dir .` from the repo root — it verifies the archive and rebuilds `site.part00`–`site.part05` deterministically
6. Commit the updated `site.part*` files

`category` values map to routes as: `explore`→`/explore/`, `views`→`/views/`, `shop`→`/shopping/`, `breakfast`→`/breakfast/`, `eat`→`/restaurants/`, `pubs`→`/pubs/`, `apps`→`/apps/`.
