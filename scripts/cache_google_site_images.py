#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
IMAGE_DIR = ROOT / "assets" / "images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)
TEXT_SUFFIXES = {".html", ".htm", ".js", ".css", ".json", ".txt"}
URL_RE = re.compile(r"https://sites\.google\.com/sitesv-images-rt/[A-Za-z0-9_~%?=&./+\-]+")


def text_files() -> list[Path]:
    return [p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]


def svg_for(url: str) -> str:
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()
    a = int(digest[0:2], 16)
    b = int(digest[2:4], 16)
    c = int(digest[4:6], 16)
    d = int(digest[6:8], 16)
    hue1 = a * 360 // 255
    hue2 = (hue1 + 28 + b * 70 // 255) % 360
    x = 140 + c * 520 // 255
    y = 160 + d * 220 // 255
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="London place visual">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl({hue1} 34% 78%)"/><stop offset="1" stop-color="hsl({hue2} 28% 52%)"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="38"/></filter>
</defs>
<rect width="1200" height="800" fill="url(#g)"/>
<circle cx="{x}" cy="{y}" r="210" fill="rgba(255,255,255,.20)" filter="url(#blur)"/>
<path d="M0 620h110v-90h70v90h85V470h54v150h88V390h72v230h95V505h63v115h92V440h80v180h90V350h52v270h159v180H0z" fill="rgba(20,26,24,.28)"/>
<path d="M0 660c180-70 310-22 455-45 170-26 300-105 745-28v213H0z" fill="rgba(255,255,255,.18)"/>
</svg>'''


def main() -> None:
    files = text_files()
    urls: set[str] = set()
    for path in files:
        try:
            urls.update(URL_RE.findall(path.read_text(encoding="utf-8")))
        except UnicodeDecodeError:
            pass

    if not urls:
        raise SystemExit("No Google image references found in site package")

    mapping: dict[str, str] = {}
    for url in sorted(urls):
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:20]
        filename = f"place-{digest}.svg"
        (IMAGE_DIR / filename).write_text(svg_for(url), encoding="utf-8")
        mapping[url] = f"/assets/images/{filename}"

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        original = text
        for source, local in mapping.items():
            text = text.replace(source, local)
        if text != original:
            path.write_text(text, encoding="utf-8")

    remaining = []
    for path in text_files():
        try:
            if "sites.google.com/sitesv-images-rt" in path.read_text(encoding="utf-8"):
                remaining.append(str(path.relative_to(ROOT)))
        except UnicodeDecodeError:
            pass
    if remaining:
        raise SystemExit(f"Unreplaced image URLs remain in: {remaining}")

    local_count = len(list(IMAGE_DIR.glob("place-*.svg")))
    if local_count != len(urls):
        raise SystemExit(f"Expected {len(urls)} local visuals, found {local_count}")
    print(f"Created {local_count} reliable local visuals")


if __name__ == "__main__":
    main()
