'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CategoryMeta,
  InquiryRecord,
  InquiryStatus,
  OrderRecord,
  OrderStatusType,
  ProductItem,
  ReelItem,
} from '@/types';
import { MASTERPIECE_PRODUCTS } from '@/lib/products';
import {
  cancelOrderOnApi,
  confirmOrderCancelApi,
  createInquiryApi,
  createProductApi,
  createReelApi,
  deleteProductApi,
  deleteReelApi,
  fetchOwnerInquiriesApi,
  fetchOwnerOrdersApi,
  fetchProductsFromApi,
  fetchReelsFromApi,
  fetchSiteAssetsApi,
  ownerLoginApi,
  slugifyCategory,
  toggleProductStarApi,
  trackOrderFromApi,
  updateOrderTrackingApi,
} from '@/lib/api';

const STORAGE_KEYS = {
  PRODUCTS: 'sisodia_atelier_products_v1',
  CATEGORIES: 'sisodia_atelier_custom_categories_v1',
  REELS: 'sisodia_atelier_reels_v1',
  ORDERS: 'sisodia_atelier_orders_v1',
  INQUIRIES: 'sisodia_atelier_inquiries_v1',
  OWNER_AUTH: 'sisodia_owner_unlocked',
} as const;

export const ORDER_STAGE_DEFINITIONS: Array<{
  stage: number;
  status: OrderStatusType;
  label: string;
  shortLabel: string;
  defaultCheckpoint: string;
}> = [
  {
    stage: 1,
    status: 'ORDER_CONFIRMED',
    label: 'Order Confirmed (Timber Moisture Audit 7.2%)',
    shortLabel: 'Order Confirmed',
    defaultCheckpoint: 'Nagina Kiln Yard — 7.2% Timber Equilibrium Verified',
  },
  {
    stage: 2,
    status: 'IN_CRAFTING',
    label: 'In Crafting (Nagina Master Lathe Floor)',
    shortLabel: 'In Crafting',
    defaultCheckpoint: 'Nagina Atelier Floor — Master Turning & Chisel Relief',
  },
  {
    stage: 3,
    status: 'QUALITY_AND_CRATING',
    label: 'Quality Check & ISPM-15 Cedar Crating',
    shortLabel: 'Quality & Crating',
    defaultCheckpoint: 'Atelier Export Enclave — Sealed in Fumigated Cedar Vault',
  },
  {
    stage: 4,
    status: 'IN_TRANSIT',
    label: 'In Transit (International Air Cargo)',
    shortLabel: 'In Transit',
    defaultCheckpoint: 'International Air Freight Hub — DDP Bond Cleared',
  },
  {
    stage: 5,
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    shortLabel: 'Out for Delivery',
    defaultCheckpoint: 'Local White-Glove Courier Dispatched for Doorstep Handover',
  },
  {
    stage: 6,
    status: 'DELIVERED',
    label: 'Delivered (DDP Handover Complete)',
    shortLabel: 'Delivered',
    defaultCheckpoint: 'Private Residence Handover & Uncrating Completed',
  },
];

const INITIAL_REELS: ReelItem[] = [];

const INITIAL_ORDERS: OrderRecord[] = [];

const INITIAL_INQUIRIES: InquiryRecord[] = [];

const BASE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'solid-wooden-tiles',
    catKey: 'solid-wooden-tiles',
    title: 'Solid Wooden Tiles',
    subtitle: 'Hand-carved architectural Nagina relief tiles with interlocking tongue-and-groove',
    count: '0 items',
    tag: 'PALATIAL SURFACE PANELING',
    href: '/shop?category=Solid%20Wooden%20Tiles',
    imageUrl: '/images/categories/solid-wooden-tiles.jpg?v=5',
    woodType: 'Kiln-Dried Hardwoods',
  },
  {
    id: 'urns-planters',
    catKey: 'urns-planters',
    title: 'Urns & Planters',
    subtitle: 'Single-trunk lathe-turned monolithic floor urns and solid heartwood planters',
    count: '0 items',
    tag: 'MONOLITHIC LATHE TURNING',
    href: '/shop?category=Urns%20%26%20Planters',
    imageUrl: '/images/categories/urns-planters.jpg?v=5',
    woodType: 'Reclaimed Burma Teak',
  },
  {
    id: 'bowls-vessels',
    catKey: 'bowls-vessels',
    title: 'Bowls & Vessels',
    subtitle: 'Ayurvedic Vijaysar water basins & deep rosewood centerpieces',
    count: '0 items',
    tag: 'AYURVEDIC LIVING WOOD',
    href: '/shop?category=Bowls%20%26%20Vessels',
    imageUrl: '/images/categories/bowls-vessels.jpg?v=5',
    woodType: 'Medicinal Vijaysar Heartwood',
  },
  {
    id: 'haveli-consoles',
    catKey: 'haveli-consoles',
    title: 'Haveli Consoles',
    subtitle: 'Royal jharokha screens & Mewar console tables carved with floral lattice',
    count: '0 items',
    tag: 'NAGINA ARCHITECTURAL CARVING',
    href: '/shop?category=Haveli%20Consoles',
    imageUrl: '/images/categories/haveli-consoles.jpg?v=5',
    woodType: 'Century-Old Heartwood',
  },
  {
    id: 'carved-trays-boards',
    catKey: 'carved-trays-boards',
    title: 'Carved Trays & Boards',
    subtitle: 'Food-safe walnut-oiled solid teak serving platters and relief boards',
    count: '0 items',
    tag: 'CULINARY HEARTWOOD',
    href: '/shop?category=Carved%20Trays%20%26%20Boards',
    imageUrl: '/images/categories/carved-trays-boards.jpg?v=5',
    woodType: 'Slow-Grown Sheesham',
  },
];

function normalizeProductsWithMeta(items: ProductItem[]): ProductItem[] {
  return items.map((p) => {
    const cleanCat =
      p.category === 'Solid Wooden Tiles (Wall & Floor)' ? 'Solid Wooden Tiles' : p.category;
    return {
      ...p,
      category: cleanCat,
      catKey: p.catKey || slugifyCategory(cleanCat),
      isFeatured: p.isFeatured ?? false,
    };
  });
}

interface AtelierContextValue {
  products: ProductItem[];
  featuredProducts: ProductItem[];
  categories: CategoryMeta[];
  categoryNames: string[];
  reels: ReelItem[];
  orders: OrderRecord[];
  unacknowledgedCancellationsCount: number;
  inquiries: InquiryRecord[];
  isOwnerUnlocked: boolean;
  ownerPasscode: string;
  ownerToken?: string | null;
  unlockOwner: (pin: string) => Promise<boolean>;
  lockOwner: () => void;
  addProduct: (input: {
    title: string;
    tagline?: string;
    sku?: string;
    basePriceInr?: number;
    basePriceUsd?: number;
    category: string;
    customCategory?: string;
    room: string;
    dimensionsCm: { length: number; width: number; height: number };
    netWeightKg: number;
    woodSpecies: string;
    origin?: string;
    timberSeasoning?: string;
    stockQuantity?: number;
    shortDescription: string;
    images: string[];
    galleryMedia?: import('@/types').MediaItem[];
    isFeatured: boolean;
  }) => Promise<ProductItem>;
  toggleProductStar: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReel: (input: Omit<ReelItem, 'id' | 'createdAt'>) => Promise<ReelItem>;
  deleteReel: (id: string) => Promise<void>;
  addOrder: (order: OrderRecord) => void;
  lookupOrder: (orderNumberOrId: string) => Promise<OrderRecord | null>;
  updateOrderTracking: (
    orderId: string,
    payload: {
      status: OrderStatusType;
      trackingStage: number;
      courierPartner?: string;
      trackingNumber?: string;
      currentCheckpoint?: string;
      estimatedDelivery?: string;
    }
  ) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<OrderRecord>;
  confirmOrderCancel: (orderId: string) => Promise<void>;
  addInquiry: (input: {
    customerName: string;
    contactInfo: string;
    requirementType: string;
    quantityOrScope: string;
    message: string;
  }) => Promise<InquiryRecord>;
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;
  siteAssets: Record<string, string>;
}

const AtelierContext = createContext<AtelierContextValue | undefined>(undefined);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota failures silently
  }
}

const DEFAULT_SITE_ASSETS: Record<string, string> = {
  brand_logo:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794679405/sisodia-atelier/permanent/brand_logo.jpg',
  atelier_floor_video:
    'https://res.cloudinary.com/gxhyfmfv/video/upload/v1794658376/sisodia-atelier/permanent/atelier_floor_video.mp4',
  category_solid_wooden_tiles:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682446/sisodia-atelier/categories/solid-wooden-tiles.jpg',
  category_urns_planters:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682454/sisodia-atelier/categories/urns-planters.jpg',
  category_bowls_vessels:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682458/sisodia-atelier/categories/bowls-vessels.jpg',
  category_haveli_consoles:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682461/sisodia-atelier/categories/haveli-consoles.jpg',
  category_carved_trays_boards:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682465/sisodia-atelier/categories/carved-trays-boards.jpg',
  category_hospitality_accents:
    'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682470/sisodia-atelier/categories/hospitality-accents.jpg',
};

export function AtelierProvider({ children }: { children: React.ReactNode }) {
  const [siteAssets, setSiteAssets] = useState<Record<string, string>>(DEFAULT_SITE_ASSETS);
  const [products, setProducts] = useState<ProductItem[]>(() =>
    normalizeProductsWithMeta(MASTERPIECE_PRODUCTS)
  );
  const [customCategories, setCustomCategories] = useState<CategoryMeta[]>([]);
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(INITIAL_INQUIRIES);
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [ownerPasscode, setOwnerPasscode] = useState('');
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Initial client hydration + live backend fetch + cross-tab sync listener
  useEffect(() => {
    const savedProducts = readStorage<ProductItem[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (savedProducts && savedProducts.length > 0) {
      // Cleanly filter out any obsolete dummy seed titles that may linger in browser localStorage
      const realSaved = savedProducts.filter(
        (p) =>
          p &&
          !p.title?.toLowerCase().includes('mewar') &&
          !p.title?.toLowerCase().includes('sacred vijaysar') &&
          !p.title?.toLowerCase().includes('barmer monolithic') &&
          !p.title?.toLowerCase().includes('sheesh mahal') &&
          !p.title?.toLowerCase().includes('scalloped sheesham charcuterie')
      );
      setProducts(normalizeProductsWithMeta(realSaved));
    }

    // Cleanly migrate/purge any stale category URLs in localStorage
    const savedCustomCats = readStorage<CategoryMeta[]>(STORAGE_KEYS.CATEGORIES, []);
    if (savedCustomCats.length > 0) {
      const cleanCustom = savedCustomCats.filter(
        (c) =>
          c &&
          !c.imageUrl?.includes('unsplash') &&
          !c.imageUrl?.includes('photo-') &&
          !BASE_CATEGORIES.some((b) => b.catKey === c.catKey || b.title.toLowerCase() === c.title?.toLowerCase())
      );
      setCustomCategories(cleanCustom);
      if (cleanCustom.length !== savedCustomCats.length && typeof window !== 'undefined') {
        writeStorage(STORAGE_KEYS.CATEGORIES, cleanCustom);
      }
    }

    const savedReels = readStorage<ReelItem[] | null>(STORAGE_KEYS.REELS, null);
    if (savedReels && savedReels.length > 0) {
      const validReels = savedReels.filter(
        (r) =>
          r &&
          !r.id.startsWith('ep-') &&
          !r.title.toLowerCase().includes('low-rpm') &&
          !r.title.toLowerCase().includes('dfghj') &&
          !r.title.toLowerCase().includes('walnut oil') &&
          !r.title.toLowerCase().includes('16-year') &&
          !r.title.toLowerCase().includes('architectural wooden tiles') &&
          !r.videoUrl?.includes('commondatastorage.googleapis.com')
      );
      if (validReels.length > 0) {
        setReels(validReels);
      } else {
        setReels([]);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.REELS);
        }
      }
    } else {
      setReels([]);
    }

    let unlocked = false;
    let storedToken: string | null = null;
    if (typeof window !== 'undefined') {
      storedToken = sessionStorage.getItem('sisodia_owner_token');
      unlocked = sessionStorage.getItem(STORAGE_KEYS.OWNER_AUTH) === 'true' && Boolean(storedToken);
      setIsOwnerUnlocked(unlocked);
      if (storedToken) {
        setOwnerToken(storedToken);
      }
    }

    const savedOrders = readStorage<OrderRecord[] | null>(STORAGE_KEYS.ORDERS, null);
    if (unlocked && savedOrders && savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      setOrders([]);
    }

    const savedInquiries = readStorage<InquiryRecord[] | null>(STORAGE_KEYS.INQUIRIES, null);
    if (unlocked && savedInquiries && savedInquiries.length > 0) {
      setInquiries(savedInquiries);
    } else {
      setInquiries([]);
    }

    setHydrated(true);

    // Hydrate live backend records if backend API is active
    (async () => {
      try {
        const [apiProducts, apiReels, apiAssets] = await Promise.all([
          fetchProductsFromApi().catch(() => null),
          fetchReelsFromApi().catch(() => null),
          fetchSiteAssetsApi().catch(() => null),
        ]);

        if (apiAssets) {
          setSiteAssets((prev) => ({
            ...prev,
            ...(apiAssets.brand_logo ? { brand_logo: apiAssets.brand_logo } : {}),
            ...(apiAssets.atelier_floor_video ? { atelier_floor_video: apiAssets.atelier_floor_video } : {}),
          }));
        }

        if (Array.isArray(apiProducts)) {
          const normalized = normalizeProductsWithMeta(apiProducts);
          setProducts(normalized);
          writeStorage(STORAGE_KEYS.PRODUCTS, normalized);
        }

        if (Array.isArray(apiReels)) {
          setReels(apiReels);
          writeStorage(STORAGE_KEYS.REELS, apiReels);
        }
      } catch (err) {
        console.warn('AtelierContext: Non-blocking storefront hydration error:', err);
      }
    })();

    const onStorageSync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS && e.newValue) {
        setProducts(normalizeProductsWithMeta(JSON.parse(e.newValue)));
      } else if (e.key === STORAGE_KEYS.CATEGORIES && e.newValue) {
        setCustomCategories(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.REELS && e.newValue) {
        setReels(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.INQUIRIES && e.newValue) {
        setInquiries(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', onStorageSync);
    return () => window.removeEventListener('storage', onStorageSync);
  }, []);

  // Sync owner protected data once unlocked
  useEffect(() => {
    if (!hydrated || !isOwnerUnlocked) return;
    (async () => {
      try {
        const activeToken =
          ownerToken ||
          (typeof window !== 'undefined' ? sessionStorage.getItem('sisodia_owner_token') : null);
        const [apiOrders, apiInquiries] = await Promise.all([
          fetchOwnerOrdersApi(activeToken || ownerPasscode).catch(() => null),
          fetchOwnerInquiriesApi(activeToken || ownerPasscode).catch(() => null),
        ]);
        if (apiOrders && apiOrders.length > 0) {
          setOrders((prev) => {
            const merged = new Map<string, OrderRecord>();
            prev.forEach((o) => merged.set(o.orderNumber, o));
            apiOrders.forEach((o) => merged.set(o.orderNumber, o));
            const list = Array.from(merged.values());
            writeStorage(STORAGE_KEYS.ORDERS, list);
            return list;
          });
        }
        if (apiInquiries && apiInquiries.length > 0) {
          setInquiries((prev) => {
            const merged = new Map<string, InquiryRecord>();
            prev.forEach((inq) => merged.set(inq.id, inq));
            apiInquiries.forEach((inq) => merged.set(inq.id, inq));
            const list = Array.from(merged.values());
            writeStorage(STORAGE_KEYS.INQUIRIES, list);
            return list;
          });
        }
      } catch (err) {
        console.warn('AtelierContext: Non-blocking owner data sync error:', err);
      }
    })();
  }, [hydrated, isOwnerUnlocked, ownerPasscode]);

  const featuredProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.isFeatured));
  }, [products]);

  const categories = useMemo(() => {
    const map = new Map<string, CategoryMeta>();

    BASE_CATEGORIES.forEach((cat) => {
      const count = products.filter(
        (p) =>
          p.catKey === cat.catKey ||
          slugifyCategory(p.category) === cat.catKey ||
          p.category.toLowerCase() === cat.title.toLowerCase()
      ).length;
      map.set(cat.catKey, {
        ...cat,
        productCount: count,
        count: count > 0 ? `${count} Masterpiece${count > 1 ? 's' : ''}` : cat.count,
      });
    });

    customCategories.forEach((cat) => {
      if (
        !map.has(cat.catKey) &&
        !BASE_CATEGORIES.some((b) => b.catKey === cat.catKey || b.title.toLowerCase() === cat.title?.toLowerCase())
      ) {
        map.set(cat.catKey, cat);
      }
    });

    return Array.from(map.values());
  }, [products, customCategories]);

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.title);
  }, [categories]);

  const unacknowledgedCancellationsCount = useMemo(() => {
    return orders.filter((o) => o.status === 'CANCELLED' && !o.ownerCancelConfirmed).length;
  }, [orders]);

  const unlockOwner = async (pin: string): Promise<boolean> => {
    try {
      const res = await ownerLoginApi(pin.trim());
      if (res.success && res.token) {
        setIsOwnerUnlocked(true);
        setOwnerToken(res.token);
        setOwnerPasscode(pin.trim());
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEYS.OWNER_AUTH, 'true');
          sessionStorage.setItem('sisodia_owner_token', res.token);
        }
        try {
          const [apiOrders, apiInquiries] = await Promise.all([
            fetchOwnerOrdersApi(res.token).catch(() => null),
            fetchOwnerInquiriesApi(res.token).catch(() => null),
          ]);
          if (apiOrders) {
            setOrders(apiOrders);
            writeStorage(STORAGE_KEYS.ORDERS, apiOrders);
          }
          if (apiInquiries) {
            setInquiries(apiInquiries);
            writeStorage(STORAGE_KEYS.INQUIRIES, apiInquiries);
          }
        } catch (err) {
          console.warn('Error fetching initial owner data after login:', err);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('unlockOwner error:', err);
      return false;
    }
  };

  const lockOwner = () => {
    setIsOwnerUnlocked(false);
    setOwnerToken(null);
    setOwnerPasscode('');
    setOrders([]);
    setInquiries([]);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.OWNER_AUTH);
      sessionStorage.removeItem('sisodia_owner_token');
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    }
  };

  const addProduct: AtelierContextValue['addProduct'] = async (input) => {
    const resolvedCategory =
      input.category === 'Other' && input.customCategory?.trim()
        ? input.customCategory.trim()
        : input.category.trim();
    const catKey = slugifyCategory(resolvedCategory) || 'atelier-heirloom';

    const localId = `prod-${Date.now()}`;
    const cleanImages =
      input.images.filter(Boolean).length > 0
        ? input.images.filter(Boolean)
        : [
            'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682446/sisodia-atelier/categories/solid-wooden-tiles.jpg',
          ];

    const newProduct: ProductItem = {
      id: localId,
      slug: `${slugifyCategory(input.title)}-${Date.now().toString(36).slice(-4)}`,
      sku: input.sku?.trim() || `SA-${catKey.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`,
      title: input.title.trim(),
      tagline:
        input.tagline?.trim() ||
        `Handcrafted ${resolvedCategory} from Nagina Master Atelier`,
      shortDescription: input.shortDescription.trim(),
      category: resolvedCategory,
      catKey,
      room: input.room || 'Living Room',
      origin: input.origin?.trim() || 'Nagina, India',
      timberSeasoning: input.timberSeasoning?.trim() || '14 Years Desert-Cured (7.2%)',
      woodSpecies: input.woodSpecies.trim() || 'Royal Sheesham (Dalbergia sissoo)',
      dimensionsCm: input.dimensionsCm,
      netWeightKg: Number(input.netWeightKg || 12),
      finishType: 'Cold-Pressed Kashmiri Walnut Oil & Raw Beeswax',
      basePriceInr: Number(input.basePriceInr) || (Number(input.basePriceUsd) ? Number(input.basePriceUsd) * 84 : 85000),
      basePriceUsd: Number(input.basePriceUsd) || Math.round((Number(input.basePriceInr) || 85000) / 84),
      leadTimeWeeks: 3,
      stockQuantity: input.stockQuantity ?? 1,
      isMadeToOrder: false,
      isFeatured: Boolean(input.isFeatured),
      images: cleanImages,
      galleryMedia:
        input.galleryMedia && input.galleryMedia.length > 0
          ? input.galleryMedia
          : cleanImages.map((url) => ({
              url,
              type: /\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(url) || url.includes('/video/upload/')
                ? ('video' as const)
                : ('image' as const),
            })),
      artisanMaster: 'Master Craftsman Khemraj & Yash Sisodia',
      specialTrait: '7.2% Kiln Equilibrium • Solid Nagina Heartwood',
      provenanceStory: input.shortDescription.trim(),
    };

    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    writeStorage(STORAGE_KEYS.PRODUCTS, nextProducts);

    if (!BASE_CATEGORIES.some((c) => c.catKey === catKey)) {
      const nextCustom: CategoryMeta = {
        id: catKey,
        catKey,
        title: resolvedCategory,
        subtitle: `Bespoke handcrafted ${resolvedCategory.toLowerCase()} from Nagina Atelier.`,
        count: 'Custom Edition',
        tag: 'Nagina Custom Craft',
        href: `/shop?category=${encodeURIComponent(catKey)}`,
        imageUrl: cleanImages[0],
        woodType: newProduct.woodSpecies.split('(')[0].trim(),
        productCount: 1,
      };
      setCustomCategories((prev) => {
        const filtered = prev.filter((c) => c.catKey !== catKey);
        const updated = [nextCustom, ...filtered];
        writeStorage(STORAGE_KEYS.CATEGORIES, updated);
        return updated;
      });
    }

    const createdOnApi = await createProductApi(
      {
        title: newProduct.title,
        tagline: newProduct.tagline,
        sku: newProduct.sku,
        shortDescription: newProduct.shortDescription,
        fullDescription: newProduct.shortDescription,
        category: resolvedCategory,
        customCategory: input.customCategory,
        priceUsd: newProduct.basePriceUsd,
        dimensionsCm: { ...newProduct.dimensionsCm, unit: 'cm' },
        netWeightKg: newProduct.netWeightKg,
        grossCratedWeightKg: Math.round(newProduct.netWeightKg * 1.35 * 10) / 10,
        stockQuantity: newProduct.stockQuantity,
        provenanceHeritage: newProduct.origin,
        isFeatured: newProduct.isFeatured,
        imageUrls: cleanImages.filter((url) => url.startsWith('http')),
      },
      ownerToken || ownerPasscode
    );

    if (createdOnApi?.id) {
      setProducts((prev) => {
        const swapped = prev.map((p) =>
          p.id === localId
            ? {
                ...newProduct,
                id: createdOnApi.id,
                slug: createdOnApi.slug,
              }
            : p
        );
        writeStorage(STORAGE_KEYS.PRODUCTS, swapped);
        return swapped;
      });
    }

    return newProduct;
  };

  const toggleProductStar = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextStar = !Boolean(target.isFeatured);

    const updated = products.map((p) =>
      p.id === id ? { ...p, isFeatured: nextStar } : p
    );
    setProducts(updated);
    writeStorage(STORAGE_KEYS.PRODUCTS, updated);

    await toggleProductStarApi(id, nextStar, ownerToken || ownerPasscode);
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    writeStorage(STORAGE_KEYS.PRODUCTS, updated);

    await deleteProductApi(id, ownerToken || ownerPasscode);
  };

  const addReel: AtelierContextValue['addReel'] = async (input) => {
    const localId = `reel-${Date.now()}`;
    const newReel: ReelItem = {
      id: localId,
      episodeNumber: input.episodeNumber.trim(),
      title: input.title.trim(),
      duration: input.duration.trim(),
      description: input.description.trim(),
      videoUrl: input.videoUrl.trim(),
      thumbnailUrl: input.thumbnailUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextReels = [newReel, ...reels];
    setReels(nextReels);
    writeStorage(STORAGE_KEYS.REELS, nextReels);

    if (newReel.videoUrl.startsWith('http')) {
      const created = await createReelApi(
        {
          episodeNumber: newReel.episodeNumber,
          title: newReel.title,
          duration: newReel.duration,
          description: newReel.description,
          videoUrl: newReel.videoUrl,
          thumbnailUrl: newReel.thumbnailUrl,
        },
        ownerToken || ownerPasscode
      );
      if (created?.id) {
        setReels((prev) => {
          const swapped = prev.map((r) => (r.id === localId ? created : r));
          writeStorage(STORAGE_KEYS.REELS, swapped);
          return swapped;
        });
      }
    }

    return newReel;
  };

  const deleteReel = async (id: string) => {
    const nextReels = reels.filter((r) => r.id !== id);
    setReels(nextReels);
    writeStorage(STORAGE_KEYS.REELS, nextReels);

    await deleteReelApi(id, ownerToken || ownerPasscode);
  };

  const addOrder = (order: OrderRecord) => {
    setOrders((prev) => {
      const next = [order, ...prev.filter((o) => o.orderNumber !== order.orderNumber)];
      writeStorage(STORAGE_KEYS.ORDERS, next);
      return next;
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch((err) => console.warn('Order sync to Neon DB:', err));
  };

  const lookupOrder = async (orderNumberOrId: string): Promise<OrderRecord | null> => {
    const q = orderNumberOrId.trim().toLowerCase();
    const localMatch = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === q ||
        o.id.toLowerCase() === q ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === q)
    );

    const apiOrder = await trackOrderFromApi(orderNumberOrId.trim());
    if (apiOrder) {
      setOrders((prev) => {
        const exists = prev.some((o) => o.orderNumber === apiOrder.orderNumber);
        const next = exists
          ? prev.map((o) => (o.orderNumber === apiOrder.orderNumber ? apiOrder : o))
          : [apiOrder, ...prev];
        writeStorage(STORAGE_KEYS.ORDERS, next);
        return next;
      });
      return apiOrder;
    }

    return localMatch || null;
  };

  const updateOrderTracking: AtelierContextValue['updateOrderTracking'] = async (
    orderId,
    payload
  ) => {
    setOrders((prev) => {
      const next = prev.map((o) => {
        if (o.id !== orderId && o.orderNumber !== orderId) return o;
        return {
          ...o,
          status: payload.status,
          trackingStage: payload.trackingStage,
          courierPartner: payload.courierPartner ?? o.courierPartner,
          trackingNumber: payload.trackingNumber ?? o.trackingNumber,
          currentCheckpoint: payload.currentCheckpoint ?? o.currentCheckpoint,
          estimatedDelivery: payload.estimatedDelivery ?? o.estimatedDelivery,
        };
      });
      writeStorage(STORAGE_KEYS.ORDERS, next);
      return next;
    });

    await updateOrderTrackingApi(orderId, payload, ownerToken || ownerPasscode);
  };

  const cancelOrder = async (orderId: string, reason: string): Promise<OrderRecord> => {
    const target = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!target) {
      throw new Error('Order record not found.');
    }

    if (target.status === 'OUT_FOR_DELIVERY' || target.status === 'DELIVERED') {
      throw new Error('Order is already Out for Delivery and cannot be cancelled.');
    }

    const apiRes = await cancelOrderOnApi(target.id, reason);
    if (!apiRes.ok) {
      throw new Error(
        apiRes.message || 'Order is already Out for Delivery and cannot be cancelled.'
      );
    }

    const cancelledRecord: OrderRecord = {
      ...target,
      status: 'CANCELLED',
      cancellationReason: reason.trim() || 'Cancelled by customer prior to Out for Delivery.',
      cancelledAt: new Date().toISOString(),
      ownerCancelConfirmed: false,
    };

    setOrders((prev) => {
      const next = prev.map((o) => (o.id === target.id ? cancelledRecord : o));
      writeStorage(STORAGE_KEYS.ORDERS, next);
      return next;
    });

    return cancelledRecord;
  };

  const confirmOrderCancel = async (orderId: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, ownerCancelConfirmed: true }
          : o
      );
      writeStorage(STORAGE_KEYS.ORDERS, next);
      return next;
    });

    await confirmOrderCancelApi(orderId, ownerToken || ownerPasscode);
  };

  const addInquiry: AtelierContextValue['addInquiry'] = async (input) => {
    const localRecord: InquiryRecord = {
      id: `inq-${Date.now()}`,
      customerName: input.customerName.trim(),
      contactInfo: input.contactInfo.trim(),
      requirementType: input.requirementType.trim(),
      quantityOrScope: input.quantityOrScope.trim(),
      message: input.message.trim(),
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    setInquiries((prev) => {
      const next = [localRecord, ...prev];
      writeStorage(STORAGE_KEYS.INQUIRIES, next);
      return next;
    });

    const created = await createInquiryApi(input);
    if (created?.id) {
      setInquiries((prev) => {
        const swapped = prev.map((inq) => (inq.id === localRecord.id ? created : inq));
        writeStorage(STORAGE_KEYS.INQUIRIES, swapped);
        return swapped;
      });
      return created;
    }

    return localRecord;
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus) => {
    setInquiries((prev) => {
      const next = prev.map((inq) => (inq.id === id ? { ...inq, status } : inq));
      writeStorage(STORAGE_KEYS.INQUIRIES, next);
      return next;
    });
  };

  return (
    <AtelierContext.Provider
      value={{
        products,
        featuredProducts,
        categories,
        categoryNames,
        reels,
        orders,
        unacknowledgedCancellationsCount,
        inquiries,
        isOwnerUnlocked,
        ownerPasscode,
        ownerToken,
        unlockOwner,
        lockOwner,
        addProduct,
        toggleProductStar,
        deleteProduct,
        addReel,
        deleteReel,
        addOrder,
        lookupOrder,
        updateOrderTracking,
        cancelOrder,
        confirmOrderCancel,
        addInquiry,
        updateInquiryStatus,
        siteAssets,
      }}
    >
      {children}
    </AtelierContext.Provider>
  );
}

export function useAtelier(): AtelierContextValue {
  const ctx = useContext(AtelierContext);
  if (!ctx) {
    throw new Error('useAtelier must be used inside AtelierProvider');
  }
  return ctx;
}

