# Stage Ready: announcement refresh runbook

This is for the scheduled refresh that runs every **Monday and Thursday at about 1:00 PM ET**, plus any manual refresh.
The live site is https://pastorontherun.github.io/stage-ready/ (GitHub Pages, repo `PastorOnTheRun/stage-ready`, branch `main`).
Publish from the local clone at `/workspace/stage-ready-site`. Mirror the same files to `/workspace/stage-ready` (the dev copy).

**Only `announcements.json` changes in a normal refresh.** Do not touch `index.html`, `app.js`, `styles.css`, or the layout.

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
- Standing rule from Notion: the Oct 7, 2026 prayer night is a Windermere **Sunday** announcement with no routine Midweek promotion. Don't put it on Lakeside unless Notion adds Lakeside student details.

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
