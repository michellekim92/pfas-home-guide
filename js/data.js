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
    body: 'PFAS have measurable half-lives in the body. They leave slowly — but they do leave, and what you stop taking in stops accumulating.',
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
          'Use a filter certified to reduce PFAS — look for NSF/ANSI P473, not just a general "filters contaminants" claim.',
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
        rank: 3,
        exposure: 'critical',
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
        rank: 4,
        exposure: 'critical',
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
        rank: 13,
        exposure: 'high',
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
        rank: 5,
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
        rank: 8,
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
        rank: 15,
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
        rank: 6,
        exposure: 'high',
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
        rank: 16,
        exposure: 'moderate',
        families: ['pfas'],
        detail: 'Some brands use PFAS for wet strength.',
        why: 'Independent testing has found PFAS indicators in some toilet paper brands, likely from manufacturing processes that add wet strength. It is a product used several times a day with direct contact on sensitive skin.',
        alternatives: [
          'Choose unbleached or bamboo tissue from brands that publish testing.',
          'Avoid heavily processed "extra soft" premium rolls.',
          'Where testing data is unclear, rotate to a simpler, plainer paper.',
        ],
        productKey: null,
      },
      {
        id: 'skin',
        label: 'Skincare & sunscreen',
        rank: 17,
        exposure: 'moderate',
        families: ['pfas'],
        detail: 'Makeup, sunscreen and lotion — hours of skin contact.',
        why: 'Some cosmetics and sunscreens use fluorinated compounds for spreadability and water resistance. These products sit on skin for hours at a time, so small amounts can absorb — especially with daily sunscreen use across a large surface area.',
        alternatives: [
          'Choose mineral sunscreens using zinc oxide or titanium dioxide.',
          'Simplify the routine. Fewer products means fewer unknowns.',
          'Favour brands that publish PFAS-free or fluorine-free testing rather than just saying "clean".',
        ],
        productKey: null,
      },
      {
        id: 'clean',
        label: 'Bathroom cleaners',
        rank: 21,
        exposure: 'lower',
        families: ['pfas'],
        detail: 'Sprays and toilet bowl treatments.',
        why: 'Heavy-duty bathroom sprays and some toilet treatments use surfactants that may contain or break down into PFAS. You breathe the mist while cleaning, and residue stays on surfaces you touch afterwards.',
        alternatives: [
          'Vinegar and water handles mirrors, glass and counters.',
          'Baking soda paste scrubs tubs and tile.',
          'Skip "extra strength" sprays where a simple option works.',
        ],
        productKey: null,
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
        rank: 7,
        exposure: 'high',
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
        rank: 9,
        exposure: 'high',
        families: ['pfas', 'microplastics'],
        detail: 'Paper cups with plastic or fluorinated linings.',
        why: 'Disposable hot cups are not plain paper — they carry a plastic lining so they do not leak, and heat plus an acidic drink like coffee increases what migrates in. Some moulded-fibre "compostable" cups and bowls have also tested positive for PFAS from manufacturing.',
        alternatives: [
          'Carry a stainless or ceramic travel mug. Many cafés discount it.',
          'If you are staying, ask for a ceramic mug.',
          'Skip the lid where you can — less hot-liquid contact with plastic.',
        ],
        productKey: 'storage',
      },
      {
        id: 'popcorn',
        label: 'Microwave popcorn bags',
        rank: 10,
        exposure: 'high',
        families: ['pfas'],
        detail: 'The inner lining resists oil and high heat.',
        why: 'Microwave popcorn bags are engineered to survive high heat and hot oil, and their inner linings have historically used PFAS-related treatments. Steam carries what is in the lining into the popcorn.',
        alternatives: [
          'Pop kernels on the stovetop or in an air popper.',
          'Use a glass bowl with a vented cover in the microwave.',
          'Buy plain kernels — cheaper per serving, and no bag involved.',
        ],
        productKey: null,
      },
      {
        id: 'wrappers',
        label: 'Pizza boxes & grease paper',
        rank: 11,
        exposure: 'high',
        families: ['pfas'],
        detail: 'Grease-proof paper and cardboard liners.',
        why: 'Pizza boxes, microwave pastry wrappers and butter paper use stain- and grease-resistant treatments. Heat and oil both increase what can move from the surface into the food resting on it.',
        alternatives: [
          'Slide pizza onto a plate or board rather than eating off the box.',
          'Choose places that use plain, untreated cardboard where you can.',
          'At home, use parchment labelled unbleached and PFAS-free.',
        ],
        productKey: 'food',
      },
      {
        id: 'receipts',
        label: 'Store receipts',
        rank: 14,
        exposure: 'high',
        families: ['pfas', 'plasticizers'],
        detail: 'Thermal paper, handled after every purchase.',
        why: 'Most printed receipts use thermal paper treated with developers that can include BPA, BPS or fluorinated alternatives. You handle one after shopping, then touch your phone, your wallet and your food — a short transfer route repeated daily.',
        alternatives: [
          'Decline receipts you do not need.',
          'Ask for an email receipt instead.',
          'Don’t hand receipts to children to hold.',
          'Wash hands after handling, before eating or cooking.',
        ],
        productKey: null,
      },
      {
        id: 'furniture',
        label: 'Stain-resistant furniture',
        rank: 19,
        exposure: 'moderate',
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
        rank: 12,
        exposure: 'high',
        families: ['pfas', 'microplastics'],
        detail: 'DWR waterproof and stain-resistant coatings.',
        why: 'Most waterproof jackets use a durable water repellent finish, historically PFAS-based. Jackets are worn for hours in rain and sweat, and older gear sheds its treatment progressively as it wears.',
        alternatives: [
          'Look for PFAS-free DWR, or waxed cotton as an alternative system.',
          'Buy fewer waterproof pieces — one good shell beats a closet of coated gear.',
          'When replacing, search "PFAS-free rain jacket" explicitly rather than trusting "eco".',
        ],
        productKey: 'outerwear',
      },
      {
        id: 'under',
        label: 'Underwear',
        rank: 18,
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
        rank: 20,
        exposure: 'moderate',
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
   PROVISIONAL. Every entry below is a search link, not a verified
   listing, and `verified: false` makes the UI say so.

   Do not add an `asin` until it has cleared the four checks in
   claude/product-inventory-sourcing-brief.md. Never hand-write an
   `imageUrl` — amazonImage() derives it from a verified ASIN, which
   removes the whole class of broken-image bugs.
   ──────────────────────────────────────────────────────────── */

const PRODUCTS = {
  water: {
    title: 'Water filtration',
    note: 'Certification matters more here than anywhere else on the site. "Reduces contaminants" is not the same claim as certification for PFOA/PFOS.',
    items: [
      {
        name: 'ZeroWater 10-Cup Pitcher',
        asin: 'B0073PZ6O0', price: '$28.99', verified: true, pick: 'value',
        why: 'IAPMO-certified to NSF/ANSI 53 for PFOA/PFOS — and the certification is printed on the listing itself.',
        evidence: 'certified',
        lifespan: '15–40 gallons per filter',
        tradeoff: 'Slow to pour and filters need replacing often, so cost per gallon is the highest here.',
      },
      {
        name: 'Aquasana Claryum 3-Stage Max Flow',
        asin: 'B0FN9Y9JSP', price: '$224.99', verified: true, pick: 'balance',
        why: 'WQA-certified to NSF/ANSI 53 for PFOA/PFOS at 96%, plumbed in so every glass is filtered.',
        evidence: 'certified',
        lifespan: '800 gallons per cartridge set',
        tradeoff: 'Needs an under-sink install and takes up cabinet space.',
      },
      {
        name: 'AquaTru Classic Smart countertop RO',
        asin: 'B0F9C7G3VD', price: '$545.00', verified: true, pick: 'evidence',
        why: 'Reverse osmosis, IAPMO-certified to NSF/ANSI 42, 53, 58 and 401 — the widest certified coverage on this list.',
        evidence: 'certified',
        lifespan: '600–1,200 gallons depending on stage',
        tradeoff: 'Most expensive, occupies real counter space, and discards some water as reject.',
      },
    ],
  },

  cookware: {
    title: 'Cookware',
    note: 'Uncoated metal is the reliable ground — nothing applied means nothing to verify. Treat ceramic non-stick claims with more scepticism.',
    items: [
      {
        name: 'Lodge Pre-Seasoned Cast Iron Skillet, 10.25"',
        asin: 'B00006JSUA', price: '$24.90', verified: true, pick: 'value',
        why: 'Bare cast iron. There is no coating to scratch, overheat or degrade.',
        evidence: 'inherent',
        lifespan: 'Decades. Often outlives its owner.',
        tradeoff: 'Heavy, needs seasoning, and hand-wash only.',
      },
      {
        name: 'All-Clad D3 Stainless Steel Fry Pan, 12"',
        asin: 'B004T6MSIS', price: '$159.95', verified: true, pick: 'balance',
        why: 'Uncoated tri-ply stainless — nothing on the surface can transfer into food.',
        evidence: 'inherent',
        lifespan: 'Lifetime, dishwasher safe',
        tradeoff: 'Food sticks without technique. Check you are buying the plain pan, not the D3 Non-Stick variant.',
      },
      {
        name: 'de Buyer Mineral B Carbon Steel Fry Pan, 12.5"',
        asin: 'B00462QP1G', price: '$119.00', verified: true,
        why: 'Carbon steel with a beeswax finish — builds a natural non-stick surface with no fluoropolymer.',
        evidence: 'inherent',
        lifespan: 'Decades with care',
        tradeoff: 'Must be seasoned and hand-dried, or it rusts.',
      },
      {
        name: 'Caraway Ceramic Non-Stick Fry Pan, 10.5"',
        asin: 'B09SS34H3K', price: '$125.00', verified: true, pick: 'compromise',
        why: 'The only genuinely non-stick option here. Lab-tested for PFAS, and the claim survived review by the BBB National Advertising Division.',
        evidence: 'tested',
        lifespan: '2–3 years before the coating wears',
        tradeoff: 'Every coating wears out. Real non-stick convenience, but you replace it every few years.',
      },
    ],
  },

  storage: {
    title: 'Food storage & travel',
    note: null,
    items: [
      {
        name: 'Pyrex Simply Store Glass Set, 12-piece',
        asin: 'B07L51SFVS', price: '$42.35', verified: true, pick: 'value',
        why: 'Tempered glass, so you can reheat without heating plastic against food — the exact mechanism behind rank 3.',
        evidence: 'inherent',
        lifespan: 'Indefinite unless dropped',
        tradeoff: 'Heavy, breakable, and the lids are still plastic (they do not touch hot food).',
      },
      {
        name: 'Stasher Reusable Silicone Bags, 4-pack',
        asin: 'B087XBR564', price: '$46.96', verified: true,
        why: 'Platinum-cure silicone contains no fluoropolymers by chemistry. Replaces cling film entirely.',
        evidence: 'inherent',
        lifespan: 'Years; dishwasher safe',
        tradeoff: 'Expensive per bag, and awkward to dry.',
      },
      {
        name: 'Klean Kanteen TK Wide Insulated Tumbler, 16oz',
        asin: 'B08R5P1G63', price: '$34.95', verified: true,
        why: 'Fully stainless interior — no plastic lining between you and a hot drink.',
        evidence: 'inherent',
        lifespan: 'Years',
        tradeoff: 'You have to remember to carry it. That is the whole difficulty.',
      },
    ],
  },

  food: {
    title: 'Kitchen paper & lunch',
    note: null,
    items: [
      {
        name: 'If You Care Unbleached Parchment Paper',
        asin: 'B0D14X6C4P', price: '$11.18', verified: true, pick: 'value',
        why: 'Independent lab testing found no fluorine above a 10 ppm detection limit.',
        evidence: 'tested',
        lifespan: '70 sq ft roll',
        tradeoff: 'Its non-stick surface is a silicone coating — not PFAS, but not bare paper either.',
      },
      {
        name: 'LunchBots Large Cinco Stainless Bento',
        asin: 'B01CRPY9NO', price: '$41.99', verified: true,
        why: 'Stainless steel, so leftovers and packed lunches skip the treated wrapper entirely.',
        evidence: 'inherent',
        lifespan: 'Years',
        tradeoff: 'Not leakproof for liquids, and not cheap for a lunchbox.',
      },
    ],
  },

  carbonation: {
    title: 'Carbonating bottles',
    note: 'Safety first, because this one is a pressure vessel: only ever carbonate in a bottle rated for it. An ordinary stainless water bottle — a Klean Kanteen, a Hydro Flask — must never go into a carbonating machine.',
    items: [
      {
        name: 'SodaStream Fizz & Go Cool stainless bottle',
        asin: 'B0DG32QBJN', price: '$23.49', verified: true, pick: 'evidence',
        why: 'Food-grade 18/8 stainless with no interior lining or coating at all — the only container type that needs nothing between you and the drink.',
        evidence: 'inherent',
        lifespan: 'No expiry date, unlike every plastic carbonating bottle',
        tradeoff: 'Fits TERRA, E-TERRA, ART, DUO, E-DUO and ENSO only — not AQUA FIZZ, GAIA or any screw-in-cylinder machine. Check the listing says Fizz & Go **Cool** and names your machine.',
      },
    ],
  },

  floss: {
    title: 'Floss',
    note: 'One criterion: no PTFE. Unusually for this site, the cheapest option is also the best-evidenced.',
    items: [
      {
        name: "Tom's of Maine Naturally Waxed Antiplaque Floss",
        asin: 'B000YE01QA', price: '$7.99', verified: true, pick: 'value',
        why: 'Independent lab testing returned non-detect for organic fluorine. Cheapest and best-evidenced at once.',
        evidence: 'tested',
        lifespan: '32 yards',
        tradeoff: 'Flat waxed thread — less slippery than a PTFE floss, which is the point.',
      },
      {
        name: 'RADIUS Vegan Sponge Floss',
        asin: 'B08YRSC1ZS', price: '$9.34', verified: true,
        why: 'Marked PFAS-free by the maker, and expands to clean wider gaps.',
        evidence: 'tested',
        lifespan: 'Single spool',
        tradeoff: 'Too thick for very tight contacts.',
      },
      {
        name: 'Cocofloss Expanding Woven Floss, 4-pack',
        asin: 'B084RSJZY6', price: '$38.00', verified: true, pick: 'compromise',
        why: 'Non-detect in independent testing, woven texture cleans more aggressively than flat floss.',
        evidence: 'tested',
        lifespan: '4 spools',
        tradeoff: 'Nearly five times the price of the Tom’s, and the strand is recycled polyester rather than silk.',
      },
    ],
  },

  air: {
    title: 'Air & dust',
    note: 'These reduce the circulating household dust that carries PFAS. None of them removes PFAS from the air, and the site never says otherwise.',
    items: [
      {
        name: 'Levoit Core 300 True-HEPA Purifier',
        asin: 'B07VVK39F7', price: '$84.99', verified: true, pick: 'value',
        why: 'AHAM Verifide true HEPA with a quiet sleep mode, sized for a bedroom.',
        evidence: 'certified',
        lifespan: 'Filter every 6–8 months',
        tradeoff: 'Smaller room coverage than the Coway, and filters are an ongoing cost.',
      },
      {
        name: 'Coway Airmega AP-1512HH Mighty',
        asin: 'B01728NLRG', price: '$229.99', verified: true, pick: 'evidence',
        why: 'AHAM Verifide true HEPA with an air quality monitor, rated for much larger rooms.',
        evidence: 'certified',
        lifespan: 'Filter every 12 months',
        tradeoff: 'Nearly three times the price. A next-gen Mighty2 (B0GS7FF1D6) is replacing it.',
      },
    ],
  },

  bedding: {
    title: 'Bedding',
    note: 'Look for what the label does NOT say — no wrinkle-free, no stain-resistant, no "easy care".',
    items: [
      {
        name: 'Whisper Organics GOTS Organic Cotton Sheet Set',
        asin: 'B0829WYF6S', price: '$89.99', verified: true, pick: 'balance',
        why: 'GOTS certification prohibits the durable-press and wrinkle-resistant finishes that carry PFAS.',
        evidence: 'certified',
        lifespan: 'Years; softens with washing',
        tradeoff: 'Wrinkles, because nothing has been applied to stop it.',
      },
      {
        name: 'Avocado Organic Waterproof Mattress Protector',
        directUrl: 'https://www.avocadogreenmattress.com/products/organic-waterproof-mattress-protector',
        price: '$99–179', verified: true, pick: 'evidence',
        why: 'Tested by Intertek against 679 PFAS substances with none detected — the strongest evidence on this site. The barrier is bio-based polyurethane, not a fluoropolymer.',
        evidence: 'tested',
        lifespan: 'Years; machine washable',
        tradeoff: 'Sold direct only, so it costs more than an Amazon equivalent — and we earn nothing from this link.',
      },
    ],
  },

  cotton_basics: {
    title: 'Cotton basics',
    note: 'Not yet through verification — these are searches, not checked listings.',
    items: [
      {
        name: '100% cotton underwear',
        searchQuery: '100 percent cotton underwear', verified: false,
        why: 'Untreated natural fibre for all-day contact, with no wicking finish involved.',
        evidence: 'inherent',
        lifespan: 'Replace annually',
        tradeoff: 'Holds moisture where synthetics wick it.',
      },
    ],
  },

  activewear: {
    title: 'Activewear',
    note: 'The hardest category on the site. Performance and untreated fabric genuinely trade off, and we would rather say so than oversell.',
    items: [
      {
        name: 'Merino wool base layer',
        searchQuery: 'merino wool base layer', verified: false,
        why: 'Wicks and resists odour naturally, without a fluorinated finish.',
        evidence: 'inherent',
        lifespan: 'Years with careful washing',
        tradeoff: 'Expensive, warm for summer training, and needs gentle laundering.',
      },
      {
        name: 'Organic cotton training tee',
        searchQuery: 'organic cotton workout shirt', verified: false,
        why: 'Untreated fibre for lower-intensity training where wicking matters less.',
        evidence: 'inherent',
        lifespan: 'Years',
        tradeoff: 'Gets heavy with sweat. Genuinely worse than synthetics for hard training.',
      },
    ],
  },

  outerwear: {
    title: 'Outerwear',
    note: 'Brands rotate their PFAS-free lines season to season. Check the current model year, not the brand reputation.',
    items: [
      {
        name: "Marmot PreCip Eco Rain Jacket (men's)",
        asin: 'B0CMRWB92D', price: '$81.00', verified: true, pick: 'value',
        why: 'Marmot’s NanoPro finish is PFC-free — the brand’s own wording, which is what we quote.',
        evidence: 'stated',
        lifespan: 'Several seasons; finish wears',
        tradeoff: '"PFC-free" is a broader claim than "PFAS-free", and no independent testing confirms it. Women’s is B0CNWNWB9M.',
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
