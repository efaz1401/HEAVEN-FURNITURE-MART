#!/usr/bin/env python3
"""Remove the AR Size slider (.scale-ctl) from every piece page.

WHY: the slider pre-scaled the model before opening AR, but model-viewer runs
ar-scale="auto", so Google Scene Viewer / WebXR already offer pinch-to-resize
with a reset-to-100% button inside the AR session. A second, site-side
50–200% range slider is a worse duplicate of that control — and a range slider
is the least senior-friendly input on the page.

The block is identical in all 18 templates (CRLF line endings):

    <div class="scale-ctl" id="scale-ctl" hidden>
      ...label, output, input#scale-range, reset button, hint...
    </div>

This strips it whole. Idempotent: a page with no scale-ctl is skipped.
js/piece.js was updated in the same change to drop every reference; no
harness or test asserts the slider.

After running: bump-css-version.py, then build-critical-css.mjs — the inline
critical CSS in every page still carries the .scale-ctl rules until rebuilt.
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PIECE_DIR = ROOT / 'piece'

def main():
    changed = 0
    skipped = 0
    for page in sorted(PIECE_DIR.glob('*/index.html')):
        src = page.read_text(encoding='utf-8')
        if 'scale-ctl' not in src:
            skipped += 1
            continue
        # Verified block shape in the template (CRLF):
        #   scale-ctl > (scale-top…, scale-row…, hint p)  then ONE closing
        #   </div> at the template's 6-space indent, immediately followed by
        #   the stage-note <p>. Anchor the end on the hint line so the match
        #   cannot run past the block: everything between the scale-ctl open
        #   and the hint is nested deeper and contains no ambiguous close.
        m = re.search(
            r'[ \t]*<div class="scale-ctl" id="scale-ctl" hidden>.*?'
            r'<p class="scale-hint">[^<]*</p>\s*\r?\n[ \t]*</div>\s*\r?\n',
            src, re.S)
        if not m:
            print(f'  MISS  {page.parent.name}: scale-ctl present but block not matched')
            continue
        src = src[:m.start()] + src[m.end():]
        page.write_text(src, encoding='utf-8', newline='')
        changed += 1
        print(f'  OK    {page.parent.name}')
    print(f'{changed} pages stripped, {skipped} already clean')
    return 0

if __name__ == '__main__':
    main()
