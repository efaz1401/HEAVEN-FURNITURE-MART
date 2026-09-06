"""Updates the money-format assertion in _ref/verify-pricing.mjs to lakh grouping
and adds the parts-sum assertion that guards review issue #2.

A file rather than a heredoc/-c because the replacement contains the escape
sequence \\u09F3 and a template literal, both of which the shell mangles.

    python scripts/patch-pricing-suite.py
"""
path = '_ref/verify-pricing.mjs'
s = open(path, encoding='utf-8').read()

OLD = """check('taka uses the Bengali rupee sign and Western grouping',
  P.taka(120000) === '\\u09F3120,000', P.taka(120000));"""

NEW = """/* LAKH grouping, not Western: Bangladesh writes 1,20,000 rather than 120,000,
   and this is the most repeated string on the site. */
check('taka uses the Bengali rupee sign and lakh grouping',
  P.taka(120000) === '\\u09F31,20,000', P.taka(120000));
check('lakh grouping holds at seven figures',
  P.taka(1234567) === '\\u09F312,34,567', P.taka(1234567));

/* THE BUG THIS ASSERTION EXISTS FOR. The configurator prints three figures in one
   glance — base, extras, headline — and they must add up. Before unitPrice() was
   made to derive its base from basePrice(), 10 of the 18 pieces printed a
   breakdown that missed the headline by up to 500. */
const partsBad = PIECES.filter((p) => {
  const cfg = { ...P.defaultConfig(p), addons: P.addonsFor(p).map((a) => a.key) };
  return P.basePrice(p, cfg) + P.extrasPrice(p, cfg) !== P.unitPrice(p, cfg);
});
check('printed base + extras === headline, all 18, every add-on selected',
  partsBad.length === 0, partsBad.map((p) => p.id).join(', '));"""

if "lakh grouping" in s:
    print('already patched')
elif OLD in s:
    open(path, 'w', encoding='utf-8', newline='').write(s.replace(OLD, NEW, 1))
    print('patched the money-format assertion and added the parts-sum guard')
else:
    raise SystemExit('anchor not found — inspect the file before retrying')
