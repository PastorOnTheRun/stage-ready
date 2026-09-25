(() => {
  const encouragementMessages = {
    opening: {
      title: "Opening Charge",
      passage: "Psalm 95:1–3",
      setup: "Welcome students and help them turn their attention to God before worship begins.",
      beats: [
        ["Welcome", "We are glad you are here. Take a breath and be fully present."],
        ["Scripture", "Psalm 95 calls us to sing with joy because the Lord is great and worthy of praise."],
        ["Invitation", "Whatever kind of week you had, bring your honest self to Jesus today."],
        ["Transition", "Invite the room to stand and worship together."]
      ]
    },
    worship: {
      title: "Worship Lean-In",
      passage: "Romans 12:1",
      setup: "Give the room one clear invitation to respond to Jesus as worship begins.",
      beats: [
        ["Name the moment", "It is easy to sing while our attention is somewhere else."],
        ["Scripture", "Romans 12 calls us to offer our whole lives to God as worship."],
        ["Physical response", "Cue the room: “Choose a posture of surrender. Lift your hands, hold your hands open, or close your eyes and pray.” Then say: “Tell Jesus, ‘You have my attention.’”"],
        ["Transition", "Encourage students to sing honestly and respond to God together."]
      ]
    }
  };

  let announcementPrompts = [];
  let announcementUpdatedAt = "";

  const pacing = {
    encouragement: [
      ["0:00", "Welcome or name the moment"],
      ["0:15", "Share the Scripture truth"],
      ["0:35", "Invite a response"],
      ["0:50", "Transition into worship"]
    ]
  };

  function announcementPacing(count) {
    const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    const first = 20;
    const last = 140;
    const gap = count > 1 ? (last - first) / (count - 1) : 0;
    return [
      ["0:00", "Introduce yourself and explain the why"],
      ...Array.from({ length: count }, (_, index) => [formatTime(Math.round(first + gap * index)), `Announcement ${index + 1}`]),
      ["2:40", "Connect to Believe, Belong, Beyond and close"]
    ];
  }

  // Campus announcement dashboards. Each item carries campus ("windermere" | "lakeside")
  // and service ("wed" | "sun"). Legacy "services" tags are mapped to Windermere.
  const CAMPUSES = {
    "campus-windermere": { key: "windermere", campus: "Windermere" },
    "campus-lakeside": { key: "lakeside", campus: "Lakeside" }
  };
  const MODE_ALIASES = {
    "announcements": "campus-windermere",
    "sunday-announcements": "campus-windermere",
    "live-announcements": "campus-windermere",
    "live-windermere": "campus-windermere",
    "live-lakeside": "campus-lakeside"
  };

  const state = {
    mode: null,
    isLiveUse: false,
    campusMode: null,
    isSundayUse: false,
    serviceFilter: null,
    phase: "choose",
    prompt: null,
    timer: null,
    duration: 60,
    endAt: 0
  };

  const asList = value => (Array.isArray(value) ? value : value ? [value] : []);

  function eventCampuses(event) {
    const campuses = asList(event.campus).map(c => String(c).toLowerCase());
    if (campuses.length) return campuses;
    const legacy = asList(event.services);
    if (legacy.includes("live-lakeside") && legacy.length === 1) return ["lakeside"];
    return ["windermere"];
  }

  function eventServices(event) {
    const services = asList(event.service).map(s => String(s).toLowerCase());
    if (services.length) return services;
    const legacy = asList(event.services);
    const mapped = [];
    if (legacy.includes("sunday")) mapped.push("sun");
    if (legacy.some(s => s === "live" || s.startsWith("live-"))) mapped.push("wed");
    return mapped.length ? mapped : ["wed", "sun"];
  }

  // Mon–Wed: lead with Wednesday items. Thu–Sun: lead with Sunday items. (America/New_York)
  function focusService() {
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(new Date());
    return ["Mon", "Tue", "Wed"].includes(weekday) ? "wed" : "sun";
  }

  function liveCampus() {
    return state.campusMode ? CAMPUSES[state.campusMode].campus : "";
  }

  function eventsForService(campusKey) {
    const base = announcementPrompts[0];
    if (!base) return [];
    const focus = focusService();
    const events = (base.events || []).filter(event => !campusKey || eventCampuses(event).includes(campusKey));
    return events
      .map((event, index) => ({ event, index, rank: eventServices(event).includes(focus) ? 0 : 1 }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map(item => item.event);
  }

  function promptForService(campusKey) {
    const base = announcementPrompts[0];
    if (!base) return null;
    return { ...base, events: eventsForService(campusKey) };
  }

  const $ = (selector) => document.querySelector(selector);
  const chooser = $("#chooser");
  const workspace = $("#workspace");
  const finish = $("#finish");
  const clock = $("#clock");
  const strip = $("#status-strip");
  const announcer = $("#announcer");
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]);

  function showScreen(name) {
    [chooser, workspace, finish].forEach(el => el.classList.remove("active"));
    if (name === "chooser") chooser.classList.add("active");
    if (name === "workspace") workspace.classList.add("active");
    if (name === "finish") finish.classList.add("active");
  }

  function serviceTags(event) {
    const services = eventServices(event);
    const labels = [];
    if (services.includes("wed")) labels.push(`<span class="svc-tag wed">Wed</span>`);
    if (services.includes("sun")) labels.push(`<span class="svc-tag sunday">Sun</span>`);
    return labels.join("");
  }

  function renderHomeAnnouncements(events) {
    const list = $("#home-ann-list");
    if (!events.length) {
      list.innerHTML = `<div class="ann-row"><h3>No current announcements</h3><p class="meta">Check back after the weekly refresh.</p></div>`;
      return;
    }
    list.innerHTML = events.map(event => `
      <article class="ann-row">
        <h3>${esc(event.name)}</h3>
        <span class="svc-tags">${serviceTags(event)}${event.cost ? `<span class="cost">${esc(event.cost)}</span>` : ""}</span>
        <p class="meta">${esc(event.when)} · ${esc(event.where)}</p>
        <p class="action">Next step: ${esc(event.action)}</p>
      </article>
    `).join("");
  }

  async function loadAnnouncements() {
    const campusButtons = Object.keys(CAMPUSES).map(mode => [mode, $(`#${mode}-mode`), $(`#${mode}-description`)]);
    try {
      let data;
      if (typeof EMBEDDED_ANNOUNCEMENTS !== "undefined" && EMBEDDED_ANNOUNCEMENTS) {
        data = EMBEDDED_ANNOUNCEMENTS;
      } else {
        const response = await fetch(`./announcements.json?v=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Announcement data unavailable");
        data = await response.json();
      }
      const dateParts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" })
          .formatToParts(new Date())
          .map(part => [part.type, part.value])
      );
      const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
      announcementPrompts = (data.prompts || []).map(prompt => ({
        ...prompt,
        events: (prompt.events || []).filter(event => !event.endDate || event.endDate >= today)
      }));
      announcementUpdatedAt = data.updatedAt || "";
      if (!announcementPrompts.length) throw new Error("No announcement data");
      campusButtons.forEach(([mode, button, description]) => {
        const events = eventsForService(CAMPUSES[mode].key);
        const wed = events.filter(e => eventServices(e).includes("wed")).length;
        const sun = events.filter(e => eventServices(e).includes("sun")).length;
        button.disabled = false; // opens even when empty and shows a clean empty state
        description.textContent = events.length ? [wed ? `${wed} Wed` : "", sun ? `${sun} Sun` : ""].filter(Boolean).join(" · ") : "None yet";
      });
      const meta = $("#home-ann-meta");
      if (meta) meta.textContent = `Reviewed ${announcementUpdatedAt}`;
    } catch (error) {
      campusButtons.forEach(([, button, description]) => {
        button.disabled = true;
        description.textContent = "Unavailable";
      });
      const meta = $("#home-ann-meta");
      if (meta) meta.textContent = "Unavailable";
    }
  }

  function selectContent() {
    if (state.mode === "announcements") {
      state.prompt = promptForService(state.serviceFilter);
    } else {
      state.prompt = encouragementMessages[state.mode];
    }
    renderPrompt();
  }

  function selectMode(requestedMode) {
    const mode = MODE_ALIASES[requestedMode] || requestedMode;
    if (CAMPUSES[mode] && !announcementPrompts.length) return;
    clearTimer();
    closeSheets();
    state.isLiveUse = Boolean(CAMPUSES[mode]);
    state.campusMode = state.isLiveUse ? mode : null;
    state.isSundayUse = false;
    state.serviceFilter = state.isLiveUse ? CAMPUSES[mode].key : null;
    state.mode = (state.isLiveUse || state.isSundayUse) ? "announcements" : mode;
    state.lastMode = mode;
    const isEmpty = state.mode === "announcements" && !eventsForService(state.serviceFilter).length;
    if (isEmpty && !state.isLiveUse) return;
    selectContent();
    const chrome = $("#mode-chrome-label");
    if (chrome) {
      chrome.textContent = state.isLiveUse
        ? `${liveCampus()} announcements`
        : state.isSundayUse
        ? "Sunday AM Announcements"
        : state.mode === "opening"
        ? "Opening Charge"
        : state.mode === "worship"
        ? "Worship Lean-In"
        : "Stage Ready";
    }
    showScreen("workspace");
    if (isEmpty) showEmptyMode();
    else startReview();
  }

  function showEmptyMode() {
    state.phase = "empty";
    document.body.dataset.phase = "choose";
    $("#phase-label").textContent = "No items yet";
    $("#status-title").textContent = "Nothing to announce yet";
    $("#status-help").textContent = "This list fills in after the weekly refresh.";
    $("#review-actions").hidden = true;
    $("#live-actions").hidden = true;
    clock.textContent = "—";
    clock.setAttribute("aria-label", "No timer: no announcements yet");
    clock.classList.remove("danger");
    strip.style.setProperty("--phase-color", "var(--sky)");
    strip.style.setProperty("--progress-width", "0%");
    announcer.textContent = `No ${liveCampus()} announcements yet.`;
  }

  function renderPrompt() {
    const card = $("#prompt-card");
    $("#open-pacing").hidden = false;
    const isEncouragement = state.mode !== "announcements";
    const type = isEncouragement
      ? "Opening encouragement"
      : state.isLiveUse
      ? `${liveCampus()} · Wed + Sun`
      : "Sunday AM";
    const duration = isEncouragement ? "1-minute message" : "3-minute announcements";
    const setup = state.isLiveUse
      ? `Lead these ${liveCampus()} student announcements. Each item is tagged Wed (Wednesday night student service) or Sun (Sunday). Use only the facts below, speak naturally, and end when you are finished.`
      : state.isSundayUse
      ? "Point students to the week ahead—Wednesday nights, midweek events, and wider Family Church life. Use only the facts below; speak warmly and clearly."
      : state.prompt.setup;
    if (state.isSundayUse && state.prompt) {
      state.prompt = { ...state.prompt, title: "This week at Family Church" };
    } else if (state.isLiveUse && state.prompt) {
      state.prompt = { ...state.prompt, title: `${liveCampus()} students this week` };
    }

    let body = `<div class="prompt-kicker"><span class="chip accent">${type}</span><span class="chip">${duration}</span>${state.mode === "announcements" ? `<span class="chip">Reviewed ${esc(announcementUpdatedAt)}</span>` : ""}</div><h2>${esc(state.prompt.title)}</h2><p class="prompt-setup">${esc(setup)}</p>`;

    if (isEncouragement) {
      $("#open-coaching").hidden = true;
      body += `<div class="prompt-kicker"><span class="chip accent">${esc(state.prompt.passage)}</span></div><ol class="beats">`;
      state.prompt.beats.forEach((beat, index) => {
        body += `<li class="beat"><span class="beat-index">${index + 1}</span><span><strong>${esc(beat[0])}</strong><span class="beat-copy">${esc(beat[1])}</span></span></li>`;
      });
      body += "</ol>";
    } else if (!state.prompt.events.length) {
      $("#open-coaching").hidden = true;
      $("#open-pacing").hidden = true;
      body = `<div class="prompt-kicker"><span class="chip accent">${type}</span></div><h2>${esc(state.prompt.title)}</h2>`;
      body += `<div class="empty-state" role="status"><h3>No ${esc(liveCampus())} announcements yet</h3><p>${esc(liveCampus())} student announcements will show here after the next refresh (Mondays and Thursdays).</p></div>`;
    } else {
      $("#open-coaching").hidden = false;
      body += `<div class="prompt-kicker"><span class="chip accent">Tap Coaching tips for introduce / why / vision</span></div>`;
      body += '<div class="events">';
      state.prompt.events.forEach(event => {
        body += `<section class="event"><div><h3>${esc(event.name)}</h3><span class="svc-tags">${serviceTags(event)}</span><p>${esc(event.when)}</p><p>${esc(event.where)}</p></div>${event.cost ? `<span class="cost">${esc(event.cost)}</span>` : ""}<p class="event-detail">${esc(event.detail)}</p><p class="event-action">Next step: ${esc(event.action)}</p></section>`;
      });
      body += "</div>";
    }

    card.innerHTML = body;
    const runOfShow = isEncouragement ? pacing.encouragement : announcementPacing(state.prompt.events.length);
    $("#run-list").innerHTML = runOfShow.map(item => `<li><span class="run-time">${item[0]}</span><span class="run-copy">${item[1]}</span></li>`).join("");
  }

  function startReview() {
    state.phase = "review";
    document.body.dataset.phase = "review";
    $("#phase-label").textContent = "Preparation";
    $("#status-title").textContent = "Get ready to lead";
    $("#status-help").textContent = state.mode !== "announcements"
      ? "Read the Scripture and choose one clear invitation to the room."
      : "Find the dates, confirmed costs, key details, and next steps.";
    $("#review-actions").hidden = false;
    $("#live-actions").hidden = true;
    strip.style.setProperty("--phase-color", "var(--blue)");
    announcer.textContent = "Review time has started. You have one minute.";
    runTimer(60, startDelivery);
  }

  function startDelivery() {
    if (state.phase !== "review") return;
    state.phase = "live";
    document.body.dataset.phase = "live";
    signal(620, .16);
    $("#phase-label").textContent = state.isLiveUse ? "On stage" : state.isSundayUse ? "Sunday AM" : "Presenting";
    $("#status-title").textContent = state.mode === "announcements" ? "Lead the announcements" : "Lead the encouragement";
    $("#status-help").textContent = "Eyes up. Speak clearly. Finish with confidence. End the round when you finish.";
    $("#review-actions").hidden = true;
    $("#live-actions").hidden = false;
    strip.style.setProperty("--phase-color", "var(--green)");
    const seconds = state.mode === "announcements" ? 180 : 60;
    announcer.textContent = `Delivery time has started. You have ${state.mode === "announcements" ? "three minutes" : "one minute"}.`;
    runTimer(seconds, null);
  }

  function runTimer(seconds, onDone) {
    clearTimer();
    state.duration = seconds;
    state.endAt = Date.now() + seconds * 1000;
    updateTimer();
    state.timer = window.setInterval(() => {
      const remainingMs = state.endAt - Date.now();
      updateTimer(remainingMs);
      if (remainingMs <= 0 && onDone) {
        clearTimer();
        onDone();
      }
    }, 100);
  }

  function updateTimer(remainingMs = state.duration * 1000) {
    if (remainingMs <= 0 && state.phase === "live") {
      state.phase = "over";
      document.body.dataset.phase = "over";
      strip.style.setProperty("--phase-color", "var(--red)");
      $("#phase-label").textContent = "Over time";
      $("#status-title").textContent = "Finish your thought";
      $("#status-help").textContent = "The timer is counting how long you have gone over.";
      announcer.textContent = "Time is up. The timer is counting overtime.";
      signal(430, .24);
    }
    const overtime = state.phase === "over";
    const seconds = overtime ? Math.floor(Math.abs(remainingMs) / 1000) : Math.ceil(Math.max(0, remainingMs) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    clock.textContent = `${overtime ? "+" : ""}${mins}:${String(secs).padStart(2, "0")}`;
    clock.setAttribute("aria-label", overtime ? `${seconds} seconds over time` : `${seconds} seconds remaining`);
    clock.classList.toggle("danger", overtime);
    const ratio = Math.max(0, Math.min(1, remainingMs / (state.duration * 1000)));
    strip.style.setProperty("--progress-width", overtime ? "100%" : `${ratio * 100}%`);
  }

  function clearTimer() {
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
  }

  function signal(frequency = 520, duration = .12) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + .02);
    } catch (error) { /* visual timer still works if audio is unavailable */ }
    if (navigator.vibrate) navigator.vibrate(80);
  }

  function completeRound() {
    clearTimer();
    closeSheets();
    state.phase = "done";
    document.body.dataset.phase = "done";
    signal(760, .25);
    showScreen("finish");
    $("#finish-title").textContent = (state.isLiveUse || state.isSundayUse) ? "Announcements complete." : "Round complete.";
    $("#finish-copy").textContent = state.isLiveUse
      ? `Thanks for leading the ${liveCampus()} announcements. Clear details help students show up this week.`
      : state.isSundayUse
      ? "Thanks for leading Sunday morning. You pointed students toward the week ahead and the life of the church."
      : "Was the Scripture clear and the invitation natural?";
    $("#same-mode").textContent = state.isLiveUse
      ? "Lead announcements again"
      : state.isSundayUse
      ? "Lead Sunday announcements again"
      : "Lead it again";
    announcer.textContent = "Time. Round complete.";
  }

  function goHome() {
    clearTimer();
    closeSheets();
    state.phase = "choose";
    document.body.dataset.phase = "choose";
    showScreen("chooser");
  }

  function openSheet(id) {
    const sheet = $(id);
    const backdrop = $("#sheet-backdrop");
    sheet.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add("open");
      backdrop.classList.add("open");
    });
  }

  function closeSheets() {
    ["#pacing-sheet", "#coaching-sheet"].forEach(sel => {
      const sheet = $(sel);
      sheet.classList.remove("open");
      sheet.hidden = true;
    });
    const backdrop = $("#sheet-backdrop");
    backdrop.classList.remove("open");
    backdrop.hidden = true;
  }

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => selectMode(button.dataset.mode));
  });
  document.querySelectorAll("[data-home]").forEach(button => button.addEventListener("click", goHome));
  $("#skip-review").addEventListener("click", startDelivery);
  $("#finish-early").addEventListener("click", completeRound);
  $("#same-mode").addEventListener("click", () => {
    if (state.lastMode) {
      selectMode(state.lastMode);
      return;
    }
    showScreen("workspace");
    selectContent();
    startReview();
  });
  $("#open-pacing").addEventListener("click", () => openSheet("#pacing-sheet"));
  $("#open-coaching").addEventListener("click", () => {
    const note = $("#sunday-coach-note");
    if (note) note.hidden = !state.isSundayUse;
    openSheet("#coaching-sheet");
  });
  $("#close-pacing").addEventListener("click", closeSheets);
  $("#close-coaching").addEventListener("click", closeSheets);
  $("#sheet-backdrop").addEventListener("click", closeSheets);

  document.addEventListener("keydown", event => {
    const tag = document.activeElement?.tagName;
    if (tag === "BUTTON" || tag === "A" || tag === "INPUT") return;
    if (event.code === "Space" && state.phase === "review") {
      event.preventDefault();
      startDelivery();
    }
    if (event.code === "Escape") closeSheets();
  });

  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(document.modelContext.registerTool({
        name: "start_ministry_segment",
        title: "Start ministry segment",
        description: "Start an opening charge, worship lean-in, Sunday AM announcements, or campus announcements for Windermere or Lakeside, beginning with a 60-second preparation period.",
        inputSchema: {
          type: "object",
          properties: { mode: { type: "string", enum: ["opening", "worship", "campus-windermere", "campus-lakeside"] } },
          required: ["mode"],
          additionalProperties: false
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const validModes = ["opening", "worship", "campus-windermere", "campus-lakeside", ...Object.keys(MODE_ALIASES)];
          if (!input || !validModes.includes(input.mode)) throw new Error("Choose opening, worship, campus-windermere, or campus-lakeside.");
          if (input.mode !== "opening" && input.mode !== "worship" && !announcementPrompts.length) throw new Error("Announcements are not available yet.");
          selectMode(input.mode);
          return { mode: input.mode, phase: state.phase, reviewSeconds: 60 };
        }
      })).catch(() => {});
    } catch (error) { /* Modes remain available through buttons. */ }
  }

  // Expose for node-less browser checks
  window.__stageReady = { state, startDelivery, updateTimer, runTimer, clearTimer, announcementPacing };

  loadAnnouncements();
})();
