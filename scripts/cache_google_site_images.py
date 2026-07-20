#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import http.cookiejar
import mimetypes
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
IMAGE_DIR = ROOT / "assets" / "images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

TEXT_SUFFIXES = {".html", ".htm", ".js", ".css", ".json", ".txt"}
URL_RE = re.compile(r"https://sites\.google\.com/sitesv-images-rt/[A-Za-z0-9_~%?=&./+\-]+")
SITE_PAGES = [
    "https://sites.google.com/view/must-visit-london/home?read_current=1",
    "https://sites.google.com/view/must-visit-london/food-for-your-soul?read_current=1",
    "https://sites.google.com/view/must-visit-london/retail-therapy-zone?read_current=1",
    "https://sites.google.com/view/must-visit-london/stomach-satisfiers?read_current=1",
    "https://sites.google.com/view/must-visit-london/app-arsenal?read_current=1",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149 Safari/537.36"
    ),
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
    "Cache-Control": "no-cache",
}


def text_files() -> list[Path]:
    return [
        path
        for path in ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES
    ]


def find_urls(files: list[Path]) -> list[str]:
    urls: set[str] = set()
    for path in files:
        try:
            urls.update(URL_RE.findall(path.read_text(encoding="utf-8")))
        except UnicodeDecodeError:
            continue
    return sorted(urls)


def make_opener() -> urllib.request.OpenerDirector:
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(jar),
        urllib.request.HTTPRedirectHandler(),
    )
    opener.addheaders = list(HEADERS.items())
    return opener


def prime_google_session(opener: urllib.request.OpenerDirector) -> None:
    for page in SITE_PAGES:
        request = urllib.request.Request(
            page,
            headers={
                **HEADERS,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        )
        with opener.open(request, timeout=45) as response:
            response.read(4096)
        time.sleep(0.15)


def image_extension(content_type: str, data: bytes) -> str:
    ctype = content_type.split(";", 1)[0].strip().lower()
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
    }
    if ctype in mapping:
        return mapping[ctype]
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"
    return mimetypes.guess_extension(ctype) or ""


def is_real_image(content_type: str, data: bytes) -> bool:
    ctype = content_type.split(";", 1)[0].strip().lower()
    if len(data) < 1500:
        return False
    if ctype.startswith("image/"):
        return True
    return bool(image_extension(content_type, data))


def fetch_image(
    opener: urllib.request.OpenerDirector,
    url: str,
) -> tuple[bytes, str]:
    attempts = [
        (url, SITE_PAGES[0]),
        (url, SITE_PAGES[1]),
        (
            "https://images.weserv.nl/?url="
            + urllib.parse.quote(url.replace("https://", ""), safe="")
            + "&w=1600&output=jpg&q=90",
            None,
        ),
    ]
    errors: list[str] = []
    for candidate, referer in attempts:
        headers = dict(HEADERS)
        if referer:
            headers["Referer"] = referer
        request = urllib.request.Request(candidate, headers=headers)
        try:
            with opener.open(request, timeout=60) as response:
                data = response.read(20 * 1024 * 1024)
                content_type = response.headers.get("Content-Type", "")
            if not is_real_image(content_type, data):
                raise RuntimeError(
                    f"response was not a valid image ({content_type}, {len(data)} bytes)"
                )
            return data, content_type
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{candidate[:90]}: {exc}")
    raise RuntimeError(" | ".join(errors))


def main() -> None:
    files = text_files()
    urls = find_urls(files)
    if len(urls) < 50:
        raise SystemExit(f"Expected at least 50 Google Site images, found {len(urls)}")

    opener = make_opener()
    prime_google_session(opener)

    replacements: dict[str, str] = {}
    failures: list[str] = []

    for index, url in enumerate(urls, start=1):
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:20]
        try:
            data, content_type = fetch_image(opener, url)
            extension = image_extension(content_type, data)
            if not extension:
                raise RuntimeError(f"unknown image format: {content_type}")
            filename = f"place-{digest}{extension}"
            (IMAGE_DIR / filename).write_bytes(data)
            replacements[url] = f"/assets/images/{filename}"
            print(f"[{index}/{len(urls)}] cached {filename} ({len(data)} bytes)")
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{url}\n  {exc}")

    if failures:
        print("\nFailed image downloads:", file=sys.stderr)
        print("\n".join(failures), file=sys.stderr)
        raise SystemExit(
            f"Refusing to publish: downloaded {len(replacements)}/{len(urls)} images"
        )

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        original = text
        for source, local in replacements.items():
            text = text.replace(source, local)
        if text != original:
            path.write_text(text, encoding="utf-8")

    remaining = []
    for path in text_files():
        try:
            if "sites.google.com/sitesv-images-rt" in path.read_text(encoding="utf-8"):
                remaining.append(str(path.relative_to(ROOT)))
        except UnicodeDecodeError:
            continue
    if remaining:
        raise SystemExit(f"External Google image URLs remain in: {remaining}")

    local_images = list(IMAGE_DIR.glob("place-*"))
    if len(local_images) != len(urls):
        raise SystemExit(
            f"Expected {len(urls)} local images, found {len(local_images)}"
        )

    print(f"Successfully cached and verified all {len(local_images)} original images")


if __name__ == "__main__":
    main()
