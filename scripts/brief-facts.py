#!/usr/bin/env python3
"""Correct the company facts the site currently states wrongly.

The site was built with invented contact details. A real brief has since arrived and
the site's address, phone and heritage are wrong about the actual business. This
rewrites the mechanical ones — address, phone, the formatted phone display, and the
Google Maps query. The heritage/milestone work is content, not substitution, and
lives in scripts/brief-milestones.py.

WHY A SCRIPT AND NOT FIND-REPLACE. Three traps:
  * js/chrome.js injects the header, overlay, footer and dock into 34 pages while
    index.html carries its own inline copy of all four and 404.html carries its own
    footer, so every chrome-level fact needs the same edit two or three times.
  * six WhatsApp links sit inside <noscript>, where the WHATSAPP constant can never
    reach them.
  * the phone appears both as a digit string (wa.me/8801708446655) and as formatted
    display text (+880 1708-446655). A digit replace misses the second entirely.

    python scripts/brief-facts.py [--check]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"dist", "_ref", "node_modules", "scripts", "tests", ".playwright-mcp"}

# --- the real facts, from the company brief ---------------------------------
OLD_PHONE, NEW_PHONE = "8801708446655", "8801960481983"
OLD_ORDERS = "8801885133937"          # collapses into the one real number
OLD_FMT, NEW_FMT = "+880 1708-446655", "+880 1960-481983"

SUBS = [
    # Address. Locality stays Chattogram; only the street and area were wrong.
    ("Zakir Hossain Road, Khulshi", "Agrabad Access Road"),
    ("Zakir Hossain Road", "Agrabad Access Road"),
    ("Heaven+Furniture+Mart+Zakir+Hossain+Road+Khulshi+Chattogram",
     "Heaven+Furniture+Mart+Agrabad+Access+Road+Chattogram"),
    # Phone: formatted display first, so the digit pass cannot eat it.
    (OLD_FMT, NEW_FMT),
    (OLD_PHONE, NEW_PHONE),
    (OLD_ORDERS, NEW_PHONE),
]


def files():
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file() or p.suffix not in {".html", ".js", ".mjs", ".xml", ".css"}:
            continue
        if any(part in SKIP for part in p.relative_to(ROOT).parts):
            continue
        yield p


def main() -> int:
    check = "--check" in sys.argv
    touched = {}
    for path in files():
        text = original = path.read_text(encoding="utf-8")
        hits = []
        for old, new in SUBS:
            n = text.count(old)
            if n:
                text = text.replace(old, new)
                hits.append(f"{n}x {old[:34]}")
        if text != original:
            touched[path] = hits
            if not check:
                path.write_text(text, encoding="utf-8")

    for path, hits in touched.items():
        print(f"{'would fix' if check else 'fixed'}  {path.relative_to(ROOT).as_posix()}")
        for h in hits:
            print(f"      {h}")
    print(f"\n{len(touched)} files, {sum(len(h) for h in touched.values())} substitution groups")

    # Nothing may survive. These are the strings that make the site lie.
    leftovers = []
    for path in files():
        t = path.read_text(encoding="utf-8")
        for bad in ("Zakir Hossain", "Khulshi", OLD_PHONE, OLD_ORDERS, OLD_FMT):
            if bad in t:
                leftovers.append(f"{path.relative_to(ROOT).as_posix()}: {bad}")
    if leftovers and not check:
        print("\nSTILL PRESENT — these need a hand edit:")
        for l in leftovers:
            print("  " + l)
        return 2
    return 1 if (check and touched) else 0


if __name__ == "__main__":
    sys.exit(main())
