"""Generate transparent product cut-outs for the light ("paper") sections.

Run from the project root:  python scripts/make_cutouts.py [name ...]
Hand-fixed replacements:    python scripts/make_cutouts.py --redo [name ...]

The 18 masters in assets/img/ are opaque RGB renders sitting on a dark oxblood
studio ground. That ground is baked into the pixels, so the old skin's dark
sections could use them directly but a white page cannot — the product arrives
inside a visible dark rectangle.

For each assets/img/<name>.png this writes:
  assets/img/<name>_cut_512.webp    -- card size
  assets/img/<name>_cut_1024.webp   -- grid / carousel size
  assets/img/<name>_cut_1536.webp   -- hero / feature size
all RGBA with a soft ground shadow composited underneath, plus a contact sheet
at _ref/cutouts_contact_sheet.jpg for review.

Masters are never modified: the dark sections and any rollback depend on them.

Pipeline per image:
  1. Downscale the master to WORK px on its long side. rembg's u2net runs its
     mask at 320x320 internally, so working above our 1536 px largest output
     buys nothing and costs ~4x the time.
  2. rembg -> RGBA. Alpha matting is on: these products have carved spindles
     and glass panels where a hard mask leaves a halo of oxblood.
  3. Kill sub-threshold alpha haze, trim to the alpha bounding box, then re-pad
     to a square with a MARGIN border. The masters are framed inconsistently
     (some fill the frame, some float in the middle); normalising here is what
     makes a row of cut-outs sit on one optical baseline in the grid.
  4. Composite a blurred elliptical contact shadow at the subject's base. This
     is the difference between a product sitting ON the page and one floating
     in front of it.

Each image is scored for two mask failures that are silent otherwise:
  KEPT-ALL   coverage > 0.92 -- the background was not removed
  ATE-IT     coverage < 0.05 -- the subject was removed along with it
Anything flagged should be redone by hand; see the plan for the prompt.

--redo MODE
-----------
For images a human re-cut externally (gpt-image-2), dropped in _ref/redo/<name>.png.
These SKIP step 2 — rembg is the wrong tool twice over:

  * The background is already gone, so there is nothing to segment.
  * Ask gpt-image-2 for transparency and it paints a fake checkerboard instead
    (alpha comes back uniformly 255 — check it, don't trust the preview). That
    checkerboard is two exact grey tones, so a colour key is *deterministic*
    where a neural mask is approximate.

The precision matters: royal_navy_gold_velvet_bed was redone because rembg had
sliced two of its four posts off, and those posts are ~30px wide at 2880. u2net
masks at 320x320, where they are ~3px, and alpha_matting_erode_size=9 would eat
them again. Keying the background keeps them pixel-exact.

Steps 3 and 4 are shared, so a redone piece lands on the same optical baseline
and carries the same contact shadow as the other 17.
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
REF = ROOT / "_ref"
REDO = REF / "redo"      # hand-fixed sources; NOT under assets/img, which main() globs

WORK = 1536          # long-edge working resolution (== largest output)
MARGIN = 0.08        # padding each side of the square canvas, as a fraction
ALPHA_FLOOR = 8      # alpha values at or below this become fully transparent
SUBJECT_Y = 0.46     # subject centre as a fraction of canvas height
SHADOW_ALPHA = 46    # ~18% of 255
OUT_SIZES = (512, 1024, 1536)
OUT_QUALITY = 82

# Fake-transparency checkerboard as emitted by gpt-image-2, measured off
# _ref/redo/royal_navy_gold_velvet_bed.png.
CHECKER_TONES = (240, 254)
CHECKER_TOL = 7      # per-channel distance from a tone to still count as checker
CHECKER_GREY = 5     # max channel spread; excludes cream bedding (r-b ~= 20)

# Coverage bounds outside which the mask is almost certainly wrong.
KEPT_ALL = 0.92
ATE_IT = 0.05


def cut_alpha(src: Path, session) -> Image.Image:
    """Master -> RGBA subject, background removed, still at working scale."""
    from rembg import remove

    with Image.open(src) as raw:
        im = raw.convert("RGB")
        if max(im.size) > WORK:
            scale = WORK / max(im.size)
            im = im.resize((round(im.width * scale), round(im.height * scale)),
                           Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "PNG")

    out = remove(
        buf.getvalue(),
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=250,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=9,
    )
    return Image.open(io.BytesIO(out)).convert("RGBA")


def key_checker(src: Path) -> Image.Image:
    """Hand-fixed source -> RGBA, the painted checkerboard keyed out.

    Two-tone grey at exact values, so this is a colour key rather than a mask.
    The subtleties:

    * ONLY the region connected to the border counts as background. A plain
      colour key would also punch holes in the bed — specular highlights on the
      polished silver posts reach the checker tones and are grey by definition.
      Those are enclosed by darker post, so a border-connected flood spares them.
      (Both checker tones live in one mask, so the checkerboard itself is a single
      connected region; the gaps between the posts and under the frame open onto
      the border, so they clear too.)
    * Cream bedding is excluded by CHECKER_GREY, not by tone: it sits at a similar
      brightness but spreads ~20 between R and B.
    * Dilate by one pixel before inverting, to eat the anti-aliased fringe where
      subject met checker. Left in, that fringe is a pale outline — invisible on
      the white page but obvious on the review sheet's own checkerboard. One pixel
      off a 30px post is nothing.
    """
    with Image.open(src) as raw:
        im = raw.convert("RGB")
        if max(im.size) > WORK:
            scale = WORK / max(im.size)
            im = im.resize((round(im.width * scale), round(im.height * scale)),
                           Image.LANCZOS)
        rgb = im.copy()

    a = np.asarray(rgb).astype(np.int16)
    spread = a.max(axis=2) - a.min(axis=2)
    near = np.zeros(a.shape[:2], dtype=bool)
    for tone in CHECKER_TONES:
        near |= (np.abs(a - tone) <= CHECKER_TOL).all(axis=2)
    candidate = near & (spread <= CHECKER_GREY)

    labels, _ = ndimage.label(candidate)
    edge = np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])
    ids = np.unique(edge[edge > 0])
    background = np.isin(labels, ids) if ids.size else np.zeros_like(candidate)
    background = ndimage.binary_dilation(background, iterations=1)

    out = rgb.convert("RGBA")
    out.putalpha(Image.fromarray(np.where(background, 0, 255).astype(np.uint8), "L"))
    return out


def coverage(alpha: Image.Image) -> float:
    """Fraction of pixels the mask considers subject."""
    hist = alpha.histogram()
    solid = sum(hist[128:])
    return solid / float(alpha.width * alpha.height)


def ground_shadow(canvas_size: int, box: tuple[int, int, int, int]) -> Image.Image:
    """A blurred black ellipse at the base of `box`, as an L-mode mask."""
    left, top, right, bottom = box
    w = right - left
    ell_w = w * 0.78
    ell_h = max(6.0, ell_w * 0.15)
    cx = left + w / 2.0
    # Sit the ellipse's centre just above the subject's foot so the near edge
    # tucks under it instead of reading as a separate grey blob below.
    cy = bottom - ell_h * 0.35

    mask = Image.new("L", (canvas_size, canvas_size), 0)
    ImageDraw.Draw(mask).ellipse(
        (cx - ell_w / 2, cy - ell_h / 2, cx + ell_w / 2, cy + ell_h / 2),
        fill=SHADOW_ALPHA,
    )
    return mask.filter(ImageFilter.GaussianBlur(radius=canvas_size * 0.013))


def compose(subject: Image.Image) -> Image.Image | None:
    """Trim, re-pad square, shadow. None when the mask left nothing."""
    alpha = subject.getchannel("A").point(lambda v: 0 if v <= ALPHA_FLOOR else v)
    subject.putalpha(alpha)

    bbox = alpha.getbbox()
    if not bbox:
        return None
    subject = subject.crop(bbox)

    long_edge = max(subject.size)
    side = max(1, round(long_edge / (1.0 - 2.0 * MARGIN)))

    x = round((side - subject.width) / 2.0)
    y = round(side * SUBJECT_Y - subject.height / 2.0)
    y = max(round(side * MARGIN), min(y, side - subject.height - round(side * MARGIN)))
    box = (x, y, x + subject.width, y + subject.height)

    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(Image.new("RGBA", (side, side), (0, 0, 0, 255)),
                 (0, 0), ground_shadow(side, box))
    canvas.alpha_composite(subject, (x, y))
    return canvas


def emit(canvas: Image.Image, name: str) -> list[str]:
    written = []
    for width in OUT_SIZES:
        out = IMG / f"{name}_cut_{width}.webp"
        img = canvas if canvas.width <= width else canvas.resize(
            (width, round(canvas.height * width / canvas.width)), Image.LANCZOS)
        img.save(out, "WEBP", quality=OUT_QUALITY, method=6)
        written.append(f"{width}={out.stat().st_size // 1024}KB")
    return written


def contact_sheet(names: list[str], cols: int = 5, cell: int = 340) -> Path | None:
    """One JPEG of every cut-out on white, for a single accept/reject pass."""
    tiles = [n for n in names if (IMG / f"{n}_cut_512.webp").exists()]
    if not tiles:
        return None
    rows = (len(tiles) + cols - 1) // cols
    pad, label = 10, 26
    sheet = Image.new("RGB", (cols * (cell + pad) + pad,
                             rows * (cell + label + pad) + pad), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)
    for i, n in enumerate(tiles):
        cx = pad + (i % cols) * (cell + pad)
        cy = pad + (i // cols) * (cell + label + pad)
        # Checkerboard behind each tile so leftover background reads as opaque
        # instead of blending invisibly into a white sheet.
        for gy in range(0, cell, 20):
            for gx in range(0, cell, 20):
                if (gx // 20 + gy // 20) % 2:
                    draw.rectangle((cx + gx, cy + gy, cx + gx + 19, cy + gy + 19),
                                   fill=(238, 238, 238))
        with Image.open(IMG / f"{n}_cut_512.webp") as t:
            t = t.convert("RGBA")
            t.thumbnail((cell, cell), Image.LANCZOS)
            sheet.paste(t, (cx + (cell - t.width) // 2,
                            cy + (cell - t.height) // 2), t)
        draw.text((cx + 2, cy + cell + 6), n[:46], fill=(25, 25, 25))
    REF.mkdir(exist_ok=True)
    out = REF / "cutouts_contact_sheet.jpg"
    sheet.save(out, "JPEG", quality=88, optimize=True)
    return out


def main(argv: list[str]) -> int:
    """--redo WAS DOCUMENTED, IMPLEMENTED, AND NEVER WIRED UP.

    key_checker() existed, REDO pointed at _ref/redo/, and the module docstring
    explained that royal_navy_gold_velvet_bed had been redone by hand "because
    rembg had sliced two of its four posts off". None of it ran: main() globbed
    assets/img/*.png and treated argv purely as a name filter, so `--redo` was
    parsed as a piece name, matched nothing, and the real name beside it went
    down the rembg path anyway. Silently — a flag that does nothing looks
    identical to a flag that worked.

    The shipped result was the defect the redo was meant to fix, in a worse form:
    rembg kept the headboard and posts but destroyed the footboard, the lower
    frame and all four feet, leaving a detached fragment to one side. That is
    what was live on /piece/royal_navy_gold_velvet_bed/.
    """
    redo = "--redo" in argv
    names = set(a for a in argv if not a.startswith("--"))

    if redo:
        sources = sorted(p for p in REDO.glob("*.png"))
        if names:
            sources = [p for p in sources if p.stem in names]
        if not sources:
            print(f"no hand-fixed source in {REDO.relative_to(ROOT)} matched "
                  f"{sorted(names) if names else 'anything'}")
            return 1
    else:
        sources = sorted(p for p in IMG.glob("*.png")
                         if not p.stem.startswith(("temp_", "crop_")))
        if names:
            sources = [p for p in sources if p.stem in names]
            if not sources:
                print(f"no master matched {sorted(names)}")
                return 1

    masters = sources
    session = None if redo else new_session("u2net")
    flagged: list[tuple[str, str, float]] = []
    done: list[str] = []

    for i, src in enumerate(masters, 1):
        name = src.stem
        # Keying is deterministic; rembg is a 320x320 neural mask that eats
        # 30px posts. Never mix them for one piece.
        subject = key_checker(src) if redo else cut_alpha(src, session)
        cov = coverage(subject.getchannel("A"))

        canvas = compose(subject)
        if canvas is None:
            flagged.append((name, "ATE-IT", cov))
            print(f"[{i:2}/{len(masters)}] {name}: EMPTY MASK — skipped")
            continue

        sizes = emit(canvas, name)
        done.append(name)
        note = ""
        if cov > KEPT_ALL:
            flagged.append((name, "KEPT-ALL", cov))
            note = "  <-- KEPT-ALL, background likely still present"
        elif cov < ATE_IT:
            flagged.append((name, "ATE-IT", cov))
            note = "  <-- ATE-IT, subject likely destroyed"
        print(f"[{i:2}/{len(masters)}] {name}: cov={cov:.3f} "
              f"{canvas.width}px {' '.join(sizes)}{note}")

    sheet = contact_sheet(done)
    print(f"\n{len(done)}/{len(masters)} written.")
    if sheet:
        print(f"contact sheet: {sheet.relative_to(ROOT)}")
    if flagged:
        print("\nreview by hand:")
        for name, why, cov in flagged:
            print(f"  {why:9} cov={cov:.3f}  {name}")
    else:
        print("no automatic failures flagged — still eyeball the sheet.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
