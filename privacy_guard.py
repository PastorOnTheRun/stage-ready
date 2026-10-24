#!/usr/bin/env python3
"""Privacy guard for Stage Ready's published JSON (public site, no sign-in).

Fails if any string (value or key) in a published JSON file contains an email address or a
phone-number pattern. Used by validate_announcements.py, validate_content.py and
build_students.py (normal and --check). Tooling only: it never edits content.

Usage: python3 privacy_guard.py [file ...]   (no args = every published JSON file in the repo)
Exit 0 = clean, 1 = found something. Matches are masked in the output.
"""
import json, re, sys
from pathlib import Path

here = Path(__file__).resolve().parent
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
# US-style numbers: (407) 555-1234, 407-555-1234, 407.555.1234, 407 555 1234, +1 407 555 1234, 4075551234,
# plus international "+<country> ..." runs of 8+ digits. Dates (2026-10-07), times and the BAND code don't match.
PHONE = re.compile(
    r"(?<![\w/=?&#-])(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\d{3}[\s.-])\d{3}[\s.-]\d{4}(?![\w-])"
    r"|(?<![\w/=?&#.-])\d{10,11}(?![\w.-])"
    r"|(?<![\w/])\+\d{1,3}(?:[\s.-]?\d){8,13}(?!\w)")
SKIP_DIRS = {".git", "node_modules"}


def published_files():
    out = []
    for p in sorted(here.rglob("*")):
        if p.is_file() and p.suffix in (".json", ".webmanifest") and not (set(p.relative_to(here).parts) & SKIP_DIRS):
            out.append(p)
    return out


def _mask(s):
    return s[:2] + "…" + s[-2:] if len(s) > 4 else "…"


def scan_obj(obj, path, fname, found):
    if isinstance(obj, dict):
        for k, v in obj.items():
            scan_obj(k, f"{path}.<key>", fname, found)
            scan_obj(v, f"{path}.{k}", fname, found)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            scan_obj(v, f"{path}[{i}]", fname, found)
    elif isinstance(obj, str):
        for label, rx in (("email address", EMAIL), ("phone number", PHONE)):
            for m in rx.finditer(obj):
                found.append(f"{fname}{path or '.'}: {label} pattern {_mask(m.group(0))!r} (public site: no personal info)")


def scan_file(path):
    path = Path(path)
    try:
        name = str(path.resolve().relative_to(here))
    except ValueError:
        name = str(path)
    found = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        # Not parseable JSON: still scan the raw text so nothing slips through.
        text = path.read_text(encoding="utf-8", errors="replace")
        scan_obj(text, "", name, found)
        return found
    scan_obj(data, "", name, found)
    return found


def scan(paths=None):
    """Return a list of problems across the given files (default: every published JSON file)."""
    files = [Path(p) for p in paths] if paths else published_files()
    seen, problems = set(), []
    for f in files:
        key = f.resolve()
        if key in seen or not f.exists():
            continue
        seen.add(key)
        problems += scan_file(f)
    return problems


if __name__ == "__main__":
    probs = scan(sys.argv[1:] or None)
    for p in probs:
        print("ERROR:", p)
    print("PRIVACY OK" if not probs else f"PRIVACY FAIL ({len(probs)} match(es))")
    sys.exit(1 if probs else 0)
