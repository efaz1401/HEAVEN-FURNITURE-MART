"""Generate optimized WebP variants for every product image.

Run from the project root:  python scripts/make_webp.py

For each assets/img/<name>.png (except favicon.svg and files that are not
PNG) this writes:
  assets/img/<name>_512.webp   -- card size, ~40-80 KB
  assets/img/<name>_1024.webp  -- poster size, ~100-200 KB
  assets/img/og/<name>.jpg     -- ~150 KB social-preview copy (og:image;
                                  scrapers like Facebook don't accept WebP)

Original PNGs are kept as masters and as og:image fallbacks only.

A few images arrived as WebP with no PNG master -- see WEBP_MASTERS below.
They get width derivatives too, but no og/*.jpg, because nothing references
them as a social preview.
"""
from pathlib import Path
from PIL import Image

IMG = Path(__file__).resolve().parent.parent / "assets" / "img"
OG = IMG / "og"

# Masters that exist only as .webp, so the *.png glob below never sees them.
# hero_poster is 2880px wide and renders at ~631px in the workshop-film block
# on index.html; without derivatives every phone downloaded all 421 KB of it.
WEBP_MASTERS = ("hero_poster",)
WEBP_MASTER_WIDTHS = ((512, 78), (1024, 80), (1536, 80))

def main():
    OG.mkdir(exist_ok=True)
    pngs = sorted(IMG.glob("*.png"))
    for src in pngs:
        name = src.stem
        with Image.open(src) as im:
            im = im.convert("RGB")
            for width, q in ((512, 78), (1024, 80)):
                out = IMG / f"{name}_{width}.webp"
                if im.width <= width:
                    resized = im
                else:
                    resized = im.resize((width, round(im.height * width / im.width)),
                                        Image.LANCZOS)
                resized.save(out, "WEBP", quality=q, method=6)
            og = OG / f"{name}.jpg"
            im.save(og, "JPEG", quality=82, optimize=True)
        print(f"{name}: png={src.stat().st_size//1024}KB "
              f"w512={(IMG / f'{name}_512.webp').stat().st_size//1024}KB "
              f"w1024={(IMG / f'{name}_1024.webp').stat().st_size//1024}KB "
              f"og={og.stat().st_size//1024}KB")

    for name in WEBP_MASTERS:
        src = IMG / f"{name}.webp"
        if not src.exists():
            print(f"{name}: SKIPPED (no {src.name})")
            continue
        with Image.open(src) as im:
            im = im.convert("RGB")
            sizes = []
            for width, q in WEBP_MASTER_WIDTHS:
                if im.width <= width:
                    continue          # never upscale past the master
                out = IMG / f"{name}_{width}.webp"
                im.resize((width, round(im.height * width / im.width)),
                          Image.LANCZOS).save(out, "WEBP", quality=q, method=6)
                sizes.append(f"w{width}={out.stat().st_size//1024}KB")
        print(f"{name}: master={src.stat().st_size//1024}KB " + " ".join(sizes))

if __name__ == "__main__":
    main()
