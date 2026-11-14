export const APP_CONSTANTS = {
  BRAND_NAME: 'SISODIA ATELIER ✧',
  TAGLINE: 'Heirloom Solid Wood Handicrafts & Wooden Tiles for Discerning Patrons Worldwide',
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'GBP', 'EUR', 'AED', 'AUD', 'CAD', 'MXN'] as const,
  CURRENCY_SYMBOLS: {
    INR: '₹',
    USD: '$',
    GBP: '£',
    EUR: '€',
    AED: 'AED ',
    AUD: 'A$',
    CAD: 'C$',
    MXN: 'MX$',
  } as const,
  // Baseline conversion rates relative to USD (1 USD = X Currency)
  ESTIMATED_EXCHANGE_RATES: {
    USD: 1.0,
    INR: 86.5,
    GBP: 0.79,
    EUR: 0.92,
    AED: 3.67,
    AUD: 1.55,
    CAD: 1.38,
    MXN: 20.0,
  } as const,
  EXPORT_LOGISTICS: {
    BASE_CRATING_FEE_USD: 250,
    WHITE_GLOVE_MUSEUM_CASE_FEE_USD: 650,
    INTERNATIONAL_MARINE_INSURANCE_RATE: 0.018, // 1.8% of product value
    DEFAULT_HS_CODE: '9403.60.00', // Wooden Furniture
  },
  CITES_WOOD_SPECIES: {
    ROYAL_SHEESHAM: {
      commonName: 'Royal Sheesham (Indian Rosewood)',
      botanicalName: 'Dalbergia sissoo',
      origin: 'Rajasthan & Northern India',
      vptClassification: 'CITES Appendix II certified sustainable harvest',
    },
    BURMA_TEAK: {
      commonName: 'Aged Burma Teak',
      botanicalName: 'Tectona grandis',
      origin: 'Mewar & Central Forest Reserves',
      vptClassification: 'VPA Legal Timber Assurance',
    },
    INDIAN_ROSEWOOD: {
      commonName: 'Indian Rosewood (East Indian Rosewood)',
      botanicalName: 'Dalbergia latifolia',
      origin: 'Southern Western Ghats',
      vptClassification: 'CITES Appendix II Certificate with export clearance',
    },
    KASHMIR_WALNUT: {
      commonName: 'Kashmir Walnut',
      botanicalName: 'Juglans regia',
      origin: 'Kashmir Valley Highlands',
      vptClassification: 'Heritage Forest Licensed Harvest',
    },
    MALABAR_SANDALWOOD: {
      commonName: 'Malabar Sandalwood (Accents & Sacred Inlay)',
      botanicalName: 'Santalum album',
      origin: 'Government Forest Depot Auctions',
      vptClassification: 'Govt Forest Department Certificate of Origin',
    },
  },
} as const;

