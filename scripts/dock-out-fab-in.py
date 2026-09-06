"""Finishes the dock -> floating-quote-button swap.

The dock's markup and its main CSS block were removed by hand; this cleans up what
grep still finds: a dead cart badge, the --dock-bar-h token, the --z-dock token, five
comments that describe a bar which no longer exists, and — the ones that matter — the
two harnesses that ASSERT every page has a .dock. A test that still passes because it
was loosened is worse than no test, so both get the equivalent invariant for the new
element rather than a deletion.

Run from the site root. Exits 2 if any substitution failed to find its target.
"""
from pathlib import Path
import sys

EDITS = [
    # ---- css/base.css: the dock's cart badge. The header's badge is .cart-count
    # (js/chrome.js:69); this one only ever hung off the dock's stacked cart item.
    ("css/base.css",
     """/* The dock's own cart badge. Inline rather than overlapping, because a dock item
   is a stacked icon-over-label and there is no corner to hang a badge on. */
.dock-count {
  display: inline-grid; place-items: center;
  min-width: 16px; height: 16px; margin-left: 4px; padding: 0 4px;
  background: var(--primary-deep); color: var(--primary-ink);
  border-radius: 8px;
  font-size: .625rem; font-weight: 800; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.dock-count[hidden] { display: none; }
""",
     ""),

    # ---- css/base.css: the footer must reserve room for the fixed pill.
    ("css/base.css",
     """.site-foot:has(.foot-rail) { padding-bottom: 0; }""",
     """.site-foot:has(.foot-rail) { padding-bottom: 0; }
/* The quote pill is position: fixed, so whichever band ends the page has to keep
   its content out from under it. Two rules because 404.html ships no rail. */
.site-foot:has(.foot-rail) .foot-rail { padding-bottom: calc(.9rem + var(--fab-clear)); }
.site-foot:not(:has(.foot-rail)) { padding-bottom: var(--fab-clear); }"""),

    # ---- css/nav.css: --dock-bar-h existed only to size the dock and the body
    # padding that reserved room for it. Both are gone.
    ("css/nav.css",
     """/* --dock-h above is the HEADER. The mobile bottom bar is --dock-bar-h, declared
   here beside it so the misleading pair is visible at a glance rather than 460
   lines apart in css/base.css. Its value is the .dock's real composition:
   `.dock a` min-height 60 + 16px padding + a 1px top border, rounded up for the
   two-line labels. css/base.css pins .dock to it and derives the body's reserved
   bottom padding from it, so the reservation cannot go stale again. */
:root { --dock-bar-h: 80px; }
""",
     """/* --dock-h is the HEADER's height, despite the name. There used to be a second,
   confusable --dock-bar-h here for the mobile bottom bar; that bar was replaced by
   the floating quote pill (css/base.css), which is sized by --fab-h instead. */
"""),

    # ---- css/nav.css: the responsive tier table named the dock as the carrier of
    # AR and rooms below 900px. It isn't, and the overlay always was.
    ("css/nav.css",
     """     up to 900px    brand + search + cart + menu; the dock carries AR and rooms""",
     """     up to 900px    brand + search + cart + menu; the overlay carries AR and rooms"""),

    ("css/nav.css",
     """   The middle tier is new. It keeps the AR CTA — which fits easily — because above
   900px there is no dock to carry it, and it restores the three controls that were
   previously unreachable. Rooms move to the overlay menu, exactly as they already
   do below 900px. */""",
     """   The middle tier is new. It keeps the AR CTA — which fits easily — and restores the
   three controls that were previously unreachable. Rooms move to the overlay menu,
   exactly as they already do below 900px. */"""),

    # ---- css/pages.css: a historical measurement. Still true of the layout that was
    # measured, but a reader greps `.dock` and finds nothing, so date it.
    ("css/pages.css",
     """     behind the mobile dock and below the fold, which is to say invisible.""",
     """     below the fold, which is to say invisible (and behind the mobile dock, which
     the page carried at the time).""",),

    # ---- css/tokens.css: the z-index token, and three comments listing the dock
    # among the surfaces that use a colour.
    ("css/tokens.css",
     """  --z-dock:   40;""",
     """  --z-fab:    40;   /* the floating quote pill: under the header, so the         */
                    /* overlay menu and the AR stage both cover it              */"""),

    ("css/tokens.css",
     """                      .coach-num, .dock a.is-ar, .skip, and every""",
     """                      .coach-num, .quote-fab, .skip, and every"""),

    ("css/tokens.css",
     """     mobile dock's labels, the hero and corridor leads and the numbers strip.""",
     """     hero and corridor leads and the numbers strip."""),

    ("css/tokens.css",
     """     surfaces (hero, meta strip, corridor, footer, loader, dock). tokens.css""",
     """     surfaces (hero, meta strip, corridor, footer, loader). tokens.css"""),

    # ---- js/shell.js: two header comments.
    ("js/shell.js",
     """   Heaven Furniture Mart — shared shell: nav, menu, dock, reveals, room count.""",
     """   Heaven Furniture Mart — shared shell: nav, menu, reveals, room count."""),

    ("js/shell.js",
     """   parallax. Small screens also get .dock (css/base.css:362), shown under
   767px. Nothing on this page needs a third menu. ------------------------- */""",
     """   parallax. Small screens get the same overlay, plus the floating quote pill.
   Nothing on this page needs a third menu. ------------------------------- */"""),

    ("js/chrome.js",
     """   Heaven Furniture Mart — shared chrome (header, overlay menu, dock, footer).""",
     """   Heaven Furniture Mart — shared chrome (header, overlay menu, footer, quote pill)."""),

    ("js/chrome.js",
     """   which the pill bar reaches only through the footer and dock. */""",
     """   which the pill bar reaches only through the footer and the overlay. */"""),

    # ---- _ref/verify-all-pages.mjs: the 36-page sweep required a .dock on every
    # page except 404. The pill IS on 404, so the new check is stricter.
    ("_ref/verify-all-pages.mjs",
     """    dock: !!document.querySelector('.dock'),""",
     """    fab: !!document.querySelector('.quote-fab[href*="wa.me"]'),"""),

    ("_ref/verify-all-pages.mjs",
     """  && (r.path === '/404.html' ? true : r.head && r.foot && r.dock);""",
     """  /* The quote pill is required EVERYWHERE, 404 included — it is static markup
     there, so unlike the header and footer it needs no module to appear. */
  && r.fab
  && (r.path === '/404.html' ? true : r.head && r.foot);"""),
]


def main() -> int:
    bad = 0
    for rel, old, new in EDITS:
        p = Path(rel)
        t = p.read_text(encoding="utf-8")
        if old not in t:
            print(f"MISS  {rel}: {old.splitlines()[0][:70]}")
            bad += 1
            continue
        n = t.count(old)
        if n > 1:
            print(f"AMBIG {rel} ({n}x): {old.splitlines()[0][:70]}")
            bad += 1
            continue
        p.write_text(t.replace(old, new), encoding="utf-8")
        print(f"ok    {rel}: {old.splitlines()[0][:66]}")
    return 2 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
