(() => {
  const fallbacks = {
    explore: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=82",
    views: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=82",
    shopping: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=82",
    food: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=82",
    pubs: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=82",
    apps: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=82"
  };

  const style = document.createElement("style");
  style.textContent = `
    .card-visual{position:relative;overflow:hidden;min-height:145px!important}
    .place-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;transition:transform .5s ease,opacity .25s ease}
    .place-card:hover .place-photo{transform:scale(1.045)}
    .card-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,12,10,.04),rgba(10,12,10,.52));z-index:1;pointer-events:none}
    .card-visual>*:not(.place-photo){position:relative;z-index:2}
    .photo-credit{position:absolute!important;left:12px;bottom:9px;z-index:3!important;color:rgba(255,255,255,.82);font-size:9px;text-decoration:none;text-shadow:0 1px 4px rgba(0,0,0,.7);max-width:65%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity .2s}
    .card-visual:hover .photo-credit{opacity:1}
    .dialog-colour.has-place-photo{background-size:cover!important;background-position:center!important}
    .dialog-colour.has-place-photo:after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,12,10,.15),rgba(10,12,10,.58));z-index:0}
    .dialog-colour.has-place-photo span{z-index:1}
  `;
  document.head.appendChild(style);

  const data = window.LONDON_DATA || [];
  const byId = new Map(data.map(item => [item.id, item]));
  const cacheKey = "london-place-photo-cache-v1";
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch (_) {}

  const clean = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const saveCache = () => { try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch (_) {} };

  async function findPhoto(item) {
    if (cache[item.id]) return cache[item.id];
    const query = item.category === "apps" ? `${item.name} logo` : `"${item.name}" ${item.area || ""} London`;
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    Object.entries({
      action: "query", generator: "search", gsrsearch: query, gsrnamespace: "6", gsrlimit: "8",
      prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1000", format: "json", origin: "*"
    }).forEach(([key, value]) => url.searchParams.set(key, value));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Image search failed");
      const json = await response.json();
      const pages = Object.values(json.query?.pages || {});
      const nameTokens = clean(item.name.replace(/^(the|a)\s+/i, "")).split(" ").filter(t => t.length > 2 && !["and", "the", "london"].includes(t));
      const ranked = pages.map(page => {
        const title = clean(page.title.replace(/^File:/i, ""));
        let matches = 0;
        let score = 0;
        nameTokens.forEach(token => { if (title.includes(token)) { matches += 1; score += 5; } });
        if (title.includes(clean(item.name))) score += 25;
        if (/logo|map|diagram|poster|ticket|menu/.test(title) && item.category !== "apps") score -= 8;
        return { page, matches, score };
      }).filter(x => x.page.imageinfo?.[0] && (x.matches >= Math.min(2, Math.max(1, nameTokens.length)) || x.score >= 25))
        .sort((a, b) => b.score - a.score);
      const selected = ranked[0]?.page;
      const info = selected?.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata || {};
      const result = {
        src: info.thumburl || info.url,
        source: info.descriptionurl || "https://commons.wikimedia.org/",
        credit: (meta.Artist?.value || "Wikimedia Commons").replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim().slice(0, 80) || "Wikimedia Commons"
      };
      cache[item.id] = result;
      saveCache();
      return result;
    } catch (_) { return null; }
  }

  async function upgrade(article, item, img, credit) {
    const photo = await findPhoto(item);
    if (!photo || !article.isConnected) return;
    img.src = photo.src;
    credit.href = photo.source;
    credit.textContent = photo.credit;
  }

  function applyPhotos() {
    document.querySelectorAll(".place-card[data-id]").forEach(article => {
      if (article.dataset.photoReady) return;
      const item = byId.get(article.dataset.id);
      const visual = article.querySelector(".card-visual");
      if (!item || !visual) return;
      article.dataset.photoReady = "true";
      const img = document.createElement("img");
      img.className = "place-photo";
      img.src = fallbacks[item.category] || fallbacks.explore;
      img.alt = `${item.name} in London`;
      img.loading = "lazy";
      img.decoding = "async";
      const credit = document.createElement("a");
      credit.className = "photo-credit";
      credit.href = "https://unsplash.com/";
      credit.target = "_blank";
      credit.rel = "noopener";
      credit.textContent = "Photo: Unsplash";
      visual.prepend(img);
      visual.appendChild(credit);
      upgrade(article, item, img, credit);
    });
  }

  const observer = new MutationObserver(applyPhotos);
  observer.observe(document.body, { childList: true, subtree: true });
  applyPhotos();
  setTimeout(applyPhotos, 500);
})();
