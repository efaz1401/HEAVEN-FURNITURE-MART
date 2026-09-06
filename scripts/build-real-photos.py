#!/usr/bin/env python3
"""
Derivatives for the six real photographs, into assets/img/real/.

A SEPARATE DIRECTORY on purpose. assets/img/ is flat and every name in it is a
piece id from data/pieces.js — tests/data-contract.test.js walks that directory
and asserts six files per piece, so a `showroom-night_960.webp` sitting beside
them is noise in a namespace that has a contract. These are photographs of the
business, not of a product.

CROPS ARE DECLARED, NOT CENTRED. Every one of these was checked against the
rendered crop and adjusted:
  · the MD portrait is centred horizontally but pinned to the TOP, because a
    centred 4:5 window cut through his forehead
  · both storefronts are 4:3, NOT 3:2. Both edits came back 1024x1024 with the
    building filling the frame, so a 3:2 window has to lose 341px — it put the
    illuminated sign 9px from the top edge and sliced the parked motorcycles in
    half. 4:3 loses 256px, which is exactly the sky and the far pavement
  · interior 4 starts BELOW the ceiling fan — a centred crop left half a fan
    hanging in the top edge, which reads as a mistake rather than as a ceiling

Run from the site root:  python scripts/build-real-photos.py
"""
import os
import sys

from PIL import Image

SRC = r'C:\Users\MSI\Downloads'
OUT = os.path.join('assets', 'img', 'real')
OG = os.path.join('assets', 'img', 'og')

# name: (source file, crop box or None, widths to emit)
#
# Widths are the RENDERED css width at each breakpoint, doubled for retina, then
# rounded to a round number. Nothing is emitted larger than the source: every
# one of these was upscaled once already by the editing pass, and upscaling a
# second time in Python adds bytes and no detail.
JOBS = {
    # 4:5. 819 IS THE CEILING and it caps the layout: the 1024x1024 edit only
    # yields 819px once cropped to 4:5, so css/pages.css holds the rendered column
    # to ~410px, where 819 is a true 2x. A wider column would be upscaling.
    'md-portrait': ('Abdul kalam.png', (102, 0, 921, 1024), [560, 819]),

    # 4:3. The showroom page's lead image, full .wrap width (1240px at desktop).
    'showroom-night': ('Night storefront.png', (0, 128, 1024, 896), [640, 1024]),

    # 4:3, sits in a half-width cell beside the directions. Started 18px higher
    # than the night shot because its sign sits lower in the frame.
    'showroom-day': ('daytime storefront.jpg', (0, 110, 1024, 878), [560, 1024]),

    # 3:2. The homepage room-set band, full-bleed-ish, so it gets the widest set.
    'room-set': ('interior 4.png', (0, 196, 1267, 1041), [640, 960, 1267]),

    # already 3:2 at 1536x1024 — no crop, the framing is right.
    'room-detail': ('interior 1.png', None, [560, 1024, 1536]),

    # 3:2 from 1557x1010. Centred: the seven people fill the frame edge to edge.
    'team': ('teams.png', (21, 0, 1536, 1010), [640, 1024, 1515]),
}

# og:image wants a JPEG at a known size — 1200x630 is the ratio every crawler
# crops to, so hand it that rather than letting Facebook centre-crop a 3:2.
OG_JOBS = {
    'showroom': ('Night storefront.png', (0, 243, 1024, 781)),
}


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for name, (src, box, widths) in JOBS.items():
        path = os.path.join(SRC, src)
        if not os.path.isfile(path):
            print(f'MISSING  {path}')
            return 2
        im = Image.open(path).convert('RGB')
        cropped = im.crop(box) if box else im
        cw, ch = cropped.size
        print(f'{name:16s} {im.size[0]}x{im.size[1]} -> {cw}x{ch}  ({cw / ch:.3f}:1)')
        for w in widths:
            if w > cw:
                print(f'    skip {w} — wider than the source')
                continue
            h = round(ch * w / cw)
            dst = os.path.join(OUT, f'{name}_{w}.webp')
            cropped.resize((w, h), Image.LANCZOS).save(
                dst, 'WEBP', quality=82, method=6)
            kb = os.path.getsize(dst) / 1024
            total += kb
            print(f'    {w:5d}x{h:<5d} {kb:7.1f} KB  {dst}')

    for name, (src, box) in OG_JOBS.items():
        im = Image.open(os.path.join(SRC, src)).convert('RGB')
        dst = os.path.join(OG, f'{name}.jpg')
        im.crop(box).resize((1200, 630), Image.LANCZOS).save(
            dst, 'JPEG', quality=86, optimize=True, progressive=True)
        kb = os.path.getsize(dst) / 1024
        total += kb
        print(f'{name + " (og)":16s} 1200x630   {kb:7.1f} KB  {dst}')

    print(f'\n{total / 1024:.2f} MB of derivatives')
    return 0


if __name__ == '__main__':
    sys.exit(main())
