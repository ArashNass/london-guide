(() => {
  if (window.location.pathname !== "/explore/" && window.location.pathname !== "/explore/index.html") return;

  function applyF1() {
    const photo = "/images/8ff9674219704d66c64661d38e528f3f.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "F1 Exhibition" || card?.textContent?.includes("F1 Exhibition");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyWallaceCollection() {
    const photo = "/images/ec7c4ad259ef017c4671665e36aff59a.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "The Wallace Collection" ||
        image.alt?.trim() === "Wallace Collection" ||
        card?.textContent?.includes("The Wallace Collection") ||
        card?.textContent?.includes("Wallace Collection");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyAll() {
    applyF1();
    applyWallaceCollection();
  }

  applyAll();
  new MutationObserver(applyAll).observe(document.documentElement, { childList: true, subtree: true });
})();
