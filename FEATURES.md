# Stage Ready — Live App Feature Inventory (v7)

Source: https://family-church-stage-ready.pastoronthemove.chatgpt.site  
Inventoried: September 24, 2026 (ET)  
Live artifact: single self-contained `index.html` (CSS + JS inlined). Weekly data: `/announcements.json`.

## Screens / views

1. **Chooser (landing / team home)**
   - Brand: “Stage Ready” mark (▲) + campus note “Family Church Students · Windermere”
   - Eyebrow + H1 “Announcements team”
   - Intro copy about prepare / green speak / red overtime
   - Four mode cards in 2×2 grid

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
| Opening Charge | 60s skippable | 60s | Welcome, Scripture, invite, transition |
| Worship Lean-In | 60s skippable | 60s | Romans 12:1 lean-in + physical posture cue |
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

### Opening Charge — Psalm 95:1–3
- Setup: Welcome students and help them turn their attention to God before worship begins.
- Beats: Welcome / Scripture / Invitation / Transition (see live source)

### Worship Lean-In — Romans 12:1
- Setup: Give the room one clear invitation to respond to Jesus as worship begins.
- Beats include physical-response cue: “Choose a posture of surrender…” / “You have my attention.”

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


## Sunday AM vs Live lists (added Sep 24, 2026)

At Jake’s request, **Practice Announcements was replaced by Sunday AM Announcements**.

Optional per-event field in `announcements.json`:

```json
"services": ["sunday"]
```

or `["live"]`, or both. Filtering rules:

- **Sunday AM mode** shows events tagged `sunday`
- **Live mode** shows events tagged `live`
- Events **without** a `services` field appear in **both** modes

Finish copy for Sunday AM is written for a real Sunday morning delivery (not a practice reflection).
