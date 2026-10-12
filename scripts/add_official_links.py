#!/usr/bin/env python3
"""Give each card a real official-website link (data.min.js) and use it in the detail panel (site.js).

Only addresses that were checked (loaded in a browser/curl, or a known bot-protected official domain) are listed
in scripts/official_links.json. A card without an entry keeps the "search" fallback. Cards whose address is
"Multiple London locations" open a Maps search for the name instead of that text."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
LINKS = json.loads((Path(__file__).parent / "official_links.json").read_text(encoding="utf-8"))

data = ROOT / "assets" / "data.min.js"
text = data.read_text(encoding="utf-8")
m = re.search(r"window\.LONDON_DATA=(\[.*\])(;?)", text, re.S)
items = json.loads(m.group(1))
ids = {i["id"] for i in items}
unknown = sorted(set(LINKS) - ids)
if unknown:
    raise SystemExit(f"official_links.json has ids that are not in the data: {unknown}")
for item in items:
    if item["id"] in LINKS:
        item["website"] = LINKS[item["id"]]
data.write_text(text[: m.start()] + "window.LONDON_DATA=" + json.dumps(items, ensure_ascii=False, separators=(",", ":")) + m.group(2) + text[m.end():], encoding="utf-8")

js = ROOT / "assets" / "site.js"
code = js.read_text(encoding="utf-8")
old_map = "const mapUrl=item=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address||item.name+' London')}`;"
new_map = "const mapUrl=item=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address&&!/^multiple/i.test(item.address)?item.address:item.name+' London')}`;"
old_btn = '<a class="button secondary" href="${searchUrl(item)}" target="_blank" rel="noopener">Official information</a>'
new_btn = '<a class="button secondary" href="${item.website||searchUrl(item)}" target="_blank" rel="noopener">${item.website?\'Official website\':\'Search official info\'}</a>'
for old, new in ((old_map, new_map), (old_btn, new_btn)):
    if old not in code:
        raise SystemExit(f"site.js pattern not found: {old[:50]}")
    code = code.replace(old, new, 1)
js.write_text(code, encoding="utf-8")
print(f"Official links added for {len(LINKS)} of {len(items)} cards")
