#!/usr/bin/env python3
"""Replace the finished F1 Exhibition card on /explore/ with the Cutty Sark (data and static HTML)."""
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()

ITEM = {
    "id": "cutty-sark",
    "name": "Cutty Sark",
    "category": "explore",
    "type": "Historic tea clipper",
    "area": "Greenwich",
    "zone": "south",
    "address": "King William Walk, Greenwich, London SE10 9HT",
    "description": "The world’s last surviving tea clipper, launched in 1869 and lifted above its dry dock so you can walk right underneath the hull. Greenwich’s river, market and Observatory are all a short stroll away.",
    "featured": True,
    "image": "/images/cutty-sark.jpg",
}

data = ROOT / "assets" / "data.min.js"
text = data.read_text(encoding="utf-8")
new_text, n = re.subn(r'\{"id":"f1-exhibition".*?\},(?=\{"id":)', json.dumps(ITEM, ensure_ascii=False, separators=(",", ":")) + ",", text, count=1, flags=re.S)
if n != 1:
    raise SystemExit("F1 Exhibition entry not found in data.min.js")
data.write_text(new_text, encoding="utf-8")

page = ROOT / "explore" / "index.html"
html = page.read_text(encoding="utf-8")
card = (
    f'<article class="card " tabindex="0" role="button" data-id="{ITEM["id"]}" aria-label="Open {ITEM["name"]} details">\n'
    f'    <div class="card-media"><img src="{ITEM["image"]}" alt="{ITEM["name"]}" loading="lazy" referrerpolicy="no-referrer"></div>\n'
    f'    <div class="card-body"><div class="meta"><span>{escape(ITEM["type"])}</span></div><h2>{ITEM["name"]}</h2>'
    f'<p>{escape(ITEM["description"], quote=False)}</p><div class="location">{ITEM["area"]}</div></div>\n  </article>'
)
html, n = re.subn(r'<article class="card " [^>]*data-id="f1-exhibition".*?</article>', lambda m: card, html, count=1, flags=re.S)
if n != 1:
    raise SystemExit("F1 Exhibition card not found in explore/index.html")
page.write_text(html, encoding="utf-8")
print("Swapped F1 Exhibition for Cutty Sark")
