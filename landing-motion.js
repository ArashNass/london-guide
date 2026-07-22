(() => {
  const path = location.pathname.replace(/\/+$/, "");
  if (path && path !== "/index.html") return;
  if (document.documentElement.dataset.landingEnhanced) return;
  document.documentElement.dataset.landingEnhanced = "true";

  const style = document.createElement("style");
  style.textContent = `
    body{overflow-x:hidden}
    .landing-hero{display:grid!important;grid-template-columns:minmax(0,1.15fr) minmax(280px,.7fr);align-items:center;gap:clamp(32px,6vw,88px);padding-top:clamp(52px,8vw,104px)!important;padding-bottom:clamp(42px,6vw,78px)!important}
    .landing-hero-copy{min-width:0}
    .landing-hero-copy h1{max-width:760px;text-wrap:balance;letter-spacing:-.055em}
    .landing-hero-copy p{max-width:650px;text-wrap:pretty}
    .landing-featured-slot{min-width:0;align-self:center}
    .landing-featured-slot .category-tile{width:100%;min-height:clamp(280px,32vw,420px);display:block;background:#1e2a20;overflow:hidden;border-radius:inherit}
    .landing-card-grid{position:relative}
    .landing-card-grid .category-tile.fly-in,.landing-featured-slot .category-tile.fly-in{opacity:0;transform:translateY(40px);animation:flyIn .5s ease-out forwards;animation-delay:calc(var(--i) * .08s);will-change:opacity,transform}
    .landing-card-grid.fly-complete .category-tile,.landing-featured-slot.fly-complete .category-tile{opacity:1;transform:none;animation:none;will-change:auto}
    @keyframes flyIn{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:760px){
      .landing-hero{display:block!important;padding-top:42px!important;padding-bottom:30px!important}
      .landing-featured-slot{display:none}
    }
    @media(prefers-reduced-motion:reduce){
      .landing-card-grid .category-tile.fly-in,.landing-featured-slot .category-tile.fly-in{opacity:1!important;transform:none!important;animation:none!important;will-change:auto!important}
    }
  `;
  document.head.appendChild(style);

  const findHero = () => {
    const heading = Array.from(document.querySelectorAll("h1,h2")).find(el => /London, without the endless list\.?/i.test(el.textContent || "")) || document.querySelector("main h1");
    return heading?.closest("section,header,.hero") || heading?.parentElement || null;
  };

  const findCardSection = () => {
    const gridTile = Array.from(document.querySelectorAll("a.category-tile"))
      .find(t => !t.closest(".landing-featured-slot"));
    return gridTile?.closest("section") || gridTile?.parentElement || null;
  };

  let animationStarted = false;
  let cardObserver = null;
  let mobileQuery = null;
  let firstCard = null;
  let cardPlaceholder = null;
  let featuredSlot = null;

  const startAnimationOnce = (cards, grid) => {
    if (animationStarted) return;
    animationStarted = true;
    cards.forEach((card, index) => {
      card.style.setProperty("--i", String(index));
      card.classList.add("fly-in");
    });
    window.setTimeout(() => {
      grid.classList.add("fly-complete");
      featuredSlot?.classList.add("fly-complete");
      cards.forEach(card => card.classList.remove("fly-in"));
    }, 1250);
  };

  const eagerLoadFeaturedImages = () => {
    if (!firstCard) return;
    firstCard.querySelectorAll("img").forEach(img => {
      if (img.loading === "lazy") img.loading = "eager";
      if (img.src && !img.complete && !img.dataset.eagerNudged) {
        img.dataset.eagerNudged = "1";
        const src = img.src;
        img.src = "";
        img.src = src;
      }
    });
  };

  const arrangeFeaturedCard = () => {
    if (!firstCard || !cardPlaceholder || !featuredSlot || !mobileQuery) return;
    if (mobileQuery.matches) {
      if (firstCard.parentElement !== cardPlaceholder.parentElement || firstCard.previousSibling !== cardPlaceholder) {
        cardPlaceholder.insertAdjacentElement("afterend", firstCard);
      }
    } else if (firstCard.parentElement !== featuredSlot) {
      featuredSlot.appendChild(firstCard);
      eagerLoadFeaturedImages();
    }
  };

  const enhance = () => {
    const hero = findHero();
    const grid = findCardSection();
    const cards = Array.from(document.querySelectorAll("a.category-tile"));
    if (!hero || !grid || cards.length !== 7) return false;

    hero.classList.add("landing-hero");
    grid.classList.add("landing-card-grid");

    if (!hero.querySelector(":scope > .landing-hero-copy")) {
      const copy = document.createElement("div");
      copy.className = "landing-hero-copy";
      Array.from(hero.children).forEach(child => copy.appendChild(child));
      hero.appendChild(copy);
    }

    firstCard = cards[0];
    if (!cardPlaceholder) {
      cardPlaceholder = document.createComment("featured-card-position");
      firstCard.parentNode.insertBefore(cardPlaceholder, firstCard);
    }
    featuredSlot = hero.querySelector(":scope > .landing-featured-slot");
    if (!featuredSlot) {
      featuredSlot = document.createElement("div");
      featuredSlot.className = "landing-featured-slot";
      hero.appendChild(featuredSlot);
    }

    if (!mobileQuery) {
      mobileQuery = window.matchMedia("(max-width: 760px)");
      mobileQuery.addEventListener?.("change", arrangeFeaturedCard);
    }
    arrangeFeaturedCard();

    if (!animationStarted) {
      const belowFold = grid.getBoundingClientRect().top > window.innerHeight * .92;
      if (belowFold && "IntersectionObserver" in window) {
        cardObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            cardObserver.disconnect();
            startAnimationOnce(cards, grid);
          }
        }, {threshold:.08});
        cardObserver.observe(grid);
      } else {
        requestAnimationFrame(() => startAnimationOnce(cards, grid));
      }
    }

    return true;
  };

  if (!enhance()) {
    const observer = new MutationObserver(() => {
      if (enhance()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    window.setTimeout(() => observer.disconnect(), 8000);
  }
})();