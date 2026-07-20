#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
TEXT_SUFFIXES = {".html", ".htm", ".js", ".css", ".json", ".txt"}

# Google Sites exposes images through a page-bound relay URL. The token after
# sitesv-images-rt is also accepted by Google's public image CDN when decoded.
URL_RE = re.compile(
    r"https://sites\.google\.com/sitesv-images-rt/"
    r"([A-Za-z0-9_~%?=&./+\-]+)"
)


def text_files() -> list[Path]:
    return [
        path
        for path in ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES
    ]


def direct_google_url(match: re.Match[str]) -> str:
    token = urllib.parse.unquote(match.group(1))
    return f"https://lh3.googleusercontent.com/{token}"


def inject_image_resilience(path: Path, text: str) -> str:
    if path.suffix.lower() not in {".html", ".htm"}:
        return text

    if 'name="referrer"' not in text and "name='referrer'" not in text:
        text = re.sub(
            r"(<head(?:\s[^>]*)?>)",
            r'\1<meta name="referrer" content="no-referrer">',
            text,
            count=1,
            flags=re.IGNORECASE,
        )

    if "/assets/image-fallback.js" not in text:
        text = re.sub(
            r"</body>",
            '<script src="/assets/image-fallback.js"></script></body>',
            text,
            count=1,
            flags=re.IGNORECASE,
        )

    return text


def write_fallback_script() -> None:
    assets = ROOT / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    (assets / "image-fallback.js").write_text(
        r'''(() => {
  const isGoogleImage = src => /(^|\/)lh\d?\.googleusercontent\.com\//i.test(src) || src.includes("lh3.googleusercontent.com/");

  document.addEventListener("error", event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    if (image.dataset.imageFallbackTried === "1") {
      image.classList.add("image-unavailable");
      return;
    }
    if (!isGoogleImage(image.currentSrc || image.src)) return;

    image.dataset.imageFallbackTried = "1";
    const original = image.currentSrc || image.src;
    const withoutProtocol = original.replace(/^https?:\/\//, "");
    image.src = `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}&w=1600&output=webp&q=88`;
  }, true);
})();
''',
        encoding="utf-8",
    )


def main() -> None:
    files = text_files()
    converted = 0

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        text, replacements = URL_RE.subn(direct_google_url, text)
        converted += replacements
        text = inject_image_resilience(path, text)
        path.write_text(text, encoding="utf-8")

    write_fallback_script()

    remaining: list[str] = []
    google_cdn_refs = 0
    for path in text_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "sites.google.com/sitesv-images-rt" in text:
            remaining.append(str(path.relative_to(ROOT)))
        google_cdn_refs += text.count("https://lh3.googleusercontent.com/")

    if remaining:
        raise SystemExit(f"Google Sites relay URLs remain in: {remaining}")
    if google_cdn_refs < 50:
        raise SystemExit(
            f"Expected at least 50 Google CDN image references, found {google_cdn_refs}"
        )

    print(
        f"Converted {converted} Google Sites image references to "
        f"{google_cdn_refs} direct CDN references"
    )


if __name__ == "__main__":
    main()
