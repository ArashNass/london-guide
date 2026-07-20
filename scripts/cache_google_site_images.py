#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

PREFERRED = {
    "explore": "va-museum",
    "views": "horizon-22",
    "shop": "coal-drops-yard",
    "breakfast": "granger-and-co",
    "eat": "circolo-popolare",
    "pubs": "spaniards-inn",
}


def load_data() -> list[dict]:
    data_file = ASSETS / "data.min.js"
    text = data_file.read_text(encoding="utf-8")
    match = re.search(r"window\.LONDON_DATA\s*=\s*(\[.*\])\s*;?\s*$", text, re.S)
    if not match:
        raise SystemExit("Could not parse assets/data.min.js")
    return json.loads(match.group(1))


def make_loader(items: list[dict]) -> str:
    by_id = {item.get("id"): item for item in items}
    category_images: dict[str, str] = {}
    for category, item_id in PREFERRED.items():
        item = by_id.get(item_id)
        if not item or not item.get("image"):
            raise SystemExit(f"Missing preferred photo for {category}: {item_id}")
        category_images[category] = item["image"]

    item_images = {
        item["name"]: item["image"]
        for item in items
        if item.get("name") and item.get("image")
    }

    return f'''(() => {{
  const itemImages = {json.dumps(item_images, ensure_ascii=False, separators=(",", ":"))};
  const categoryImages = {json.dumps(category_images, ensure_ascii=False, separators=(",", ":"))};
  const normalise = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const byName = new Map(Object.entries(itemImages).map(([name, url]) => [normalise(name), url]));

  function directGoogleUrl(url) {{
    const marker = "https://sites.google.com/sitesv-images-rt/";
    if (!url || !url.startsWith(marker)) return url || "";
    try {{ return "https://lh3.googleusercontent.com/" + decodeURIComponent(url.slice(marker.length)); }}
    catch (_) {{ return url; }}
  }}

  function categoryFromHref(href) {{
    const value = String(href || "");
    if (value.includes("/explore") || value === "explore/") return "explore";
    if (value.includes("/views") || value === "views/") return "views";
    if (value.includes("/shopping") || value === "shopping/") return "shop";
    if (value.includes("/breakfast") || value === "breakfast/") return "breakfast";
    if (value.includes("/restaurants") || value === "restaurants/") return "eat";
    if (value.includes("/pubs") || value === "pubs/") return "pubs";
    return "";
  }}

  function exactOriginal(image) {{
    const alt = normalise(image.alt);
    if (byName.has(alt)) return byName.get(alt);
    for (const [name, url] of byName) {{
      if (alt && (name.includes(alt) || alt.includes(name))) return url;
    }}
    const tile = image.closest("a.category-tile");
    if (tile) return categoryImages[categoryFromHref(tile.getAttribute("href"))] || image.src;
    return image.getAttribute("src") || image.src;
  }}

  function show(image) {{
    image.classList.remove("photo-pending", "photo-unavailable");
    image.classList.add("photo-loaded");
  }}

  function unavailable(image) {{
    image.classList.remove("photo-pending");
    image.classList.add("photo-unavailable");
    image.removeAttribute("src");
    image.closest(".card-media,.modal-media,.category-tile")?.classList.add("has-no-photo");
  }}

  function forceOwnPhoto(image) {{
    if (!(image instanceof HTMLImageElement) || image.dataset.ownPhoto === "1") return;
    image.dataset.ownPhoto = "1";
    image.classList.add("photo-pending");
    image.referrerPolicy = "no-referrer";
    const original = exactOriginal(image);
    const direct = directGoogleUrl(original);
    let stage = 0;

    image.onload = () => {{
      if (image.naturalWidth >= 200 && image.naturalHeight >= 120) show(image);
      else image.onerror();
    }};
    image.onerror = () => {{
      stage += 1;
      if (stage === 1 && direct && image.src !== direct) {{
        image.src = direct;
        return;
      }}
      if (stage === 1 && original && image.src !== original) {{
        image.src = original;
        return;
      }}
      unavailable(image);
    }};

    image.alt = image.alt || image.closest(".category-tile")?.querySelector("h2")?.textContent || "London";
    image.src = original;
    setTimeout(() => {{
      if (!image.classList.contains("photo-loaded") && !image.classList.contains("photo-unavailable")) image.onerror();
    }}, 7000);
  }}

  function scan(root = document) {{
    root.querySelectorAll?.(".card-media img,.modal-media img,.category-tile img").forEach(forceOwnPhoto);
  }}

  new MutationObserver(records => {{
    for (const record of records) for (const node of record.addedNodes) {{
      if (node.nodeType !== 1) continue;
      if (node.matches?.("img")) forceOwnPhoto(node);
      scan(node);
    }}
  }}).observe(document.documentElement, {{ childList: true, subtree: true }});

  scan();
}})();
'''


STYLE_PATCH = r'''
/* own-google-photos-only */
.card-media,.modal-media,.category-tile{background:#eee9e1}
.card-media img,.modal-media img,.category-tile img{opacity:0;transition:opacity .25s ease}
.card-media img.photo-loaded,.modal-media img.photo-loaded,.category-tile img.photo-loaded{opacity:1}
.card-media.has-no-photo,.modal-media.has-no-photo{display:none}
.category-tile.has-no-photo{background:#e7e1d7}
.category-tile.has-no-photo img{display:none}
'''


def inject_script(page: Path) -> None:
    text = page.read_text(encoding="utf-8")
    text = re.sub(r'<script src="/assets/photo-loader\.js"></script>', "", text)
    script = '<script src="/assets/photo-loader.js"></script>'
    text, count = re.subn(r"</body>", script + "</body>", text, count=1, flags=re.I)
    if count != 1:
        raise SystemExit(f"Could not inject photo loader into {page.relative_to(ROOT)}")
    page.write_text(text, encoding="utf-8")


def main() -> None:
    items = load_data()
    loader = make_loader(items)
    forbidden = ("unsplash.com", "wikipedia.org", "wikimedia.org", "bing.net", "tse1.mm.bing.net")
    if any(value in loader for value in forbidden):
        raise SystemExit("External fallback source remained in photo loader")

    images = ASSETS / "images"
    if images.exists():
        for old in images.glob("place-*.svg"):
            old.unlink()

    (ASSETS / "photo-loader.js").write_text(loader, encoding="utf-8")

    css = ASSETS / "site.css"
    text = css.read_text(encoding="utf-8")
    text = re.sub(r"/\* real-photo-loader \*/.*?\Z", "", text, flags=re.S)
    text = re.sub(r"/\* own-google-photos-only \*/.*?\Z", "", text, flags=re.S)
    css.write_text(text.rstrip() + "\n" + STYLE_PATCH, encoding="utf-8")

    pages = list(ROOT.rglob("*.html"))
    if not pages:
        raise SystemExit("No HTML pages found")
    for page in pages:
        inject_script(page)

    loader_text = (ASSETS / "photo-loader.js").read_text(encoding="utf-8")
    if len(re.findall(r"sites\.google\.com/sitesv-images-rt", loader_text)) < 50:
        raise SystemExit("Expected original Google Site photo references in loader")
    print(f"Locked {sum(1 for item in items if item.get('image'))} venue photos to the user's original Google Site images")
    print(f"Assigned {len(PREFERRED)} distinct original photos to landing-page categories")


if __name__ == "__main__":
    main()
