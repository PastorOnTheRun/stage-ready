/* Stage Ready: bottom tab navigation, leader content tabs, and service worker registration. */
(() => {
  const TABS = ["guides", "announcements", "service", "calendar", "resources"];
  const DEFAULT_TAB = "announcements";
  const loaded = {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]);

  async function getJSON(name) {
    const res = await fetch(`./${name}.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${name}.json unavailable`);
    return res.json();
  }

  const empty = (text) => `<div class="tab-empty" role="status"><p>${esc(text || "Nothing posted here yet.")}</p></div>`;
  const source = (s) => (s ? `<p class="src">Source: ${esc(s)}</p>` : "");
  const updated = (d) => (d?.updatedAt ? `<p class="tab-updated">Updated ${esc(d.updatedAt)}</p>` : "");

  function card(item) {
    const bullets = item.bullets?.length ? `<ul>${item.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : "";
    return `<article class="info-card">
      <h3>${esc(item.title)}</h3>
      ${item.body ? `<p>${esc(item.body)}</p>` : ""}${bullets}
      ${source(item.source)}
    </article>`;
  }

  /* —— Guides: separate Middle School and High School guides —— */
  const LEVEL_KEY = "stageReady.guideLevel";
  let guidesData = null;
  let guideLevel = (() => { try { return localStorage.getItem(LEVEL_KEY) || "middle"; } catch { return "middle"; } })();

  function renderGuides(d, level) {
    const guides = d.guides || [];
    const current = guides.find(g => g.level === level) || guides[0];
    let html = `${d.intro ? `<p class="tab-intro">${esc(d.intro)}</p>` : ""}${updated(d)}`;
    if (!current) return html + empty("No leader guides posted yet.");
    html += `<div class="level-switch" role="tablist" aria-label="Choose a guide">${guides.map(g =>
      `<button type="button" role="tab" class="level-btn" data-level="${esc(g.level)}" aria-selected="${g.level === current.level}" aria-controls="guide-panel">${esc(g.label)}</button>`).join("")}</div>`;
    html += `<div id="guide-panel" class="guide-panel" role="tabpanel" data-level="${esc(current.level)}"><h2 class="guide-title">${esc(current.title)}</h2>`;
    (current.sections || []).forEach(sec => {
      html += `<section class="tab-section"><h2>${esc(sec.title)}</h2>`;
      html += sec.items?.length ? sec.items.map(card).join("") : empty(sec.emptyMessage);
      html += `</section>`;
    });
    html += `</div>`;
    if (d.shared?.items?.length) {
      html += `<section class="tab-section shared"><h2>${esc(d.shared.title || "For every small group leader")}</h2>${d.shared.items.map(card).join("")}</section>`;
    }
    return html;
  }

  function paintGuides() {
    const body = $("#guides-body");
    body.innerHTML = renderGuides(guidesData, guideLevel);
    body.querySelectorAll("[data-level].level-btn").forEach(b => b.addEventListener("click", () => {
      guideLevel = b.dataset.level;
      try { localStorage.setItem(LEVEL_KEY, guideLevel); } catch { /* private mode */ }
      paintGuides();
      $(`.level-btn[data-level="${guideLevel}"]`)?.focus({ preventScroll: true });
    }));
  }

  /* —— Order of service —— */
  function renderService(d) {
    let html = `${d.intro ? `<p class="tab-intro">${esc(d.intro)}</p>` : ""}${updated(d)}`;
    if (!d.services?.length) return html + empty("No order of service has been posted yet.");
    html += `<div class="jump">${d.services.map((s, i) => `<a href="#svc-${i}" class="chip-link">${esc(s.title)}</a>`).join("")}</div>`;
    d.services.forEach((s, i) => {
      html += `<section class="tab-section svc" id="svc-${i}"><h2>${esc(s.title)}</h2>
        <p class="svc-meta">${esc([s.when, s.where].filter(Boolean).join(" · "))}</p>
        <ol class="run">${(s.items || []).map(it => `<li><span class="run-t">${esc(it.time || "")}</span><span class="run-c"><strong>${esc(it.title)}</strong>${it.detail ? `<span>${esc(it.detail)}</span>` : ""}</span></li>`).join("")}</ol>`;
      if (s.roles?.length) html += `<p class="svc-roles"><strong>Roles:</strong> ${s.roles.map(esc).join(" · ")}</p>`;
      if (s.checklist?.length) html += `<h3 class="sub-h">Readiness checklist</h3><ul class="check">${s.checklist.map(c => `<li>${esc(c)}</li>`).join("")}</ul>`;
      if (s.note) html += `<p class="note">${esc(s.note)}</p>`;
      html += `${source(s.source)}</section>`;
    });
    return html;
  }

  /* —— Calendar —— */
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const parse = (iso) => { const [y, m, dd] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
  const todayET = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  const fmtDay = (iso) => { const d = parse(iso); return `${DOW[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`; };

  function eventRow(e, today) {
    const past = e.date < today;
    return `<li class="cal-ev ${past ? "is-past" : ""}">
      <span class="cal-date">${esc(fmtDay(e.date))}</span>
      <span class="cal-body"><strong>${esc(e.title)}</strong>
        ${e.campus ? `<em class="pill">${esc(e.campus)}</em>` : ""}
        ${e.time ? `<span>${esc(e.time)}</span>` : ""}${e.detail ? `<span>${esc(e.detail)}</span>` : ""}
        ${e.source ? `<span class="src">Source: ${esc(e.source)}</span>` : ""}</span></li>`;
  }

  function renderCalendar(d, view) {
    const today = todayET();
    const events = [...(d.events || [])].sort((a, b) => a.date.localeCompare(b.date));
    const start = parse(d.term.start), end = parse(d.term.end);
    const months = [];
    for (let y = start.getUTCFullYear(), m = start.getUTCMonth(); y < end.getUTCFullYear() || (y === end.getUTCFullYear() && m <= end.getUTCMonth()); m === 11 ? (y++, m = 0) : m++) months.push([y, m]);
    const key = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;
    let html = `<p class="tab-intro">${esc(d.term.name)} semester.</p>${updated(d)}
      <div class="seg" role="tablist" aria-label="Calendar view">
        <button type="button" role="tab" data-view="month" aria-selected="${view === "month"}">Month</button>
        <button type="button" role="tab" data-view="list" aria-selected="${view === "list"}">List</button>
      </div>
      <div class="jump">${months.map(([y, m]) => `<a class="chip-link" href="#cal-${key(y, m)}">${MONTHS[m].slice(0, 3)}</a>`).join("")}</div>`;
    if (d.weekly?.length) {
      html += `<section class="tab-section"><h2>Every week</h2>${d.weekly.map(w => `<article class="info-card"><h3>${w.title.includes(w.day) ? "" : `${esc(w.day)} · `}${esc(w.title)}</h3>${w.detail ? `<p>${esc(w.detail)}</p>` : ""}${source(w.source)}</article>`).join("")}</section>`;
    }
    months.forEach(([y, m]) => {
      const k = key(y, m);
      const monthEvents = events.filter(e => e.date.startsWith(k));
      html += `<section class="tab-section cal-month" id="cal-${k}"><h2>${MONTHS[m]} ${y}</h2>`;
      if (view === "month") {
        const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
        const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        const hits = new Set(monthEvents.map(e => Number(e.date.slice(8))));
        html += `<div class="cal-grid" aria-hidden="true">${DOW.map(x => `<span class="dow">${x[0]}</span>`).join("")}${"<span></span>".repeat(first)}`;
        for (let day = 1; day <= days; day++) {
          const iso = `${k}-${String(day).padStart(2, "0")}`;
          const cls = [hits.has(day) ? "has-ev" : "", iso === today ? "is-today" : ""].join(" ");
          html += `<span class="cal-day ${cls}">${day}</span>`;
        }
        html += `</div>`;
      }
      html += monthEvents.length ? `<ol class="cal-list">${monthEvents.map(e => eventRow(e, today)).join("")}</ol>` : `<p class="muted">Nothing posted for this month yet.</p>`;
      html += `</section>`;
    });
    return html;
  }

  /* —— Resources —— */
  function renderResources(d) {
    let html = `${d.intro ? `<p class="tab-intro">${esc(d.intro)}</p>` : ""}${updated(d)}`;
    (d.groups || []).forEach(g => {
      html += `<section class="tab-section"><h2>${esc(g.title)}</h2>`;
      html += g.items?.length ? g.items.map(it => {
        const label = it.type === "pdf" ? "PDF" : it.type === "form" ? "Form" : it.type === "link" ? "Link" : "Tool";
        const inner = `<span class="res-type">${label}</span><span class="res-body"><strong>${esc(it.title)}</strong>${it.note ? `<span>${esc(it.note)}</span>` : ""}</span>`;
        return it.url && /^https:\/\//.test(it.url)
          ? `<a class="res" href="${esc(it.url)}" target="_blank" rel="noopener">${inner}<span class="res-go" aria-hidden="true">↗</span></a>`
          : `<div class="res">${inner}</div>`;
      }).join("") : empty(g.emptyMessage);
      html += `</section>`;
    });
    return html;
  }

  let calendarData = null;
  let calendarView = "month";
  function paintCalendar() {
    const body = $("#calendar-body");
    body.innerHTML = renderCalendar(calendarData, calendarView);
    body.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { calendarView = b.dataset.view; paintCalendar(); }));
  }

  const RENDER = {
    guides: async () => { guidesData = await getJSON("guides"); paintGuides(); },
    service: async () => { $("#service-body").innerHTML = renderService(await getJSON("service")); },
    calendar: async () => { calendarData = await getJSON("calendar"); paintCalendar(); },
    resources: async () => { $("#resources-body").innerHTML = renderResources(await getJSON("resources")); }
  };

  async function load(tab) {
    if (loaded[tab] || !RENDER[tab]) return;
    loaded[tab] = true;
    try { await RENDER[tab](); } catch (err) {
      loaded[tab] = false;
      $(`#${tab}-body`).innerHTML = empty("This section could not load. Check your connection and try again.");
    }
  }

  function show(tab, { push = true } = {}) {
    if (!TABS.includes(tab)) tab = DEFAULT_TAB;
    document.querySelectorAll(".tab-panel").forEach(p => {
      const on = p.dataset.tab === tab;
      p.hidden = !on;
      p.classList.toggle("active", on);
    });
    document.querySelectorAll(".tabbar .tab").forEach(b => {
      const on = b.dataset.tab === tab;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    document.body.dataset.tab = tab;
    if (push) history.replaceState(null, "", tab === DEFAULT_TAB ? location.pathname + location.search : `#${tab}`);
    window.scrollTo(0, 0);
    return load(tab);
  }

  document.querySelectorAll(".tabbar .tab").forEach(b => b.addEventListener("click", () => show(b.dataset.tab)));
  // In-page jump chips scroll without touching the tab hash.
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest && ev.target.closest("a.chip-link");
    if (!a) return;
    ev.preventDefault();
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const fromHash = () => (location.hash || "").replace("#", "");
  show(TABS.includes(fromHash()) ? fromHash() : DEFAULT_TAB, { push: false });
  window.__stageTabs = { show, setGuideLevel: (lvl) => { guideLevel = lvl; if (guidesData) paintGuides(); } };

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
    });
  }
})();
