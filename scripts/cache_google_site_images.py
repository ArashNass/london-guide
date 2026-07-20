#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import mimetypes
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
IMAGE_DIR = ROOT / "assets" / "images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

URL_RE = re.compile(r"https://sites\.google\.com/sitesv-images-rt/[A-Za-z0-9_~%?=&./+\-]+")
TEXT_SUFFIXES = {".html", ".htm", ".js", ".css", ".json", ".txt"}


def text_files() -> list[Path]:
    return [p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]


def all_urls(files: list[Path]) -> list[str]:
    found: set[str] = set()
    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        found.update(URL_RE.findall(text))
    return sorted(found)


def extension(content_type: str, data: bytes) -> str:
    ctype = content_type.split(";", 1)[0].strip().lower()
    known = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
    }
    if ctype in known:
        return known[ctype]
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"
    return mimetypes.guess_extension(ctype) or ".jpg"


def request_bytes(url: str, referer: str | None = None) -> tuple[bytes, str]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
    }
    if referer:
        headers["Referer"] = referer
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read(18 * 1024 * 1024)
        content_type = response.headers.get("Content-Type", "")
    if not data or content_type.lower().startswith("text/html"):
        raise RuntimeError(f"not an image: {content_type}")
    return data, content_type


def download(url: str) -> tuple[str, str, bool]:
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:20]
    attempts = [
        (url, "https://sites.google.com/view/must-visit-london/"),
        (url, None),
        (
            "https://images.weserv.nl/?url="
            + urllib.parse.quote(url, safe="")
            + "&w=1400&output=jpg&q=88",
            None,
        ),
    ]
    error: Exception | None = None
    for candidate, referer in attempts:
        try:
            data, content_type = request_bytes(candidate, referer)
            ext = extension(content_type, data)
            filename = f"google-site-{digest}{ext}"
            destination = IMAGE_DIR / filename
            destination.write_bytes(data)
            return url, f"/assets/images/{filename}", True
        except Exception as exc:  # noqa: BLE001
            error = exc

    # Never leave a broken image icon in the published site.
    filename = f"google-site-{digest}.svg"
    destination = IMAGE_DIR / filename
    destination.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">'
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop stop-color="#e7e0d4"/><stop offset="1" stop-color="#cfc3b1"/>'
        '</linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/>'
        '<path d="M0 650 300 390l160 135 200-220 540 345v150H0z" fill="#b7aa98" opacity=".55"/>'
        '</svg>',
        encoding="utf-8",
    )
    print(f"WARNING: could not cache {url}: {error}", file=sys.stderr)
    return url, f"/assets/images/{filename}", False


def main() -> None:
    files = text_files()
    urls = all_urls(files)
    print(f"Found {len(urls)} Google Site image URLs")
    mapping: dict[str, str] = {}
    succeeded = 0

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(download, url) for url in urls]
        for future in as_completed(futures):
            source, local, ok = future.result()
            mapping[source] = local
            succeeded += int(ok)

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        original = text
        for source, local in mapping.items():
            text = text.replace(source, local)
            text = text.replace(html.escape(source), local)
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
        raise SystemExit(f"External Google image URLs remain in: {remaining}")

    print(f"Cached {succeeded}/{len(urls)} original images; all published image references are now local")


if __name__ == "__main__":
    main()
