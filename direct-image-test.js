(() => {
  if (window.location.pathname !== "/explore/" && window.location.pathname !== "/explore/index.html") return;

  function applyPhoto(title, photo, alternatives = []) {
    const titles = [title, ...alternatives];
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const alt = image.alt?.trim() || "";
      const text = card?.textContent || "";
      const isMatch = titles.some(name => alt === name || text.includes(name));
      if (!isMatch) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyAll() {
    applyPhoto("F1 Exhibition", "/images/8ff9674219704d66c64661d38e528f3f.jpg");
    applyPhoto("Lift 109", "/images/0d7e295df686fe1e8fe1ddf003a41794.jpg");
    applyPhoto("V&A Museum", "/images/182e732c1dbeb2ffc60b3a48e3bc7729.jpg", ["V&A"]);
    applyPhoto("The Monument", "/images/188ba73c4da2e2f545270b50b5a01330.jpg");
    applyPhoto("Saatchi Gallery", "/images/1939d360adeedd05cd242917995aeffd.jpg");
    applyPhoto("St Paul’s Cathedral", "/images/2683b978a8396c629c02c747905be9c5.jpg", ["St Paul's Cathedral", "St Pauls Cathedral"]);
    applyPhoto("Tate Modern", "/images/4928f976e7b52409afec4ab61092cee5.jpg");
    applyPhoto("Design Museum", "/images/590c6f0945d0d93cef5c726c9419abfa.jpg", ["The Design Museum"]);
    applyPhoto("Leighton House", "/images/5b427e328ceb6e89d8752d8e7acfc4f1.jpg", ["Leighton House Museum"]);
    applyPhoto("BFI IMAX", "/images/b1a57b35cafb5213490873c5e0a88418.jpg");
    applyPhoto("Sir John Soane’s Museum", "/images/bcdcf2460868566f19ee29f1435d9823.jpg", ["Sir John Soane's Museum"]);
    applyPhoto("Horizon 22", "/images/bf1a743a1ec2aae319c073e4b7bd7753.jpg");
    applyPhoto("Moco Museum", "/images/c75572fab1e1853343075543bac0b899.jpg");
    applyPhoto("The Wallace Collection", "/images/ec7c4ad259ef017c4671665e36aff59a.jpg", ["Wallace Collection"]);
    applyPhoto("The Garden at 120", "/images/f565cffccee2cd21103ac5db6e06a88b.jpg", ["Garden at 120"]);
    applyPhoto("Royal Academy of Arts", "/images/f79512cfb1ceef72be71da036b92318d.jpg", ["Royal Academy"]);
  }

  applyAll();
  new MutationObserver(applyAll).observe(document.documentElement, { childList: true, subtree: true });
})();
