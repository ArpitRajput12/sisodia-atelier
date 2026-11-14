// ==============================================================================
// SISODIA ATELIER - ULTRA-FAST IN-MEMORY TTL CACHE SERVICE (<1ms RAM Lookup)
// Zero-Cost In-Memory Caching for Products, Verified Policies & FAQ Intent
// ==============================================================================

import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Epoch timestamp in ms
}

export interface CachedProduct {
  id: string;
  slug: string;
  sku: string;
  title: string;
  name?: string | null;
  category: string;
  catKey: string;
  room?: string;
  woodSpecies: string;
  basePriceInr: number;
  dimensionsCm: any;
  netWeightKg: number;
  stockQuantity: number;
  isFeatured: boolean;
  shortDescription: string;
  finishType: string;
  primaryImage?: string;
}

export interface VerifiedPolicyData {
  serviceableCountries: string[];
  unsupportedCountryMessage: string;
  ddpGuarantee: string;
  timberStandards: string;
  kilnEquilibrium: string;
  finishingIntegrity: string;
  transitInsurance: string;
  videoCallRule: string;
}

export class CacheService {
  private static store = new Map<string, CacheEntry<any>>();

  /**
   * Get cached item by key
   */
  static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set cached item with TTL in seconds (defaults to 300s / 5min)
   */
  static set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Delete specific key from cache
   */
  static del(key: string): void {
    this.store.delete(key);
  }

  /**
   * Check if a valid unexpired key exists
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate all product-related cache keys.
   * Call whenever Owner adds, updates, stars, or deletes a product.
   */
  static invalidateProductCache(): void {
    for (const key of this.store.keys()) {
      if (key.startsWith('products:')) {
        this.store.delete(key);
      }
    }
    logger.info('⚡ [In-Memory Cache] Product catalog cache invalidated and purged from RAM.');
  }

  /**
   * Clear entire in-memory store
   */
  static clear(): void {
    this.store.clear();
  }

  /**
   * Retrieve all active products from RAM (<1ms).
   * Reads from DB if cache miss or invalidated.
   */
  static async getAllCachedProducts(): Promise<CachedProduct[]> {
    const CACHE_KEY = 'products:all';
    const cached = this.get<CachedProduct[]>(CACHE_KEY);
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const dbProducts = await prisma.product.findMany({
        orderBy: { isFeatured: 'desc' },
        take: 100,
      });

      if (dbProducts && dbProducts.length > 0) {
        const mapped: CachedProduct[] = dbProducts.map((p) => ({
          id: p.id,
          slug: p.id,
          sku: `SA-${p.id.slice(0, 6).toUpperCase()}`,
          title: p.name,
          name: p.name,
          category: p.category,
          catKey: p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          woodSpecies: p.material || 'Solid Heartwood',
          basePriceInr: Number(p.basePriceINR),
          dimensionsCm: { length: 45, width: 45, height: 18 },
          netWeightKg: Number(p.weightKg || 12),
          stockQuantity: p.stock,
          isFeatured: p.isFeatured,
          shortDescription: p.description,
          finishType: 'Cold-Pressed Walnut Oil & Beeswax',
          primaryImage: p.imageUrl,
        }));

        this.set(CACHE_KEY, mapped, 300);
        return mapped;
      }
    } catch (err: any) {
      logger.warn(`Cache DB lookup: ${err.message}`);
    }

    return [];
  }

  /**
   * Retrieve verified policies from RAM (<0.5ms).
   */
  static getVerifiedPolicies(): VerifiedPolicyData {
    const CACHE_KEY = 'policies:verified';
    const cached = this.get<VerifiedPolicyData>(CACHE_KEY);
    if (cached) return cached;

    const policies: VerifiedPolicyData = {
      serviceableCountries: [
        'United States (USA)',
        'United Kingdom (UK)',
        'Europe (Netherlands, Germany, France)',
        'Australia',
        'Dubai (UAE)',
        'Netherlands',
        'Germany',
        'Canada',
        'France',
        'Mexico',
        'United Arab Emirates (UAE)',
      ],
      unsupportedCountryMessage:
        'Currently, SISODIA ATELIER ✧ ships directly to USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE. For special freight inquiries to other regions, please contact Sisodiaatelier09@gmail.com.',
      ddpGuarantee:
        '100% Delivered Duty Paid (DDP). All US customs, British VAT, EU import duties, and UAE clearances are pre-paid by SISODIA ATELIER ✧. Patrons never receive a secondary doorstep courier tariff.',
      timberStandards:
        '100% single-trunk solid heartwood (Burma Teak, Desert Sheesham, Sacred Vijaysar, Kashmir Walnut) chiseled in Nagina, India. Zero plywood, zero veneer, zero MDF fillers.',
      kilnEquilibrium:
        'Cured in solar wind kilns to a strict 7.2% core moisture equilibrium. Guaranteed never to crack, warp, or split near winter indoor radiators or dry heated lofts in the West.',
      finishingIntegrity:
        '100% chemical-free organic hand-burnish using cold-pressed Kashmiri walnut oil and raw riverbank beeswax. Completely food-safe and non-toxic.',
      transitInsurance:
        'Anchored in ISPM-15 fumigated cedar travel vaults outfitted with 3-axis electronic tilt and shock sensors. Covered with 100% transit damage replacement insurance.',
      videoCallRule: 'Never mention live video calls or video inspections.',
    };

    this.set(CACHE_KEY, policies, 3600); // 1 hour TTL
    return policies;
  }

  /**
   * Fast FAQ answer lookup (<0.2ms)
   */
  static getFaqAnswer(normalizedQuery: string): string | null {
    const q = normalizedQuery.toLowerCase().trim();

    // Check pre-warmed FAQ cache
    const cacheKey = `faq:${q}`;
    const cached = this.get<string>(cacheKey);
    if (cached) return cached;

    // Fast keyword routing
    if (
      q.includes('radiator') ||
      q.includes('crack') ||
      q.includes('moisture') ||
      q.includes('warp') ||
      q.includes('winter') ||
      q.includes('equilibrium') ||
      q.includes('7.2')
    ) {
      const ans =
        'Commercial furniture splits in heated homes because modern factories dry lumber only to 14%–18%. When exposed to winter radiators in London, Zurich, or Manhattan, moisture is sucked out violently. At SISODIA ATELIER ✧, our timber is cured in Nagina solar wind kilns down to precisely 7.2% core moisture content. At 7.2% equilibrium, cellular capillaries are stable and guaranteed never to fissure or warp beside your radiators.';
      this.set(cacheKey, ans, 600);
      return ans;
    }

    if (
      q.includes('vijaysar') ||
      q.includes('blue water') ||
      q.includes('ayurvedic') ||
      q.includes('pterocarpus')
    ) {
      const ans =
        'Vijaysar (Pterocarpus marsupium) is our revered Ayurvedic miracle heartwood from Malabar. When room-temperature spring water rests overnight in our monolithic Vijaysar chalice or basin, bioactive flavonoids (pterostilbene and epicatechin) naturally infuse the water with a luminous cobalt blue hue. Revered for two millennia by Indian royalty for metabolic and digestive vitality.';
      this.set(cacheKey, ans, 600);
      return ans;
    }

    if (
      q.includes('ddp') ||
      q.includes('tariff') ||
      q.includes('customs') ||
      q.includes('tax') ||
      q.includes('import duty') ||
      q.includes('delivery fee')
    ) {
      const ans =
        'Every overseas consignment travels under 100% Delivered Duty Paid (DDP) terms. SISODIA ATELIER ✧ pre-pays all foreign customs, import tariffs, and local VAT before air dispatch. What you pay at checkout is your final total — you will never receive an unexpected courier bill at your doorstep.';
      this.set(cacheKey, ans, 600);
      return ans;
    }

    if (
      q.includes('species') ||
      q.includes('teak') ||
      q.includes('sheesham') ||
      q.includes('walnut') ||
      q.includes('plywood') ||
      q.includes('veneer')
    ) {
      const ans =
        'SISODIA ATELIER ✧ sculpts exclusively from 100% monolithic, single-trunk solid heartwood: 80–120 year seasoned Burma Teak (rich in silica and natural oils), dense Desert Sheesham (dramatic amber-espresso growth rings), high-altitude Kashmir Walnut, and Ayurvedic Vijaysar. We completely reject glued plywood, veneers, and particle fillers.';
      this.set(cacheKey, ans, 600);
      return ans;
    }

    if (
      q.includes('finish') ||
      q.includes('oil') ||
      q.includes('wax') ||
      q.includes('toxic') ||
      q.includes('food safe') ||
      q.includes('polyurethane')
    ) {
      const ans =
        'We completely reject synthetic polyurethane varnishes and toxic chemical sprays. Every piece is hand-burnished using cold-pressed Kashmiri walnut oil and organic desert beeswax harvested from riverbanks. The finish is 100% edible, food-safe, and breathable.';
      this.set(cacheKey, ans, 600);
      return ans;
    }

    if (
      q.includes('tile') ||
      q.includes('wall relief') ||
      q.includes('floor tile') ||
      q.includes('architectural panel')
    ) {
      const ans =
        'Our Solid Wooden Tiles (Wall & Floor) are sculpted in Nagina from monolithic Burma Teak and Desert Sheesham. Featuring 3D geometric acoustic carvings and precision tongue-in-groove interlocking profiles, they are tailored for palatial accent walls, luxury headboards, and hotel suites.';
      this.set(cacheKey, ans, 600);
      return ans;
    }

    return null;
  }


}
