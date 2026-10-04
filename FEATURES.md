# Stage Ready — Live App Feature Inventory (v7)

Source: https://family-church-stage-ready.pastoronthemove.chatgpt.site  
Inventoried: September 24, 2026 (ET)  
Live artifact: single self-contained `index.html` (CSS + JS inlined). Weekly data: `/announcements.json`.

## Screens / views

1. **Chooser (landing / team home)**
   - Brand: “Stage Ready” mark (▲) + campus-neutral note “Family Church Students” (changed from “Family Church Students · Windermere” on Sep 25, 2026; the header is the same on every tab)
   - Eyebrow + H1 “Announcements team”
   - Intro copy about prepare / green speak / red overtime
   - Stage mode cards in a 2-column grid (campus dashboards, Opening Charge, Worship Lean-In, and Dismissal from Worship when this Sunday has one)

2. **Workspace (prep + speaking)**
   - Status strip with phase label, title, help text, large clock
   - Review action bar: “Start delivery now”, “Back to team home”
   - Live action bar: “End round”
   - Prompt card (coaching / announcements) + “Suggested pacing” sidebar

3. **Finish**
   - Badge ✓, “Round complete.” / “Announcements complete.”
   - Reflective copy; “Lead it again” / “Lead announcements again”; “Back to team home”

## Modes

| Mode | Prep | Speak | Purpose |
|------|------|-------|---------|
| Opening Charge | 60s skippable | 60s | Welcome, Scripture, invite, transition (this Sunday's run of show) |
| Worship Lean-In | 60s skippable | 60s | Lean-in + physical posture cue (this Sunday's run of show) |
| Dismissal from Worship | 60s skippable | 60s | Land worship, Scripture, set the stage for the message, transition (added Oct 11, 2026) |
| Sunday AM Announcements | 60s skippable | 180s | Lead Sunday morning announcements with the sunday-tagged list |
| Live Announcements | 60s skippable | 180s | Lead live/midweek announcements with the live-tagged list |

Live Announcements uses the same content mode as Practice but `isLiveUse` changes chips, setup copy, phase label (“On stage”), and finish copy.

## Timer behavior

- Prep: body `data-phase="review"`, background blue `#123d80`, phase color `--blue`, label “Preparation”, clock counts down from 1:00
- Speaking: `live`, green `#145c3c`, phase “Presenting” or “On stage”, countdown 1:00 or 3:00
- Overtime: `over`, red `#962d35`, label “Over time”, clock shows `+M:SS` upward, progress bar full, pulse animation
- Interval ~100ms; progress width = remaining/duration
- Skip prep → `startDelivery` immediately (also **Space** key during review, unless focus is button/link/input)
- End round → finish screen (does not auto-finish when speak timer hits 0; speaking continues into overtime until End round)
- Audio beep via Web Audio oscillator + `navigator.vibrate(80)` on phase transitions (prep→speak, speak→over, finish)

## Coaching copy (exact)

### Sunday run of show (dated, swapped weekly; Oct 4, 2026)
The three Sunday stage moments live in `app.js` → `runOfShow`, **one entry per Sunday date**:

```js
{ sunday: "2026-10-11", moments: { opening: {…}, worship: {…}, dismissal: {…} } }
```

Each moment has `title`, `passage` (CSB reference, shown as the accent chip), `setup` (the Setup line) and `beats` (four `[label, copy]` pairs, shown as the numbered steps). The app picks the entry for **today if it is Sunday, otherwise the coming Sunday** (America/New_York); after the last entry it keeps showing the latest one. So Sunday's wording stays up all day Sunday and the next Sunday's wording appears Monday morning.
- Mode keys: `opening` = Opening Charge, `worship` = Worship Lean-In, `dismissal` = Dismissal from Worship. All three are Stage tiles on home (Dismissal is the full-width tile under the other two) and open the same dark prep/live/overtime screen.
- If an entry has no moment for a key, that tile is hidden for that week and the Stage/All counts drop to match (the Oct 4 entry has only Opening Charge and Worship Lean-In, exactly as before).
- Kicker chip: "Opening encouragement" for Opening Charge and Worship Lean-In, "Closing encouragement" for Dismissal. Pacing sheet: Opening/Worship use the 0:00/0:15/0:35/0:50 encouragement pacing; Dismissal uses 0:00 Land the worship moment / 0:15 Share the Scripture truth / 0:30 Set the stage for the message / 0:45 Transition into the teaching.
- **Wording is Jake-approved and used word for word** (quotes, apostrophes and ellipses as written). Weekly process: see `REFRESH.md` → "Sunday run of show".

| Sunday | Series / message | Scripture (CSB) | Moments |
|---|---|---|---|
| 2026-10-04 | (original copy) | Opening: Psalm 95:1–3 · Worship: Romans 12:1 | Opening Charge, Worship Lean-In |
| 2026-10-11 | Prayer & Worship (Week 1) · Redirection | Psalm 63:3–4 (all three) | Opening Charge, Worship Lean-In, Dismissal from Worship |

### Opening Charge — Oct 4, 2026 entry (Psalm 95:1–3)
- Setup: Welcome students and help them turn their attention to God before worship begins.
- Beats: Welcome / Scripture / Invitation / Transition (see `app.js`)

### Worship Lean-In — Oct 4, 2026 entry (Romans 12:1)
- Setup: Give the room one clear invitation to respond to Jesus as worship begins.
- Beats include physical-response cue: “Choose a posture of surrender…” / “You have my attention.”

### Oct 11, 2026 entry (Psalm 63:3–4)
- Opening Charge setup: Welcome students and help them turn their attention to God before worship begins.
- Worship Lean-In setup: Build on the opening charge and give the room one clear invitation to respond to Jesus in worship.
- Dismissal from Worship setup: Close the worship set and set the stage for the teaching that comes next.
- Beats: exactly as in the approved run of show (`/workspace/run-of-show/2026-10-11.md`).

### Announcements framework (always shown)
1. Introduce yourself
2. Explain the why
3. Share the vision — **Believe in Jesus, Belong in community, and live Beyond ourselves.**
- Pacing close line: “Connect to Believe, Belong, Beyond and close”
- Event cards: name, when, where, optional cost, detail, “Next step: {action}”
- Hide events where `endDate < today` (America/New_York calendar date)

## Buttons / controls

- Mode cards (Practice/Live disabled until JSON loads)
- Start delivery now / Back to team home / End round / Lead it again
- Keyboard: Space skips prep in review

## Data handling

- `fetch('./announcements.json?v=' + Date.now())` cache no-store
- Fields: `updatedAt`, `prompts[].title|setup|events[]` with `name, when, where, detail, action, endDate?, cost?`
- Descriptions on cards update with event count + Reviewed date
- Optional ChatGPT `document.modelContext.registerTool` (`start_ministry_segment`) — ChatGPT-host only

## Sounds / haptics / a11y

- Beeps at 620Hz / 430Hz / 760Hz; vibrate 80ms
- `aria-live` announcer; timer `role="timer"`; reduced-motion media query
- No settings panel, no dark/light toggle, no service worker in live v7

## Visual tokens (live)

- Night `#101116`, ink `#f5f3ed`, yellow `#ffce56`, blue `#72a8ff`, green `#7ae6a2`, red `#ff765f`

## Grok rebuild notes (this package)

- Single-viewport, no-scroll layout at 390×844 and 375×667 (`overflow: hidden` on `html/body`, flex fill).
- Home shows all current announcements at a glance under the four mode launchers.
- Suggested pacing + announcement coaching framework live in bottom sheets (one tap away).
- Timer strip is compact; phase background colors (blue/green/red) match live v7.
- ChatGPT `modelContext.registerTool` kept for parity when hosted in that environment; unused otherwise.
- Weekly data: `/workspace/stage-ready/announcements.json` (and embedded copy inside `stage-ready-standalone.html`).


## Sunday AM vs Live lists (services field)

**Practice Announcements was replaced by Sunday AM Announcements** at Jake’s request.

Optional per-event field in `announcements.json`:

```json
"services": ["sunday"]
```

or `["live"]`, or both.

- **Sunday AM** — midweek / church-life items (point students to the week ahead and Family Church life). Tag with `"sunday"`.
- **Live (Wednesday)** — Wednesday student ministry items. Tag with `"live"`.
- **Untagged items** appear in **both** modes.

Weekly updates should set `services` deliberately so Sunday and Wednesday lists stay distinct. Home “This week” shows a small **Sun** / **Wed** tag on each item.

## Home mode cards (compact, Sep 24, 2026)

Home-screen mode cards are a compact 2×2 grid (≥64px tall) with a small duration pill beside the title. **Descriptions no longer appear on the home cards**; coaching and setup copy still appear after tapping into a mode. Sunday/Live cards may show a tiny item-count line only.

## Mode screens vs home chooser

The Family Church banner and 2×2 mode chooser appear **only on the home screen**. After tapping a mode, those go away and the selected mode gets a full screen with a slim Back chrome, timer, and content. No mode screen shows the four choice boxes or the big banner.

## Campus announcement dashboards (Sep 25, 2026)

Sunday AM and Live Announcements were folded into two campus buttons on home: **Windermere announcements** (`campus-windermere`) and **Lakeside announcements** (`campus-lakeside`). Each opens a full-screen dashboard with the same 60s prep / 3:00 speaking / overtime timer and Back button. Items carry `campus` and `service` ("wed" or "sun", shown as Wed / Sun tags). A campus with no items opens to a “No {Campus} announcements yet” empty state with no timer. Full schema and refresh process: see `REFRESH.md`.
