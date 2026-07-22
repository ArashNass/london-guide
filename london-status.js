(() => {
  const cleanPath = window.location.pathname.replace(/\/+$/, "");
  if (cleanPath !== "" && cleanPath !== "/index.html") return;
  if (document.querySelector("[data-london-status]")) return;

  const LINES = [
    { id:"bakerloo",          name:"Bakerloo",   color:"#B36305" },
    { id:"central",           name:"Central",    color:"#E32017" },
    { id:"circle",            name:"Circle",     color:"#FFD300", dark:true },
    { id:"district",          name:"District",   color:"#00782A" },
    { id:"hammersmith-city",  name:"H & C",      color:"#F3A9BB", dark:true },
    { id:"jubilee",           name:"Jubilee",    color:"#A0A5A9", dark:true },
    { id:"metropolitan",      name:"Met",        color:"#9B0056" },
    { id:"northern",          name:"Northern",   color:"#000000" },
    { id:"piccadilly",        name:"Piccadilly", color:"#003688" },
    { id:"victoria",          name:"Victoria",   color:"#0098D4" },
    { id:"waterloo-city",     name:"W & C",      color:"#95CDBA", dark:true },
    { id:"elizabeth",         name:"Elizabeth",  color:"#6950A1" },
    { id:"dlr",               name:"DLR",        color:"#00A4A7" },
    { id:"london-overground", name:"Overground", color:"#EE7C0E", dark:true },
  ];

  const weatherLabels = {
    0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",
    45:"Foggy",48:"Foggy",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",
    61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",
    75:"Heavy snow",80:"Rain showers",81:"Rain showers",82:"Heavy showers",
    95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"
  };
  const weatherIcon = function(c) {
    if (c===0||c===1) return "\u2600\uFE0F";
    if (c===2||c===3) return "\u26C5";
    if (c<=48) return "\uD83C\uDF2B\uFE0F";
    if (c<=55) return "\uD83C\uDF26\uFE0F";
    if (c<=65) return "\uD83C\uDF27\uFE0F";
    if (c<=75) return "\uD83C\uDF28\uFE0F";
    if (c<=82) return "\uD83C\uDF27\uFE0F";
    return "\u26C8\uFE0F";
  };

  const wrap = document.createElement("div");
  wrap.dataset.londonStatus = "";
  wrap.setAttribute("aria-label", "London status");
  wrap.innerHTML =
    '<div class="ls-inner">' +
      '<div class="ls-weather">' +
        '<div class="ls-weather__icon" data-ls-icon></div>' +
        '<div class="ls-weather__body">' +
          '<div class="ls-weather__temp" data-ls-temp>--\u00b0C</div>' +
          '<div class="ls-weather__desc" data-ls-desc>Loading\u2026</div>' +
        '</div>' +
      '</div>' +
      '<div class="ls-tfl">' +
        '<div class="ls-tfl__header">' +
          '<span class="ls-tfl__label">Tube status</span>' +
          '<span class="ls-tfl__summary" data-ls-summary>Checking TfL\u2026</span>' +
        '</div>' +
        '<div class="ls-tfl__grid" data-ls-grid></div>' +
        '<a class="ls-tfl__link" href="https://tfl.gov.uk/tube-dlr-overground/status/" target="_blank" rel="noopener noreferrer">Full status on TfL \u2197</a>' +
      '</div>' +
    '</div>';

  const style = document.createElement("style");
  style.textContent =
    "[data-london-status]{display:block!important;padding:clamp(28px,5vw,52px) clamp(16px,5vw,40px);border-top:1px solid rgba(21,24,29,.1);background:#f7f4ee}" +
    ".ls-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:200px 1fr;gap:clamp(24px,5vw,64px);align-items:start}" +
    ".ls-weather{display:flex;flex-direction:column;gap:8px}" +
    ".ls-weather__icon{font-size:48px;line-height:1}" +
    ".ls-weather__temp{font-size:clamp(36px,5vw,52px);font-weight:760;letter-spacing:-.04em;line-height:1;color:#1e211d}" +
    ".ls-weather__desc{font-size:14px;color:#5a5e56;margin-top:4px;font-weight:500}" +
    ".ls-tfl__header{display:flex;align-items:baseline;gap:14px;margin-bottom:14px;flex-wrap:wrap}" +
    ".ls-tfl__label{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#5a5e56}" +
    ".ls-tfl__summary{font-size:13px;font-weight:600;color:#1e211d}" +
    ".ls-tfl__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:7px}" +
    ".ls-line{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.72);border:1px solid rgba(21,24,29,.08)}" +
    ".ls-line__dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}" +
    ".ls-line__name{font-size:12px;font-weight:700;color:#1e211d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}" +
    ".ls-line__ok{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:#2e9b63}" +
    ".ls-line__bad{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:#d93025}" +
    ".ls-tfl__link{display:inline-flex;margin-top:14px;font-size:12px;font-weight:700;color:#5a5e56;text-decoration:none;letter-spacing:.04em}" +
    ".ls-tfl__link:hover{color:#1e211d}" +
    "@media(max-width:680px){.ls-inner{grid-template-columns:1fr}.ls-weather{flex-direction:row;align-items:center;gap:16px}.ls-tfl__grid{grid-template-columns:repeat(auto-fill,minmax(88px,1fr))}}";
  document.head.appendChild(style);

  function insert() {
    // Insert just before the footer — outside <main>, avoids any site.css main-child rules
    var footer = document.querySelector("footer");
    if (footer) { footer.insertAdjacentElement("beforebegin", wrap); return; }
    document.body.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insert);
  } else {
    insert();
  }

  async function loadWeather() {
    try {
      var r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current=temperature_2m,apparent_temperature,weather_code&timezone=Europe%2FLondon", {cache:"no-store"});
      var d = await r.json();
      var code = d.current.weather_code;
      wrap.querySelector("[data-ls-icon]").textContent = weatherIcon(code);
      wrap.querySelector("[data-ls-temp]").textContent = Math.round(d.current.temperature_2m) + "\u00b0C";
      wrap.querySelector("[data-ls-desc]").textContent = (weatherLabels[code] || "") + " \u00b7 Feels " + Math.round(d.current.apparent_temperature) + "\u00b0C";
    } catch(e) {
      wrap.querySelector("[data-ls-desc]").textContent = "Weather unavailable";
    }
  }

  async function loadTfl() {
    var grid = wrap.querySelector("[data-ls-grid]");
    var summary = wrap.querySelector("[data-ls-summary]");
    try {
      var r = await fetch("https://api.tfl.gov.uk/Line/Mode/tube,dlr,overground,elizabeth-line/Status", {cache:"no-store"});
      var lines = await r.json();
      var byId = {};
      lines.forEach(function(l){ byId[l.id] = l; });
      var disrupted = 0;
      grid.innerHTML = LINES.map(function(meta) {
        var line = byId[meta.id];
        var good = !line || (line.lineStatuses||[]).every(function(s){ return s.statusSeverity === 10; });
        if (!good) disrupted++;
        var tip = (line && line.lineStatuses && line.lineStatuses[0] && line.lineStatuses[0].statusSeverityDescription) || "Good service";
        return '<div class="ls-line" title="' + tip + '">' +
          '<span class="ls-line__dot" style="background:' + meta.color + '"></span>' +
          '<span class="ls-line__name">' + meta.name + '</span>' +
          '<span class="' + (good ? "ls-line__ok" : "ls-line__bad") + '"></span>' +
          '</div>';
      }).join("");
      summary.textContent = disrupted === 0 ? "Good service on all lines" : disrupted + " line" + (disrupted > 1 ? "s" : "") + " with disruption";
    } catch(e) {
      summary.textContent = "Status unavailable";
    }
  }

  loadWeather();
  loadTfl();
  setInterval(loadWeather, 15 * 60 * 1000);
  setInterval(loadTfl, 5 * 60 * 1000);
})();
