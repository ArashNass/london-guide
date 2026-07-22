#!/usr/bin/env python3
"""Add consistent search metadata and discovery files to the built London guide."""
from __future__ import annotations
import json
import re
import sys
from datetime import date
from pathlib import Path

BASE = "https://london.arashnassirpour.com"
ROOT_TITLE = "Best Things to Do in London | London by Arash"
ROOT_DESCRIPTION = (
    "Discover Arash's personal guide to the best things to do in London, "
    "including museums, views, restaurants, pubs, shopping and useful local apps."
)

def upsert(html: str, pattern: str, tag: str) -> str:
    if re.search(pattern, html, flags=re.I | re.S):
        return re.sub(pattern, tag, html, count=1, flags=re.I | re.S)
    return re.sub(r"</head>", tag + "\n</head>", html, count=1, flags=re.I)

def page_url(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return BASE + "/"
    if rel.endswith("/index.html"):
        return BASE + "/" + rel[:-10]
    return BASE + "/" + rel

def enhance(path: Path, root: Path) -> None:
    html = path.read_text(encoding="utf-8")
    url = page_url(path, root)
    is_home = path == root / "index.html"
    if is_home:
        html = upsert(html, r"<title[^>]*>.*?</title>", f"<title>{ROOT_TITLE}</title>")
        html = upsert(html, r'<meta\s+name=["\']description["\'][^>]*>', f'<meta name="description" content="{ROOT_DESCRIPTION}">')
    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.I | re.S)
    desc_match = re.search(r'<meta\s+name=["\']description["\'][^>]*content=["\']([^"\']*)', html, flags=re.I)
    title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip() if title_match else "London by Arash"
    description = desc_match.group(1).strip() if desc_match else "A personal guide to places worth your time in London."
    tags = [
        (r'<link\s+rel=["\']canonical["\'][^>]*>', f'<link rel="canonical" href="{url}">'),
        (r'<meta\s+name=["\']author["\'][^>]*>', '<meta name="author" content="Arash Nassirpour">'),
        (r'<meta\s+name=["\']robots["\'][^>]*>', '<meta name="robots" content="index, follow, max-image-preview:large">'),
        (r'<meta\s+property=["\']og:title["\'][^>]*>', f'<meta property="og:title" content="{title}">'),
        (r'<meta\s+property=["\']og:description["\'][^>]*>', f'<meta property="og:description" content="{description}">'),
        (r'<meta\s+property=["\']og:url["\'][^>]*>', f'<meta property="og:url" content="{url}">'),
        (r'<meta\s+property=["\']og:type["\'][^>]*>', '<meta property="og:type" content="website">'),
        (r'<meta\s+property=["\']og:site_name["\'][^>]*>', '<meta property="og:site_name" content="London by Arash">'),
        (r'<meta\s+name=["\']twitter:card["\'][^>]*>', '<meta name="twitter:card" content="summary">'),
        (r'<meta\s+name=["\']twitter:title["\'][^>]*>', f'<meta name="twitter:title" content="{title}">'),
        (r'<meta\s+name=["\']twitter:description["\'][^>]*>', f'<meta name="twitter:description" content="{description}">'),
    ]
    for pattern, tag in tags:
        html = upsert(html, pattern, tag)
    if is_home and "application/ld+json" not in html:
        schema = {"@context":"https://schema.org","@type":"WebSite","name":"London by Arash","url":BASE + "/","description":ROOT_DESCRIPTION,"author":{"@type":"Person","name":"Arash Nassirpour"}}
        html = re.sub(r"</head>", '<script type="application/ld+json">' + json.dumps(schema, separators=(",", ":")) + "</script>\n</head>", html, count=1, flags=re.I)
    path.write_text(html, encoding="utf-8")

def main() -> None:
    root = Path(sys.argv[1]).resolve()
    pages = sorted(root.rglob("*.html"))
    for page in pages:
        enhance(page, root)
    urls = sorted({page_url(page, root) for page in pages})
    today = date.today().isoformat()
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap.extend(f"  <url><loc>{url}</loc><lastmod>{today}</lastmod></url>" for url in urls)
    sitemap.append("</urlset>")
    (root / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (root / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n", encoding="utf-8")

if __name__ == "__main__":
    main()
