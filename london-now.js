(() => {
  if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;
  if (document.querySelector("[data-london-now]")) return;

  const weatherLabels = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorms",
    96: "Thunderstorms",
    99: "Thunderstorms"
  };

  const panel = document.createElement("section");
  panel.className = "london-now";
  panel.dataset.londonNow = "";
  panel.setAttribute("aria-label", "London live information");
  panel.innerHTML = `
    <div class="london-now__topline">
      <div>
        <span class="london-now__eyebrow">London now</span>
        <h2 class="london-now__time" data-now-time>--:--</h2>
      </div>
      <span class="london-now__pulse"><i></i>Live</span>
    </div>
    <div class="london-now__grid">
      <div class="london-now__item">
        <span>Weather</span>
        <strong data-now-weather>Loading…</strong>
      </div>
      <div class="london-now__item">
        <span>Sunset</span>
        <strong data-now-sunset>Loading…</strong>
      </div>
      <div class="london-now__item london-now__item--wide">
        <span>Tube status</span>
        <strong data-now-tube>Checking TfL…</strong>
      </div>
    </div>
    <a class="london-now__link" href="https://tfl.gov.uk/tube-dlr-overground/status/" target="_blank" rel="noopener noreferrer">View live travel <span aria-hidden="true">↗</span></a>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .london-now{max-width:1180px;margin:28px auto 34px;padding:24px 26px;border:1px solid rgba(21,24,29,.11);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(245,242,235,.92));box-shadow:0 18px 55px rgba(30,28,24,.08);color:#17191d;position:relative;overflow:hidden}
    .london-now:after{content:"";position:absolute;width:240px;height:240px;border-radius:50%;right:-90px;top:-130px;background:radial-gradient(circle,rgba(201,51,51,.12),transparent 68%);pointer-events:none}
    .london-now__topline{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:20px}
    .london-now__eyebrow{display:block;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a12626;margin-bottom:5px}
    .london-now__time{font-size:clamp(34px,5vw,58px);line-height:.95;letter-spacing:-.055em;margin:0;font-weight:760}
    .london-now__pulse{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:750;text-transform:uppercase;letter-spacing:.09em;color:#4d5157;margin-top:4px}
    .london-now__pulse i{width:8px;height:8px;border-radius:50%;background:#2e9b63;box-shadow:0 0 0 5px rgba(46,155,99,.12);animation:londonPulse 2s infinite}
    .london-now__grid{display:grid;grid-template-columns:1fr 1fr 2fr;gap:12px}
    .london-now__item{min-width:0;padding:15px 16px;border-radius:15px;background:rgba(255,255,255,.74);border:1px solid rgba(21,24,29,.07)}
    .london-now__item span{display:block;font-size:11px;font-weight:780;text-transform:uppercase;letter-spacing:.11em;color:#777b82;margin-bottom:7px}
    .london-now__item strong{display:block;font-size:15px;line-height:1.35;font-weight:700;color:#202329}
    .london-now__link{display:inline-flex;align-items:center;gap:6px;margin-top:18px;color:#202329;font-size:13px;font-weight:750;text-decoration:none;border-bottom:1px solid rgba(32,35,41,.28);padding-bottom:2px}
    .london-now__link:hover{border-color:#a12626;color:#a12626}
    @keyframes londonPulse{0%,100%{box-shadow:0 0 0 4px rgba(46,155,99,.12)}50%{box-shadow:0 0 0 9px rgba(46,155,99,0)}}
    @media(max-width:760px){.london-now{margin:22px 16px 28px;padding:20px;border-radius:18px}.london-now__grid{grid-template-columns:1fr 1fr}.london-now__item--wide{grid-column:1/-1}.london-now__time{font-size:42px}}
    @media(max-width:420px){.london-now__grid{grid-template-columns:1fr}.london-now__item--wide{grid-column:auto}}
    @media(prefers-reduced-motion:reduce){.london-now__pulse i{animation:none}}
  `;
  document.head.appendChild(style);

  const firstTile = document.querySelector("a.category-tile");
  const target = firstTile?.closest("section") || firstTile?.parentElement;
  if (target) target.parentElement.insertBefore(panel, target);
  else document.querySelector("main")?.prepend(panel);

  const timeNode = panel.querySelector("[data-now-time]");
  const updateClock = () => {
    timeNode.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
  };
  updateClock();
  setInterval(updateClock, 30000);

  async function loadWeather() {
    const weatherNode = panel.querySelector("[data-now-weather]");
    const sunsetNode = panel.querySelector("[data-now-sunset]");
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current=temperature_2m,weather_code&daily=sunset&timezone=Europe%2FLondon&forecast_days=1";
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Weather unavailable");
      const data = await response.json();
      const temp = Math.round(data.current.temperature_2m);
      const label = weatherLabels[data.current.weather_code] || "Current conditions";
      weatherNode.textContent = `${temp}°C · ${label}`;
      const sunset = new Date(data.daily.sunset[0]);
      sunsetNode.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(sunset);
    } catch {
      weatherNode.textContent = "Weather unavailable";
      sunsetNode.textContent = "—";
    }
  }

  async function loadTube() {
    const tubeNode = panel.querySelector("[data-now-tube]");
    try {
      const response = await fetch("https://api.tfl.gov.uk/Line/Mode/tube/Status", { cache: "no-store" });
      if (!response.ok) throw new Error("TfL unavailable");
      const lines = await response.json();
      const affected = lines.filter(line =>
        line.lineStatuses?.some(status => status.statusSeverity !== 10)
      );
      if (!affected.length) {
        tubeNode.textContent = `Good service on all ${lines.length} Tube lines`;
        return;
      }
      const names = affected.slice(0, 3).map(line => line.name).join(", ");
      const extra = affected.length > 3 ? ` +${affected.length - 3} more` : "";
      tubeNode.textContent = `${affected.length} line${affected.length === 1 ? "" : "s"} affected · ${names}${extra}`;
    } catch {
      tubeNode.textContent = "Live status temporarily unavailable";
    }
  }

  loadWeather();
  loadTube();
  setInterval(loadWeather, 15 * 60 * 1000);
  setInterval(loadTube, 5 * 60 * 1000);
})();
