/* ============================================================
   PFASWAP — data layer
   Brand: Vol. 01 identity direction + Direction A mark.
   ============================================================ */

const SITE_NAME = 'PFASwap';
const SITE_TAGLINE = 'The quiet standard for a lower-exposure home';

/** Shown on About and Privacy. */
const SITE_CONTACT_EMAIL = 'michelle@pfaswap.com';

/** Amazon Associates tracking ID. Placeholder tags are refused by amazonAffiliateTag(). */
const AMAZON_AFFILIATE_TAG = 'pfashomeguide-20';

const AMAZON_DISCLOSURE = 'As an Amazon Associate we earn from qualifying purchases.';

const HEALTH_DISCLAIMER =
  'Educational information only — not medical advice. Exposure varies by person and product. ' +
  'Verify current labels and consult a qualified professional for personal health decisions.';

/* ── Membership ────────────────────────────────────────────── */

const SUBSCRIPTION = {
  memberPill: 'Ranked by exposure, not alarm',
  subline: 'Twenty-one places forever chemicals get into an ordinary home — ordered so you fix the water filter before you worry about the rain jacket.',
  cta: 'Start 7 days free',
  ctaMember: 'Open the full list',
  note: 'Then $2.99/mo · Cancel any time',
  price: '$2.99',
  priceUnit: '/month',
  trialDays: 7,
  unlockLabel: 'See membership →',
  lockedLabel: 'Members',
};

/**
 * Master switch for the paid tier.
 *
 * false — the whole guide is open, the membership section reads as coming
 *         soon, and no call to action can dead-end on an unconfigured
 *         Stripe. This is the correct state until STRIPE_SECRET_KEY,
 *         STRIPE_PRICE_ID and MEMBER_SECRET are all set in Vercel.
 * true  — gating returns exactly as built: ranks 1–FREE_RANKS free in full,
 *         everything above held for members.
 *
 * Flip this one line. Nothing else needs to change.
 */
const MEMBERSHIP_LIVE = false;

/** How many ranks are free, in full. Everything above this rank is gated. */
const FREE_RANKS = 3;

/**
 * Product categories visible without membership — those attached to the
 * free ranks. Affiliate links need to be reachable by everyone, not only
 * by members; the paid tier is the ranked list, not the existence of a
 * shopping link. Derived, so it follows FREE_RANKS automatically.
 */
function freeProductKeys() {
  return getRankedEntries(FREE_RANKS)
    .map((e) => e.item.productKey)
    .filter(Boolean);
}

/** Cached member state. Source of truth is /api/member-status — never this value. */
const MEMBER_CACHE_KEY = 'pfaswap_member_cache';

/* ── Chemical families ─────────────────────────────────────────
   The site leads with PFAS. The model carries the neighbours that
   live in the same objects, so coverage can broaden without a
   rebuild. Every hotspot declares one or more.
   ──────────────────────────────────────────────────────────── */

const FAMILIES = {
  pfas: {
    label: 'PFAS',
    full: 'Per- and polyfluoroalkyl substances',
    short: 'Forever chemicals — they do not break down, in the environment or in you.',
    persistence: 'accumulates',
  },
  microplastics: {
    label: 'Microplastics',
    full: 'Microplastic and nanoplastic particles',
    short: 'Plastic fragments shed by wear, heat and abrasion.',
    persistence: 'unclear',
  },
  plasticizers: {
    label: 'Bisphenols',
    full: 'Bisphenols — BPA, BPS, BPF',
    short: 'Used in can linings, bottle coatings and receipt paper. Unlike PFAS, they clear the body quickly, so cutting the source works fast.',
    persistence: 'clears',
  },
};

/* ── How long it stays ─────────────────────────────────────────
   Deliberately NOT a meter and never charted. The gap between
   years and a day is around 1000:1 — a linear bar makes one of
   them invisible and a log scale reads as a lie to anyone who
   does not read log scales. And the phrase "half-life" is avoided
   throughout: people reliably hear it as "gone by then".

   This is a separate property from exposure, not folded into the
   rank. Same reason products carry no composite score: combining
   them would hide the thing worth seeing.
   ──────────────────────────────────────────────────────────── */

/**
 * Every label starts with "Stays" on purpose.
 *
 * An earlier version read just "Not established" under Microplastics, which
 * reads as "not established to be in this product" — the opposite of the
 * meaning. The word "Stays" presupposes presence, so it supplies the subject
 * the reader would otherwise guess at. Keep the parallel structure if these
 * are ever reworded: all three answer the same question, "how long does it
 * stay in you?", and none of them is about whether it is there.
 */
const PERSISTENCE = {
  accumulates: {
    short: 'Stays: years',
    label: 'Stays for years, and builds up',
    action: 'Replace the object once. One purchase, permanent effect.',
    hint: 'It is there, and what you take in today is still in you years from now — so every exposure adds to the last.',
  },
  clears: {
    short: 'Stays: about a day',
    label: 'Stays about a day',
    action: 'Change the habit rather than buy something. You see the result this week.',
    hint: 'It is there, but your level reflects the last day or two rather than the last decade. Cut the source and it falls.',
  },
  unclear: {
    short: 'Stays: not yet known',
    label: 'Stays: not yet known',
    action: 'Worth reducing where it is easy, but we will not pretend to know the timeline.',
    hint: 'It is there. How long it stays in the body is what has not been well characterised yet, and we would rather say so than invent a number.',
  },
};

function persistenceOf(familyKey) {
  var fam = FAMILIES[familyKey];
  return PERSISTENCE[fam && fam.persistence] || PERSISTENCE.unclear;
}

/* The two-clocks explainer. One concrete comparison beats a chart. */
const CLOCKS = {
  heading: 'Two different clocks',
  intro: 'Not everything on this list behaves the same way once it is in you, and the difference changes what you should actually do about it.',
  columns: [
    {
      family: 'Forever chemicals',
      time: 'Years',
      body: 'What you take in today is still measurable years from now, so exposures stack. That makes replacing the object worth doing once and properly — a pan you buy this month keeps paying off.',
    },
    {
      family: 'Bisphenols',
      time: 'About a day',
      body: 'Your level reflects roughly the last day, not the last decade. No purchase required: change what you buy at the shop and the number falls by the end of the week.',
    },
  ],
  line: 'Cut canned food this week and your bisphenol level is back to baseline by tomorrow. Retire a scratched non-stick pan today and the PFAS already in you will still be measurable years from now. Same kitchen, same afternoon, two completely different clocks.',
  third: {
    family: 'And microplastics?',
    body: 'A third case, and an honest one: how long they stay in the body has not been well characterised yet. Where you see "stays: not yet known" on this site, it means the timeline is unsettled — never that the material is absent. We would rather tell you the clock is unknown than invent a number for it.',
  },
  foot: 'This is also why some entries here have no product to buy. Where the mechanism is a habit rather than an object, a shopping link would be the wrong answer.',
};

/**
 * Where a hotspot's PFAS premise did not survive checking, we relabel it
 * rather than keep the framing because the advice is still good. The site
 * says so on the page — being the guide that checked and corrected itself
 * is worth more than appearing to have been right the first time.
 */
const NOT_PFAS_NOTE =
  'We checked this one and it is not a PFAS story. The advice still holds, but the chemistry is different — here is what is actually going on.';

/* ── Exposure model ────────────────────────────────────────────
   Scored on frequency × directness. `units` drives the signal
   meter — one hue at four strengths, so more units always means
   more exposure. No hazard colour anywhere.
   ──────────────────────────────────────────────────────────── */

const EXPOSURE_TIERS = {
  critical: {
    label: 'Highest exposure',
    short: 'Swap first',
    units: 4,
    order: 0,
    hint: 'Daily use, with direct transfer into food, water, or your body.',
  },
  high: {
    label: 'High exposure',
    short: 'High',
    units: 3,
    order: 1,
    hint: 'Frequent contact, or strong leaching when used as intended.',
  },
  moderate: {
    label: 'Moderate exposure',
    short: 'Moderate',
    units: 2,
    order: 2,
    hint: 'Adds up over time — swap when you can.',
  },
  lower: {
    label: 'Lower exposure',
    short: 'Lower',
    units: 1,
    order: 3,
    hint: 'A smaller route for most people, but still worth knowing.',
  },
};

/* ── Evidence ──────────────────────────────────────────────────
   Shown in the credibility rail, not the hero. Every entry links
   to a primary source. Claims are about exposure and persistence
   — never about an individual health outcome.
   ──────────────────────────────────────────────────────────── */

const EVIDENCE = [
  {
    figure: '97%',
    text: 'of Americans have measurable PFAS in their blood.',
    source: 'CDC · ATSDR',
    url: 'https://www.atsdr.cdc.gov/pfas/health-effects/index.html',
  },
  {
    figure: 'Years',
    text: 'PFAS persist in the body, so today’s exposure adds to what is already there. That is the whole argument for reducing intake rather than trying to undo it later.',
    source: 'EPA · PFAS Explained',
    url: 'https://www.epa.gov/pfas/pfas-explained',
  },
  {
    figure: 'Falling',
    text: 'Blood levels of the PFAS phased out in the early 2000s have dropped substantially since — population-scale evidence that reducing exposure actually lowers body burden.',
    source: 'CDC · National Biomonitoring',
    url: 'https://www.cdc.gov/biomonitoring/PFAS_FactSheet.html',
  },
  {
    figure: 'Water',
    text: 'Municipal supplies are a recognised route, and boiling does not remove PFAS — which is why a certified filter sits at rank one and not rank nine.',
    source: 'EPA · Drinking water',
    url: 'https://www.epa.gov/pfas/pfas-explained',
  },
];

/* ── What reducing exposure does ───────────────────────────────
   Mechanism, not promise. No health outcome is claimed.
   ──────────────────────────────────────────────────────────── */

const BENEFITS = [
  {
    title: 'Body burden falls when intake falls',
    body: 'PFAS leave the body slowly, over years — but they do leave, and what you stop taking in stops adding to what is already there.',
  },
  {
    title: 'It has already worked once, at scale',
    body: 'The PFAS phased out in the early 2000s show sharply lower blood levels across the US population today. Reducing exposure demonstrably changes the number.',
  },
  {
    title: 'A swap is permanent',
    body: 'Change the pan once and the daily exposure is gone for the life of the pan. Unlike most health advice, this compounds without any ongoing effort.',
  },
];

/* ── Hotspots ──────────────────────────────────────────────────
   `rank` is editorial and explicit: exposure tier first, with the
   kitchen and the bedroom weighted up — the two rooms where
   contact is daily and prolonged.
   ──────────────────────────────────────────────────────────── */

const HOTSPOT_ROOMS = [
  {
    id: 'kitchen',
    label: 'Kitchen',
    blurb: 'Where exposure is daily and goes straight into food.',
    items: [
      {
        id: 'tap',
        label: 'Tap water',
        rank: 1,
        exposure: 'critical',
        families: ['pfas'],
        detail: 'Drinking and cooking water — a daily exposure route.',
        why: 'PFAS from industrial runoff and legacy contamination end up in municipal water. You drink it, cook pasta in it and make coffee with it, so even low concentrations add up every single day. Boiling does not remove PFAS — it concentrates them.',
        alternatives: [
          'Use a filter certified to reduce PFAS — look for NSF/ANSI 53 certified for Total PFAS reduction. A general "filters contaminants" claim is not the same thing, and neither is certification for lead.',
          'Filter the water you cook with too. Rice, pasta, soup and coffee all absorb it.',
          'Check your local water report or the EPA data for your zip code before buying anything.',
        ],
        productKey: 'water',
      },
      {
        id: 'pans',
        label: 'Non-stick pans',
        rank: 2,
        exposure: 'critical',
        families: ['pfas'],
        detail: 'Scratched coatings release PFAS directly into food.',
        why: 'Traditional non-stick coatings are fluoropolymer-based. When a pan scratches or overheats, particles and fumes can transfer into food. Daily skillet use makes this one of the highest-impact swaps in the house.',
        alternatives: [
          'Switch your main everyday pan to cast iron or stainless steel.',
          'Retire scratched non-stick now — don’t wait for it to visibly peel.',
          'Cook on medium heat; high heat degrades coatings faster.',
        ],
        productKey: 'cookware',
      },
      {
        id: 'plastic',
        label: 'Heated plastic',
        rank: 9,
        exposure: 'high',
        families: ['pfas', 'microplastics', 'plasticizers'],
        detail: 'Microwave containers and cling film.',
        why: 'Heat makes plastic containers and wrap release more of what they are made of. Microwaving leftovers in plastic — or pouring hot food into it — is one of the fastest ways to increase dietary exposure, and it releases microplastic particles as well as coating chemicals.',
        alternatives: [
          'Store and reheat in glass or stainless steel.',
          'Never microwave food in plastic, even when it is labelled microwave-safe. That label means the container survives, not that nothing migrates.',
          'Cover food with a plate instead of cling film.',
        ],
        productKey: 'storage',
      },
      {
        id: 'cans',
        label: 'Canned food',
        rank: 21,
        exposure: 'lower',
        families: ['plasticizers'],
        notPfas: true,
        detail: 'Epoxy liners — a bisphenol route, not a PFAS one.',
        why: 'We checked this one and the PFAS premise did not hold: there is no evidence PFAS is used in food can linings. What is there is bisphenol. Roughly 75% of US canned food is lined with a BPA-based polymer, by the canning industry’s own estimate, and a randomised crossover trial found urinary BPA rose 206% four hours after a canned meal compared with the same people eating fresh food. That is stronger evidence than most PFAS findings on this site — and unlike PFAS, it clears within about a day.',
        alternatives: [
          'Switch to dried beans, lentils and grains — no lining at all, cheaper, and they keep longer.',
          'Frozen vegetables are the next best thing for anything you would have bought canned.',
          'Buy tomatoes in glass jars where you can; acidic foods pull the most out of a liner.',
          'Treat "BPA-free" cans with suspicion — the replacements are usually BPS or BPF, which the EPA expects to behave similarly.',
        ],
        productKey: null,
      },
      {
        id: 'bottles',
        label: 'Bottled & sparkling drinks',
        rank: 20,
        exposure: 'lower',
        families: ['plasticizers', 'microplastics'],
        notPfas: true,
        detail: 'Container linings — and the obvious swap is the wrong one.',
        why: 'Also not PFAS: the documented plastic-fluorination route is HDPE, not the PET used for bottled water and carbonating bottles. The real issue is what a container needs to line itself with. Aluminium cannot hold liquid bare, so every aluminium can and bottle carries an interior epoxy coating built on BPA — which makes switching from plastic to aluminium a step backwards, not forwards. Unscrew a stainless bottle and you see stainless; unscrew an aluminium one and you are looking at plastic.',
        alternatives: [
          'Best: bare stainless steel or glass — neither needs a lining at all.',
          'Acceptable: PET plastic — no lining and no bisphenol, whatever its other faults.',
          'Avoid: aluminium bottles and cans — always lined, and the lining is bisphenol.',
          'If you carbonate at home, check your bottle’s expiry date. Plastic carbonating bottles are stamped with one because they degrade under pressure.',
        ],
        callout: {
          title: 'Your SodaStream bottle has an expiry date. Go and look.',
          body: 'Plastic carbonating bottles degrade under repeated pressure, which is why they are date-stamped — SodaStream says about three years — and why around 51,000 were recalled in the US in 2017 because they could burst (no injuries were reported). Most people have never noticed the date. If your machine has sat in a cupboard for a few years, you are probably carbonating in an expired bottle right now. Glass carafes carry no such date, though they should be replaced if chipped; a stainless carbonating bottle has none either.',
        },
        productKey: 'carbonation',
      },
    ],
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    blurb: 'Eight hours a night of breathing and skin contact — the longest single exposure window in the day.',
    items: [
      {
        id: 'air',
        label: 'Bedroom air & dust',
        rank: 8,
        exposure: 'high',
        families: ['pfas', 'microplastics'],
        detail: 'What you breathe for eight hours, every night.',
        why: 'PFAS and microplastic fibres accumulate in household dust shed from carpets, furniture and textiles. Bedroom air is the air you breathe longest and most deeply. If the dust carries it, so does the room.',
        alternatives: [
          'Run a true-HEPA purifier in the bedroom overnight.',
          'Vacuum with a HEPA-filter vacuum weekly — ordinary vacuums re-emit fine dust.',
          'Change HVAC filters on schedule. A clogged filter stops filtering.',
        ],
        productKey: 'air',
      },
      {
        id: 'mattress',
        label: 'Mattress protectors',
        rank: 6,
        exposure: 'high',
        families: ['pfas'],
        detail: 'A waterproof barrier directly under you, all night.',
        why: 'Waterproof mattress protectors use fluorinated barriers to block liquid. That barrier sits directly beneath you, and body heat plus sweat increase contact with the treated surface — for eight hours a night, over years.',
        alternatives: [
          'Use a plain cotton mattress pad if leaks are not a real concern.',
          'Where you need waterproofing, look for protectors labelled PFAS-free or fluorine-free.',
          'Layer a washable cotton cover over any protector you keep.',
        ],
        productKey: 'bedding',
      },
      {
        id: 'sheets',
        label: 'Bed sheets',
        rank: 14,
        exposure: 'moderate',
        families: ['pfas'],
        detail: 'Stain- and wrinkle-resistant finishes against skin.',
        why: '"Easy care", wrinkle-free and stain-resistant sheets are often treated with fluorinated chemicals so that spills bead up. You sleep against that fabric for eight hours — long contact, warm and slightly damp, every night.',
        alternatives: [
          'Choose 100% cotton or linen with no stain- or wrinkle-resistant claim on the label.',
          'Organic cotton skips many fabric finishes by certification.',
          'Wash new sheets before first use to rinse off surface finishes.',
        ],
        productKey: 'bedding',
      },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    blurb: 'Small products, used every day, often on absorbent tissue.',
    items: [
      {
        id: 'floss',
        label: 'Dental floss',
        rank: 3,
        exposure: 'critical',
        families: ['pfas'],
        detail: 'Many conventional flosses are PTFE-coated.',
        why: 'Glide-style and other ultra-smooth flosses often use PTFE — a Teflon-family coating — so they slide between teeth. You are placing that coating directly against gum tissue, one of the more absorbent surfaces you have, twice a day.',
        alternatives: [
          'Switch to silk or woven floss with no PTFE coating.',
          'Floss picks made from silk or unwaxed thread work the same way.',
          'If floss feels slick or waxy-smooth, check the label for PTFE.',
        ],
        productKey: 'floss',
      },
      {
        id: 'tp',
        label: 'Toilet paper',
        rank: 17,
        exposure: 'moderate',
        families: ['pfas'],
        detail: 'A minor route — the PFAS mostly ends up in wastewater, not on you.',
        why: 'A 2023 University of Florida study found PFAS in toilet paper from around the world, mostly a compound called 6:2 diPAP that comes from paper processing. The finding that matters is where it goes: down the toilet and into sewage sludge. The study did not measure absorption through skin, and nobody has yet. Recycled content did not change the levels, and independent screening found traces in bamboo, recycled and virgin papers alike.',
        alternatives: [
          'Use less. A bidet attachment cuts toilet paper use the most, and costs less than a year of premium rolls.',
          'Choose plain, unscented, undyed paper — fewer additives, whatever the fibre.',
          'Do not pay extra for "bamboo" or "recycled" on PFAS grounds. Neither label predicted the test results.',
        ],
        productKey: null,
      },
      {
        id: 'skin',
        label: 'Skincare & sunscreen',
        rank: 4,
        exposure: 'high',
        families: ['pfas'],
        detail: 'Makeup — waterproof mascara above all — worn on skin, eyes and lips every day.',
        why: 'Fluorinated compounds are used in cosmetics for spreadability, wear and water resistance. When University of Notre Dame researchers tested 231 cosmetics in 2021, about half showed high fluorine levels, waterproof mascara most often — and almost none listed PFAS among the ingredients. These products go on daily, near the eyes and on the lips, and stay there for hours.',
        alternatives: [
          'Skip "waterproof", "long-wear" and "transfer-proof" formulas, especially for mascara and foundation — that is where fluorine turned up most.',
          'Check ingredient lists for anything with "fluoro" or "perfluoro" in the name, and for PTFE.',
          'Simplify the routine. Fewer products means fewer unknowns.',
          'Favour brands that publish PFAS-free or fluorine-free testing rather than just saying "clean".',
        ],
        productKey: 'skin',
      },
      {
        id: 'clean',
        label: 'Bathroom cleaners',
        rank: 18,
        exposure: 'lower',
        families: ['pfas'],
        detail: 'Sprays and toilet bowl treatments.',
        why: 'Heavy-duty bathroom sprays and some toilet treatments use surfactants that may contain or break down into PFAS. You breathe the mist while cleaning, and residue stays on surfaces you touch afterwards.',
        alternatives: [
          'Vinegar and water handles mirrors, glass and counters.',
          'Baking soda paste scrubs tubs and tile.',
          'Skip "extra strength" sprays where a simple option works.',
        ],
        productKey: 'clean',
      },
    ],
  },
  {
    id: 'everyday',
    label: 'Everyday & out of the house',
    blurb: 'The exposures that happen away from home and come back with you.',
    items: [
      {
        id: 'takeout',
        label: 'Takeout packaging',
        rank: 11,
        exposure: 'moderate',
        families: ['pfas'],
        detail: 'Grease-resistant wrappers and boxes.',
        why: 'Fast food wrappers, burger boxes and pastry bags commonly use fluorinated coatings so grease does not soak through. Hot, oily food sits directly on the treated surface — one of the most overlooked food-contact routes there is.',
        alternatives: [
          'Cook at home more often. This is the single largest reduction available.',
          'Move takeout onto a plate immediately — don’t eat out of the wrapper.',
          'Carry a stainless lunch box for leftovers.',
        ],
        productKey: 'food',
      },
      {
        id: 'hot_cups',
        label: 'Hot drink cups',
        rank: 16,
        exposure: 'moderate',
        families: ['pfas', 'microplastics'],
        detail: 'Paper cups are rarely PFAS-treated. The plastic lining is the bigger issue.',
        why: 'Paper hot cups are lined with plastic so they do not leak — usually polyethylene — rather than grease-proofed, and a US study of fast-food packaging found no fluorine in any of the paper cups it tested. What hot liquid does pull out of that lining is microplastic: researchers counted around 25,000 particles in 100 ml of hot water left in a lined paper cup for 15 minutes. Some moulded-fibre "compostable" cups and bowls are a different story and have tested positive for PFAS.',
        alternatives: [
          'Carry a cup with a bare stainless steel or glass interior. Many cafés discount it.',
          'Avoid travel mugs sold as "ceramic-lined" or "nonstick" inside — that is an undisclosed coating, and some nonstick interiors are PTFE.',
          'If you are staying, ask for a ceramic mug.',
          'Drink through the opening rather than letting the drink sit against a plastic lid.',
        ],
        productKey: 'hot_cups',
      },
      {
        id: 'popcorn',
        label: 'Microwave popcorn bags',
        rank: 13,
        exposure: 'moderate',
        families: ['pfas'],
        detail: 'The inner lining resists oil and high heat.',
        why: 'Microwave popcorn bags are engineered to survive high heat and hot oil, and their inner linings have historically used PFAS-related treatments. Steam carries what is in the lining into the popcorn.',
        alternatives: [
          'Pop kernels on the stovetop or in an air popper.',
          'Use a glass bowl with a vented cover in the microwave.',
          'Buy plain kernels — cheaper per serving, and no bag involved.',
        ],
        productKey: 'popcorn',
      },
      {
        id: 'wrappers',
        label: 'Pizza boxes & grease paper',
        rank: 5,
        exposure: 'high',
        families: ['pfas'],
        detail: 'Grease-proof paper and cardboard liners.',
        why: 'Pizza boxes, microwave pastry wrappers and butter paper use stain- and grease-resistant treatments. Heat and oil both increase what can move from the surface into the food resting on it.',
        alternatives: [
          'Slide pizza onto a plate or board rather than eating off the box.',
          'Choose places that use plain, untreated cardboard where you can.',
          'At home, use parchment labelled unbleached and PFAS-free.',
          'PFAS grease-proofers stopped being sold into the US market in February 2024 — but that phase-out is voluntary and unmonitored, older stock and imports remain, and you cannot check it at the counter. The hotspot is closing, not closed.',
        ],
        productKey: 'food',
      },
      {
        id: 'receipts',
        label: 'Store receipts',
        rank: 19,
        exposure: 'lower',
        families: ['plasticizers'],
        notPfas: true,
        detail: 'Thermal paper — a bisphenol route, not a PFAS one.',
        why: 'We looked for testing that shows PFAS in receipt paper and found none. What is there is bisphenol: thermal paper is coated with a chemical developer, and in a 2023 test of 245 US receipts 80% used BPS and 2% BPA. It rubs onto skin, far more when hands are wet or freshly sanitised — one study measured about 185 times more transfer to wet hands than dry ones. Cashiers who handled BPS receipts saw their BPS levels double over a shift. Unlike PFAS, bisphenols clear in about a day.',
        alternatives: [
          'Say no to a paper receipt, or ask for an emailed one.',
          'Handle receipts with dry hands — not straight after hand sanitiser or lotion.',
          'Wash your hands before you eat or cook.',
          'Don’t give receipts to children to hold.',
        ],
        productKey: null,
      },
      {
        id: 'furniture',
        label: 'Stain-resistant furniture',
        rank: 7,
        exposure: 'high',
        families: ['pfas', 'microplastics'],
        detail: 'Treated upholstery, carpet and car seats.',
        why: 'Sofas, carpets and car seats sold as stain- or spill-resistant generally use fluorinated fabric treatments. These shed into household dust over time — which matters most in homes where children spend time on the floor.',
        alternatives: [
          'Choose untreated natural fabrics when buying new, and decline the stain-protection add-on.',
          'Vacuum with a HEPA filter regularly.',
          'Wash hands after children have been playing on carpet, before snacks.',
        ],
        productKey: 'air',
      },
    ],
  },
  {
    id: 'wardrobe',
    label: 'Wardrobe',
    blurb: 'Treated fabrics, worn against skin for hours.',
    items: [
      {
        id: 'outer',
        label: 'Rain jackets',
        rank: 15,
        exposure: 'moderate',
        families: ['pfas', 'microplastics'],
        detail: 'DWR waterproof and stain-resistant coatings.',
        why: 'Most waterproof jackets use a durable water repellent finish, historically PFAS-based. Jackets are worn for hours in rain and sweat, and older gear sheds its treatment progressively as it wears.',
        alternatives: [
          'Check the membrane, not just the finish. "PFC-free DWR" says nothing about the waterproof layer underneath — look for a PU membrane, or Gore-Tex ePE rather than older Gore-Tex.',
          'Treat a "contains PFAS — cannot ship to CA, NY or CO" notice on a retailer page as the answer, whatever the brand page says.',
          'Buy fewer waterproof pieces — one good shell beats a closet of coated gear.',
          'Re-proofing a jacket does not remove the PFAS already in its finish. But if you are re-proofing anyway, use a fluorine-free wash-in such as Nikwax rather than an old fluorinated spray.',
        ],
        callout: {
          title: 'The label that tells you more than the brand does',
          body: 'Rain shells are the one clothing category California and New York both exempted from their 2025 PFAS bans, until 1 January 2028. But California requires those jackets to carry a "Made with PFAS chemicals" label from 2025 — so on a hardshell sold in California, the absence of that label is itself evidence.',
        },
        productKey: 'outerwear',
      },
      {
        id: 'under',
        label: 'Underwear',
        rank: 12,
        exposure: 'moderate',
        families: ['pfas', 'microplastics'],
        detail: 'Synthetic blends against skin all day.',
        why: 'Polyester and nylon underwear sit against skin in a warm, humid environment — conditions that increase transfer from treated synthetics, and shed microplastic fibres in the wash.',
        alternatives: [
          'Start with 100% cotton for everyday wear.',
          'Read labels carefully. "Cotton blend" is often mostly synthetic.',
          'Replace gym underwear with cotton where the activity allows.',
        ],
        productKey: 'cotton_basics',
      },
      {
        id: 'athletic',
        label: 'Workout gear',
        rank: 10,
        exposure: 'high',
        families: ['pfas', 'microplastics'],
        detail: 'Moisture-wicking synthetics plus sweat and friction.',
        why: 'Performance fabrics use finishes to wick sweat and resist odour, and many rely on fluorinated chemistry. Sweat and friction during exercise increase skin contact with those finishes, and the fabrics shed fibres as they wear.',
        alternatives: [
          'Wear cotton or merino base layers where the activity allows.',
          'Wash synthetic gear promptly after workouts.',
          'Don’t sit around in damp synthetics for hours afterwards.',
        ],
        productKey: 'activewear',
      },
    ],
  },
];

/* ── Products ──────────────────────────────────────────────────
   Built 2026-10-19 from pfaswap-product-inventory (v22, Google Sheet
   copy, ASIN Check tab — every Amazon listing click-checked by Michelle).
   Only rows that are live, in stock and match the product named are here.

   `tier`         A certified · B verified, imperfect · C best available
   `shortfallNote` the honest limit, rendered as "What this does not do".
   `directUrl`    brand-site link: no affiliate tag, flagged as unpaid.

   Never hand-write an `imageUrl` — amazonImage() derives it from the ASIN.
   ──────────────────────────────────────────────────────────── */

const PRODUCTS = {
  water: {
    title: 'Water filtration',
    note: 'Certification matters more here than anywhere else on the site. Look for NSF/ANSI 53 certified for Total PFAS reduction — seven compounds. NSF/ANSI 53 for PFOA/PFOS covers only two. "Reduces contaminants" is not a PFAS claim at all, and no reverse-osmosis system holds an NSF/ANSI 58 PFAS listing — a listing that claims one is advertising something that does not exist.',
    items: [
      {
        name: 'ZeroWater Ready-Read pitcher or dispenser (10- to 52-cup)',
        asin: 'B0073PZ6O0', price: '$28.99–$53.99', verified: true, pick: 'value',
        tier: 'A', evidence: 'certified',
        why: 'IAPMO-certified to NSF/ANSI 53 for PFOA and PFOS, in the cheapest format in the category — no install, no plumbing.',
        shortfallNote: 'Certified for PFOA and PFOS — two compounds — not the seven-compound Total PFAS claim.',
        lifespan: '15–40 gallons per filter; less in hard water',
        tradeoff: 'Cheapest to buy, most expensive to run. The 22-cup dispenser on the same page is the size whose listing states the certification outright.',
      },
      {
        name: 'everydrop Refrigerator Filter 3 (EDR3RXD1)',
        asin: 'B00UB441HS', price: '$49.98', verified: true,
        tier: 'A', evidence: 'certified',
        why: 'NSF/ANSI 53 certified for PFOA and PFOS. If your household drinks from the fridge dispenser, this changes the route you actually use without buying an appliance.',
        shortfallNote: 'PFOA/PFOS only, and it filters the fridge line — not your tap.',
        lifespan: 'About 6 months',
        tradeoff: 'Counterfeit fridge filters are common. Buy the everydrop-branded listing, not a lookalike.',
      },
      {
        name: 'AquaTru Classic countertop reverse osmosis',
        asin: 'B0F2GS6P8B', price: '$495', verified: true, pick: 'balance',
        tier: 'A', evidence: 'certified',
        why: 'IAPMO-certified to NSF/ANSI 53 for PFOA/PFOS (models AT100–AT140). Countertop reverse osmosis with no plumbing — the most practical certified option for renters.',
        shortfallNote: 'Certified for PFOA/PFOS, not Total PFAS. The listing says it "removes PFAS"; the certificate is narrower than that.',
        lifespan: 'Filters every 6 months to 2 years by stage',
        tradeoff: 'The most expensive item on the site, takes real counter space, and discards some water as part of how reverse osmosis works.',
      },
      {
        name: 'LARQ Under Sink Water Filter',
        directUrl: 'https://www.livelarq.com/home/larq-under-sink-water-filter', price: '$199', verified: true, pick: 'evidence',
        tier: 'A', evidence: 'certified',
        why: 'NSF/ANSI 53 certified for Total PFAS reduction — all seven compounds. The strongest certified claim we found on a consumer-brand filter.',
        lifespan: 'Replacement filter $99 ($79 on subscription)',
        tradeoff: 'Under-sink install, and not sold on Amazon. We list it anyway because it holds the best certification in the category.',
      },
      {
        name: 'Multipure Aquaperform under-sink system',
        directUrl: 'https://www.multipure.com/products/drinking-water-systems/aquaperform/', price: 'See site', verified: true,
        tier: 'B', evidence: 'certified',
        why: 'Solid carbon block certified by NSF itself to NSF/ANSI 53 for PFOA and PFOS.',
        shortfallNote: 'PFOA/PFOS, not Total PFAS. Sold direct and through distributors only — we earn nothing on it and list it because it is a good filter.',
        lifespan: 'Annual filter change',
        tradeoff: 'Under-sink install, and pricier than the pitchers.',
      },
    ],
  },

  cookware: {
    title: 'Cookware',
    note: 'Uncoated metal is the reliable ground — nothing applied means nothing to verify. There is no ceramic non-stick here: no brand holds a PFAS certification for one, and the coatings are undisclosed. Read listings closely — Tramontina sells a near-identically named pan with a ceramic non-stick interior.',
    items: [
      {
        name: 'Lodge Pre-Seasoned Cast Iron Skillet, 10.25"',
        asin: 'B00006JSUA', price: '$24.90', verified: true, pick: 'value',
        tier: 'A', evidence: 'inherent',
        why: 'The non-stick surface is polymerised vegetable oil on bare iron — no fluoropolymer to scratch, overheat or degrade.',
        lifespan: 'Decades',
        tradeoff: 'Heavy, needs seasoning, hand-wash only.',
      },
      {
        name: 'Lodge Pre-Seasoned Cast Iron Skillet, 12"',
        asin: 'B00006JSUB', price: '$29.90', verified: true,
        tier: 'A', evidence: 'inherent',
        why: 'The same bare cast iron at the size most households use as their main pan.',
        lifespan: 'Decades',
        tradeoff: 'Heavier still. If cast iron is unmanageable, uncoated stainless is the honest alternative.',
      },
      {
        name: 'Lodge Cast Iron 5-Piece Set',
        asin: 'B004QM8SLG', price: '$99.90', verified: true,
        tier: 'A', evidence: 'inherent',
        why: 'Replaces a whole scratched non-stick set in one purchase.',
        lifespan: 'Decades',
        tradeoff: 'Set contents have varied over time on this listing — check what is included before you buy.',
      },
      {
        name: 'Tramontina Signature Tri-Ply Stainless 12" Fry Pan',
        asin: 'B01M7T40KR', price: '$54.95', verified: true, pick: 'balance',
        tier: 'A', evidence: 'inherent',
        why: 'Bare stainless has no coating, so the PTFE route does not exist — at about a third of the price of the premium brands.',
        lifespan: 'Lifetime',
        tradeoff: 'Slightly thinner cladding than the best pans and a narrower cooking surface. Not a compromise on safety — bare stainless is bare stainless.',
      },
      {
        name: 'All-Clad D3 Stainless 12" Fry Pan with Lid',
        asin: 'B00FUF5K8W', price: '$149.95', verified: true,
        tier: 'A', evidence: 'inherent',
        why: 'The pan that won America’s Test Kitchen’s 12-inch stainless test — and currently cheaper with the lid than without.',
        lifespan: 'Lifetime',
        tradeoff: 'The extra money buys durability and a better handle, not a safer pan. On PFAS it is identical to the $55 one.',
      },
    ],
  },

  storage: {
    title: 'Food storage',
    note: null,
    items: [
      {
        name: 'Pyrex Simply Store Glass Containers, 3-pack',
        asin: 'B0000BYCGF', price: '$17.80', verified: true, pick: 'value',
        tier: 'A', evidence: 'inherent',
        why: 'Plain tempered glass, so you can reheat leftovers without heating plastic against food.',
        shortfallNote: 'The lids are plastic. Microwave the glass base only — take the lid off first.',
        lifespan: 'Indefinite unless dropped',
        tradeoff: 'Heavy and breakable.',
      },
      {
        name: 'U-Konserve Stainless Round Nesting Containers, Trio',
        asin: 'B088VFW31R', price: '$29.99', verified: true,
        tier: 'A', evidence: 'inherent',
        why: 'Bare stainless with no liner — nothing coated touches the food.',
        lifespan: 'Years',
        tradeoff: 'Not for the microwave. U-Konserve’s own lab testing covers BPA, phthalates and lead, not PFAS — the claim here is the material.',
      },
      {
        name: 'U-Konserve Nesting Trio Bento Box, 15/30/50 oz',
        asin: 'B0DBSMHP3B', price: '$41.99', verified: true,
        tier: 'A', evidence: 'inherent',
        why: 'The rectangular version of the same bare-stainless set.',
        lifespan: 'Years',
        tradeoff: 'Not for the microwave.',
      },
      {
        name: 'ECOlunchbox Three-in-One Stainless Bento Box, 31 oz',
        asin: 'B0040MH642', price: '$38.00', verified: true,
        tier: 'B', evidence: 'inherent',
        why: 'Stainless steel throughout, so no coated or lined surface touches food.',
        shortfallNote: 'Not leakproof. The silicone parts carry the same limit as any silicone: no published fluorine testing.',
        lifespan: 'Years',
        tradeoff: 'Keep wet foods in a separate container.',
      },
      {
        name: 'Stasher Reusable Silicone Bags, 4-pack',
        asin: 'B087XBR564', price: '$46.96', verified: true,
        tier: 'B', evidence: 'inherent',
        why: 'Platinum-cure silicone has no fluorine in it, and replaces cling film and zip bags.',
        shortfallNote: 'Silicone is not a PFAS and there is no coating to treat. But "food-grade silicone" is not a certification, and we found no published fluorine testing. The honest claim is "no coating to worry about", not "verified PFAS-free".',
        lifespan: 'Years; dishwasher safe',
        tradeoff: 'Expensive per bag, and awkward to dry.',
      },
    ],
  },

  carbonation: {
    title: 'Bottles & carbonating',
    note: 'Safety first: only ever carbonate in a bottle rated for it. A carbonating bottle is a pressure vessel — an ordinary stainless water bottle, including the two below, must never go into a carbonating machine.',
    items: [
      {
        name: 'Thermos Stainless King Vacuum Bottle, 24 oz',
        asin: 'B01DZQSWQ4', price: '$29.99', verified: true, pick: 'value',
        tier: 'A', evidence: 'inherent',
        why: 'Thermos says it plainly: its stainless products "have no interior coating". Bare steel needs no lining, so there is no epoxy and no bisphenol.',
        lifespan: 'Years',
        tradeoff: 'Lid leaks are the recurring complaint, not the bottle itself. Wide body — won’t fit slim cupholders.',
      },
      {
        name: 'Klean Kanteen TKWide Insulated Bottle, 32 oz',
        asin: 'B08SG8Y979', price: '$46.95', verified: true,
        tier: 'A', evidence: 'inherent',
        why: 'Klean Kanteen states "no plastic or epoxy linings are necessary". Its coloured Klean Coat is on the outside only.',
        lifespan: 'Years',
        tradeoff: 'Some reviewers report leaks and durability problems, and find it hard to clean. The Twist Cap is not for hot or carbonated drinks.',
      },
      {
        name: 'SodaStream Fizz & Go Cool stainless carbonating bottle',
        asin: 'B0DG32QBJN', price: '$23.49', verified: true, pick: 'evidence',
        tier: 'A', evidence: 'inherent',
        why: 'Food-grade stainless with no interior lining, and a pressure-rated carbonating bottle — unlike plastic, it carries no expiry date.',
        shortfallNote: 'Fits TERRA, E-TERRA, ART, DUO, E-DUO and ENSO only — not AQUA FIZZ, GAIA, FIZZI or any screw-in-cylinder machine. Check the listing says Fizz & Go Cool and names your machine.',
        lifespan: 'No expiry date',
        tradeoff: '0.9 L, so smaller than a standard plastic bottle.',
      },
      {
        name: 'SodaStream Glass Carafe, 2-pack (Aqua Fizz, Penguin, Crystal)',
        asin: 'B0055R2CKO', price: '$35.25', verified: true,
        tier: 'B', evidence: 'inherent',
        why: 'Glass needs no lining, and carries no date stamp the way plastic carbonating bottles do.',
        shortfallNote: 'Only for machines that enclose the glass while carbonating — never a plastic-bottle machine. The Aqua Fizz is no longer sold on SodaStream’s US site, so this is for existing owners. Replace a carafe if it chips.',
        lifespan: 'Until chipped',
        tradeoff: 'The listing contradicts itself on fit, and its worst reviews are from people who bought it for the wrong machine.',
      },
    ],
  },

  floss: {
    title: 'Floss',
    note: 'Our floss picks rest on independent screening that found no detectable fluorine at a 10 ppm limit. We would rate them higher if the lab were named — it isn’t, and the method screens for fluorine rather than identifying PFAS specifically. For comparison, Oral-B Glide Pro-Health came back at 248,900 ppm in the same round.',
    items: [
      {
        name: "Tom's of Maine Naturally Waxed Antiplaque Flat Floss",
        asin: 'B000YE01QA', price: '$7.99', verified: true, pick: 'value',
        tier: 'B', evidence: 'tested',
        why: 'Tested clean. A waxed flat floss with no PTFE strand — and the cheapest clean result.',
        lifespan: '32 yards',
        tradeoff: 'Less slippery than a PTFE floss, which is the point.',
      },
      {
        name: 'Cocofloss Expanding Woven Dental Floss',
        asin: 'B082BF4TYW', price: '$9.99', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'Tested clean. A coconut-wax woven strand that cleans more aggressively than flat floss.',
        lifespan: 'Single spool',
        tradeoff: 'The strand is polyester, not silk.',
      },
      {
        name: 'Boka Ela Mint Expanding Waxed Floss',
        asin: 'B083JNXZGR', price: '$8.99', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'Tested clean, and the closest feel to Glide for anyone switching away from it.',
        lifespan: '27 yards',
        tradeoff: 'Premium price for floss.',
      },
    ],
  },

  food: {
    title: 'Lunch boxes, wraps & parchment',
    note: null,
    items: [
      {
        name: 'LunchBots Medium Trio Stainless Bento Box, 32 oz',
        asin: 'B07983JCXB', price: '$39.99', verified: true, pick: 'value',
        tier: 'A', evidence: 'inherent',
        why: 'Uncoated stainless replaces grease-resistant takeout containers and moulded-fibre bowls — the packaging with the highest fluorine readings in Consumer Reports’ 2022 test.',
        lifespan: 'Years',
        tradeoff: 'No gasket, so not leakproof. LunchBots makes no PFAS statement — the claim is the material.',
      },
      {
        name: "Bee's Wrap Beeswax Food Wraps, 3-pack",
        asin: 'B0126LMDFK', price: '$19.00', verified: true,
        tier: 'B', evidence: 'inherent',
        why: 'Cotton, beeswax, jojoba oil and tree resin — a grease barrier made from wax rather than fluorochemistry.',
        shortfallNote: 'This swaps out the wrap in your own kitchen. It does nothing about the fast-food wrapper, which is the actual hotspot — that one is a habit, not a purchase.',
        lifespan: 'About a year with care',
        tradeoff: 'Not heat-safe, not for raw meat, hand-wash in cool water.',
      },
      {
        name: 'If You Care Unbleached Parchment Baking Paper, 70 sq ft',
        asin: 'B001T6JTMY', price: '$5.59', verified: true,
        tier: 'C', evidence: 'tested',
        why: 'Silicone-coated rather than fluorochemical-coated, and independent screening found no fluorine above 10 ppm — where Reynolds and Kirkland showed about 12–14 ppm.',
        shortfallNote: 'No parchment on the US market is certified PFAS-free, and If You Care doesn’t claim to be. The screening lab is not named, and a 10 ppm floor is not zero. For certainty, use a bare stainless sheet or a silicone baking mat.',
        lifespan: '70 sq ft',
        tradeoff: 'The cheapest pick on the site, and the weakest evidence.',
      },
    ],
  },

  popcorn: {
    title: 'Popcorn',
    note: null,
    items: [
      {
        name: 'Original Whirley Pop Popcorn Maker, 6 Qt (stainless, metal gears)',
        asin: 'B01D321B4A', price: '$67.99', verified: true, pick: 'value',
        tier: 'A', evidence: 'inherent',
        why: 'Replaces the grease-proofed microwave bag outright with an uncoated stainless pot.',
        shortfallNote: 'Only the stainless, metal-gear version qualifies. The same listing also offers aluminium and nylon-gear versions — choose stainless.',
        lifespan: 'Years',
        tradeoff: 'Three minutes on the stove, not a button. Plain kernels are cheaper per serving anyway.',
      },
    ],
  },

  air: {
    title: 'Air & dust',
    note: 'These reduce the circulating household dust that carries PFAS. None of them removes PFAS from the air, and no purifier holds a PFAS certification.',
    items: [
      {
        name: 'Smart Air Sqair H13 HEPA + Activated Carbon',
        asin: 'B0DKX733RM', price: '$178.99', verified: true, pick: 'evidence',
        tier: 'B', evidence: 'stated',
        why: 'The only purifier brand we found that publishes what its HEPA media is made of — polypropylene and PET, which rules out a PTFE membrane.',
        shortfallNote: 'A materials disclosure, not a PFAS-free certification. It catches PFAS riding on dust, not gas-phase PFAS, and does not replace getting stain-treated carpet out of the house.',
        lifespan: 'Filter every 6–12 months',
        tradeoff: 'Utilitarian design.',
      },
      {
        name: 'Coway Airmega AP-1512HH Mighty (black)',
        asin: 'B00BTKAPUU', price: '$202.12', verified: true, pick: 'value',
        tier: 'C', evidence: 'unverified',
        why: 'Well-established true-HEPA capture of house dust, independently rated for clean-air delivery. The black version is the same machine as the white for less.',
        shortfallNote: 'Listed for its performance, not for anything it claims about PFAS. Coway does not publish what its filter media is made of.',
        lifespan: 'Filter every 12 months',
        tradeoff: 'The white version (B01728NLRG) costs more for the same purifier.',
      },
    ],
  },

  bedding: {
    title: 'Bedding',
    note: 'Look for what the label does NOT say — no wrinkle-free, no stain-resistant, no "easy care".',
    items: [
      {
        name: 'Naturepedic Organic Waterproof Mattress Protector Pad',
        asin: 'B00T0EM0IW', price: '$129.00', verified: true, pick: 'evidence',
        tier: 'A', evidence: 'certified',
        why: 'Waterproofs with a physical membrane instead of a fluorinated finish, on GOTS-certified organic cotton.',
        lifespan: 'Years; machine washable',
        tradeoff: 'The membrane is still a plastic film — this solves PFAS, not microplastics.',
      },
      {
        name: 'Coyuchi Classic Organic Sateen Sheet Set, Undyed',
        asin: 'B0F3Z6QL77', price: '$148.00', verified: true, pick: 'balance',
        tier: 'A', evidence: 'certified',
        why: 'GOTS governs the finishing stage and bans fluorinated inputs, so no wrinkle- or stain-resistant finish can be applied.',
        lifespan: 'Years; softens with washing',
        tradeoff: 'Wrinkles, because nothing has been applied to stop it. Plain cotton sheets without "easy care" claims are mostly fine too.',
      },
      {
        name: 'Naturepedic Organic Crib Mattress, 2-Stage',
        asin: 'B083QP2JY7', price: '$299.00', verified: true,
        tier: 'B', evidence: 'certified',
        why: 'UL 2884 validated for non-detectable PFAS — under 50 ppm total fluorine across about 80 compounds, the only true "non-detectable PFAS" mark in bedding.',
        shortfallNote: 'The validation covers Naturepedic’s crib and kids mattresses only. Their adult line is not covered yet — don’t read the badge across the whole brand.',
        lifespan: 'Infant to toddler',
        tradeoff: 'Expensive for a crib mattress.',
      },
      {
        name: 'Avocado Eco Organic Latex Mattress Topper',
        asin: 'B0H27N5M25', price: '$299.00', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'Intertek tested Avocado’s components for 679 PFAS at a 10 ppb floor and found none — the strongest published test in this catalogue.',
        shortfallNote: 'A test result, not a certification — a snapshot of the components tested. This is the topper, not the mattress; the full mattress is sold direct.',
        lifespan: 'Years',
        tradeoff: 'A topper, not a standalone mattress.',
      },
    ],
  },

  cotton_basics: {
    title: 'Underwear',
    note: 'Seamless underwear is unusually hard to verify, and the reason is structural. Knitting a seamless tube needs nylon and elastane, so GOTS — the strongest textile chemical standard — is unavailable; and where a garment is not a true knit, the edges are bonded with an adhesive no certification reports on. Prefer comfort that comes from the knit and performance that comes from the fibre, and be sceptical of anti-odour claims, which are usually an applied treatment.',
    items: [
      {
        name: "Subset Organic Cotton Men's Boxer Brief",
        directUrl: 'https://wearsubset.com/products/mens-boxer-brief', price: '$30', verified: true, pick: 'evidence',
        tier: 'A', evidence: 'certified',
        why: 'GOTS certification governs the finishing chain, so stain and easy-care fluorochemical finishes cannot be applied.',
        lifespan: 'Years',
        tradeoff: '95% organic cotton with elastane; the waistband is recycled polyester. Some sizes sell out.',
      },
      {
        name: "Kent Organic Supima Cotton “Breather” Boxer (men's)",
        directUrl: 'https://www.wearkent.com/products/mens-organic-cotton-classic-boxer', price: '$34', verified: true,
        tier: 'A', evidence: 'certified',
        why: 'GOTS-certified organic Supima cotton, 100% cotton with no elastane.',
        lifespan: 'Years; compostable at end of life',
        tradeoff: 'Kent also says it is "never coated in PFAS", but that line is undated — the claim rests on GOTS.',
      },
      {
        name: "Maggie's Organics Organic Cotton Boxer Briefs, 2-pack (men's)",
        asin: 'B09Z5RYLMJ', price: '$45', verified: true, pick: 'value',
        tier: 'A', evidence: 'certified',
        why: 'GOTS certification bans fluorinated inputs at the finishing stage.',
        shortfallNote: 'The listing says 95% organic cotton and does not say what the other 5% is.',
        lifespan: 'Years',
        tradeoff: '$30 for a single pair.',
      },
      {
        name: "Boody Seamfree Boxer Briefs (men's)",
        asin: 'B0BJQKL2X2', price: '$22.95', verified: true,
        tier: 'A', evidence: 'certified',
        why: 'A true circular knit, so no bonded edges, and the softness and odour resistance come from the bamboo viscose fibre rather than an applied finish. Boody states its fabrics are made without added PFAS (August 2026) and holds OEKO-TEX STANDARD 100.',
        shortfallNote: 'Boody does not publish its OEKO-TEX certificate number, so the certification cannot be checked independently. We have asked them for it.',
        lifespan: 'Years',
        tradeoff: 'Sizing runs inconsistent.',
      },
      {
        name: "Boody Full Briefs, High-Rise (women's)",
        asin: 'B07NHYP5WN', price: '$19.95', verified: true,
        tier: 'A', evidence: 'certified',
        why: 'The same bamboo-viscose knit and company statement as the men’s line, and the largest review base in the catalogue.',
        shortfallNote: 'Same limit as the men’s: no OEKO-TEX certificate number published. Sizes were limited when we checked — Boody’s Classic Bikini (B01N9I0O64) and Midi Brief (B07NHSTHRP) are the same fabric.',
        lifespan: 'Years',
        tradeoff: 'Leg openings can loosen through the day.',
      },
      {
        name: "BRANWYN Essential Hipster (women's, merino)",
        directUrl: 'https://branwyn.com/products/womens-seamless-merino-wool-essential-hipster', price: '$40', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'Knit seamlessly, with odour resistance from merino itself, and BRANWYN names Intertek — a real accredited lab — as having tested its fabrics, trim and fasteners.',
        shortfallNote: 'The test report itself is not published: no method, detection limit or sample list. We have asked BRANWYN for it.',
        lifespan: 'Years with gentle washing',
        tradeoff: 'Women’s only.',
      },
      {
        name: "TomboyX Boy Short Underwear, Cotton Blend (women's)",
        asin: 'B0DDWJCMFF', price: '$61.20', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'Independent screening found no detectable organic fluorine.',
        shortfallNote: 'The non-detect result was on TomboyX’s leakproof styles, not everything they make, and the lab was not named.',
        lifespan: 'Years',
        tradeoff: 'A cotton blend with elastane, not 100% cotton.',
      },
    ],
  },

  activewear: {
    title: 'Activewear',
    note: 'The hardest category on the site. The fabrics that clear the bar are cotton or lyocell, which absorb sweat rather than wicking it — the thing that makes them clean is the same thing that keeps them damp. We found no high-impact sports bra backed by certification.',
    items: [
      {
        name: 'MATE the Label Organic Stretch Sports Bra',
        directUrl: 'https://matethelabel.com/products/organic-stretch-sports-bra-pebble', price: '$58', verified: true, pick: 'evidence',
        tier: 'A', evidence: 'certified',
        why: 'GOTS certified with the licence number published (CU 1245496), so it reaches the finishing stage and can be checked.',
        shortfallNote: 'Low to medium impact only. Organic cotton absorbs moisture rather than wicking it.',
        lifespan: 'Years',
        tradeoff: 'Runs small, and the underband can twist.',
      },
      {
        name: 'Q for Quinn Organic Racerback Sports Bra',
        directUrl: 'https://www.qforquinn.com/products/organic-racerback-sports-bra', price: '$56', verified: true,
        tier: 'A', evidence: 'certified',
        why: 'GOTS certified through Ecocert Greenlife, licence 256894 published on the page.',
        shortfallNote: 'Low to medium impact only, and no built-in cups.',
        lifespan: 'Years',
        tradeoff: 'Has slits for cup inserts — useful, since most organic cotton bras are thin.',
      },
      {
        name: 'Tripulse Next Gen TENCEL Sports Bra',
        directUrl: 'https://tripulse.co/products/next-gen-sports-bra-with-tencel', price: '$149', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'Tested for PFAS by Bureau Veritas, a named accredited lab, and the moisture handling comes from the lyocell fibre rather than an applied finish.',
        shortfallNote: 'No test date, method or detection limit is published. Tripulse is also OEKO-TEX certified, which bans intentionally added PFAS.',
        lifespan: 'Years',
        tradeoff: 'Padded. Expensive, and some find the compression tight.',
      },
      {
        name: 'Tripulse Original TENCEL Leggings 2.0 with side pockets',
        directUrl: 'https://tripulse.co/collections/all-leggings/products/original-tencel-workout-leggings-with-sidepockets', price: '$199', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'The same lyocell fabric and Bureau Veritas testing — and the closest thing here to a normal pair of leggings, with real compression.',
        shortfallNote: 'Same limit as the bra: the test details are not published.',
        lifespan: 'Years',
        tradeoff: 'Very expensive. Comes in a petite length, has pockets, and holds up to squats.',
      },
      {
        name: "Icebreaker Merino 175 Everyday Base Layer (women's)",
        asin: 'B078WF8321', price: '$95', verified: true,
        tier: 'C', evidence: 'inherent',
        why: 'Merino resists odour by itself, so no chemical anti-odour finish is needed.',
        shortfallNote: 'Icebreaker publishes no PFAS statement or certification, and the fibre argument covers odour only — it says nothing about whether a wicking finish was applied. Choose it for the mechanism, not verified evidence.',
        lifespan: 'Years with gentle washing',
        tradeoff: 'Expensive, and warm for summer training.',
      },
    ],
  },

  outerwear: {
    title: 'Rain jackets',
    note: 'Brands rotate their PFAS-free lines season to season. Check the current model year, and check the membrane, not just the finish.',
    items: [
      {
        name: "Patagonia Torrentshell 3L Rain Jacket",
        directUrl: 'https://www.patagonia.com/product/mens-torrentshell-3-layer-rain-jacket/85241.html', price: 'See site', verified: true, pick: 'evidence',
        tier: 'B', evidence: 'stated',
        why: 'Fabric, membrane and water-repellent finish made without intentionally added PFAS, with a polyurethane membrane rather than ePTFE.',
        shortfallNote: 'The claim covers Spring 2025 and later production. A pre-2025 Torrentshell tested positive for PFAS, so buy direct from Patagonia, not through Amazon resellers.',
        lifespan: 'Several seasons',
        tradeoff: 'Intentionally added only — Patagonia says the industry is still learning where other chemistries show up.',
      },
      {
        name: "Rab Downpour Waterproof Jacket (men's)",
        asin: 'B0DLLQ1WLY', price: '$140', verified: true, pick: 'value',
        tier: 'B', evidence: 'stated',
        why: 'Rab says it removed all intentionally added PFAS from its line for Autumn/Winter 2025, covering the shell and its water-repellent finish.',
        shortfallNote: 'The claim is brand-wide, not on the product page, and Rab says it cannot rule out traces. Avoid the older "Downpour Eco".',
        lifespan: 'Several seasons',
        tradeoff: 'Lightweight packable shell, not an expedition jacket.',
      },
      {
        name: "REI Co-op XeroCloud 3L Rain Jacket",
        directUrl: 'https://www.rei.com/product/242158/rei-co-op-xerocloud-3l-rain-jacket-mens', price: '$189', verified: true,
        tier: 'B', evidence: 'stated',
        why: 'REI states the water-repellent finish is "made without PFAS", and its supplier rules ban PFAS by total fluorine from January 2026.',
        shortfallNote: 'The membrane claim is inferred from REI’s supplier rules, not stated on the product page. REI only.',
        lifespan: 'Several seasons',
        tradeoff: 'For women, REI’s Rainier ($99.95) carries the same "made without PFAS" wording — check the listing says so.',
      },
      {
        name: "Arc'teryx Beta Jacket (men's, GORE-TEX ePE)",
        asin: 'B0FX3GT869', price: '$400', verified: true,
        tier: 'B', evidence: 'stated',
        why: 'GORE-TEX ePE replaces the fluoropolymer membrane, paired with a fluorine-free water-repellent finish — Arc’teryx says "free from intentionally added PFAS".',
        shortfallNote: 'Older Beta stock uses the earlier PFAS membrane. This listing says GORE-TEX ePE — if you buy a different size or colour, check that it does too.',
        lifespan: 'Many seasons',
        tradeoff: 'Expensive. ePE fabric wets out a little faster on the surface, without leaking.',
      },
      {
        name: 'Rains Long Jacket',
        asin: 'B09V751CMZ', price: '$110.95', verified: true,
        tier: 'B', evidence: 'inherent',
        why: 'A polyurethane-coated shell keeps rain out by itself — no fluorinated finish and no membrane at all.',
        shortfallNote: 'A city raincoat, not a hiking shell: it barely breathes. Rains’ PFAS statement is undated and its lab is not named.',
        lifespan: 'Years',
        tradeoff: 'Other colours cost more (about $140).',
      },
    ],
  },

  skin: {
    title: 'Makeup',
    note: 'No certification exists for PFAS in cosmetics, so these rest on independent screening whose lab is not named. In this category the contamination usually comes in through coated pigments and shared equipment, not the formula a brand writes — so a screened product is the best evidence available.',
    items: [
      {
        name: 'FitGlow Beauty Vegan Good Lash + Mascara',
        asin: 'B0747X3SVG', price: '$38', verified: true, pick: 'evidence',
        tier: 'B', evidence: 'tested',
        why: 'Screened clean — and it first came back positive, traced to a pigment supplier swapped in without the brand knowing. It is non-detect after reformulation.',
        shortfallNote: 'The screening lab is not named, and FitGlow publishes no PFAS statement of its own.',
        lifespan: 'About 3 months once opened',
        tradeoff: 'Not waterproof — which is the point.',
      },
      {
        name: '100% PURE Ultra Lengthening Mascara',
        asin: 'B003N4ST94', price: '$28', verified: true, pick: 'value',
        tier: 'B', evidence: 'tested',
        why: 'From the brand with the broadest clean sweep we found — six 100% Pure products, mascara included, screened non-detect.',
        shortfallNote: 'Screening evidence only, lab not named, and we have not confirmed this exact shade was among the products tested.',
        lifespan: 'About 3 months once opened',
        tradeoff: 'Smudge-proof rather than waterproof.',
      },
      {
        name: '100% PURE Fruit Pigmented Powder Foundation',
        asin: 'B01M8I6WYA', price: '$46', verified: true,
        tier: 'B', evidence: 'tested',
        why: 'The same brand-wide screening, in foundation — the other category where fluorine turned up most.',
        shortfallNote: 'Screening only, lab not named. Shade range on Amazon was limited when we checked.',
        lifespan: 'Months',
        tradeoff: 'Few shades available on Amazon.',
      },
    ],
  },

  clean: {
    title: 'Cleaning',
    note: 'Floor finishes and polishes are where cleaning-product PFAS is best documented. For everyday sprays, the certifications below are reassurance rather than proven risk reduction.',
    items: [
      {
        name: 'Branch Basics Concentrate + Oxygen Boost',
        asin: 'B0D9WH1HYB', price: '$77', verified: true,
        tier: 'B', evidence: 'certified',
        why: 'The only double-certified cleaning brand we found — MADE SAFE and EWG VERIFIED, and EWG’s cleaning criteria ban PFAS as a class by name.',
        shortfallNote: 'Branch Basics makes no PFAS statement itself, and neither certification tests the finished product.',
        lifespan: 'Makes many bottles of spray',
        tradeoff: 'Expensive up front. Vinegar and baking soda still handle most bathroom jobs.',
      },
    ],
  },

  hot_cups: {
    title: 'Reusable cups',
    note: 'Paper hot cups are rarely PFAS-treated. The bigger win is skipping the plastic lining that sheds microplastics into hot drinks — so the interior is what matters. Avoid cups sold as "ceramic-lined" or "nonstick" inside.',
    items: [
      {
        name: 'Zojirushi Stainless Steel Mug SM-KHE48, 16 oz',
        asin: 'B005PO9T44', price: '$39.99', verified: true, pick: 'evidence',
        tier: 'B', evidence: 'inherent',
        why: 'An electropolished bare-steel interior — Zojirushi says no nonstick coating — so nothing but steel touches the hot drink.',
        shortfallNote: 'Model SM-KHE only. Zojirushi’s SM-TA mug and SJ-JS bottle have a PTFE nonstick interior — the opposite of what you want.',
        lifespan: 'Years',
        tradeoff: 'Plastic lid. Carries a Prop 65 warning, which Zojirushi attributes to the bottom sticker.',
      },
      {
        name: 'KeepCup Brew, 16 oz (glass)',
        asin: 'B09JF3SBHC', price: '$32.95', verified: true, pick: 'value',
        tier: 'B', evidence: 'inherent',
        why: 'Tempered glass has no lining and no paper.',
        shortfallNote: 'No PFAS statement from KeepCup — the claim is the material.',
        lifespan: 'Until dropped',
        tradeoff: 'Plastic lid, not insulated, and glass can break.',
      },
    ],
  },
};

/* ── Vetting checks ────────────────────────────────────────────
   The four tests a product clears before it appears on the site.
   Rendered on the Standard section and in the inventory sheet.
   ──────────────────────────────────────────────────────────── */

const VETTING_CHECKS = [
  { id: 'mechanism', label: 'Addresses the named mechanism', detail: 'Interrupts the specific route described in the hotspot — not just "natural".' },
  { id: 'sourced', label: 'Claim is sourced', detail: 'Certification, manufacturer statement, third-party testing, or inherent material.' },
  { id: 'buyable', label: 'Actually buyable', detail: 'Live listing, in stock, ships to the US, and matches the product named.' },
  { id: 'honest', label: 'Honest about limits', detail: 'Where no good option exists, we say so instead of promoting a weak one.' },
];

/* ── Helpers ───────────────────────────────────────────────── */

function amazonAffiliateTag() {
  const tag = (AMAZON_AFFILIATE_TAG || '').trim();
  if (!tag || tag === 'YOURTAG-20') return null;
  return tag;
}

function amazonLink(asin) {
  if (!asin || typeof asin !== 'string') return 'https://www.amazon.com';
  const id = asin.trim();
  const tag = amazonAffiliateTag();
  return tag
    ? `https://www.amazon.com/dp/${encodeURIComponent(id)}?tag=${encodeURIComponent(tag)}`
    : `https://www.amazon.com/dp/${encodeURIComponent(id)}`;
}

function amazonProductLink(item) {
  // A direct-to-brand link carries no affiliate tag and earns nothing.
  if (item.directUrl) return item.directUrl;
  if (item.amazonUrl) return item.amazonUrl;
  if (item.asin) return amazonLink(item.asin);
  if (item.searchQuery) {
    const q = encodeURIComponent(item.searchQuery);
    const tag = amazonAffiliateTag();
    return tag
      ? `https://www.amazon.com/s?k=${q}&tag=${encodeURIComponent(tag)}`
      : `https://www.amazon.com/s?k=${q}`;
  }
  return 'https://www.amazon.com';
}

/** Derived from the ASIN only. Never hand-write an image URL. */
function amazonImage(item) {
  if (!item.asin) return null;
  return `https://m.media-amazon.com/images/P/${item.asin}.01._SX400_.jpg`;
}

/**
 * Evidence strength, strongest first. This is the axis nobody else in the
 * category publishes, so it leads every comparison.
 *
 * `inherent` outranks a certificate on purpose: bare cast iron has nothing
 * applied to it, so there is no claim left to verify.
 */
const EVIDENCE_TIERS = {
  inherent: {
    label: 'Nothing applied',
    rank: 4,
    hint: 'Bare metal, glass, silicone or untreated fabric. Nothing has been coated or finished onto it, so there is nothing there that could hold PFAS.',
  },
  certified: {
    label: 'Certified',
    rank: 4,
    hint: 'An independent body — NSF, WQA, IAPMO or GOTS — certified it against a named standard, and we link the certificate.',
  },
  tested: {
    label: 'Lab-tested',
    rank: 3,
    hint: 'An independent lab tested the product and found no PFAS above its detection limit. Not quite a certificate, but somebody outside the company checked.',
  },
  stated: {
    label: "Maker's word",
    rank: 2,
    hint: 'The company publishes a PFAS-free claim. Nobody outside the company has verified it, so it rests on their honesty.',
  },
  unverified: {
    label: 'Not checked',
    rank: 1,
    hint: 'We found no claim we could check. Shown only where nothing better exists in the category, and always labelled.',
  },
};

/** Column heading for the evidence axis. Phrased as a question the cell answers. */
const EVIDENCE_COLUMN = 'How we know';

function evidenceTier(key) {
  return EVIDENCE_TIERS[key] || EVIDENCE_TIERS.unverified;
}

function getAllHotspotEntries() {
  return HOTSPOT_ROOMS.flatMap((room) => room.items.map((item) => ({ room, item })));
}

/** Explicit editorial order. Kitchen and bedroom are weighted up. */
function getRankedEntries(limit) {
  const sorted = getAllHotspotEntries().sort((a, b) => a.item.rank - b.item.rank);
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

function sortItemsByRank(items) {
  return [...items].sort((a, b) => a.rank - b.rank);
}

function findHotspot(roomId, itemId) {
  const room = HOTSPOT_ROOMS.find((r) => r.id === roomId);
  if (!room) return null;
  const item = room.items.find((i) => i.id === itemId);
  if (!item) return null;
  return { room, item };
}

const TOTAL_HOTSPOTS = getAllHotspotEntries().length;
