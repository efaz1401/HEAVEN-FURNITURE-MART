/* ==========================================================================
   THE PRICING MODEL

   Pure functions. No DOM, no storage, no side effects — so it can be unit-tested
   without a browser (_ref/verify-pricing.mjs) and reused by the configurator,
   the cart, the checkout and the order email without any of them re-deriving it.

   THE IDEA IN ONE LINE: each piece's published price range is its SPECIFICATION
   BAND, and a configuration picks a point in that band.

     specLevel   0  ->  price.min   the piece exactly as listed
     specLevel   1  ->  price.max   top materials, larger dimensions
     specLevel  -0.15 -> the floor  smaller than standard
     add-ons        ->  added on top of the band

   Two axes drive specLevel:

     size      how far the three dimension sliders are from standard, converted
               to a volume ratio and flattened by PRICING.volumeExponent because
               bespoke cost tracks frame, joinery hours and covered surface, not
               the air inside the piece.
     material  which of the three tiers for the piece's matGroup is selected.

   Both weights and the exponent live in PRICING in data/pieces.js, so the whole
   catalogue is tuned from four numbers rather than eighteen price lists.

   EVERY FIGURE THIS FILE RETURNS IS AN ESTIMATE. Pieces are made to order and
   quoted per commission; the UI must always say so.
   ========================================================================== */

import { PRICING, MATERIAL_TIERS, ADDONS, UNIVERSAL_ADDONS, taka, pick, toBnDigits, tierText, addonLabel, variantLabel } from '../data/pieces.js';

export { taka };

/* ---- Dimensions --------------------------------------------------------- */

/** The piece as listed: [{ label, value, unit }] from its own `dims`. */
export function standardDims(p) {
  return p.dims.map(([label, value, unit]) => ({ label, value, unit }));
}

/** The mode object on a dimension, or an empty one. See data/pieces.js. */
export const dimMode = (p, i) => (p.dims[i] && p.dims[i][3]) || {};

/** True when this dimension is a stated fact rather than a choice — a gas-lift
    seat height, a standard dining height, a mattress-driven bed width. */
export const isFixedDim = (p, i) => dimMode(p, i).fixed === true;

/** How many of a piece's dimensions the customer can actually move. */
export const variableDims = (p) => p.dims.filter((_, i) => !isFixedDim(p, i)).length;

/**
 * Slider bounds for one dimension.
 *
 * Step size is deliberately coarse on big pieces and fine on small ones: 5cm is
 * a sensible increment on a 280cm sectional and useless on a 52cm chair seat,
 * where it would offer four positions across the whole range.
 */
export function dimBounds(standard) {
  const step = standard >= 150 ? 5 : 1;
  /* THE REACH IS SNAPPED, NOT THE ENDS.
     This used to snap min and max to absolute multiples of the step —
     Math.round((standard - spread) / step) * step — so that the slider's
     extremes were round numbers. That put the STANDARD off the grid whenever it
     was not itself a multiple of the step, which is the one value that has to be
     reachable: it is the published specification and the price the visitor
     arrived with.
     Measured on the Teal Velvet Bed, width 193cm: bounds came out 145-240 at
     step 5, and (193 - 145) % 5 = 3. The browser snapped the range input to 195
     while the <output> still read 193cm, so the control and the readout
     disagreed on first paint — and once the customer touched Width, 193 was
     gone. Nearest stop up was 195, which prices ৳500 higher and flips the panel
     out of "standard specification".
     Deriving both ends as standard ± a snapped reach puts the standard exactly
     on a step by construction. Range width moves by at most one step (measured
     across all 54 dimensions: 0-5cm), and no piece's top-of-range price changes,
     because specLevel() is clamped to 1 either way. */
  const reach = Math.round((standard * PRICING.sizeRange) / step) * step;
  return { min: standard - reach, max: standard + reach, step };
}

/* ---- Untrusted configuration ---------------------------------------------
   A configuration can arrive from the URL hash (js/configurator.js reads it so a
   spec survives being pasted into WhatsApp) or from localStorage (js/order.js
   reads a cart written by an older build, or hand-edited). Neither is input this
   site controls, and both reach the ORDER DOCUMENT the workshop builds from.

   Measured before these existed: /piece/royal_gold_carved_dining_chair/
   #cfg=-50x9999x0,m9 printed "-50cm / 9999cm / 0cm" over sliders sitting at
   their legal limits, checked no material radio at all, and put
   "-50 × 9999 × 0 cm · Solid Burma teak" into the cart, the order email and the
   WhatsApp copy. The money was safe — specLevel() clamps and sizeNorm() applies
   Math.max(1, value) — but the SPECIFICATION was not, and that is the part
   somebody has to build.

   One definition, imported by both callers. Two copies is how the four
   hard-coded AR badges happened. ---------------------------------------------- */

/** Coerces an untrusted dims array onto the piece's own slider grid. */
export function clampDims(p, dims) {
  return p.dims.map(([, standard], i) => {
    /* A FIXED dimension is never taken from input, whatever the input says.
       This is the enforcement point for the whole idea: without it a hash of
       #cfg=85x90x148 would still price and order an unbuildable office chair,
       because those values are inside the published band and no range check can
       reject them. */
    if (isFixedDim(p, i)) return standard;
    const b = dimBounds(standard);
    const raw = Array.isArray(dims) ? dims[i] : undefined;
    /* An ABSENT value is not a zero. Number(null), Number('') and Number(false)
       are all 0, which Number.isFinite() happily accepts — so a dims array of
       [null, null, null] used to clamp to the piece's MINIMUM rather than fall
       back to its published size. Only a real number or a numeric string counts
       as a value; anything else means "not supplied". */
    const n = typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '')
      ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return standard;
    const snapped = b.min + Math.round((n - b.min) / b.step) * b.step;
    return Math.min(b.max, Math.max(b.min, snapped));
  });
}

/** Coerces an untrusted tier index onto the piece's own ladder.
 *
 * ANYTHING OUT OF RANGE FALLS BACK TO THE BASE TIER — it does NOT clamp to the
 * top, and that asymmetry with clampDims() is deliberate. A dimension is a
 * continuum, so "9999cm" plausibly means "as large as this piece goes" and
 * clamping preserves the intent. A tier index is an enumeration: "m9" does not
 * mean "as expensive as possible", it means nothing, and resolving nothing into
 * the dearest material is a silent upsell off a mangled link.
 *
 * Base tier is also what defaultConfig() opens on, so an unreadable value lands
 * the visitor on the published specification — the same place a bad variant and
 * a bad dims array land them. */
export function clampMaterial(p, index) {
  const top = tiersFor(p).length - 1;
  const n = Math.floor(Number(index));
  return Number.isFinite(n) && n >= 0 && n <= top ? n : 0;
}

/** The configuration a piece opens on: exactly the published specification. */
export function defaultConfig(p) {
  const presets = addonsFor(p).filter((a) => a.preset).map((a) => a.key);
  return {
    dims: p.dims.map(([, value]) => value),
    material: 0,                                  /* index into the tier ladder */
    variant: p.variants[0] || null,
    addons: presets,
    qty: 1,
  };
}

/* ---- The two axes ------------------------------------------------------- */

/**
 * Size contribution, 0 at standard.
 *
 * Ratio of configured to standard bounding volume, raised to volumeExponent,
 * minus 1. Negative when the piece is smaller than listed.
 */
export function sizeNorm(p, dims) {
  const std = p.dims.reduce((v, [, value]) => v * value, 1);
  const cur = dims.reduce((v, value) => v * Math.max(1, value), 1);
  if (!std) return 0;
  return Math.pow(cur / std, PRICING.volumeExponent) - 1;
}

/** The material ladder for a piece. Falls back to hardwood if matGroup is
    missing, so a new piece added without one still prices rather than throwing. */
export function tiersFor(p) {
  return MATERIAL_TIERS[p.matGroup] || MATERIAL_TIERS.hardwood;
}

/** Material contribution, 0 at the base tier and 1 at the top. */
export function materialNorm(p, materialIndex) {
  const tiers = tiersFor(p);
  const tier = tiers[Math.min(tiers.length - 1, Math.max(0, materialIndex | 0))];
  return tier ? tier.level : 0;
}

/**
 * Where this configuration sits in the piece's band.
 * Clamped to [floor, 1]: the published maximum is the top of the band, and
 * add-ons — not size — are what take an order above it.
 *
 * MATERIAL SPANS THE WHOLE BAND WHEN SIZE CANNOT MOVE. PRICING.materialWeight is
 * 0.75 because "a top-tier material at standard size lands at 75% of the band —
 * you have to go larger as well to reach the quoted maximum". That reasoning
 * assumes going larger is possible. On the four office chairs every dimension is
 * fixed (gas lift, moulded frame, bought-in base), so 0.75 was the ceiling and
 * the published maximum became unreachable: the Brown Executive Chair advertised
 * ৳32,000–৳48,000 and could not be configured past ৳44,000.
 *
 * A band whose top no configuration can reach is not a band, so when no dimension
 * is variable the material axis carries all of it. The four affected pieces reach
 * their published maximum again at the top tier, which is what "max = the same
 * piece at the top material tier and larger dimensions" has to mean for a piece
 * that has no larger.
 *
 * The four beds sit at 90-91% because only headboard height moves. That is a
 * calibration question for the workshop, not a structural break, and it is
 * recorded as such in LOGIC-PLAN.md rather than papered over here.
 */
export function specLevel(p, config) {
  const s = sizeNorm(p, config.dims) * PRICING.sizeWeight;
  const materialWeight = variableDims(p) === 0 ? 1 : PRICING.materialWeight;
  const m = materialNorm(p, config.material) * materialWeight;
  return Math.min(1, Math.max(PRICING.floor, s + m));
}

/* ---- Add-ons ------------------------------------------------------------ */

/** Every add-on offered for a piece: its own, then the universal ones.
 *
 * `omitAddons` removes a UNIVERSAL add-on that genuinely does not apply — the
 * Mesh Highback Chair has no fabric and no timber, so "Fabric & timber protection
 * treatment" is not an option, it is a category error. Per-piece add-ons are
 * removed by deleting them from the piece's own list instead.
 */
export function addonsFor(p) {
  const omit = new Set(p.omitAddons || []);
  const keys = [...(p.addons || []), ...UNIVERSAL_ADDONS];
  return keys
    .filter((k) => ADDONS[k] && !omit.has(k))
    .map((k) => ({ key: k, ...ADDONS[k] }));
}

/**
 * Add-on total for a configuration.
 *
 * `base` is the configured price BEFORE add-ons, because percentage add-ons are
 * a share of the piece — a warranty on a ৳420,000 dining set is not the same
 * money as one on an ৳18,000 chair. Percentages deliberately do NOT compound
 * with each other: they all take their share of the same base.
 */
export function addonsTotal(p, config, base) {
  const offered = addonsFor(p);
  const chosen = new Set(config.addons || []);
  return offered.reduce((sum, a) => {
    if (!chosen.has(a.key)) return sum;
    return sum + (a.pct ? base * a.pct : (a.amount || 0));
  }, 0);
}

/* ---- Prices ------------------------------------------------------------- */

const roundTo = (n, to) => Math.round(n / to) * to;

/** Unit price with no add-ons — the piece itself at this specification.
    Rounded, because it is a figure the UI shows on its own. */
export function basePrice(p, config) {
  if (!p || !p.price) return 0;
  const { min, max } = p.price;
  return roundTo(min + (max - min) * specLevel(p, config), PRICING.roundTo);
}

/**
 * The estimated price of ONE unit at this configuration, add-ons included.
 *
 * ROUNDS ONCE, FROM THE SAME BASE THE UI PRINTS. This used to compute its own
 * UNROUNDED base and round the sum, while js/configurator.js printed the rounded
 * basePrice() and fed that to addonsTotal() — two different bases, one rounding.
 * The parts then failed to sum to the total on 10 of the 18 pieces, by up to
 * ৳250, in three numbers a customer reads in a single glance:
 *
 *   dining chair    18,000 + 10,700 = 28,700   headline said 28,500
 *   emerald bed     75,000 + 39,750 = 114,750  headline said 115,000
 *
 * Deriving the base from basePrice() makes the printed breakdown and the headline
 * arithmetically identical by construction rather than by luck. The rounding is
 * now applied to the base once and to the add-on total once, which is also the
 * honest reading of "estimates round to ৳500".
 *
 * _ref/check-rounding.mjs must report 0 of 18.
 *
 * @returns {number} BDT
 */
export function unitPrice(p, config) {
  if (!p || !p.price) return 0;
  return basePrice(p, config) + extrasPrice(p, config);
}

/**
 * The add-on total, rounded — the figure the UI prints as "in extras".
 *
 * Exported so there is exactly ONE definition. The configurator, the order
 * document and the tests all call this; a second `Math.round(x / 500) * 500`
 * anywhere is how the parts start disagreeing with the total again.
 */
export function extrasPrice(p, config) {
  if (!p || !p.price) return 0;
  return roundTo(addonsTotal(p, config, basePrice(p, config)), PRICING.roundTo);
}

/** unitPrice x quantity. */
export function lineTotal(p, config) {
  return unitPrice(p, config) * Math.max(1, config.qty || 1);
}

/**
 * Cart total.
 * @param {{piece:object, config:object}[]} lines
 */
export function cartTotal(lines) {
  return lines.reduce((sum, l) => sum + lineTotal(l.piece, l.config), 0);
}

/* ---- Human-readable summaries ------------------------------------------- */

/** "From ৳60,000" for grid cards — the published minimum, never a computed one. */
export const fromPrice = (p, lang) => {
  if (!p.price) return '';
  let isBn = lang === 'bn';
  if (!lang && typeof window !== 'undefined' && window.localStorage) {
    try { isBn = localStorage.getItem('hfm_lang') === 'bn'; } catch {}
  }
  return isBn ? `${taka(p.price.min, 'bn')} \u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1` : `From ${taka(p.price.min)}`;
};

/** "220 × 92 × 104 cm" for an arbitrary dims array. */
export const dimsText = (p, dims, lang) => {
  const isBn = lang === 'bn';
  const unit = (p.dims && p.dims[0] && p.dims[0][2]) || 'cm';
  const unitStr = isBn ? (unit === 'cm' ? 'সেমি' : unit === 'in' ? 'ইঞ্চি' : unit) : unit;
  const vals = dims.map((v) => isBn ? toBnDigits(Math.round(v)) : Math.round(v)).join(' \u00D7 ');
  return `${vals} ${unitStr}`;
};

/** True when nothing has been changed from the published specification.
 *
 * Compares the add-on SET against the default set. It used to filter presets out
 * and check the remainder was empty, which meant DESELECTING free Chattogram
 * delivery still read as standard: no money moved (amount: 0) but the order
 * document changed, and the Reset link stayed hidden while the UI implied
 * nothing had. Measured: isStandard(addons: []) returned true. */
export function isStandard(p, config) {
  const std = defaultConfig(p);
  const a = [...(config.addons || [])].sort().join(',');
  const b = [...std.addons].sort().join(',');
  return config.material === 0 &&
    config.dims.every((v, i) => v === std.dims[i]) &&
    a === b;
}

/**
 * One-line spec summary for the cart, the order email and the WhatsApp message.
 * Reads as a sentence rather than a data dump, because a human quotes from it.
 */
export function specSummary(p, config, lang) {
  const bits = [dimsText(p, config.dims, lang)];
  const tiers = tiersFor(p);
  const tier = tiers[Math.min(tiers.length - 1, Math.max(0, config.material | 0))];
  if (tier) bits.push(tierText(tier, lang).name);
  if (config.variant) bits.push(variantLabel(config.variant, lang));
  const extras = addonsFor(p)
    .filter((a) => (config.addons || []).includes(a.key))
    .map((a) => addonLabel(a, lang));
  if (extras.length) bits.push(extras.join('; '));
  return bits.join(' · ');
}

/* ==========================================================================
   THE ORDER DOCUMENT

   One function builds the human-readable order from cart lines, and both
   transports use it: the Web3Forms email body and the WhatsApp fallback. That
   is deliberate — two builders would drift, and then the workshop's inbox and
   its WhatsApp would describe the same order differently.

   It lives here rather than in data/pieces.js because it is derived from the
   pricing model, and here it can call unitPrice() and specSummary() directly.

   Written for the person READING it on a phone: numbered lines, quantity first,
   then the specification, then the money. Everything needed to quote the job
   without opening the site.
   ========================================================================== */

/**
 * @param {{piece:object, config:object}[]} lines
 * @param {{name?,phone?,address?,email?,notes?,ref?}} [customer]
 * @param {string} [lang]
 * @returns {string}
 */
export function buildOrderDocument(lines, customer = {}, lang = 'en') {
  const isBn = lang === 'bn';
  const out = [];
  const valid = lines.filter((l) => l && l.piece && l.piece.price);

  if (isBn) {
    if (customer.ref) out.push(`অর্ডার রেফারেন্স: ${customer.ref}`);
    out.push('Heaven Furniture Mart — নতুন অর্ডারের বিবরণ');
    out.push('');

    valid.forEach(({ piece: p, config }, i) => {
      const each = unitPrice(p, config);
      const qty = Math.max(1, config.qty || 1);
      const pieceName = pick(p, 'name', 'bn');
      const leadStr = (p.lead || '').replace('weeks', 'সপ্তাহ').replace('week', 'সপ্তাহ');
      out.push(`${toBnDigits(i + 1)}. ${toBnDigits(qty)} \u00D7 ${pieceName}`);
      out.push(`   ${specSummary(p, config, 'bn')}`);
      if (leadStr) out.push(`   প্রস্তুতি সময়: ${leadStr}`);
      out.push(qty > 1
        ? `   ${taka(each, 'bn')} প্রতি পিস = ${taka(each * qty, 'bn')}`
        : `   ${taka(each, 'bn')}`);
      out.push('');
    });

    const units = valid.reduce((n, l) => n + Math.max(1, l.config.qty || 1), 0);
    out.push(`মোট আসবাব: ${toBnDigits(units)}টি (ডিজাইন: ${toBnDigits(valid.length)}টি)`);
    out.push(`আনুমানিক মোট মূল্য: ${taka(cartTotal(valid), 'bn')}`);
    out.push('(উল্লেখিত স্পেসিফিকেশনের প্রাথমিক প্রাক্কলন — চূড়ান্ত ড্রয়িং ও অনুমোদনের পর প্রযোজ্য)');
    out.push('');

    out.push('গ্রাহকের বিবরণ');
    out.push(`নাম: ${customer.name || '—'}`);
    out.push(`ফোন: ${customer.phone || '—'}`);
    out.push(`ডেলিভারি ঠিকানা: ${customer.address || '—'}`);
    if (customer.email) out.push(`ইমেইল: ${customer.email}`);
    if (customer.notes) out.push(`বিশেষ নোট / পরামর্শ: ${customer.notes}`);

    return out.join('\n');
  }

  if (customer.ref) out.push(`Order ${customer.ref}`);
  out.push('New order from yourfirstsite.com');
  out.push('');

  valid.forEach(({ piece: p, config }, i) => {
    const each = unitPrice(p, config);
    const qty = Math.max(1, config.qty || 1);
    out.push(`${i + 1}. ${qty} \u00D7 ${p.name}`);
    out.push(`   ${specSummary(p, config)}`);
    out.push(`   Lead time: ${p.lead}`);
    /* Only show the unit price when it differs from the line total, otherwise it
       is the same number printed twice. */
    out.push(qty > 1
      ? `   ${taka(each)} each = ${taka(each * qty)}`
      : `   ${taka(each)}`);
    out.push('');
  });

  const units = valid.reduce((n, l) => n + Math.max(1, l.config.qty || 1), 0);
  out.push(`${units} ${units === 1 ? 'piece' : 'pieces'} across ` +
           `${valid.length} ${valid.length === 1 ? 'design' : 'designs'}`);
  out.push(`ESTIMATED TOTAL: ${taka(cartTotal(valid))}`);
  /* The site never quotes a final price, so the document must not read as one. */
  out.push('(Estimate for the specification above — confirm before production.)');
  out.push('');

  out.push('CUSTOMER');
  out.push(`Name: ${customer.name || '—'}`);
  out.push(`Phone: ${customer.phone || '—'}`);
  out.push(`Address: ${customer.address || '—'}`);
  if (customer.email) out.push(`Email: ${customer.email}`);
  if (customer.notes) out.push(`Notes: ${customer.notes}`);

  return out.join('\n');
}
