(() => {
  const cleanPath = window.location.pathname.replace(/\/+$/, "");
  const isHome = cleanPath === "" || cleanPath === "/index.html";

  function removeHomepageRecommendationText() {
    if (!isHome) return;

    document.querySelectorAll("a.category-tile").forEach((card) => {
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        const value = node.nodeValue || "";
        const cleaned = value
          .replace(/\b\d+\s+recommendations?\b/gi, "")
          .replace(/\brecommendations?\s*:?\s*\d+\b/gi, "");
        if (cleaned !== value) node.nodeValue = cleaned;
      });
    });
  }

  function removeInternalSearch() {
    if (isHome) return;

    const styleId = "internal-search-removal";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        form:has(input[type="search"]),
        form:has(input[placeholder*="search" i]),
        [role="search"],
        .search-bar,.search-box,.search-wrap,.site-search,.filter-search,
        input[type="search"],input[placeholder*="search" i],input[aria-label*="search" i],
        button[aria-label*="search" i],button[title*="search" i],
        a[aria-label*="search" i],a[title*="search" i],
        .search-icon,.magnifier,[class*="search-toggle" i] {
          display:none !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.querySelectorAll(
      'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
    ).forEach((input) => {
      const wrapper = input.closest(
        'form, [role="search"], .search-bar, .search-box, .search-wrap, .site-search, .filter-search'
      );
      if (wrapper) wrapper.remove();
      else input.remove();
    });

    document.querySelectorAll(
      'button[aria-label*="search" i], button[title*="search" i], a[aria-label*="search" i], a[title*="search" i], .search-icon, .magnifier, [class*="search-toggle" i]'
    ).forEach((control) => control.remove());
  }

  function apply() {
    removeHomepageRecommendationText();
    removeInternalSearch();
  }

  apply();
  new MutationObserver(apply).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
