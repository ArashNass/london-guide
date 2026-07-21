#!/usr/bin/env python3
"""Update the decoded GitHub Pages site and rebuild site.part00-05."""

from __future__ import annotations

import argparse
import base64
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse

DISPLAY_NAMES = {
    "Explore": "Wonder Wander",
    "Views": "Sky High",
    "Shopping": "Retail Therapy Zone",
    "Breakfast": "Rise & Dine",
    "Restaurants": "Food for Your Soul",
    "Pubs": "Pint Stops",
    "Apps": "App Arsenal",
    "Useful Apps": "App Arsenal",
    "Places to explore": "Wonder Wander",
    "Explore & culture": "Wonder Wander",
    "Skyline views": "Sky High",
    "Shop & wander": "Retail Therapy Zone",
    "Breakfast & brunch": "Rise & Dine",
    "Lunch & dinner": "Food for Your Soul",
    "Pubs & drinks": "Pint Stops",
    "Useful apps": "App Arsenal",
}

ROUTES = {
    "explore": "Wonder Wander",
    "views": "Sky High",
    "shopping": "Retail Therapy Zone",
    "breakfast": "Rise & Dine",
    "restaurants": "Food for Your Soul",
    "pubs": "Pint Stops",
    "apps": "App Arsenal",
}

FALLBACK_CSS = ".category-tile{background:linear-gradient(135deg,#183f37,#842d34)}"
ROTATOR_MARKER = "stable-category-photo-repair"
ROTATOR_REPAIR = r'''

/* stable-category-photo-repair: landing-motion.js moves the first tile, so never identify tiles by DOM position. */
(() => {
  const categoryPhotos = {
    explore: "/images/8ff9674219704d66c64661d38e528f3f.jpg",
    views: "/images/bf1a743a1ec2aae319c073e4b7bd7753.jpg",
    shopping: "/images/03cb11cfd4ee6c96f4ec21ed756d6cc1.jpg",
    breakfast: "/images/00494a2df5ca8e2b91f205ba000dbd38.jpg",
    restaurants: "/images/346442533b03c08660d77daa3b8cdda2.jpg",
    pubs: "/images/c3f6f0e1a278129c41232961a1cc5fa5.jpg",
    apps: "/images/aef4f2f7a78a66dade68e08a9685a28f.jpg"
  };

  const routeFromTile = tile => {
    const href = tile.getAttribute("href") || "";
    try {
      return new URL(href, location.href).pathname.split("/").filter(Boolean)[0] || "";
    } catch (_) {
      return href.split("/").filter(Boolean)[0] || "";
    }
  };

  const ensureStablePhotos = () => {
    document.querySelectorAll("a.category-tile").forEach(tile => {
      const category = tile.dataset.category || routeFromTile(tile);
      if (!category) return;
      tile.dataset.category = category;
      const computed = getComputedStyle(tile).backgroundImage;
      if ((!computed || computed === "none") && categoryPhotos[category]) {
        tile.style.backgroundImage = `linear-gradient(180deg,rgba(7,17,15,.08),rgba(7,17,15,.72)),url("${categoryPhotos[category]}")`;
        tile.style.backgroundSize = "cover";
        tile.style.backgroundPosition = "center";
      }
      tile.style.color = "#fff";
    });
  };

  ensureStablePhotos();
  document.addEventListener("DOMContentLoaded", ensureStablePhotos, {once:true});
  new MutationObserver(ensureStablePhotos).observe(document.documentElement, {childList:true, subtree:true});
  window.addEventListener("resize", ensureStablePhotos, {passive:true});
})();
'''


def replace_visible_text(text: str) -> tuple[str, int]:
    changes = 0
    for old, new in sorted(DISPLAY_NAMES.items(), key=lambda item: len(item[0]), reverse=True):
        pattern = re.compile(rf">(\s*){re.escape(old)}(\s*)<")
        text, count = pattern.subn(lambda m: f">{m.group(1)}{new}{m.group(2)}<", text)
        changes += count
    for old, new in DISPLAY_NAMES.items():
        pattern = re.compile(rf"(<title>\s*){re.escape(old)}(\s*[—|-]\s*London by Arash\s*</title>)", re.I)
        text, count = pattern.subn(lambda m: f"{m.group(1)}{new}{m.group(2)}", text)
        changes += count
    for old, new in DISPLAY_NAMES.items():
        patterns = [
            re.compile(rf"(\blabel\s*:\s*['\"]){re.escape(old)}(['\"])", re.I),
            re.compile(rf"(\btitle\s*:\s*['\"]){re.escape(old)}(['\"])", re.I),
            re.compile(rf"(['\"]label['\"]\s*:\s*['\"]){re.escape(old)}(['\"])", re.I),
            re.compile(rf"(['\"]title['\"]\s*:\s*['\"]){re.escape(old)}(['\"])", re.I),
        ]
        for pattern in patterns:
            text, count = pattern.subn(lambda m: f"{m.group(1)}{new}{m.group(2)}", text)
            changes += count
    return text, changes


def add_category_identifiers(homepage: str) -> tuple[str, int]:
    changes = 0
    pattern = re.compile(r'<a(?P<attrs>[^>]*\bclass=["\'][^"\']*\bcategory-tile\b[^"\']*["\'][^>]*)>', re.I)

    def update(match: re.Match[str]) -> str:
        nonlocal changes
        attrs = match.group("attrs")
        if re.search(r"\bdata-category=", attrs, re.I):
            return match.group(0)
        href = re.search(r'\bhref=["\']([^"\']+)["\']', attrs, re.I)
        if not href:
            return match.group(0)
        route = urlparse(href.group(1)).path.strip("/").split("/")[0]
        if route not in ROUTES:
            return match.group(0)
        changes += 1
        return f'<a{attrs} data-category="{route}">'

    return pattern.sub(update, homepage), changes


def update_site(site: Path) -> list[Path]:
    changed: list[Path] = []
    for path in sorted(site.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in {".html", ".js", ".json"}:
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        updated, count = replace_visible_text(original)
        if path == site / "index.html":
            updated, category_count = add_category_identifiers(updated)
            count += category_count
        if count and updated != original:
            path.write_text(updated, encoding="utf-8")
            changed.append(path)

    css = site / "assets" / "site.css"
    css_text = css.read_text(encoding="utf-8")
    if FALLBACK_CSS not in css_text:
        css.write_text(css_text.rstrip() + "\n\n" + FALLBACK_CSS + "\n", encoding="utf-8")
        changed.append(css)

    rotator = site / "assets" / "home-photo-rotator.js"
    rotator_text = rotator.read_text(encoding="utf-8")
    if ROTATOR_MARKER not in rotator_text:
        rotator.write_text(rotator_text.rstrip() + ROTATOR_REPAIR + "\n", encoding="utf-8")
        changed.append(rotator)
    return changed


def homepage_routes(homepage: str) -> set[str]:
    routes: set[str] = set()
    for href in re.findall(r'href=["\']([^"\']+)["\']', homepage, flags=re.I):
        path = urlparse(href).path.strip("/")
        if path:
            routes.add(path.split("/")[0])
    return routes


def verify(site: Path) -> None:
    homepage = (site / "index.html").read_text(encoding="utf-8")
    linked_routes = homepage_routes(homepage)
    failures: list[str] = []
    for route, new_name in ROUTES.items():
        route_file = site / route / "index.html"
        if not route_file.is_file():
            failures.append(f"missing route file: {route_file}")
            continue
        route_html = route_file.read_text(encoding="utf-8")
        if new_name not in route_html:
            failures.append(f"new title missing from /{route}/: {new_name}")
        if route not in linked_routes:
            failures.append(f"homepage link missing for /{route}/")
        if f'data-category="{route}"' not in homepage:
            failures.append(f"stable category identifier missing for /{route}/")
    for old in ["Explore", "Views", "Shopping", "Breakfast", "Restaurants", "Pubs", "Apps"]:
        for html_file in site.rglob("*.html"):
            if re.search(rf">\s*{re.escape(old)}\s*<", html_file.read_text(encoding="utf-8")):
                failures.append(f"old visible label remains in {html_file}: {old}")
    if FALLBACK_CSS not in (site / "assets" / "site.css").read_text(encoding="utf-8"):
        failures.append("category tile fallback background missing")
    if ROTATOR_MARKER not in (site / "assets" / "home-photo-rotator.js").read_text(encoding="utf-8"):
        failures.append("stable category photo repair missing")
    if failures:
        raise SystemExit("Verification failed:\n- " + "\n- ".join(failures))


def rebuild_parts(site: Path, output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        archive = Path(tmp) / "site.tar.gz"
        command = (
            "tar --sort=name --mtime='UTC 1970-01-01' --owner=0 --group=0 --numeric-owner "
            f"-cf - -C {site.as_posix()} . | gzip -n > {archive.as_posix()}"
        )
        subprocess.run(["bash", "-lc", command], check=True)
        encoded = base64.encodebytes(archive.read_bytes())
    chunk_size = (len(encoded) + 5) // 6
    for index in range(6):
        start = index * chunk_size
        chunk = encoded[start:] if index == 5 else encoded[start:min((index + 1) * chunk_size, len(encoded))]
        if not chunk:
            raise SystemExit("Archive unexpectedly produced an empty site part")
        (output / f"site.part{index:02d}").write_bytes(chunk)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("site", type=Path)
    parser.add_argument("--parts-dir", type=Path, default=Path("."))
    args = parser.parse_args()
    changed = update_site(args.site)
    if changed:
        print("Updated deployed files:")
        for path in changed:
            print(f"- {path}")
    else:
        print("No deployed-source changes were required; verifying existing content.")
    verify(args.site)
    rebuild_parts(args.site, args.parts_dir)
    print("Verified routes, stable tile photos and fallback styling; rebuilt site.part00-site.part05 deterministically.")


if __name__ == "__main__":
    main()
