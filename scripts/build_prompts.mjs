import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/MSI/Downloads/website V8/ai-image-prompts';

const items = [
  {
    num: '01',
    file: '01_banner_reference_duplex_living.jpg',
    title: 'Minimalist Duplex Living & Floating Staircase (Hero Banner Reference)',
    cat: 'Living Room',
    materials: 'Cream textured linen, solid natural oak, bronze glass, brass branch chandelier',
    dims: 'Open-Concept Living & Dining Hall (approx 450 sq ft)',
    loc: 'Khulshi Executive Duplex, Chattogram',
    desc: 'Matches your uploaded reference banner showing the floating solid oak staircase with glass balustrade, bronze round glass coffee table, cream modular sofa, and open dining space.',
    mj: 'Editorial architectural photography of a contemporary open-concept luxury duplex living and dining room in Khulshi, Chattogram. In the foreground, a curved low-profile modular sectional sofa upholstered in warm cream oatmeal textured linen. Beside it, a round bronze-tinted reflective glass coffee table on delicate black wire legs over a plush hand-woven patterned rug. In the background, a floating solid oak staircase with frameless glass railing, an open kitchen with warm wood cabinetry, and a round wooden dining table surrounded by upholstered chairs under a modern brass branch globe chandelier. High ceilings with recessed architectural LED channel lighting, floor-to-ceiling glass windows showing lush greenery outside, Architectural Digest aesthetic, shot on Hasselblad H6D-100c, 35mm lens, f/4, morning natural sunlight, ultra-realistic 8k, photorealistic textures --ar 16:9 --style raw --v 6.1',
    flux: 'A modern luxury duplex penthouse living room in Khulshi Chattogram. Cream oatmeal bouclé modular sectional sofa, round bronze reflective glass coffee table with black wire base, floating solid oak stairs with glass railing, open kitchen with warm cabinetry, modern brass branch chandelier, morning sun pouring through floor-to-ceiling windows, photorealistic, 8k resolution, architectural interior photography.',
    dalle: 'High-end architectural photograph of a luxury duplex living room. Low-profile cream sectional sofa, bronze round glass coffee table on black geometric wire legs, floating wooden staircase with glass railing in background, brass globe chandelier, warm natural daylight, upscale modern interior.'
  },
  {
    num: '02',
    file: '02_minimalist_cream_modular_sectional.jpg',
    title: 'Minimalist Cream Modular Sectional Sofa',
    cat: 'Living Room',
    materials: 'Ivory textured bouclé / Belgian linen, solid oak subframe, high-density pocket coils',
    dims: 'W 280cm x D 170cm x H 78cm',
    loc: 'Nasirabad Heights Penthouse, Chattogram',
    desc: 'Real catalogue piece: low-profile modular seating in ivory cream textured bouclé with deep seats and organic rounded arms.',
    mj: 'Architectural Digest photography of a serene minimalist luxury living room in Nasirabad Heights, Chattogram. The central feature is a low-profile modular sectional sofa in textured ivory cream bouclé upholstery, with gentle curved contours and extra-deep seats. Centered in front is an organic fluted travertine stone coffee table with an art book and ceramic vase with olive branches. Floor-to-ceiling sheer linen drapery gently fluttering in the breeze, warm micro-cement walls, light herringbone oak wood floors, ambient 2700K indirect cove lighting, shot on Sony A7R V, 35mm GM lens, f/2.8, warm airy atmosphere, photorealistic 8k, ray traced reflections --ar 16:9 --style raw --v 6.1',
    flux: 'Serene minimalist luxury living room interior, ivory bouclé low-profile modular sectional sofa with organic curves, travertine fluted coffee table, sheer curtains diffusing soft morning sunlight, light oak herringbone floor, Architectural Digest styling, hyperrealistic 8k.',
    dalle: 'Photorealistic modern living room featuring a low-profile cream bouclé modular sectional sofa, travertine coffee table, sheer linen curtains, light hardwood floor, soft warm ambient lighting, upscale Scandinavian luxury.'
  },
  {
    num: '03',
    file: '03_majesty_glame_emerald_green_bed.jpg',
    title: 'Majesty Glame Emerald Green Velvet Bed',
    cat: 'Bedroom',
    materials: 'Channel-tufted cotton velvet, solid Burma teak cap molding, diamond-quilted footboard bench',
    dims: 'King: W 200cm x L 220cm x H 140cm',
    loc: 'Agrabad Heritage Duplex, Chattogram',
    desc: 'Real catalogue piece: iconic vertical channel-tufted emerald green velvet bed with dark polished hardwood crest and quilted footboard bench.',
    mj: 'Interior design editorial photography of a master bedroom suite in an upscale Agrabad duplex. The focal point is a king-size bespoke bed with an emerald green channel-tufted velvet headboard framed by dark polished teak wood molding, and a matching emerald green diamond-quilted footboard bench at the base. Crisp 1000-thread-count Egyptian cotton white bed linens with folded cognac silk accent throws. Flanking the bed are two floating dark walnut nightstands with fluted drawers and brushed brass designer pendant drop lights hanging from the ceiling. Dark chevron Burma teak hardwood flooring, soft warm cove ceiling lighting, rich moody luxury atmosphere, shot on Phase One IQ4 150MP, 50mm lens, f/2.8, cinematic depth of field, hyperrealistic texture detail --ar 16:9 --style raw --v 6.1',
    flux: 'Luxury master bedroom suite featuring a king bed with emerald green channel-tufted velvet headboard capped with dark polished teak trim, matching diamond-quilted footboard bench, crisp white linen, dark chevron teak flooring, brass hanging pendant lights, boutique hotel luxury, photorealistic 8k.',
    dalle: 'High-end bedroom interior photography of a king bed with emerald green velvet channel-tufted headboard with dark wood top trim, matching quilted velvet footboard bench, white luxury sheets, dark hardwood floor, warm ambient lighting.'
  },
  {
    num: '04',
    file: '04_royal_blue_gold_carved_sofa.jpg',
    title: 'Royal Blue & Gold Carved Luxury Sofa Pair',
    cat: 'Living Room',
    materials: 'Hand-carved solid mahogany, 24k water gold leaf gilding, royal navy blue velvet',
    dims: 'Sofa: W 225cm x D 95cm x H 105cm | Chair: W 90cm x D 85cm x H 108cm',
    loc: 'Chittagong VIP Estate Salon',
    desc: 'Real catalogue piece: rococo hand-carved gilded frame with floral cresting and deep button-tufted royal navy velvet upholstery.',
    mj: 'High-end interior photography of a palatial royal salon in a Chittagong private estate. Featuring a pair of hand-carved baroque luxury sofas upholstered in royal sapphire blue velvet with deep diamond button-tufting. The solid mahogany exposed frames are lavishly hand-carved with ornate acanthus scrolls, rococo shell crests, and gilded with authentic 24k water gold leaf finish. Centered with an ornate hand-carved gold leaf marble coffee table on an authentic Kashan silk rug over polished cream marble tiles. Ornate wainscoting panel walls, crystal wall sconces casting warm golden light, shot on Leica SL2, 28mm lens, f/5.6, architectural grandeur, 8k ultra-sharp --ar 16:9 --style raw --v 6.1',
    flux: 'Palatial formal salon featuring hand-carved ornate gold leaf luxury sofas with deep royal blue velvet button-tufted upholstery, gold carved marble-top center table, silk oriental rug, crystal chandeliers, classical neoclassical wainscoting, photorealistic 8k.',
    dalle: 'Luxury formal palace living room with ornate baroque gold-gilded sofas in royal blue tufted velvet, carved marble center table, crystal lighting, opulent classical interior.'
  },
  {
    num: '05',
    file: '05_luxury_marble_dining_table_leather_chairs.jpg',
    title: 'Monolithic Calacatta Marble Dining Ensemble',
    cat: 'Dining',
    materials: 'Monolithic Calacatta gold marble slab, twin walnut pedestal bases, saddle-stitched Italian leather',
    dims: 'Table: L 240cm x W 110cm x H 76cm (8–10 Seater)',
    loc: 'Khulshi Banquet Residence, Chattogram',
    desc: 'Real catalogue piece: solid white Calacatta marble slab with boat bevel edge, sculptural fluted bases, and bespoke saddle-stitched camel leather chairs.',
    mj: 'Architectural Digest photography of a formal banquet dining room in Khulshi Hill, Chattogram. A bespoke 8-seater rectangular dining table made of solid white Calacatta marble with bold grey and gold veining, bullnose edges, and twin sculptural dark walnut pedestal bases. Surrounded by bespoke dining chairs upholstered in saddle-stitched camel-tan Italian top-grain leather with dark hardwood legs. Set with fine bone china, smoked crystal glassware, and brushed brass flatware. Above hangs a linear sculptural brushed brass chandelier. Floor-to-ceiling glass sliding doors showing a private tropical garden terrace, morning diffused light, shot on Hasselblad H6D-100c, 50mm, f/4, photorealistic luxury --ar 16:9 --style raw --v 6.1',
    flux: 'Modern executive dining room with a rectangular Calacatta gold marble dining table on sculptural dark walnut pedestals, surrounded by camel-brown leather dining chairs with brass accents, linear brass chandelier, garden view windows, photorealistic 8k.',
    dalle: 'Luxury dining room featuring an 8-seater white marble dining table on twin wooden pedestal bases, caramel leather dining chairs, elegant brass chandelier, large windows with natural sunlight.'
  },
  {
    num: '06',
    file: '06_luxury_cream_marble_dining_table_set.jpg',
    title: 'Luxury Cream Botticino Marble Dining Table Set',
    cat: 'Dining',
    materials: 'Botticino cream marble, brass inlay edge, fluted cylindrical wood pedestals, cream nubuck chairs',
    dims: 'Table: L 220cm x W 100cm x H 76cm (6–8 Seater)',
    loc: 'Nasirabad Penthouse Dining Hall',
    desc: 'Real catalogue piece: soft rounded rectangular Botticino cream marble dining ensemble with fluted pedestals and curved nubuck chairs.',
    mj: 'Warm neoclassical luxury dining room in a high-rise penthouse. A rounded rectangular dining table featuring a polished cream Botticino marble top with subtle beige veins and brass edge inlay, resting on twin fluted conical wood pedestals. Surrounded by curved-back contemporary dining chairs upholstered in soft cream nubuck leather with satin brass legs. Above the table is an organic cluster of frosted blown-glass pendant lights. Soft alabaster walls with understated plaster moldings, large windows overlooking city skyline at dusk, shot on Sony A7R V, 40mm, f/3.2, golden hour lighting, cinematic warmth --ar 16:9 --style raw --v 6.1',
    flux: 'Neoclassical dining room with a rounded cream marble dining table on fluted pedestals with brass inlay, cream nubuck chairs with brass legs, frosted glass pendant chandelier, dusk city view, photorealistic 8k.',
    dalle: 'Elegant dining room with a cream marble dining table with rounded corners, fluted pedestals, cream upholstered chairs, modern glass pendant lights, warm sunset ambiance.'
  },
  {
    num: '07',
    file: '07_luxury_carved_dining_table_cream_chairs.jpg',
    title: 'Luxury Hand-Carved Burma Teak Dining Ensemble',
    cat: 'Dining',
    materials: '100% Solid Burma teak, hand-carved baroque aprons, carved trestle pedestals, cream damask',
    dims: 'Table: L 240cm x W 110cm x H 76cm (8 Seater)',
    loc: 'Agrabad Old-Money Heritage Estate',
    desc: 'Real catalogue piece: heritage solid Burma teak dining table with baroque carved apron, double pedestal base, and high-back cream damask chairs.',
    mj: 'Aristocratic heritage dining hall photography in an old-money Chittagong family residence. A heavy solid Burma teak 8-seater dining table with deep hand-carved floral baroque aprons and two monumental carved lion-paw pedestal trestles, hand-finished in rich warm walnut beeswax polish. Paired with 8 stately high-back chairs upholstered in rich cream floral woven damask with brass nailhead trim. In the background, a matching teak sideboard credenza. Warm crystal chandelier illuminating the table, Persian wool runner rug on polished teak parquet flooring, shot on Hasselblad 50mm, f/4.5, authentic heirloom craftsmanship --ar 16:9 --style raw --v 6.1',
    flux: 'Heirloom handcrafted dining room with solid carved Burma teak dining table on double pedestals, cream damask high-back chairs with brass studs, crystal chandelier, matching teak credenza, warm aristocratic atmosphere, 8k photorealistic.',
    dalle: 'Traditional luxury dining room featuring a hand-carved dark wood dining table, 8 cream damask upholstered chairs with brass studs, crystal chandelier, classic wooden flooring.'
  },
  {
    num: '08',
    file: '08_royal_navy_gold_velvet_bed.jpg',
    title: 'Royal Navy & Gold Velvet State Bed',
    cat: 'Bedroom',
    materials: 'Solid hardwood fluted posts, silver and 24k gold leaf carving, deep-buttoned navy velvet',
    dims: 'King: W 200cm x L 220cm x H 165cm',
    loc: 'Panchlaish Presidential Suite',
    desc: 'Real catalogue piece: monumental state bed with fluted reeded posts, silvered and gilded cresting, and deep-buttoned navy velvet headboard.',
    mj: 'Editorial photography of a majestic presidential master bedroom. A custom royal state bed with four fluted and reeded hardwood posts crowned with acorn finials, a monumental hand-carved baroque headboard cresting finished in water-gilded 24k gold leaf, and deep button-tufted royal navy blue velvet upholstery. Dressed in sumptuous ivory satin bed sheets, silk throw pillows, and folded gold damask runner. Two matching carved gilded nightstands with crystal lamps. Neoclassical wall moldings in soft warm grey, dark hardwood flooring with a hand-spun silk rug, shot on Phase One IQ4 150MP, 45mm lens, f/2.8, royal palace elegance, ultra-high resolution --ar 16:9 --style raw --v 6.1',
    flux: 'Presidential master bedroom suite with a grand four-post state bed, gold carved cresting, deep navy velvet tufted headboard, ivory satin bedding, carved gold nightstands, crystal lamps, luxury palace interior, 8k photorealistic.',
    dalle: 'Royal master bedroom featuring a grand four-poster bed with carved gold leaf crest and navy blue tufted velvet headboard, matching nightstands, ornate classical decor.'
  },
  {
    num: '09',
    file: '09_luxury_wooden_bed_teal_velvet_headboard.jpg',
    title: 'Luxury Wooden Bed with Teal Velvet Headboard',
    cat: 'Bedroom',
    materials: 'Seasoned American walnut / mahogany frame, curved peacock teal velvet padded headboard',
    dims: 'King: W 195cm x L 215cm x H 135cm',
    loc: 'Khulshi Contemporary Residence',
    desc: 'Real catalogue piece: clean architectural dark wood frame with tall curved headboard upholstered in plush peacock teal velvet.',
    mj: 'Modern contemporary bedroom in a luxury high-rise condominium in Nasirabad. A king-size platform bed made of rich dark American walnut with clean tapered legs, featuring a tall curved arched headboard upholstered in plush peacock teal blue velvet with delicate self-piping trim. Styled with crisp white linen duvet, textured waffle throw, and charcoal linen cushions. Minimalist floating walnut bedside tables with modern minimalist ceramic reading lamps. Soft morning daylight pouring through sheer curtains, light beige limewash walls, shot on Canon EOS R5, 50mm lens, f/2.2, soft bokeh, Architectural Digest Scandinavian style --ar 16:9 --style raw --v 6.1',
    flux: 'Contemporary bedroom with dark walnut platform bed, arched peacock teal velvet padded headboard, floating walnut bedside tables, white linen duvet, sheer sunlight, limewash walls, photorealistic 8k.',
    dalle: 'Modern master bedroom featuring a dark wood bed with a curved teal velvet upholstered headboard, floating wood nightstands, white bedding, natural morning sunlight.'
  },
  {
    num: '10',
    file: '10_white_wooden_panel_bed.jpg',
    title: 'Dark Cherry & Linen Panelled Bed',
    cat: 'Bedroom',
    materials: 'Cherry-finished hardwood, hand-carved fretwork inserts, channel-stitched natural flax linen',
    dims: 'King: W 180cm x L 210cm x H 120cm',
    loc: 'Halishahar Executive Villa',
    desc: 'Real catalogue piece: dark cherry frame with carved geometric fretwork inserts flanking a channel-stitched natural linen headboard panel.',
    mj: 'Serene transitional master bedroom interior photography. A custom artisan-crafted king bed frame in deep cherry-stained mahogany, featuring intricate hand-carved fretwork geometric wood panels flanking a centered channel-stitched oatmeal natural linen upholstered headboard, with a solid panelled wooden footboard. Styled with washed Belgian linen bedding in slate and cream. Matching cherry three-drawer nightstands. Warm sunlight filtering through plantation shutters onto warm wide-plank oak flooring, tranquil upscale resort aesthetic, shot on Hasselblad 45mm, f/4, photorealistic wood grain textures --ar 16:9 --style raw --v 6.1',
    flux: 'Transitional master bedroom with dark cherry wood bed frame, fretwork geometric panels flanking a natural linen channel-stitched headboard, linen sheets, plantation shutters, oak floor, photorealistic 8k.',
    dalle: 'Warm master bedroom with dark cherry wood bed featuring carved fretwork side panels and a beige linen padded headboard, wooden nightstands, soft natural lighting.'
  },
  {
    num: '11',
    file: '11_royal_gold_carved_dining_chair.jpg',
    title: 'Royal Gold Hand-Carved Dining Armchair',
    cat: 'Dining',
    materials: 'Hand-carved beechwood, 24k water-gilded gold leaf, floral embroidered tapestry, brass nailheads',
    dims: 'W 52cm x D 58cm x H 112cm',
    loc: 'Masterpiece Atelier Feature',
    desc: 'Real catalogue piece: Louis-form armchair with gilded and fluted frame, oval padded medallion back with floral embroidery and individual brass nailheads.',
    mj: 'Close-up hero commercial product photography of a master-crafted Louis XVI style dining armchair. The frame is hand-carved solid hardwood with intricate fluted legs and acanthus ribbons, finished in authentic antique water-gilded 24k gold leaf. The oval medallion back and thick cushioned seat are upholstered in cream silk with hand-embroidered botanical floral tapestry, bordered by individual antique brass nailhead studs. Placed on an opulent polished cream marble floor beside a sheer silk drapery, warm studio rim lighting highlighting the gold leaf texture and fabric weaves, shot on Hasselblad H6D-100c, 85mm macro lens, f/2.8, luxury craftsmanship catalog standard --ar 4:5 --style raw --v 6.1',
    flux: 'Hero shot of a Louis XVI gold-gilded dining armchair with floral embroidered oval back, cream silk cushion, brass nailhead trim, fluted legs, polished marble floor, studio lighting, hyperrealistic 8k.',
    dalle: 'Close-up product photograph of a French-style dining armchair with an ornate carved gold-leaf frame, oval floral embroidered back, cream cushion with brass studs, high luxury catalog.'
  },
  {
    num: '12',
    file: '12_carved_wooden_glass_display_showcase.jpg',
    title: 'Carved Teak Heirloom Glass Vitrine Showcase',
    cat: 'Dining & Storage',
    materials: 'Seasoned Burma teak, acanthus cresting, beveled glass doors, integrated LED warm illumination',
    dims: 'W 160cm x D 48cm x H 210cm',
    loc: 'Khulshi Heritage Residence',
    desc: 'Real catalogue piece: heirloom showcase with hand-carved baroque acanthus leaf pediments, beveled glass panels, and interior display lighting.',
    mj: 'Interior editorial photography of a formal dining room showcasing a monumental Burma teak glass vitrine display cabinet. The cabinet features hand-carved baroque acanthus leaf pediments, dual beveled glass doors, side glass panels, and glass shelving lined with antique bone china and cut crystal glassware, subtly illuminated from within by warm 2700K recessed LED downlights. The rich polished teak wood displays deep golden-brown chatoyancy. Set against a soft taupe wainscoted wall, warm ambient interior light, shot on Sony A7R V, 35mm lens, f/4, hyper-detailed wood carving and glass refractions --ar 16:9 --style raw --v 6.1',
    flux: 'Hand-carved Burma teak glass display cabinet with ornate baroque cresting, glass shelves with crystal glassware, warm interior downlights, dining room backdrop, photorealistic 8k.',
    dalle: 'Heirloom dark wood glass display showcase with ornate carved top crest, glass doors and shelves showing fine dinnerware, warm internal lighting in a formal dining room.'
  },
  {
    num: '13',
    file: '13_luxury_cream_gold_glass_showcase.jpg',
    title: 'Luxury Cream & Gold Neoclassical Glass Vitrine',
    cat: 'Living & Dining',
    materials: 'Cream high-gloss lacquer, brushed champagne brass framing, ultra-clear glass shelves',
    dims: 'W 140cm x D 45cm x H 205cm',
    loc: 'GEC Hills Penthouse',
    desc: 'Real catalogue piece: modern neoclassical vitrine in warm cream lacquer with brushed brass metal accents and clear display glass.',
    mj: 'Contemporary luxury living room corner featuring a sleek Italian neoclassical display vitrine cabinet. The frame is finished in soft ivory cream lacquer with slim brushed champagne gold metal trim and tall glass display doors. Inside, clear floating glass shelves display luxury ceramic vases and curated art objects illuminated by soft vertical edge LED strips. Placed beside a fluted plaster wall and a tall potted fiddle leaf fig tree in a travertine planter, natural daylight from a large balcony, shot on Leica SL2, 50mm, f/2.8, pristine modern luxury --ar 16:9 --style raw --v 6.1',
    flux: 'Modern neoclassical display vitrine in cream lacquer with champagne gold metal trim, glass doors displaying curated art vases, internal vertical LED lighting, clean modern living room, 8k photorealistic.',
    dalle: 'Luxury display cabinet in ivory cream finish with brushed gold metal accents, clear glass doors and shelves with modern vases, bright elegant living room.'
  },
  {
    num: '14',
    file: '14_executive_brown_leather_tufted_chair.jpg',
    title: 'Executive Hand-Antiqued Leather Director Chair',
    cat: 'Office & Study',
    materials: 'Hand-antiqued whiskey brown top-grain Italian leather, deep diamond button-tufting, mahogany base',
    dims: 'W 72cm x D 76cm x H 118cm',
    loc: 'Agrabad Port Executive Office',
    desc: 'Real catalogue piece: Chesterfield-style presidential director chair with hand-hammered antique brass nailheads and five-star mahogany swivel base.',
    mj: 'Executive presidential office in an Agrabad commercial headquarters. Center stage is an authentic Chesterfield executive director swivel armchair upholstered in hand-antiqued whiskey brown top-grain leather, with deep diamond button-tufting, rolled padded armrests, and hand-hammered antique brass nailheads, resting on a carved mahogany five-star swivel base with bronze casters. Placed behind a massive live-edge Burma teak executive desk with a brass banker lamp. In the background, floor-to-ceiling dark wood library bookshelves and panoramic corner window view of Chittagong harbor at sunset, shot on Phase One 50mm, f/2.8, cinematic corporate luxury --ar 16:9 --style raw --v 6.1',
    flux: 'Presidential executive office with a whiskey-brown tufted leather Chesterfield director chair with brass nailhead studs on a mahogany swivel base, large teak desk, library bookshelves in background, sunset city view, 8k photorealistic.',
    dalle: 'Executive office featuring a brown tufted leather director chair with brass studs, solid wood executive desk, mahogany bookshelves, warm cinematic lighting.'
  },
  {
    num: '15',
    file: '15_classic_wooden_cream_cushion_sofa.jpg',
    title: 'Classic Teak & Linen Spindle Sofa Suite',
    cat: 'Living Room',
    materials: 'Solid Burma teak / mahogany frame with spindle rails, plush cream natural linen cushions',
    dims: 'Sofa: W 205cm x D 88cm x H 82cm | Chair: W 85cm x D 88cm x H 82cm',
    loc: 'Khulshi Hills Veranda Living',
    desc: 'Real catalogue piece: timeless solid teak frame with open slatted spindle sides and plush, generous cream linen cushions.',
    mj: 'Warm tropical modernist veranda living room in Khulshi Hills. A bespoke 3-seater wooden sofa crafted from solid polished golden-brown Burma teak with elegant open spindle-slat back and armrests, fitted with generous plush deep cushions upholstered in natural cream woven linen. Accented with dark moss green throw pillows. In front, a low rectangular slatted teak coffee table. Teak ceiling rafters with a modern low-noise ceiling fan, open folding glass doors revealing a sunlit tropical garden terrace, morning golden light, shot on Hasselblad 35mm, f/4, relaxed artisanal luxury --ar 16:9 --style raw --v 6.1',
    flux: 'Tropical modernist living room with solid teak spindle wood sofa, deep plush cream linen cushions, low teak coffee table, glass folding doors opening to tropical garden, warm morning light, photorealistic 8k.',
    dalle: 'Open living room with a solid teak wood sofa featuring vertical wooden spindles and thick cream linen cushions, wooden coffee table, garden patio view in natural light.'
  },
  {
    num: '16',
    file: '16_minimalist_black_gold_shoe_cabinet.jpg',
    title: 'Minimalist Fluted Black & Gold Entryway Cabinet',
    cat: 'Storage & Entryway',
    materials: 'Fluted matte black ash wood, white Calacatta marble top, brushed brass handles and legs',
    dims: 'W 120cm x D 38cm x H 105cm',
    loc: 'GEC Circle Luxury Foyer',
    desc: 'Real catalogue piece: contemporary console / shoe cabinet in black fluted wood with marble top and brushed brass hardware.',
    mj: 'Minimalist luxury apartment entryway foyer in GEC Circle. Against a warm micro-cement wall stands a low entryway credenza and shoe cabinet crafted in matte black fluted ash wood with a polished white Calacatta marble slab top and brushed satin brass bar pulls, elevated on slender black steel legs. Above the cabinet hangs a large round backlit bronze mirror. On top sits a minimalist brass tray with keys and an asymmetric ceramic vase with dry eucalyptus stems. Herringbone oak entryway floor with a recessed soft welcome mat, warm architectural spotlighting, shot on Sony A7R V, 35mm, f/2.8, clean luxury entryway --ar 16:9 --style raw --v 6.1',
    flux: 'Luxury apartment entryway with a fluted black wood cabinet with white marble top, brushed brass handles, round backlit mirror on wall, ceramic vase, herringbone wood floor, photorealistic 8k.',
    dalle: 'Modern entryway console cabinet in fluted black wood with a white marble slab top and gold handles, round mirror above, elegant clean foyer interior.'
  },
  {
    num: '17',
    file: '17_room_before_raw_space.jpg',
    title: 'Raw Unfurnished Apartment Space (Before Transformation)',
    cat: 'Space Transformation',
    materials: 'Plastered drywall, polished ceramic floor tiles, powder-coated aluminum balcony sliders',
    dims: 'Living Room (approx 320 sq ft)',
    loc: 'Nasirabad Heights High-Rise',
    desc: 'The authentic photorealistic raw apartment room deployed on the left of the Before/After transformation slider.',
    mj: 'Architectural photography of an empty, unfurnished luxury apartment living room prior to interior furnishing in Khulshi, Chattogram. Smooth off-white plastered walls with ceiling crown molding and recessed LED cove trays, floor-to-ceiling double-glazed aluminum sliding glass doors leading to an exterior balcony overlooking the neighborhood. Pristine polished high-gloss cream ceramic floor tiles reflecting the natural daylight. Zero furniture, completely vacant raw residential interior ready for bespoke carpentry and installation, shot on Hasselblad H6D-100c, 24mm wide angle lens, f/8, straight lines, perfectly balanced natural daylight --ar 16:9 --style raw --v 6.1',
    flux: 'Empty unfurnished luxury apartment living room, white walls with ceiling crown molding, sliding glass balcony doors, polished cream ceramic floor tiles reflecting light, completely bare raw room, 8k photorealistic.',
    dalle: 'Empty modern apartment room with clean white walls, sliding glass balcony doors, shiny cream tile floor, vacant interior ready for furniture.'
  },
  {
    num: '18',
    file: '18_room_after_delivered_sanctuary.jpg',
    title: 'Delivered Living Room Sanctuary (After Transformation)',
    cat: 'Space Transformation',
    materials: 'Sage damask velvet, black lacquer, Italian marble, custom silk drapery, Persian carpet',
    dims: 'Living Room (approx 320 sq ft)',
    loc: 'Nasirabad Heights High-Rise',
    desc: 'The delivered turnkey living room on the right of the Before/After slider featuring curved modular seating, marble coffee table, and tailored curtains.',
    mj: 'Architectural Digest photography of the exact same living room now completely transformed and furnished as a luxury sanctuary in Chattogram. Featuring a curved modular corner sofa upholstered in sage-green diamond-tufted damask velvet with plush teal and cream velvet cushions. A hand-carved black-lacquer coffee table with a polished white marble top sits on an authentic hand-knotted Persian wool and silk area rug. Tailored floor-to-ceiling teal silk and sheer double drapery framing the balcony windows, textured wallpaper, gilded framed landscape oil painting on the wall, brass accessories and fresh flowers on the table, warm 2700K ambient lighting, shot on Hasselblad H6D-100c, 24mm lens, f/8, luxurious turnkey living --ar 16:9 --style raw --v 6.1',
    flux: 'Fully furnished luxury living room with sage green velvet curved corner sofa, black lacquer coffee table with marble top, Persian rug on polished floor, teal silk floor-to-ceiling curtains, warm ambient lighting, 8k photorealistic.',
    dalle: 'Turnkey luxury living room furnished with a light sage green curved velvet sofa, marble coffee table, ornate area rug, elegant curtains, framed art on wallpapered wall.'
  },
  {
    num: '19',
    file: '19_case_khulshi_dining_residence.jpg',
    title: 'The Khulshi Executive Residence — Grand Dining Hall',
    cat: 'Case Studies',
    materials: '100% Solid Burma teak, natural beeswax polish, brass trim, crystal chandelier, cream velvet chairs',
    dims: 'Dining Hall (approx 380 sq ft)',
    loc: 'Road 3, Khulshi Hill, Chattogram',
    desc: 'Curated case study commission: custom 8-seater sculptural banquet dining ensemble with matching fluted credenza and Austrian crystal chandelier.',
    mj: 'Editorial interior design photography of the Khulshi Executive Residence private dining hall in Chattogram. An 8-seater banquet dining table crafted from 100% solid seasoned Burma teak with a hand-rubbed beeswax finish and subtle brass inlay edges, surrounded by upholstered high-back cream velvet dining chairs. In the background, a custom matching teak fluted credenza sideboard under framed classical artwork. An ornate 12-arm Austrian crystal chandelier casts a warm 2700K golden illumination over the banquet table setting. Floor-to-ceiling champagne satin drapery framing large garden-view windows, dark polished teak parquet flooring, shot on Hasselblad H6D-100c, 35mm lens, f/4, exquisite luxury atmosphere --ar 16:9 --style raw --v 6.1',
    flux: 'Grand private dining room with solid Burma teak 8-seater banquet table with beeswax finish, cream velvet dining chairs, crystal chandelier, teak fluted credenza sideboard, floor-to-ceiling curtains, photorealistic 8k.',
    dalle: 'High-end dining hall in a luxury villa with an 8-seater teak dining table, cream velvet chairs, large crystal chandelier, matching wooden credenza, rich warm lighting.'
  },
  {
    num: '20',
    file: '20_final_khulshi_dining_calacatta.jpg',
    title: 'Monolithic Calacatta Gold Marble Dining Suite & Camel Leather Chairs',
    cat: 'Dining',
    materials: 'Bookmatched Italian Calacatta Gold marble, burnished brass pedestal base, camel full-grain saddle leather armchairs, fluted solid walnut credenza',
    dims: 'Dining Hall (approx 400 sq ft) | Table: W 280cm x D 110cm x H 76cm',
    loc: 'Khulshi Executive Residence, Chattogram',
    desc: 'Upgraded residence commission: monolithic Calacatta marble slab table paired with curved camel leather barrel dining chairs under fluted amber glass chandeliers.',
    mj: 'Editorial interior design photography for Architectural Digest of a palatial private dining room in Khulshi, Chattogram. In the center, a 10-seater monolithic dining table crafted from genuine bookmatched Italian Calacatta Gold marble with warm grey and honey veining, supported by a sculpted burnished brass pedestal base. Surrounding the table are bespoke minimalist dining armchairs upholstered in supple camel-colored saddle leather with slender blackened steel legs. In the background, a custom fluted dark walnut sideboard credenza under soft champagne silk curtains. Overhead, a pair of contemporary fluted amber glass chandelier globes casting warm 2700K ambient illumination over elegant fine porcelain dinnerware. Natural daylight flowing through sheer floor-to-ceiling windows, shot on Hasselblad H6D-100c, 35mm lens, f/4, ultra-realistic textures, 8k --ar 16:9 --style raw --v 6.1',
    flux: 'Luxury private dining room featuring a long monolithic Calacatta marble dining table with warm veining, camel saddle leather curved dining armchairs, fluted amber glass globe chandeliers, sheer curtains, warm natural sunlight, architectural interior photography, 8k.',
    dalle: 'High-end luxury dining room with a large white Calacatta marble dining table, caramel brown leather chairs, modern glass chandeliers, sheer drapery, upscale modern home interior.'
  },
  {
    num: '21',
    file: '21_final_agrabad_emerald_bed.jpg',
    title: 'The Agrabad Heritage Duplex — Emerald Velvet Bedroom Suite',
    cat: 'Bedroom',
    materials: 'Deep emerald green channel-tufted velvet headboard, matching quilted footboard bench, mahogany wall boiserie, brass wall sconces, chevron parquet',
    dims: 'Master Suite (approx 360 sq ft) | Bed: King W 200cm x L 220cm x H 155cm',
    loc: 'Agrabad Heritage Duplex, Chattogram',
    desc: 'Upgraded master suite case study commission: signature Majesty Glame emerald green velvet bed set against rich burgundy mahogany wainscoting.',
    mj: 'Architectural Digest editorial photography of an opulent master bedroom suite in Agrabad Heritage Duplex, Chattogram. Centered in the room is a bespoke king-size bed featuring a high channel-tufted emerald green cotton velvet headboard, crowned by dark polished Burma teak molding, accompanied by a matching diamond-quilted emerald velvet footboard storage bench. Set against rich burgundy and dark walnut boiserie wood wall paneling. Dressed in crisp 1000-thread-count white Egyptian cotton linens with an emerald velvet throw runner. Flanked by dark mahogany floating nightstands with warm brushed brass wall sconces and amber glass globe lamps. Warm chevron Burma teak parquet flooring, soft ambient 2700K lighting, cinematic depth, shot on Phase One IQ4 150MP, 50mm lens, f/2.8, hyperrealistic fine texture detail --ar 16:9 --style raw --v 6.1',
    flux: 'Opulent master bedroom suite with king-size emerald green velvet channel-tufted bed, matching quilted velvet bench, deep burgundy mahogany wall paneling, white luxury linens, warm brass sconce lighting, chevron parquet floor, 8k photorealistic.',
    dalle: 'Luxury master bedroom featuring a king bed with tall emerald green velvet headboard, matching green velvet bench at bed end, dark wood paneled walls, crisp white sheets, warm ambient bedside lighting.'
  },
  {
    num: '22',
    file: '22_final_duplex_cream_modular.jpg',
    title: 'Minimalist Penthouse Duplex Living Room & Floating Staircase',
    cat: 'Living Room',
    materials: 'Cream textured oatmeal bouclé modular sectional, smoked black glass coffee table, floating solid oak staircase, frameless glass railing',
    dims: 'Double-Height Living Hall (approx 520 sq ft)',
    loc: 'Nasirabad Heights Duplex Penthouse, Chattogram',
    desc: 'Hero residence showcase: low-profile cream modular curved sofa with a floating solid oak staircase and morning sunlight streaming through double-height glass.',
    mj: 'High-end architectural photography of a double-height minimalist duplex penthouse in Nasirabad Heights, Chattogram. In the foreground, a low-profile curved modular sectional sofa upholstered in heavy cream oatmeal textured bouclé with deep sink-in cushions. In front, a round smoked black glass coffee table on delicate black wire pedestal legs atop a custom hand-tufted light wool area rug. In the background, an architectural floating solid oak staircase with frameless architectural glass balustrade ascending to the mezzanine, with warm wood wall cladding and open luxury dining area beyond. Floor-to-ceiling double-height windows with sheer linen drapes streaming golden morning sunlight, shot on Sony A7R V, 24mm GM lens, f/4, clean lines, airy spacious grandeur, raytraced reflections, 8k --ar 16:9 --style raw --v 6.1',
    flux: 'Modern double-height penthouse living room, cream bouclé curved modular sectional sofa, round dark glass coffee table, floating wood stairs with glass balustrade in background, morning sun streaming through huge windows, photorealistic 8k.',
    dalle: 'Spacious modern duplex living room with a low cream curved modular sofa, round glass coffee table, floating wooden stairs with glass railing, large windows with bright natural light.'
  },
  {
    num: '23',
    file: '23_final_royal_blue_gold_salon.jpg',
    title: 'The Royal Salon — Rococo Carved Navy Velvet & 24K Gold Suite',
    cat: 'Living Room',
    materials: 'Solid hand-carved mahogany, genuine 24k water gold leaf gilding, royal navy sapphire velvet, carved Italian marble coffee table, crystal chandelier',
    dims: 'Grand Salon (approx 480 sq ft) | 3-Seater: W 235cm x D 95cm x H 112cm',
    loc: 'Chittagong VIP Estate Salon',
    desc: 'Opulent royal formal reception suite: intricate baroque rococo gilded frames with crown carving and deep diamond-tufted royal sapphire blue velvet.',
    mj: 'Editorial architectural interior photography of a palatial royal salon in a Chittagong VIP private estate. Centerpiece is a baroque 3-seater sofa and companion armchairs crafted from solid seasoned mahogany lavishly hand-carved with acanthus leaves, scrollwork, and a monumental shell crest, gilded in authentic 24k water gold leaf. Upholstered in lustrous royal sapphire navy blue velvet with deep diamond button-tufting and rolled padded arms. In the center, a matching hand-carved gold leaf center table with a thick beige Breccia marble top, over an antique silk and wool Persian rug on polished cream marble floors. Classical neoclassical wainscoting walls with gold filigree and an Austrian crystal chandelier, shot on Leica SL2, 28mm Summilux, f/5.6, opulent grandeur, 8k ultra-sharp --ar 16:9 --style raw --v 6.1',
    flux: 'Palatial formal reception salon, baroque hand-carved 24k gold leaf luxury sofa suite in deep royal blue velvet with button tufting, gold carved marble coffee table, Persian rug, crystal chandelier, classical luxury, 8k photorealistic.',
    dalle: 'Extravagant royal palace living room with ornate 24k gold-gilded furniture upholstered in royal blue tufted velvet, carved marble center table, crystal lighting, opulent classical decor.'
  },
  {
    num: '24',
    file: '24_final_executive_tufted_study.jpg',
    title: 'The Executive Study — Cognac Tufted Leather Armchair & Port View',
    cat: 'Office & Storage',
    materials: 'Hand-burnished cognac/whiskey full-grain leather, deep diamond button-tufting, solid brass studs, mahogany executive desk, brass banker lamp',
    dims: 'Private Executive Suite (approx 280 sq ft)',
    loc: 'Agrabad Commercial Executive Suite, Chattogram',
    desc: 'Commanding executive study: hand-antiqued cognac leather Chesterfield wingback armchair overlooking the Chattogram commercial port skyline.',
    mj: 'Editorial interior photography for a luxury design publication of a distinguished private executive study in Agrabad, Chattogram. In the center sits a bespoke Chesterfield high-back wingback armchair upholstered in hand-burnished cognac whiskey full-grain leather with deep diamond button-tufting and hand-applied antique brass nailhead trim. In the background, a massive solid Burma teak and mahogany executive desk with brass banker desk lamp and leather blotter. Floor-to-ceiling panoramic glass windows reveal the distant sunset skyline and maritime cranes of Chattogram port harbor. Rich dark wood bookcase wall filled with leather-bound books, warm 2700K ambient library lighting, shot on Hasselblad H6D-100c, 50mm lens, f/2.8, cinematic sophistication, ultra-detailed leather texture --ar 16:9 --style raw --v 6.1',
    flux: 'Luxury executive office study featuring a classic cognac brown tufted leather wingback armchair with brass nailhead trim, mahogany executive desk, window view of city harbor at dusk, wood library shelves, 8k photorealistic.',
    dalle: 'Distinguished executive study with a luxurious brown tufted leather armchair, dark wood desk, warm banker lamp, bookshelf background, large window with sunset city view.'
  }
];

// Build Markdown
const md = [];
md.push('# 🏛️ Heaven Furniture Mart — Real-Product AI Visual Generation Suite\n');
md.push('> **Folder Location**: `website V8/ai-image-prompts/`\n');
md.push('> **Interactive One-Click Gallery**: Double-click [index.html](./index.html) in this folder to preview all images with instant **"Copy Prompt"** buttons in your browser!\n\n');
md.push('---\n\n');
md.push('## 📌 How to Preserve 100% Physical Product Accuracy with AI\n');
md.push('To ensure AI outputs match Heaven Furniture Mart\'s genuine carpentry, wood species, and upholstery, follow these methods:\n\n');
md.push('### 1. Midjourney v6.1 Style Reference (`--sref`)\n');
md.push('1. Upload the reference `.jpg` file from this folder into Discord.\n');
md.push('2. Copy the image link.\n');
md.push('3. Paste the prompt below and append `--sref [IMAGE_LINK] --sw 800 --ar 16:9 --style raw --v 6.1`.\n');
md.push('   - `--sw 800` locks the texture, fabric color, and woodwork carving style.\n');
md.push('   - `--style raw` ensures authentic architectural photography rather than oversaturated AI fantasy.\n\n');
md.push('### 2. FLUX.1 Pro / Leonardo / Replicate\n');
md.push('- Use the image from this folder as an **Image-to-Image / Depth ControlNet** reference at `0.65–0.75` strength.\n');
md.push('- Copy and paste the provided **FLUX.1 Pro** prompt.\n\n');
md.push('### 3. Recommended Universal Negative Prompt\n');
md.push('```text\nplastic, cheap laminate, distorted proportions, wobbly legs, extra legs, deformed furniture, CGI render, cartoon, blurry, watermark, text\n```\n\n');
md.push('---\n\n## 🗂️ Complete Product Catalogue & Prompts\n\n');

for (const it of items) {
  md.push(`### ${it.num}. ${it.title}\n\n`);
  md.push(`![${it.title}](./${it.file})\n\n`);
  md.push(`- **Image File**: \`${it.file}\`\n`);
  md.push(`- **Category**: **${it.cat}**\n`);
  md.push(`- **Materials & Finish**: ${it.materials}\n`);
  md.push(`- **Dimensions / Room Scope**: ${it.dims}\n`);
  md.push(`- **Architectural Setting**: ${it.loc}\n`);
  md.push(`- **Catalogue Context**: ${it.desc}\n\n`);
  
  md.push(`#### 🎨 Midjourney v6.1 Prompt (Recommended):\n`);
  md.push('```text\n' + it.mj + '\n```\n\n');

  md.push(`#### ⚡ FLUX.1 Pro Prompt:\n`);
  md.push('```text\n' + it.flux + '\n```\n\n');

  md.push(`#### 🤖 DALL-E 3 Prompt:\n`);
  md.push('```text\n' + it.dalle + '\n```\n\n');
  md.push('---\n\n');
}

fs.writeFileSync(path.join(outDir, 'PROMPTS.md'), md.join(''), 'utf8');
fs.writeFileSync(path.join(outDir, 'README.md'), md.join(''), 'utf8');

// Build Interactive HTML Gallery
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heaven Furniture Mart — Real Product AI Prompts & Assets</title>
  <style>
    :root {
      --bg: #0b0d11;
      --card-bg: #13171f;
      --border: #222a38;
      --gold: #c5a880;
      --gold-hover: #dfc299;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.6;
      padding: 2.5rem 1.5rem 6rem;
    }
    .wrap {
      max-width: 1340px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      padding: 2rem 1rem 3rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2.5rem;
    }
    .brand-eyebrow {
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.22em;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: clamp(2rem, 3.8vw, 2.75rem);
      font-weight: 300;
      letter-spacing: 0.04em;
      color: #fff;
      margin-bottom: 1rem;
    }
    header p {
      color: var(--text-muted);
      max-width: 760px;
      margin: 0 auto;
      font-size: 1.05rem;
    }
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 2.5rem;
    }
    .filter-btn {
      background: #18202c;
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 0.5rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-btn:hover, .filter-btn.active {
      background: var(--gold);
      color: #0b0d11;
      border-color: var(--gold);
      font-weight: 600;
    }
    .grid {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }
    .item-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 440px 1fr;
      box-shadow: 0 12px 32px rgba(0,0,0,0.35);
      transition: border-color 0.2s ease;
    }
    .item-card:hover {
      border-color: #3b4659;
    }
    @media (max-width: 1024px) {
      .item-card {
        grid-template-columns: 1fr;
      }
    }
    .img-col {
      background: #08090c;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.75rem;
      border-right: 1px solid var(--border);
    }
    @media (max-width: 1024px) {
      .img-col { border-right: none; border-bottom: 1px solid var(--border); }
    }
    .img-col img {
      max-width: 100%;
      max-height: 380px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
    .img-badge {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.78rem;
      color: var(--gold);
      margin-top: 1rem;
      background: rgba(197, 168, 128, 0.1);
      padding: 0.3rem 0.75rem;
      border-radius: 4px;
      border: 1px solid rgba(197, 168, 128, 0.25);
    }
    .content-col {
      padding: 2.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }
    .card-title {
      font-size: 1.35rem;
      font-weight: 500;
      color: #fff;
    }
    .card-tag {
      background: rgba(197, 168, 128, 0.15);
      color: var(--gold);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.28rem 0.75rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .meta-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem;
      font-size: 0.85rem;
      background: #0d1117;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      border: 1px solid #1c2432;
    }
    .meta-item strong {
      color: var(--gold);
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.15rem;
    }
    .meta-item span {
      color: #cbd5e1;
    }
    .prompt-box {
      background: #090c10;
      border: 1px solid #1e2634;
      border-radius: 8px;
      padding: 1.25rem;
    }
    .prompt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .prompt-name {
      font-size: 0.82rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .copy-btn {
      background: var(--gold);
      color: #0b0d11;
      border: none;
      padding: 0.4rem 0.95rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
    }
    .copy-btn:hover {
      background: var(--gold-hover);
      transform: translateY(-1px);
    }
    .copy-btn:active {
      transform: translateY(0);
    }
    .prompt-text {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.84rem;
      color: #f1f5f9;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.55;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--gold);
      color: #0b0d11;
      padding: 0.85rem 1.6rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.92rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.25s ease;
      pointer-events: none;
      z-index: 9999;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand-eyebrow">Heaven Furniture Mart · Chattogram</div>
      <h1>Real-Product AI Visual Generation Suite</h1>
      <p>Photorealistic room scenes engineered directly from genuine Heaven Furniture Mart pieces. Tap <strong>"Copy Prompt"</strong> to copy the exact Midjourney v6.1, FLUX.1 Pro, or DALL-E 3 prompts to your clipboard.</p>
    </header>

    <div class="filter-bar">
      <button class="filter-btn active" onclick="filterCat('all')">All Items (${items.length})</button>
      <button class="filter-btn" onclick="filterCat('Living Room')">Living Room</button>
      <button class="filter-btn" onclick="filterCat('Bedroom')">Bedroom</button>
      <button class="filter-btn" onclick="filterCat('Dining')">Dining</button>
      <button class="filter-btn" onclick="filterCat('Office & Storage')">Office & Storage</button>
      <button class="filter-btn" onclick="filterCat('Space Transformation')">Transformations & Cases</button>
    </div>

    <div class="grid" id="items-grid">
`;

for (const it of items) {
  let catFilter = it.cat;
  if (it.cat.includes('Office') || it.cat.includes('Storage')) catFilter = 'Office & Storage';
  else if (it.cat.includes('Case') || it.cat.includes('Transformation')) catFilter = 'Space Transformation';

  html += `
      <article class="item-card" data-category="${catFilter}">
        <div class="img-col">
          <img src="${it.file}" alt="${it.title}" loading="lazy">
          <span class="img-badge">${it.file}</span>
        </div>
        <div class="content-col">
          <div class="card-top">
            <div>
              <h2 class="card-title">${it.num}. ${it.title}</h2>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.35rem;">${it.desc}</p>
            </div>
            <span class="card-tag">${it.cat}</span>
          </div>

          <div class="meta-list">
            <div class="meta-item">
              <strong>Materials & Finish</strong>
              <span>${it.materials}</span>
            </div>
            <div class="meta-item">
              <strong>Dimensions / Scope</strong>
              <span>${it.dims}</span>
            </div>
            <div class="meta-item">
              <strong>Location Context</strong>
              <span>${it.loc}</span>
            </div>
          </div>

          <div class="prompt-box">
            <div class="prompt-header">
              <span class="prompt-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                Midjourney v6.1 Prompt (Recommended)
              </span>
              <button class="copy-btn" onclick="copyPrompt(this)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Prompt
              </button>
            </div>
            <div class="prompt-text">${it.mj}</div>
          </div>
        </div>
      </article>
  `;
}

html += `
    </div>
  </div>

  <div id="toast" class="toast">Prompt copied to clipboard!</div>

  <script>
    function copyPrompt(btn) {
      const text = btn.closest('.prompt-box').querySelector('.prompt-text').innerText;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Copied!';
        setTimeout(() => {
          toast.classList.remove('show');
          btn.innerHTML = orig;
        }, 2000);
      });
    }

    function filterCat(cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      const cards = document.querySelectorAll('.item-card');
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'grid';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

console.log('Successfully generated PROMPTS.md, README.md, and index.html in', outDir);
