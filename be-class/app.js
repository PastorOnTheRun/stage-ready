const DAY_KEY = "be-class-day";
const DONE_KEY = "be-class-done";
const INSTALL_KEY = "be-class-hide-install";

const main = document.querySelector("#main");
const tabBar = document.querySelector("#tabs");

const VIEWS = [
  { id: "class", label: "Be Class" },
  { id: "week", label: "This week" },
  { id: "after", label: "After" },
];

let content = null;
let view = "class";
let formNote = "";

function text(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function formUrl(value) {
  const raw = text(value);
  if (!raw || raw === "FORM_URL_TBD") return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function readList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeList(key, values) {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* private mode */
  }
}

function currentDay() {
  const count = content.days.length || 1;
  let saved = 1;
  try {
    saved = Number(localStorage.getItem(DAY_KEY) || "1");
  } catch {
    saved = 1;
  }
  if (!Number.isFinite(saved) || saved < 1 || saved > count) return 1;
  return saved;
}

function installHidden() {
  try {
    return localStorage.getItem(INSTALL_KEY) === "1";
  } catch {
    return false;
  }
}

function setDay(index) {
  try {
    localStorage.setItem(DAY_KEY, String(index));
  } catch {
    /* private mode */
  }
}

function brand() {
  const wrap = el("div", "brand");
  const img = document.createElement("img");
  img.className = "brand-logo";
  img.src = "../assets/logos/students-internal-color.svg";
  img.alt = "Students";
  img.width = 1693;
  img.height = 493;
  const corners = el("div", "corners");
  corners.append(el("span", null, "Family Church"));
  corners.append(el("span", "corners-mid", "Be Class"));
  corners.append(el("span"));
  wrap.append(img, corners);
  return wrap;
}

function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value) node.textContent = value;
  return node;
}

function logistics(data) {
  const lines = [data.time, data.room, data.building, data.parking, data.arriveBy].map(text).filter(Boolean);
  const block = el("div", "card stack");
  if (!lines.length) {
    block.append(el("p", "empty", text(data.emptyLogistics) || "Time and room will be posted here."));
    return block;
  }
  for (const line of lines) block.append(el("p", null, line));
  return block;
}

function openForm() {
  const url = formUrl(content.formUrl);
  if (!url) {
    formNote = text(content.formMissing) || "Form link not set.";
    paint();
    return;
  }
  window.open(url, "_blank", "noopener");
}

function actionButton(label, quiet) {
  const button = el("button", quiet ? "btn quiet" : "btn", label);
  button.type = "button";
  button.addEventListener("click", openForm);
  return button;
}

function renderClass() {
  const screen = el("div", "screen");
  if (!installHidden()) {
    const install = el("aside", "install");
    const copy = el("div");
    copy.append(el("p", null, content.installTitle));
    copy.append(el("p", "muted", content.installBody));
    const close = el("button", null, "×");
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss");
    close.addEventListener("click", () => {
      try {
        localStorage.setItem(INSTALL_KEY, "1");
      } catch {
        /* private mode */
      }
      paint();
    });
    install.append(copy, close);
    screen.append(install);
  }

  const header = el("header", "stack");
  header.append(el("p", "eyebrow", "Family Students"));
  header.append(el("h1", "page-title", content.title || "Be Class"));
  header.append(el("p", "subtitle", content.subtitle));
  header.append(el("p", "date", content.date));
  if (text(content.cadence)) header.append(el("p", "subtitle", content.cadence));
  screen.append(header);
  screen.append(logistics(content));
  if (text(content.campusNote)) screen.append(el("p", null, content.campusNote));

  const why = el("div", "stack");
  for (const sentence of content.why || []) {
    if (text(sentence)) why.append(el("p", null, sentence));
  }
  screen.append(why);

  const who = el("section", "card");
  who.append(el("h2", null, content.whoTitle || "Who should come"));
  who.append(el("p", null, content.who));
  screen.append(who);

  const bring = el("section", "card");
  bring.append(el("h2", null, content.bringTitle || "What to bring"));
  const list = el("ul", "bring");
  for (const item of content.bring || []) {
    if (text(item)) list.append(el("li", null, item));
  }
  bring.append(list);
  screen.append(bring);

  const actions = el("div", "actions");
  for (const action of content.actions || []) {
    actions.append(actionButton(action.label));
  }
  const note = el("p", "form-note");
  note.setAttribute("role", "status");
  note.textContent = formNote;
  actions.append(note);
  screen.append(actions);

  const parent = el("section", "parent");
  parent.append(el("strong", null, content.parentTitle || "For parents"));
  parent.append(el("p", null, content.parent));
  parent.append(el("p", "date", content.date));
  screen.append(parent);

  const faq = el("section", "stack");
  faq.append(el("h2", "section-title", content.faqTitle || "Questions"));
  for (const item of content.faq || []) {
    const details = el("details", "faq-item");
    details.append(el("summary", null, item.q));
    details.append(el("p", null, item.a));
    faq.append(details);
  }
  screen.append(faq);
  screen.append(el("p", "footer", content.footer));
  return screen;
}

function renderWeek() {
  const screen = el("div", "screen");
  const days = content.days || [];
  const selected = currentDay();
  const day = days[selected - 1] || days[0];
  screen.append(el("p", "eyebrow", "This week"));
  screen.append(el("h1", "page-title", `Day ${selected}`));

  const picker = el("div", "days");
  picker.setAttribute("role", "tablist");
  days.forEach((_, index) => {
    const button = el("button", "day-btn", String(index + 1));
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", index + 1 === selected ? "true" : "false");
    button.setAttribute("aria-label", `Day ${index + 1}`);
    button.addEventListener("click", () => {
      setDay(index + 1);
      formNote = "";
      paint();
    });
    picker.append(button);
  });
  screen.append(picker);

  if (!day) return screen;
  const card = el("article", "card stack");
  card.append(el("h2", "day-title", day.title));
  if (text(day.reference)) card.append(el("p", "verse", day.reference));
  card.append(el("p", text(day.scripture) ? "verse" : "verse empty", text(day.scripture) || content.scriptureMissing));
  card.append(el("p", null, day.body));
  screen.append(card);

  if (selected === 5) {
    const back = el("button", "btn quiet", content.backToClass || "Back to Be Class");
    back.type = "button";
    back.addEventListener("click", () => {
      view = "class";
      formNote = "";
      paint();
    });
    screen.append(back);
  }

  const doneIds = new Set(readList(DONE_KEY));
  const id = String(selected);
  const done = el("button", doneIds.has(id) ? "btn on" : "btn", doneIds.has(id) ? content.dayDoneSaved : content.dayDone);
  done.type = "button";
  done.addEventListener("click", () => {
    const next = new Set(readList(DONE_KEY));
    if (next.has(id)) next.delete(id);
    else next.add(id);
    writeList(DONE_KEY, [...next]);
    paint();
  });
  screen.append(done);
  screen.append(actionButton(content.dayQuestion || "I have a question", true));
  const note = el("p", "form-note");
  note.setAttribute("role", "status");
  note.textContent = formNote;
  screen.append(note);
  return screen;
}

function renderAfter() {
  const screen = el("div", "screen");
  screen.append(el("p", "eyebrow", "After class"));
  screen.append(el("h1", "page-title", "After"));
  screen.append(el("p", "muted", content.afterIntro));
  for (const section of content.after || []) {
    const card = el("section", "card");
    card.append(el("h2", null, section.title));
    card.append(el("p", text(section.body) ? null : "empty", text(section.body) || content.afterEmpty));
    screen.append(card);
  }
  const next = el("section", "card");
  next.append(el("h2", null, content.nextDateLabel));
  next.append(el("p", text(content.nextDate) ? "date" : "empty", text(content.nextDate) || content.nextDateEmpty));
  screen.append(next);
  return screen;
}

function paintTabs() {
  tabBar.replaceChildren();
  for (const item of VIEWS) {
    const button = el("button", "tab", item.label);
    button.type = "button";
    if (item.id === view) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => {
      view = item.id;
      formNote = "";
      paint();
    });
    tabBar.append(button);
  }
}

function paint() {
  paintTabs();
  const screen = view === "week" ? renderWeek() : view === "after" ? renderAfter() : renderClass();
  screen.prepend(brand());
  main.replaceChildren(screen);
  if (!formNote) window.scrollTo(0, 0);
}

async function start() {
  const response = await fetch("./content.json", { cache: "no-store" });
  content = await response.json();
  paint();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

start();
