(() => {
  const path = window.location.pathname;
  const isExplore = path === "/explore/" || path === "/explore/index.html";
  const isViews = path === "/views/" || path === "/views/index.html";
  const isFood = path === "/breakfast/" || path === "/breakfast/index.html" || path === "/restaurants/" || path === "/restaurants/index.html";
  const isShopping = path === "/shopping/" || path === "/shopping/index.html";
  const isApps = path === "/apps/" || path === "/apps/index.html";
  const isPubs = path === "/pubs/" || path === "/pubs/index.html";

  function applyPhoto(title, photo, alternatives = []) {
    const titles = [title, ...alternatives];
    document.querySelectorAll("img").forEach((image) => {
      const card = image.closest("article, .card, .place-card, [data-id]");
      const alt = image.alt?.trim() || "";
      const text = card?.textContent || "";
      if (!titles.some(name => alt === name || text.includes(name))) return;
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
    });
  }

  function applyAppPhoto(title, photo, alternatives = []) {
    const titles = [title, ...alternatives];
    document.querySelectorAll("article, .card, .place-card, [data-id]").forEach((card) => {
      const text = card.textContent || "";
      if (!titles.some(name => text.includes(name))) return;
      let image = card.querySelector("img");
      if (!image) {
        const media = document.createElement("div");
        media.className = "card-media app-card-media";
        image = document.createElement("img");
        image.alt = title;
        image.loading = "lazy";
        image.decoding = "async";
        media.appendChild(image);
        card.insertBefore(media, card.firstChild);
      }
      image.srcset = "";
      image.src = photo;
      image.classList.add("photo-loaded");
      image.style.opacity = "1";
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";
    });
  }

  function applySoulPhotos() {
    applyPhoto("F1 Exhibition", "/images/8ff9674219704d66c64661d38e528f3f.jpg");
    applyPhoto("Lift 109", "/images/0d7e295df686fe1e8fe1ddf003a41794.jpg");
    applyPhoto("V&A Museum", "/images/182e732c1dbeb2ffc60b3a48e3bc7729.jpg", ["V&A"]);
    applyPhoto("The Monument", "/images/188ba73c4da2e2f545270b50b5a01330.jpg");
    applyPhoto("Saatchi Gallery", "/images/1939d360adeedd05cd242917995aeffd.jpg");
    applyPhoto("St Paul’s Cathedral", "/images/2683b978a8396c629c02c747905be9c5.jpg", ["St Paul's Cathedral", "St Pauls Cathedral"]);
    applyPhoto("Tate Modern", "/images/4928f976e7b52409afec4ab61092cee5.jpg");
    applyPhoto("Design Museum", "/images/590c6f0945d0d93cef5c726c9419abfa.jpg", ["The Design Museum"]);
    applyPhoto("Leighton House", "/images/5b427e328ceb6e89d8752d8e7acfc4f1.jpg", ["Leighton House Museum"]);
    applyPhoto("British Museum", "/images/66f907155dfc2a28b81a8a22527eabe4.jpg", ["The British Museum"]);
    applyPhoto("BFI IMAX", "/images/b1a57b35cafb5213490873c5e0a88418.jpg");
    applyPhoto("Sir John Soane’s Museum", "/images/bcdcf2460868566f19ee29f1435d9823.jpg", ["Sir John Soane's Museum"]);
    applyPhoto("Horizon 22", "/images/bf1a743a1ec2aae319c073e4b7bd7753.jpg");
    applyPhoto("Moco Museum", "/images/c75572fab1e1853343075543bac0b899.jpg");
    applyPhoto("The Wallace Collection", "/images/ec7c4ad259ef017c4671665e36aff59a.jpg", ["Wallace Collection"]);
    applyPhoto("The Garden at 120", "/images/f565cffccee2cd21103ac5db6e06a88b.jpg", ["Garden at 120"]);
    applyPhoto("Royal Academy of Arts", "/images/f79512cfb1ceef72be71da036b92318d.jpg", ["Royal Academy"]);
  }

  function applyFood() {
    applyPhoto("Half Cup", "/images/00494a2df5ca8e2b91f205ba000dbd38.jpg");
    applyPhoto("Dishoom", "/images/346442533b03c08660d77daa3b8cdda2.jpg");
    applyPhoto("Le Relais de Venise L’Entrecôte", "/images/3c8d562250a27622c1c1ac1ad42a9806.jpg", ["Le Relais de Venise L'Entrecôte", "Le Relais de Venise"]);
    applyPhoto("Ishtar", "/images/3d69726a21c208527432b5460d9dc3a9.jpg");
    applyPhoto("L’ETO", "/images/41f6279b6e7f35c8dda61ddbb31297a8.jpg", ["L'ETO", "Leto"]);
    applyPhoto("Lina Stores", "/images/41fa9eb2951df180b394cb858ecd4d45.jpg");
    applyPhoto("Kimchee Restaurant & Bar", "/images/4587d1bd55103a623ba641955d89b07c.jpg", ["Kimchee"]);
    applyPhoto("Lemonia", "/images/54425ba5ef290e2ec5218b0723970e10.jpg");
    applyPhoto("Fischer’s", "/images/720113e2b342ab64ac630ea457fc8263.jpg", ["Fischer's"]);
    applyPhoto("Berenjak Soho", "/images/7a6afd8a923c1c060dbe8212e235f61b.jpg", ["Berenjak"]);
    applyPhoto("Opium Chinatown", "/images/8480b383aacd251fef1074fe62cd1346.jpg", ["Opium"]);
    applyPhoto("Din Tai Fung", "/images/9006b8ae2007f252b1fd5666469091d3.jpg");
    applyPhoto("Delamina EAST", "/images/a649b60fff8ec82aa0d5a510a212bf0d.jpg", ["Delamina East", "Delamina"]);
    applyPhoto("Alley Cats Pizza", "/images/ad5dc861c8d7c3868448441daacc2b3f.jpg", ["Alley Cats"]);
    applyPhoto("Chiltern Firehouse", "/images/c676d3ebdec91cba64684da3f11bbe31.jpg");
    applyPhoto("Granger & Co.", "/images/c81ce6bd5f280942bda03c7fbbd5e91c.jpg", ["Granger & Co"]);
    applyPhoto("The Breakfast Club", "/images/d013d1bb44fc987eb5bf22fd4e228043.jpg", ["Breakfast Club"]);
    applyPhoto("Roti King Battersea", "/images/df8bb4fb6c8da946c315e192af5210cb.jpg", ["Roti King"]);
    applyPhoto("Arcade Food Hall", "/images/e580f0c958a1121c595240f13d3883d4.jpg", ["Arcade"]);
    applyPhoto("Bergamot Café", "/images/e88d4e7e899a0363be3b345815f13822.jpg", ["Bergamot Cafe", "Bergamot"]);
    applyPhoto("Circolo Popolare", "/images/fde7e35fc725aeb1c6f2f906a184413c.jpg");
    applyPhoto("Gloria", "/images/feff9e6fa96d77c9622af0fe3abae913.jpg");
  }

  function applyShopping() {
    applyPhoto("Coal Drops Yard", "/images/03cb11cfd4ee6c96f4ec21ed756d6cc1.jpg");
    applyPhoto("Battersea Power Station", "/images/b5e8b7df1d5fe5ae2779237a53bcf7a6.jpg");
    applyPhoto("Old Spitalfields Market", "/images/e813e2e8f284aa11bfd2f81358ffa87f.jpg");
    applyPhoto("Borough Market", "/images/41a99e55539357a81955f12190896f70.jpg");
    applyPhoto("Marylebone Village", "/images/e69b9e9707c5183433881687d2f19359.jpg");
    applyPhoto("Carnaby", "/images/8f5b8ef7cd12ecb14cb2404ac6608827.jpg");
    applyPhoto("Canary Wharf", "/images/e52ceff1ff32deea99bcb86de55b0ccf.jpg");
  }

  function applyApps() {
    applyAppPhoto("OpenTable", "/images/2106c116b808c86a4f578d65e7c9ca52.jpg");
    applyAppPhoto("DICE", "/images/367cb00006fe16108ca5781b0efd9cda.jpg");
    applyAppPhoto("TheFork", "/images/38c399d0f90f8edd059b9ba0e4bbce19.jpg", ["The Fork"]);
    applyAppPhoto("TodayTix", "/images/55be792712f487cbb7fad11b94c2ef3c.jpg");
    applyAppPhoto("Citymapper", "/images/aef4f2f7a78a66dade68e08a9685a28f.jpg");
    applyAppPhoto("Toilets4London", "/images/d26e57a6ecbe9658f192fd06593c0e77.jpg", ["Toilets 4 London"]);
    applyAppPhoto("Time Out London", "/images/d470b67dc768f6e5e7ed2b202e63b977.jpg", ["Time Out"]);
    applyAppPhoto("Fever", "/images/f1463aabedc6d56097bd6adf9cc1fddc.jpg");
    applyAppPhoto("Gett", "/images/fe7848d644553ba7994e60ceb2bdad56.jpg");
  }

  function applyPubs() {
    applyPhoto("The Spaniards Inn", "/images/c3f6f0e1a278129c41232961a1cc5fa5.jpg");
    applyPhoto("The Gun", "/images/502715d327bf1875cd7c5e3388c99320.jpg");
    applyPhoto("Trafalgar Tavern", "/images/266d7b0acceed2cd5596a08742b97676.jpg", ["The Trafalgar Tavern"]);
    applyPhoto("Mr Fogg’s Tavern", "/images/ecd187f214537c371de0d4134f274313.jpg", ["Mr Fogg's Tavern"]);
    applyPhoto("The Churchill Arms", "/images/c676d3ebdec91cba64684da3f11bbe31.jpg", ["Churchill Arms"]);
  }

  function applyAll() {
    if (isExplore || isViews) applySoulPhotos();
    if (isFood) applyFood();
    if (isShopping) applyShopping();
    if (isApps) applyApps();
    if (isPubs) applyPubs();
  }

  function isVisible(element) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) !== 0 && rect.width > 0 && rect.height > 0;
  }

  function isCloseControl(element) {
    if (!(element instanceof HTMLElement) || !isVisible(element)) return false;
    const label = `${element.getAttribute("aria-label") || ""} ${element.getAttribute("title") || ""}`.toLowerCase();
    const text = (element.textContent || "").trim();
    return label.includes("close") || ["×", "✕", "✖", "close"].includes(text.toLowerCase());
  }

  function getModalGeometry(closeControl) {
    let overlay = closeControl.parentElement;
    while (overlay && overlay !== document.body) {
      const style = getComputedStyle(overlay);
      const rect = overlay.getBoundingClientRect();
      const coversViewport = rect.width >= window.innerWidth * 0.8 && rect.height >= window.innerHeight * 0.8;
      if ((style.position === "fixed" || style.position === "absolute") && coversViewport) break;
      overlay = overlay.parentElement;
    }
    if (!overlay || overlay === document.body) return null;

    let panel = closeControl.parentElement;
    let bestPanel = panel;
    while (panel && panel !== overlay) {
      const rect = panel.getBoundingClientRect();
      const isPanelSized = rect.width < window.innerWidth * 0.96 || rect.height < window.innerHeight * 0.96;
      if (isPanelSized) bestPanel = panel;
      panel = panel.parentElement;
    }

    return { overlay, panel: bestPanel };
  }

  document.addEventListener("pointerdown", (event) => {
    const candidates = Array.from(document.querySelectorAll("button, [role='button'], [aria-label], [title], [data-close], a, span, div"));
    const closeControls = candidates.filter(isCloseControl);

    for (const closeControl of closeControls) {
      const modal = getModalGeometry(closeControl);
      if (!modal) continue;

      const overlayRect = modal.overlay.getBoundingClientRect();
      const panelRect = modal.panel.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      const insideOverlay = x >= overlayRect.left && x <= overlayRect.right && y >= overlayRect.top && y <= overlayRect.bottom;
      const insidePanel = x >= panelRect.left && x <= panelRect.right && y >= panelRect.top && y <= panelRect.bottom;

      if (insideOverlay && !insidePanel) {
        event.preventDefault();
        event.stopPropagation();
        closeControl.click();
        return;
      }
    }
  }, true);

  const style = document.createElement("style");
  style.textContent = ".app-card-media{aspect-ratio:16/9;overflow:hidden;background:#e9e4db}.app-card-media img{display:block;width:100%;height:100%;object-fit:cover}";
  document.head.appendChild(style);

  applyAll();
  new MutationObserver(applyAll).observe(document.documentElement, { childList: true, subtree: true });
})();