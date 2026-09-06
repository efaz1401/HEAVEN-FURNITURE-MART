/* ==========================================================================
   THE ORDER STORE — cart, customer details, last order.

   One module owns all three localStorage keys. Everything else (configurator,
   cart page, checkout, confirmation, the nav badge) reads through here, so the
   shapes are defined once and a private-mode failure is handled once.

   WHY A NEW KEY. The old board stored { id, variant, qty } — no configuration,
   because there were no prices to configure. A line now carries dimensions, a
   material tier and add-ons, which is a genuinely different shape, so this is
   `hfm-cart-v2` and the old key is MIGRATED on first read rather than
   discarded: an abandoned board becomes a cart at standard specification, which
   is exactly what those entries meant.

   LINE IDENTITY IS THE WHOLE CONFIGURATION. Two Carved Dining Chairs at 52cm in
   gilded beech are one line of two. The same chair 8cm wider is a different
   thing to build, so it is a different line. That is why addLine() compares a
   signature rather than just the id.

   Nothing here talks to a network. The cart lives on the visitor's device until
   the checkout submits it.
   ========================================================================== */

import { PIECES, bySlug } from '../data/pieces.js';
import { defaultConfig, clampDims, clampMaterial, addonsFor } from './pricing.js';

const CART_KEY     = 'hfm-cart-v2';
const LEGACY_KEY   = 'hfm-room-v1';
const CUSTOMER_KEY = 'hfm-customer-v1';
const LAST_KEY     = 'hfm-last-order-v1';

const MAX_QTY = 99;
const clampQty = (v) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(v)) || 1));

/* localStorage throws in private mode and when the origin has no storage
   access. Every read returns a usable default and every write is silent —
   a visitor with storage disabled gets a site that works minus persistence. */
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
};

/* ---- Config normalisation ----------------------------------------------
   A stored config is untrusted input: it may predate a field, or have been
   hand-edited, or belong to a piece whose dims have since changed. This coerces
   whatever is there into something the pricing model can safely consume.

   Dimensions and the material tier are clamped by js/pricing.js, which owns the
   slider grid and the material ladder, so the hash reader in
   js/configurator.js and this storage reader cannot disagree about what is
   legal. Before that, a hand-edited cart could carry dims like [-50, 9999, 0]
   straight into the order document. */
function normaliseConfig(p, raw = {}) {
  const std = defaultConfig(p);
  const offered = new Set(addonsFor(p).map((a) => a.key));
  return {
    dims: clampDims(p, raw.dims),
    material: clampMaterial(p, raw.material),
    /* A variant that no longer exists falls back to the first, not to null:
       null means "this piece has no variants", which would be a lie. */
    variant: p.variants.includes(raw.variant) ? raw.variant : (p.variants[0] || null),
    /* Add-ons are filtered against WHAT THIS PIECE OFFERS, not merely against
       being strings. Nothing ever priced or printed an unoffered key — addonsFor()
       gates both the money and specSummary() — but signature() hashes the raw
       list, so two lines differing only by a junk key opened as two visually
       identical cart rows. Dropping them here keeps line identity honest.
       It is also how a retired add-on leaves an old stored cart: after the Mesh
       Highback Chair stopped offering `headrest` and `alubase`, any cart that
       still held them now sheds them on read. */
    addons: Array.isArray(raw.addons)
      ? raw.addons.filter((k) => typeof k === 'string' && offered.has(k))
      : std.addons,
    qty: clampQty(raw.qty),
  };
}

/** Two lines are the same line when the piece and every choice match. */
export const signature = (id, config) => JSON.stringify([
  id, config.dims, config.material, config.variant, [...config.addons].sort(),
]);

/* ---- The cart ----------------------------------------------------------- */

/**
 * @returns {{id:string, config:object, piece:object}[]} valid lines only —
 * a piece removed from the catalogue is dropped here rather than breaking a
 * render or leaking a broken line into an order.
 */
export function readCart() {
  let raw = read(CART_KEY, null);

  if (raw === null) {
    /* Migrate the pre-pricing board, once. Its { id, variant, qty } records
       become standard-specification lines. */
    const legacy = read(LEGACY_KEY, []);
    if (Array.isArray(legacy) && legacy.length) {
      raw = legacy.map((it) => ({ id: it && it.id, config: { variant: it && it.variant, qty: it && it.qty } }));
      write(CART_KEY, raw);
    } else {
      raw = [];
    }
  }

  if (!Array.isArray(raw)) return [];
  return raw
    .map((line) => {
      const piece = line && typeof line.id === 'string' ? bySlug(line.id) : null;
      if (!piece) return null;
      return { id: piece.id, piece, config: normaliseConfig(piece, line.config) };
    })
    .filter(Boolean);
}

/** Persists lines, stripping the resolved `piece` so storage holds only data. */
export function writeCart(lines) {
  const ok = write(CART_KEY, lines.map(({ id, config }) => ({ id, config })));
  paintCartCount();
  return ok;
}

/**
 * Adds a configured piece. An identical configuration increments instead of
 * opening a second identical line — a customer tapping twice wants two.
 * @returns {number} the resulting quantity of that line
 */
export function addLine(id, config) {
  const piece = bySlug(id);
  if (!piece) return 0;
  const cfg = normaliseConfig(piece, config);
  const lines = readCart();
  const sig = signature(id, cfg);
  const at = lines.findIndex((l) => signature(l.id, l.config) === sig);

  if (at === -1) lines.push({ id, config: cfg, piece });
  else lines[at].config.qty = clampQty(lines[at].config.qty + cfg.qty);

  writeCart(lines);
  return at === -1 ? cfg.qty : lines[at].config.qty;
}

export function setQty(index, qty) {
  const lines = readCart();
  if (!lines[index]) return;
  lines[index].config.qty = clampQty(qty);
  writeCart(lines);
}

export function removeLine(index) {
  const lines = readCart();
  lines.splice(index, 1);
  writeCart(lines);
}

export function clearCart() {
  writeCart([]);
}

/** Units, not lines: a cart of one line at qty 3 shows 3. */
export const cartCount = () => readCart().reduce((n, l) => n + l.config.qty, 0);

/* ---- Customer details --------------------------------------------------
   Persisted so a returning customer never retypes. This is name, phone and
   address on someone's device, which is why forgetCustomer() exists and the
   checkout links to it. */
const CUSTOMER_FIELDS = ['name', 'phone', 'address', 'email', 'notes'];

/* THIS RECORD EXPIRES. It holds a name, a phone number and a full delivery
   address, and phones in this market are routinely shared within a household —
   so indefinite retention is the wrong default even with a "forget my details"
   link on the checkout. Thirty days is long enough to cover a return visit
   during a 4-12 week commission and short enough that a borrowed device does not
   keep someone's address forever.

   Enforced on READ rather than by a timer: a device that is never opened again
   never runs a timer, and a stale record must not survive being read. */
const CUSTOMER_TTL_DAYS = 30;
const CUSTOMER_TTL_MS = CUSTOMER_TTL_DAYS * 24 * 60 * 60 * 1000;

export function readCustomer() {
  const raw = read(CUSTOMER_KEY, {}) || {};
  const out = {};

  /* No timestamp means it predates the TTL, so treat it as expired rather than
     as fresh — the conservative reading for personal data. */
  const at = Number(raw.savedAt);
  if (!Number.isFinite(at) || Date.now() - at > CUSTOMER_TTL_MS) {
    if (raw && Object.keys(raw).length) forgetCustomer();
    CUSTOMER_FIELDS.forEach((k) => { out[k] = ''; });
    return out;
  }

  CUSTOMER_FIELDS.forEach((k) => { out[k] = typeof raw[k] === 'string' ? raw[k] : ''; });
  return out;
}

export function writeCustomer(data) {
  const out = { savedAt: Date.now() };
  CUSTOMER_FIELDS.forEach((k) => { out[k] = typeof data[k] === 'string' ? data[k].trim() : ''; });
  return write(CUSTOMER_KEY, out);
}

/** Exposed so the checkout can tell the visitor how long details are kept. */
export const customerTtlDays = () => CUSTOMER_TTL_DAYS;

export function forgetCustomer() {
  try { localStorage.removeItem(CUSTOMER_KEY); } catch { /* nothing to do */ }
}

/* ---- The last order ----------------------------------------------------
   Written just before the cart is cleared, so the confirmation page can show
   what was ordered without the cart still holding it. */
export const readLastOrder = () => read(LAST_KEY, null);
export const writeLastOrder = (order) => write(LAST_KEY, order);

/**
 * "HFM-4F2K9C" — short enough to read down a phone line, and derived from the
 * clock so two orders on the same device cannot collide.
 */
export function orderRef() {
  const t = Date.now().toString(36).slice(-4).toUpperCase();
  const r = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `HFM-${t}${r}`;
}

/* ---- The nav badge ----------------------------------------------------- */

/** Paints every [data-cart-count] on the page. Safe to call before the chrome
    exists; it simply finds nothing. */
export function paintCartCount() {
  const n = cartCount();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = n ? String(n) : '';
    el.hidden = !n;
  });
  /* aria-label, NOT textContent. The cart button holds an SVG and the badge
     span as children, and writing textContent would delete both — the same
     defect scrambleEl() had in js/menu.js. An attribute cannot flatten markup. */
  document.querySelectorAll('[data-cart-label]').forEach((el) => {
    el.setAttribute('aria-label', n === 0 ? 'Cart is empty'
      : `Cart, ${n} ${n === 1 ? 'piece' : 'pieces'}`);
  });
}

/* Another tab may have changed the cart — a piece page open beside the cart is
   the obvious case. Keep the badge honest without either page polling. */
addEventListener('storage', (e) => { if (e.key === CART_KEY) paintCartCount(); });

export { PIECES, CART_KEY };
