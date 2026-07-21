#!/usr/bin/env python3
"""Rename visible section titles in the decoded GitHub Pages site and rebuild site.part00-05."""

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
        if count and updated != original:
            path.write_text(updated, encoding="utf-8")
            changed.append(path)
    return changed


def homepage_routes(homepage: str) -> set[str]:
    routes: set[str] = set()
    for href in re.findall(r'href=["\']([^"\']+)["\']', homepage, flags=re.I):
        parsed = urlparse(href)
        path = parsed.path.strip("/")
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

    old_primary = ["Explore", "Views", "Shopping", "Breakfast", "Restaurants", "Pubs", "Apps"]
    for html_file in site.rglob("*.html"):
        text = html_file.read_text(encoding="utf-8")
        for old in old_primary:
            if re.search(rf">\s*{re.escape(old)}\s*<", text):
                failures.append(f"old visible label remains in {html_file}: {old}")

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
        chunk = encoded[start:] if index == 5 else encoded[start : min((index + 1) * chunk_size, len(encoded))]
        if not chunk:
            raise SystemExit("Archive unexpectedly produced an empty site part")
        (output / f"site.part{index:02d}").write_bytes(chunk)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("site", type=Path)
    parser.add_argument("--parts-dir", type=Path, default=Path("."))
    args = parser.parse_args()

    changed = update_site(args.site)
    if not changed:
        print("No title replacements were required; verifying existing content.")
    else:
        print("Updated deployed files:")
        for path in changed:
            print(f"- {path}")

    verify(args.site)
    rebuild_parts(args.site, args.parts_dir)
    print("Verified all seven routes and rebuilt site.part00-site.part05 deterministically.")


if __name__ == "__main__":
    main()
