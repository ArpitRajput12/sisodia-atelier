import { Prisma, Currency } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/apiError';
import { APP_CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

interface ProductFilterOptions {
  category?: string;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export function slugifyCategoryName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ProductService {
  /**
   * Format product for API response with unified properties
   */
  public static formatProduct(product: any, _targetCurrency: Currency = Currency.USD) {
    const baseInr = Number(product.basePriceINR ?? 0);
    const imageUrl = product.imageUrl || '';
    const gallery = Array.isArray(product.galleryMedia) ? product.galleryMedia : [];
    const allImages = imageUrl ? [imageUrl, ...gallery] : [...gallery];

    return {
      ...product,
      id: product.id,
      slug: product.id,
      name: product.name,
      title: product.name,
      subtitle: product.subtitle || '',
      tagline: product.subtitle || '',
      description: product.description || '',
      shortDescription: product.description || '',
      category: product.category,
      catKey: slugifyCategoryName(product.category || 'artisan-pieces'),
      room: product.room || 'Living Room',
      material: product.material || 'Solid Heartwood',
      woodSpecies: product.material || 'Burma Teak',
      dimensions: product.dimensions || '',
      weightKg: product.weightKg ? Number(product.weightKg) : null,
      netWeightKg: product.weightKg ? Number(product.weightKg) : 12,
      basePriceINR: baseInr,
      basePriceInr: baseInr,
      priceUsd: Math.round(baseInr / 84),
      priceGbp: Math.round(baseInr / 107),
      priceEur: Math.round(baseInr / 91),
      priceAed: Math.round(baseInr / 22.85),
      stock: product.stock ?? 1,
      stockQuantity: product.stock ?? 1,
      isFeatured: Boolean(product.isFeatured),
      imageUrl,
      images: allImages,
      galleryMedia: gallery,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Retrieve catalog products with filters from Neon PostgreSQL
   * Returns empty array [] if 0 products exist in DB.
   */
  static async getProducts(filters: ProductFilterOptions = {}) {
    const {
      category,
      featured,
      isFeatured,
      search,
      page = APP_CONSTANTS.DEFAULT_PAGE,
      limit = APP_CONSTANTS.DEFAULT_PAGE_SIZE,
      sort = 'newest',
      currency = Currency.USD,
    } = filters;

    const safePage = Math.max(1, Number(page || APP_CONSTANTS.DEFAULT_PAGE));
    const safeLimit = Math.min(Math.max(1, Number(limit || APP_CONSTANTS.DEFAULT_PAGE_SIZE)), 100);

    const where: Prisma.ProductWhereInput = {};
    const andClauses: Prisma.ProductWhereInput[] = [];

    if (category && category.toLowerCase() !== 'all') {
      andClauses.push({
        category: { equals: category, mode: 'insensitive' },
      });
    }

    const effectiveFeatured = isFeatured !== undefined ? isFeatured : featured;
    if (effectiveFeatured !== undefined) {
      where.isFeatured = effectiveFeatured;
    }

    if (search && search.trim()) {
      const q = search.trim();
      andClauses.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { material: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { basePriceINR: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { basePriceINR: 'desc' };
    }

    const skip = (safePage - 1) * safeLimit;

    try {
      const products = await prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
      });

      let total = products.length;
      try {
        total = await prisma.product.count({ where });
      } catch {
        total = products.length;
      }

      const formatted = products.map((p) => this.formatProduct(p, currency));

      return {
        data: formatted,
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit) || 1,
          hasNextPage: safePage * safeLimit < total,
          hasPrevPage: safePage > 1,
        },
      };
    } catch (err: any) {
      logger.error('Error fetching products from Neon DB:', err);
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  /**
   * Retrieve a single product by ID or Slug
   */
  static async getProductBySlug(idOrSlug: string, currency: Currency = Currency.USD) {
    if (!idOrSlug) {
      throw new BadRequestError('Product ID or slug is required.');
    }

    let product = await prisma.product.findUnique({
      where: { id: idOrSlug },
    });

    if (!product) {
      // Try search by name if not UUID
      product = await prisma.product.findFirst({
        where: {
          OR: [
            { name: { equals: idOrSlug, mode: 'insensitive' } },
            { name: { equals: idOrSlug.replace(/-/g, ' '), mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!product) {
      throw new NotFoundError(`Piece "${idOrSlug}" was not found in our atelier collection.`);
    }

    return this.formatProduct(product, currency);
  }

  /**
   * Add a new product to Neon PostgreSQL
   */
  static async createProduct(data: {
    name?: string;
    title?: string;
    subtitle?: string;
    tagline?: string;
    description?: string;
    shortDescription?: string;
    fullDescription?: string;
    category?: string;
    customCategory?: string;
    room?: string;
    material?: string;
    woodSpecies?: string;
    dimensions?: string;
    dimensionsCm?: { length: number; width: number; height: number; unit?: string };
    weightKg?: number;
    netWeightKg?: number;
    basePriceINR?: number;
    basePriceInr?: number;
    priceUsd?: number;
    stock?: number;
    stockQuantity?: number;
    isFeatured?: boolean;
    imageUrl?: string;
    imageUrls?: string[];
    galleryMedia?: string[];
  }) {
    const name = data.name?.trim() || data.title?.trim();
    if (!name) {
      throw new BadRequestError('Product title/name is required.');
    }

    const description =
      data.description?.trim() ||
      data.fullDescription?.trim() ||
      data.shortDescription?.trim() ||
      '';

    const category =
      data.customCategory?.trim() || data.category?.trim() || 'Urns & Planters';

    // Normalize basePriceINR
    let basePriceINR = 0;
    if (data.basePriceINR && data.basePriceINR > 0) {
      basePriceINR = data.basePriceINR;
    } else if (data.basePriceInr && data.basePriceInr > 0) {
      basePriceINR = data.basePriceInr;
    } else if (data.priceUsd && data.priceUsd > 0) {
      basePriceINR = Math.round(data.priceUsd * 84);
    }

    // Normalize imageUrl & galleryMedia
    let imageUrl = data.imageUrl?.trim() || '';
    if (!imageUrl && data.imageUrls && data.imageUrls.length > 0) {
      imageUrl = data.imageUrls[0];
    }
    if (!imageUrl) {
      imageUrl = '/images/placeholder.jpg';
    }

    let galleryMedia: string[] = [];
    if (Array.isArray(data.galleryMedia)) {
      galleryMedia = data.galleryMedia;
    } else if (Array.isArray(data.imageUrls) && data.imageUrls.length > 1) {
      galleryMedia = data.imageUrls.slice(1);
    }

    // Normalize dimensions string
    let dimensions = data.dimensions?.trim() || '';
    if (!dimensions && data.dimensionsCm) {
      dimensions = `${data.dimensionsCm.length}L x ${data.dimensionsCm.width}W x ${data.dimensionsCm.height}H cm`;
    }

    const weightKg = data.weightKg ?? data.netWeightKg ?? null;

    const product = await prisma.product.create({
      data: {
        name,
        subtitle: data.subtitle?.trim() || data.tagline?.trim() || null,
        description,
        category,
        room: data.room?.trim() || null,
        material: data.material?.trim() || data.woodSpecies?.trim() || null,
        dimensions: dimensions || null,
        weightKg: weightKg ? new Prisma.Decimal(weightKg) : null,
        basePriceINR: new Prisma.Decimal(basePriceINR),
        stock: data.stock ?? data.stockQuantity ?? 1,
        isFeatured: Boolean(data.isFeatured),
        imageUrl,
        galleryMedia,
      },
    });

    logger.info(`New solid wood masterwork created: [${product.id}] ${product.name}`);
    return this.formatProduct(product);
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Product ID "${id}" was not found.`);
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name || data.title) updateData.name = (data.name || data.title).trim();
    if (data.subtitle || data.tagline) updateData.subtitle = (data.subtitle || data.tagline).trim();
    if (data.description || data.shortDescription)
      updateData.description = (data.description || data.shortDescription).trim();
    if (data.category) updateData.category = data.category.trim();
    if (data.room !== undefined) updateData.room = data.room ? data.room.trim() : null;
    if (data.material || data.woodSpecies)
      updateData.material = (data.material || data.woodSpecies).trim();
    if (data.dimensions) updateData.dimensions = data.dimensions.trim();
    if (data.weightKg !== undefined || data.netWeightKg !== undefined) {
      const w = data.weightKg ?? data.netWeightKg;
      updateData.weightKg = w ? new Prisma.Decimal(w) : null;
    }
    if (data.basePriceINR !== undefined || data.basePriceInr !== undefined) {
      const p = data.basePriceINR ?? data.basePriceInr;
      updateData.basePriceINR = new Prisma.Decimal(p);
    }
    if (data.stock !== undefined || data.stockQuantity !== undefined) {
      updateData.stock = data.stock ?? data.stockQuantity;
    }
    if (data.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(data.isFeatured);
    }
    if (data.imageUrl) updateData.imageUrl = data.imageUrl.trim();
    if (Array.isArray(data.galleryMedia)) updateData.galleryMedia = data.galleryMedia;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this.formatProduct(updated);
  }

  /**
   * Star or unstar a product on homepage
   */
  static async toggleFeaturedStar(id: string, isFeatured?: boolean) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Product ID "${id}" was not found.`);
    }

    const nextFeatured = isFeatured !== undefined ? isFeatured : !existing.isFeatured;

    const updated = await prisma.product.update({
      where: { id },
      data: { isFeatured: nextFeatured },
    });

    return this.formatProduct(updated);
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Product ID "${id}" was not found.`);
    }

    await prisma.product.delete({ where: { id } });
    logger.info(`Product deleted from database: [${id}] ${existing.name}`);
    return { success: true, message: `Product "${existing.name}" deleted successfully.` };
  }

  /**
   * Get distinct categories from database
   */
  static async getCategories() {
    try {
      const distinct = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
      });
      return distinct.map((d) => ({
        name: d.category,
        slug: slugifyCategoryName(d.category),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Wood species guide
   */
  static getWoodSpeciesCatalog() {
    return Object.entries(APP_CONSTANTS.CITES_WOOD_SPECIES).map(([speciesKey, details]) => ({
      speciesKey,
      ...details,
    }));
  }
}
