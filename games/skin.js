/* Family Church Students skin for Charge! Games (the games under /games/ load live from
   https://pastorontherun.github.io/charge-games/; this file and skin.css are the only church-specific parts). */
(function () {
  var games = document.currentScript.src.replace(/skin\.js(\?.*)?$/, ""), site = games.replace(/games\/$/, "");
  window.ChargeSkin = {
    id: "fcs",
    ns: "fcsgames",                     // own rooms + saved scores: never shares a room or a save with the public Charge site
    brand: "Family Church Students",
    css: games + "skin.css?v=3",
    logo: { dark: site + "assets/logos/students-internal-white.svg", light: site + "assets/logos/students-internal-color.svg" },
    home: { href: site, label: "← Stage Ready" }
  };
})();

/* Sword Drills welcome screen (church-only, lives in this skin; the Charge code is untouched).
   TV (/games/sword-drills/): a full-screen "Welcome, Students" overlay with the BAND QR shows when the screen loads.
   It is the standalone page games/sword-drills/welcome/ in a frame, so there is one copy of the design.
   Hide/show it from the leader remote (Show/Hide welcome button), or on the TV with the Close button, Esc/W to hide
   and Shift+W to show again (plain W stays the game's Wildcard key once the welcome is hidden).
   The remote sends the command "fcs.welcome" { on } over the normal game link (Charge.remote().send); the screen
   handles it before the game's own commands and adds fcsWelcome to the state so the remote button shows the right label.
   Unknown commands are ignored by the game, and every hook below falls back to the plain game if anything throws. */
(function () {
  var p = location.pathname, TV = /\/games\/sword-drills\/(index\.html)?$/.test(p), RC = /\/games\/sword-drills\/controller\/(index\.html)?$/.test(p);
  if (!TV && !RC) return;
  var site = document.currentScript.src.replace(/games\/skin\.js(\?.*)?$/, "");
  var shown = TV, link = null, R = null, last = null, ov = null, btn = null;
  function hookHost(f) {
    return function (opts) {
      try {
        var cmd = opts.onCommand, gs = opts.getState;
        opts.onCommand = function (a, m) { if (a === "fcs.welcome") { welcome(m && m.on === true); return; } return cmd.apply(this, arguments); };
        opts.getState = function () { var s = gs.apply(this, arguments); try { if (s && typeof s === "object") s.fcsWelcome = shown; } catch (e) {} return s; };
      } catch (e) {}
      return (link = f.apply(this, arguments));
    };
  }
  function hookRemote(f) {
    return function (opts) {
      try { var os = opts.onState; opts.onState = function (s) { last = s; try { drawBtn(); } catch (e) {} return os.apply(this, arguments); }; } catch (e) {}
      return (R = f.apply(this, arguments));
    };
  }
  // window.Charge is created by charge-core.js after this file; catch Charge.host / Charge.remote as they are defined
  try {
    var C0;
    Object.defineProperty(window, "Charge", { configurable: true, enumerable: true, get: function () { return C0; }, set: function (C) {
      C0 = C;
      try {
        var name = TV ? "host" : "remote", fn;
        Object.defineProperty(C, name, { configurable: true, enumerable: true, get: function () { return fn; }, set: function (f) { fn = typeof f === "function" ? (TV ? hookHost(f) : hookRemote(f)) : f; } });
      } catch (e) {}
    } });
  } catch (e) {}

  /* ---- TV overlay ---- */
  function welcome(on) {
    shown = !!on;
    if (ov) ov.hidden = !shown;
    if (link) try { link.broadcast(); } catch (e) {}
  }
  function mount() {
    if (ov || !document.documentElement) return;
    ov = document.createElement("div");
    ov.id = "fcs-welcome"; ov.hidden = !shown;
    ov.setAttribute("style", "position:fixed;inset:0;z-index:2147483000;background:#141110;visibility:visible");
    ov.innerHTML = '<iframe src="' + site + 'games/sword-drills/welcome/" title="Welcome, Students" tabindex="-1"></iframe>' +
      '<button type="button" class="fcs-wl-close" aria-label="Close the welcome screen">Close ✕</button>' +
      '<div class="fcs-wl-room" aria-live="polite"></div>';
    ov.querySelector("button").addEventListener("click", function () { welcome(false); });
    document.documentElement.appendChild(ov);   // outside <body>: the embed rebuilds the body, and body stays hidden while it loads
    setInterval(function () { var c = ""; try { c = link ? link.code() : ""; } catch (e) {} var el = ov.querySelector(".fcs-wl-room"); if (el) el.textContent = c ? "Leader remote · room " + c : ""; }, 1000);
  }
  if (TV) {
    if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
    window.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (shown) {
        if (k === "Escape" || k === "w" || k === "W") welcome(false);
        if (k !== "F11" && k !== "f" && k !== "F") { e.stopImmediatePropagation(); e.preventDefault(); }   // the game behind it doesn't react
      } else if (k === "W" && e.shiftKey) { welcome(true); e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  /* ---- remote button ---- */
  function drawBtn() {
    if (!btn) {
      if (!document.body) return;
      btn = document.createElement("button"); btn.type = "button"; btn.className = "fcs-wl-toggle";
      btn.addEventListener("click", function () { if (!R) return; var on = !(last && last.fcsWelcome); R.send("fcs.welcome", { on: on }); btn.textContent = on ? "Hide welcome" : "Show welcome"; });
      document.documentElement.appendChild(btn);
    }
    var known = !!last && typeof last.fcsWelcome === "boolean";
    btn.hidden = !known;   // only once this phone is the host and the screen answers (older screens: no button)
    if (known) { btn.textContent = last.fcsWelcome ? "Hide welcome" : "Show welcome"; btn.classList.toggle("on", last.fcsWelcome); }
  }
})();
