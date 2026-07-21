(() => {
  const photos = {
    "F1 Exhibition": "/images/8ff9674219704d66c64661d38e528f3f.jpg",
    "Leighton House": "/images/0d7e295df686fe1e8fe1ddf003a41794.jpg",
    "Design Museum": "/images/182e732c1dbeb2ffc60b3a48e3bc7729.jpg",
    "Saatchi Gallery": "/images/188ba73c4da2e2f545270b50b5a01330.jpg",
    "Tate Modern": "/images/5b427e328ceb6e89d8752d8e7acfc4f1.jpg",
    "Battersea Power Station": "/images/66f907155dfc2a28b81a8a22527eabe4.jpg"
  };

  function apply() {
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const text = `${image.alt || ""} ${card?.textContent || ""}`;
      const match = Object.entries(photos).find(([name]) => text.includes(name));
      if (!match) return;

      image.removeAttribute("srcset");
      image.src = match[1];
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
})();