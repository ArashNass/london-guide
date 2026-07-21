(() => {
  const path = window.location.pathname;
  const isHome = path === "/" || path === "/index.html";

  function addHomepageSearch() {
    if (!isHome || document.querySelector("[data-home-search]")) return;

    const cards = Array.from(document.querySelectorAll("a.category-tile"));
    if (!cards.length) return;

    const wrap = document.createElement("div");
    wrap.dataset.homeSearch = "";
    wrap.className = "home-search";
    wrap.innerHTML = `
      <span class="home-search__icon" aria-hidden="true">⌕</span>
      <input type="search" placeholder="Search London recommendations" aria-label="Search London recommendations" autocomplete="off">
      <button type="button" class="home-search__clear" aria-label="Clear search">×</button>
    `;

    const input = wrap.querySelector("input");
    const clear = wrap.querySelector("button");

    const filterCards = () => {
      const query = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const matches = !query || (card.textContent || "").toLowerCase().includes(query);
        card.style.display = matches ? "" : "none";
      });
      clear.hidden = !query;
    };

    input.addEventListener("input", filterCards);
    clear.addEventListener("click", () => {
      input.value = "";
      filterCards();
      input.focus();
    });

    const firstCard = cards[0];
    const grid = firstCard.parentElement;
    const section = firstCard.closest("section") || grid;
    section.parentElement.insertBefore(wrap, section);

    const style = document.createElement("style");
    style.textContent = `
      .home-search{max-width:760px;margin:0 auto 28px;position:relative;display:flex;align-items:center}
      .home-search__icon{position:absolute;left:18px;font-size:24px;line-height:1;color:#6d7075;pointer-events:none;transform:rotate(-15deg)}
      .home-search input{width:100%;height:56px;border:1px solid rgba(20,23,28,.14);border-radius:18px;background:#fff;padding:0 52px 0 52px;font:inherit;font-size:16px;color:#1c1f24;outline:none;box-shadow:0 12px 34px rgba(30,28,24,.07)}
      .home-search input:focus{border-color:rgba(161,38,38,.55);box-shadow:0 0 0 4px rgba(161,38,38,.08),0 12px 34px rgba(30,28,24,.07)}
      .home-search__clear{position:absolute;right:13px;width:34px;height:34px;border:0;border-radius:50%;background:#f1efea;color:#444;font-size:22px;line-height:1;cursor:pointer}
      .home-search__clear[hidden]{display:none}
      @media(max-width:790px){.home-search{margin:0 16px 24px}}
    `;
    document.head.appendChild(style);
    filterCards();
  }

  function removeInternalSearch() {
    if (isHome) return;

    document.querySelectorAll(
      'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i], button[aria-label*="search" i], a[aria-label*="search" i], .search-icon, .magnifier, [class*="search-toggle"]'
    ).forEach((element) => {
      const container = element.closest(
        'form, [role="search"], .search, .search-bar, .search-box, .search-wrap, .site-search, .filter-search'
      );
      (container || element).remove();
    });
  }

  function removeHomepageRecommendationMeta() {
    if (!isHome) return;

    document.querySelectorAll('.category-tile').forEach((card) => {
      Array.from(card.querySelectorAll('*')).forEach((element) => {
        if (element.children.length > 0) return;
        const text = (element.textContent || '').trim();
        if (/^\d+\s+recommendations?$/i.test(text) || /^recommendations?:?\s*\d+$/i.test(text)) {
          element.remove();
        }
      });
    });
  }

  function applyCleanup() {
    addHomepageSearch();
    removeInternalSearch();
    removeHomepageRecommendationMeta();
  }

  applyCleanup();
  new MutationObserver(applyCleanup).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();