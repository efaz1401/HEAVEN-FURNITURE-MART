/* Domain-logic invariants — the class of bug where the site's own copy
   contradicts what a piece is. Pure Node; the browser-side checks live in
   _ref/verify-logic.mjs.

       node --test tests/ */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PIECES, ADDONS, UNIVERSAL_ADDONS, MATERIAL_TIERS } from '../data/pieces.js';
import {
  addonsFor, clampDims, isFixedDim, variableDims, dimMode, dimBounds,
  basePrice, defaultConfig, tiersFor,
} from '../js/pricing.js';

/* This is the check that found it: the Mesh Highback Chair's materials list reads
   "Adjustable headrest" and "Polished aluminium base", and the configurator was
   selling both back to the customer for ৳4,800 and ৳6,200 — ৳11,000 of upgrades
   on the catalogue's cheapest piece. */
test('L2 no add-on sells a feature the piece already lists', () => {
  /* Words that carry the meaning of an add-on. Short and generic words are
     dropped so "additional", "treatment" and colour names cannot false-positive. */
  const STOP = new Set(['additional', 'matching', 'extended', 'removable', 'interior',
    'fitted', 'contrast', 'inset', 'polished', 'adjustable', 'installation', 'delivery',
    'protection', 'treatment', 'structural', 'warranty', 'upgrade', 'centre', 'panel']);
  for (const p of PIECES) {
    const copy = [...p.materials, p.tagline, p.desc].join(' ¶ ').toLowerCase();
    for (const a of addonsFor(p)) {
      const words = a.label.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/)
        .filter((w) => w.length > 4 && !STOP.has(w));
      const echoed = words.filter((w) => copy.includes(w));
      assert.ok(echoed.length < 2,
        `${p.name} is sold "${a.label}" but its own copy already says: ${echoed.join(', ')}`);
    }
  }
});

test('L4 protection is not offered where there is no fabric or timber', () => {
  const mesh = PIECES.find((p) => p.id === 'ergonomic_black_mesh_highback_chair');
  assert.ok(!addonsFor(mesh).some((a) => a.key === 'protection'),
    'the all-mesh chair must not be offered fabric & timber protection');
  /* Every other piece keeps it — the exclusion is one piece, not a new default. */
  const offered = PIECES.filter((p) => addonsFor(p).some((a) => a.key === 'protection'));
  assert.equal(offered.length, PIECES.length - 1);
});

test('omitAddons only ever names a universal add-on', () => {
  for (const p of PIECES) {
    for (const key of p.omitAddons || []) {
      assert.ok(ADDONS[key], `${p.id} omits unknown add-on ${key}`);
      assert.ok(UNIVERSAL_ADDONS.includes(key),
        `${p.id} omits ${key}, which is not universal — delete it from the piece's own addons instead`);
    }
  }
});

/* A gas-lift seat height is set by whoever sits in it; a bought-in five-star base
   comes in one size; every dining table in the catalogue is 78cm. The sliders
   used to offer a 156cm-tall office chair and price it at +৳12,000. */
test('L5 fixed dimensions cannot be moved by any input', () => {
  for (const p of PIECES) {
    const attempts = [
      p.dims.map(([, s], i) => dimBounds(s).max + (isFixedDim(p, i) ? 40 : 0)),
      p.dims.map(() => 9999),
      p.dims.map(() => -50),
      p.dims.map(() => 0),
    ];
    for (const attempt of attempts) {
      clampDims(p, attempt).forEach((v, i) => {
        if (isFixedDim(p, i)) {
          assert.equal(v, p.dims[i][1],
            `${p.name}: ${p.dims[i][0]} is fixed but input ${attempt[i]} produced ${v}`);
        }
      });
    }
  }
});

test('every fixed dimension explains itself to the customer', () => {
  for (const p of PIECES) {
    p.dims.forEach(([label], i) => {
      if (!isFixedDim(p, i)) return;
      const note = dimMode(p, i).note;
      assert.ok(note && note.length > 8,
        `${p.name}: ${label} is fixed with no note — a locked row with no reason reads as broken`);
    });
  }
});

test('the four office chairs offer no dimension at all', () => {
  const office = PIECES.filter((p) => p.cat === 'office');
  assert.equal(office.length, 4);
  for (const p of office) {
    assert.equal(variableDims(p), 0, `${p.name} still offers a dimension slider`);
  }
});

test('every dining table shares the same fixed height', () => {
  const tables = PIECES.filter((p) => /Dining Set/.test(p.name));
  assert.equal(tables.length, 3);
  for (const p of tables) {
    const i = p.dims.findIndex(([l]) => l === 'Height');
    assert.equal(p.dims[i][1], 78, `${p.name} is not 78cm high`);
    assert.ok(isFixedDim(p, i), `${p.name}'s height is still a slider`);
  }
});

/* A band whose top no configuration can reach is not a band. Locking every
   dimension on the office chairs capped them at 75% of their own published range
   until specLevel() let material span the whole band when size cannot move. */
test('the published maximum is reachable wherever no dimension moves', () => {
  for (const p of PIECES) {
    if (variableDims(p) !== 0) continue;
    const cfg = { ...defaultConfig(p), material: tiersFor(p).length - 1 };
    assert.equal(basePrice(p, cfg), p.price.max,
      `${p.name} cannot be configured up to its published ৳${p.price.max}`);
  }
});

/* Eleven of the eighteen ladder rungs were sold by the configurator and described
   nowhere on /materials/. The page now generates them, so this asserts the
   mechanism rather than the prose. */
test('L12 /materials/ generates its list from the material ladders', () => {
  const html = readMaterialsPage();
  assert.match(html, /import \{[^}]*MATERIAL_TIERS[^}]*\} from '\.\.\/data\/pieces\.js'/,
    '/materials/ no longer imports MATERIAL_TIERS — the upgrade ladders would go undescribed');
  assert.match(html, /id="mat-ladders"/, 'the ladder mount point is gone');
  assert.match(html, /id="mat-union"/, 'the materials union mount point is gone');
  for (const group of Object.keys(MATERIAL_TIERS)) {
    const used = PIECES.some((p) => p.matGroup === group);
    assert.ok(used, `MATERIAL_TIERS.${group} is offered to nobody — /materials/ would advertise a ladder no piece uses`);
  }
});

function readMaterialsPage() {
  return readFileSync(new URL('../materials/index.html', import.meta.url), 'utf8');
}
