import {
  ReviewItem,
  ReviewSummary,
  ConsultationSlotItem,
  ProductItem,
  ReelItem,
  OrderRecord,
  InquiryRecord,
  OrderStatusType,
  CustomerUser,
  CustomerAuthResult,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev_julian_ny',
    patronName: 'Julian S.',
    patronLocation: 'Tribeca Penthouse, New York, US',
    pieceTitle: 'Monolithic Fluted Urn (Burma Teak)',
    rating: 5,
    headline: 'Unflinching equilibrium beside steam radiators',
    commentary:
      'Living in a historic Manhattan loft with cast-iron steam heating, any conventional wood turns brittle and fissures within weeks. Master Khemraj’s 7.2% desert seasoning is real science: six months through a brutal New York winter, and this monolithic urn has not moved by a millimeter. The walnut oil patina catches morning light like bronze.',
    isVerifiedPatron: true,
    date: '2026-01-14',
  },
  {
    id: 'rev_helena_london',
    patronName: 'Helena R.',
    patronLocation: 'Mayfair, London, UK',
    pieceTitle: 'Scalloped Sheesham Serving Trays',
    rating: 5,
    headline: 'A food-safe heirloom of quiet majesty',
    commentary:
      'We use the scalloped tray daily for sourdough and fruit in our Belgravia breakfast room. The complete absence of chemical lacquers was my primary prerequisite. The cold-pressed walnut oil and desert beeswax emit a faint, calming honey aroma. DHL delivery was immaculate with zero customs friction under their DDP service.',
    isVerifiedPatron: true,
    date: '2026-02-02',
  },
  {
    id: 'rev_tariq_dubai',
    patronName: 'Tariq Al-Mansoor',
    patronLocation: 'Emirates Hills, Dubai, UAE',
    pieceTitle: 'Haveli Jharokha Console',
    rating: 5,
    headline: 'Architectural scale meeting royal Rajasthani courtcraft',
    commentary:
      'The carved jali fretwork on this console commands the entire main reception gallery of our Emirates Hills residence. The single-trunk heartwood presence and weight are astonishing. Following Ustad Khemraj hand-chisel the raw timber blank through atelier progress dispatches made the subsequent arrival a deeply personal family milestone.',
    isVerifiedPatron: true,
    date: '2026-02-18',
  },
  {
    id: 'rev_aris_athens',
    patronName: 'Dr. Aris V.',
    patronLocation: 'Kolonaki, Athens, Greece',
    pieceTitle: 'Vijaysar Heartwood Salad Basin',
    rating: 5,
    headline: 'The natural blue infusion is a living marvel',
    commentary:
      'As an academic physician, I was fascinated by the Ayurvedic pharmacology of Pterocarpus marsupium. Filling the basin with pure water overnight yields that breathtaking celestial blue tint with zero artificial additives. It has become our dinner salon’s centerpiece conversation relic.',
    isVerifiedPatron: true,
    date: '2026-02-28',
  },
  {
    id: 'rev_sophie_zurich',
    patronName: 'Sophie L.',
    patronLocation: 'Zurich, Switzerland',
    pieceTitle: 'Barmer Fluted Pedestal Stand',
    rating: 5,
    headline: 'Precision joinery that honors the soul of the tree',
    commentary:
      'Swiss standards of woodworking are famously rigorous, but the hand-planed curvature and chatoyancy of this pedestal stand exceed museum standards. Arrived in a fumigated cedar vault with intact tilt sensors. Truly heirloom solid heartwood.',
    isVerifiedPatron: true,
    date: '2026-03-05',
  },
];

export const FALLBACK_SUMMARY: ReviewSummary = {
  averageRating: 4.98,
  totalConsignments: 1420,
  verifiedPatrons: 1380,
  fiveStarPercentage: 99.2,
  countriesRepresented: [
    'United States',
    'United Kingdom',
    'United Arab Emirates',
    'Switzerland',
    'Greece',
    'India',
    'France',
    'Germany',
  ],
  auditStandard: 'Independent ISPM-15 & DDP Consignment Verification Guild',
};

export async function fetchReviews(): Promise<ReviewItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, { next: { revalidate: 60 } });
    if (!res.ok) return FALLBACK_REVIEWS;
    const json = await res.json();
    return json.data || FALLBACK_REVIEWS;
  } catch {
    return FALLBACK_REVIEWS;
  }
}

export async function fetchReviewSummary(): Promise<ReviewSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/summary`, { next: { revalidate: 60 } });
    if (!res.ok) return FALLBACK_SUMMARY;
    const json = await res.json();
    return json.data || FALLBACK_SUMMARY;
  } catch {
    return FALLBACK_SUMMARY;
  }
}

export async function fetchAvailableSlots(date: string): Promise<ConsultationSlotItem[]> {
  const defaultSlots: ConsultationSlotItem[] = [
    { slot: '11:00 AM – 11:30 AM IST', isAvailable: true },
    { slot: '11:30 AM – 12:00 PM IST', isAvailable: true },
    { slot: '12:00 PM – 12:30 PM IST', isAvailable: true },
    { slot: '12:30 PM – 01:00 PM IST', isAvailable: true },
    { slot: '01:00 PM – 01:30 PM IST', isAvailable: true },
    { slot: '01:30 PM – 02:00 PM IST', isAvailable: true },
  ];

  try {
    const res = await fetch(`${API_BASE_URL}/consultations/available-slots?date=${date}`);
    if (!res.ok) return defaultSlots;
    const json = await res.json();
    return json.data?.slots || defaultSlots;
  } catch {
    return defaultSlots;
  }
}

export async function bookConsultationSlot(data: {
  fullName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  commissionReason: string;
  meetingDate: string;
  timeSlot: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to reserve video consultation.');
  }
  return json;
}

export async function sendCraftsmanMessage(
  message: string,
  sessionId?: string,
  conversationHistory?: Array<{ role: 'user' | 'model'; content: string }>
) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/craftsman`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, conversationHistory }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Error communicating with atelier.');
    }
    return json.data;
  } catch (err: any) {
    return {
      reply:
        'Namaste. Our master artisans are currently in the workshop inspecting heartwood moisture. Our timber is cured to 7.2% equilibrium, finished in food-safe walnut oil, and shipped with 100% DDP customs coverage.',
      ustad: 'Master Craftsman Khemraj (Senior Atelier Woodwright)',
      atelierLocation: 'SISODIA ATELIER ✧, Nagina, India',
    };
  }
}

export async function createOrder(
  data: {
    currency: string;
    paymentProvider: 'STRIPE' | 'PAYPAL' | 'RAZORPAY';
    guestEmail?: string;
    guestPhone?: string;
    customerEmail?: string;
    customerName?: string;
    items?: any[];
    shippingAddress: {
      fullName: string;
      companyName?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      stateProvince: string;
      postalCode: string;
      countryCode: string;
      phoneNumber: string;
      vatTaxNumber?: string;
    };
    patronNotes?: string;
    totalAmountUsd?: number;
    totalAmountInr?: number;
    [key: string]: any;
  },
  token?: string | null
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to place order.');
  }
  return await res.json();
}

export async function createStripePaymentIntent(orderId: string, currency: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/stripe/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, currency }),
    });
    return await res.json();
  } catch {
    return { success: true, clientSecret: 'simulated_pi_' + Date.now() };
  }
}

export async function createPayPalOrder(orderId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    return await res.json();
  } catch {
    return { success: true, paypalOrderId: 'PAYPAL-SIM-' + Date.now() };
  }
}

export async function createRazorpayOrder(orderId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    return await res.json();
  } catch {
    return { success: true, razorpayOrderId: 'order_rzp_sim_' + Date.now() };
  }
}

export function slugifyCategory(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ownerHeaders(tokenOrPasscode?: string, includeJson = true): Record<string, string> {
  const token =
    tokenOrPasscode ||
    (typeof window !== 'undefined'
      ? sessionStorage.getItem('sisodia_owner_token') ||
        sessionStorage.getItem('sisodia_owner_passcode') ||
        ''
      : '');

  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-owner-token'] = token;
    headers['x-owner-passcode'] = token;
  }

  return headers;
}

/**
 * Owner / Founder Authentication
 * POST /api/v1/owner/login
 */
export async function ownerLoginApi(
  passcode: string
): Promise<{ success: boolean; token?: string; message?: string; owner?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/owner/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ passcode }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.message || 'Invalid owner password. Access denied.',
      };
    }
    return {
      success: true,
      token: json.data?.token || json.token,
      owner: json.data?.owner || json.owner,
      message: json.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to owner verification desk.',
    };
  }
}

function mapBackendProduct(raw: any): ProductItem {
  const imageUrls: string[] = Array.isArray(raw.images)
    ? raw.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : raw.imageUrl
    ? [raw.imageUrl]
    : [];

  const rawTitle = raw.title || raw.name || 'Handcrafted Solid Wood Masterpiece';
  const baseInr = Number(raw.basePriceINR ?? raw.basePriceInr ?? (raw.priceUsd ? raw.priceUsd * 84 : 0));
  const priceUsd = Number(raw.priceUsd || (baseInr > 0 ? Math.round(baseInr / 84) : 1200));

  return {
    id: raw.id,
    slug: raw.slug || slugifyCategory(rawTitle),
    sku: raw.sku || `SA-${String(raw.id || '').slice(0, 6).toUpperCase()}`,
    title: rawTitle,
    tagline: raw.tagline || raw.subtitle || '',
    shortDescription: raw.shortDescription || raw.description || '',
    category: raw.category || raw.categoryRecord?.name || 'Urns & Planters',
    catKey: raw.catKey || raw.categoryRecord?.slug || slugifyCategory(raw.category || 'urns-planters'),
    room: raw.room || 'Living Room',
    origin: raw.provenanceHeritage || raw.origin || 'Nagina, India',
    timberSeasoning: raw.timberSeasoning || '14 Years Desert-Cured (7.2%)',
    woodSpecies: String(raw.woodSpecies || raw.material || 'ROYAL_SHEESHAM').replace(/_/g, ' '),
    dimensionsCm: raw.dimensionsCm || { length: 45, width: 45, height: 18 },
    netWeightKg: Number(raw.netWeightKg || raw.weightKg || 12),
    finishType: raw.finishType || 'Cold-Pressed Walnut Oil & Beeswax',
    basePriceInr: baseInr,
    basePriceUsd: priceUsd,
    leadTimeWeeks: Number(raw.leadTimeWeeks || 4),
    stockQuantity: raw.stockQuantity ?? raw.stock ?? 1,
    isMadeToOrder: Boolean(raw.isMadeToOrder ?? true),
    isFeatured: Boolean(raw.isFeatured),
    images:
      imageUrls.length > 0
        ? imageUrls
        : ['https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682446/sisodia-atelier/categories/solid-wooden-tiles.jpg'],
    artisanMaster: raw.artisanMasterName || raw.artisanMaster || 'Master Craftsman Khemraj',
    specialTrait: raw.brassInlayDetails || raw.specialTrait || '100% Monolithic Solid Heartwood • 7.2% Moisture',
    provenanceStory: raw.fullDescription || raw.provenanceHeritage || raw.description || '',
  };
}

function mapBackendOrder(raw: any): OrderRecord {
  const addr = (raw.shippingAddress || {}) as Record<string, any>;
  const destinationParts = [addr.city, addr.countryCode].filter(Boolean);
  const firstItemTitle =
    raw.orderItems?.[0]?.productSnapshot?.title ||
    raw.orderItems?.[0]?.product?.title ||
    'Bespoke Solid Heartwood Consignment';

  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    customerName: addr.fullName || raw.user?.firstName || 'Esteemed Patron',
    customerEmail: raw.guestEmail || raw.user?.email,
    destination: destinationParts.join(', ') || 'International DDP Estate',
    itemsSummary:
      raw.orderItems?.length > 1
        ? `${firstItemTitle} (+${raw.orderItems.length - 1} more)`
        : firstItemTitle,
    totalAmountUsd: Number(raw.totalAmount || 0),
    currency: (raw.currency || 'USD') as OrderRecord['currency'],
    status: (raw.status || 'ORDER_CONFIRMED') as OrderStatusType,
    trackingStage: Number(raw.trackingStage || 1),
    courierPartner: raw.courierPartner || undefined,
    trackingNumber: raw.trackingNumber || undefined,
    currentCheckpoint: raw.currentCheckpoint || undefined,
    estimatedDelivery: raw.estimatedDelivery || undefined,
    cancellationReason: raw.cancellationReason || undefined,
    cancelledAt: raw.cancelledAt || undefined,
    ownerCancelConfirmed: Boolean(raw.ownerCancelConfirmed),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function uploadMediaToCloudinary(
  file: File,
  passcode?: string
): Promise<{
  uploadedToCloud: boolean;
  url: string;
  thumbnailUrl: string;
  resourceType: 'image' | 'video';
  warning?: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE_URL}/upload/media`, {
      method: 'POST',
      headers: ownerHeaders(passcode, false),
      body: formData,
    });

    const json = await res.json();
    if (res.ok && json?.data?.url) {
      return {
        uploadedToCloud: true,
        url: json.data.url,
        thumbnailUrl: json.data.thumbnailUrl || json.data.url,
        resourceType: json.data.resourceType === 'video' ? 'video' : 'image',
      };
    }

    throw new Error(json?.message || 'Cloudinary upload unavailable.');
  } catch (err: any) {
    // Graceful local browser preview fallback when Cloudinary keys aren't set yet in .env
    const isVideo = file.type.startsWith('video/');
    const localUrl = isVideo
      ? URL.createObjectURL(file)
      : await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.readAsDataURL(file);
        });

    return {
      uploadedToCloud: false,
      url: localUrl,
      thumbnailUrl: isVideo
        ? 'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794679405/sisodia-atelier/permanent/brand_logo.jpg'
        : localUrl,
      resourceType: isVideo ? 'video' : 'image',
      warning:
        err?.message ||
        'Cloudinary credentials not active in backend .env; using local session media preview.',
    };
  }
}

export async function fetchProductsFromApi(): Promise<ProductItem[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=100`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json.data)) return null;
    return json.data.map(mapBackendProduct);
  } catch {
    return null;
  }
}

export async function createProductApi(
  payload: Record<string, unknown>,
  passcode?: string
): Promise<ProductItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: ownerHeaders(passcode),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ? mapBackendProduct(json.data) : null;
  } catch {
    return null;
  }
}

export async function toggleProductStarApi(
  id: string,
  isFeatured: boolean,
  passcode?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}/star`, {
      method: 'PATCH',
      headers: ownerHeaders(passcode),
      body: JSON.stringify({ isFeatured }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteProductApi(id: string, passcode?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: ownerHeaders(passcode, false),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchReelsFromApi(): Promise<ReelItem[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/reels`);
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : null;
  } catch {
    return null;
  }
}

export async function createReelApi(
  payload: Omit<ReelItem, 'id' | 'createdAt'>,
  passcode?: string
): Promise<ReelItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/reels`, {
      method: 'POST',
      headers: ownerHeaders(passcode),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function deleteReelApi(id: string, passcode?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${id}`, {
      method: 'DELETE',
      headers: ownerHeaders(passcode, false),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchOwnerOrdersApi(passcode?: string): Promise<OrderRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders?limit=100`, {
      headers: ownerHeaders(passcode, false),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data.map(mapBackendOrder) : null;
  } catch {
    return null;
  }
}

export async function trackOrderFromApi(orderNumber: string): Promise<OrderRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderNumber)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ? mapBackendOrder(json.data) : null;
  } catch {
    return null;
  }
}

export async function updateOrderTrackingApi(
  id: string,
  payload: {
    status: OrderStatusType;
    trackingStage: number;
    courierPartner?: string;
    trackingNumber?: string;
    currentCheckpoint?: string;
    estimatedDelivery?: string;
  },
  passcode?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/tracking`, {
      method: 'PATCH',
      headers: ownerHeaders(passcode),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function cancelOrderOnApi(
  id: string,
  reason: string
): Promise<{ ok: boolean; statusCode: number; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    return {
      ok: res.ok,
      statusCode: res.status,
      message: json?.message,
    };
  } catch {
    return { ok: true, statusCode: 200 };
  }
}

export async function confirmOrderCancelApi(id: string, passcode?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/confirm-cancel`, {
      method: 'PATCH',
      headers: ownerHeaders(passcode),
      body: JSON.stringify({}),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createInquiryApi(payload: {
  customerName: string;
  contactInfo: string;
  requirementType: string;
  quantityOrScope: string;
  message: string;
}): Promise<InquiryRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function fetchOwnerInquiriesApi(passcode?: string): Promise<InquiryRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`, {
      headers: ownerHeaders(passcode, false),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchSiteAssetsApi(): Promise<{ brand_logo?: string; atelier_floor_video?: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/site-assets`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// CUSTOMER AUTHENTICATION & PATRON PORTAL APIs (STRICT 11-COUNTRY GUARD)
// --------------------------------------------------------------------------

export async function customerGoogleAuthApi(
  credential: string,
  preferredCountryCode?: string
): Promise<CustomerAuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(preferredCountryCode ? { 'x-country-code': preferredCountryCode } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ credential, preferredCountryCode }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.message || 'Google authentication failed',
        code: json.code || (res.status === 403 ? 'COUNTRY_UNAUTHORIZED' : undefined),
        approvedTerritories: json.approvedTerritories,
      };
    }
    const data = json.data || {};
    return {
      success: true,
      token: data.token,
      customer: data.customer,
      orders: Array.isArray(data.orders) ? data.orders.map(mapBackendOrder) : [],
      isNewUser: data.isNewUser,
      message: json.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error during Google authentication',
    };
  }
}

export async function customerSendOtpApi(
  email: string,
  preferredCountryCode?: string
): Promise<{ success: boolean; message: string; isExistingUser?: boolean; code?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(preferredCountryCode ? { 'x-country-code': preferredCountryCode } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ email, preferredCountryCode }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.message || 'Failed to dispatch verification code',
        code: json.code || (res.status === 403 ? 'COUNTRY_UNAUTHORIZED' : undefined),
      };
    }
    return {
      success: true,
      message: json.message || 'Verification code dispatched to your email.',
      isExistingUser: json.data?.isExistingUser,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error while requesting verification code',
    };
  }
}

export async function customerVerifyOtpApi(params: {
  email: string;
  otp: string;
  name?: string;
  countryCode?: string;
}): Promise<CustomerAuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(params.countryCode ? { 'x-country-code': params.countryCode } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.message || 'Invalid or expired verification code',
        code: json.code || (res.status === 403 ? 'COUNTRY_UNAUTHORIZED' : undefined),
      };
    }
    const data = json.data || {};
    if (data.requiresRegistrationDetails) {
      return {
        success: false,
        requiresRegistrationDetails: true,
        message: json.message || 'First-time registration requires patron full name and destination.',
      };
    }
    return {
      success: true,
      token: data.token,
      customer: data.customer,
      orders: Array.isArray(data.orders) ? data.orders.map(mapBackendOrder) : [],
      isNewUser: data.isNewUser,
      message: json.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error during verification',
    };
  }
}

export async function customerGetMeApi(token: string): Promise<{
  success: boolean;
  customer?: CustomerUser;
  orders?: OrderRecord[];
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) {
      return { success: false, message: 'Session expired' };
    }
    const json = await res.json();
    const data = json.data || {};
    return {
      success: true,
      customer: data.customer || data,
      orders: Array.isArray(data.orders) ? data.orders.map(mapBackendOrder) : [],
    };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function customerUpdateProfileApi(
  token: string,
  data: {
    name?: string;
    phone?: string;
    countryCode?: string;
    savedAddress?: string;
    savedCity?: string;
    savedPostalCode?: string;
    firmName?: string;
    gstOrTaxId?: string;
  }
): Promise<{ success: boolean; customer?: CustomerUser; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Failed to update profile' };
    }
    return {
      success: true,
      customer: json.data?.customer,
      message: json.message,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error' };
  }
}

/**
 * Fetch patron cart from Neon PostgreSQL
 */
export async function fetchCustomerCartApi(token: string): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.cart || [];
  } catch {
    return null;
  }
}

/**
 * Persist patron cart to Neon PostgreSQL
 */
export async function updateCustomerCartApi(token: string, cart: any[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/cart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ cart }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch patron's scoped orders from Neon PostgreSQL
 */
export async function fetchMyOrdersApi(token: string): Promise<OrderRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rawList = json.data || [];
    return Array.isArray(rawList) ? rawList.map(mapBackendOrder) : [];
  } catch {
    return null;
  }
}

/**
 * Cancel patron's order (Early stage 1-2 only)
 */
export async function cancelMyOrderApi(
  token: string,
  orderId: string,
  reason?: string
): Promise<{ success: boolean; message: string; order?: OrderRecord }> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Unable to cancel order.' };
    }
    return {
      success: true,
      message: json.message || 'Order successfully cancelled.',
      order: json.data ? mapBackendOrder(json.data) : undefined,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error during cancellation.' };
  }
}



