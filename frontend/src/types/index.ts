export type Currency = 'USD' | 'GBP' | 'EUR' | 'AUD' | 'CAD' | 'MXN' | 'AED' | 'INR';

export interface CurrencyConfig {
  code: Currency | string;
  countryCode?: string;
  countryName?: string;
  symbol: string;
  label: string;
  rateAgainstUsd?: number; // 1 USD = X Currency (Legacy)
  rateAgainstInr?: number; // 1 Foreign Currency = X INR (Base INR Engine)
  flag: string;
  dutyPrepaidNote?: string;
}

export interface CountryCurrencyConfig {
  countryCode: string;
  countryName: string;
  currencyCode: Currency;
  symbol: string;
  label: string;
  rateAgainstInr: number; // 1 Foreign Unit = X INR
  flag: string;
  dutyPrepaidNote: string;
}

export interface ReviewItem {
  id: string;
  patronName: string;
  patronLocation: string;
  pieceTitle: string;
  rating: number;
  headline: string;
  commentary: string;
  isVerifiedPatron: boolean;
  date: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalConsignments: number;
  verifiedPatrons: number;
  fiveStarPercentage: number;
  countriesRepresented: string[];
  auditStandard: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface ProductItem {
  id: string;
  slug: string;
  sku: string;
  title: string;
  tagline: string;
  shortDescription: string;
  category: string;
  catKey?: string;
  room?: string;
  origin?: string;
  timberSeasoning?: string;
  woodSpecies: string;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  netWeightKg: number;
  finishType: string;
  basePriceInr?: number;
  basePriceUsd: number;
  leadTimeWeeks: number;
  stockQuantity?: number;
  isMadeToOrder: boolean;
  isFeatured?: boolean;
  images: string[];
  galleryMedia?: MediaItem[];
  artisanMaster: string;
  specialTrait: string;
  provenanceStory?: string;
  ayurvedicProperties?: string;
}

export interface CategoryMeta {
  id: string;
  catKey: string;
  title: string;
  subtitle: string;
  count: string;
  tag: string;
  href: string;
  imageUrl: string;
  woodType: string;
  productCount?: number;
}

export interface ReelItem {
  id: string;
  episodeNumber: string;
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
}

export type OrderStatusType =
  | 'ORDER_CONFIRMED'
  | 'IN_CRAFTING'
  | 'QUALITY_AND_CRATING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  firmName?: string;
  gstNumber?: string;
  paymentGateway?: string;
  destination: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    phoneNumber?: string;
  };
  lineItems?: Array<{
    title: string;
    sku?: string;
    woodSpecies?: string;
    quantity: number;
    priceInr: number;
    priceUsd: number;
  }>;
  itemsSummary: string;
  totalAmountUsd: number;
  totalAmountInr?: number;
  currency: Currency;
  status: OrderStatusType;
  trackingStage: number; // 1..6
  courierPartner?: string;
  trackingNumber?: string;
  currentCheckpoint?: string;
  estimatedDelivery?: string;
  isCancelled?: boolean;
  cancelReason?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  ownerCancelConfirmed: boolean;
  createdAt: string;
}

export type InquiryStatus = 'NEW' | 'REPLIED' | 'MEETING_SCHEDULED';

export interface InquiryRecord {
  id: string;
  customerName: string;
  contactInfo: string;
  requirementType: string;
  quantityOrScope: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface ConsultationSlotItem {
  slot: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  customMonogram?: string;
  customFinishing?: string;
}

export interface CustomerUser {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  countryCode: string;
  countryName: string;
  country?: string;
  avatarUrl?: string | null;
  savedAddress?: string | null;
  savedCity?: string | null;
  savedPostalCode?: string | null;
  firmName?: string | null;
  gstOrTaxId?: string | null;
  authProvider?: 'GOOGLE' | 'EMAIL_OTP' | 'MANUAL';
  wishlistIds?: string[];
  orders?: OrderRecord[];
  createdAt?: string;
}

export interface CustomerAuthResult {
  success: boolean;
  token?: string;
  customer?: CustomerUser;
  orders?: OrderRecord[];
  isNewUser?: boolean;
  requiresRegistrationDetails?: boolean;
  message?: string;
  code?: string;
  approvedTerritories?: any[];
}

