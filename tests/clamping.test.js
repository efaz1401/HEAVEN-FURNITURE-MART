/* Clamping — the URL hash and localStorage are the only inputs this site has,
   and both reach the order document the workshop builds from.

   Reproduced before these guards existed, with
   /piece/royal_gold_carved_dining_chair/#cfg=-50x9999x0,m9 :
   the panel printed "-50cm / 9999cm / 0cm" over sliders at their legal limits,
   no material radio was checked, and "-50 × 9999 × 0 cm · Solid Burma teak"
   went into the cart, the order email and the WhatsApp copy at ৳16,500. */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PIECES } from '../data/pieces.js';
import { dimBounds, clampDims, clampMaterial, tiersFor, defaultConfig, isFixedDim } from '../js/pricing.js';

const chair = PIECES.find((p) => p.id === 'royal_gold_carved_dining_chair');
/* All three dimensions variable, so it exercises clamping and nothing else. The
   dining chair's Height became a FIXED dimension (it follows the table it sits
   under), which is asserted separately in tests/logic.test.js. */
const cabinet = PIECES.find((p) => p.id === 'minimalist_black_gold_shoe_cabinet');

test('H2/H3 dimensions clamp onto the slider grid', () => {
  const bounds = cabinet.dims.map(([, s]) => dimBounds(s));
  assert.deepEqual(clampDims(cabinet, [9999, 9999, 9999]), bounds.map((b) => b.max));
  assert.deepEqual(clampDims(cabinet, [-50, -50, -50]), bounds.map((b) => b.min));
  assert.deepEqual(clampDims(cabinet, [-50, 9999, 0]),
    [bounds[0].min, bounds[1].max, bounds[2].min]);
  /* On a piece with a fixed axis the clamp applies to the others and the fixed
     one holds — the dining chair's height is set by the table. */
  const heightAt = chair.dims.findIndex(([l]) => l === 'Height');
  assert.ok(isFixedDim(chair, heightAt));
  assert.equal(clampDims(chair, [9999, 9999, 9999])[heightAt], chair.dims[heightAt][1]);
});

test('H5 off-step and non-numeric dimensions are snapped or replaced', () => {
  const std = defaultConfig(cabinet).dims;                    /* 100 x 35 x 120 */
  assert.deepEqual(clampDims(cabinet, [100.7, 35, 120]), [101, 35, 120]);
  assert.deepEqual(clampDims(cabinet, ['nonsense', null, undefined]), std);
  assert.deepEqual(clampDims(cabinet, 'not an array'), std);
  assert.deepEqual(clampDims(cabinet, []), std);
  assert.deepEqual(clampDims(cabinet, [NaN, Infinity, 120]), [std[0], std[1], 120]);
  /* Number(null), Number('') and Number(false) are all 0, which passes
     Number.isFinite — so an absent value used to clamp to the piece's MINIMUM
     instead of its published size. */
  assert.deepEqual(clampDims(cabinet, [null, '', false]), std);
  assert.deepEqual(clampDims(cabinet, [{}, [], () => {}]), std);
  assert.deepEqual(clampDims(cabinet, ['95', ' 40 ', '120']), [95, 40, 120]);
});

test('clamped dimensions never leave a piece outside its own bounds', () => {
  for (const p of PIECES) {
    for (const attempt of [[-1, -1, -1], [1e6, 1e6, 1e6], [0.5, 0.5, 0.5]]) {
      clampDims(p, attempt).forEach((v, i) => {
        const b = dimBounds(p.dims[i][1]);
        assert.ok(v >= b.min && v <= b.max, `${p.id} dim ${i} -> ${v}`);
        assert.equal((v - b.min) % b.step, 0, `${p.id} dim ${i} off-grid -> ${v}`);
      });
    }
  }
});

/* H4. Out of range falls back to the BASE tier, not the top: "m9" does not mean
   "as expensive as possible", and resolving nothing into the dearest material is
   a silent upsell off a mangled link. Deliberately asymmetric with clampDims,
   where a dimension is a continuum and clamping preserves intent. */
test('H4 an unusable material index falls back to the base tier', () => {
  for (const p of PIECES) {
    const top = tiersFor(p).length - 1;
    for (const i of [0, 1, top]) assert.equal(clampMaterial(p, i), i, `${p.id} m${i}`);
    for (const bad of [top + 1, 9, -1, NaN, Infinity, null, undefined, 'x', {}]) {
      assert.equal(clampMaterial(p, bad), 0, `${p.id} rejected value ${String(bad)}`);
    }
    assert.equal(clampMaterial(p, '1'), 1, `${p.id} numeric string`);
  }
});
