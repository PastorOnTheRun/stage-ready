# Be Class copy

Edit `content.json` only. Do not put student names, rosters, emails, phones, grades, RSVPs, baptism lists, prayer requests, or follow-up notes in this folder.

Leave a string as `""` when Notion does not have it. The page shows an empty state. Do not guess a time, room, campus, teacher, or dress code.

`formUrl` must be a real `https://` church form, or `""`. An empty value keeps the buttons and shows “Form link not set.” The app does not collect names.

## Landing

| Field | What it is |
| --- | --- |
| `title` | Be Class |
| `subtitle` | Belong · Believe · Beyond |
| `date` | Next class. Be Class is the third Sunday of every month. |
| `cadence` | The monthly pattern. Leave empty only if Jake changes the pattern. |
| `time` | Start time, or empty |
| `room` | Room, or empty |
| `building` | Building, or empty |
| `parking` | Parking note, or empty |
| `arriveBy` | Arrive-by line, or empty |
| `campusNote` | Only if Jake writes a campus note |
| `emptyLogistics` | Shown when time, room, building, parking, and arrive-by are all empty |
| `why` | Up to four short sentences |
| `who` | Who should come |
| `bring` | What to bring. One line per item |
| `actions` | The three button labels |
| `formUrl` | One link for all three buttons and for “I have a question” on a day |
| `formMissing` | Shown when `formUrl` is empty |
| `parentTitle` / `parent` | Parent strip. Keep the date next to it; the date field is `date` |
| `footer` | Contact line. Not a personal cell |
| `faq` | Question and answer pairs |
| `installTitle` / `installBody` | First-visit home-screen hint |

## This week

Seven objects in `days`, in order. Each one:

| Field | What it is |
| --- | --- |
| `title` | Day title |
| `reference` | Verse reference Jake pastes. Empty shows nothing extra |
| `scripture` | Verse text Jake pastes (CSB). Empty shows `scriptureMissing` |
| `body` | The short reading |

`scriptureMissing` is the empty verse line. Do not paste verse text into this file until Jake supplies it.

## After

| Field | What it is |
| --- | --- |
| `afterIntro` | One line above the sections |
| `after` | Three sections. `body` stays empty until Jake writes it |
| `afterEmpty` | Shown when a section body is empty |
| `nextDateLabel` | Label for the following class |
| `nextDate` | Next date, or empty |
| `nextDateEmpty` | Shown when `nextDate` is empty |

Do not add group names, leader names, or a campus directory.
