#!/usr/bin/env python3
"""Validate Stage Ready announcements.json (schemaVersion 2).

Usage: python3 validate_announcements.py [path] [--allow-expired]
Exit code 0 = valid, 1 = errors. Prints a per-campus summary.
"""
import datetime as dt
import json
import sys
from zoneinfo import ZoneInfo

CAMPUSES = {"windermere", "lakeside"}
SERVICES = {"wed", "sun"}
REQUIRED = ["name", "when", "where", "detail", "action", "campus", "service"]
OPTIONAL = {"endDate", "cost"}


def as_list(value):
    return value if isinstance(value, list) else [value]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    allow_expired = "--allow-expired" in sys.argv
    path = args[0] if args else "announcements.json"
    errors, warnings = [], []
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: cannot parse {path}: {exc}")
        return 1

    today = dt.datetime.now(ZoneInfo("America/New_York")).date()
    if data.get("schemaVersion") != 2:
        errors.append("schemaVersion must be 2")
    if not isinstance(data.get("updatedAt"), str) or not data["updatedAt"].strip():
        errors.append("updatedAt must be a non-empty string like 'September 25, 2026'")
    prompts = data.get("prompts")
    if not isinstance(prompts, list) or len(prompts) != 1:
        errors.append("prompts must be a list with exactly one prompt object")
        prompts = prompts if isinstance(prompts, list) else []
    summary = {c: {"wed": [], "sun": []} for c in CAMPUSES}
    for p_index, prompt in enumerate(prompts):
        for key in ("title", "setup"):
            if not isinstance(prompt.get(key), str) or not prompt[key].strip():
                errors.append(f"prompts[{p_index}].{key} must be a non-empty string")
        events = prompt.get("events")
        if not isinstance(events, list):
            errors.append(f"prompts[{p_index}].events must be a list (may be empty)")
            continue
        for i, ev in enumerate(events):
            where = f"events[{i}] ({ev.get('name', '?')})"
            if "services" in ev:
                errors.append(f"{where}: legacy 'services' field; use campus + service")
            for key in REQUIRED:
                if key not in ev:
                    errors.append(f"{where}: missing '{key}'")
            for key in ("name", "when", "where", "detail", "action"):
                if key in ev and (not isinstance(ev[key], str) or not ev[key].strip()):
                    errors.append(f"{where}: '{key}' must be a non-empty string")
            unknown = set(ev) - set(REQUIRED) - OPTIONAL
            if unknown:
                errors.append(f"{where}: unknown field(s) {sorted(unknown)}")
            campuses = as_list(ev.get("campus", []))
            services = as_list(ev.get("service", []))
            if not campuses or any(c not in CAMPUSES for c in campuses):
                errors.append(f"{where}: campus must be 'windermere', 'lakeside', or a list of those")
            if not services or any(s not in SERVICES for s in services):
                errors.append(f"{where}: service must be 'wed', 'sun', or a list of those")
            if "cost" in ev and (not isinstance(ev["cost"], str) or not ev["cost"].strip()):
                errors.append(f"{where}: cost must be a non-empty string when present")
            if "endDate" in ev:
                try:
                    end = dt.date.fromisoformat(ev["endDate"])
                    if end < today:
                        (warnings if allow_expired else errors).append(
                            f"{where}: endDate {end} is before today {today} (remove the item)")
                except (TypeError, ValueError):
                    errors.append(f"{where}: endDate must be YYYY-MM-DD")
            for c in campuses:
                for s in services:
                    if c in summary and s in summary[c]:
                        summary[c][s].append(ev.get("name", "?"))

    for c in sorted(CAMPUSES):
        print(f"{c}: wed={summary[c]['wed'] or '[]'} sun={summary[c]['sun'] or '[]'}")
    for w in warnings:
        print(f"WARNING: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    print("VALID" if not errors else f"INVALID ({len(errors)} error(s))")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
