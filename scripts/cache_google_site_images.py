#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import hashlib
import mimetypes
import re
import sys
import urllib.parse
from pathlib import Path

from playwright.async_api import BrowserContext, Response, async_playwright

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


def image_key(url: str) -> str:
    decoded = urllib.parse.unquote(url)
    marker = "/sitesv-images-rt/"
    if marker not in decoded:
        return decoded
    token = decoded.split(marker, 1)[1]
    token = re.sub(r"=(?:w|h)\d+(?:-[a-z0-9-]+)?$", "", token, flags=re.IGNORECASE)
    return token


def extension(content_type: str, data: bytes) -> str:
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


def valid_image(content_type: str, data: bytes) -> bool:
    return len(data) >= 1500 and bool(extension(content_type, data))


def original_google_image_url(response: Response) -> str | None:
    request = response.request
    while request is not None:
        if "sites.google.com/sitesv-images-rt/" in request.url:
            return request.url
        request = request.redirected_from
    if "sites.google.com/sitesv-images-rt/" in response.url:
        return response.url
    return None


async def collect_response(
    response: Response,
    captured: dict[str, tuple[bytes, str]],
) -> None:
    source_url = original_google_image_url(response)
    if source_url is None or response.status != 200:
        return
    try:
        headers = await response.all_headers()
        content_type = headers.get("content-type", "")
        data = await response.body()
        if not valid_image(content_type, data):
            return
        key = image_key(source_url)
        existing = captured.get(key)
        if existing is None or len(data) > len(existing[0]):
            captured[key] = (data, content_type)
    except Exception as exc:  # noqa: BLE001
        print(f"Response capture warning: {response.url[:100]}: {exc}", file=sys.stderr)


async def scroll_page(page) -> None:
    stable_rounds = 0
    previous_height = 0
    for _ in range(80):
        height = await page.evaluate("document.documentElement.scrollHeight")
        await page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        await page.wait_for_timeout(450)
        if height == previous_height:
            stable_rounds += 1
        else:
            stable_rounds = 0
        previous_height = height
        if stable_rounds >= 4:
            break


async def fetch_missing_with_context(
    context: BrowserContext,
    target_urls: list[str],
    captured: dict[str, tuple[bytes, str]],
) -> None:
    for url in target_urls:
        key = image_key(url)
        if key in captured:
            continue
        for referer in SITE_PAGES:
            try:
                response = await context.request.get(
                    url,
                    headers={
                        "Referer": referer,
                        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                    },
                    timeout=60_000,
                )
                if not response.ok:
                    continue
                data = await response.body()
                content_type = response.headers.get("content-type", "")
                if valid_image(content_type, data):
                    captured[key] = (data, content_type)
                    break
            except Exception:
                continue


async def capture_images(target_urls: list[str]) -> dict[str, tuple[bytes, str]]:
    captured: dict[str, tuple[bytes, str]] = {}
    pending_tasks: set[asyncio.Task] = set()

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=True,
            args=["--disable-dev-shm-usage", "--no-sandbox"],
        )
        context = await browser.new_context(
            viewport={"width": 1440, "height": 1000},
            locale="en-GB",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149 Safari/537.36"
            ),
        )

        for site_url in SITE_PAGES:
            page = await context.new_page()

            def on_response(response: Response) -> None:
                task = asyncio.create_task(collect_response(response, captured))
                pending_tasks.add(task)
                task.add_done_callback(pending_tasks.discard)

            page.on("response", on_response)
            print(f"Opening {site_url}")
            await page.goto(site_url, wait_until="domcontentloaded", timeout=90_000)
            try:
                button = page.get_by_text("Got it", exact=True)
                if await button.count():
                    await button.first.click(timeout=3_000)
            except Exception:
                pass
            await scroll_page(page)
            await page.wait_for_timeout(3_000)
            await page.close()

        if pending_tasks:
            await asyncio.gather(*list(pending_tasks), return_exceptions=True)

        await fetch_missing_with_context(context, target_urls, captured)
        await browser.close()

    return captured


async def main() -> None:
    files = text_files()
    urls = find_urls(files)
    if len(urls) < 50:
        raise SystemExit(f"Expected at least 50 Google Site image references, found {len(urls)}")

    print(f"Need to capture {len(urls)} original Google Site images")
    captured = await capture_images(urls)

    replacements: dict[str, str] = {}
    missing: list[str] = []
    for index, url in enumerate(urls, start=1):
        key = image_key(url)
        image = captured.get(key)
        if image is None:
            missing.append(url)
            continue
        data, content_type = image
        ext = extension(content_type, data)
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:20]
        filename = f"place-{digest}{ext}"
        (IMAGE_DIR / filename).write_bytes(data)
        replacements[url] = f"/assets/images/{filename}"
        print(f"[{index}/{len(urls)}] wrote {filename} ({len(data)} bytes)")

    if missing:
        print("\nMissing Google Site images:", file=sys.stderr)
        for url in missing:
            print(url, file=sys.stderr)
        raise SystemExit(
            f"Refusing to publish: captured {len(replacements)}/{len(urls)} images"
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
        raise SystemExit(f"Expected {len(urls)} local images, found {len(local_images)}")

    print(f"Successfully captured and verified all {len(local_images)} original images")


if __name__ == "__main__":
    asyncio.run(main())
