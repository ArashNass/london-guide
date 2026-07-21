(() => {
  const cleanPath = window.location.pathname.replace(/\/+$/, "");
  const isHome = cleanPath === "" || cleanPath === "/index.html";

  const searchInputSelector = [
    'input[type="search"]',
    'input[placeholder*="search" i]',
    'input[aria-label*="search" i]'
  ].join(",");

  const searchControlSelector = [
    '[role="search"]',
    'form.search',
    '.search-bar',
    '.search-box',
    '.search-wrap',
    '.site-search',
    '.filter-search'
  ].join(",");

  function isSearchButton(element) {
    if (!(element instanceof HTMLElement)) return false;
    const label = `${element.getAttribute("aria-label") || ""} ${element.getAttribute("title") || ""}`.toLowerCase();
    const className = typeof element.className === "string" ? element.className.toLowerCase() : "";
    return label.includes("search") || className.includes("search");
  }

  function restoreHomepageSearch() {
    if (!isHome) return;

    document.querySelectorAll(`${searchInputSelector}, ${searchControlSelector}`).forEach((element) => {
      element.hidden = false;
      element.removeAttribute("aria-hidden");
      element.style.removeProperty("display");
      element.style.removeProperty("visibility");
      element.style.removeProperty("opacity");
      element.style.removeProperty("height");
      element.style.removeProperty("margin");
      element.style.removeProperty("padding");
    });

    document.querySelectorAll('button, [role="button"], a').forEach((element) => {
      if (!isSearchButton(element)) return;
      element.hidden = false;
      element.removeAttribute("aria-hidden");
      element.style.removeProperty("display");
      element.style.removeProperty("visibility");
      element.style.removeProperty("opacity");
    });
  }

  function removeInternalSearch() {
    if (isHome) return;

    const inputs = Array.from(document.querySelectorAll(searchInputSelector));
    inputs.forEach((input) => {
      const wrapper = input.closest(searchControlSelector) || input.closest("form") || input.parentElement;
      if (wrapper) wrapper.remove();
      else input.remove();
    });

    document.querySelectorAll('button, [role="button"], a').forEach((element) => {
      if (!isSearchButton(element)) return;
      const wrapper = element.closest(searchControlSelector);
      if (wrapper) wrapper.remove();
      else element.remove();
    });
  }

  function cleanHomepageCards() {
    if (!isHome) return;

    document.querySelectorAll('.category-tile').forEach((card) => {
      card.querySelectorAll('*').forEach((element) => {
        if (element.children.length) return;
        const text = (element.textContent || '').trim();
        if (/^\d+\s+recommendations?$/i.test(text) || /^recommendations?:?\s*\d+$/i.test(text)) {
          element.remove();
        }
      });

      card.querySelectorAll('span, p, small, div').forEach((element) => {
        if (element.children.length === 0 && !(element.textContent || '').trim()) {
          element.remove();
        }
      });
    });
  }

  function removeLandingGap() {
    if (!isHome) return;
    const styleId = 'homepage-cleanup-fixes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .category-tile > :empty{display:none!important}
      main > :first-child{margin-top:0}
    `;
    document.head.appendChild(style);
  }

  function applyCleanup() {
    restoreHomepageSearch();
    removeInternalSearch();
    cleanHomepageCards();
    removeLandingGap();
  }

  applyCleanup();
  new MutationObserver(applyCleanup).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
