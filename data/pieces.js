/* ==========================================================================
   Heaven Furniture Mart — single source of truth for all pieces.
   Every collection page, piece page, AR page and the order board read this.

   TWO FLAGS THAT MATTER:

   `hasModel` — true only where a .glb exists. Pieces without one are shown
   as photography and do NOT advertise AR, because claiming an AR badge on a
   piece that can't open AR is worse than not claiming it at all.

   `arVerified` — false everywhere at present. The GLB meshes are NOT
   normalised to the dimensions below (measured error 0.40x to 1.46x), so AR
   places furniture at the wrong real-world size. `dims` are the figures from
   the existing live site; they must be replaced with workshop measurements
   and the GLBs scaled to match. Until then every piece page shows a caveat.
   ========================================================================== */

export const CATEGORIES = [
  { slug: 'living-room', name: 'Living Room',      blurb: 'Carved sofa sets, bouclé sectionals and occasional seating.' },
  { slug: 'bedroom',     name: 'Bedroom',          blurb: 'Upholstered and panelled beds built to your mattress, not to a standard.' },
  { slug: 'dining',      name: 'Dining',           blurb: 'Marble-top tables, carved chairs and glass display showcases.' },
  { slug: 'office',      name: 'Office & Study',   blurb: 'Executive seating and study furniture built for long hours.' },
  { slug: 'bespoke',     name: 'Bespoke / Custom', blurb: 'Commissions drawn, carved and finished to your brief.' },
];

/* ==========================================================================
   FIXED DIMENSIONS

   A dimension can carry a fourth element describing how it may be specified.
   Without one it is a slider, which is the default and covers most of the
   catalogue. `{ fixed, note }` makes it a stated fact instead.

   THIS EXISTS BECAUSE THE SLIDERS WERE OFFERING SIZES NOBODY CAN BUILD. Every
   piece got three ±25% sliders regardless of what it is, so the configurator
   invited — and priced, and put in the order email — an 85cm-wide executive chair
   that will not fit under a desk, a 156cm-tall office chair taller than most
   adults, and a 58cm-high dining table. Measured: up to +৳16,000 for a chair the
   workshop cannot make.

   The clamp in js/pricing.js cannot catch these, because they are inside the
   published band. Only the data can say a dimension is not a variable.

   `note` is shown to the customer in place of the slider, so a locked row
   explains itself rather than looking like a missing control.
   ========================================================================== */

/** Seat height on a gas-lift chair is set by whoever sits in it. */
const FIXED_GASLIFT = { fixed: true, note: 'Adjusts on the gas lift' };
/** Moulded frames and bought-in five-star bases come in one size. */
const FIXED_FRAME = { fixed: true, note: 'Set by the frame and base' };
/** Every dining table in the catalogue is 78cm. That is not a coincidence. */
const FIXED_TABLE_H = { fixed: true, note: 'Standard dining height' };
/** A dining chair's height follows the table it sits under. */
const FIXED_CHAIR_H = { fixed: true, note: 'Set by the table it sits under' };
/** Bed frames are built to the customer's mattress, which the site cannot know.
    A slider here offered 143 / 148 / 153cm — no mattress is any of those. */
const FIXED_MATTRESS = { fixed: true, note: 'Built to your mattress — tell us the size' };

export const PIECES = [
  /* ---------------------------- LIVING ROOM ---------------------------- */
  {
    id: 'royal_blue_gold_luxury_sofa_pair',
    name: 'Royal Sofa Pair',
    cat: 'living-room',
    tagline: 'Hand-carved gilded frame, royal blue velvet.',
    desc: 'A matched set in the classical Chattogram idiom: solid hardwood frames hand-carved and gilded in our own workshop, then upholstered in deep royal blue velvet with woven damask seat panels. Supplied as a pair with armchairs and a mirrored coffee table, or singly.',
    materials: ['Seasoned mahogany frame', 'Hand-carved and gilded detail', 'Cotton-backed velvet', 'Woven damask panels'],
    dims: [['Width', 220, 'cm'], ['Depth', 92, 'cm'], ['Height', 104, 'cm']],
    variants: [],
    lead: '6–8 weeks', hasModel: true, arVerified: false,
    price: { min: 120000, max: 180000 }, matGroup: 'upholstery',
    addons: ['cushions', 'piping'],
    alt: 'Royal blue and gold hand-carved luxury sofa pair with matching armchairs and gilded coffee table',
  },
  {
    id: 'minimalist_cream_modular_sectional_sofa',
    name: 'Modular Sectional',
    cat: 'living-room',
    tagline: 'Bouclé modules you can rearrange. Four colourways.',
    desc: 'Our contemporary line. Three independent modules plus a chaise, upholstered in a chunky cream bouclé over a plinth base. Rearrange the modules as your room changes — there is no fixed left or right hand.',
    materials: ['Kiln-dried pine plinth', 'Chunky bouclé upholstery', 'Pocket-sprung seat units', 'Removable covers'],
    dims: [['Width', 280, 'cm'], ['Depth', 160, 'cm'], ['Height', 78, 'cm']],
    variants: ['Cream', 'Oat', 'Charcoal', 'Clay'],
    lead: '5–7 weeks', hasModel: true, arVerified: false,
    price: { min: 85000, max: 130000 }, matGroup: 'upholstery',
    addons: ['cushions', 'module'],
    alt: 'Minimalist cream bouclé modular sectional sofa with right-hand chaise',
  },
  {
    id: 'classic_wooden_cream_cushion_sofa_set',
    name: 'Classic Sofa Set',
    cat: 'living-room',
    tagline: 'Exposed carved hardwood with cream damask cushions.',
    desc: 'A five-piece set — two sofas, an armchair, a fretwork coffee table and a brass side table. The exposed frame shows the joinery rather than hiding it: pegged mortise-and-tenon throughout, with a carved crest on every back rail.',
    materials: ['Solid teak frame', 'Pegged mortise-and-tenon joints', 'Cream woven damask', 'Fretwork panel table'],
    dims: [['Width', 210, 'cm'], ['Depth', 85, 'cm'], ['Height', 95, 'cm']],
    variants: [],
    lead: '6–8 weeks', hasModel: false, arVerified: false,
    price: { min: 150000, max: 220000 }, matGroup: 'hardwood',
    addons: ['cushions', 'piping'],
    alt: 'Classic carved wooden sofa set with cream damask cushions and fretwork coffee table',
  },

  /* ------------------------------ BEDROOM ------------------------------ */
  {
    id: 'luxury_wooden_bed_teal_velvet_headboard',
    name: 'Teal Velvet Bed',
    cat: 'bedroom',
    tagline: 'Carved posts, gilded crest, velvet headboard. Three velvets.',
    desc: 'A four-post bed with turned and carved finials, a gilded acanthus crest and a velvet headboard panel. Built to your mattress rather than to a standard size, so the frame fits exactly.',
    materials: ['Solid mahogany posts', 'Gilded carved crest', 'Cotton-backed velvet panel', 'Slatted base'],
    dims: [['Width', 193, 'cm', FIXED_MATTRESS], ['Length', 215, 'cm', FIXED_MATTRESS], ['Headboard height', 130, 'cm']],
    variants: ['Teal Velvet', 'Charcoal Velvet', 'Blush Velvet'],
    lead: '7–9 weeks', hasModel: false, arVerified: false,
    price: { min: 90000, max: 140000 }, matGroup: 'upholstery',
    addons: ['bedside', 'drawers'],
    alt: 'Carved wooden four-post bed with teal velvet headboard and gilded crest',
  },
  {
    id: 'majesty_glame_emerald_green_velvet_bed',
    name: 'Emerald Bed',
    cat: 'bedroom',
    tagline: 'Channel-tufted emerald velvet with a wood-capped crest.',
    desc: 'The Majesty Glame. A channel-tufted emerald velvet headboard capped in dark polished hardwood, with a diamond-quilted footboard that reads as a bench from the foot of the bed. Our most requested contemporary bed.',
    materials: ['Channel-tufted velvet', 'Polished hardwood cap', 'Diamond-quilted footboard', 'Sprung slat base'],
    dims: [['Width', 200, 'cm', FIXED_MATTRESS], ['Length', 220, 'cm', FIXED_MATTRESS], ['Headboard height', 140, 'cm']],
    variants: [],
    lead: '6–8 weeks', hasModel: true, arVerified: false,
    price: { min: 75000, max: 115000 }, matGroup: 'upholstery',
    addons: ['bedside', 'drawers'],
    alt: 'Emerald green channel-tufted velvet bed with dark wood trim and quilted footboard',
  },
  {
    id: 'royal_navy_gold_velvet_bed',
    name: 'Navy & Gold State Bed',
    cat: 'bedroom',
    tagline: 'Buttoned navy velvet, silvered carving, fluted posts.',
    desc: 'A state bed with fluted and reeded posts, ball finials and a deep-buttoned navy velvet headboard centred on a silvered and gilded carved cresting. The heaviest frame we build.',
    materials: ['Solid hardwood fluted posts', 'Silver and gold leaf carving', 'Deep-buttoned navy velvet', 'Reinforced slat base'],
    dims: [['Width', 200, 'cm', FIXED_MATTRESS], ['Length', 220, 'cm', FIXED_MATTRESS], ['Headboard height', 165, 'cm']],
    variants: [],
    lead: '9–11 weeks', hasModel: false, arVerified: false,
    price: { min: 140000, max: 210000 }, matGroup: 'upholstery',
    addons: ['bedside', 'drawers'],
    alt: 'Navy velvet and gold state bed with fluted posts and silvered carved cresting',
  },
  {
    id: 'white_wooden_panel_bed',
    name: 'Panelled Bed',
    cat: 'bedroom',
    tagline: 'Dark cherry frame, fretwork inserts, linen headboard panel.',
    desc: 'A quieter bed. A dark cherry-finished frame with carved fretwork inserts either side of a channel-stitched linen headboard panel, and a solid panelled footboard. Reads traditional without the gilding.',
    materials: ['Cherry-finished hardwood', 'Carved fretwork inserts', 'Channel-stitched linen', 'Panelled footboard'],
    dims: [['Width', 180, 'cm', FIXED_MATTRESS], ['Length', 210, 'cm', FIXED_MATTRESS], ['Headboard height', 120, 'cm']],
    variants: [],
    lead: '5–7 weeks', hasModel: false, arVerified: false,
    price: { min: 60000, max: 95000 }, matGroup: 'hardwood',
    addons: ['bedside', 'drawers'],
    alt: 'Dark cherry panelled bed with linen headboard and carved fretwork inserts',
  },

  /* ------------------------------- DINING ------------------------------ */
  {
    id: 'royal_gold_carved_dining_chair',
    name: 'Carved Dining Chair',
    cat: 'dining',
    tagline: 'Gilded frame, oval back, hand-embroidered floral panel.',
    desc: 'A Louis-form armchair with a gilded and fluted frame, oval padded back and a hand-embroidered floral panel. The brass nailhead trim is set by hand, one stud at a time. Two finishes.',
    materials: ['Carved beech frame', 'Water-gilded gold finish', 'Hand-embroidered panel', 'Brass nailhead trim'],
    dims: [['Width', 52, 'cm'], ['Depth', 58, 'cm'], ['Height', 112, 'cm', FIXED_CHAIR_H]],
    variants: ['Gold on Ivory', 'Ivory on Ivory'],
    lead: '4–6 weeks', hasModel: true, arVerified: false,
    price: { min: 18000, max: 28000 }, matGroup: 'hardwood',
    addons: ['seatpad'],
    alt: 'Royal gold hand-carved dining armchair with floral embroidered oval back',
  },
  {
    id: 'carved_wooden_glass_display_showcase',
    name: 'Carved Showcase',
    cat: 'dining',
    tagline: 'Burl panels, pierced crown, gilded rope mouldings.',
    desc: 'A four-door vitrine in figured walnut with burl-matched door panels, twisted rope mouldings picked out in gold, and a pierced carved crown pediment. Glass shelves throughout; interior lighting optional.',
    materials: ['Figured walnut', 'Burl-matched panels', 'Gilded rope moulding', 'Toughened glass shelves'],
    dims: [['Width', 120, 'cm'], ['Depth', 45, 'cm'], ['Height', 190, 'cm']],
    variants: [],
    lead: '8–10 weeks', hasModel: true, arVerified: false,
    price: { min: 110000, max: 165000 }, matGroup: 'hardwood',
    addons: ['led', 'mirror'],
    alt: 'Hand-carved walnut and glass display showcase with gilded pierced crown',
  },
  {
    id: 'luxury_cream_gold_glass_showcase',
    name: 'Cream Gold Showcase',
    cat: 'dining',
    tagline: 'Arched centre bay in cream with gold-picked carving.',
    desc: 'A three-bay vitrine with a curved arched centre section, finished in hand-rubbed cream with the carved ornament picked out in gold. The glass on the centre bay is formed to the curve of the frame, not cut flat.',
    materials: ['Poplar and beech carcass', 'Hand-rubbed cream finish', 'Gold-picked carving', 'Curved toughened glass'],
    dims: [['Width', 110, 'cm'], ['Depth', 42, 'cm'], ['Height', 185, 'cm']],
    variants: [],
    lead: '8–10 weeks', hasModel: true, arVerified: false,
    price: { min: 95000, max: 145000 }, matGroup: 'hardwood',
    addons: ['led', 'mirror'],
    alt: 'Cream and gold three-bay glass display showcase with arched centre section',
  },
  {
    id: 'luxury_marble_dining_table_leather_chairs',
    name: 'Marble Dining Set · Six',
    cat: 'dining',
    tagline: 'Cream marble top, carved cabriole legs, oxblood leather chairs.',
    desc: 'A six-seat set. A cream marble top with a shaped and moulded edge over hand-carved cabriole legs, with six chairs in oxblood leather, brass nailhead trimmed and pierced-carved across the crest rail.',
    materials: ['Cream marble top', 'Carved cabriole hardwood legs', 'Oxblood bonded leather', 'Brass nailhead trim'],
    dims: [['Width', 180, 'cm'], ['Depth', 95, 'cm'], ['Height', 78, 'cm', FIXED_TABLE_H]],
    variants: [],
    lead: '7–9 weeks', hasModel: true, arVerified: false,
    price: { min: 160000, max: 240000 }, matGroup: 'stone',
    addons: ['chairs2', 'pads'],
    alt: 'Cream marble-top dining table with six oxblood leather carved dining chairs',
  },
  {
    id: 'luxury_cream_marble_dining_table_set',
    name: 'Ivory Marble Dining Set · Eight',
    cat: 'dining',
    tagline: 'Ivory and gold, carved crestings, floral seat panels.',
    desc: 'An eight-seat set in hand-rubbed ivory with gold-picked carving. Each chair carries a carved floral cresting above a shaped back panel, with woven floral seat upholstery. The table apron is carved in relief on all four sides.',
    materials: ['Ivory hand-rubbed finish', 'Gold-picked carved cresting', 'Marble top', 'Woven floral upholstery'],
    dims: [['Width', 200, 'cm'], ['Depth', 100, 'cm'], ['Height', 78, 'cm', FIXED_TABLE_H]],
    variants: [],
    lead: '9–11 weeks', hasModel: false, arVerified: false,
    price: { min: 220000, max: 320000 }, matGroup: 'stone',
    addons: ['chairs2', 'pads'],
    alt: 'Ivory and gold marble-top dining table set with eight carved floral chairs',
  },
  {
    id: 'luxury_carved_dining_table_cream_chairs',
    name: 'Gilt Dining Set · Eight',
    cat: 'dining',
    tagline: 'Full gilt frames, onyx-figured top, oval tapestry backs.',
    desc: 'Our most ornate dining set. Fully water-gilded frames, an onyx-figured stone top and eight oval-back chairs upholstered in a woven floral tapestry with brass nailhead trim. Built for a formal room.',
    materials: ['Water-gilded hardwood', 'Onyx-figured stone top', 'Woven floral tapestry', 'Brass nailhead trim'],
    dims: [['Width', 210, 'cm'], ['Depth', 105, 'cm'], ['Height', 78, 'cm', FIXED_TABLE_H]],
    variants: [],
    lead: '10–12 weeks', hasModel: false, arVerified: false,
    price: { min: 280000, max: 420000 }, matGroup: 'stone',
    addons: ['chairs2', 'pads', 'lazy'],
    alt: 'Fully gilded carved dining table set with eight oval tapestry-back cream chairs',
  },

  /* --------------------------- OFFICE & STUDY -------------------------- */
  {
    id: 'executive_brown_leather_tufted_chair',
    name: 'Executive Chair · Brown',
    cat: 'office',
    tagline: 'Diamond-tufted brown leather on a polished chrome base.',
    desc: 'A high-back executive chair in diamond-tufted brown leather with padded chrome-framed arms, gas lift and a five-star polished base. Three leather colours.',
    materials: ['Full-grain brown leather', 'Diamond button tufting', 'Polished chrome frame', 'Class-4 gas lift'],
    dims: [['Width', 68, 'cm', FIXED_FRAME], ['Depth', 72, 'cm', FIXED_FRAME], ['Height', 118, 'cm', FIXED_GASLIFT]],
    variants: ['Brown', 'Black', 'Oxblood'],
    lead: '3–4 weeks', hasModel: true, arVerified: false,
    price: { min: 32000, max: 48000 }, matGroup: 'leather',
    addons: ['headrest', 'alubase'],
    alt: 'Executive diamond-tufted brown leather office chair on polished chrome base',
  },
  {
    id: 'executive_black_leather_tufted_chair',
    name: 'Executive Chair · Black',
    cat: 'office',
    tagline: 'Buttoned black leather, contrast tan stitch.',
    desc: 'The same chassis as our brown executive chair, in black leather with a contrasting tan saddle stitch along every seam. Deep buttoned back, chrome-framed arms, five-star base.',
    materials: ['Full-grain black leather', 'Contrast tan saddle stitch', 'Polished chrome frame', 'Class-4 gas lift'],
    dims: [['Width', 68, 'cm', FIXED_FRAME], ['Depth', 72, 'cm', FIXED_FRAME], ['Height', 118, 'cm', FIXED_GASLIFT]],
    variants: [],
    lead: '3–4 weeks', hasModel: true, arVerified: false,
    price: { min: 30000, max: 46000 }, matGroup: 'leather',
    addons: ['headrest', 'alubase'],
    alt: 'Executive buttoned black leather office chair with contrast tan stitching',
  },
  {
    id: 'executive_black_padded_wood_chair',
    name: 'Director Chair · Wood Arm',
    cat: 'office',
    tagline: 'Channelled black leather with solid rosewood arm caps.',
    desc: 'A director-height chair with a channel-stitched black leather back, contrast tan topstitch and solid rosewood arm caps over polished chrome supports. The most traditional of our office line.',
    materials: ['Channelled black leather', 'Solid rosewood arm caps', 'Polished chrome supports', 'Class-4 gas lift'],
    dims: [['Width', 70, 'cm', FIXED_FRAME], ['Depth', 74, 'cm', FIXED_FRAME], ['Height', 122, 'cm', FIXED_GASLIFT]],
    variants: [],
    lead: '4–5 weeks', hasModel: false, arVerified: false,
    price: { min: 35000, max: 52000 }, matGroup: 'leather',
    addons: ['headrest', 'alubase'],
    alt: 'Black channelled leather director chair with rosewood arm caps and chrome base',
  },
  {
    id: 'ergonomic_black_mesh_highback_chair',
    name: 'Mesh Highback Chair',
    cat: 'office',
    tagline: 'Breathable mesh, adjustable headrest and lumbar.',
    desc: 'Our one concession to pure ergonomics. A tensioned black mesh back with independently adjustable headrest, height-and-depth adjustable arms and a synchro-tilt mechanism. For clients who sit for ten hours.',
    materials: ['Tensioned polyester mesh', 'Adjustable headrest', 'Synchro-tilt mechanism', 'Polished aluminium base'],
    dims: [['Width', 65, 'cm', FIXED_FRAME], ['Depth', 68, 'cm', FIXED_FRAME], ['Height', 125, 'cm', FIXED_GASLIFT]],
    variants: [],
    lead: '2–3 weeks', hasModel: false, arVerified: false,
    price: { min: 22000, max: 34000 }, matGroup: 'mesh',
    /* NO ADD-ONS OF ITS OWN, deliberately. This piece used to carry `headrest`
       and `alubase` like the other three office chairs — but its own materials
       list already reads "Adjustable headrest" and "Polished aluminium base", and
       its tagline says "adjustable headrest and lumbar". So the configurator was
       charging ৳4,800 and ৳6,200 for two features the page sells as standard:
       ৳11,000 of upgrades on the catalogue's cheapest piece.
       tests/logic.test.js now fails if any add-on's label reappears in the copy
       of a piece offering it. */
    addons: [],
    /* `protection` is "Fabric & timber protection treatment" and this chair is
       tensioned polyester on a polished aluminium base — there is no fabric and no
       timber on it to treat. It is the one piece in the catalogue where a
       UNIVERSAL add-on genuinely does not apply. */
    omitAddons: ['protection'],
    alt: 'Ergonomic black mesh high-back office chair with adjustable headrest',
  },

  /* ------------------------------ BESPOKE ------------------------------ */
  {
    id: 'minimalist_black_gold_shoe_cabinet',
    name: 'Black & Brass Cabinet',
    cat: 'bespoke',
    tagline: 'Matte black with brass. Built to your opening.',
    desc: 'Our bespoke line in its simplest form: a matte black lacquer carcass with a thin brass top edge, brass bar pulls and open shelving to one side. Drawn to your wall, your ceiling height and your storage.',
    materials: ['Matte black lacquer on MDF core', 'Solid brass hardware', 'Brass top edge trim', 'Soft-close runners'],
    dims: [['Width', 100, 'cm'], ['Depth', 35, 'cm'], ['Height', 120, 'cm']],
    variants: [],
    lead: '5–7 weeks', hasModel: true, arVerified: false,
    price: { min: 42000, max: 65000 }, matGroup: 'lacquer',
    addons: ['shelf', 'softclose'],
    alt: 'Minimalist matte black cabinet with brass handles and open shelving',
  },
];

/* ==========================================================================
   PRICING — estimates in BDT, driven by specification.

   Every piece carries `price: { min, max }` transcribed from the workshop's own
   price table. That range is NOT uncertainty; it is the SPEC BAND:

     min        the piece exactly as listed (standard size, base materials)
     max        the same piece at the top material tier and larger dimensions
     below min  a piece made smaller than standard, floored at -15%
     above max  add-ons, which sit on top of the band because a mirrored back
                or interior lighting genuinely is extra work

   Measured across all 18, the band is remarkably uniform — max/min runs 1.45x
   to 1.58x, mean 1.52x — which is why one model calibrates the whole catalogue
   without per-piece tuning. scripts/check-price-table.py re-derives that.

   USD figures were supplied alongside and are deliberately NOT stored: the site
   is BDT-only, so a second currency would be a value nothing reads and nobody
   maintains.

   THE PRICE IS AN ESTIMATE, EVERYWHERE. Pieces are made to order and quoted per
   commission, so the site says "estimated" and the checkout says the workshop
   confirms the final figure. That is both the honest position and the client's
   own wording. The maths lives in js/pricing.js; this file holds only numbers.
   ========================================================================== */

export const PRICING = {
  currency: 'BDT',
  symbol: '\u09F3',            /* ৳ BENGALI RUPEE SIGN */

  /* Dimension sliders travel this far either side of standard: a real bespoke
     range without offering a sofa that cannot be built. */
  sizeRange: 0.25,

  /* Bespoke furniture does not scale with volume. Doubling every dimension is
     8x the volume but nowhere near 8x the price, because cost tracks the frame,
     the joinery hours and the covered surface, not the air inside. 0.6 makes a
     single dimension behave roughly linearly:
       +25% width alone   ->  +14% of the band
       +25% on all three  ->  +55%, which with a material upgrade reaches max
     Tune this one number and the whole catalogue moves together. */
  volumeExponent: 0.6,

  /* How much of the band each axis can claim. Material 0.75 means a top-tier
     material at standard size lands at 75% of the band — you have to go larger
     as well to reach the quoted maximum, which is what that figure represents. */
  sizeWeight: 1.1,
  materialWeight: 0.75,

  /* Smaller than standard gets cheaper, but not indefinitely: the joinery hours
     barely move. */
  floor: -0.15,

  /* Estimates ending in odd taka read as false precision. */
  roundTo: 500,
};

/** "৳1,20,000" — LAKH grouping, which is how money is written in Bangladesh.

    This was 'en-US' and produced ৳120,000. The client's own price table is
    written that way, which is what the earlier comment justified itself with —
    but a spreadsheet's formatting is not the market's, and nobody in Chattogram
    writes four lakh twenty thousand as 420,000. It is also the most repeated
    string on the site.

    'en-IN' rather than 'bn-BD' for English: en-IN gives the correct lakh/crore
    grouping with Western digits. In Bengali mode (lang === 'bn'), bn-BD renders
    traditional Bengali numerals (৳১,২৫,০০০). */
export const taka = (n, lang) => {
  let isBn = lang === 'bn';
  if (!lang && typeof window !== 'undefined' && window.localStorage) {
    try { isBn = localStorage.getItem('hfm_lang') === 'bn'; } catch {}
  }
  return PRICING.symbol + Math.round(n).toLocaleString(isBn ? 'bn-BD' : 'en-IN');
};

/** Convert English numerals in a string or number to Bengali numerals */
export const toBnDigits = (n) => String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);



/* ---- Material ladders --------------------------------------------------
   Keyed by a piece's `matGroup`, which names the COST DRIVER rather than every
   material present: the Classic Sofa Set has damask cushions but its price
   moves with the exposed teak frame, so it is 'hardwood'.

   Three tiers each at 0 / 0.5 / 1 on the material axis. The first tier is the
   specification the listed minimum price buys, which is why it reads "As
   listed" — the configurator must open on it. */
export const MATERIAL_TIERS = {
  upholstery: [
    { name: 'Cotton-backed velvet', note: 'As listed', level: 0 },
    { name: 'Premium Italian velvet', note: 'Denser pile, better recovery', level: 0.5 },
    { name: 'Imported bouclé', note: 'Heaviest weight, longest wear', level: 1 },
  ],
  hardwood: [
    { name: 'Seasoned mahogany', note: 'As listed', level: 0 },
    { name: 'Figured walnut', note: 'Burl-matched panels', level: 0.5 },
    { name: 'Solid Burma teak', note: 'Densest grain, water resistant', level: 1 },
  ],
  leather: [
    { name: 'Bonded leather', note: 'As listed', level: 0 },
    { name: 'Full-grain leather', note: 'Ages rather than wears', level: 0.5 },
    { name: 'Aniline full-grain', note: 'Dyed through, no surface coat', level: 1 },
  ],
  stone: [
    { name: 'Cream marble', note: 'As listed', level: 0 },
    { name: 'Statuario marble', note: 'Whiter ground, grey veining', level: 0.5 },
    { name: 'Onyx-figured stone', note: 'Translucent, book-matched', level: 1 },
  ],
  mesh: [
    { name: 'Standard tensioned mesh', note: 'As listed', level: 0 },
    { name: 'Reinforced breathable mesh', note: 'Higher tension, less sag', level: 0.5 },
    { name: 'High-tensile Italian mesh', note: 'Holds tension for years', level: 1 },
  ],
  lacquer: [
    { name: 'Matte lacquer on MDF core', note: 'As listed', level: 0 },
    { name: 'Matte lacquer on ply core', note: 'Better screw retention', level: 0.5 },
    { name: 'Hand-rubbed lacquer on hardwood', note: 'Solid throughout', level: 1 },
  ],
};

/* ---- Add-ons ----------------------------------------------------------
   Each piece lists the keys that apply to it; UNIVERSAL_ADDONS are appended to
   every piece automatically.

   `pct` add-ons take a share of the configured unit price, which is the only
   sane way to price a warranty: a flat ৳6,000 is nothing on a ৳420,000 dining
   set and absurd on an ৳18,000 chair.

   `group` marks mutually exclusive options — the two delivery lines render as
   one choice, not two checkboxes a customer could both tick. `preset: true` is
   the one selected by default. */
export const ADDONS = {
  /* delivery — exactly one of these is always selected */
  delivery_ctg: { label: 'Delivery & installation — Chattogram city', amount: 0, group: 'delivery', preset: true },
  delivery_out: { label: 'Delivery & installation — outside Chattogram', amount: 4500, group: 'delivery' },
  /* universal extras */
  protection:   { label: 'Fabric & timber protection treatment', amount: 3500 },
  warranty:     { label: 'Extended 5-year structural warranty', pct: 0.05 },
  /* living room */
  cushions:     { label: 'Additional scatter cushions (pair)', amount: 2500 },
  piping:       { label: 'Contrast piping on all seams', amount: 3000 },
  module:       { label: 'One additional seat module', pct: 0.22 },
  /* bedroom */
  bedside:      { label: 'Matching bedside pair', amount: 16000 },
  drawers:      { label: 'Under-bed storage drawers', amount: 12000 },
  /* dining */
  seatpad:      { label: 'Removable seat pad in matching fabric', amount: 1800 },
  chairs2:      { label: 'Two additional chairs', pct: 0.18 },
  pads:         { label: 'Fitted felt table pads', amount: 4200 },
  lazy:         { label: 'Inset revolving centre (lazy susan)', amount: 9500 },
  /* showcases */
  led:          { label: 'Interior LED lighting, dimmable', amount: 7500 },
  mirror:       { label: 'Mirrored back panel', amount: 5500 },
  /* office */
  headrest:     { label: 'Adjustable headrest', amount: 4800 },
  alubase:      { label: 'Polished aluminium base upgrade', amount: 6200 },
  /* bespoke cabinet */
  shelf:        { label: 'Additional internal shelf', amount: 2200 },
  softclose:    { label: 'Soft-close on every door and drawer', amount: 3800 },
};

/** Appended to every piece's own `addons`, in this order. */
export const UNIVERSAL_ADDONS = ['delivery_ctg', 'delivery_out', 'protection', 'warranty'];

/* ---- Bengali: material tiers and add-ons -------------------------------------
   These two go together because both feed specSummary() in js/pricing.js, which
   is the single string shown in the cart, on the checkout, on /thanks/, inside
   the cash memo PDF and inside the WhatsApp order document. One untranslated
   tier name therefore appears in six places at once, which is why they are the
   first catalogue strings after the piece names.

   TIER_BN is keyed by the English name rather than by group+index: the same
   "As listed" note recurs across all six material groups, and keying by name
   means each string is written once and cannot drift between groups.
   --------------------------------------------------------------------------- */
export const TIER_BN = {
  'Cotton-backed velvet': { name: 'কটন-ব্যাকড ভেলভেট', note: 'তালিকাভুক্ত মান' },
  'Premium Italian velvet': { name: 'প্রিমিয়াম ইতালিয়ান ভেলভেট', note: 'ঘন পশম, দ্রুত ফিরে আসে' },
  'Imported bouclé': { name: 'আমদানি করা বুকলে', note: 'সবচেয়ে ভারী, সবচেয়ে টেকসই' },
  'Seasoned mahogany': { name: 'সিজনড মেহগনি', note: 'তালিকাভুক্ত মান' },
  'Figured walnut': { name: 'ফিগারড আখরোট কাঠ', note: 'বার্ল মিলিয়ে বসানো প্যানেল' },
  'Solid Burma teak': { name: 'খাঁটি বার্মা টিক', note: 'সবচেয়ে ঘন দানা, পানিতে টেকে' },
  'Bonded leather': { name: 'বন্ডেড চামড়া', note: 'তালিকাভুক্ত মান' },
  'Full-grain leather': { name: 'ফুল-গ্রেইন চামড়া', note: 'ক্ষয় না হয়ে বরং সুন্দর হয়' },
  'Aniline full-grain': { name: 'অ্যানিলিন ফুল-গ্রেইন', note: 'ভিতর পর্যন্ত রং, উপরে কোনো প্রলেপ নেই' },
  'Cream marble': { name: 'ক্রিম মার্বেল', note: 'তালিকাভুক্ত মান' },
  'Statuario marble': { name: 'স্ট্যাচুয়ারিও মার্বেল', note: 'সাদা জমিন, ধূসর শিরা' },
  'Onyx-figured stone': { name: 'অনিক্স নকশার পাথর', note: 'আলো ভেদ করে, মিলিয়ে কাটা' },
  'Standard tensioned mesh': { name: 'স্ট্যান্ডার্ড টেনশনড মেশ', note: 'তালিকাভুক্ত মান' },
  'Reinforced breathable mesh': { name: 'রিইনফোর্সড ব্রিদেবল মেশ', note: 'বেশি টান, কম ঝুলে পড়ে' },
  'High-tensile Italian mesh': { name: 'হাই-টেনসাইল ইতালিয়ান মেশ', note: 'বছরের পর বছর টান ধরে রাখে' },
  'Matte lacquer on MDF core': { name: 'এমডিএফ কোরে ম্যাট ল্যাকার', note: 'তালিকাভুক্ত মান' },
  'Matte lacquer on ply core': { name: 'প্লাই কোরে ম্যাট ল্যাকার', note: 'স্ক্রু বেশি শক্ত ধরে' },
  'Hand-rubbed lacquer on hardwood': { name: 'শক্ত কাঠে হাতে ঘষা ল্যাকার', note: 'ভিতর-বাইরে পুরো কাঠ' },
};

/** Add-on labels, keyed by the add-on's own key. */
export const ADDON_BN = {
  delivery_ctg: 'ডেলিভারি ও ইনস্টলেশন — চট্টগ্রাম শহরে',
  delivery_out: 'ডেলিভারি ও ইনস্টলেশন — চট্টগ্রামের বাইরে',
  protection: 'কাপড় ও কাঠের সুরক্ষা ট্রিটমেন্ট',
  warranty: 'বাড়তি ৫ বছরের স্ট্রাকচারাল ওয়ারেন্টি',
  cushions: 'বাড়তি কুশন (এক জোড়া)',
  piping: 'সব সেলাইয়ে কনট্রাস্ট পাইপিং',
  module: 'একটি বাড়তি আসনের মডিউল',
  bedside: 'সঙ্গে মিলিয়ে বেডসাইড টেবিল (জোড়া)',
  drawers: 'খাটের নিচে স্টোরেজ ড্রয়ার',
  seatpad: 'একই কাপড়ে খোলা যায় এমন সিট প্যাড',
  chairs2: 'দুটি বাড়তি চেয়ার',
  pads: 'টেবিলের মাপে ফেল্ট প্যাড',
  lazy: 'মাঝখানে ঘোরানো প্লেট (লেজি সুজান)',
  led: 'ভিতরে ডিমার সহ এলইডি আলো',
  mirror: 'পিছনে আয়নার প্যানেল',
  headrest: 'হেডরেস্ট, উঁচু-নিচু করা যায়',
  alubase: 'পালিশ করা অ্যালুমিনিয়াম বেস',
  shelf: 'ভিতরে একটি বাড়তি তাক',
  softclose: 'প্রতিটি দরজা ও ড্রয়ারে সফট-ক্লোজ',
};

/** Material tier name/note in the active language, falling back to English. */
export const tierText = (tier, lang) => {
  if (!tier) return { name: '', note: '' };
  const bn = lang === 'bn' ? TIER_BN[tier.name] : null;
  return { name: (bn && bn.name) || tier.name, note: (bn && bn.note) || tier.note };
};

/** Add-on label in the active language, falling back to English. */
export const addonLabel = (addon, lang) =>
  (lang === 'bn' && addon && ADDON_BN[addon.key]) || (addon ? addon.label : '');

/* Colourway names. DISPLAY ONLY — the English string stays the stored value in
   config.variant, because it is also the key into TINTS in js/piece.js (which
   drives the 3D recolouring) and it is what a workshop order has to say. */
export const VARIANT_BN = {
  'Cream': 'ক্রিম',
  'Oat': 'ওট',
  'Charcoal': 'চারকোল',
  'Clay': 'মেটে',
  'Teal Velvet': 'টিল ভেলভেট',
  'Charcoal Velvet': 'চারকোল ভেলভেট',
  'Blush Velvet': 'ব্লাশ ভেলভেট',
  'Gold on Ivory': 'আইভরির উপর সোনালি',
  'Ivory on Ivory': 'আইভরির উপর আইভরি',
  'Brown': 'বাদামি',
  'Black': 'কালো',
  'Oxblood': 'অক্সব্লাড',
};

/** Colourway label for display. Never use this as a key or a stored value. */
export const variantLabel = (name, lang) =>
  (lang === 'bn' && VARIANT_BN[name]) || name || '';

/* ---- Bengali catalogue copy -------------------------------------------------
   A SIDE MAP, not extra fields on each piece. Two reasons: the 18 piece objects
   stay the shape every test and every consumer already expects, and all the
   Bengali sits in one block that can be read and corrected as a whole instead of
   scattered across 700 lines.

   The copy is not a literal translation. "Bouclé modules you can rearrange"
   becomes "নিজের মতো সাজিয়ে নিন" — how somebody would actually say it — because
   a word-for-word rendering of English marketing copy reads like machine output,
   which is worse for trust than English would be.

   Anything absent here falls through to English via pick(). That is deliberate:
   a missing key must degrade to a real word, never to an empty string. Still to
   do, in rough order of how often a customer sees them: desc (long body copy on
   the piece pages), materials, alt.
   --------------------------------------------------------------------------- */
export const PIECE_BN = {
  royal_blue_gold_luxury_sofa_pair: {
    name: 'রয়্যাল সোফা সেট',
    tagline: 'হাতে খোদাই করা সোনালি ফ্রেম, রয়্যাল ব্লু ভেলভেট।',
    desc: 'চট্টগ্রামের ধ্রুপদী আভিজাত্যের স্মারক: আমাদের নিজস্ব কারখানায় খাঁটি মেহগনি কাঠ কেটে হাতে খোদাই ও সোনালি কারুকাজ করা ফ্রেম। গভীর রয়্যাল ব্লু ভেলভেট এবং ফুলতোলা ড্যামাস্ক সিট প্যানেলে মোড়ানো। একক বা জোড়া সোফা, মানানসই আর্মচেয়ার ও কারুকাজ করা কাচের কফি টেবিলসহ পুরো সেট অর্ডার করা যায়।',
    materials: ['সিজনড মেহগনি কাঠের মজবুত ফ্রেম', 'হাতে খোদাই করা ও সোনালি গিল্ডিং কাজ', 'কটন-ব্যাকড প্রিমিয়াম ভেলভেট', 'বোনা ড্যামাস্ক ফেব্রিক প্যানেল'],
    alt: 'রয়্যাল ব্লু ও সোনালি হাতে খোদাই করা বিলাসবহুল সোফা সেট ও মানানসই কফি টেবিল',
  },
  minimalist_cream_modular_sectional_sofa: {
    name: 'মডুলার সেকশনাল সোফা',
    tagline: 'বুকলে কাপড়ের মডিউল, নিজের মতো সাজিয়ে নিন। চারটি রঙ।',
    desc: 'আমাদের আধুনিক ধারা। তিনটি স্বাধীন মডিউল এবং একটি চেইজ লাউঞ্জ, যা প্লাইন্থ বেসের ওপর মোটা দানার ক্রিম বুকলে কাপড়ে মোড়ানো। ঘরের সুবিধা অনুযায়ী মডিউলগুলো যেকোনোভাবে সাজিয়ে নিতে পারেন — ডানে বা বাঁয়ে স্থায়ী কোনো বাধ্যবাধকতা নেই।',
    materials: ['কিলন-ড্রাইড পাইন কাঠের বেস', 'মোটা দানার বুকলে ফেব্রিক কভার', 'পকেট-স্প্রিং সিট ইউনিট', 'সহজে খোলা যায় এমন কভার'],
    alt: 'মিনিমালিস্ট ক্রিম বুকলে মডুলার সেকশনাল সোফা চেইজ লাউঞ্জসহ',
  },
  classic_wooden_cream_cushion_sofa_set: {
    name: 'ক্লাসিক কাঠের সোফা সেট',
    tagline: 'খোলা কারুকাজের শক্ত কাঠ, ক্রিম ড্যামাস্ক কুশন।',
    desc: 'পাঁচ পিসের পরিপূর্ণ সেট — দুটি সোফা, একটি আর্মচেয়ার, জালি কাজের কফি টেবিল ও ব্রাস সাইড টেবিল। নিরেট কাঠের খাঁজকাটা জোড়া ঢেকে না রেখে ফুটিয়ে তোলা হয়েছে: প্রতিটি জোড় ঐতিহ্যবাহী মর্টাইজ-টেননে বাঁধা এবং প্রতিটি পিঠের হাতলে নিখুঁত রাজকীয় মুকুট খোদাই করা।',
    materials: ['খাঁটি সেগুন কাঠের মজবুত ফ্রেম', 'কাঠের পিন ও মর্টাইজ-টেনন জোড়', 'ক্রিম ওভেন ড্যামাস্ক ফেব্রিক', 'জালি কাজের প্যানেল টেবিল'],
    alt: 'ক্লাসিক খোদাই করা কাঠের সোফা সেট ক্রিম কুশন ও জালি কাজের কফি টেবিলসহ',
  },
  luxury_wooden_bed_teal_velvet_headboard: {
    name: 'টিল ভেলভেট খাট',
    tagline: 'খোদাই করা পায়া, সোনালি মুকুট, ভেলভেট হেডবোর্ড। তিনটি ভেলভেট।',
    desc: 'চার কোনায় খোদাই করা কারুকার্যময় পিলার, মাথায় সোনালি অ্যাকান্থাস মুকুট এবং টিল ভেলভেট হেডবোর্ড প্যানেলে সাজানো খাট। নির্দিষ্ট কোনো বাঁধা মাপ নয়, বরং আপনার নিজস্ব তোশক ও গদির নিখুঁত মাপে এটি তৈরি করা হয়।',
    materials: ['সলিড মেহগনি কাঠের পিলার', 'সোনালি পাতার খোদাই করা মুকুট', 'কটন-ব্যাকড ভেলভেট প্যানেল', 'মজবুত কাঠের স্ল্যাট বেস'],
    alt: 'খোদাই করা চার পায়ার কাঠের খাট টিল ভেলভেট হেডবোর্ড ও সোনালি মুকুটসহ',
  },
  majesty_glame_emerald_green_velvet_bed: {
    name: 'এমারেল্ড ভেলভেট খাট',
    tagline: 'চ্যানেল-টাফটেড এমারেল্ড ভেলভেট, উপরে কাঠের কাজ।',
    desc: 'ম্যাজেস্টি গ্ল্যাম। চ্যানেল-টাফটেড এমারেল্ড ভেলভেট হেডবোর্ড যার শীর্ষে রয়েছে গাঢ় পালিশ করা কাঠের ক্যাপ, এবং খাটের পায়ের অংশে রয়েছে ডায়মন্ড-কুইল্টেড ফুটবোর্ড যা একটি সুন্দর বেঞ্চ হিসেবে ব্যবহার করা যায়। আমাদের সবচেয়ে জনপ্রিয় আধুনিক খাট।',
    materials: ['চ্যানেল-টাফটেড এমারেল্ড ভেলভেট', 'পালিশ করা কাঠের শক্ত ক্যাপ', 'ডায়মন্ড-কুইল্টেড বেঞ্চ ফুটবোর্ড', 'স্প্রিং স্ল্যাট সাপোর্ট বেস'],
    alt: 'এমারেল্ড গ্রিন চ্যানেল-টাফটেড ভেলভেট খাট ডার্ক উড ট্রিম ও ফুটবোর্ডসহ',
  },
  royal_navy_gold_velvet_bed: {
    name: 'নেভি ও গোল্ড রাজকীয় খাট',
    tagline: 'বাটন বসানো নেভি ভেলভেট, রুপালি কারুকাজ, খাঁজকাটা পায়া।',
    desc: 'একটি রাজকীয় স্টেট বেড — খাঁজকাটা ও খোদাই করা ভারী পিলার, গোলাকার ফিনিয়াল এবং বাটন-বসানো নেভি ভেলভেট হেডবোর্ড যার কেন্দ্রবিন্দুতে রয়েছে রুপালি ও সোনালি পাতার নিখুঁত কারুকাজ। আমাদের কারখানার তৈরি সবচেয়ে ভারী ও মজবুত খাটের ফ্রেম।',
    materials: ['খাঁজকাটা ভারী সলিড কাঠের পিলার', 'রুপালি ও সোনালি পাতার খোদাই নকশা', 'ডিপ-বাটন টাফটেড নেভি ভেলভেট', 'রিইনফোর্সড হেভি স্ল্যাট বেস'],
    alt: 'নেভি ভেলভেট ও সোনালি রাজকীয় খাট খোদাই করা মুকুট ও পিলারের নকশাসহ',
  },
  white_wooden_panel_bed: {
    name: 'প্যানেল খাট',
    tagline: 'গাঢ় চেরি কাঠের ফ্রেম, জালি কাজ, লিনেন হেডবোর্ড।',
    desc: 'একটি স্নিগ্ধ ও মার্জিত খাট। ডার্ক চেরি পালিশ করা ফ্রেম যার চ্যানেল-স্টিচড লিনেন হেডবোর্ডের দুপাশে সূক্ষ্ম জালি নকশার কাজ রয়েছে, সাথে রয়েছে নিরেট প্যানেলের ফুটবোর্ড। অতিরিক্ত চাকচিক্য ছাড়াই নিখুঁত আভিজাত্যের প্রকাশ।',
    materials: ['চেরি ফিনিশের শক্ত কাঠে তৈরি', 'হাতে খোদাই করা কাঠের জালি প্যানেল', 'চ্যানেল-স্টিচড প্রিমিয়াম লিনেন', 'সলিড কাঠের প্যানেল ফুটবোর্ড'],
    alt: 'ডার্ক চেরি প্যানেল খাট লিনেন হেডবোর্ড ও কাঠের জালি নকশাসহ',
  },
  royal_gold_carved_dining_chair: {
    name: 'কারুকাজ করা ডাইনিং চেয়ার',
    tagline: 'সোনালি ফ্রেম, ওভাল পিঠ, হাতে করা ফুলের নকশা।',
    desc: 'লুই-ধারার রাজকীয় আর্মচেয়ার — সোনালি ফ্রেম, খাঁজকাটা কারুকাজ, ওভাল নরম পিঠ এবং হাতে এমব্রয়ডারি করা ফুলের নকশা। চারপাশের ব্রাস নেইলহেড ট্রিম একজন দক্ষ কারিগর প্রতিটি পেরেক আলাদাভাবে হাতে বসিয়ে সম্পন্ন করেন। দুটি ফিনিশে পাওয়া যায়।',
    materials: ['খোদাই করা বিচ কাঠের ফ্রেম', 'ওয়াটার-গিল্ডেড সোনালি ফিনিশ', 'হাতে এমব্রয়ডারি করা ফুলের প্যানেল', 'খাঁটি ব্রাস নেইলহেড ট্রিম'],
    alt: 'রয়্যাল গোল্ড হাতে খোদাই করা ডাইনিং আর্মচেয়ার এমব্রয়ডারি করা পিঠসহ',
  },
  carved_wooden_glass_display_showcase: {
    name: 'কারুকাজ করা শোকেস',
    tagline: 'বার্ল কাঠের প্যানেল, খোদাই করা মুকুট, সোনালি রশির নকশা।',
    desc: 'চার দরজার সুবিশাল শোকেস — বার্ল প্যাটার্নের কাঠের পাল্লা, সোনালি রশির মতো বাঁকানো কাঠের বর্ডার এবং চূড়ায় নিখুঁত খোলা খোদাই করা রাজকীয় মুকুট। ভেতরে সম্পূর্ণ মজবুত কাচের তাক; চাইলে ভেতরে লাইটিং যুক্ত করার ব্যবস্থা রয়েছে।',
    materials: ['ফিগার্ড ওয়ালনাট কাঠের ফ্রেম', 'বার্ল-ম্যাচড নিখুঁত প্যানেল', 'সোনালি রশির নকশা করা মোল্ডিং', 'টাফেন্ড ভারী কাচের তাক'],
    alt: 'হাতে খোদাই করা ওয়ালনাট ও কাচের শোকেস সোনালি মুকুটসহ',
  },
  luxury_cream_gold_glass_showcase: {
    name: 'ক্রিম ও গোল্ড শোকেস',
    tagline: 'মাঝে খিলান, ক্রিম রঙে সোনালি কারুকাজ।',
    desc: 'তিন পাল্লার সুদৃশ্য শোকেস যার মাঝের অংশে রয়েছে রাজকীয় খিলান। হাতে পলিশ করা ক্রিম রঙের ওপর সোনালি নকশা ফুটিয়ে তোলা হয়েছে। মাঝের পাল্লার কাচটি ফ্রেমের সাথে মিলিয়ে নিখুঁতভাবে বাঁকানো, কোনো সোজা জোড়া নয়।',
    materials: ['পপলার ও বিচ কাঠের মূল কাঠামো', 'হাতে ঘষা ক্রিম রঙের স্মুথ ফিনিশ', 'সোনালি রঙে সাজানো খোদাই নকশা', 'বাঁকানো শক্ত কাচের পাল্লা'],
    alt: 'ক্রিম ও সোনালি তিন পাল্লার কাচের শোকেস মাঝের খিলানযুক্ত অংশসহ',
  },
  luxury_marble_dining_table_leather_chairs: {
    name: 'মার্বেল ডাইনিং সেট · ৬ আসন',
    tagline: 'ক্রিম মার্বেল টপ, খোদাই করা বাঁকা পায়া, অক্সব্লাড চামড়ার চেয়ার।',
    desc: 'ছয় আসনের ডাইনিং সেট। ক্রিম মার্বেলের টপ যার চারপাশ নিখুঁতভাবে কাটা ও ঢালু করা, নিচে রয়েছে হাতে খোদাই করা ক্লাসিক ক্যাব্রিওল পায়া। সাথে ছয়টি অক্সব্লাড চামড়ার চেয়ার, ব্রাস পিন বসানো এবং পিঠের ওপর সূক্ষ্ম খোদাই করা।',
    materials: ['প্রাকৃতিক ক্রিম মার্বেল টপ', 'হাতে খোদাই করা ক্যাব্রিওল কাঠের পায়া', 'অক্সব্লাড বন্ডেড চামড়া', 'ব্রাস নেইলহেড ট্রিম'],
    alt: 'ক্রিম মার্বেল টপ ডাইনিং টেবিল সাথে ছয়টি অক্সব্লাড চামড়ার খোদাই করা চেয়ার',
  },
  luxury_cream_marble_dining_table_set: {
    name: 'আইভরি মার্বেল ডাইনিং সেট · ৮ আসন',
    tagline: 'আইভরি ও সোনালি, খোদাই করা মুকুট, ফুল তোলা আসন।',
    desc: 'আট আসনের সুদৃশ্য ডাইনিং সেট — আইভরি রঙের ওপর সোনালি খোদাইয়ের কাজ। প্রতিটি চেয়ারের পিঠে রয়েছে কারুকাজ করা ফুলের মুকুট এবং ফুলতোলা বোনা ফেব্রিক সিট। টেবিলের চারপাশের ফ্রেমে রয়েছে গভীর খোদাই করা নকশা।',
    materials: ['হাতে ঘষা আইভরি মসৃণ ফিনিশ', 'সোনালি পাত বসানো ফুলের খোদাই', 'প্রাকৃতিক মার্বেল টপ', 'বোনা ফুলেল জ্যাকোয়ার্ড ফেব্রিক'],
    alt: 'আইভরি ও সোনালি মার্বেল টপ ডাইনিং টেবিল সেট সাথে আটটি ফুলতোলা চেয়ার',
  },
  luxury_carved_dining_table_cream_chairs: {
    name: 'গিল্ট ডাইনিং সেট · ৮ আসন',
    tagline: 'পুরো সোনালি ফ্রেম, অনিক্স নকশার টপ, ওভাল টেপেস্ট্রি পিঠ।',
    desc: 'আমাদের সবচেয়ে জমকালো ডাইনিং সেট। সম্পূর্ণ সোনালি গিল্ডেড ফ্রেম, অনিক্স পাথরের নিখুঁত নকশার টপ এবং আটটি ওভাল-পিঠের চেয়ার যাতে রয়েছে ঐতিহ্যবাহী টেপেস্ট্রি ফেব্রিক ও ব্রাস পিন ট্রিম। একটি আনুষ্ঠানিক রাজকীয় ডাইনিং রুমের জন্য তৈরি।',
    materials: ['ওয়াটার-গিল্ডেড সোনালি শক্ত কাঠ', 'অনিক্স প্যাটার্নের প্রাকৃতিক পাথরের টপ', 'বোনা ফুলের টেপেস্ট্রি ফেব্রিক', 'ব্রাস নেইলহেড ট্রিম'],
    alt: 'সম্পূর্ণ সোনালি খোদাই করা ডাইনিং টেবিল সেট সাথে আটটি ওভাল টেপেস্ট্রি চেয়ার',
  },
  executive_brown_leather_tufted_chair: {
    name: 'এক্সিকিউটিভ চেয়ার · বাদামি',
    tagline: 'ডায়মন্ড-টাফটেড বাদামি চামড়া, পালিশ করা ক্রোম বেস।',
    desc: 'ডায়মন্ড-টাফটেড বাদামি চামড়ায় তৈরি হাই-ব্যাক এক্সিকিউটিভ চেয়ার। ক্রোম ফ্রেমের নরম প্যাডেড হাতল, ক্লাস-৪ গ্যাস লিফট এবং পলিশ করা পাঁচ পায়ার বেস। তিনটি চামড়ার রঙে পাওয়া যায়।',
    materials: ['ফুল-গ্রেইন বাদামি চামড়া', 'ডায়মন্ড বাটন টাফটিং', 'পলিশ করা মজবুত ক্রোম ফ্রেম', 'ক্লাস-৪ হেভি গ্যাস লিফট'],
    alt: 'এক্সিকিউটিভ ডায়মন্ড-টাফটেড বাদামি চামড়ার অফিস চেয়ার ক্রোম বেসসহ',
  },
  executive_black_leather_tufted_chair: {
    name: 'এক্সিকিউটিভ চেয়ার · কালো',
    tagline: 'বাটন বসানো কালো চামড়া, বাদামি রঙের সেলাই।',
    desc: 'আমাদের বাদামি এক্সিকিউটিভ চেয়ারের মতো একই মজবুত কাঠামো, গভীর বাটন বসানো কালো চামড়া এবং প্রতিটি সেলাইয়ে বৈপরীত্য ফুটিয়ে তুলতে টান স্যাডল সেলাই। পাঁচ পায়ার ক্রোম বেস ও দীর্ঘস্থায়ী আরামদায়ক ব্যাকরেস্ট।',
    materials: ['ফুল-গ্রেইন কালো চামড়া', 'কন্ট্রাস্ট টান স্যাডল সেলাই', 'পলিশ করা মজবুত ক্রোম ফ্রেম', 'ক্লাস-৪ হেভি গ্যাস লিফট'],
    alt: 'এক্সিকিউটিভ বাটন বসানো কালো চামড়ার অফিস চেয়ার কনট্রাস্ট সেলাইসহ',
  },
  executive_black_padded_wood_chair: {
    name: 'ডিরেক্টর চেয়ার · কাঠের হাতল',
    tagline: 'চ্যানেল করা কালো চামড়া, শক্ত রোজউড কাঠের হাতল।',
    desc: 'ডিরেক্টর-উচ্চতার প্রিমিয়াম চেয়ার — চ্যানেল-স্টিচড কালো চামড়ার ব্যাকরেস্ট, কনট্রাস্ট সেলাই এবং পলিশ করা ক্রোম সাপোর্টের ওপর খাঁটি রোজউড কাঠের হাতলের ক্যাপ। আমাদের অফিস সংগ্রহের সবচেয়ে ক্লাসিক ও অভিজাত রূপ।',
    materials: ['চ্যানেল করা প্রিমিয়াম কালো চামড়া', 'সলিড রোজউড কাঠের হাতলের ক্যাপ', 'পলিশ করা ক্রোম সাপোর্ট ও বেস', 'ক্লাস-৪ স্মুথ গ্যাস লিফট'],
    alt: 'কালো চ্যানেলড চামড়ার ডিরেক্টর চেয়ার রোজউড কাঠের হাতল ও ক্রোম বেসসহ',
  },
  ergonomic_black_mesh_highback_chair: {
    name: 'মেশ হাইব্যাক চেয়ার',
    tagline: 'বাতাস চলাচলের মেশ, হেডরেস্ট ও কোমরের সাপোর্ট ঠিক করা যায়।',
    desc: 'আমাদের একমাত্র সম্পূর্ণ এর্গোনমিক চেয়ার। টেনশনযুক্ত কালো মেশ ব্যাক, আলাদাভাবে অ্যাডজাস্টেবল হেডরেস্ট, উচ্চতা ও গভীরতা পরিবর্তনযোগ্য হাতল এবং সিঙ্ক্রো-টিল্ট মেকানিজম। যারা দীর্ঘ ১০ ঘণ্টা বসে নিবিষ্ট মনে কাজ করেন তাদের জন্য।',
    materials: ['টেনশনযুক্ত ব্রিদেবল পলিয়েস্টার মেশ', 'অ্যাডজাস্টেবল হেডরেস্ট ও লাম্বার', 'সিঙ্ক্রো-টিল্ট অ্যাডভান্সড মেকানিজম', 'পলিশ করা অ্যালুমিনিয়াম পাঁচ পায়ার বেস'],
    alt: 'এর্গোনমিক কালো মেশ হাই-ব্যাক অফিস চেয়ার অ্যাডজাস্টেবল হেডরেস্টসহ',
  },
  minimalist_black_gold_shoe_cabinet: {
    name: 'কালো ও পিতলের ক্যাবিনেট',
    tagline: 'ম্যাট কালো ও পিতল। আপনার মাপে তৈরি।',
    desc: 'আমাদের কাস্টমাইজড আসবাবের অন্যতম সেরা রূপ: ম্যাট ব্ল্যাক ল্যাকার ফিনিশের মূল বডি, উপরে পাতলা ব্রাসের বর্ডার, সলিড ব্রাস পুল এবং একপাশে খোলা তাক। আপনার ঘরের দেয়ালের মাপ, ছাদের উচ্চতা ও প্রয়োজনীয়তা অনুযায়ী তৈরি।',
    materials: ['ম্যাট ব্ল্যাক ল্যাকার ফিনিশ', 'সলিড ব্রাস হ্যান্ডেল ও ফিটিংস', 'ব্রাস টপ এজ ট্রিম বর্ডার', 'সফট-ক্লোজ হিঞ্জ ও ড্রয়ার রানার'],
    alt: 'মিনিমালিস্ট ম্যাট ব্ল্যাক ক্যাবিনেট ব্রাস হ্যান্ডেল ও খোলা তাকে সাজানো',
  },
};

/** Dimension label translations for specs table. */
export const DIM_LABELS_BN = {
  Length: 'দৈর্ঘ্য',
  Width: 'প্রস্থ',
  Height: 'উচ্চতা',
  Depth: 'গভীরতা',
  'Seat Height': 'সিটের উচ্চতা',
  Diameter: 'ব্যাস',
};

/** Category blurbs, keyed by slug. Names already live in data/i18n.js as cat_*. */
export const CATEGORY_BN = {
  'living-room': 'খোদাই করা সোফা সেট, বুকলে সেকশনাল আর বসার আসন।',
  bedroom: 'গদির মাপে তৈরি খাট — কাপড়ে মোড়ানো বা প্যানেল করা, বাঁধা মাপে নয়।',
  dining: 'মার্বেল টপ টেবিল, খোদাই করা চেয়ার আর কাচের শোকেস।',
  office: 'লম্বা সময় বসার জন্য তৈরি এক্সিকিউটিভ চেয়ার ও পড়ার টেবিল।',
  bespoke: 'আপনার কথা শুনে আঁকা, খোদাই করা আর ফিনিশ করা কাজ।',
};

/**
 * Reads a catalogue field in the active language, falling back to English.
 *
 * Takes the language explicitly so it stays a pure function and the tests can
 * call it without a DOM. Callers that already know the language pass it; the
 * rest read currentLang() themselves — this module imports no i18n on purpose,
 * because data/pieces.js is imported by nearly every page and a cycle between
 * the two data modules would be a real problem.
 */
export const pick = (piece, field, lang) => {
  if (lang === 'bn' && piece && PIECE_BN[piece.id] && PIECE_BN[piece.id][field]) {
    return PIECE_BN[piece.id][field];
  }
  return piece ? piece[field] : undefined;
};

/** Category blurb in the active language. */
export const catBlurb = (slug, lang) => {
  if (lang === 'bn' && CATEGORY_BN[slug]) return CATEGORY_BN[slug];
  return (CATEGORIES.find((c) => c.slug === slug) || {}).blurb || '';
};

/* ---- Derived helpers ------------------------------------------------------ */
export const bySlug  = (id)   => PIECES.find((p) => p.id === id);
export const inCat   = (slug) => PIECES.filter((p) => p.cat === slug);
const CAT_BN = {
  'living-room': 'লিভিং রুম',
  'bedroom': 'বেডরুম',
  'dining': 'ডাইনিং',
  'office': 'অফিস ও স্টাডি',
  'bespoke': 'কাস্টম ও বেসপোক',
};
export const catName = (slug, lang) =>
  (lang === 'bn' && CAT_BN[slug]) || (CATEGORIES.find((c) => c.slug === slug) || {}).name || slug;
export const withAR  = ()     => PIECES.filter((p) => p.hasModel);

/** Formats dims as "220 × 92 × 104 cm" */
export const dimLine = (p) => p.dims.map((d) => d[1]).join(' × ') + ' ' + p.dims[0][2];

/** Business contact — single place to change it. */
export const WHATSAPP = '8801960481983';
export const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ORDERS_WHATSAPP USED TO BE A SECOND, DIFFERENT LINE, so the workshop could tell at
   a glance whether a message needed a quote or an answer. The company brief gives one
   number, so it now aliases WHATSAPP rather than holding its own digits — a second
   real line can be restored by changing this one value, and every order path already
   flows through orderWaLink(). */
export const ORDERS_WHATSAPP = WHATSAPP;
export const orderWaLink = (text) =>
  `https://wa.me/${ORDERS_WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ---- Web3Forms ---------------------------------------------------------
   The order endpoint. No backend: the checkout is a real <form> posting here,
   and Web3Forms emails the order to the address registered against this key.

   THE KEY IS PUBLIC BY DESIGN. It is not a secret like an API token — it only
   permits submitting to this one form, and Web3Forms requires it client-side
   (a server-side POST is rejected with "Use our API in client side"). It will be
   visible in the page source, which is how the product works. The consequence is
   that anyone could send junk submissions; the honeypot field and Web3Forms'
   own spam filtering are the mitigation, as with any contact form.

   Free tier is 250 submissions/month. At 90% and 100% Web3Forms warns, then
   REJECTS until the month resets — which is exactly what the WhatsApp fallback
   on the confirmation page exists for. */
export const WEB3FORMS_KEY = '8c3cd395-4c16-438f-805c-c50073ce2d3e';
export const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

/* Web3Forms uses the `email` field as the reply-to. Email is OPTIONAL at
   checkout — phone is the real contact channel here — so this stands in when a
   customer leaves it blank, rather than risking a rejected submission on an
   unverified requirement.

   DELIBERATELY NOT the public address below. This value is internal plumbing tied to
   the Web3Forms account and is never displayed; the destination inbox is configured
   in the Web3Forms dashboard, not here, so changing this string would not redirect a
   single order. Left exactly as the client asked. */
export const ORDERS_EMAIL_FALLBACK = 'heavenfurnituremart@gmail.com';

/* The address customers are given, from the company brief. Shown on /contact/ and in
   the footer; unrelated to the Web3Forms reply-to above. */
export const PUBLIC_EMAIL = 'heavenfurnituremart@gmail.com';

/* Where the business can be found, so the address exists in ONE place instead of the
   thirteen it used to be typed into. */
export const ADDRESS = {
  street: 'Agrabad Access Road',
  city: 'Chattogram',
  country: 'Bangladesh',
};

/* Real, dated achievements, replacing the invented "hand-carved since 1998" and the
   "28 years" the homepage computed from it. Five verifiable milestones read stronger
   than one fabricated number, and js/home.js renders them from here so the strip can
   never drift from this list. */
export const MILESTONES = [
  ['2020', 'Founded by Abul Kalam Bhuiyan'],
  ['2021', 'Agrabad showroom opened'],
  ['2024', 'International Furniture Fair, Chattogram'],
  ['2025', 'Member, Chamber of Commerce'],
  ['2026', 'Nationwide BFIOA recognition'],
];

/* The Managing Director, in his own words — the brief's strongest social proof, and
   the first person the site has ever named. */
export const MD = {
  name: 'Abul Kalam Bhuiyan',
  role: 'Managing Director',
  quote: 'At Heaven Furniture Mart, we believe furniture is more than just function; '
    + 'it is a reflection of lifestyle, taste, and comfort. Every piece we create is '
    + 'designed to bring lasting elegance into the homes of our clients.',
};

/* Heaven's own channels. The site carried no social links at all before this. */
export const SOCIAL = [
  ['Facebook', 'https://facebook.com/HeavenFurnitureMart'],
  ['Instagram', 'https://instagram.com/heaven_furniture_ltd'],
  ['YouTube', 'https://youtube.com/@HeavenFurnitureMart'],
];

/* Four Pillars of Craftsmanship — hard engineering specifications. */
export const CRAFT_PILLARS = [
  {
    id: 'moisture',
    index: '01',
    metric: '8–12%',
    specBadge: 'Digital Kiln Monitored',
    title: 'Kiln-Dried Moisture Control',
    subtitle: 'Zero Monsoon Swelling & Warping',
    desc: 'Every log is seasoned in digital kilns to strictly 8–12% equilibrium moisture content. Eliminates joint splitting and timber movement through Chattogram’s severe monsoon humidity cycles.',
    market: {
      metric: '22–32%',
      specBadge: 'Green Air-Dried Timber',
      title: 'Commercial Raw Timber',
      subtitle: 'Severe Seasonal Warping & Cracking',
      desc: 'Standard local workshops use unseasoned wet timber containing over 25% moisture. In dry winter months, wood shrinks violently, opening hairline cracks and loosening dovetail joints.',
    },
    svg: `<svg viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="pillar-svg" aria-hidden="true"><path d="M14 46 A 24 24 0 1 1 50 46" stroke-dasharray="2 3"/><path d="M22 42 A 18 18 0 0 1 38 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="32" cy="36" r="3.5" fill="currentColor"/><line x1="32" y1="36" x2="36" y2="21" stroke-width="2"/><circle cx="32" cy="20" r="1" fill="currentColor"/><path d="M28 50 h8 M32 46 v4" stroke-width="1.4"/></svg>`,
  },
  {
    id: 'warranty',
    index: '02',
    metric: '10-Year',
    specBadge: 'Direct Factory Covenant',
    title: 'Structural Integrity Warranty',
    subtitle: 'Written Workshop Guarantee',
    desc: 'Every solid Burma teak, mahogany, and Chittagong gamari frame is guaranteed against structural failure, frame loosening, or joinery displacement for ten full years.',
    market: {
      metric: '0–6 Mo',
      specBadge: 'Verbal Showroom Promise',
      title: 'Commercial Retail Policy',
      subtitle: 'No Written Structural Liability',
      desc: 'Commercial furniture outlets provide only verbal shop assurances or 30-day cosmetic coverage. Once frames sag or creak under daily load, the repair cost is borne entirely by the homeowner.',
    },
    svg: `<svg viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="pillar-svg" aria-hidden="true"><path d="M32 6 L40 10 L48 8 L52 16 L60 20 L58 29 L63 36 L57 43 L58 52 L49 53 L45 61 L36 58 L32 62 L28 58 L19 61 L15 53 L6 52 L7 43 L1 36 L6 29 L4 20 L12 16 L16 8 L24 10 Z"/><circle cx="32" cy="34" r="15" stroke-dasharray="3 2"/><path d="M26 31 v8 M24 33 l2 -2 M35 29 a 5 5 0 0 1 5 5 v2 a 5 5 0 0 1 -10 0 v-2 a 5 5 0 0 1 5 -5 z" stroke-width="1.8"/><path d="M22 52 L17 62 L26 58 L32 62" stroke-width="1.4"/><path d="M42 52 L47 62 L38 58 L32 62" stroke-width="1.4"/></svg>`,
  },
  {
    id: 'joinery',
    index: '03',
    metric: '100%',
    specBadge: 'Zero Staple Guns or Pins',
    title: 'Generational Interlocking Joinery',
    subtitle: 'Mortise, Tenon & Pegged Dovetails',
    desc: 'Crafted without staple guns or hollow particle boards. Load-bearing frames are joined with traditional interlocking mortise-and-tenon and hand-cut dovetail joints built to last decades.',
    market: {
      metric: 'Nails/Glue',
      specBadge: 'Pneumatic Staples & Particle',
      title: 'Commercial Surface Fasteners',
      subtitle: 'Air Nails & Low-Density Core',
      desc: 'Commercial mass production relies on pneumatic air-staplers, hidden MDF scrap blocks, and synthetic adhesive that shear apart when moved or subjected to heavy family use.',
    },
    svg: `<svg viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="pillar-svg" aria-hidden="true"><polygon points="32,8 54,19 32,30 10,19"/><polygon points="10,23 32,34 32,54 10,43"/><polygon points="54,23 54,43 32,54 32,34"/><path d="M26 16 l12 6 M26 21 l12 6" stroke-dasharray="1.5 2.5"/><circle cx="43" cy="38" r="2.5" fill="currentColor"/><line x1="43" y1="38" x2="43" y2="46"/></svg>`,
  },
  {
    id: 'finish',
    index: '04',
    metric: '7-Layer',
    specBadge: 'Multi-Stage Italian Micro-Barrier',
    title: 'Italian Polyurethane Barrier',
    subtitle: 'UV, Heat & Spill Resistance',
    desc: 'Multi-stage hand-sanded Italian polyurethane micro-coating resists tea spills, hot crockery, and ultraviolet fading while preserving the authentic natural grain and chatoyancy of raw hardwood.',
    market: {
      metric: '1–2 Coat',
      specBadge: 'Thin Solvent-Diluted Polish',
      title: 'Commercial Surface Polish',
      subtitle: 'Vulnerable to Heat Rings & Peeling',
      desc: 'Standard commercial furniture uses quick solvent-thinned lacquer washes. Hot tea cups leave irreversible milky-white rings, and sunlight causes patchy yellowing within months.',
    },
    svg: `<svg viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="pillar-svg" aria-hidden="true"><polygon points="32,8 56,19 32,30 8,19"/><path d="M8 24 L32 35 L56 24" stroke-width="1.4"/><path d="M8 29 L32 40 L56 29" stroke-width="1.4"/><path d="M8 34 L32 45 L56 34" stroke-width="1.4"/><polygon points="8,39 32,50 56,39 56,47 32,58 8,47"/><path d="M32 13 l-5 3.5 M37 13 l-5 3.5" stroke-width="1.2"/><path d="M22 6 L22 9 M42 6 L42 9" stroke-linecap="round"/></svg>`,
  },
];

/* Curated Chattogram Residence Case Studies — verified hyper-local architectural proof. */
export const CASE_STUDIES = [
  {
    id: 'catalganj',
    name: 'The Catalganj Promenade Villa',
    location: 'Avenue 4, Catalganj, Chattogram',
    room: 'Conservatory Banquet Hall & Credenza',
    species: 'Solid Brazilian Quartzite & Ancient Chittagong Teak',
    finish: 'Sienna Saddle Leather & Antiqued Bronze',
    lead: '12 Weeks Handcrafted',
    desc: 'Monolithic 12-seat quartzite banquet table on sculpted timber pedestals, paired with hand-stitched aniline leather dining armchairs and minimalist warm pendant fixtures.',
    img: 'assets/img/real/case-dining_640.webp',
    srcset: 'assets/img/real/case-dining_640.webp 640w, assets/img/real/case-dining_1200.webp 1200w',
  },
  {
    id: 'mehedibag',
    name: 'The Mehedibag Contour Atelier',
    location: 'Park Lane, Mehedibag, Chattogram',
    room: 'Rotunda Conversational Salon & Lounge',
    species: 'Quarter-Sawn Sil Koroi & Belgian Black Marble',
    finish: 'Seafoam Cashmere Velvet & Champagne Accents',
    lead: '9 Weeks Handcrafted',
    desc: 'Curvilinear sectional grouping tailored with multi-channel backrests and acoustic satin drapes, completed with a hand-planed black-lacquered coffee table featuring bookmatched brass inlay.',
    img: 'assets/img/real/room-set_640.webp',
    srcset: 'assets/img/real/room-set_640.webp 640w, assets/img/real/room-set_1267.webp 1267w',
  },
  {
    id: 'panchlaish',
    name: 'The Panchlaish Royal Pavilion',
    location: 'Diplomatic Enclave, Panchlaish, Chattogram',
    room: 'Grand Master State Chamber & Boudoir',
    species: 'Heritage Burma Teak & Burl Walnut Paneling',
    finish: 'Malachite Fluted Velvet & Burnished Gold Accents',
    lead: '14 Weeks Handcrafted',
    desc: 'Statement 8-foot wide fluted velvet state bed flanked by suspended asymmetric walnut bedside consoles, matched with a geometric diamond-quilted bench and warm ambient perimeter lighting.',
    img: 'assets/img/real/case-bed_640.webp',
    srcset: 'assets/img/real/case-bed_640.webp 640w, assets/img/real/case-bed_1200.webp 1200w',
  },
];

/* Interactive Timber & Budget Estimator Base Rates — calibrated directly from active catalogue pieces */
export const ESTIMATOR_RATES = {
  categories: [
    { id: 'living', name: 'Living Room (Sofas & Sectionals)', base: 92000, lead: '5–8 weeks' },
    { id: 'dining', name: 'Dining (Tables & Showcases)', base: 108000, lead: '6–8 weeks' },
    { id: 'bedroom', name: 'Bedroom (Master Beds)', base: 82000, lead: '5–7 weeks' },
    { id: 'office', name: 'Office & Study (Executive)', base: 34000, lead: '3–5 weeks' },
  ],
  woods: [
    { id: 'teak', name: 'Solid Burma Teak', mult: 1.30, badge: 'Heritage Hardwood' },
    { id: 'mahogany', name: 'Seasoned Mahogany', mult: 1.00, badge: 'Workshop Standard' },
    { id: 'walnut', name: 'Figured Walnut', mult: 1.18, badge: 'Burl Panels' },
    { id: 'marble', name: 'Italian Marble & Teak', mult: 1.40, badge: 'Stone & Timber' },
  ],
  finishes: [
    { id: 'velvet_std', name: 'Cotton-Backed Velvet', add: 0 },
    { id: 'velvet_prem', name: 'Premium Italian Velvet', add: 14000 },
    { id: 'leather', name: 'Full-Grain Leather', add: 20000 },
    { id: 'boucle', name: 'Imported Chunky Bouclé', add: 16000 },
  ],
};

/* Client Objection FAQs — transparent answers & Google Rich Snippets Schema */
export const FAQS = [
  {
    q: 'Do you offer complimentary in-home space measurement across Chattogram?',
    a: 'Yes. Our senior joiner and space measurement specialist visits your residence in Khulshi, Nasirabad, Agrabad, Panchlaish, Halishahar, or anywhere within Chattogram city limits with laser tools and material swatches at zero charge before you commit to any order.',
  },
  {
    q: 'How do you guarantee timber will not warp, crack, or attract borers in monsoon?',
    a: 'All logs undergo a strict industrial kiln-drying schedule down to 8–12% moisture content, followed by vacuum copper-naphthenate anti-termite treatment. We back this with a written 10-Year Structural Integrity Warranty Certificate on all solid hardwood frames.',
  },
  {
    q: 'Can you replicate custom luxury designs from Architectural Digest or Pinterest?',
    a: 'Absolutely. Over 60% of our workshop output consists of bespoke private commissions. Bring any photograph, magazine clipping, or architectural 3D rendering. We prepare precise 2D CAD shop drawings with verified human-scale ergonomics before wood cutting begins.',
  },
  {
    q: 'What is the production timeframe, and how is delivery and installation handled?',
    a: 'Bespoke crafting typically takes 2 to 12 weeks depending on carving complexity. Once completed, our own workshop logistics team delivers and installs your furniture inside your designated room anywhere in Chattogram at ৳0 extra cost.',
  },
];
