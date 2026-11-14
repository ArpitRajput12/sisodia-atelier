import { ProductItem } from '../types';

/**
 * 100% Real Database Persistence:
 * Zero synthetic dummy products. Real pieces are fetched directly from Neon PostgreSQL via /api/v1/products.
 * The Atelier owner adds products dynamically via the /owner backoffice portal.
 */
export const MASTERPIECE_PRODUCTS: ProductItem[] = [];
