#!/usr/bin/env python3
"""Sanity-check the leader-tab JSON files (guides, service, calendar, resources).
Fails on: 1–2 character text fields (e.g. '2', '0' from a bad sheet parse), bad sensitivity values,
malformed dates, non-https links, weeks with neither Scripture/big idea nor a note, or a parentQuestion
that breaks the parent-question rules (REFRESH.md section 7: one open question, ends with "?", <= 25 words,
no quotation marks, not "how was the message", only on weeks with Scripture + big idea, same question
in both rooms when both rooms have the same message).
Usage: python3 validate_content.py   (prints VALID or the problems, exit 1 on problems)"""
import json, re, sys, datetime
from pathlib import Path
here = Path(__file__).resolve().parent
problems = []
DATE_KEYS = {"date", "start", "end"}
SHORT_OK_KEYS = set()  # no field may legitimately be 1–2 characters today

def walk(obj, path, fname):
    if isinstance(obj, dict):
        for k, v in obj.items():
            walk(v, f"{path}.{k}", fname)
            if k in DATE_KEYS and isinstance(v, str):
                try: datetime.date.fromisoformat(v)
                except ValueError: problems.append(f"{fname}{path}.{k}: bad date {v!r}")
            if k == "url" and isinstance(v, str) and not re.match(r"^https://\S+$", v):
                problems.append(f"{fname}{path}.url: not an https URL {v!r}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj): walk(v, f"{path}[{i}]", fname)
    elif isinstance(obj, str):
        key = path.rsplit(".", 1)[-1]
        s = obj.strip()
        if not s: problems.append(f"{fname}{path}: empty string")
        elif len(s) <= 2 and key not in SHORT_OK_KEYS: problems.append(f"{fname}{path}: suspicious 1–2 character value {obj!r}")
        elif re.fullmatch(r"[\d\W]+", s) and key not in {"time"} | DATE_KEYS: problems.append(f"{fname}{path}: digits/punctuation only {obj!r}")

for name in ["guides", "service", "calendar", "resources"]:
    f = here / f"{name}.json"
    try: data = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e: problems.append(f"{name}.json: cannot parse ({e})"); continue
    walk(data, "", f"{name}.json")
    if name == "guides":
        levels = [g.get("level") for g in data.get("guides", [])]
        if levels != ["middle", "high"]: problems.append(f"guides.json: guides levels must be ['middle','high'], got {levels}")
        for g in data.get("guides", []):
            for i, w in enumerate(g.get("weeks", [])):
                where = f"guides.json {g.get('level')} week {w.get('date')}"
                for k in ("title", "scripture", "bigIdea"):
                    if k in w and len(str(w[k]).strip()) < 3: problems.append(f"{where}: {k} too short {w[k]!r}")
                if not w.get("title"): problems.append(f"{where}: missing title")
                if w.get("noService"): continue
                if w.get("sensitivity") not in ("green", "yellow", "red"): problems.append(f"{where}: sensitivity must be green/yellow/red, got {w.get('sensitivity')!r}")
                if not ((w.get("scripture") and w.get("bigIdea")) or w.get("note")): problems.append(f"{where}: needs scripture + bigIdea, or a note")
            for w in g.get("weeks", []):
                q = w.get("parentQuestion")
                if q is None: continue
                where = f"guides.json {g.get('level')} week {w.get('date')} parentQuestion"
                if w.get("noService") or not (w.get("scripture") and w.get("bigIdea")): problems.append(f"{where}: only allowed on weeks with scripture + bigIdea")
                if not isinstance(q, str) or not q.strip().endswith("?"): problems.append(f"{where}: must be one question ending with '?'")
                elif q.count("?") != 1: problems.append(f"{where}: must be exactly one question")
                elif len(q.split()) > 25: problems.append(f"{where}: too long ({len(q.split())} words, max 25)")
                if isinstance(q, str) and re.search(r'["\u201c\u201d]', q): problems.append(f"{where}: no quotation marks (don't quote Scripture)")
                if isinstance(q, str) and re.search(r"how was (the|tonight|church|youth)|what did you learn", q, re.I): problems.append(f"{where}: banned generic question")
                if isinstance(q, str) and re.match(r"^(did|do|does|is|are|was|were|have|has|can|could|will|would)\b", q.strip(), re.I): problems.append(f"{where}: looks like a yes/no question")
            dates = [w.get("date") for w in g.get("weeks", [])]
            if len(set(dates)) != len(dates): problems.append(f"guides.json {g.get('level')}: duplicate week dates")

# Same message in both rooms on a date -> the calendar shows one entry, so the question must match
try:
    gd = json.loads((here / "guides.json").read_text(encoding="utf-8"))
    by = {}
    for g in gd.get("guides", []):
        for w in g.get("weeks", []): by.setdefault(w.get("date"), []).append(w)
    for d, ws in by.items():
        if len(ws) == 2 and ws[0].get("title") == ws[1].get("title") and ws[0].get("scripture") == ws[1].get("scripture") \
           and ws[0].get("parentQuestion") != ws[1].get("parentQuestion"):
            problems.append(f"guides.json {d}: same message in both rooms but parentQuestion differs")
except Exception: pass

if problems:
    print("INVALID"); [print(" -", p) for p in problems]; sys.exit(1)
print("VALID")
