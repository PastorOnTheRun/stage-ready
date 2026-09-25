# Stage Ready: announcement refresh runbook

This is for the scheduled refresh that runs every **Monday and Thursday at about 1:00 PM ET**, plus any manual refresh.
The live site is https://pastorontherun.github.io/stage-ready/ (GitHub Pages, repo `PastorOnTheRun/stage-ready`, branch `main`).
Publish from the local clone at `/workspace/stage-ready-site`. Mirror the same files to `/workspace/stage-ready` (the dev copy).

**Only `announcements.json` changes in a normal refresh.** Do not touch `index.html`, `app.js`, `tabs.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, the layout, or the four leader-tab files (`guides.json`, `service.json`, `calendar.json`, `resources.json`) unless Jake asks for it. Section 7 covers those four files.

## 1. Which service each refresh focuses on

| Run | Focus | What to do |
|---|---|---|
| **Monday ~1 PM ET** | That week's **Wednesday night student service** | Make the `wed` items right for this Wednesday at each campus. Add items from the Monday Jake + Luke meeting. Keep the upcoming Sunday's `sun` items too. |
| **Thursday ~1 PM ET** | The **coming Sunday** | Make the `sun` items right for this Sunday (use the new Middle School Sunday Announcements Log entry). Keep `wed` items that still apply to next Wednesday. |

The app also puts the focus service first on its own. From Monday to Wednesday (ET), Wed items show first. From Thursday to Sunday, Sun items show first. Within each group, items keep their order in the JSON file.

## 2. Notion sources

Read Notion through MCP server `user-Notion-xai`, **read only**. Never write to Notion. Read the pages in this order:

| # | Page | ID | Use |
|---|---|---|---|
| 1 | **AppSoundcore** (Soundcore recordings; parent of the meeting pages) | `3dc7b1f0f0cb811c88bfffaa7b9830fb` | **Primary source.** Jake's **Monday meeting with Luke Sareyka** (Lakeside Student Pastor) about the next couple of weeks is recorded here. Fetch the page and open the **newest child pages**. Many children are blank, so skip those. Take only concrete student items with dates, times and places for Windermere or Lakeside. |
| 2 | **Soundcore Work Inbox** | `3dc7b1f0f0cb81f38d91ffeb25b00179` | Another place Soundcore recordings and transcripts may land. Check it for new recordings. |
| 3 | **Middle School Sunday Announcements Log** | `3e57b1f0f0cb81139d35fbe869dad60d` | Jake's corrected Windermere Sunday announcement drafts (newest entry at the bottom). **This is the main source for Windermere `sun` items.** Its "Confirmed by Jake" lines win over older pages. |
| 4 | Announcements database | page `6086823b65284ca3a1d0e1ee0890fd85`, data source `collection://7731b01a-113c-4314-a8e0-759b3066cc54` | Organized queue with Campus, Event date, Show from/until, and Status fields. **Use only rows with Status Approved or Published.** It was empty as of Sep 25, 2026. |
| 5 | Student Ministry Announcements Team App | `3e57b1f0f0cb81e6a34df4bc976c7fb2` | Standing announcement rules (for example: prayer night gets promoted on Sunday, not Midweek; the BAND invite is ongoing). |
| 6 | Ministry Memory & AI Context | `3e57b1f0f0cb81b6ae49d8caca7bd65f` | Schedules, Be Class date, event table with status. Items marked "Planned / tentative" or "Verify" are **not** announceable. |
| 7 | Middle School Sunday Morning Flow (Sunday Checklist) | `3e57b1f0f0cb815a8439edd178677965` | Who presents on Sunday; context only. |
| 8 | Lakeside Campus | `3e57b1f0f0cb81dd81cad4721f7be30d` | Lakeside history and observations. Child page: Luke's reflection `3e57b1f0f0cb81bb875be4f317f106fc`. Context, not announcements, unless a dated event is listed. |
| 9 | Windermere Campus | `3e57b1f0f0cb81219ce2eba4e0879bc0` | Windermere history. Context only. |
| 10 | Student Ministry Dashboard | `3d97b1f0f0cb817f841cd44dc71b077f` | Hub page. Links to everything above. |
| 11 | Ministry Tasks | `collection://a7a03f04-12d5-498c-8bad-642f31f4dfda` | Tasks. Use only to confirm a date (for example, the Be Class task says Oct 18). Tasks marked "Needs confirmation" are not announcements. |

Search terms that find the right pages: `Lakeside`, `Luke`, `Windermere`, `announcements`, `Wednesday`, `Sunday`, `Soundcore`, `student pastors meeting`.

### Content rules
- **Never invent** events, dates, times, rooms, costs, or sign-up details. If Notion doesn't say it, leave it out.
- If sources disagree, use the **newest** item that Jake confirmed. Mention the conflict in the run report.
- Drop anything whose date has passed. Set `endDate` on every dated item.
- Wording must be ready to say from the stage: short, warm, and factual.
- If a campus has nothing, leave it with **zero items**. The app shows "No {Campus} announcements yet". Never add placeholder content.

## 3. Campus and service rules

- `campus`: which campus's students hear the item: `"windermere"` or `"lakeside"`. Use a list (`["windermere","lakeside"]`) **only** when Notion says the item applies to both campuses' students.
- `service`: which service the item is **announced at**: `"wed"` (Wednesday night student service) or `"sun"` (Sunday).
  - **Sun** is for midweek and church-life items: the Wednesday night invite (time, dinner), church prayer nights, Be Class, baptism.
  - **Wed** is for student ministry items: Middle School Sundays, the BAND app (the students' push channel).
  - Keep overlap small. Don't put the same item under both services unless Jake asks for it.
  - If an item is unclear, apply the rules above.
- Standing rule (Jake, Sep 25, 2026): the Oct 7, 2026 prayer night goes on BOTH campuses as a `sun` item. Windermere keeps the bus wording. Lakeside's says it's on-site at Lakeside with no bus.
- Jake approved simple, generic Lakeside items on Sep 25, 2026: "Wednesday Nights at Lakeside" and the Lakeside Prayer Night. Keep them until Notion or Jake gives specifics, then replace them with the real details. Never add times or rooms that aren't confirmed.

## 4. JSON schema (`announcements.json`, schemaVersion 2)

```json
{
  "schemaVersion": 2,
  "updatedAt": "September 25, 2026",
  "prompts": [
    {
      "title": "Upcoming at Family Church Students",
      "setup": "Lead these current ministry announcements with warmth and clarity. State only the details shown; do not guess a price or registration detail.",
      "events": [
        {
          "name": "Church Prayer Night",
          "when": "Wednesday, October 7, 2026 · bus leaves at 5:45 PM",
          "where": "Bus from Family Church Windermere to Lakeside",
          "cost": "Free",
          "detail": "One to three sentences, ready to say from stage.",
          "action": "One clear next step.",
          "campus": "windermere",
          "service": "sun",
          "endDate": "2026-10-07"
        }
      ]
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `schemaVersion` | yes | `2` |
| `updatedAt` | yes | Refresh date as display text, e.g. `"September 28, 2026"` (ET). |
| `prompts` | yes | Exactly one prompt. Keep `title` and `setup` unchanged. |
| `name`, `when`, `where`, `detail`, `action` | yes | Non-empty strings. `when` includes the weekday and date for dated items. |
| `campus` | yes | `"windermere"` or `"lakeside"`, or a list of both. |
| `service` | yes | `"wed"` or `"sun"` (a list only when both truly apply). |
| `endDate` | for dated items | `YYYY-MM-DD`, the last day the item should show. The app hides the item after this date (America/New_York). Leave it out only for ongoing items (for example, BAND). |
| `cost` | optional | Only when Notion confirms it (e.g. `"Free"`, `"$1 pizza"`). |

No other fields are allowed, and the old `services` field is rejected. The validator enforces all of this.

## 5. Publish steps

```bash
cd /workspace/stage-ready-site
git pull --ff-only origin main
# edit announcements.json
python3 validate_announcements.py            # must print VALID (expired items count as errors)
cp announcements.json /workspace/stage-ready/announcements.json
# optional render check at iPhone 16 Pro size (402x874), headless Chrome:
#   python3 -m http.server 8765 &   then
#   node /workspace/stage-ready/check-render.mjs http://localhost:8765/ /workspace/shots/local-<date>
#   (expect "errors: []", both campus dashboards listed, and no horizontal overflow)
git add announcements.json
git commit -m "Refresh announcements for <Wed|Sun> <date>"
git push origin main                          # never --force
gh run list -R PastorOnTheRun/stage-ready -L 1   # wait for "completed success" (about 30–60 s)
curl -s "https://pastorontherun.github.io/stage-ready/announcements.json?cb=$(date +%s)" | cmp - announcements.json && echo LIVE_MATCH
```

If `LIVE_MATCH` doesn't print, wait 30 seconds and check again. Pages can lag for a minute or two.
**Never push a build that fails validation or renders blank.**

## 6. Run report

Report these items: the Notion pages read (with IDs), the final items per campus and service, what was added or removed, the commit hash, whether the live JSON matches, and any gaps (for example, missing times or rooms, conflicts, or a campus with no items).

## 7. Leader tabs: `guides.json`, `service.json`, `calendar.json`, `resources.json`

The app has a fixed bottom tab bar with five tabs, in this order: **Guides** (Small Group Leader Guides), **Stage** (Announcements & Stage Stuff: Opening Charge, Worship Lean-In and the Windermere and Lakeside dashboards, driven by `announcements.json`), **Service** (Order of Service), **Calendar**, and **Resources**. Tabs 1, 3, 4 and 5 each read one JSON file (fetched with `cache: "no-store"`), so editing a JSON file and pushing is enough to update a tab.

**A normal Mon/Thu refresh still changes only `announcements.json`.** Edit these four files only when Jake asks, or when Jake has asked for a leader-tab update as part of a refresh.

### Content rules (same as announcements, plus)
- Every item must be traceable to Jake's Notion (read-only via `user-Notion-xai`) or to the Fall 2026 Preaching Calendar sheet (read-only). **Never invent** events, dates, times, rooms, costs, links, curriculum, or guide content.
- Leave out anything Notion marks **Planned / tentative**, **Verify**, **Needs confirmation**, "proposed", or "target". The Sunday rollout milestones, SLT cadence, the Oct 7/14 student training, the Oct 18 leader regroup, the Israel trip, and curriculum names (YM360 The Thread, Reframe Youth: "verify") were left out for this reason as of Sep 25, 2026.
- Links must be real `https://` URLs that appear in Notion and open **without sign-in**. Don't link private Google Docs or Drive files (for example the rollout doc, preaching calendar, or Spiritual Health Assessment) unless Jake says a file is public and safe to share.
- **No personal info:** no student or minor names, rosters, contact details, check-in or attendance data, or health or survey data. Adult staff names only in a role context and only if Notion has them; when unsure, leave names out. The weekly Sunday team names in the Sunday Checklist are **not** published.
- The audience is leaders and the stage team. Don't add student-facing copy or "sign in" or "private version" placeholders.
- If a section has nothing sourced, leave `items` empty. The app shows the section's `emptyMessage` (e.g. "Nothing posted here yet.").
- Bump `updatedAt` (e.g. `"October 1, 2026"`) whenever you edit a file. Keep the `sources` list (Notion page name + ID) current. The app doesn't show it; it's there for traceability.
- Validate before pushing: `python3 validate_content.py` must print `VALID`. It rejects 1–2 character or digits-only text (the kind of garbage a bad sheet parse produces), sensitivity values other than green/yellow/red, bad dates, non-https links, and weeks with neither Scripture + big idea nor a note.
- To rebuild the guide weeks from the preaching calendar: export the sheet ranges A3:C22, D3:I22 (Chapel/HS) and K3:P22 (Annex/JH) as CSV into `/workspace/stage-ready/sheet-cache/` (`dates.csv`, `hs.csv`, `jh.csv`), then run `python3 /workspace/stage-ready/build_guide_weeks.py /workspace/stage-ready/sheet-cache guides.json` followed by `python3 validate_content.py`. The builder never copies preacher names.

### Notion sources for the leader tabs
| File | Notion pages (IDs) |
|---|---|
| `guides.json` | Google Sheet Fall 2026 Student Ministry Preaching Calendar `1EEksbhWHBH8OtjqFYooc5IplLnqX_5uo9hnb49rdJFI` (weekly MS/HS messages; Guest Teacher Guide tab for Know your room, sensitivity, safety); Middle School Sunday Morning Flow `3e57b1f0f0cb815a8439edd178677965` (MS Sunday table devotionals); Ministry Memory & AI Context `3e57b1f0f0cb81b6ae49d8caca7bd65f` (leader-guide practices and leader-practice focus, sections 3–4) |
| `service.json` | Preaching Calendar sheet, Guest Teacher Guide tab (5:45 guest arrival, 22–25 min teaching window, response then small groups; Chapel = HS, Annex = MS); Student Ministry Dashboard `3d97b1f0f0cb817f841cd44dc71b077f` (Midweek and Sunday playbooks); Middle School Sunday Announcements Log `3e57b1f0f0cb81139d35fbe869dad60d` (Wed 6–8, dinner at 5, $1 pizza); Luke's Lakeside Growth Reflection `3e57b1f0f0cb81bb875be4f317f106fc` (Lakeside Wednesday order, Building 5); Middle School Sunday Morning Flow `3e57b1f0f0cb815a8439edd178677965` |
| `calendar.json` | Preaching Calendar sheet (Wednesday series starts, Pastor's Choice week, no Midweek Nov 25); Ministry Tasks `collection://a7a03f04-12d5-498c-8bad-642f31f4dfda` (Olympia FCA every Tuesday from Sep 22; Be Class Oct 18); Announcements Log `3e57b1f0f0cb81139d35fbe869dad60d` and Announcements Team App `3e57b1f0f0cb81e6a34df4bc976c7fb2` (Oct 7 prayer night; Lakeside on-site comes from Jake's Sep 25 standing rule in section 3, not Notion); Lakeside Campus `3e57b1f0f0cb81dd81cad4721f7be30d` (Sep 23 Survivor Night); Ministry Memory `3e57b1f0f0cb81b6ae49d8caca7bd65f` (Be Class); Sunday Morning Flow and Dashboard (Sunday 9:45–10:45, Building 4) |
| `resources.json` | Announcements Log and Announcements Team App (BAND); Middle School Sunday Morning Flow (Sidekick, Download Youth Ministry, Canva). The two official-site links (ourfamily.church home and Windermere campus page) are not in Notion; Jake's team approved keeping them on Sep 25, 2026. |

### `guides.json` schema (two separate guides: Middle School and High School)
```json
{
  "updatedAt": "September 25, 2026",
  "title": "Small Group Leader Guides",
  "intro": "One or two sentences shown under the page title.",
  "guides": [
    {
      "level": "middle",
      "label": "Middle School",
      "title": "Middle School Small Group Leader Guide",
      "room": "Annex (middle school)",
      "thisWeekEmpty": "No middle school guide posted for this week yet.",
      "weeks": [
        { "date": "2026-10-14", "series": "Prayer & Worship", "week": "Week 2", "title": "Relationship",
          "scripture": "Mark 1:35; Luke 5:16; ...", "bigIdea": "Jesus modeled the importance of prayer, ...", "sensitivity": "green" },
        { "date": "2026-11-25", "series": "No Midweek", "week": "Thanksgiving week", "title": "No Midweek", "noService": true, "note": "Thanksgiving week. No student Midweek." }
      ],
      "weeksEmpty": "No middle school curriculum posted yet.",
      "weeksSource": "Fall 2026 Student Ministry Preaching Calendar (Annex / JH)",
      "sections": [ { "title": "Know your room", "items": [ { "title": "...", "body": "...", "source": "..." } ], "emptyMessage": "Nothing posted here yet." } ]
    },
    { "level": "high", "label": "High School", "title": "High School Small Group Leader Guide", "room": "Chapel (high school)", "...": "same fields" }
  ],
  "shared": { "title": "For every small group leader", "items": [ { "title": "...", "bullets": ["..."], "source": "..." } ] },
  "sources": [ { "name": "Notion page or Sheet name", "id": "Notion page ID or sheet:<id>" } ]
}
```
- `guides`: exactly two entries, `level` `"middle"` then `"high"`. The tab shows a large Middle School / High School switch at the top, and only the chosen guide appears. The phone remembers the last choice.
- **This week's guide** is picked automatically: the first entry in `weeks` whose `date` is today or later (ET). If there isn't one, the app shows `thisWeekEmpty`. **Fall 2026 teaching calendar** lists the remaining upcoming weeks, with past weeks folded under "Earlier weeks". If `weeks` is empty, it shows `weeksEmpty`.
- Week fields: `date` (`YYYY-MM-DD`, the Wednesday), `series`, `week`, `title` (required); `scripture`, `bigIdea`, `note` (optional); `sensitivity` `"green" | "yellow" | "red"` (Yellow and Red show a tag); `noService: true` for weeks with no Midweek.
- **Source for `weeks`:** the Google Sheet **Fall 2026 Student Ministry Preaching Calendar** (`1EEksbhWHBH8OtjqFYooc5IplLnqX_5uo9hnb49rdJFI`, tab "Preaching Calendar", read-only via `user-Google-sheets` `read_range`; linked from the Student Ministry Dashboard). **Room 1 = Chapel (HS) feeds `high`; Room 2 = Annex (JH) feeds `middle`.** Copy series, week, message title, Scripture, big idea and sensitivity exactly. Do **not** publish preacher names, prep status, or the linked lesson docs (Drive files that may need sign-in; not checked). "Pastor's Choice" weeks have no Scripture or big idea until Jake sets them, so use a `note` instead.
- `sections` items: `title` (required), `body`, `bullets`, `source`. "Know your room" comes from the sheet's "Guest Teacher Guide" tab (High School 9th–12th / Junior High 6th–8th rows). MS Sunday table devotionals come from the Sunday Morning Flow page.
- **Level rule:** put an item under `middle` or `high` only when the source says which level it's for. Items the source doesn't tie to a level go in `shared` (shown under both guides). Never copy one level's message to the other unless the sheet lists the same message for both rooms.

### `service.json` schema
```json
{ "updatedAt": "...", "title": "Order of Service", "intro": "...",
  "services": [ {
    "title": "Wednesday Night · Windermere", "when": "Wednesdays · 6:00–8:00 PM", "where": "Family Church Windermere",
    "items": [ { "time": "5:00 PM", "title": "Early dinner", "detail": "Pizza is $1 every week." } ],
    "roles": ["Tech"], "checklist": ["..."], "note": "optional factual note", "source": "Notion page name(s)" } ],
  "sources": [ { "name": "...", "id": "..." } ] }
```
`time`, `detail`, `roles`, `checklist` and `note` are optional. Leave out `time` when Notion gives the order but not the clock time. If `services` is empty, the tab shows "No order of service has been posted yet."

### `calendar.json` schema
```json
{ "updatedAt": "...", "title": "Calendar",
  "term": { "name": "Fall 2026", "start": "2026-08-01", "end": "2026-12-31" },
  "weekly": [ { "day": "Tuesday", "title": "FCA at Olympia High", "detail": "...", "source": "Ministry Tasks" } ],
  "events": [ { "date": "2026-10-07", "title": "...", "campus": "Both campuses", "time": "...", "detail": "...", "source": "..." } ],
  "sources": [ { "name": "...", "id": "..." } ] }
```
- `term` sets which months appear (Month grid or List view, with a jump chip for each month). A month with no events shows "Nothing posted for this month yet."
- `events[].date` is `YYYY-MM-DD` (ET). `campus`, `time` and `detail` are optional. Past events stay on the calendar, dimmed. Only add events Notion states as scheduled or confirmed.

### `resources.json` schema
```json
{ "updatedAt": "...", "title": "Resources", "intro": "...",
  "groups": [ { "title": "BAND invite, sign-up forms & PDFs", "items": [
      { "title": "BAND invite", "type": "link", "url": "https://...", "note": "..." } ],
    "emptyMessage": "Nothing posted here yet." } ],
  "sources": [ { "name": "...", "id": "..." } ] }
```
`type` is `"link"`, `"form"`, `"pdf"` or `"tool"`. `url` must be an `https://` URL found in Notion. Items without a URL are shown as plain cards (for example, tools the team uses).

### Publishing app or leader-tab changes
When `index.html`, `app.js`, `tabs.js`, `styles.css` or `sw.js` change: bump the `?v=` cache-busters in `index.html` for the changed assets and bump `CACHE_VERSION` in `sw.js`. The service worker is network-first for every same-origin GET (HTML, JSON, JS, CSS and icons), uses the cache only as an offline fallback, deletes old caches on activate, and calls `skipWaiting()` + `clients.claim()`, so a new deploy shows up without anyone clearing their cache. JSON-only edits don't need a version bump.
Full render check (every tab, both guides, both campus dashboards, timers, service worker, manifest) at 402x874:
```bash
python3 -m http.server 18427 --bind 127.0.0.1 --directory /workspace/stage-ready-site &
node /workspace/stage-ready/check-all.mjs http://localhost:18427/ /workspace/shots/local-<date> 2
# expect: "errors": [], overflowX false, clipped [], hiddenBehindBar false, timers ticking, serviceWorker activated + controlledAfterReload true
```
