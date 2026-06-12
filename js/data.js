const AMAZON_AFFILIATE_TAG = 'YOURTAG-20';

/** Shown on the About page — set a real email before applying to Amazon Associates. */
const SITE_CONTACT_EMAIL = '';

const AMAZON_DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.';

const HEALTH_DISCLAIMER =
  'Educational information only—not medical advice. PFAS exposure varies by person and product. Verify labels and consult a qualified professional for personal health decisions.';

const IMG_FALLBACK_PRODUCT = 'images/product-placeholder.svg';

function amazonAffiliateTag() {
  const tag = (AMAZON_AFFILIATE_TAG || '').trim();
  if (!tag || tag === 'YOURTAG-20') return null;
  return tag;
}

/** Product page link — skips invalid placeholder affiliate tags that break Amazon URLs */
function amazonLink(asin) {
  if (!asin || typeof asin !== 'string') return 'https://www.amazon.com';
  const id = asin.trim();
  const tag = amazonAffiliateTag();
  if (tag) {
    return `https://www.amazon.com/dp/${encodeURIComponent(id)}?tag=${encodeURIComponent(tag)}`;
  }
  return `https://www.amazon.com/dp/${encodeURIComponent(id)}`;
}

/** ASIN product link, or Amazon search when only searchQuery is set */
function amazonProductLink(item) {
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

function amazonImage(item) {
  if (item.imageUrl) return item.imageUrl;
  if (!item.asin) return IMG_FALLBACK_PRODUCT;
  return `https://m.media-amazon.com/images/P/${item.asin}.01._SX400_.jpg`;
}

const REVOLVING_STATS = [
  {
    value: '97%',
    label: 'of Americans have PFAS in their blood',
    source: 'CDC ATSDR',
    url: 'https://www.atsdr.cdc.gov/pfas/health-effects/index.html',
  },
  {
    value: 'Brain',
    label: 'PFAS detected in human brain tissue — they cross the blood-brain barrier',
    source: 'Environ. Sci. & Technol. 2025',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39927984/',
  },
  {
    value: '3×',
    label: 'higher odds of cognitive impairment linked to PFOS in spinal fluid',
    source: 'Environ. Sci. & Technol. 2024',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38385684/',
  },
  {
    value: 'AD link',
    label: 'higher PFOS in people with both Alzheimer\'s biomarkers and cognitive decline',
    source: 'Frontiers in Toxicology 2024',
    url: 'https://www.frontiersin.org/journals/toxicology/articles/10.3389/ftox.2023.1280543/full',
  },
  {
    value: 'Dementia',
    label: 'greater plastic particle buildup found in brains with dementia vs. healthy brains',
    source: 'Nature Medicine 2025',
    url: 'https://www.nature.com/articles/s41591-024-03453-1',
  },
  {
    value: 'Years',
    label: 'PFAS stay in your body — exposure today adds to what\'s already there',
    source: 'EPA PFAS overview',
    url: 'https://www.epa.gov/sdwa/and-polyfluoroalkyl-substances-pfas',
  },
];

/** Exposure priority — how much PFAS this item tends to add (frequency × directness) */
const EXPOSURE_TIERS = {
  critical: {
    label: 'Highest exposure',
    short: 'Swap first',
    order: 0,
    hint: 'Daily use, direct transfer into food, water, or your body.',
  },
  high: {
    label: 'High exposure',
    short: 'High',
    order: 1,
    hint: 'Frequent contact or strong leaching when used as intended.',
  },
  moderate: {
    label: 'Moderate exposure',
    short: 'Moderate',
    order: 2,
    hint: 'Adds up over time — swap when you can.',
  },
  lower: {
    label: 'Lower exposure',
    short: 'Lower',
    order: 3,
    hint: 'Smaller route for most people, but still worth knowing.',
  },
};

/** Home hotspot rooms — accordion list + detail pages */
const HOTSPOT_ROOMS = [
  {
    id: 'kitchen',
    label: 'Kitchen',
    color: '#9cb8c9',
    items: [
      {
        id: 'tap',
        label: 'Tap water',
        detail: 'Drinking and cooking water — a daily exposure route.',
        why: 'PFAS from industrial runoff and legacy contamination end up in municipal water. You drink it, cook pasta in it, and make coffee with it — so even low levels add up every single day. Boiling does not remove PFAS.',
        alternatives: [
          'Use a filter certified to reduce PFAS (look for NSF P473 or similar).',
          'Filter water used for cooking — rice, soup, and coffee absorb it.',
          'Check your local water report or EPA data for your zip code.',
        ],
        productKey: 'water',
        exposure: 'critical',
      },
      {
        id: 'pans',
        label: 'Non-stick pans',
        detail: 'Scratched coatings release PFAS directly into food.',
        why: 'Traditional non-stick coatings are fluoropolymer-based. When the pan scratches or overheats, particles and fumes can transfer into food. Daily skillet use is one of the highest-impact kitchen swaps.',
        alternatives: [
          'Switch your main pan to cast iron or stainless steel.',
          'Retire scratched non-stick — don’t wait for it to peel.',
          'Use medium heat; high heat degrades coatings faster.',
        ],
        productKey: 'cookware',
        exposure: 'critical',
      },
      {
        id: 'cans',
        label: 'Canned food',
        detail: 'Epoxy can liners — acidic foods leach more.',
        why: 'Most metal cans use epoxy liners that can contain PFAS-related compounds. Acidic foods like tomatoes and soup pull more chemicals from the liner into the food. Frequent canned meals stack exposure quickly.',
        alternatives: [
          'Buy tomatoes and beans in glass jars when possible.',
          'Choose dried beans — soak and cook once a week.',
          'Use frozen vegetables as a easy swap for canned sides.',
        ],
        productKey: 'food',
        exposure: 'critical',
      },
      {
        id: 'bottles',
        label: 'Bottle seals',
        detail: 'Cap liners on sparkling drinks and plastic bottles.',
        why: 'Plastic and metal bottle caps use liners to seal carbonated drinks. Studies have found fluorinated compounds in cap liners — carbonation and acidity can increase what leaches into the liquid.',
        alternatives: [
          'Drink filtered tap water as your default.',
          'Choose glass bottles when you buy sparkling drinks.',
          'Home carbonation skips bottle liners entirely.',
        ],
        productKey: 'food',
        exposure: 'high',
      },
      {
        id: 'plastic',
        label: 'Heated plastic',
        detail: 'Microwave plastic containers and wrap.',
        why: 'Heat makes plastic containers and wrap release more chemicals into food. Microwaving leftovers in plastic — or pouring hot food into plastic — is one of the fastest ways to increase dietary PFAS and plasticizer exposure.',
        alternatives: [
          'Store and reheat in glass or stainless containers.',
          'Never microwave food in plastic, even if labeled microwave-safe.',
          'Use a plate to cover food instead of plastic wrap.',
        ],
        productKey: 'food_storage',
        exposure: 'critical',
      },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    color: '#c4a88c',
    items: [
      {
        id: 'skin',
        label: 'Skincare',
        detail: 'Makeup, sunscreen, lotions — daily skin contact.',
        why: 'Some cosmetics and sunscreens use fluorinated compounds for spreadability or water resistance. Products sit on your skin for hours, so small amounts of PFAS-related chemicals can absorb over time — especially with daily sunscreen use.',
        alternatives: [
          'Choose mineral sunscreens with zinc oxide or titanium dioxide.',
          'Simplify routines — fewer products means fewer unknowns.',
          'Check brands that publish PFAS-free or fluorine-free testing.',
        ],
        exposure: 'moderate',
      },
      {
        id: 'clean',
        label: 'Cleaners',
        detail: 'Sprays and toilet bowl treatments.',
        why: 'Heavy-duty bathroom sprays and some toilet treatments use surfactants that may contain or break down into PFAS. You breathe the mist while cleaning, and residues stay on surfaces you touch daily.',
        alternatives: [
          'Use vinegar + water for mirrors and counters.',
          'Baking soda paste for scrubbing tubs and tile.',
          'Skip “extra strength” spray cleaners when a simple option works.',
        ],
        exposure: 'lower',
      },
      {
        id: 'tp',
        label: 'Toilet paper',
        detail: 'Some brands use PFAS for wet strength.',
        why: 'Independent testing has found PFAS indicators in some toilet paper brands — likely from manufacturing processes that add wet strength. It’s a product you use multiple times a day with direct contact.',
        alternatives: [
          'Choose unbleached or bamboo TP from brands with clean testing.',
          'Avoid “extra soft” premium rolls with heavy chemical processing.',
          'When testing data is unclear, rotate to a simpler paper option.',
        ],
        exposure: 'moderate',
      },
      {
        id: 'floss',
        label: 'Dental floss',
        detail: 'Many conventional flosses are PFAS-coated.',
        why: 'Glide-style floss and other “smooth” flosses often use PTFE (Teflon-family) coatings so they slide between teeth. You’re putting that coating directly on gum tissue — a sensitive absorption route — twice a day.',
        alternatives: [
          'Switch to silk or woven floss without PTFE coatings.',
          'Try floss picks made from silk or unwaxed thread.',
          'If floss feels sticky or ultra-smooth, check the label for PTFE.',
        ],
        productKey: 'floss',
        exposure: 'high',
      },
    ],
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    color: '#8fae9e',
    items: [
      {
        id: 'sheets',
        label: 'Bed sheets',
        detail: 'Stain- and wrinkle-resistant fabric treatments.',
        why: '“Easy care” and stain-resistant sheets are often treated with fluorinated chemicals so spills bead up. You sleep on this fabric for 8 hours — long contact time with treated surfaces every night.',
        alternatives: [
          'Choose 100% cotton or linen without stain-resistant labels.',
          'Organic cotton sheets skip many fabric treatments.',
          'Wash new sheets before first use to rinse finishes.',
        ],
        exposure: 'moderate',
      },
      {
        id: 'air',
        label: 'Air quality',
        detail: 'HVAC dust and bedroom air purifier filters.',
        why: 'PFAS accumulate in household dust from carpets, furniture, and cooking. Bedroom air is what you breathe during sleep — if dust carries PFAS, a HEPA purifier can reduce what stays airborne in the room.',
        alternatives: [
          'Run a HEPA air purifier in the bedroom at night.',
          'Vacuum with a HEPA-filter vacuum weekly.',
          'Change HVAC filters on schedule — don’t run clogged filters.',
        ],
        productKey: 'air',
        exposure: 'moderate',
      },
      {
        id: 'mattress',
        label: 'Mattress pads',
        detail: 'Waterproof protectors and treated linens.',
        why: 'Waterproof mattress protectors use fluorinated barriers to block liquids. That barrier sits directly under you — heat and sweat can increase contact with treated materials over years of use.',
        alternatives: [
          'Use a cotton mattress pad instead of waterproof if leaks aren’t an issue.',
          'Look for protectors labeled PFAS-free or fluorine-free.',
          'Layer a washable cotton cover over any protector you keep.',
        ],
        exposure: 'moderate',
      },
    ],
  },
  {
    id: 'wardrobe',
    label: 'Wardrobe',
    color: '#b5a88a',
    items: [
      {
        id: 'under',
        label: 'Underwear',
        detail: 'Synthetic blends sit against skin all day.',
        why: 'Polyester and nylon underwear sit against skin in a warm, moist environment — conditions that can increase transfer from treated synthetics. It’s all-day contact with your most absorbent skin.',
        alternatives: [
          'Start with 100% cotton underwear for daily wear.',
          'Check labels — “cotton blend” often means mostly synthetic.',
          'Replace gym underwear with cotton when possible.',
        ],
        productKey: 'underwear',
        exposure: 'moderate',
      },
      {
        id: 'athletic',
        label: 'Workout gear',
        detail: 'Moisture-wicking synthetics + sweat.',
        why: 'Performance fabrics use treatments to wick sweat and resist odor — many rely on fluorinated chemistry. Sweat and friction during exercise can increase skin contact with those treatments.',
        alternatives: [
          'Wear cotton or bamboo base layers when you can.',
          'Wash synthetic gear immediately after workouts.',
          'Don’t wear damp synthetic clothes for hours after the gym.',
        ],
        productKey: 'underwear',
        exposure: 'moderate',
      },
      {
        id: 'outer',
        label: 'Rain jackets',
        detail: 'DWR waterproof and stain-resistant coatings.',
        why: 'Most waterproof jackets use durable water repellent (DWR) finishes — historically PFAS-based. Jackets are worn for hours in rain and sweat, and older gear sheds treatment over time.',
        alternatives: [
          'Look for PFAS-free DWR or waxed cotton alternatives.',
          'Buy fewer waterproof pieces — one good shell beats a closet of coated gear.',
          'When replacing, search “PFAS-free rain jacket” explicitly.',
        ],
        productKey: 'outerwear',
        exposure: 'high',
      },
    ],
  },
  {
    id: 'misc',
    label: 'Misc',
    color: '#a39d94',
    items: [
      {
        id: 'receipts',
        label: 'Store receipts',
        detail: 'Thermal paper — handled after every purchase.',
        why: 'Most printed receipts use thermal paper treated with developers that can include BPA, BPS, or fluorinated alternatives. You handle them after shopping, then touch your phone, wallet, and food — a quick transfer route many people repeat daily.',
        alternatives: [
          'Say no to receipts when you don’t need them.',
          'Ask for email receipts instead.',
          'If you must take one, don’t let children handle receipts.',
          'Wash hands after handling — before eating or cooking.',
        ],
        exposure: 'high',
      },
      {
        id: 'takeout',
        label: 'Takeout packaging',
        detail: 'Grease-resistant wrappers and boxes.',
        why: 'Fast food wrappers, burger boxes, and pastry bags often use fluorinated coatings so grease doesn’t soak through. Hot, greasy food sits directly on treated paper — one of the most overlooked food-contact sources.',
        alternatives: [
          'Cook at home more often — biggest reduction.',
          'Transfer takeout to a plate immediately; don’t eat from the wrapper.',
          'Bring a stainless lunch box for leftovers.',
        ],
        productKey: 'food',
        exposure: 'high',
      },
      {
        id: 'hot_cups',
        label: 'Hot drink cups',
        detail: 'Paper cups for coffee and tea — plastic or PFAS linings.',
        why: 'Most disposable hot cups are not plain paper. They usually have a plastic (polyethylene) lining so liquid doesn’t leak — heat and acidic drinks like coffee can increase what migrates into your beverage. Some molded-fiber “compostable” cups and bowls have also been found with PFAS from manufacturing. Wax-lined cups exist, but plastic-lined paper cups are what most coffee shops hand out.',
        alternatives: [
          'Bring a stainless or ceramic travel mug — many cafes offer a discount.',
          'If dining in, ask for a ceramic mug instead of paper.',
          'Avoid reheating coffee in the disposable cup in the microwave.',
          'Skip the lid when you can — less plastic contact with hot liquid.',
        ],
        exposure: 'high',
      },
      {
        id: 'wrappers',
        label: 'Pizza boxes & wrappers',
        detail: 'Grease-proof paper and cardboard liners.',
        why: 'Pizza boxes, microwave pastry wrappers, and butter paper use stain- and grease-resistant treatments. Heat and oil increase what can migrate into food sitting on the surface.',
        alternatives: [
          'Slide pizza onto a plate or cutting board — not eat off the box.',
          'Choose places that use plain cardboard when you can.',
          'At home, use parchment paper labeled unbleached and PFAS-free.',
        ],
        productKey: 'food',
        exposure: 'high',
      },
      {
        id: 'popcorn',
        label: 'Microwave popcorn bags',
        detail: 'Inner bag lining resists oil and heat.',
        why: 'Microwave popcorn bags are designed to withstand high heat and oil — inner linings have historically used PFAS-related treatments. Steam carries chemicals from the bag into the popcorn you eat.',
        alternatives: [
          'Pop kernels on the stovetop or in an air popper.',
          'Use a glass bowl with a vented cover in the microwave.',
          'Buy plain kernels — cheaper and avoids the bag entirely.',
        ],
        exposure: 'high',
      },
      {
        id: 'furniture',
        label: 'Stain-resistant furniture',
        detail: 'Treated upholstery and carpets.',
        why: 'Sofas, carpets, and car seats marketed as stain- or spill-resistant often use fluorinated fabric treatments. PFAS can shed into household dust — especially in homes with kids crawling on floors.',
        alternatives: [
          'Choose untreated natural fabrics when buying new furniture.',
          'Vacuum with a HEPA filter regularly.',
          'Wash hands after kids play on carpet — before snacks.',
        ],
        productKey: 'air',
        exposure: 'moderate',
      },
    ],
  },
];

function sortItemsByExposure(items) {
  return [...items].sort(
    (a, b) => EXPOSURE_TIERS[a.exposure]?.order - EXPOSURE_TIERS[b.exposure]?.order
  );
}

function getAllHotspotEntries() {
  return HOTSPOT_ROOMS.flatMap((room) =>
    room.items.map((item) => ({ room, item }))
  );
}

const HOME_SWAP_PREVIEW = 5;
const SWAPS_LIST_LIMIT = 20;

function getRankedExposureEntries(limit = SWAPS_LIST_LIMIT) {
  return getAllHotspotEntries()
    .sort((a, b) => {
      const tier = EXPOSURE_TIERS[a.item.exposure].order - EXPOSURE_TIERS[b.item.exposure].order;
      if (tier !== 0) return tier;
      return a.room.label.localeCompare(b.room.label) || a.item.label.localeCompare(b.item.label);
    })
    .slice(0, limit);
}

function findHotspot(roomId, itemId) {
  const room = HOTSPOT_ROOMS.find((r) => r.id === roomId);
  if (!room) return null;
  const item = room.items.find((i) => i.id === itemId);
  if (!item) return null;
  return { room, item };
}

const PRODUCTS = {
  underwear: {
    title: 'Cotton Underwear',
    items: [
      { name: 'Hanes Cotton Briefs (Women)', desc: '100% cotton.', asin: 'B00KWS2MVS', imageUrl: 'https://m.media-amazon.com/images/I/71YQvK9JqZL._SL400_.jpg' },
      { name: 'Hanes Cotton Boxer Briefs (Men)', desc: 'Pure cotton.', asin: 'B00JUM6SKG', imageUrl: 'https://m.media-amazon.com/images/I/81QvK9JqZL._SL400_.jpg' },
      { name: 'Pact Organic Cotton', desc: 'GOTS organic.', asin: 'B08L6VQZ9K', imageUrl: 'https://m.media-amazon.com/images/I/71XNG8D6L2L._SL400_.jpg' },
    ],
  },
  food_storage: {
    title: 'Glass & Silicone Storage',
    items: [
      { name: 'Pyrex Glass Set', desc: 'Tempered glass.', asin: 'B0002YTF0Q', imageUrl: 'https://m.media-amazon.com/images/I/81vJiT8+5zL._SL400_.jpg' },
      { name: 'Stasher Silicone Bags', desc: 'Platinum silicone.', asin: 'B07BM3YMHY', imageUrl: 'https://m.media-amazon.com/images/I/71dEhIS7KwL._SL400_.jpg' },
      { name: 'Anchor Hocking Glass', desc: 'Snap lids.', asin: 'B01N6PCLYR', imageUrl: 'https://m.media-amazon.com/images/I/71kby8+lIDL._SL400_.jpg' },
    ],
  },
  cookware: {
    title: 'PFAS-Free Cookware',
    items: [
      { name: 'Cuisinart Stainless Set', desc: 'No coating.', asin: 'B00008CM6J', imageUrl: 'https://m.media-amazon.com/images/I/71LJJrKberL._SL400_.jpg' },
      { name: 'Lodge Cast Iron Skillet', desc: 'Pre-seasoned.', asin: 'B00006JSUB', imageUrl: 'https://m.media-amazon.com/images/I/81W6o8bRCKL._SL400_.jpg' },
      { name: 'Caraway Ceramic Set', desc: 'PFAS-free ceramic.', asin: 'B08N5WRWNW', imageUrl: 'https://m.media-amazon.com/images/I/71XNG8D6L2L._SL400_.jpg' },
    ],
  },
  water: {
    title: 'Water Filtration',
    items: [
      { name: 'Berkey Filter', desc: 'Gravity filter.', asin: 'B0040ZOF0C' },
      { name: 'Aquasana RO System', desc: 'Under-sink RO.', asin: 'B01M0DQQB5' },
      { name: 'Epic Pure Pitcher', desc: 'NSF-tested PFAS reduction.', asin: 'B0851VLWMX' },
    ],
  },
  food: {
    title: 'Food & Kitchen',
    items: [
      { name: 'If You Care Parchment', desc: 'Unbleached paper.', asin: 'B0000DDWEK' },
      { name: 'SodaStream Maker', desc: 'Skip bottle liners.', asin: 'B0189CQ7J0', imageUrl: 'https://m.media-amazon.com/images/I/71XNG8D6L2L._SL400_.jpg' },
      { name: 'LunchBots Steel Lunch Box', desc: 'No plastic wrap.', asin: 'B0029XDZ6A', imageUrl: 'https://m.media-amazon.com/images/I/71kby8+lIDL._SL400_.jpg' },
    ],
  },
  floss: {
    title: 'PFAS-Free Floss',
    items: [
      { name: 'Cocofloss Dental Floss', desc: 'Woven floss, no PTFE.', asin: 'B07H7R8G2V' },
      { name: 'Dr. Tung\'s Smart Floss', desc: 'Natural cardamom floss.', asin: 'B00012NQKW' },
      { name: 'Radius Silk Floss', desc: 'Biodegradable silk.', asin: 'B0013LR1WC' },
    ],
  },
  air: {
    title: 'Air Purification',
    items: [
      { name: 'Levoit Core 300 HEPA', desc: 'HEPA bedroom purifier.', asin: 'B08R5WJ8ZF' },
      { name: 'Honeywell HEPA Filter', desc: 'True HEPA replacement.', asin: 'B00895BA84' },
    ],
  },
  outerwear: {
    title: 'PFAS-Free Outerwear',
    items: [
      { name: 'Fjällräven Greenland Jacket', desc: 'Wax cotton, no DWR.', searchQuery: 'fjallraven greenland jacket' },
      { name: 'Patagonia Torrentshell 3L', desc: 'Check latest PFAS-free line.', searchQuery: 'patagonia torrentshell 3l' },
    ],
  },
};
