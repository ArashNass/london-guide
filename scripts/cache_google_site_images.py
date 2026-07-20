#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

# Keep the exact photographs already referenced by the original Google Site.
# Google Sites sometimes wraps the underlying googleusercontent URL. We switch
# to that original image immediately, while retaining the wrapper as a fallback.
PHOTO_LOADER = r'''(() => {
  const selector = ".card-media img, .modal-media img, .category-card img, .category-tile img, main img";
  const marker = "https://sites.google.com/sitesv-images-rt/";

  function directGoogleUrl(url) {
    if (!url || !url.startsWith(marker)) return null;
    try {
      const decoded = decodeURIComponent(url.slice(marker.length));
      if (/^https?:\/\//i.test(decoded)) return decoded;
      return "https://lh3.googleusercontent.com/" + decoded.replace(/^\/+/, "");
    } catch (_) {
      return null;
    }
  }

  function prepare(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.originalPhotoReady === "1") return;
    image.dataset.originalPhotoReady = "1";
    image.loading = "lazy";
    image.decoding = "async";
    image.style.opacity = "1";

    const wrapper = image.currentSrc || image.src;
    const direct = directGoogleUrl(wrapper);
    if (!direct || direct === wrapper) return;

    image.onerror = () => {
      image.onerror = null;
      image.src = wrapper;
      image.style.opacity = "1";
    };
    image.src = direct;
  }

  function scan(root = document) {
    root.querySelectorAll?.(selector).forEach(prepare);
  }

  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
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
.card-media,.modal-media,.category-card,.category-tile{background:#e9e4db}
.card-media img,.modal-media img,.category-card img,.category-tile img,main img{opacity:1!important}
'''


def inject_script(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'<script src="/assets/photo-loader\.js"></script>', "", text)
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
        text = re.sub(r"/\* real-photo-loader \*/.*?\Z", "", text, flags=re.S)
        text = re.sub(r"/\* own-google-photos-only \*/.*?\Z", "", text, flags=re.S)
        css.write_text(text.rstrip() + "\n/* original-google-site-photos */" + STYLE_PATCH, encoding="utf-8")

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

    print(f"Enabled {google_refs} original Google Site photo references across {len(pages)} pages")


if __name__ == "__main__":
    main()
