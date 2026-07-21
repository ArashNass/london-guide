(() => {
  const path = window.location.pathname;
  const isHome = path === "/" || path === "/index.html";

  function removeInternalSearch() {
    if (isHome) return;

    const inputs = document.querySelectorAll(
      'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
    );

    inputs.forEach((input) => {
      const container = input.closest(
        'form, [role="search"], .search, .search-bar, .search-box, .search-wrap, .site-search, .filter-search'
      ) || input.parentElement;

      if (container) {
        container.remove();
      } else {
        input.remove();
      }
    });
  }

  function removeHomepageRecommendationMeta() {
    if (!isHome) return;

    document.querySelectorAll('.category-tile').forEach((card) => {
      const elements = Array.from(card.querySelectorAll('*'));

      elements.forEach((element) => {
        if (element.children.length > 0) return;
        const text = (element.textContent || '').trim();
        if (/^\d+\s+recommendations?$/i.test(text) || /^recommendations?:?\s*\d+$/i.test(text)) {
          element.remove();
        }
      });

      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach((node) => {
        const text = (node.nodeValue || '').trim();
        if (/^\d+\s+recommendations?$/i.test(text) || /^recommendations?:?\s*\d+$/i.test(text)) {
          node.remove();
        }
      });
    });
  }

  function applyCleanup() {
    removeInternalSearch();
    removeHomepageRecommendationMeta();
  }

  applyCleanup();
  new MutationObserver(applyCleanup).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
