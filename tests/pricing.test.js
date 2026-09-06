/* Pricing model — pure unit tests. No browser, no server.
   js/pricing.js has no DOM and no storage, so Node imports it directly (that is
   what package.json's "type": "module" is for).

       node --test tests/

   Every case is parameterised over all 18 pieces, because a wrong constant is
   invisible in the UI and wrong on every page at once. */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PIECES, PRICING, ADDONS, taka } from '../data/pieces.js';
import {
  defaultConfig, dimBounds, clampDims, clampMaterial, tiersFor, addonsFor,
  basePrice, extrasPrice, unitPrice, lineTotal, cartTotal, specLevel,
  isStandard, specSummary, buildOrderDocument, fromPrice,
} from '../js/pricing.js';

const topTier = (p) => tiersFor(p).length - 1;
const atMax = (p) => p.dims.map(([, s]) => dimBounds(s).max);
const atMin = (p) => p.dims.map(([, s]) => dimBounds(s).min);

test('P1 the configurator opens on the published minimum', () => {
  for (const p of PIECES) {
    assert.equal(basePrice(p, defaultConfig(p)), p.price.min, p.id);
  }
});

test('P2 top material and all dimensions at max stays inside the band', () => {
  for (const p of PIECES) {
    const cfg = { ...defaultConfig(p), material: topTier(p), dims: atMax(p) };
    assert.ok(basePrice(p, cfg) <= p.price.max,
      `${p.id}: ${basePrice(p, cfg)} > ${p.price.max}`);
  }
});

test('P3 smaller than standard is cheaper, and floored', () => {
  for (const p of PIECES) {
    const cfg = { ...defaultConfig(p), material: 0, dims: atMin(p) };
    const floor = p.price.min + (p.price.max - p.price.min) * PRICING.floor;
    assert.ok(basePrice(p, cfg) < p.price.min, `${p.id} not cheaper than standard`);
    assert.ok(basePrice(p, cfg) >= floor - PRICING.roundTo, `${p.id} below the floor`);
  }
});

/* The documented regression: the printed breakdown ("X for the piece, Y in
   extras") stopped summing to the printed headline on 10 of 18 pieces, by up to
   ৳250. See the note at js/pricing.js:152-170. */
test('P4 base + extras always equals the printed unit price', () => {
  for (const p of PIECES) {
    for (const material of [0, 1, topTier(p)]) {
      for (const dims of [defaultConfig(p).dims, atMin(p), atMax(p)]) {
        const cfg = {
          ...defaultConfig(p), material, dims,
          addons: [...defaultConfig(p).addons, 'warranty', 'protection'],
        };
        assert.equal(basePrice(p, cfg) + extrasPrice(p, cfg), unitPrice(p, cfg),
          `${p.id} m${material} ${dims.join('x')}`);
      }
    }
  }
});

test('P5 every figure is a multiple of PRICING.roundTo', () => {
  for (const p of PIECES) {
    const cfg = { ...defaultConfig(p), material: 1, dims: atMax(p), addons: ['warranty'] };
    for (const n of [basePrice(p, cfg), extrasPrice(p, cfg), unitPrice(p, cfg)]) {
      assert.equal(n % PRICING.roundTo, 0, `${p.id}: ${n}`);
    }
  }
});

test('P6 line and cart totals multiply and sum', () => {
  const lines = PIECES.slice(0, 4).map((p, i) => ({
    piece: p, config: { ...defaultConfig(p), qty: i + 1 },
  }));
  for (const { piece, config } of lines) {
    assert.equal(lineTotal(piece, config), unitPrice(piece, config) * config.qty, piece.id);
  }
  assert.equal(cartTotal(lines),
    lines.reduce((sum, l) => sum + lineTotal(l.piece, l.config), 0));
});

/* isStandard used to filter presets out and check the remainder was empty, so
   DESELECTING free Chattogram delivery still read as standard: no money moved
   but the order document changed. js/pricing.js:211-217. */
test('P7 isStandard is true only at the published specification', () => {
  for (const p of PIECES) {
    const std = defaultConfig(p);
    assert.ok(isStandard(p, std), `${p.id} default is not standard`);
    assert.ok(!isStandard(p, { ...std, material: 1 }), `${p.id} material ignored`);
    assert.ok(!isStandard(p, { ...std, dims: atMax(p) }), `${p.id} dims ignored`);
    if (std.addons.length) {
      assert.ok(!isStandard(p, { ...std, addons: [] }),
        `${p.id}: deselecting a zero-cost preset still reads as standard`);
    }
  }
});

test('P8 money is formatted in lakh groups', () => {
  assert.equal(taka(18000), '৳18,000');
  assert.equal(taka(120000), '৳1,20,000');
  assert.equal(taka(3045000), '৳30,45,000');
  assert.equal(fromPrice(PIECES[0]), `From ${taka(PIECES[0].price.min)}`);
});

test('P9 percentage add-ons take a share of the same base, never compounding', () => {
  const p = PIECES.find((x) => (x.addons || []).includes('chairs2'));
  assert.ok(p, 'no piece offers chairs2');
  const cfg = { ...defaultConfig(p), addons: [...defaultConfig(p).addons, 'warranty', 'chairs2'] };
  const base = basePrice(p, cfg);
  const expected = base * (ADDONS.warranty.pct + ADDONS.chairs2.pct);
  assert.equal(extrasPrice(p, cfg), Math.round(expected / PRICING.roundTo) * PRICING.roundTo);
});

/* Regression for the Teal Velvet Bed: bounds used to snap to absolute multiples
   of the step, which put its 193cm standard width off the grid entirely. The
   browser then snapped the range input to 195 while the <output> still read
   193cm, and the customer could never get back to the published figure. */
test('P10 every standard dimension is reachable on its own slider', () => {
  for (const p of PIECES) {
    for (const [label, standard] of p.dims) {
      const b = dimBounds(standard);
      assert.equal(b.step, standard >= 150 ? 5 : 1, `${p.id} ${label} step`);
      assert.ok(standard >= b.min && standard <= b.max, `${p.id} ${label} out of bounds`);
      assert.equal((standard - b.min) % b.step, 0,
        `${p.id} ${label} ${standard} is off-grid on ${b.min}-${b.max} step ${b.step}`);
    }
  }
});
