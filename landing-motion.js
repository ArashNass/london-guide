(() => {
  const path = location.pathname.replace(/\/+$/, "");
  if (path && path !== "/index.html") return;
  if (document.documentElement.dataset.landingEnhanced) return;
  document.documentElement.dataset.landingEnhanced = "true";

  const style = document.createElement("style");
  style.textContent = `
    :root{--landing-ease:cubic-bezier(.2,.78,.24,1)}
    body{overflow-x:hidden}
    .landing-hero{position:relative;display:grid!important;grid-template-columns:minmax(0,1.08fr) minmax(280px,.72fr);align-items:center;gap:clamp(34px,6vw,92px);min-height:min(680px,76vh);padding-top:clamp(54px,8vw,108px)!important;padding-bottom:clamp(48px,7vw,94px)!important}
    .landing-hero:before{content:"";position:absolute;z-index:-1;width:clamp(280px,38vw,610px);aspect-ratio:1;border-radius:50%;right:clamp(-230px,-13vw,-80px);top:clamp(-190px,-8vw,-60px);background:radial-gradient(circle at 42% 42%,rgba(177,47,47,.13),rgba(177,47,47,.035) 48%,transparent 70%);filter:blur(1px);pointer-events:none}
    .landing-hero-copy{min-width:0}
    .landing-hero-copy h1{max-width:760px;text-wrap:balance;letter-spacing:-.055em}
    .landing-hero-copy p{max-width:650px;text-wrap:pretty}
    .landing-featured{position:relative;align-self:center;justify-self:stretch;transform:rotate(2.4deg) translate3d(34px,12px,0);opacity:0;animation:landingFeatureIn .95s .15s var(--landing-ease) forwards;filter:drop-shadow(0 28px 34px rgba(26,25,22,.15));z-index:2}
    .landing-featured:before,.landing-featured:after{content:"";position:absolute;inset:10px -12px -12px 12px;border:1px solid rgba(30,30,28,.09);border-radius:inherit;z-index:-1;background:rgba(255,255,255,.5)}
    .landing-featured:after{inset:20px -22px -22px 22px;opacity:.45}
    .landing-featured .category-tile,.landing-featured>a{min-height:clamp(300px,36vw,440px);height:100%;transform:none!important}
    .landing-featured-badge{position:absolute;top:-14px;left:-14px;z-index:4;padding:9px 12px;border-radius:999px;background:#18191c;color:#fff;font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;box-shadow:0 10px 22px rgba(0,0,0,.16)}
    .landing-card-flow .category-tile{opacity:0;transform:translate3d(var(--flow-x,0),52px,0) rotate(var(--flow-r,0deg));animation:landingCardIn .82s var(--flow-delay,0s) var(--landing-ease) forwards;will-change:transform,opacity}
    .landing-card-flow .category-tile:hover{z-index:3}
    .landing-live-anchor{max-width:1180px;margin:clamp(28px,5vw,72px) auto 0;padding:0 0 clamp(20px,4vw,48px)}
    .landing-live-anchor>.london-now{margin:0 auto!important}
    @keyframes landingFeatureIn{to{opacity:1;transform:rotate(1deg) translate3d(0,0,0)}}
    @keyframes landingCardIn{to{opacity:1;transform:translate3d(0,0,0) rotate(0)}}
    @media(max-width:860px){.landing-hero{grid-template-columns:1fr;min-height:auto;gap:30px}.landing-featured{width:min(100%,520px);justify-self:start;transform:rotate(1deg) translate3d(0,28px,0)}.landing-featured .category-tile,.landing-featured>a{min-height:280px}.landing-live-anchor{padding-left:16px;padding-right:16px}}
    @media(max-width:620px){.landing-hero{padding-top:42px!important}.landing-featured{display:none}.landing-card-flow .category-tile{--flow-x:0!important;--flow-r:0deg!important}}
    @media(prefers-reduced-motion:reduce){.landing-featured,.landing-card-flow .category-tile{animation:none!important;opacity:1!important;transform:none!important}.landing-hero:before{filter:none}}
  `;
  document.head.appendChild(style);

  const findHero = () => {
    const heading = Array.from(document.querySelectorAll("h1,h2")).find(el => /London, without the endless list\.?/i.test(el.textContent || "")) || document.querySelector("main h1");
    return heading?.closest("section,header,.hero") || heading?.parentElement || null;
  };

  const findCardSection = () => {
    const first = document.querySelector("a.category-tile");
    return first?.closest("section") || first?.parentElement || null;
  };

  const moveLivePanel = () => {
    const panel = document.querySelector("[data-london-now]");
    const cardSection = findCardSection();
    if (!panel || !cardSection || panel.closest(".landing-live-anchor")) return false;
    let anchor = document.querySelector(".landing-live-anchor");
    if (!anchor) {
      anchor = document.createElement("div");
      anchor.className = "landing-live-anchor";
      cardSection.insertAdjacentElement("afterend", anchor);
    }
    anchor.appendChild(panel);
    return true;
  };

  const enhance = () => {
    const hero = findHero();
    const cards = Array.from(document.querySelectorAll("a.category-tile"));
    if (!hero || cards.length < 2) return false;

    hero.classList.add("landing-hero");
    if (!hero.querySelector(":scope > .landing-hero-copy")) {
      const copy = document.createElement("div");
      copy.className = "landing-hero-copy";
      Array.from(hero.children).forEach(child => copy.appendChild(child));
      hero.appendChild(copy);
    }

    if (!hero.querySelector(".landing-featured")) {
      const feature = document.createElement("div");
      feature.className = "landing-featured";
      const badge = document.createElement("span");
      badge.className = "landing-featured-badge";
      badge.textContent = "Start here";
      const clone = cards[0].cloneNode(true);
      clone.removeAttribute("id");
      feature.append(badge, clone);
      hero.appendChild(feature);
    }

    const grid = findCardSection();
    if (grid && !grid.classList.contains("landing-card-flow")) {
      grid.classList.add("landing-card-flow");
      cards.forEach((card, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        card.style.setProperty("--flow-x", `${side * Math.min(52, 18 + index * 5)}px`);
        card.style.setProperty("--flow-r", `${side * (1.2 + (index % 3) * .55)}deg`);
        card.style.setProperty("--flow-delay", `${Math.min(.08 * index, .64)}s`);
      });
    }
    moveLivePanel();
    return true;
  };

  enhance();
  const observer = new MutationObserver(() => {
    enhance();
    moveLivePanel();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  setTimeout(() => observer.disconnect(), 8000);
})();