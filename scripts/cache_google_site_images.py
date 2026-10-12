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

  // A photo that is gone for good leaves a tidy placeholder tile (soft gradient and a plate-and-cutlery
  // mark) instead of an empty box.
  const style = document.createElement("style");
  style.textContent = ".card-media.no-photo{position:relative;background:linear-gradient(135deg,#efe6d6,#e2d3bb 55%,#d8c3a2)!important}" +
    ".card-media.no-photo::after{content:'';position:absolute;inset:0;margin:auto;width:44px;height:44px;opacity:.5;" +
    "background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a6a3b' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='5'/%3E%3Cpath d='M3 3v7a2 2 0 0 0 2 2v9M7 3v7M21 3c-2 1-3 4-3 7a2 2 0 0 0 2 2v9'/%3E%3C/svg%3E\") center/contain no-repeat}";
  document.head.appendChild(style);
  function noPhoto(image) {
    image.style.display = "none";
    const box = image.closest(".card-media, .modal-media");
    if (box) box.classList.add("no-photo");
  }

  function prepare(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.originalPhotoReady === "1") return;
    image.dataset.originalPhotoReady = "1";
    image.loading = "lazy";
    image.decoding = "async";
    image.style.opacity = "1";

    // An image that cannot be loaded at all (for example a photo deleted from the original
    // Google Site) is hidden instead of showing a broken-image icon over the tile.
    const hideBroken = () => { image.onerror = null; noPhoto(image); };

    const wrapper = image.currentSrc || image.src;
    const direct = directGoogleUrl(wrapper);
    if (!direct || direct === wrapper) {
      image.onerror = hideBroken;
      return;
    }

    image.onerror = () => {
      image.onerror = hideBroken;
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

  // Some images fail before a handler can be attached. After the page has settled, hide any
  // photo that ended up unloadable (complete but zero-width) instead of showing a broken-image icon.
  function sweepBroken() {
    document.querySelectorAll(selector).forEach(image => {
      if (image instanceof HTMLImageElement && image.getAttribute("src") && image.complete && image.naturalWidth === 0) {
        noPhoto(image);
      }
    });
  }
  window.addEventListener("load", () => {
    setTimeout(sweepBroken, 1500);
    setTimeout(sweepBroken, 6000);
  });
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
