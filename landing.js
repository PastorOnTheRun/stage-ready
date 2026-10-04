/* Landing tiles for the Stage home (Jake, Sep 26, 2026; reference-style layout).
   Builds leader tiles from the real JSON files (guides, service, calendar, resources),
   links each tile to its real tab, and wires the All / Stage / Leaders filter row.
   Nothing here is invented: every title and detail comes from the JSON or the existing app. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]);
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayET = () => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map(x => [x.type, x.value])); return `${p.year}-${p.month}-${p.day}`; };
  const parts = (iso) => { const [y, m, d] = iso.split("-").map(Number); const dt = new Date(Date.UTC(y, m - 1, d)); return { dow: DOW[dt.getUTCDay()], mon: MON[m - 1], day: d }; };
  const getJSON = async (name) => { const r = await fetch(`${name}.json`, { cache: "no-store" }); if (!r.ok) throw new Error(name); return r.json(); };
  const ICON = {
    service: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.5"/><circle cx="4.5" cy="12" r="1.5"/><circle cx="4.5" cy="18" r="1.5"/></svg>',
    resources: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>'
  };
  const tile = ({ tone, go, level, big, icon, label, title, detail, wide }) =>
    `<a class="lp-tile lp-link tone-${tone}${wide ? " lp-wide" : ""}" href="#${go}" data-go="${go}"${level ? ` data-level="${level}"` : ""} data-group="leaders">
      <span class="lp-block" aria-hidden="true">${icon ? `<span class="lp-icon">${ICON[icon]}</span>` : ""}${big ? (Array.isArray(big) ? `<span class="lp-big lp-date"><small>${esc(big[0])}</small>${esc(big[1])}</span>` : `<span class="lp-big">${esc(big)}</span>`) : ""}</span>
      <span class="lp-panel"><span class="lp-label">${esc(label)}</span><strong class="lp-ttl">${esc(title)}</strong>${detail ? `<span class="lp-detail">${esc(detail)}</span>` : ""}</span>
    </a>`;

  async function build() {
    const grid = $("#lp-grid"); if (!grid) return;
    const today = todayET();
    const [g, s, c, r] = await Promise.allSettled(["guides", "service", "calendar", "resources"].map(getJSON));
    const tiles = [];
    if (g.status === "fulfilled") {
      const tones = { middle: "orange", high: "black" };
      for (const guide of g.value.guides || []) {
        const wk = [...(guide.weeks || [])].sort((a, b) => a.date.localeCompare(b.date)).find(w => w.date >= today);
        const p = wk ? parts(wk.date) : null;
        tiles.push(tile({ tone: tones[guide.level] || "black", go: "guides", level: guide.level, big: guide.level === "middle" ? "MS" : "HS",
          label: wk ? `${guide.label} · ${p.dow} ${p.mon} ${p.day}` : guide.label, title: wk ? wk.title : (guide.thisWeekEmpty || guide.title),
          detail: (guide.room || "").replace(/\s*\(.*\)$/, "") }));
      }
    }
    if (s.status === "fulfilled") {
      const n = (s.value.services || []).length;
      tiles.push(tile({ tone: "black", go: "service", icon: "service", label: "Service", title: s.value.title || "Order of Service", detail: n ? `${n} orders posted` : "None posted yet" }));
    }
    if (c.status === "fulfilled") {
      const next = [...(c.value.events || [])].sort((a, b) => a.date.localeCompare(b.date)).find(e => e.date >= today);
      const p = next ? parts(next.date) : null;
      tiles.push(tile({ tone: "orange", go: "calendar", big: next ? [p.mon, String(p.day)] : "", label: "Calendar · next up",
        title: next ? next.title : "Nothing posted yet", detail: next ? `${p.dow}, ${p.mon} ${p.day}` : "" }));
    }
    if (r.status === "fulfilled") {
      const items = (r.value.groups || []).flatMap(x => x.items || []);
      const band = items.find(i => i.inviteCode);
      tiles.push(tile({ tone: "orange", go: "resources", icon: "resources", wide: true, label: "Resources",
        title: band ? band.title : (r.value.title || "Resources"), detail: band ? `Code ${band.inviteCode}` : `${items.length} links and tools` }));
    }
    grid.insertAdjacentHTML("beforeend", tiles.join(""));
    const lead = grid.querySelectorAll('[data-group="leaders"]').length;
    const stage = grid.querySelectorAll('[data-group="stage"]:not([data-off])').length;
    $("#lp-count-leaders").textContent = lead; $("#lp-count-all").textContent = lead + stage;
    const stageCount = $("#lp-count-stage"); if (stageCount) stageCount.textContent = stage;
    grid.querySelectorAll("a.lp-link").forEach(a => a.addEventListener("click", (e) => {
      e.preventDefault();
      $(`.tabbar .tab[data-tab="${a.dataset.go}"]`)?.click();
      const level = a.dataset.level;
      if (!level) return;
      let tries = 0;
      const pick = () => { const b = $(`.level-btn[data-level="${level}"]`); if (b) { if (b.getAttribute("aria-selected") !== "true") b.click(); scrollTo(0, 0); } else if (tries++ < 40) setTimeout(pick, 75); };
      pick();
    }));
  }

  document.querySelectorAll(".lp-seg-btn").forEach(btn => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    document.querySelectorAll(".lp-seg-btn").forEach(b => b.setAttribute("aria-selected", String(b === btn)));
    document.querySelectorAll("#lp-grid .lp-tile").forEach(t => { t.hidden = Boolean(t.dataset.off) || !(f === "all" || t.dataset.group === f); });   // data-off: stage moment not in this Sunday's run of show
  }));
  build().catch(() => { /* leader tiles are optional; the stage tiles still work */ });
})();
