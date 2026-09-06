#!/usr/bin/env python3
"""Give every piece page's Product JSON-LD a real price, from data/pieces.js.

The `offers` block shipped with a priceCurrency and NO price, which is invalid
for Google Rich Results — schema.org/Offer requires price or priceSpecification.
It was written before the catalogue had prices; it now has a published band per
piece, so the band is what belongs in the markup.

A PriceSpecification with minPrice/maxPrice is the honest shape: every figure on
this site is an estimate against a specification, so a single `price` would
assert a precision the workshop does not offer. Google accepts a range.

    python scripts/add-jsonld-price.py [--check]
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def pieces():
    """Reads id/price out of data/pieces.js without a JS engine."""
    src = (ROOT / "data" / "pieces.js").read_text(encoding="utf-8")
    ids = re.findall(r"^\s*id: '([^']+)',", src, re.MULTILINE)
    prices = re.findall(r"^\s*price: \{ min: (\d+), max: (\d+) \}", src, re.MULTILINE)
    if len(ids) != len(prices):
        raise SystemExit(f"parsed {len(ids)} ids but {len(prices)} prices — check data/pieces.js")
    return {i: (int(lo), int(hi)) for i, (lo, hi) in zip(ids, prices)}


def main() -> int:
    check = "--check" in sys.argv
    table = pieces()
    changed, skipped = [], []

    for slug, (lo, hi) in sorted(table.items()):
        path = ROOT / "piece" / slug / "index.html"
        if not path.exists():
            raise SystemExit(f"no page for piece {slug}")
        text = path.read_text(encoding="utf-8")

        # FIVE OF THE EIGHTEEN pages carry this block without id="ld-product"
        # (classic sofa set, teal velvet bed, emerald bed, modular sectional,
        # navy state bed) and with hand-written description/material strings that
        # differ from data/pieces.js. So match on the JSON's @type rather than on
        # the id, and add the missing id so the template finally converges.
        block = None
        for m in re.finditer(r'(<script type="application/ld\+json"[^>]*>\s*)(\{.*?\})(\s*</script>)',
                             text, re.DOTALL):
            try:
                if json.loads(m.group(2)).get("@type") == "Product":
                    block = m
                    break
            except json.JSONDecodeError:
                continue
        if not block:
            skipped.append((path, "no Product JSON-LD"))
            continue

        data = json.loads(block.group(2))
        offer = data.get("offers")
        if not isinstance(offer, dict):
            skipped.append((path, "no offers object"))
            continue
        if "priceSpecification" in offer or "price" in offer:
            skipped.append((path, "already priced"))
            continue

        # Order the keys so availability/url keep reading first, then the money.
        offer["priceSpecification"] = {
            "@type": "PriceSpecification",
            "priceCurrency": "BDT",
            "minPrice": lo,
            "maxPrice": hi,
            "valueAddedTaxIncluded": True,
        }
        open_tag = block.group(1)
        if "ld-product" not in open_tag:
            open_tag = open_tag.replace('<script type="application/ld+json"',
                                        '<script type="application/ld+json" id="ld-product"', 1)
        new_json = json.dumps(data, indent=2, ensure_ascii=False)
        new = text[:block.start()] + open_tag + new_json + block.group(3) + text[block.end():]
        changed.append(path)
        if not check:
            path.write_text(new, encoding="utf-8")

    for p in changed:
        print(f"{'would price' if check else 'priced'}  {p.relative_to(ROOT).as_posix()}")
    for p, why in skipped:
        print(f"skipped ({why})  {p.relative_to(ROOT).as_posix()}")
    print(f"\n{len(changed)} priced, {len(skipped)} skipped, {len(table)} pieces in data")
    return 1 if (check and changed) else 0


if __name__ == "__main__":
    sys.exit(main())
