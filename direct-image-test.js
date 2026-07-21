(() => {
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

  function applyLeightonHouse() {
    const photo = "/images/0d7e295df686fe1e8fe1ddf003a41794.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Leighton House" || card?.textContent?.includes("Leighton House");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyDesignMuseum() {
    const photo = "/images/182e732c1dbeb2ffc60b3a48e3bc7729.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Design Museum" || card?.textContent?.includes("Design Museum");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applySaatchiGallery() {
    const photo = "/images/188ba73c4da2e2f545270b50b5a01330.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Saatchi Gallery" || card?.textContent?.includes("Saatchi Gallery");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyTateModern() {
    const photo = "/images/5b427e328ceb6e89d8752d8e7acfc4f1.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Tate Modern" || card?.textContent?.includes("Tate Modern");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyBatterseaPowerStation() {
    const photo = "/images/66f907155dfc2a28b81a8a22527eabe4.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Battersea Power Station" || card?.textContent?.includes("Battersea Power Station");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyAll() {
    applyF1();
    applyLeightonHouse();
    applyDesignMuseum();
    applySaatchiGallery();
    applyTateModern();
    applyBatterseaPowerStation();
  }

  applyAll();
  new MutationObserver(applyAll).observe(document.documentElement, { childList: true, subtree: true });
})();
