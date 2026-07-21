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

  function applyLift109() {
    const photo = "/images/0d7e295df686fe1e8fe1ddf003a41794.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Lift 109" || card?.textContent?.includes("Lift 109");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyVAMuseum() {
    const photo = "/images/182e732c1dbeb2ffc60b3a48e3bc7729.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "V&A Museum" || card?.textContent?.includes("V&A Museum");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyTheMonument() {
    const photo = "/images/188ba73c4da2e2f545270b50b5a01330.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "The Monument" || card?.textContent?.includes("The Monument");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applySaatchiGallery() {
    const photo = "/images/1939d360adeedd05cd242917995aeffd.jpg";
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

  function applyStPaulsCathedral() {
    const photo = "/images/2683b978a8396c629c02c747905be9c5.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "St Paul’s Cathedral" || card?.textContent?.includes("St Paul’s Cathedral");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyTateModern() {
    const photo = "/images/4928f976e7b52409afec4ab61092cee5.jpg";
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

  function applyDesignMuseum() {
    const photo = "/images/590c6f0945d0d93cef5c726c9419abfa.jpg";
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

  function applyLeightonHouse() {
    const photo = "/images/5b427e328ceb6e89d8752d8e7acfc4f1.jpg";
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

  function applyBritishMuseum() {
    const photo = "/images/66f907155dfc2a28b81a8a22527eabe4.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "British Museum" || card?.textContent?.includes("British Museum");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyBFIIMAX() {
    const photo = "/images/b1a57b35cafb5213490873c5e0a88418.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "BFI IMAX" || card?.textContent?.includes("BFI IMAX");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applySirJohnSoanesMuseum() {
    const photo = "/images/bcdcf2460868566f19ee29f1435d9823.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Sir John Soane’s Museum" || card?.textContent?.includes("Sir John Soane’s Museum");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyHorizon22() {
    const photo = "/images/bf1a743a1ec2aae319c073e4b7bd7753.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Horizon 22" || card?.textContent?.includes("Horizon 22");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyMocoMuseum() {
    const photo = "/images/c75572fab1e1853343075543bac0b899.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Moco Museum" || card?.textContent?.includes("Moco Museum");
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
      const isMatch = image.alt?.trim() === "Wallace Collection" || card?.textContent?.includes("Wallace Collection");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyGardenAt120() {
    const photo = "/images/f565cffccee2cd21103ac5db6e06a88b.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "The Garden at 120" || card?.textContent?.includes("The Garden at 120");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyRoyalAcademyOfArts() {
    const photo = "/images/f79512cfb1ceef72be71da036b92318d.jpg";
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const isMatch = image.alt?.trim() === "Royal Academy of Arts" || card?.textContent?.includes("Royal Academy of Arts");
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyAll() {
    applyF1();
    applyLift109();
    applyVAMuseum();
    applyTheMonument();
    applySaatchiGallery();
    applyStPaulsCathedral();
    applyTateModern();
    applyDesignMuseum();
    applyLeightonHouse();
    applyBritishMuseum();
    applyBFIIMAX();
    applySirJohnSoanesMuseum();
    applyHorizon22();
    applyMocoMuseum();
    applyWallaceCollection();
    applyGardenAt120();
    applyRoyalAcademyOfArts();
  }

  applyAll();
  new MutationObserver(applyAll).observe(document.documentElement, { childList: true, subtree: true });
})();
