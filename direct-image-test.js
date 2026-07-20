(() => {
  const photo = "/images/f1-exhibition.jpg";

  function apply() {
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isF1 = image.alt?.trim() === "F1 Exhibition" || card?.textContent?.includes("F1 Exhibition");
      if (!isF1) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
})();
