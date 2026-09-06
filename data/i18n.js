/* ==========================================================================
   Heaven Furniture Mart — Bilingual Translation Engine (EN / বাংলা)
   Cultured, aristocratic Bengali tailored for high-net-worth Bangladeshi clients.
   ========================================================================== */

export const I18N = {
  en: {
    brand_name: 'Heaven Furniture Mart',
    brand_sub: 'Bespoke \u00B7 Chattogram',
    lang_toggle: '\u09AC\u09BE\u0982\u09B2\u09BE', // 'বাংলা'
    lang_label: 'Language: English',
    
    // Navigation
    nav_home: 'Home',
    nav_collections: 'Collections',
    nav_bespoke: 'Bespoke',
    nav_materials: 'Materials',
    nav_showroom: 'Showroom',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_ar: 'See it in your room',
    nav_search: 'Search pieces',
    nav_cart: 'Cart',
    nav_checkout: 'Checkout',
    
    // Piece Page
    finish_title: 'Select Color & Finish',
    made_to_order: 'Made to order',
    lead_time: 'Lead time',
    dimensions: 'Dimensions',
    materials_heading: 'Materials',
    standard_spec: 'Standard Specification',
    curated_title: 'Curated Workshop Standard',
    curated_desc: 'Crafted to our master proportions in select materials and workshop-standard finishes.',
    btn_order_now: 'Order',
    btn_order_wa: 'Order on WhatsApp',
    btn_call_showroom: 'Call showroom',
    btn_add_cart: 'Add to cart',
    btn_ask_wa: 'Ask a question on WhatsApp',
    btn_view_3d: 'View in 3D',
    btn_exit_3d: 'Exit 3D',
    btn_ar: 'See this in your room',
    custom_toggle: 'Need Custom Dimensions or Materials?',
    custom_toggle_sub: 'Tap to adjust size, timber grades, and add-ons',
    estimated_price: 'Estimated price',
    price_note: 'Nothing is charged online. We confirm your price and lead time before anything is made.',
    reset_standard: 'Reset to the standard specification',
    spec_dimension_legend: 'Custom Dimensions',
    spec_material_legend: 'Timber & Material Grade',
    spec_addons_legend: 'Delivery & Extras',
    cart_added_one: 'Added to cart \u2014 add another?',
    cart_added_multi: '{qty} in your cart \u2014 add another?',
    standard_price_from: 'From {price}',
    lead_time_format: 'Lead time: {lead}',
    more_from_workshop: 'More from the workshop',
    step_dec: 'Decrease dimension',
    step_inc: 'Increase dimension',
    qr_title: 'Take this to your room',
    qr_desc: 'Scan with your phone and AR opens straight away — no app, no typing.',
    ar_caveat: '<strong>About these dimensions:</strong> our 3D models are not yet calibrated against workshop measurements, so AR may not place this piece at exactly the size shown. We are fixing this — please confirm critical dimensions with us before ordering.',
    ar_help_notice: '<strong>This device can’t open AR directly.</strong> On iPhone and iPad, AR needs a USDZ file which we are still preparing — see device support. On a desktop, scan the QR code below with your phone instead.',
    
    // Categories
    cat_living: 'Living Room',
    cat_living_room: 'Living Room',
    cat_bedroom: 'Bedroom',
    cat_dining: 'Dining',
    cat_office: 'Office & Study',
    cat_bespoke: 'Bespoke / Custom',
    
    // WhatsApp prefilled messages
    wa_greeting: "Hello, I am interested in the {name}. Selected finish: {variant}. Estimated price: {price}. Please share high-resolution photos and showroom details.",
    wa_inquiry_format: "Hello Heaven Furniture Mart. I would like a quote for the {name}{fabric}. Page: {url}",

    // Home Page
    hero_tap_hint: 'Tap to view in 3D',
    home_hero_title: 'Furniture for Generations',
    home_hero_sub: 'Hand-carved hardwood, bespoke proportions, and timeless craftsmanship from Chattogram\u2019s premier master artisans.',
    home_cta_collections: 'Explore Collections',
    home_cta_bespoke: 'Commission Bespoke Piece',
    home_collections_heading: 'The Collections',
    home_bespoke_heading: 'Bespoke Commissions',
    home_workshop_heading: 'Our Agrabad Workshop & Showroom',

    // Collections & Cards
    col_all: 'All Pieces',
    col_filter_cat: 'Category',
    col_showing: 'Showing {count} master pieces',
    card_view: 'View piece',
    card_from: 'From {price}',

    // Cart & Checkout
    cart_breadcrumb: 'Your cart',
    cart_eyebrow: 'Your cart',
    cart_heading: 'Your order, so far.',
    cart_lead: 'Each piece is built to the specification you set. Change a quantity here, or reopen a piece to change its size, material or finish.',
    cart_notice: 'Prices are estimates for the specification shown. We confirm the final figure and a firm lead time before anything is made — nothing is charged online.',
    cart_title: 'Your Selection',
    cart_empty_title: 'Your cart is empty.',
    cart_empty_sub: 'Every piece is made to order in our Chattogram workshop.',
    cart_empty_desc: 'Open any piece, set its size and materials, and tap “Add to cart”. It\'s stored on this device only — no account needed.',
    cart_browse_cta: 'Browse the collections',
    cart_unit_price: 'Unit price',
    cart_quantity: 'Quantity',
    cart_remove: 'Remove',
    cart_edit_spec: 'Edit specification',
    cart_subtotal: 'Estimated subtotal',
    cart_est_total: 'Estimated total',
    cart_keep_browsing: 'Keep browsing',
    cart_empty_action: 'Empty the cart',
    cart_clear_confirm: 'Remove everything from your cart?',
    cart_proceed_checkout: 'Checkout',
    cart_saved_hint: 'Saved on this device only. Nothing is sent until you place the order at checkout.',
    checkout_heading: 'Place your order.',
    checkout_sub: 'Tell us where it\'s going and we\'ll confirm the price and a firm lead time before anything is made.',
    checkout_notice: 'Nothing is charged online. Every piece is built to order, so we confirm your estimate against the final drawing first.',
    checkout_order_summary: 'Your order',
    checkout_summary_hint: 'Estimate for the specification shown. We confirm before production.',
    checkout_remember_text: 'Your details are saved on this device for 30 days so you don’t retype them.',
    checkout_forget_btn: 'Forget my details',
    checkout_back_cart: 'Back to cart',
    checkout_name_label: 'Your name',
    checkout_name_placeholder: 'Rahim Uddin',
    checkout_phone_label: 'Phone',
    checkout_phone_placeholder: '01XXXXXXXXX',
    checkout_phone_hint: 'We confirm your order on this number.',
    checkout_address_label: 'Delivery address',
    checkout_address_placeholder: 'House, road, area, city',
    checkout_email_label: 'Email',
    checkout_email_placeholder: 'So we can send drawings',
    checkout_notes_label: 'Anything we should know?',
    checkout_notes_placeholder: 'Room measurements, a deadline, a fabric you’ve seen…',
    checkout_btn_submit: 'Place order',
    checkout_btn_wa: 'Order on WhatsApp',
    co_err_name: 'Please tell us your name.',
    co_err_phone: 'A phone number we can reach you on, please.',
    co_err_address: 'Where should we deliver? Road and area is enough.',
    co_err_email: 'That email address looks incomplete.',
    co_err_fast: 'One moment — please press Place order again.',
    co_send_wa: 'Send this order on WhatsApp',

    // Thanks / Confirmation
    thanks_heading: 'Order Received',
    thanks_sub: 'Thank you for placing your trust in Heaven Furniture Mart. Reference: {ref}',
    thanks_step1_title: '1. Workshop Review',
    thanks_step1_desc: 'Our master joiners inspect timber seasoning schedules and prepare initial workshop drawings.',
    thanks_step2_title: '2. Personal Confirmation Call',
    thanks_step2_desc: 'We call your phone to verify delivery access, room layout, and confirm any custom dimensions.',
    thanks_step3_title: '3. Handcrafted Delivery',
    thanks_step3_desc: 'Your furniture is constructed, hand-finished, safely packed, and delivered directly into your room.',
    thanks_wa_notice: 'Need immediate priority consultation? Connect with our Managing Director\u2019s office on WhatsApp:',
    thanks_btn_wa: 'Message Workshop on WhatsApp',
    memo_btn_download: 'Download Cash Memo (PDF)',
    memo_btn_view: 'View / Print Cash Memo',
    memo_generating: 'Generating PDF...',

    /* Loading overlays. The homepage first-visit screen and the 3D stage share
       js/heaven-loader.js, so they share this vocabulary. */
    loader_early: 'Crafting Sanctuary',
    loader_mid: 'Preparing Gallery',
    loader_late: 'Sanctuary Ready',
    stage_load_lib: 'Fetching 3D viewer',
    stage_load_model: 'Downloading model',
    stage_load_ready: 'Almost ready',
    stage_err_viewer: 'The 3D viewer could not load. The photo above shows this piece.',
    stage_err_model: 'This 3D model is not available yet. The photo above shows this piece.',
    stage_hint_rotate: 'Drag to rotate. Pinch or scroll to zoom.',
    stage_hint_tap: 'Tap to load the interactive 3D model.',
    stage_no_model: 'No 3D model for this piece yet — the photograph above is the piece.',
    stage_ar_preparing: 'Preparing the model\u2026',

    // Search
    search_title: 'Search our catalogue',
    search_placeholder: 'Type a piece name, timber, or category...',
    search_no_results: 'No pieces found for \u201C{query}\u201D',

    // Collections Page
    coll_eyebrow: 'Collections',
    coll_title: 'Every piece, made to order.',
    coll_intro_ar: '{ar} of our {total} pieces carry a 3D model you can stand in your own room before committing — those are marked AR. The rest are photographed only, for now. Filter by room, or browse the lot.',
    coll_filter_all: 'All {count}',
    coll_filter_ar: 'Viewable in AR ({count})',
    coll_filter_btn: 'Filter',
    // Announced to screen readers when the count badge changes, because "2" on
    // its own next to "Filter" reads as a quantity of nothing in particular.
    coll_filter_active: '{count} filters applied',
    coll_filter_active_one: '1 filter applied',
    coll_filter_room_label: 'Room:',
    coll_filter_price_label: 'Price:',
    coll_sort_label: 'Sort',
    coll_sort_featured: 'Featured',
    coll_sort_price_asc: 'Price: Low to High',
    coll_sort_price_desc: 'Price: High to Low',
    coll_sort_name: 'Name (A–Z)',
    coll_price_all: 'All Prices',
    coll_price_under_50: 'Under ৳50,000',
    coll_price_50_100: '৳50,000 – ৳1,00,000',
    coll_price_above_100: 'Above ৳1,00,000',
    coll_not_seeing: 'Not seeing it?',
    coll_not_seeing_lead: 'Most of what we build never appears in a catalogue. Bring a drawing, a photograph or a measurement.',
    coll_start_commission: 'Start a commission',
    coll_empty: 'No pieces match that selection.',

    // Homepage Story & Guarantees
    home_browse_collections: 'Browse collections',
    home_curated_eyebrow: 'Curated Catalogue',
    home_curated_lead: 'Handcrafted pieces from our Agrabad workshop, proportioned to live comfortably together.',
    home_heritage_title: 'Built in Agrabad. Carved by hand.',
    home_heritage_lead: 'Twenty-eight years in Chattogram. We season our own timber, carve our own frames and deliver across Bangladesh.',
    guarantee_hardwood: 'Solid Hardwood',
    guarantee_hardwood_sub: 'Seasoned mahogany and Burma teak frames',
    guarantee_order: 'Made to Order',
    guarantee_order_sub: 'Proportions adjusted to your exact room',
    guarantee_delivery: 'Direct Delivery',
    guarantee_delivery_sub: 'Carefully transported into your home',
    guarantee_warranty: 'Master Craftsmanship',
    guarantee_warranty_sub: 'Built for generations, backed by our workshop',
    footer_desc: "Chattogram's bespoke luxury furniture workshop.",
    footer_hours: 'Daily 10:00 – 21:00',
    footer_address: 'Agrabad Access Road, Chattogram, Bangladesh',

    /* Shared chrome — the header, overlay menu and footer that js/chrome.js
       injects on 34 pages. None of it was translated before; js/shell.js reads
       these through the generic [data-i18n] pass. */
    brand_tagline: 'Designed. Crafted. Customized.',
    foot_h_collections: 'Collections',    foot_h_visit: 'Visit',
    foot_h_contact: 'Contact',
    foot_showroom_dir: 'Showroom & directions',
    foot_materials_lib: 'Materials library',
    foot_see_room: 'See it in your room',
    foot_your_cart: 'Your cart',
    foot_book_consult: 'Book a consultation',
    foot_wa_us: 'WhatsApp us',
    foot_email_us: 'Email us',
    foot_about: 'About',
    foot_all_pieces: 'All pieces',
    foot_locality: 'Chattogram, Bangladesh',
    ov_wa_anyday: 'WhatsApp us any day',
    ov_made_to_order: 'Made to order, 2–12 weeks',
    quote_fab: 'Quote on WhatsApp',
    aria_main_nav: 'Main',
    aria_social: 'Heaven Furniture Mart on social media',
    aria_menu: 'Menu',
    aria_lang: 'Switch language',
    aria_cart_empty: 'Cart is empty',
    aria_quote_wa: 'Request a quote on WhatsApp',
    skip_to_content: 'Skip to content',

    // 10/10 Core Features
    pillars_eyebrow: 'Engineering Standards',
    pillars_heading: 'The Four Pillars of Craftsmanship',
    pillars_lead: 'True bespoke luxury is defined by the unseen joinery, internal moisture, and protective barriers inside the wood.',
    pillars_toggle_ours: 'Heaven Workshop Standard',
    pillars_toggle_market: 'Commercial Market',
    pillar_moisture_metric: '8–12%',
    pillar_moisture_badge: 'Digital Kiln Monitored',
    pillar_moisture_title: 'Kiln-Dried Moisture Control',
    pillar_moisture_sub: 'Zero Monsoon Swelling & Warping',
    pillar_moisture_desc: 'Every log is seasoned in digital kilns to strictly 8–12% equilibrium moisture content. Eliminates joint splitting and timber movement through Chattogram’s severe monsoon humidity cycles.',
    pillar_moisture_m_metric: '22–32%',
    pillar_moisture_m_badge: 'Green Air-Dried Timber',
    pillar_moisture_m_title: 'Commercial Raw Timber',
    pillar_moisture_m_sub: 'Severe Seasonal Warping & Cracking',
    pillar_moisture_m_desc: 'Standard local workshops use unseasoned wet timber containing over 25% moisture. In dry winter months, wood shrinks violently, opening hairline cracks and loosening dovetail joints.',

    pillar_warranty_metric: '10-Year',
    pillar_warranty_badge: 'Direct Factory Covenant',
    pillar_warranty_title: 'Structural Integrity Warranty',
    pillar_warranty_sub: 'Written Workshop Guarantee',
    pillar_warranty_desc: 'Every solid Burma teak, mahogany, and Chittagong gamari frame is guaranteed against structural failure, frame loosening, or joinery displacement for ten full years.',
    pillar_warranty_m_metric: '0–6 Mo',
    pillar_warranty_m_badge: 'Verbal Showroom Promise',
    pillar_warranty_m_title: 'Commercial Retail Policy',
    pillar_warranty_m_sub: 'No Written Structural Liability',
    pillar_warranty_m_desc: 'Commercial furniture outlets provide only verbal shop assurances or 30-day cosmetic coverage. Once frames sag or creak under daily load, the repair cost is borne entirely by the homeowner.',

    pillar_joinery_metric: '100%',
    pillar_joinery_badge: 'Zero Staple Guns or Pins',
    pillar_joinery_title: 'Generational Interlocking Joinery',
    pillar_joinery_sub: 'Mortise, Tenon & Pegged Dovetails',
    pillar_joinery_desc: 'Crafted without staple guns or hollow particle boards. Load-bearing frames are joined with traditional interlocking mortise-and-tenon and hand-cut dovetail joints built to last decades.',
    pillar_joinery_m_metric: 'Nails/Glue',
    pillar_joinery_m_badge: 'Pneumatic Staples & Particle',
    pillar_joinery_m_title: 'Commercial Surface Fasteners',
    pillar_joinery_m_sub: 'Air Nails & Low-Density Core',
    pillar_joinery_m_desc: 'Commercial mass production relies on pneumatic air-staplers, hidden MDF scrap blocks, and synthetic adhesive that shear apart when moved or subjected to heavy family use.',

    pillar_finish_metric: '7-Layer',
    pillar_finish_badge: 'Multi-Stage Italian Micro-Barrier',
    pillar_finish_title: 'Italian Polyurethane Barrier',
    pillar_finish_sub: 'UV, Heat & Spill Resistance',
    pillar_finish_desc: 'Multi-stage hand-sanded Italian polyurethane micro-coating resists tea spills, hot crockery, and ultraviolet fading while preserving the authentic natural grain and chatoyancy of raw hardwood.',
    pillar_finish_m_metric: '1–2 Coat',
    pillar_finish_m_badge: 'Thin Solvent-Diluted Polish',
    pillar_finish_m_title: 'Commercial Surface Polish',
    pillar_finish_m_sub: 'Vulnerable to Heat Rings & Peeling',
    pillar_finish_m_desc: 'Standard commercial furniture uses quick solvent-thinned lacquer washes. Hot tea cups leave irreversible milky-white rings, and sunlight causes patchy yellowing within months.',
    
    ba_eyebrow: 'Space Transformation',
    ba_title: 'From Architectural Plan to Living Sanctuary',
    ba_lead: 'Drag the slider to experience how raw architectural spaces in Chattogram are transformed with our custom cabinetry, hand-carved seating, and turnkey drapery.',
    ba_label_before: 'Raw Space',
    ba_label_after: 'Delivered Sanctuary',
    ba_hint: 'Drag to compare',

    cases_eyebrow: 'Local Commissions',
    cases_title: 'Curated Chattogram Residences',
    cases_lead: 'Named bespoke commissions across Catalganj, Mehedibag, and Panchlaish — proportioned, hand-finished, and installed on site.',
    cases_room: 'Space',
    cases_species: 'Hardwood',
    cases_finish: 'Finish',
    cases_lead_time: 'Timeline',

    est_eyebrow: 'Instant Transparency',
    est_title: 'Timber & Budget Quick-Estimator',
    est_lead: 'Select your furniture collection, hardwood structure, and upholstery tier to view real-time workshop pricing and lead times based on our active catalog.',
    est_step1: '1. Select Collection',
    est_step2: '2. Select Timber & Base',
    est_step3: '3. Select Upholstery & Finish',
    est_from: 'Estimated Investment Range',
    est_lead_time: 'Workshop Crafting Time',
    est_cta_wa: 'Send Configuration on WhatsApp',
    est_note: 'Transparent estimate based on current timber seasoning stock. No account required.',

    concierge_title: 'Concierge Consultation',
    concierge_sub: 'Choose how you would like to connect with our master craftsmen and design directors.',
    concierge_t1_title: 'Private Showroom Walkthrough',
    concierge_t1_desc: 'VIP table reservation at our Agrabad showroom with MD Abul Kalam Bhuiyan or master artisans.',
    concierge_t2_title: 'In-Home Architectural Measurement',
    concierge_t2_desc: 'Complimentary on-site laser measuring and timber swatches at your Chattogram residence.',
    concierge_t3_title: 'Live Workshop Video Walkthrough',
    concierge_t3_desc: 'Direct WhatsApp HD video call for expatriates and busy executives to inspect carving and finishes live.',
    concierge_btn: 'Book Consultation',

    faq_eyebrow: 'Client Inquiries',
    faq_title: 'Frequently Answered Questions',
    faq_lead: 'Uncompromising clarity on timber durability, custom commissions, and white-glove delivery across Bangladesh.',

    spec_sheet_btn: 'Export Bespoke Spec Sheet',
    spec_sheet_title: 'Heaven Furniture Mart — Architectural Specification',
    spec_sheet_print: 'Print / Save PDF',
    spec_sheet_close: 'Close Specification',

    pillar_moisture_title: 'Kiln-Dried Moisture Control',
    pillar_moisture_sub: 'Zero Monsoon Swelling & Warping',
    pillar_moisture_desc: 'Every log is seasoned in digital kilns to strictly 8–12% equilibrium moisture content. Eliminates joint splitting and timber movement through Chattogram’s severe monsoon humidity cycles.',
    pillar_warranty_title: 'Structural Integrity Warranty',
    pillar_warranty_sub: 'Written Workshop Guarantee',
    pillar_warranty_desc: 'Every solid Burma teak, mahogany, and Chittagong gamari frame is guaranteed against structural failure, frame loosening, or joinery displacement for ten full years.',
    pillar_joinery_title: 'Generational Interlocking Joinery',
    pillar_joinery_sub: 'Mortise, Tenon & Pegged Dovetails',
    pillar_joinery_desc: 'Crafted without staple guns or hollow particle boards. Load-bearing frames are joined with traditional interlocking mortise-and-tenon and hand-cut dovetail joints built to last decades.',
    pillar_finish_title: 'Italian Polyurethane Barrier',
    pillar_finish_sub: 'UV, Heat & Spill Resistance',
    pillar_finish_desc: 'Multi-stage hand-sanded Italian polyurethane micro-coating resists tea spills, hot crockery, and ultraviolet fading while preserving the authentic natural grain and chatoyancy of raw hardwood.',

    faq_q_0: 'Do you offer complimentary in-home space measurement across Chattogram?',
    faq_a_0: 'Yes. Our senior joiner and space measurement specialist visits your residence in Khulshi, Nasirabad, Agrabad, Panchlaish, Halishahar, or anywhere within Chattogram city limits with laser tools and material swatches at zero charge before you commit to any order.',
    faq_q_1: 'How do you guarantee timber will not warp, crack, or attract borers in monsoon?',
    faq_a_1: 'All logs undergo a strict industrial kiln-drying schedule down to 8–12% moisture content, followed by vacuum copper-naphthenate anti-termite treatment. We back this with a written 10-Year Structural Integrity Warranty Certificate on all solid hardwood frames.',
    faq_q_2: 'Can you replicate custom luxury designs from Architectural Digest or Pinterest?',
    faq_a_2: 'Absolutely. Over 60% of our workshop output consists of bespoke private commissions. Bring any photograph, magazine clipping, or architectural 3D rendering. We prepare precise 2D CAD shop drawings with verified human-scale ergonomics before wood cutting begins.',
    faq_q_3: 'What is the production timeframe, and how is delivery and installation handled?',
    faq_a_3: 'Bespoke crafting typically takes 2 to 12 weeks depending on carving complexity. Once completed, our own workshop logistics team delivers and installs your furniture inside your designated room anywhere in Chattogram at ৳0 extra cost.',

    // About Page
    about_workshop_eyebrow: 'The workshop',
    about_workshop_title: 'The joint is the detail.',
    about_workshop_lead: 'Heaven Furniture Mart has been building furniture in Chattogram since 2020. Not assembling it — building it: sawn hardwood, pegged joints, carving done with gouges rather than routers, finishes rubbed in by hand.',
    about_philo_eyebrow: 'Philosophy',
    about_philo_title: 'Structure over effects.',
    about_philo_p1: 'Anyone can spray a sheen. What can\'t be faked is a pegged mortise-and-tenon joint — so where a frame is exposed, that is deliberate. You are meant to see how the piece holds together, because how it holds together is what you are paying for.',
    about_philo_p2: 'Every piece is made to order. That isn\'t a luxury affectation: it means the bed fits your mattress, the showcase fits your alcove, and the sofa fits through your stairwell — because we asked before we cut.',
    about_stat_started: 'the year we started',
    about_stat_pieces: 'pieces in the collections',
    about_stat_ar: 'viewable in AR',
    about_hands_eyebrow: 'The hands',
    about_hands_title: 'Carvers, joiners, finishers, upholsterers.',
    about_hands_p1: 'The workshop sits behind the showroom on Agrabad Access Road. Carving is done in solid hardwood — no applied resin ornament. Gilding is water-gilded in place. Nailhead trim is set by hand, one stud at a time, because a machine-set row never sits quite straight on a carved rail.',
    about_hands_p2: 'If you commission a piece, you\'re welcome to visit mid-build and watch your own frame come together.',
    about_commission_link: 'How a commission works',
    about_cta_title: 'See the standard for yourself.',
    about_cta_lead: 'In your room through AR, or in person on the showroom floor.',
    about_btn_collections: 'Browse the collections',
    about_btn_showroom: 'Visit the showroom',

    // Showroom Page
    showroom_eyebrow: 'Showroom',
    showroom_title: 'Come and sit on it.',
    showroom_lead: 'Photographs and AR get you most of the way. The last test — how a seat holds you, how a finish catches the afternoon light — needs a visit.',
    showroom_shot_cap: 'Agrabad Access Road, after dark. Both floors are showroom; the workshop is behind.',
    showroom_card_addr_title: 'Address & Contact',
    showroom_card_addr_p: 'Heaven Furniture Mart<br>Agrabad Access Road<br>Chattogram, Bangladesh',
    showroom_card_map_link: 'View interactive map below',
    showroom_card_hours_title: 'Hours',
    showroom_card_hours_p: 'Open every day, 10:00 – 21:00.<br>Fridays we open after Jumu\'ah, around 14:30.',
    showroom_card_hours_sub: 'Message ahead on WhatsApp if you\'re coming for a specific piece — we\'ll make sure it\'s on the floor and not in the spray room.',
    showroom_card_getting_title: 'Getting here',
    showroom_card_getting_p: 'On Agrabad Access Road, in the heart of Chattogram\'s commercial district. Any CNG or ride-share driver knows Agrabad Access Road; parking is available in front of the showroom.',
    showroom_map_title: 'Showroom Location',
    showroom_map_sub: 'Agrabad Access Road, Chattogram — open 10:00–21:00 daily',
    showroom_map_btn: 'Get Directions in Google Maps',
    showroom_visit_title: 'What a visit looks like',
    showroom_step1_title: 'Walk the floor',
    showroom_step1_desc: 'Catalogue pieces are out and sittable. Open the drawers, lean on the arms — that\'s what they\'re there for.',
    showroom_step2_title: 'Handle the materials',
    showroom_step2_desc: 'Timber samples, velvet and leather swatches, gilding samples. Take swatches home against your curtains.',
    showroom_step3_title: 'Talk to the maker',
    showroom_step3_desc: 'The workshop is behind the showroom. If you\'re commissioning, you can see work at your stage of build and judge the standard directly.',
    showroom_wa_btn: 'Message before you visit',

    // 404 Page
    err_404_eyebrow: '404',
    err_404_title: 'That page isn\'t here.',
    err_404_desc: 'The link may be old, or we may have moved the piece. Everything we build is in the collections — or tell us what you\'re after and we\'ll point you at it.',
    err_404_btn_collections: 'Browse all pieces',
    err_404_btn_home: 'Back to the homepage',
    err_404_btn_wa: 'Ask on WhatsApp',
    err_404_rooms_eyebrow: 'Rooms',
    err_404_rooms_title: 'Start from a room',
  },
  
  bn: {
    brand_name: 'হেভেন ফার্নিচার মার্ট',
    brand_sub: '\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09B6\u09BF\u09B2\u09CD\u09AA \u00B7 \u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE', // কাস্টম শিল্প · চট্টগ্রাম
    lang_toggle: 'English',
    lang_label: '\u09AD\u09BE\u09B7\u09BE: \u09AC\u09BE\u0982\u09B2\u09BE', // ভাষা: বাংলা
    
    // Navigation
    nav_home: 'হোম',
    nav_collections: 'কালেকশন',
    nav_bespoke: 'কাস্টমাইজড',
    nav_materials: 'কাঠ ও উপাদান',
    nav_showroom: 'শো-রুম',
    nav_about: 'আমাদের কথা',
    nav_contact: 'যোগাযোগ',
    nav_ar: 'রুমে বসিয়ে দেখুন',
    nav_search: 'আসবাব খুঁজুন',
    nav_cart: 'কার্ট',
    nav_checkout: 'চেকআউট',
    
    // Piece Page
    finish_title: '\u09B0\u0999 \u0993 \u09AB\u09BF\u09A8\u09BF\u09B6 \u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8', // রঙ ও ফিনিশ পছন্দ করুন
    made_to_order: '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09A4\u09C8\u09B0\u09BF \u0986\u09B8\u09AC\u09BE\u09AC', // অর্ডারে তৈরি আসবাব
    lead_time: '\u09A4\u09C8\u09B0\u09BF\u09B0 \u09B8\u09AE\u09DF', // তৈরির সময়
    dimensions: '\u09AE\u09BE\u09AA (\u09A1\u09BE\u0987\u09AE\u09C7\u09A8\u09B6\u09A8)', // মাপ (ডাইমেনশন)
    materials_heading: '\u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4 \u0989\u09AA\u09BE\u09A6\u09BE\u09A8', // ব্যবহৃত উপাদান
    standard_spec: '\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BE\u09B0\u09CD\u09A1 \u09B8\u09BE\u0987\u099C \u0993 \u09AE\u09BE\u09A8', // স্ট্যান্ডার্ড সাইজ ও মান
    curated_title: '\u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09C7\u09B0 \u09B8\u09C7\u09B0\u09BE \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BE\u09B0\u09CD\u09A1 \u09B0\u09C2\u09AA', // কারিগরের সেরা স্ট্যান্ডার্ড রূপ
    curated_desc: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09AE\u09BE\u09AA\u099C\u09CB\u0996 \u098F\u09AC\u0982 \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B6\u09AA\u09C7\u09B0 \u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09AE\u09BE\u09A8\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0989\u09AA\u09BE\u09A6\u09BE\u09A8\u09C7 \u09A4\u09C8\u09B0\u09BF\u0964', // আমাদের নিখুঁত মাপজোখ এবং ওয়ার্কশপের সর্বোচ্চ মানসম্পন্ন উপাদানে তৈরি।
    btn_order_now: '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8', // অর্ডার করুন
    btn_order_wa: '\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0', // হোয়াটসঅ্যাপে সরাসরি অর্ডার
    btn_call_showroom: '\u09B6\u09CB-\u09B0\u09C1\u09AE\u09C7 \u0995\u09B2 \u0995\u09B0\u09C1\u09A8', // শো-রুমে কল করুন
    btn_add_cart: '\u0995\u09BE\u09B0\u09CD\u099F\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C1\u09A8', // কার্টে যুক্ত করুন
    btn_ask_wa: '\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09BF\u09A8', // হোয়াটসঅ্যাপে পরামর্শ নিন
    btn_view_3d: '\u09E9D \u09A4\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8', // ৩D তে দেখুন
    btn_exit_3d: '\u09E9D \u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8', // ৩D বন্ধ করুন
    btn_ar: '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09C1\u09AE\u09C7 \u09AC\u09B8\u09BF\u09DF\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8', // আপনার রুমে বসিয়ে দেখুন
    custom_toggle: '\u09B8\u09BE\u0987\u099C \u09AC\u09BE \u0995\u09BE\u09A0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u0987\u099C \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8?', // সাইজ বা কাঠ কাস্টমাইজ করতে চান?
    custom_toggle_sub: '\u09B0\u09C1\u09AE\u09C7\u09B0 \u09AE\u09BE\u09AA \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09B8\u09BE\u0987\u099C, \u0995\u09BE\u09A0 \u0993 \u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u09AC\u09BF\u0995\u09B2\u09CD\u09AA \u09A6\u09C7\u0996\u09A4\u09C7 \u099F\u09CD\u09AF\u09BE\u09AA \u0995\u09B0\u09C1\u09A8', // রুমের মাপ অনুযায়ী সাইজ, কাঠ ও অন্যান্য বিকল্প দেখতে ট্যাপ করুন
    estimated_price: '\u0986\u09A8\u09C1\u09AE\u09BE\u09A8\u09BF\u0995 \u09AE\u09C2\u09B2\u09CD\u09AF', // আনুমানিক মূল্য
    price_note: '\u0985\u09A8\u09B2\u09BE\u0987\u09A8\u09C7 \u0995\u09CB\u09A8\u09CB \u099A\u09BE\u09B0\u09CD\u099C \u09A8\u09C7\u0987\u0964 \u09AB\u09BE\u0987\u09A8\u09BE\u09B2 \u09A1\u09CD\u09B0\u09DF\u09BF\u0982 \u0993 \u09AE\u09BE\u09AA \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C7\u0987 \u0995\u09BE\u099C \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09BE \u09B9\u09DF\u0964', // অনলাইনে কোনো চার্জ নেই। ফাইনাল ড্রয়িং ও মাপ নিশ্চিত করেই কাজ শুরু করা হয়।
    reset_standard: '\u09AE\u09C2\u09B2 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BE\u09B0\u09CD\u09A1 \u09AE\u09BE\u09AA\u09C7 \u09AB\u09BF\u09B0\u09C7 \u09AF\u09BE\u09A8', // মূল স্ট্যান্ডার্ড মাপে ফিরে যান
    spec_dimension_legend: '\u09AE\u09BE\u09AA \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 (\u09B8\u09C7.\u09AE\u09BF.)', // মাপ পরিবর্তন (সে.মি.)
    spec_material_legend: '\u0995\u09BE\u09A0 \u0993 \u09AE\u09CD\u09AF\u09BE\u099F\u09C7\u09B0\u09BF\u09DF\u09BE\u09B2 \u0997\u09CD\u09B0\u09C7\u09A1', // কাঠ ও ম্যাটেরিয়াল গ্রেড
    spec_addons_legend: '\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0993 \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09B8\u09C7\u09AC\u09BE', // ডেলিভারি ও অতিরিক্ত সেবা
    cart_added_one: '\u0995\u09BE\u09B0\u09CD\u099F\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7 \u2014 \u0986\u09B0\u0993 \u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8?',
    cart_added_multi: '{qty}\u099F\u09BF \u0995\u09BE\u09B0\u09CD\u099F\u09C7 \u0986\u099B\u09C7 \u2014 \u0986\u09B0\u0993 \u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8?',
    standard_price_from: '{price} \u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1',
    lead_time_format: '\u09A4\u09C8\u09B0\u09BF\u09B0 \u09B8\u09AE\u09DF: {lead}',
    more_from_workshop: '\u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B6\u09AA\u09C7\u09B0 \u0986\u09B0\u09CB \u0986\u09B8\u09AC\u09BE\u09AC',
    step_dec: '\u09AE\u09BE\u09AA \u0995\u09AE\u09BE\u09A8',
    step_inc: '\u09AE\u09BE\u09AA \u09AC\u09BE\u09DC\u09BE\u09A8',
    qr_title: 'আপনার ঘরে বসিয়ে দেখুন',
    qr_desc: 'মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন — কোনো অ্যাপ ছাড়াই সরাসরি এআর চালু হবে।',
    ar_caveat: '<strong>পরিমাপ সংক্রান্ত বিজ্ঞপ্তি:</strong> আমাদের ৩ডি মডেলগুলো এখনও কারখানার মাপের সাথে নিখুঁতভাবে সমন্বয় করা হচ্ছে, তাই এআর-এ প্রদর্শিত আকার সামান্য ভিন্ন হতে পারে। অর্ডার করার পূর্বে নির্দিষ্ট মাপ যাচাই করে নিন।',
    ar_help_notice: '<strong>এই ডিভাইসে সরাসরি এআর খোলা সম্ভব নয়।</strong> আইফোন বা আইপ্যাডে এআর প্রদর্শনের জন্য USDZ ফাইল তৈরি করা হচ্ছে। ডেস্কটপে থাকলে নিচে আপনার ফোন দিয়ে কিউআর কোড স্ক্যান করুন।',
    
    // Categories
    cat_living: '\u09B2\u09BF\u09AD\u09BF\u0982 \u09B0\u09C1\u09AE \u0993 \u09B8\u09CB\u09AB\u09BE', // লিভিং রুম ও সোফা
    cat_living_room: '\u09B2\u09BF\u09AD\u09BF\u0982 \u09B0\u09C1\u09AE \u0993 \u09B8\u09CB\u09AB\u09BE', // লিভিং রুম ও সোফা
    cat_bedroom: '\u09AC\u09C7\u09A1\u09B0\u09C1\u09AE \u0993 \u0996\u09BE\u099F', // বেডরুম ও খাট
    cat_dining: '\u09A1\u09BE\u0987\u09A8\u09BF\u0982 \u099F\u09C7\u09AC\u09BF\u09B2 \u0993 \u09B6\u09CB\u0995\u09C7\u09B8', // ডাইনিং টেবিল ও শোকেস
    cat_office: '\u0985\u09AB\u09BF\u09B8 \u0993 \u099A\u09C7\u09DF\u09BE\u09B0', // অফিস ও চেয়ার
    cat_bespoke: '\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09B6\u09BF\u09B2\u09CD\u09AA\u0995\u09B0\u09CD\u09AE', // কাস্টম শিল্পকর্ম
    
    // WhatsApp prefilled messages
    wa_greeting: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AE\u09BF Heaven Furniture Mart-\u098F\u09B0 {name}-\u098F \u0986\u0997\u09CD\u09B0\u09B9\u09C0\u0964 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09AB\u09BF\u09A8\u09BF\u09B6: {variant}, \u0986\u09A8\u09C1\u09AE\u09BE\u09A8\u09BF\u0995 \u09AE\u09C2\u09B2\u09CD\u09AF: {price}\u0964 \u0986\u09B0\u09CB \u099B\u09AC\u09BF \u0993 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u0964",
    wa_inquiry_format: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AE\u09BF Heaven Furniture Mart-\u098F\u09B0 {name}{fabric} \u0986\u09B8\u09AC\u09BE\u09AC\u099F\u09BF\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF \u0993 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BE\u09A8\u09A4\u09C7 \u0986\u0997\u09CD\u09B0\u09B9\u09C0\u0964 \u09AA\u09C7\u099C: {url}",

    // Home Page
    hero_tap_hint: '\u09E9\u09A1\u09BF \u09A6\u09C7\u0996\u09A4\u09C7 \u099F\u09CD\u09AF\u09BE\u09AA \u0995\u09B0\u09C1\u09A8', // ৩ডি দেখতে ট্যাপ করুন
    home_hero_title: '\u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09BE\u09B2\u099C\u09DF\u09C0 \u0986\u09B8\u09AC\u09BE\u09AC',
    home_hero_sub: '\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u09A6\u0995\u09CD\u09B7 \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09A6\u09C7\u09B0 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09B9\u09BE\u09A4\u09C7 \u0997\u09DC\u09BE \u09B8\u09C0\u099C\u09A8\u09A1 \u0995\u09BE\u09A0, \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09AE\u09BE\u09AA\u099C\u09CB\u0996 \u0993 \u0986\u09AD\u09BF\u099C\u09BE\u09A4\u09CD\u09AF\u09AA\u09C2\u09B0\u09CD\u09A3 \u0986\u09B8\u09AC\u09BE\u09AC\u0964',
    home_cta_collections: '\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8',
    home_cta_bespoke: '\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8',
    home_collections_heading: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8',
    home_bespoke_heading: '\u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09A1\u09BF\u099C\u09BE\u0987\u09A8\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0986\u09B8\u09AC\u09BE\u09AC',
    home_workshop_heading: '\u0986\u0997\u09CD\u09B0\u09BE\u09AC\u09BE\u09A6 \u09B6\u09CB-\u09B0\u09C1\u09AE \u0993 \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B6\u09AA',

    // Collections & Cards
    col_all: '\u09B8\u0995\u09B2 \u0986\u09B8\u09AC\u09BE\u09AC',
    col_filter_cat: '\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF',
    col_showing: '{count}\u099F\u09BF \u09B6\u09BF\u09B2\u09CD\u09AA\u09B8\u09AE\u09CD\u09AE\u09A4 \u0986\u09B8\u09AC\u09BE\u09AC \u09AA\u09CD\u09B0\u09A6\u09B0\u09CD\u09B6\u09BF\u09A4',
    card_view: '\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A6\u09C7\u0996\u09C1\u09A8',
    card_from: '{price} \u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1',

    // Cart & Checkout
    cart_breadcrumb: 'আপনার কার্ট',
    cart_eyebrow: 'আপনার কার্ট',
    cart_heading: 'আপনার অর্ডার, এখন পর্যন্ত।',
    cart_lead: 'প্রতিটি আসবাব আপনার দেওয়া নির্দিষ্ট মাপে ও উপাদানে তৈরি করা হয়। এখানে পরিমাণ পরিবর্তন করতে পারেন, অথবা মাপ ও ফিনিশ পরিবর্তন করতে আসবাবটি পুনরায় খুলুন।',
    cart_notice: 'প্রদর্শিত মূল্য নির্দিষ্ট স্পেসিফিকেশনের জন্য আনুমানিক হিসাব। আসবাব তৈরির পূর্বে চূড়ান্ত মূল্য ও সময় নিশ্চিত করা হয় — অনলাইনে কোনো অর্থ নেওয়া হয় না।',
    cart_title: 'আপনার পছন্দসমূহ',
    cart_empty_title: 'আপনার কার্ট খালি।',
    cart_empty_sub: 'আমাদের প্রতিটি আসবাব চট্টগ্রামের নিজস্ব ওয়ার্কশপে অর্ডারে তৈরি হয়।',
    cart_empty_desc: 'যেকোনো আসবাব খুলুন, মাপ ও উপাদান নির্ধারণ করুন এবং “কার্টে যোগ করুন” চাপুন। এটি কেবল এই ডিভাইসেই সংরক্ষিত থাকে — কোনো অ্যাকাউন্টের প্রয়োজন নেই।',
    cart_browse_cta: 'কালেকশন দেখুন',
    cart_unit_price: 'একক মূল্য',
    cart_quantity: 'পরিমাণ',
    cart_remove: 'মুছে ফেলুন',
    cart_edit_spec: 'স্পেসিফিকেশন পরিবর্তন',
    cart_subtotal: 'আনুমানিক সাবটোটাল',
    cart_est_total: 'আনুমানিক মোট',
    cart_keep_browsing: 'আরও কালেকশন দেখুন',
    cart_empty_action: 'কার্ট খালি করুন',
    cart_clear_confirm: 'আপনার কার্টের সবকিছু মুছে ফেলতে চান?',
    cart_proceed_checkout: 'অর্ডার সম্পন্ন করুন',
    cart_saved_hint: 'শুধুমাত্র আপনার ডিভাইসেই সংরক্ষিত থাকবে। চেকআউটে অর্ডার সম্পন্ন করার পূর্ব পর্যন্ত কোনো তথ্য পাঠানো হবে না।',
    checkout_heading: 'অর্ডার সম্পন্ন করুন',
    checkout_sub: 'ঠিকানা ও যোগাযোগের তথ্য দিন — কাজ শুরুর আগে আমরা চূড়ান্ত মূল্য ও সময় নিশ্চিত করব।',
    checkout_notice: 'অনলাইনে কোনো মূল্য পরিশোধ করতে হয় না। প্রতিটি আসবাব আপনার চাহিদা অনুযায়ী তৈরি করা হয়, তাই চূড়ান্ত নকশার পর আমরা মূল্য নিশ্চিত করব।',
    checkout_order_summary: 'আপনার অর্ডার',
    checkout_summary_hint: 'প্রদর্শিত স্পেসিফিকেশনের আনুমানিক হিসাব। কাজ শুরুর আগে নিশ্চিত করা হবে।',
    checkout_remember_text: 'আপনার তথ্য এই ডিভাইসে ৩০ দিন সংরক্ষিত থাকে, পুনরায় টাইপ করতে হবে না।',
    checkout_forget_btn: 'বিস্মৃত করুন',
    checkout_back_cart: 'কার্টে ফিরে যান',
    checkout_name_label: 'আপনার নাম',
    checkout_name_placeholder: 'রহিম উদ্দিন',
    checkout_phone_label: 'মোবাইল নম্বর',
    checkout_phone_placeholder: '০১XXXXXXXXX',
    checkout_phone_hint: 'এই নম্বরে যোগাযোগ করে আমরা আপনার অর্ডার নিশ্চিত করব।',
    checkout_address_label: 'ডেলিভারি ঠিকানা',
    checkout_address_placeholder: 'বাসা, রোড, এলাকা, জেলা',
    checkout_email_label: 'ইমেইল',
    checkout_email_placeholder: 'নকশা ও ড্রয়িং পাঠানোর জন্য',
    checkout_notes_label: 'বিশেষ কোনো নির্দেশনা আছে কি?',
    checkout_notes_placeholder: 'ঘরের মাপ, নির্দিষ্ট সময়সীমা বা কাপড়ের পছন্দ...',
    checkout_btn_submit: 'অর্ডার নিশ্চিত করুন',
    checkout_btn_wa: 'হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন',
    co_err_name: 'আপনার নাম লিখুন।',
    co_err_phone: 'আমাদের যে নম্বরে ফোন করতে পারি, সেটি দিন।',
    co_err_address: 'কোন ঠিকানায় ডেলিভারি করবে? রোড ও এলাকা হলেই চলবে।',
    co_err_email: 'ইমেইল ঠিকানাটি অসম্পূর্ণ মনে হচ্ছে।',
    co_err_fast: 'একটু অপেক্ষা করুন — আবার অর্ডার বাটনটি চাপুন।',
    co_send_wa: 'এই অর্ডারটি হোয়াটসঅ্যাপে পাঠান',

    // Thanks / Confirmation
    thanks_heading: '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0997\u09CD\u09B0\u09B9\u09A3 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7',
    thanks_sub: '\u09B9\u09C7\u09AD\u09C7\u09A8 \u09AB\u09BE\u09B0\u09CD\u09A8\u09BF\u099A\u09BE\u09B0 \u09AE\u09BE\u09B0\u09CD\u099F-\u098F\u09B0 \u0993\u09AA\u09B0 \u0986\u09B8\u09CD\u09A5\u09BE \u09B0\u09BE\u0996\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964 \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09A8\u09CD\u09B8: {ref}',
    thanks_step1_title: '\u09E7. \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B6\u09AA \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE',
    thanks_step1_desc: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AE\u09BE\u09B8\u09CD\u099F\u09BE\u09B0 \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09B0\u09BE \u0995\u09BE\u09A0\u09C7\u09B0 \u09B8\u09C0\u099C\u09A8\u09BF\u0982 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09C7 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09A1\u09CD\u09B0\u09DF\u09BF\u0982 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09AC\u09C7\u09A8\u0964',
    thanks_step2_title: '\u09E8. \u09AB\u09CB\u09A8\u09C7 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4\u0995\u09B0\u09A3',
    thanks_step2_desc: '\u09B0\u09C1\u09AE\u09C7\u09B0 \u09AE\u09BE\u09AA, \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09AA\u09A5 \u0993 \u09AB\u09BF\u09A8\u09BF\u09B6 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09A4\u09C7 \u0986\u09AE\u09B0\u09BE \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09B2 \u0995\u09B0\u09AC\u09CB\u0964',
    thanks_step3_title: '\u09E9. \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09A4\u09C8\u09B0\u09BF \u0993 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF',
    thanks_step3_desc: '\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09AF\u09A4\u09CD\u09A8\u09C7 \u0986\u09B8\u09AC\u09BE\u09AC \u09A4\u09C8\u09B0\u09BF \u09B6\u09C7\u09B7\u09C7 \u09B8\u09C1\u09B0\u0995\u09CD\u09B7\u09BF\u09A4\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09C1\u09AE\u09C7 \u09AA\u09CC\u0981\u099B\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09AC\u09C7\u0964',
    thanks_wa_notice: '\u09A6\u09CD\u09B0\u09C1\u09A4 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C7 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09BF\u0982 \u09A1\u09BF\u09B0\u09C7\u0995\u09CD\u099F\u09B0\u09C7\u09B0 \u09A6\u09AA\u09CD\u09A4\u09B0\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8:',
    thanks_btn_wa: '\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09A8',
    memo_btn_download: '\u0995\u09CD\u09AF\u09BE\u09B6\u09AE\u09C7\u09AE\u09CB \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 (PDF)',
    memo_btn_view: '\u0995\u09CD\u09AF\u09BE\u09B6\u09AE\u09C7\u09AE\u09CB \u09A6\u09C7\u0996\u09C1\u09A8 / \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F',
    memo_generating: 'PDF \u09A4\u09C8\u09B0\u09BF \u09B9\u099A\u09CD\u099B\u09C7...',

    /* Loading overlays. Written as natural Bengali, not word-for-word: the
       English "Crafting Sanctuary" is brand voice, and the Bengali reads better
       as plain statements of what is happening. */
    loader_early: '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u0982\u0997\u09CD\u09B0\u09B9 \u09B8\u09BE\u099C\u09BE\u09A8\u09CB \u09B9\u099A\u09CD\u099B\u09C7',
    loader_mid: '\u0997\u09CD\u09AF\u09BE\u09B2\u09BE\u09B0\u09BF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4 \u09B9\u099A\u09CD\u099B\u09C7',
    loader_late: '\u09B8\u09AC \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4',
    stage_load_lib: '\u09E9\u09A1\u09BF \u09AD\u09BF\u0989\u09DF\u09BE\u09B0 \u0986\u09A8\u09BE \u09B9\u099A\u09CD\u099B\u09C7',
    stage_load_model: '\u09AE\u09A1\u09C7\u09B2 \u09A8\u09BE\u09AE\u09BE\u09A8\u09CB \u09B9\u099A\u09CD\u099B\u09C7',
    stage_load_ready: '\u0986\u09B0 \u0995\u09BF\u099B\u09C1\u0995\u09CD\u09B7\u09A3',
    stage_err_viewer: '\u09E9\u09A1\u09BF \u09AD\u09BF\u0989\u09DF\u09BE\u09B0 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u0989\u09AA\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF\u099F\u09BF \u098F\u0987 \u0986\u09B8\u09AC\u09BE\u09AC\u09C7\u09B0\u0964',
    stage_err_model: '\u098F\u0987 \u0986\u09B8\u09AC\u09BE\u09AC\u09C7\u09B0 \u09E9\u09A1\u09BF \u09AE\u09A1\u09C7\u09B2 \u098F\u0996\u09A8\u0993 \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09A8\u09BF\u0964 \u0989\u09AA\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF\u099F\u09BF \u098F\u0987 \u0986\u09B8\u09AC\u09BE\u09AC\u09C7\u09B0\u0964',
    stage_hint_rotate: '\u0998\u09C1\u09B0\u09BE\u09A4\u09C7 \u099F\u09C7\u09A8\u09C7 \u09A7\u09B0\u09C1\u09A8\u0964 \u099C\u09C1\u09AE \u0995\u09B0\u09A4\u09C7 \u09AA\u09BF\u099E\u09CD\u099A \u0985\u09A5\u09AC\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09B2 \u0995\u09B0\u09C1\u09A8\u0964',
    stage_hint_tap: '\u09E9\u09A1\u09BF \u09A4\u09C7 \u09A6\u09C7\u0996\u09A4\u09C7 \u099F\u09CD\u09AF\u09BE\u09AA \u0995\u09B0\u09C1\u09A8\u0964',
    stage_no_model: '\u098F\u0987 \u0986\u09B8\u09AC\u09BE\u09AC\u09C7\u09B0 \u09E9\u09A1\u09BF \u09AE\u09A1\u09C7\u09B2 \u098F\u0996\u09A8\u0993 \u09A8\u09C7\u0987 \u2014 \u0989\u09AA\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF\u099F\u09BF\u0987 \u0986\u09B8\u09AC\u09BE\u09AC\u099F\u09BF\u0964',
    stage_ar_preparing: '\u09AE\u09A1\u09C7\u09B2 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4 \u09B9\u099A\u09CD\u099B\u09C7\u2026',

    // Search
    search_title: '\u0986\u09B8\u09AC\u09BE\u09AC \u0996\u09C1\u0981\u099C\u09C1\u09A8',
    search_placeholder: '\u09B8\u09CB\u09AB\u09BE, \u0996\u09BE\u099F, \u09A1\u09BE\u0987\u09A8\u09BF\u0982 \u099F\u09C7\u09AC\u09BF\u09B2, \u0995\u09BE\u09A0\u09C7\u09B0 \u09A8\u09BE\u09AE...',
    search_no_results: '\u201C{query}\u201D \u098F\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u0986\u09B8\u09AC\u09BE\u09AC \u09AE\u09C7\u09B2\u09C7\u09A8\u09BF',

    // Collections Page
    coll_eyebrow: '\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8', // কালেকশন
    coll_title: '\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC, \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09A4\u09C8\u09B0\u09BF\u0964', // প্রতিটি আসবাব, আপনার অর্ডারে তৈরি।
    coll_intro_ar: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 {total}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 {ar}\u099F\u09BF\u09A4\u09C7 \u09B0\u09DF\u09C7\u099B\u09C7 \u09E9D \u09AE\u09A1\u09C7\u09B2 \u09AF\u09BE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u0986\u0997\u09C7\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BF\u099C\u09C7\u09B0 \u09B0\u09C1\u09AE\u09C7 \u09AC\u09B8\u09BF\u09DF\u09C7 \u09A6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8 \u2014 \u09B8\u09C7\u0997\u09C1\u09B2\u09CB\u09A4\u09C7 AR \u099A\u09BF\u09B9\u09CD\u09A8 \u09B0\u09DF\u09C7\u099B\u09C7\u0964 \u09B0\u09C1\u09AE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8 \u09AC\u09BE \u09B8\u09AC\u0997\u09C1\u09B2\u09CB \u09A6\u09C7\u0996\u09C1\u09A8\u0964',
    coll_filter_all: '\u09B8\u09AC\u0997\u09C1\u09B2\u09CB ({count})', // সবগুলো ({count})
    coll_filter_ar: 'AR \u09A4\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8 ({count})', // AR তে দেখুন ({count})
    coll_filter_btn: '\u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0', // \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0
    coll_filter_active: '{count}\u099F\u09BF \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u09B8\u0995\u09CD\u09B0\u09BF\u09DF', // {count}\u099F\u09BF \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC
    // Bengali does not inflect this for one, so the singular is the same
    // sentence with the numeral written in Bengali digits.
    coll_filter_active_one: '\u09E7\u099F\u09BF \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u09B8\u0995\u09CD\u09B0\u09BF\u09DF', // \u09E7\u099F\u09BF \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC
    coll_filter_room_label: '\u09B0\u09C1\u09AE:', // \u09B0\u09C1\u09AE:
    coll_filter_price_label: '\u09AC\u09BE\u099C\u09C7\u099F:', // \u09AC\u09BE\u099C\u09C7\u099F:
    coll_sort_label: '\u09B8\u09BE\u099C\u09BE\u09A8', // সাজান
    coll_sort_featured: '\u09AC\u09BE\u099B\u09BE\u0987\u0995\u09C3\u09A4', // বাছাইকৃত
    coll_sort_price_asc: '\u09A6\u09BE\u09AE: \u0995\u09AE \u09A5\u09C7\u0995\u09C7 \u09AC\u09C7\u09B6\u09BF', // দাম: কম থেকে বেশি
    coll_sort_price_desc: '\u09A6\u09BE\u09AE: \u09AC\u09C7\u09B6\u09BF \u09A5\u09C7\u0995\u09C7 \u0995\u09AE', // দাম: বেশি থেকে কম
    coll_sort_name: '\u09A8\u09BE\u09AE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 (A\u2013Z)', // নাম অনুযায়ী (A–Z)
    coll_price_all: '\u09B8\u09AC \u09A6\u09BE\u09AE', // সব দাম
    coll_price_under_50: '\u09F3\u09EB\u09E6,\u09E6\u09E6\u09E6 \u098F\u09B0 \u09A8\u09BF\u099A\u09C7', // ৳৫০,০০০ এর নিচে
    coll_price_50_100: '\u09F3\u09EB\u09E6,\u09E6\u09E6\u09E6 \u2013 \u09F3\u09E7,\u09E6\u09E6,\u09E6\u09E6\u09E6', // ৳৫০,০০০ – ৳১,০০,০০০
    coll_price_above_100: '\u09F3\u09E7,\u09E6\u09E6,\u09E6\u09E6\u09E6 \u098F\u09B0 \u0989\u09AA\u09B0\u09C7', // ৳১,০০,০০০ এর উপরে
    coll_not_seeing: '\u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09A8\u0995\u09B6\u09BE \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u099A\u09CD\u099B\u09C7\u09A8 \u09A8\u09BE?', // পছন্দের নকশা খুঁজে পাচ্ছেন না?
    coll_not_seeing_lead: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A4\u09C8\u09B0\u09BF \u0985\u09A7\u09BF\u0995\u09BE\u0982\u09B6 \u0986\u09B8\u09AC\u09BE\u09AC\u0987 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997\u09C7 \u09AA\u09CD\u09B0\u09A6\u09B0\u09CD\u09B6\u09BF\u09A4 \u09B9\u09DF \u09A8\u09BE\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u098F\u0995\u099F\u09BF \u09B8\u09CD\u0995\u09C7\u099A, \u099B\u09AC\u09BF \u09AC\u09BE \u09B0\u09C1\u09AE\u09C7\u09B0 \u09AE\u09BE\u09AA \u09A8\u09BF\u09DF\u09C7 \u0986\u09B8\u09C1\u09A8\u0964',
    coll_start_commission: '\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8', // কাস্টম অর্ডার শুরু করুন
    coll_empty: '\u098F\u0987 \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0\u09C7 \u0995\u09CB\u09A8\u09CB \u0986\u09B8\u09AC\u09BE\u09AC \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964',

    // Homepage Story & Guarantees
    home_browse_collections: '\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8', // কালেকশন দেখুন
    home_curated_eyebrow: '\u09AC\u09BE\u099B\u09BE\u0987\u0995\u09C3\u09A4 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997', // বাছাইকৃত ক্যাটালগ
    home_curated_lead: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0986\u0997\u09CD\u09B0\u09BE\u09AC\u09BE\u09A6 \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B6\u09AA\u09C7 \u09B9\u09BE\u09A4\u09C7 \u09A4\u09C8\u09B0\u09BF \u0986\u09B8\u09AC\u09BE\u09AC, \u09AF\u09BE \u09A8\u09BF\u0996\u09C1\u0981\u09A4\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0998\u09B0\u09C7\u09B0 \u09B6\u09CB\u09AD\u09BE \u09AC\u09BE\u09DC\u09BE\u09DF\u0964',
    home_heritage_title: '\u0986\u0997\u09CD\u09B0\u09BE\u09AC\u09BE\u09A6\u09C7 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u0995\u09BE\u09B0\u0996\u09BE\u09A8\u09BE\u09DF\u0964 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09B9\u09BE\u09A4\u09C7 \u0997\u09DC\u09BE\u0964', // আগ্রাবাদে নিজস্ব কারখানায়। নিখুঁত হাতে গড়া।
    home_heritage_lead: '\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE\u09C7 \u09E8\u09EE \u09AC\u099B\u09B0\u09C7\u09B0 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF\u0964 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u0995\u09BE\u09B0\u0996\u09BE\u09A8\u09BE\u09DF \u0995\u09BE\u09A0 \u09B8\u09C0\u099C\u09A8\u09BF\u0982, \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09C7\u09B0 \u09B9\u09BE\u09A4\u09C7 \u0996\u09CB\u09A6\u09BE\u0987 \u098F\u09AC\u0982 \u09B8\u09AE\u0997\u09CD\u09B0 \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u0964',
    guarantee_hardwood: '\u09B8\u09B2\u09BF\u09A1 \u0995\u09BE\u09A0', // সলিড কাঠ
    guarantee_hardwood_sub: '\u09B8\u09C0\u099C\u09A8\u09A1 \u09AE\u09C7\u09B9\u0997\u09A8\u09BF \u0993 \u09AC\u09BE\u09B0\u09CD\u09AE\u09BE \u09B8\u09C7\u0997\u09C1\u09A8 \u0995\u09BE\u09A0', // সিজনড মেহগনি ও বার্মা সেগুন কাঠ
    guarantee_order: '\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0', // কাস্টম অর্ডার
    guarantee_order_sub: '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09C1\u09AE\u09C7\u09B0 \u09B8\u09A0\u09BF\u0995 \u09AE\u09BE\u09AA\u09C7 \u09A4\u09C8\u09B0\u09BF', // আপনার রুমের সঠিক মাপে তৈরি
    guarantee_delivery: '\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF', // সরাসরি ডেলিভারি
    guarantee_delivery_sub: '\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u0998\u09B0\u09C7 \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u0993 \u09AB\u09BF\u099F\u09BF\u0982', // সরাসরি আপনার ঘরে স্থাপন ও ফিটিং
    guarantee_warranty: '\u09B8\u09C7\u09B0\u09BE \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09BF', // সেরা কারিগরি
    guarantee_warranty_sub: '\u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE\u09C7\u09B0 \u09AA\u09B0 \u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE \u099F\u09BF\u0995\u09C7 \u09A5\u09BE\u0995\u09BE\u09B0 \u09AE\u09A4\u09CB \u09AE\u09BE\u09A8',
    footer_desc: '\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u0995\u09BE\u09B0\u0996\u09BE\u09A8\u09BE\u09DF \u09B9\u09BE\u09A4\u09C7 \u0997\u09DC\u09BE \u09AC\u09BF\u09B2\u09BE\u09B8\u09AC\u09B9\u09C1\u09B2 \u0986\u09B8\u09AC\u09BE\u09AC\u0964',
    footer_hours: '\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09B8\u0995\u09BE\u09B2 \u09E7\u09E6\u099F\u09BE \u2013 \u09B0\u09BE\u09A4 \u09EF\u099F\u09BE',
    footer_address: '\u0986\u0997\u09CD\u09B0\u09BE\u09AC\u09BE\u09A6 \u098F\u0995\u09CD\u09B8\u09C7\u09B8 \u09B0\u09CB\u09A1, \u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE, \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6',

    /* Shared chrome. Written as natural Bengali rather than literal renderings —
       "Showroom & directions" becomes "শো-রুম ও যাওয়ার পথ", which is how someone
       would actually say it. */
    brand_tagline: '\u09A8\u0995\u09B6\u09BE\u0964 \u0995\u09BE\u09B0\u09C1\u0995\u09BE\u099C\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AE\u09A8\u09AE\u09A4\u09CB\u0964',
    foot_h_collections: '\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8',
    foot_h_visit: '\u0986\u09B8\u09C1\u09A8',
    foot_h_contact: '\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997',
    foot_showroom_dir: '\u09B6\u09CB-\u09B0\u09C1\u09AE \u0993 \u09AF\u09BE\u0993\u09DF\u09BE\u09B0 \u09AA\u09A5',
    foot_materials_lib: '\u0995\u09BE\u09A0 \u0993 \u0989\u09AA\u09BE\u09A6\u09BE\u09A8',
    foot_see_room: '\u09B0\u09C1\u09AE\u09C7 \u09AC\u09B8\u09BF\u09DF\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8',
    foot_your_cart: '\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u09B0\u09CD\u099F',
    foot_book_consult: '\u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u09C7\u09B0 \u09B8\u09AE\u09DF \u09A8\u09BF\u09A8',
    foot_wa_us: '\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09B2\u09BF\u0996\u09C1\u09A8',
    foot_email_us: '\u0987\u09AE\u09C7\u0987\u09B2 \u0995\u09B0\u09C1\u09A8',
    foot_about: '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09A5\u09BE',
    foot_all_pieces: '\u09B8\u09AC \u0986\u09B8\u09AC\u09BE\u09AC',
    foot_locality: '\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE, \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6',
    ov_wa_anyday: '\u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09A6\u09BF\u09A8 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09B2\u09BF\u0996\u09C1\u09A8',
    ov_made_to_order: '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09A4\u09C8\u09B0\u09BF, \u09E8\u2013\u09E7\u09E8 \u09B8\u09AA\u09CD\u09A4\u09BE\u09B9',
    quote_fab: '\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09A6\u09BE\u09AE \u099C\u09BE\u09A8\u09C1\u09A8',
    aria_main_nav: '\u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u09AE\u09C7\u09A8\u09C1',
    aria_social: '\u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09AE\u09BF\u09A1\u09BF\u09DF\u09BE\u09DF \u09B9\u09C7\u09AD\u09C7\u09A8 \u09AB\u09BE\u09B0\u09CD\u09A8\u09BF\u099A\u09BE\u09B0 \u09AE\u09BE\u09B0\u09CD\u099F',
    aria_menu: '\u09AE\u09C7\u09A8\u09C1',
    aria_lang: '\u09AD\u09BE\u09B7\u09BE \u09AC\u09A6\u09B2\u09BE\u09A8',
    aria_cart_empty: '\u0995\u09BE\u09B0\u09CD\u099F \u0996\u09BE\u09B2\u09BF',
    aria_quote_wa: '\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09A6\u09BE\u09AE \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987',
    skip_to_content: '\u09AE\u09C2\u09B2 \u0985\u0982\u09B6\u09C7 \u09AF\u09BE\u09A8',


    // 10/10 Core Features
    pillars_eyebrow: 'নির্মাণ প্রকৌশল ও মান',
    pillars_heading: 'কারুশিল্পের চার স্তম্ভ',
    pillars_lead: 'আসল রাজকীয় আভিজাত্য লুকিয়ে থাকে কাঠের ভেতরের আর্দ্রতা নিয়ন্ত্রণ, নিখুঁত খাঁজকাটা জোড় এবং বহুস্তরীয় সুরক্ষার মাঝে।',
    pillars_toggle_ours: 'হেভেন কারখানার মান',
    pillars_toggle_market: 'সাধারণ বাজারের মান',
    pillar_moisture_metric: '৮–১২%',
    pillar_moisture_badge: 'ডিজিটাল কিলন মনিটরড',
    pillar_moisture_title: 'কিলন-ড্রাইড আর্দ্রতা নিয়ন্ত্রণ',
    pillar_moisture_sub: 'বর্ষায় কাঠ ফোলা ও বাঁকা রোধে',
    pillar_moisture_desc: 'প্রতিটি কাঠ ডিজিটাল কিলনে কঠোরভাবে ৮-১২% ভারসাম্য আর্দ্রতায় শুকানো হয়। এটি চট্টগ্রামের তীব্র বর্ষার আর্দ্রতা চক্রেও কাঠের জোড় ফাঁক হওয়া বা বিকৃতি সম্পূর্ণ দূর করে।',
    pillar_moisture_m_metric: '২২–৩২%',
    pillar_moisture_m_badge: 'কাঁচা অপরিশোধিত কাঠ',
    pillar_moisture_m_title: 'বাজারের সাধারণ কাঁচা কাঠ',
    pillar_moisture_m_sub: 'শীতকালে ফাটল ও বিকৃতি',
    pillar_moisture_m_desc: 'স্থানীয় সাধারণ দোকানে কাঁচা কাঠ ব্যবহার করা হয় যাতে ২৫% এর বেশি আর্দ্রতা থাকে। শীতের শুষ্ক আবহাওয়ায় কাঠ দ্রুত সংকুচিত হয়ে জোড়গুলো খুলে যায় ও উপরিভাগে ফাটল ধরে।',

    pillar_warranty_metric: '১০ বছর',
    pillar_warranty_badge: 'কারখানার লিখিত অঙ্গীকার',
    pillar_warranty_title: 'কাঠামোগত স্থায়িত্বের ওয়ারেন্টি',
    pillar_warranty_sub: 'লিখিত ওয়ার্কশপ গ্যারান্টি',
    pillar_warranty_desc: 'প্রতিটি বার্মা টিক, মেহগনি এবং চট্টগ্রামের গামারি কাঠের ফ্রেমের জন্য সম্পূর্ণ ১০ বছরের লিখিত কাঠামোগত গ্যারান্টি প্রদান করা হয়।',
    pillar_warranty_m_metric: '০–৬ মাস',
    pillar_warranty_m_badge: 'মৌখিক আশ্বাস মাত্র',
    pillar_warranty_m_title: 'বাজারের সাধারণ নীতি',
    pillar_warranty_m_sub: 'কোনো লিখিত দায়িত্ব নেই',
    pillar_warranty_m_desc: 'সাধারণ শোরুমগুলোতে কেবল মৌখিক আশ্বাস বা অল্প কয়েকদিনের ফিনিশ গ্যারান্টি দেওয়া হয়। ফ্রেম ঢিলে হয়ে গেলে মেরামতের সমস্ত ব্যয়ভার ক্রেতাকেই বহন করতে হয়।',

    pillar_joinery_metric: '১০০%',
    pillar_joinery_badge: 'স্ট্যাপল গান ও পেরেক মুক্ত',
    pillar_joinery_title: 'প্রজন্মের নিখুঁত খাঁজকাটা জোড়',
    pillar_joinery_sub: 'মর্টাইজ, টেনন ও কাঠের পিন',
    pillar_joinery_desc: 'কোনো স্ট্যাপল গান বা ভঙ্গুর পার্টিকেল বোর্ড ছাড়া তৈরি। ভারবহনকারী মূল কাঠামোতে কেবল ঐতিহ্যবাহী গভীর খাঁজকাটা মর্টাইজ-টেনন ও কাঠের পিন জোড় ব্যবহার করা হয়।',
    pillar_joinery_m_metric: 'পেরেক/আঠা',
    pillar_joinery_m_badge: 'এয়ার স্ট্যাপলার ও পার্টেক্স',
    pillar_joinery_m_title: 'বাজারের সাধারণ জোড়াতালি',
    pillar_joinery_m_sub: 'হালকা স্ট্যাপল ও কাঠের গুঁড়া',
    pillar_joinery_m_desc: 'বাণিজ্যিক উৎপাদনে দ্রুততার জন্য এয়ার-স্ট্যাপলার, গোপন এমডিএফ স্ক্র্যাপ এবং সিন্থেটিক আঠা ব্যবহার করা হয়, যা অল্প কয়েক বছরের পারিবারিক ব্যবহারে বা স্থানান্তরে ভেঙে যায়।',

    pillar_finish_metric: '৭ স্তর',
    pillar_finish_badge: 'বহুস্তরীয় ইতালীয় মাইক্রো-আবরণ',
    pillar_finish_title: 'ইতালীয় পলিউরিথেন ব্যারিয়ার',
    pillar_finish_sub: 'ইউভি, তাপ ও তরল প্রতিরোধী',
    pillar_finish_desc: 'সাত স্তরের হাতে ঘষা ইতালীয় পলিউরিথেন মাইক্রো-আবরণ গরম চা, তরল দাগ ও অতিবেগুনি রশ্মির বিবর্ণতা থেকে কাঠকে রক্ষা করে আসল কাঠের উজ্জ্বলতা টিকিয়ে রাখে।',
    pillar_finish_m_metric: '১–২ স্তর',
    pillar_finish_m_badge: 'পাতলা স্প্রে করা বার্নিশ',
    pillar_finish_m_title: 'বাজারের হালকা বার্নিশ',
    pillar_finish_m_sub: 'গরম কাপের সাদা দাগ ও বিবর্ণতা',
    pillar_finish_m_desc: 'সাধারণ আসবাবে সস্তা থিনার মেশানো স্প্রে বার্নিশ দেওয়া হয়। গরম চায়ের কাপ রাখলেই স্থায়ী সাদা গোল দাগ বসে যায় এবং রোদে কয়েক মাসের মধ্যে কাঠের রং ফ্যাকাসে হয়ে যায়।',
    
    ba_eyebrow: 'রুমের রূপান্তর',
    ba_title: 'নকশা ও ড্রয়িং থেকে জীবন্ত আভিজাত্য',
    ba_lead: 'স্লাইডারটি টেনে দেখুন কীভাবে চট্টগ্রামের খালি ফ্ল্যাট আমাদের কাস্টম আসবাব, নিখুঁত খোদাই ও সাজসজ্জায় রাজপ্রাসাদে পরিণত হয়।',
    ba_label_before: 'প্রারম্ভিক রূপ',
    ba_label_after: 'সম্পূর্ণ নান্দনিক রূপ',
    ba_hint: 'তুলনা করতে টানুন',

    cases_eyebrow: 'প্রখ্যাত গ্রাহকদের কাজ',
    cases_title: 'চট্টগ্রামের বাছাইকৃত বাসভবন',
    cases_lead: 'কাতালগঞ্জ, মেহেদীবাগ ও পাঁচলাইশের মতো অভিজাত এলাকার জন্য তৈরি বিশেষ স্থাপত্যসম্মত আসবাবের গল্প।',
    cases_room: 'রুম ও কক্ষ',
    cases_species: 'ব্যবহৃত কাঠ',
    cases_finish: 'ফিনিশ ও টেক্সচার',
    cases_lead_time: 'তৈরির সময়',

    est_eyebrow: 'স্বচ্ছ বাজেট হিসাব',
    est_title: 'কাঠ ও আসবাবের বাজেট ক্যালকুলেটর',
    est_lead: 'আপনার পছন্দের আসবাবের ক্যাটাগরি, কাঠ এবং ফেব্রিক বা চামড়ার গ্রেড নির্বাচন করে আমাদের ক্যাটালগ ভিত্তিক সঠিক বাজেট ও সময় জেনে নিন।',
    est_step1: '১. আসবাবের সংগ্রহ',
    est_step2: '২. কাঠ ও কাঠামোগত ভিত্তি',
    est_step3: '৩. ফেব্রিক বা চামড়ার ফিনিশ',
    est_from: 'আনুমানিক বিনিয়োগ পরিসীমা',
    est_lead_time: 'কারখানায় তৈরির সময়',
    est_cta_wa: 'এই হিসাবটি হোয়াটসঅ্যাপে পাঠান',
    est_note: 'ওয়ার্কশপের সিজনড কাঠের বর্তমান মজুতের ওপর ভিত্তি করে তৈরি হিসাব। কোনো অগ্রিম সাইন-আপের প্রয়োজন নেই।',

    concierge_title: 'ভিআইপি কনসিয়ার্জ পরামর্শ',
    concierge_sub: 'আমাদের মাস্টার কারিগর এবং ব্যবস্থাপনা পরিচালকের সাথে আপনার পছন্দমতো মাধ্যমে কথা বলুন।',
    concierge_t1_title: 'শো-রুমে ব্যক্তিগত ভিজিট',
    concierge_t1_desc: 'আগ্রাবাদ শো-রুমে চা/কফির সাথে ব্যক্তিগত টেবিল রিজার্ভেশন ও কাঠ পরিদর্শন।',
    concierge_t2_title: 'বাসায় এসে লেজার পরিমাপ',
    concierge_t2_desc: 'চট্টগ্রাম শহরের যেকোনো বাসায় আমাদের বিশেষজ্ঞ এসে নিখুঁত মাপ ও কাঠের নমুনা দেখাবেন (সম্পূর্ণ ফ্রি)।',
    concierge_t3_title: 'লাইভ হোয়াটসঅ্যাপ ভিডিও কল',
    concierge_t3_desc: 'প্রবাসী ও ব্যস্ত গ্রাহকদের জন্য কারখানা থেকে সরাসরি খোদাই ও ফিনিশ প্রদর্শনী।',
    concierge_btn: 'পরামর্শ বুক করুন',

    faq_eyebrow: 'সাধারণ জিজ্ঞাসা',
    faq_title: 'গ্রাহকদের গুরুত্বপূর্ণ প্রশ্ন ও উত্তর',
    faq_lead: 'কাঠের স্থায়িত্ব, কাস্টম নকশা ও হোম ডেলিভারি নিয়ে আমাদের স্পষ্ট ও দায়িত্বশীল অঙ্গীকার।',

    spec_sheet_btn: 'স্পেসিফিকেশন শিট ডাউনলোড',
    spec_sheet_title: 'হেভেন ফার্নিচার মার্ট — স্থাপত্য স্পেসিফিকেশন সনদ',
    spec_sheet_print: 'প্রিন্ট / PDF সংরক্ষণ',
    spec_sheet_close: 'বন্ধ করুন',

    faq_q_0: 'আপনারা কি চট্টগ্রাম শহরের ভেতরে বাসায় এসে ফ্রি পরিমাপ করে দেন?',
    faq_a_0: 'হ্যাঁ। খুলশী, নাসিরাবাদ, আগ্রাবাদ, পাঁচলাইশ, হালিশহরসহ চট্টগ্রামের যেকোনো এলাকায় আমাদের অভিজ্ঞ কারিগর লেজার মাপার যন্ত্র ও কাঠের নমুনা নিয়ে আপনার বাসায় উপস্থিত হবেন — কোনো আগাম চার্জ ছাড়াই।',
    faq_q_1: 'বর্ষার আর্দ্রতায় কাঠ বেঁকে যাওয়া বা ঘুনে ধরা রোধে কী ব্যবস্থা নেন?',
    faq_a_1: 'আমাদের কারখানায় কাঠ ডিজিটাল কিলন চেম্বারে ৮–১২% নিয়ন্ত্রিত আর্দ্রতায় শুকানো হয় এবং ভ্যাকুয়াম কপার অ্যান্টি-টারমাইট ট্রিটমেন্ট দেওয়া হয়। আমরা ফ্রেমে ১০ বছরের লিখিত ওয়ারেন্টি সনদ প্রদান করি।',
    faq_q_2: 'আর্কিটেকচারাল ডাইজেস্ট বা পিন্টারেস্টের কোনো বিদেশি ডিজাইন হুবহু তৈরি সম্ভব?',
    faq_a_2: 'অবশ্যই। আমাদের কাজের ৬০ শতাংশই গ্রাহকদের নিজস্ব কাস্টম অর্ডার। যেকোনো ছবি, স্কেচ বা থ্রিডি রেন্ডার দিলে আমরা নিখুঁত অনুপাত ও মানুষের বসার আর্কিটেকচারাল কমফোর্ট হিসাব করে টু-ডি ড্রয়িং বানিয়ে কাজ শুরু করি।',
    faq_q_3: 'অর্ডারের পর কত দিনে ডেলিভারি হয় এবং বাসায় ফিটিং কীভাবে হয়?',
    faq_a_3: 'নকশার জটিলতার ওপর ভিত্তি করে সাধারণত ২ থেকে ১২ সপ্তাহ সময় লাগে। কাজ শেষ হলে আমাদের নিজস্ব টেকনিশিয়ানরা আপনার নির্দিষ্ট রুমে পৌঁছে দিয়ে নিখুঁতভাবে স্থাপন করে দেবে — চট্টগ্রামের ভেতর সম্পূর্ণ ফ্রি।',

    // About Page
    about_workshop_eyebrow: 'আমাদের কারখানা',
    about_workshop_title: 'কাঠের নিখুঁত জোড়াই আভিজাত্যের পরিচয়।',
    about_workshop_lead: '২০২০ সাল থেকে চট্টগ্রামে বিলাসবহুল আসবাব তৈরি করে আসছে হেভেন ফার্নিচার মার্ট। আসবাব জোড়াতালি দেওয়া নয় — খাঁটি সেগুন ও মেহগনি কাঠ কেটে, কাঠের পিন দিয়ে জোড়া লাগিয়ে, বাটালি দিয়ে হাতে খোদাই করে এবং হাতে পলিশ ঘষে প্রতিটি আসবাব গড়া হয়।',
    about_philo_eyebrow: 'আমাদের দর্শন',
    about_philo_title: 'বাহ্যিক চাকচিক্যের চেয়ে কাঠামোর স্থায়িত্ব প্রধান।',
    about_philo_p1: 'চকচকে রঙের স্প্রে যে কেউ করতে পারে। কিন্তু বাটালি দিয়ে তৈরি কাঠের খাঁজ আর কাঠের পেরেক জোড়া কোনো ফাঁকিবাজি দিয়ে হয় না — তাই কাঠামোর প্রতিটি অংশ যত্ন নিয়ে তৈরি। একটি আসবাব কীভাবে দাঁড়িয়ে আছে তা দেখলেই বুঝতে পারবেন আপনি কিসের জন্য মূল্য দিচ্ছেন।',
    about_philo_p2: 'আমাদের প্রতিটি আসবাব আপনার নির্দিষ্ট মাপে তৈরি হয়। এটি কোনো কৃত্রিম বিলাসিতা নয়: এর অর্থ খাট আপনার গদির সাথে খাপ খাবে, শোকেস আপনার ঘরের দেয়ালে মানাবে, আর সোফা অনায়াসে আপনার সিঁড়ি দিয়ে ঘরে তোলা যাবে — কারণ কাঠে হাত দেওয়ার আগেই আমরা সব মাপ যাচাই করে নিই।',
    about_stat_started: 'প্রতিষ্ঠার বছর',
    about_stat_pieces: 'কালেকশনে মোট আসবাব',
    about_stat_ar: '৩ডি ও এআর-এ দেখা যায়',
    about_hands_eyebrow: 'কারিগরদের হাত',
    about_hands_title: 'খোদাইশিল্পী, মিস্ত্রি, পলিশম্যান ও আপহোলস্টারার।',
    about_hands_p1: 'আগ্রাবাদ এক্সেস রোডে শো-রুমের ঠিক পেছনেই আমাদের কারখানা। খোদাই করা হয় নিরেট কাঠে — কোনো প্লাস্টিক বা রেসিন নকশা নেই। সোনালি কারুকাজ হাতে ফয়েল বসিয়ে করা হয়। প্রতিটি পিন বা পেরেক হাতে বসানো হয়, যাতে খোদাই করা কাঠে লাইন একদম সোজা থাকে।',
    about_hands_p2: 'আপনি কোনো আসবাব তৈরির অর্ডার দিলে কাজ চলাকালীন যেকোনো দিন এসে নিজের চোখের সামনে তা তৈরি হতে দেখতে পারেন।',
    about_commission_link: 'কাস্টম অর্ডার কীভাবে হয়',
    about_cta_title: 'আমাদের কাজের মান নিজের চোখে পরখ করুন।',
    about_cta_lead: 'আপনার ঘরে ৩ডি ও এআর প্রযুক্তিতে দেখুন, অথবা আগ্রাবাদ শো-রুমে সরাসরি আসুন।',
    about_btn_collections: 'কালেকশন ঘুরে দেখুন',
    about_btn_showroom: 'শো-রুম পরিদর্শন করুন',

    // Showroom Page
    showroom_eyebrow: 'শো-রুম',
    showroom_title: 'সরাসরি এসে বসে দেখুন।',
    showroom_lead: 'ছবি আর ৩ডি প্রযুক্তি আপনাকে অনেকখানি ধারণা দেবে। কিন্তু বসার প্রকৃত আরাম, কুশনের কোমলতা আর বিকেলের আলোয় কাঠের পলিশের দীপ্তি বুঝতে সরাসরি শো-রুমে আসা প্রয়োজন।',
    showroom_shot_cap: 'আগ্রাবাদ এক্সেস রোড। দোতলা শো-রুম আর ঠিক পেছনেই আমাদের কারখানা।',
    showroom_card_addr_title: 'ঠিকানা ও যোগাযোগ',
    showroom_card_addr_p: 'হেভেন ফার্নিচার মার্ট<br>আগ্রাবাদ এক্সেস রোড<br>চট্টগ্রাম, বাংলাদেশ',
    showroom_card_map_link: 'নিচে মানচিত্রে দেখুন',
    showroom_card_hours_title: 'খোলার সময়',
    showroom_card_hours_p: 'প্রতিদিন খোলা, সকাল ১০টা – রাত ৯টা।<br>শুক্রবার জুমার পর দুপুর ২:৩০ মিনিটে খোলা হয়।',
    showroom_card_hours_sub: 'কোনো নির্দিষ্ট আসবাব দেখার থাকলে আসার আগে হোয়াটসঅ্যাপে জানান — আমরা শো-রুমের ফ্লোরে তা প্রস্তুত রাখব।',
    showroom_card_getting_title: 'আসার উপায়',
    showroom_card_getting_p: 'চট্টগ্রামের বাণিজ্যিক প্রাণকেন্দ্র আগ্রাবাদ এক্সেস রোডে অবস্থিত। যেকোনো সিএনজি বা রাইড-শেয়ার চালক আগ্রাবাদ এক্সেস রোড চেনে; শো-রুমের সামনে পার্কিংয়ের সুব্যবস্থা রয়েছে।',
    showroom_map_title: 'শো-রুমের অবস্থান',
    showroom_map_sub: 'আগ্রাবাদ এক্সেস রোড, চট্টগ্রাম — প্রতিদিন সকাল ১০টা–রাত ৯টা',
    showroom_map_btn: 'গুগল ম্যাপে দিকনির্দেশনা দেখুন',
    showroom_visit_title: 'শো-রুম পরিদর্শনে কী কী দেখবেন',
    showroom_step1_title: 'আসবাব ঘুরে ঘুরে দেখুন',
    showroom_step1_desc: 'কালেকশনের আসবাব সাজানো আছে এবং বসে দেখার সুযোগ রয়েছে। ড্রয়ার টেনে দেখুন, সোফার হাতলে হাত বুলিয়ে অনুভব করুন।',
    showroom_step2_title: 'উপাদান হাতে নিয়ে পরখ করুন',
    showroom_step2_desc: 'কাঠের নমুনা, ভেলভেট ও চামড়ার সোয়াচ এবং গোল্ড লিফের ফিনিশ পরখ করুন। আপনার পর্দার সাথে মেলাতে ফ্যাব্রিকের নমুনা বাসায় নিয়ে দেখতে পারেন।',
    showroom_step3_title: 'কারিগরদের সাথে কথা বলুন',
    showroom_step3_desc: 'শো-রুমের পেছনেই আমাদের কারখানা। কাস্টম অর্ডার দিলে তৈরির বিভিন্ন ধাপে এসে সরাসরি কাজের মান যাচাই করতে পারবেন।',
    showroom_wa_btn: 'আসার আগে হোয়াটসঅ্যাপে জানান',

    // 404 Page
    err_404_eyebrow: '৪০৪',
    err_404_title: 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।',
    err_404_desc: 'লিংকটি হয়তো পুরোনো, অথবা আসবাবটি সরানো হয়েছে। আমাদের তৈরি সকল আসবাব কালেকশনে রয়েছে — অথবা আপনার পছন্দের কথা আমাদের জানান।',
    err_404_btn_collections: 'সকল আসবাব দেখুন',
    err_404_btn_home: 'হোমপেজে ফিরে যান',
    err_404_btn_wa: 'হোয়াটসঅ্যাপে জানতে চান',
    err_404_rooms_eyebrow: 'রুম অনুযায়ী',
    err_404_rooms_title: 'রুম অনুযায়ী পছন্দ করুন',
  }
};

export const LANG_STORAGE_KEY = 'hfm_lang';
export const LANG_EVENT = 'hfm:lang';

export function currentLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function setLang(lang) {
  const chosen = lang === 'bn' ? 'bn' : 'en';
  try {
    localStorage.setItem(LANG_STORAGE_KEY, chosen);
  } catch {}
  document.documentElement.lang = chosen;
  const evt = new CustomEvent(LANG_EVENT, { detail: { lang: chosen }, bubbles: true });
  document.dispatchEvent(evt);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: chosen } }));
  }
  return chosen;
}

export function t(key, lang = currentLang()) {
  const dict = I18N[lang];
  if (dict && dict[key] !== undefined && dict[key] !== '') return dict[key];
  if (lang !== 'en' && I18N.en && I18N.en[key] !== undefined && I18N.en[key] !== '') return I18N.en[key];
  return '';
}

