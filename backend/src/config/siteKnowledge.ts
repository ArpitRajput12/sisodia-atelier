// ==============================================================================
// SISODIA ATELIER ✧ - VERIFIED COMPREHENSIVE KNOWLEDGE BASE
// Location: Nagina, India — Principal / Owner: Yash Sisodia
// Historic Woodcraft Hub Since 1892
// ==============================================================================

export interface SocialMediaChannel {
  platform: string;
  handle: string;
  url: string;
  description: string;
  synonyms: string[];
}

export interface WebsitePageLink {
  title: string;
  path: string;
  description: string;
  topics: string[];
}

export interface QualityPillar {
  number: number;
  title: string;
  pillar: string;
  tagline: string;
  description: string;
  scientificFacts: string[];
}

export const SITE_KNOWLEDGE_BASE = {
  brand: {
    name: 'SISODIA ATELIER ✧',
    principalOwner: 'Yash Sisodia',
    location: {
      town: 'Nagina',
      district: 'Bijnor',
      pinCode: '246762',
      country: 'India',
      historicalHeritage: 'India’s historic woodcraft capital and fine artisan carving hub since 1892.',
      address: 'Woodcraft Export Cluster, Nagina, Bijnor 246762, India',
    },
    tagline: 'Ultra-Luxury Heirloom Monolithic Solid Wood Handicrafts & Architectural Wooden Tiles',
  },

  founderAndLegacy: {
    principalFounder: 'Yash Sisodia',
    role: 'Principal & Founder',
    origin: 'Nagina, India',
    fatherLegacyYears: '20+ Years of Generational Family Craftsmanship & Trust',
    familyHistory:
      'SISODIA ATELIER ✧ is built upon a distinguished 20-year family handicraft legacy established by Yash Sisodia’s father in Nagina. Over the last two decades, his father earned deep trust through honest pricing, pure seasoned heartwood, and uncompromised hand-carving standards.',
    globalMission:
      'Continuing his father’s respected legacy, Yash Sisodia founded and leads SISODIA ATELIER ✧ to bring Nagina’s generational woodcraft and architectural solid wooden tiles to discerning homes, architects, and luxury hotels across USA, UK, Europe (Netherlands, Germany, France), Australia, Dubai, Canada, Mexico, and UAE—with 100% pre-paid DDP delivery and direct founder accountability.',
    founderDesk: {
      email: 'Sisodiaatelier09@gmail.com',
      phone: '+91 8868031460',
      phoneDisplay: '+91 88680 31460',
      whatsapp: 'https://wa.me/918868031460',
    },
  },

  qualityPillars: [
    {
      number: 1,
      title: '100% Monolithic Single-Trunk Heartwood',
      pillar: 'Monolithic Timber Integrity',
      tagline: 'NAGINA HEARTWOOD HERITAGE — ZERO COMPOSITE FILLERS',
      description:
        'Every vessel, urn, console, armoire, and decorative piece is lathe-turned or chiseled from a singular, unjoined solid block of aged Burma Teak, Sacred Ayurvedic Vijaysar, Desert Sheesham, or Kashmir Walnut. Completely free of plywood, MDF core, and glued surface veneers.',
      scientificFacts: [
        'Zero chemical resin glue seams',
        'Zero thin veneer laminates',
        'Singular continuous tree ring continuity',
      ],
    },
    {
      number: 2,
      title: '7.2% Certified Kiln-Dried Moisture Equilibrium',
      pillar: 'Winter Radiator & HVAC Climate Immunity',
      tagline: 'PERMANENT CRACK, SPLIT & WARP IMMUNITY',
      description:
        'Conditioned through solar-wind kilns to a strict 7.2% core moisture equilibrium. Relieves internal cellular tension so that pieces are scientifically immune to checking, cracking, hairline fissures, or warping even beside intense indoor winter steam radiator heating and dry HVAC lofts across North America, the UK, and Europe.',
      scientificFacts: [
        'Cell tension neutralized at 7.2% moisture content',
        'Tested beside 24/7 winter heating systems in New York, London, and Zurich without shifting',
      ],
    },
    {
      number: 3,
      title: '100% Chemical-Free Food-Safe Finishing',
      pillar: 'Ayurvedic Nut Oils & Desert Beeswax',
      tagline: 'ZERO TOXIC POLYURETHANE OR SYNTHETIC VARNISH',
      description:
        'We completely reject polyurethane, polyester coatings, chemical lacquers, and synthetic VOC primers. Every piece is hand-burnished exclusively with pure cold-pressed Kashmiri walnut oil and organic riverbank desert beeswax. 100% food-safe, non-toxic, and naturally restorative.',
      scientificFacts: [
        'Zero VOCs and zero synthetic sealants',
        'Emits natural honey and nutty aroma',
        'Safe for raw bread, sourdough, charcuterie, fruit, and salad presentation',
      ],
    },
    {
      number: 4,
      title: 'Architectural Solid Wooden Tiles',
      pillar: 'Modular Carved Wood Surfaces for Walls & Floors',
      tagline: 'SIGNATURE NAGINA JAALI & CARVED MODULAR PANELS',
      description:
        'Signature hand-chiseled solid wood tiles and geometric acoustic panels sculpted for luxury interior feature walls, grand headboards, boutique hotel lobbies, and elite residential floors. Available in 30x30 cm modular tiles with tongue-and-groove or flush adhesive mounting.',
      scientificFacts: [
        'Sculpted from aged Burma Teak & Desert Sheesham',
        'Available in Jaali floral fretwork, fluted reeding, and chevron bas-relief',
        'Direct link: /shop?category=tiles',
      ],
    },
    {
      number: 5,
      title: 'ISPM-15 Certified Cedar Travel Vaults',
      pillar: 'Museum-Grade Conservation Packaging',
      tagline: 'SHOCK-ISOLATED ZERO-DAMAGE TRAVEL CRATES',
      description:
        'Every international consignment travels in custom-built, heat-treated, fumigated ISPM-15 cedar travel vaults equipped with internal neoprene shock isolation cushions, sealed waterproof vapor wraps, and calibrated 3-axis electronic tilt and impact sensors. Covered by 100% comprehensive transit damage replacement insurance.',
      scientificFacts: [
        'ISPM-15 export compliant worldwide',
        '3-axis electronic tilt sensors verify upright handling',
        '100% replacement guarantee if transit damage occurs within 48h of uncrating',
      ],
    },
    {
      number: 6,
      title: '100% Delivered Duty Paid (DDP Guarantee)',
      pillar: 'Zero Doorstep Tariffs & Clearances',
      tagline: '$0.00 DOORSTEP IMPORT DUTY LIABILITY',
      description:
        'All international consignments are shipped 100% Delivered Duty Paid (DDP). SISODIA ATELIER ✧ pre-clears all foreign import duties, British VAT, EU tariffs, and customs documentation prior to air departure. Patrons pay exactly $0.00 in surprise tariffs or port clearance fees at delivery.',
      scientificFacts: [
        'Pre-cleared with DHL Express Priority Air Cargo & FedEx Air',
        'Strictly 11 export territories: USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, UAE',
      ],
    },
  ],

  serviceableCountries: [
    { country: 'United States', code: 'US', currency: 'USD', symbol: '$', rateAgainstInr: 84.0, ddpNote: '100% DDP - US Customs, FDA Timber Compliance & Port Tariffs Pre-Cleared ($0 Doorstep Tariffs)' },
    { country: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£', rateAgainstInr: 107.0, ddpNote: '100% DDP - UK HMRC VAT & Import Customs Pre-Cleared' },
    { country: 'Europe', code: 'EU', currency: 'EUR', symbol: '€', rateAgainstInr: 91.0, ddpNote: '100% DDP - EU Import Duties & Schengen VAT Pre-Cleared' },
    { country: 'Australia', code: 'AU', currency: 'AUD', symbol: 'A$', rateAgainstInr: 55.0, ddpNote: '100% DDP - Australian Border Force & Biosecurity Quarantined Clearances Handled' },
    { country: 'Dubai', code: 'AE-DU', currency: 'AED', symbol: 'AED ', rateAgainstInr: 22.85, ddpNote: '100% DDP - Dubai Customs Pre-Paid ($0 Doorstep Tariffs)' },
    { country: 'Netherlands', code: 'NL', currency: 'EUR', symbol: '€', rateAgainstInr: 91.0, ddpNote: '100% DDP - Netherlands & EU Customs Pre-Cleared' },
    { country: 'Germany', code: 'DE', currency: 'EUR', symbol: '€', rateAgainstInr: 91.0, ddpNote: '100% DDP - German Zoll & Import Taxes Pre-Cleared' },
    { country: 'Canada', code: 'CA', currency: 'CAD', symbol: 'C$', rateAgainstInr: 61.0, ddpNote: '100% DDP - CBSA Duties & GST/HST Pre-Paid' },
    { country: 'France', code: 'FR', currency: 'EUR', symbol: '€', rateAgainstInr: 91.0, ddpNote: '100% DDP - Douane Française & TVA Pre-Cleared' },
    { country: 'Mexico', code: 'MX', currency: 'MXN', symbol: 'MX$', rateAgainstInr: 4.2, ddpNote: '100% DDP - SAT Aduana México Clearance & IVA Pre-Cleared' },
    { country: 'United Arab Emirates', code: 'AE', currency: 'AED', symbol: 'AED ', rateAgainstInr: 22.85, ddpNote: '100% DDP - UAE Federal Tax Authority (FTA) 5% VAT Pre-Cleared' },
  ],

  websitePages: [
    {
      title: 'Home / Atelier Showcase',
      path: '/',
      description: 'The front door of SISODIA ATELIER ✧ showcasing the 3D Serpentine Carousel, 6 Trust Pillars, Artisan Documentary Reels, and Purity Blueprint.',
      topics: ['home', 'homepage', 'main page', 'overview', 'about us', 'reels', 'serpentine carousel'],
    },
    {
      title: 'The Masterpiece Collection (Shop)',
      path: '/shop',
      description: 'Explore our full catalogue filtered by room (Living Room, Kitchen & Dining, Botanical / Balcony, Architectural Wall) or category (Urns & Planters, Consoles, Tiles, Bowls & Vessels, Trays).',
      topics: ['shop', 'store', 'collection', 'catalog', 'buy', 'pieces', 'urns', 'planters', 'tiles', 'consoles', 'vessels', 'boards', 'trays', 'living room', 'dining'],
    },
    {
      title: 'Architectural & Hotel Trade Program',
      path: '/trade',
      description: 'B2B hospitality portal for interior architects, luxury hoteliers, and estate developers requesting bulk 20ft/40ft containers, custom dimension carvings, and wholesale estimates.',
      topics: ['trade', 'hotel', 'hospitality', 'bulk', 'wholesale', 'architect', 'interior designer', 'custom sizes', 'container', 'b2b', 'schedule a meeting'],
    },
    {
      title: 'Live Order Radar & Consignment Tracking',
      path: '/orders',
      description: 'Patron tracking radar monitoring 6-stage crafting, moisture verification, ISPM-15 crating, and DHL Express international air cargo dispatches.',
      topics: ['order', 'track', 'tracking', 'telemetry', 'stage', 'where is my order', 'status', 'radar', 'delivery date', 'invoice', 'tax invoice'],
    },
  ],

  socialMedia: [
    {
      platform: 'Instagram',
      handle: '@sisodiaatelier9',
      url: 'https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0',
      description: 'Official Instagram of SISODIA ATELIER ✧ featuring lathe turning showreels, kiln drying, and hand-carved solid wood masterpieces.',
      synonyms: ['insta', 'instagram', 'ig', 'reels', 'photos', 'stories'],
    },
    {
      platform: 'LinkedIn',
      handle: 'Sisodia Atelier',
      url: 'https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      description: 'Official LinkedIn presence for B2B architectural partnerships, hotel trade, and international export logistics.',
      synonyms: ['linkedin', 'corporate', 'b2b network', 'professional'],
    },
    {
      platform: 'WhatsApp Direct Desk',
      handle: '+91 88680 31460',
      url: 'https://wa.me/918868031460',
      description: 'Direct WhatsApp communication with Yash Sisodia for bespoke commissions and trade inquiries.',
      synonyms: ['whatsapp', 'wa', 'chat', 'direct message', 'text', 'call', 'phone', 'contact number'],
    },
    {
      platform: 'Official Business Email',
      handle: 'Sisodiaatelier09@gmail.com',
      url: 'mailto:Sisodiaatelier09@gmail.com',
      description: 'Official atelier email for Yash Sisodia, handling overseas consignments, trade contracts, and custom inquiries.',
      synonyms: ['email', 'mail', 'write', 'contact', 'support email', 'desk'],
    },
  ],

  orderingSteps: [
    {
      step: 1,
      title: 'Select Destination Country & Currency',
      detail: 'In the top announcement bar, select your country from the 11 supported export destinations (USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, UAE) to view localized prices.',
    },
    {
      step: 2,
      title: 'Select Your Heirloom Piece',
      detail: 'Explore our catalog at [The Masterpiece Collection](/shop) and choose any solid heartwood piece or architectural tile.',
    },
    {
      step: 3,
      title: 'Add to Acquisition Bag',
      detail: 'On the piece’s page, click "Add Solid Heartwood Piece to Bag". You can also specify custom dimensions or monogram requests.',
    },
    {
      step: 4,
      title: 'Proceed to Pre-Paid DDP Checkout',
      detail: 'Open your Acquisition Bag (top right) and click "Proceed to DDP Checkout".',
    },
    {
      step: 5,
      title: 'Secure Payment',
      detail: 'Pay securely via Stripe (Visa, Mastercard, Amex, Apple Pay, Google Pay) or PayPal with buyer protection.',
    },
    {
      step: 6,
      title: 'Doorstep Handover with $0 Tariffs',
      detail: 'Your consignment travels in an ISPM-15 fumigated cedar vault with pre-cleared customs and $0 doorstep tariffs.',
    },
  ],
};

/**
 * Format the knowledge base into a concise, rich markdown prompt context
 */
export function generateSiteKnowledgePrompt(): string {
  const kb = SITE_KNOWLEDGE_BASE;

  const pillarsText = kb.qualityPillars
    .map((p) => `Pillar ${p.number} [${p.title}]: ${p.description}`)
    .join('\n');

  const countriesText = kb.serviceableCountries
    .map((c) => `• ${c.country} (${c.code}): ${c.currency} (${c.symbol}), rate: 1 ${c.currency} = ${c.rateAgainstInr} INR. ${c.ddpNote}`)
    .join('\n');

  const pagesText = kb.websitePages
    .map((pg) => `• [${pg.title}](${pg.path}): ${pg.description}`)
    .join('\n');

  const socialText = kb.socialMedia
    .map((s) => `• ${s.platform}: \`${s.handle}\` (${s.url}) — ${s.description}`)
    .join('\n');

  const stepsText = kb.orderingSteps
    .map((s) => `${s.step}. **${s.title}**: ${s.detail}`)
    .join('\n');

  return `
=== SISODIA ATELIER ✧ OFFICIAL KNOWLEDGE BASE ===
ATELIER HERITAGE & PRINCIPAL:
- Brand: ${kb.brand.name}
- Principal & Owner: ${kb.brand.principalOwner}
- Location: ${kb.brand.location.town}, ${kb.brand.location.district} ${kb.brand.location.pinCode}, ${kb.brand.location.country}.
- Heritage: ${kb.brand.location.historicalHeritage}

FOUNDER & GENERATIONAL LEGACY (20+ YEARS OF FAMILY TRUST):
- Principal & Founder: ${kb.founderAndLegacy.principalFounder}
- Origin: ${kb.founderAndLegacy.origin} (Historic woodcraft and single-trunk carving capital)
- 20+ Years Family Legacy: ${kb.founderAndLegacy.familyHistory}
- Carrying the Legacy Forward: ${kb.founderAndLegacy.globalMission}
- Direct Founder Desk: Email ${kb.founderAndLegacy.founderDesk.email} | Phone/WhatsApp ${kb.founderAndLegacy.founderDesk.phoneDisplay} (${kb.founderAndLegacy.founderDesk.whatsapp})

WHY CHOOSE SISODIA ATELIER ✧ (6 QUALITY PILLARS):
${pillarsText}

STRICT 11 SERVICEABLE EXPORT COUNTRIES & DDP GUARANTEE ($0 DOORSTEP TARIFFS):
${countriesText}
(Note: Only these 11 countries are supported for international export deliveries.)

WEBSITE PAGES & ROUTES:
${pagesText}

SOCIAL MEDIA HANDLES & OFFICIAL CONTACTS:
${socialText}

HOW TO ORDER STEP-BY-STEP:
${stepsText}
===============================================
`.trim();
}
