(() => {
  const photos = [
    { names: ["F1 Exhibition"], src: "/images/8ff9674219704d66c64661d38e528f3f.jpg" },
    { names: ["Leighton House", "Leighton House Museum"], src: "/images/0d7e295df686fe1e8fe1ddf003a41794.jpg" },
    { names: ["Design Museum", "The Design Museum"], src: "/images/182e732c1dbeb2ffc60b3a48e3bc7729.jpg" },
    { names: ["Saatchi Gallery"], src: "/images/188ba73c4da2e2f545270b50b5a01330.jpg" },
    { names: ["Tate Modern"], src: "/images/5b427e328ceb6e89d8752d8e7acfc4f1.jpg" },
    { names: ["Battersea Power Station"], src: "/images/66f907155dfc2a28b81a8a22527eabe4.jpg" }
  ];

  const normalise = value => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

  function setImage(image, src) {
    if (!image || image.dataset.uploadedVenuePhoto === src) return;
    image.dataset.uploadedVenuePhoto = src;
    image.removeAttribute("srcset");
    image.src = src;
    image.classList.add("photo-loaded");
    image.style.opacity = "1";
  }

  function nearestImages(element, aliases) {
    let current = element;
    for (let depth = 0; current && current !== document.body && depth < 10; depth += 1, current = current.parentElement) {
      const images = [...current.querySelectorAll("img")];
      if (!images.length) continue;

      const aliasMatch = images.find(image => {
        const alt = normalise(image.alt);
        return aliases.some(alias => alt.includes(normalise(alias)));
      });

      return aliasMatch ? [aliasMatch] : [images[0]];
    }
    return [];
  }

  function apply() {
    for (const photo of photos) {
      const aliases = photo.names;
      const normalisedAliases = aliases.map(normalise);

      document.querySelectorAll("img").forEach(image => {
        const alt = normalise(image.alt);
        if (normalisedAliases.some(alias => alt.includes(alias))) setImage(image, photo.src);
      });

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        const text = normalise(textNode.nodeValue);
        if (!text || !normalisedAliases.some(alias => text.includes(alias))) continue;
        nearestImages(textNode.parentElement, aliases).forEach(image => setImage(image, photo.src));
      }
    }
  }

  apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
})();