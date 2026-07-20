#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

PHOTO_LOADER = r'''(() => {
  const items = window.LONDON_DATA || [];
  const byName = new Map(items.map(item => [normalise(item.name), item]));
  const memory = new Map();
  const STORAGE_KEY = "london-real-photo-cache-v3";
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) {}

  const categoryFallbacks = {
    explore: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1600&q=86",
    views: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=86",
    shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=86",
    breakfast: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=86",
    eat: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=86",
    pubs: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1600&q=86",
    apps: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=86"
  };

  function normalise(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function itemFor(image) {
    const alt = normalise(image.alt);
    if (byName.has(alt)) return byName.get(alt);
    for (const [key, item] of byName) {
      if (alt && (key.includes(alt) || alt.includes(key))) return item;
    }
    const path = image.closest("a")?.getAttribute("href") || "";
    const category = Object.keys(categoryFallbacks).find(key => path.includes(key));
    return { id: `section-${alt || category || "london"}`, name: image.alt || "London", category: category || "explore", area: "London" };
  }

  function directGoogleUrl(url) {
    const marker = "https://sites.google.com/sitesv-images-rt/";
    if (!url.startsWith(marker)) return null;
    try {
      return "https://lh3.googleusercontent.com/" + decodeURIComponent(url.slice(marker.length));
    } catch (_) {
      return null;
    }
  }

  function testImage(url, timeout = 7000) {
    return new Promise(resolve => {
      if (!url) return resolve(null);
      const probe = new Image();
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        probe.onload = probe.onerror = null;
        resolve(value);
      };
      probe.referrerPolicy = "no-referrer";
      probe.onload = () => finish(probe.naturalWidth >= 220 && probe.naturalHeight >= 140 ? url : null);
      probe.onerror = () => finish(null);
      const timer = setTimeout(() => finish(null), timeout);
      probe.src = url;
    });
  }

  function scoreTitle(title, item) {
    const haystack = normalise(title);
    const tokens = normalise(item.name).split(" ").filter(token => token.length > 2 && !["the", "and", "london"].includes(token));
    let score = 0;
    for (const token of tokens) if (haystack.includes(token)) score += 5;
    if (haystack.includes(normalise(item.name))) score += 30;
    if (item.area && haystack.includes(normalise(item.area))) score += 4;
    if (/logo|map|diagram|poster|menu|ticket/.test(haystack)) score -= 12;
    return score;
  }

  async function wikipediaCandidate(item) {
    const endpoint = new URL("https://en.wikipedia.org/w/api.php");
    Object.entries({
      action: "query",
      generator: "search",
      gsrsearch: `\"${item.name}\" London`,
      gsrlimit: "8",
      prop: "pageimages",
      piprop: "thumbnail|name",
      pithumbsize: "1600",
      format: "json",
      origin: "*"
    }).forEach(([key, value]) => endpoint.searchParams.set(key, value));
    try {
      const response = await fetch(endpoint, { mode: "cors" });
      if (!response.ok) return null;
      const pages = Object.values((await response.json()).query?.pages || {});
      pages.sort((a, b) => scoreTitle(b.title, item) - scoreTitle(a.title, item));
      return pages.find(page => page.thumbnail?.source && scoreTitle(page.title, item) >= 5)?.thumbnail?.source || null;
    } catch (_) { return null; }
  }

  async function commonsCandidate(item) {
    const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
    Object.entries({
      action: "query",
      generator: "search",
      gsrsearch: `\"${item.name}\" ${item.area || ""} London`,
      gsrnamespace: "6",
      gsrlimit: "12",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "1600",
      format: "json",
      origin: "*"
    }).forEach(([key, value]) => endpoint.searchParams.set(key, value));
    try {
      const response = await fetch(endpoint, { mode: "cors" });
      if (!response.ok) return null;
      const pages = Object.values((await response.json()).query?.pages || {});
      pages.sort((a, b) => scoreTitle(b.title, item) - scoreTitle(a.title, item));
      const page = pages.find(candidate => candidate.imageinfo?.[0] && scoreTitle(candidate.title, item) >= 5);
      return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
    } catch (_) { return null; }
  }

  async function resolvePhoto(item, original) {
    const key = item.id || normalise(item.name);
    if (stored[key]) {
      const cached = await testImage(stored[key], 3500);
      if (cached) return cached;
      delete stored[key];
    }
    if (memory.has(key)) return memory.get(key);
    const task = (async () => {
      const direct = await testImage(directGoogleUrl(original), 5000);
      if (direct) return direct;
      const wiki = await testImage(await wikipediaCandidate(item));
      if (wiki) return wiki;
      const commons = await testImage(await commonsCandidate(item));
      if (commons) return commons;
      const bing = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(`${item.name} ${item.area || ""} London`)}&w=1200&h=800&c=7&rs=1&p=0`;
      const searched = await testImage(bing, 6500);
      if (searched) return searched;
      return categoryFallbacks[item.category] || categoryFallbacks.explore;
    })();
    memory.set(key, task);
    const result = await task;
    stored[key] = result;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch (_) {}
    return result;
  }

  function reveal(image) {
    image.classList.add("photo-loaded");
  }

  async function upgrade(image) {
    if (image.dataset.photoUpgrade === "working" || image.dataset.photoUpgrade === "done") return;
    image.dataset.photoUpgrade = "working";
    const item = itemFor(image);
    const original = image.currentSrc || image.src;
    const replacement = await resolvePhoto(item, original);
    image.onload = () => { image.dataset.photoUpgrade = "done"; reveal(image); };
    image.onerror = () => {
      image.dataset.photoUpgrade = "done";
      image.src = categoryFallbacks[item.category] || categoryFallbacks.explore;
    };
    image.referrerPolicy = "no-referrer";
    image.src = replacement;
  }

  function prepare(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.photoPrepared === "1") return;
    image.dataset.photoPrepared = "1";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("load", () => reveal(image), { once: true });
    image.addEventListener("error", () => upgrade(image), { once: true });
    if (image.complete && image.naturalWidth > 0) reveal(image);
    setTimeout(() => {
      if (!image.classList.contains("photo-loaded") && (!image.complete || image.naturalWidth < 220)) upgrade(image);
    }, 2600);
  }

  function scan(root = document) {
    root.querySelectorAll?.(".card-media img, .modal-media img, .category-card img, main img").forEach(prepare);
  }

  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType === 1) {
        if (node.matches?.("img")) prepare(node);
        scan(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
'''

STYLE_PATCH = r'''
.card-media,.modal-media,.category-card{background:#e9e4db}
.card-media img,.modal-media img,.category-card img,main img{opacity:0;transition:opacity .28s ease}
.card-media img.photo-loaded,.modal-media img.photo-loaded,.category-card img.photo-loaded,main img.photo-loaded{opacity:1}
'''


def inject_script(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if "/assets/photo-loader.js" in text:
        return
    script = '<script src="/assets/photo-loader.js"></script>'
    text, count = re.subn(r"</body>", script + "</body>", text, count=1, flags=re.IGNORECASE)
    if count != 1:
        raise SystemExit(f"Could not inject photo loader into {path.relative_to(ROOT)}")
    path.write_text(text, encoding="utf-8")


def main() -> None:
    images = ASSETS / "images"
    if images.exists():
        for old in images.glob("place-*.svg"):
            old.unlink()
        if not any(images.iterdir()):
            images.rmdir()

    (ASSETS / "photo-loader.js").write_text(PHOTO_LOADER, encoding="utf-8")

    css = ASSETS / "site.css"
    if css.exists():
        text = css.read_text(encoding="utf-8")
        marker = "/* real-photo-loader */"
        if marker not in text:
            css.write_text(text + "\n" + marker + STYLE_PATCH, encoding="utf-8")

    pages = list(ROOT.rglob("*.html"))
    if not pages:
        raise SystemExit("No HTML pages found")
    for page in pages:
        inject_script(page)

    google_refs = 0
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".html", ".js", ".css"}:
            try:
                google_refs += path.read_text(encoding="utf-8").count("sites.google.com/sitesv-images-rt")
            except UnicodeDecodeError:
                pass
    if google_refs < 50:
        raise SystemExit(f"Expected original Google Site photo references, found {google_refs}")

    print(f"Enabled real-photo loading on {len(pages)} pages with {google_refs} original Google Site photo references")


if __name__ == "__main__":
    main()
