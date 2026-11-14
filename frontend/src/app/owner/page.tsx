'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  Star,
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
  Package,
  AlertTriangle,
  CheckCircle2,
  Truck,
  MessageSquare,
  TrendingUp,
  Plus,
  Film,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Check,
  Search,
  Sparkles,
  X,
  FileText,
  Printer,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ORDER_STAGE_DEFINITIONS, useAtelier } from '@/context/AtelierContext';
import { CURRENCY_CONFIGS } from '@/context/CurrencyContext';
import { uploadMediaToCloudinary } from '@/lib/api';
import { InquiryStatus, OrderRecord, OrderStatusType } from '@/types';
import { OfficialTaxInvoice } from '@/components/invoice/OfficialTaxInvoice';

type OwnerTab = 'overview' | 'products' | 'reels' | 'orders' | 'inquiries' | 'invoices';

interface OrderDraftState {
  status: OrderStatusType;
  trackingStage: number;
  courierPartner: string;
  trackingNumber: string;
  currentCheckpoint: string;
  estimatedDelivery: string;
}

function formatInrAmount(usdAmount: number): string {
  const inr = Math.round(usdAmount * CURRENCY_CONFIGS.INR.rateAgainstUsd);
  return `₹${inr.toLocaleString('en-IN')}`;
}

export default function OwnerDashboardPage() {
  const {
    products,
    featuredProducts,
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
    updateOrderTracking,
    confirmOrderCancel,
    updateInquiryStatus,
  } = useAtelier();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Tab 2: Add Product Form State
  const [prodTitle, setProdTitle] = useState('');
  const [prodTagline, setProdTagline] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPriceInr, setProdPriceInr] = useState('85000');
  const [prodCategorySelect, setProdCategorySelect] = useState('Urns & Planters');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [prodRoom, setProdRoom] = useState('Living Room');
  const [dimL, setDimL] = useState('42');
  const [dimW, setDimW] = useState('42');
  const [dimH, setDimH] = useState('56');
  const [netWeightKg, setNetWeightKg] = useState('18');
  const [woodSpecies, setWoodSpecies] = useState('Aged Burma Teak Heartwood');
  const [prodOrigin, setProdOrigin] = useState('Nagina, India');
  const [prodSeasoning, setProdSeasoning] = useState('16-Year Natural Seasoning • 7.2% MC');
  const [prodStock, setProdStock] = useState('3');
  const [prodDescription, setProdDescription] = useState('');
  const [primaryImgUrl, setPrimaryImgUrl] = useState('');
  const [galleryMedia, setGalleryMedia] = useState<Array<{ url: string; type: 'image' | 'video' }>>([]);
  const [directMediaUrl, setDirectMediaUrl] = useState('');
  const [isFeaturedStarred, setIsFeaturedStarred] = useState(true);
  const [isUploadingPrimaryImg, setIsUploadingPrimaryImg] = useState(false);
  const [isUploadingGalleryMedia, setIsUploadingGalleryMedia] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Tab 3: Documentary Reel Uploader State
  const [reelEpisode, setReelEpisode] = useState('EPISODE 05');
  const [reelTitle, setReelTitle] = useState('');
  const [reelDuration, setReelDuration] = useState('04:30 MIN');
  const [reelDescription, setReelDescription] = useState('');
  const [reelVideoUrl, setReelVideoUrl] = useState('');
  const [reelThumbUrl, setReelThumbUrl] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSavingReel, setIsSavingReel] = useState(false);

  // Tab 4: Orders Filter & Draft Editor State
  const [orderFilter, setOrderFilter] = useState<'all' | 'cancelled' | 'active'>('all');
  const [orderDrafts, setOrderDrafts] = useState<Record<string, OrderDraftState>>({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  // Tab 6: Official Tax & Export Invoices State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  useEffect(() => {
    if (!categoryNames.includes(prodCategorySelect) && prodCategorySelect !== '__OTHER__') {
      if (categoryNames.length > 0) setProdCategorySelect(categoryNames[0]);
    }
  }, [categoryNames, prodCategorySelect]);

  // Sync draft editors when orders list changes
  useEffect(() => {
    setOrderDrafts((prev) => {
      const next: Record<string, OrderDraftState> = { ...prev };
      for (const ord of orders) {
        if (!next[ord.id]) {
          next[ord.id] = {
            status: ord.status === 'CANCELLED' ? 'IN_TRANSIT' : ord.status,
            trackingStage: ord.trackingStage || 1,
            courierPartner: ord.courierPartner || 'DHL Express International Air',
            trackingNumber: ord.trackingNumber || '',
            currentCheckpoint: ord.currentCheckpoint || '',
            estimatedDelivery: ord.estimatedDelivery || '7–10 Days Worldwide',
          };
        }
      }
      return next;
    });
  }, [orders]);

  const showToast = (msg: string) => {
    setBannerFeedback(msg);
    setTimeout(() => setBannerFeedback(null), 4500);
  };

  // Revenue & Analytics Calculations
  const analytics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenueUsd = validOrders.reduce((sum, o) => sum + (o.totalAmountUsd || 0), 0);
    const activeShipments = validOrders.filter((o) => o.status !== 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
    const newInquiries = inquiries.filter((i) => i.status === 'NEW').length;

    return {
      totalRevenueUsd,
      totalOrders: orders.length,
      activeShipments,
      cancelledOrders,
      newInquiries,
    };
  }, [orders, inquiries]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      // Surface unacknowledged cancelled orders right at the top
      const aUrgent = a.status === 'CANCELLED' && !a.ownerCancelConfirmed ? 1 : 0;
      const bUrgent = b.status === 'CANCELLED' && !b.ownerCancelConfirmed ? 1 : 0;
      if (aUrgent !== bUrgent) return bUrgent - aUrgent;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (orderFilter === 'cancelled') {
      return sorted.filter((o) => o.status === 'CANCELLED');
    }
    if (orderFilter === 'active') {
      return sorted.filter((o) => o.status !== 'CANCELLED' && o.status !== 'DELIVERED');
    }
    return sorted;
  }, [orders, orderFilter]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsVerifying(true);
    setPinError(false);
    setAuthErrorMessage('');
    try {
      const ok = await unlockOwner(pinInput.trim());
      if (ok) {
        setPinError(false);
        setPinInput('');
      } else {
        setPinError(true);
        setAuthErrorMessage('Invalid owner password. Access denied.');
      }
    } catch {
      setPinError(true);
      setAuthErrorMessage('Failed to authenticate with owner credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  // File Upload Handlers
  const handlePrimaryImgUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploadingPrimaryImg(true);

    try {
      const result = await uploadMediaToCloudinary(file, ownerToken || ownerPasscode);
      setPrimaryImgUrl(result.url);
      showToast(
        result.warning
          ? `Attached locally (${result.warning})`
          : 'Primary image uploaded to Cloudinary & attached to draft.'
      );
    } finally {
      setIsUploadingPrimaryImg(false);
    }
  };

  const handleMultipleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingGalleryMedia(true);

    try {
      const fileList = Array.from(files);
      let count = 0;
      for (const file of fileList) {
        const result = await uploadMediaToCloudinary(file, ownerToken || ownerPasscode);
        setGalleryMedia((prev) => [
          ...prev,
          {
            url: result.url,
            type: result.resourceType,
          },
        ]);
        count++;
      }
      showToast(`Uploaded ${count} photo(s)/video(s) to product gallery.`);
    } catch (err: any) {
      showToast(err?.message || 'Error uploading gallery media');
    } finally {
      setIsUploadingGalleryMedia(false);
    }
  };

  const handleAddDirectMedia = () => {
    const trimmed = directMediaUrl.trim();
    if (!trimmed) return;
    const isVideo =
      /\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(trimmed) || trimmed.includes('/video/upload/');
    setGalleryMedia((prev) => [
      ...prev,
      { url: trimmed, type: isVideo ? 'video' : 'image' },
    ]);
    setDirectMediaUrl('');
    showToast('Direct media link added to gallery.');
  };

  const handleRemoveGalleryMedia = (index: number) => {
    setGalleryMedia((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleReelFileUpload = async (file: File | undefined, type: 'video' | 'thumb') => {
    if (!file) return;
    if (type === 'video') setIsUploadingVideo(true);
    else setIsUploadingThumb(true);

    try {
      const result = await uploadMediaToCloudinary(file, ownerToken || ownerPasscode);
      if (type === 'video') {
        setReelVideoUrl(result.url);
        if (!reelThumbUrl && result.thumbnailUrl) {
          setReelThumbUrl(result.thumbnailUrl);
        }
      } else {
        setReelThumbUrl(result.url);
      }
      showToast(
        result.warning
          ? `Attached locally (${result.warning})`
          : type === 'video'
          ? 'Craft reel video uploaded cleanly to Cloudinary.'
          : 'Cover thumbnail uploaded cleanly to Cloudinary.'
      );
    } finally {
      if (type === 'video') setIsUploadingVideo(false);
      else setIsUploadingThumb(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOther = prodCategorySelect === '__OTHER__';
    const resolvedCategory = isOther ? customCategoryName.trim() : prodCategorySelect;

    if (!prodTitle.trim() || !resolvedCategory) {
      showToast('Please provide Product Name and Category.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const imgs: string[] = [];
      if (primaryImgUrl.trim()) imgs.push(primaryImgUrl.trim());
      galleryMedia.forEach((m) => {
        if (m.url && !imgs.includes(m.url)) imgs.push(m.url);
      });
      if (imgs.length === 0) {
        imgs.push(
          'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682446/sisodia-atelier/categories/solid-wooden-tiles.jpg'
        );
      }

      const created = await addProduct({
        title: prodTitle.trim(),
        tagline: prodTagline.trim() || `${woodSpecies} Architectural Craft`,
        sku: prodSku.trim() || undefined,
        basePriceInr: Number(prodPriceInr) || 85000,
        basePriceUsd: Math.round((Number(prodPriceInr) || 85000) / 84),
        category: resolvedCategory,
        customCategory: isOther ? resolvedCategory : undefined,
        room: prodRoom,
        dimensionsCm: {
          length: Number(dimL) || 40,
          width: Number(dimW) || 40,
          height: Number(dimH) || 45,
        },
        netWeightKg: Number(netWeightKg) || 15,
        woodSpecies: woodSpecies.trim() || 'Aged Burma Teak Heartwood',
        origin: prodOrigin.trim() || 'Nagina, India',
        timberSeasoning: prodSeasoning.trim() || '16-Year Natural Seasoning • 7.2% MC',
        stockQuantity: Number(prodStock) || 1,
        shortDescription:
          prodDescription.trim() ||
          `Hand-carved in Nagina from seasoned ${woodSpecies} heartwood for heirloom residential and luxury hospitality spaces.`,
        images: imgs,
        galleryMedia,
        isFeatured: isFeaturedStarred,
      });

      setProdTitle('');
      setProdTagline('');
      setProdSku('');
      setProdDescription('');
      setPrimaryImgUrl('');
      setGalleryMedia([]);
      setDirectMediaUrl('');
      if (isOther) {
        setProdCategorySelect(created.category);
        setCustomCategoryName('');
      }
      showToast(
        `"${created.title}" published to Storefront${created.isFeatured ? ' & Starred in Homepage Carousel!' : '.'}`
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handlePublishReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelTitle.trim() || !reelVideoUrl.trim()) {
      showToast('Please upload or paste a Video URL and Title before publishing.');
      return;
    }

    setIsSavingReel(true);
    try {
      const created = await addReel({
        episodeNumber: reelEpisode.trim().toUpperCase() || `EPISODE 0${reels.length + 1}`,
        title: reelTitle.trim(),
        duration: reelDuration.trim().toUpperCase() || '04:00 MIN',
        description:
          reelDescription.trim() ||
          'Captured inside Yash Sisodia’s Nagina Woodcraft Atelier showcasing hand-turned solid heartwood heirloom craftsmanship.',
        videoUrl: reelVideoUrl.trim(),
        thumbnailUrl:
          reelThumbUrl.trim() ||
          'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794679405/sisodia-atelier/permanent/brand_logo.jpg',
      });

      setReelEpisode(`EPISODE 0${reels.length + 2}`);
      setReelTitle('');
      setReelDescription('');
      setReelVideoUrl('');
      setReelThumbUrl('');
      showToast(`Documentary "${created.title}" published to Homepage Video Reel!`);
    } finally {
      setIsSavingReel(false);
    }
  };

  const updateOrderDraftField = (
    orderId: string,
    patch: Partial<OrderDraftState>,
    autoCheckpoint?: boolean
  ) => {
    setOrderDrafts((prev) => {
      const current = prev[orderId] || {
        status: 'ORDER_CONFIRMED',
        trackingStage: 1,
        courierPartner: '',
        trackingNumber: '',
        currentCheckpoint: '',
        estimatedDelivery: '',
      };
      const merged = { ...current, ...patch };
      if (autoCheckpoint && patch.status) {
        const def = ORDER_STAGE_DEFINITIONS.find((s) => s.status === patch.status);
        if (def) {
          merged.trackingStage = def.stage;
          merged.currentCheckpoint = def.defaultCheckpoint;
        }
      }
      return { ...prev, [orderId]: merged };
    });
  };

  const handleSaveOrderTracking = async (order: OrderRecord) => {
    const draft = orderDrafts[order.id];
    if (!draft) return;
    setSavingOrderId(order.id);
    try {
      await updateOrderTracking(order.id, {
        status: draft.status,
        trackingStage: draft.trackingStage,
        courierPartner: draft.courierPartner,
        trackingNumber: draft.trackingNumber,
        currentCheckpoint: draft.currentCheckpoint,
        estimatedDelivery: draft.estimatedDelivery,
      });
      showToast(`Live tracking updated for ${order.orderNumber} (Stage ${draft.trackingStage}/6).`);
    } finally {
      setSavingOrderId(null);
    }
  };

  // PIN Auth Screen if locked
  if (!isOwnerUnlocked) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between p-6">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-[#57534E] hover:text-[#1C1917]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SISODIA ATELIER ✧ Storefront</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto bg-white border border-[#E7E0D3] rounded-sm shadow-lg p-8 sm:p-10 space-y-6 my-12">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#8B5E3C] shadow-xs">
              <img src="/logo.jpeg" alt="SISODIA ATELIER ✧" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8B5E3C] font-semibold">
                <Lock className="w-3 h-3" /> Private Owner Back-Office
              </span>
              <h1 className="font-serif text-3xl text-[#1C1917] mt-1">
                Yash Sisodia Owner Portal
              </h1>
              <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">
                Nagina Woodcraft Atelier Command Center • Manage Products, Homepage Starred Carousel, Documentary Reels, Orders & Inquiries.
              </p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] text-center">
                Enter Owner Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter Owner Password..."
                  autoComplete="current-password"
                  autoFocus
                  className="w-full text-center text-base tracking-wider font-mono bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm py-3 px-10 outline-none text-[#1C1917]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-red-700 text-center font-medium pt-1">
                  {authErrorMessage || 'Invalid owner password. Access denied.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#1E392A] hover:bg-[#14281D] disabled:opacity-60 text-white py-3.5 text-xs font-sans font-semibold tracking-[0.2em] uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Owner Back-Office</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#78716C] font-sans">
          SISODIA ATELIER ✧ • Nagina, India
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col">
      {/* Top Owner Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7E0D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-sans text-[#57534E] hover:text-[#1C1917] px-2.5 py-1.5 bg-white border border-[#E7E0D3] rounded-sm shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DDD6C9] shrink-0">
                <img src="/logo.jpeg" alt="SISODIA ATELIER ✧" className="w-full h-full object-cover" />
              </div>
              <div className="truncate">
                <h1 className="font-serif text-lg sm:text-xl text-[#1C1917] font-semibold truncate">
                  SISODIA ATELIER ✧ Owner Back-Office
                </h1>
                <p className="text-[10px] font-sans uppercase tracking-[0.16em] text-[#8B5E3C] font-semibold truncate">
                  Principal: Yash Sisodia • Nagina Global Woodcraft Hub
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {unacknowledgedCancellationsCount > 0 && (
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('cancelled');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-sans font-semibold rounded-sm animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{unacknowledgedCancellationsCount} Cancelled</span>
              </button>
            )}
            <Link
              href="/orders"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DDD6C9] hover:border-[#8B5E3C] text-xs font-sans text-[#1C1917] rounded-sm"
            >
              <Truck className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Patron Tracker Preview</span>
            </Link>
            <button
              onClick={lockOwner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] hover:bg-[#1E392A] text-white text-xs font-sans uppercase tracking-wider rounded-sm transition-colors"
              title="Lock / Logout Owner Desk"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock / Logout Owner Desk</span>
            </button>
          </div>
        </div>

        {/* 5 Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E7E0D3]/80 bg-[#F7F4EE] overflow-x-auto">
          <nav className="flex items-center gap-1 py-2 min-w-max">
            {[
              { id: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
              { id: 'products', label: 'Products & Starred Carousel', icon: Package },
              { id: 'reels', label: 'Documentary Reels & Video', icon: Film },
              {
                id: 'orders',
                label: `Orders & Live Tracking${
                  unacknowledgedCancellationsCount > 0 ? ` (${unacknowledgedCancellationsCount}!)` : ''
                }`,
                icon: Truck,
              },
              {
                id: 'inquiries',
                label: `Custom & Bulk Inquiries${
                  analytics.newInquiries > 0 ? ` (${analytics.newInquiries})` : ''
                }`,
                icon: MessageSquare,
              },
              {
                id: 'invoices',
                label: `GST & Export Invoices (${orders.length})`,
                icon: FileText,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as OwnerTab)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase rounded-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1E392A] text-white shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Toast Feedback Banner */}
      {bannerFeedback && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-[#1E392A] text-white px-4 py-3 rounded-sm flex items-center justify-between text-xs font-sans shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D9A756] shrink-0" />
              <span>{bannerFeedback}</span>
            </div>
            <button onClick={() => setBannerFeedback(null)} className="text-white/70 hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7E0D3] pb-5">
              <div>
                <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#8B5E3C] font-semibold">
                  Executive Summary
                </p>
                <h2 className="font-serif text-3xl text-[#1C1917] mt-1">
                  Namaste Yash Sisodia — Atelier Pulse
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('products')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E392A] text-white text-xs font-sans uppercase tracking-wider rounded-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
                <button
                  onClick={() => setActiveTab('reels')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#DDD6C9] hover:border-[#8B5E3C] text-[#1C1917] text-xs font-sans uppercase tracking-wider rounded-sm"
                >
                  <Video className="w-3.5 h-3.5 text-[#8B5E3C]" /> Upload Craft Reel
                </button>
              </div>
            </div>

            {/* Unacknowledged Cancellations Alert */}
            {unacknowledgedCancellationsCount > 0 && (
              <div className="bg-red-50 border-2 border-red-400 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-sans text-sm font-bold text-red-900 uppercase tracking-wider">
                      Attention Required: {unacknowledgedCancellationsCount} Customer Cancellation Alert
                      {unacknowledgedCancellationsCount > 1 ? 's' : ''}
                    </h3>
                    <p className="text-xs text-red-800 mt-1">
                      Patron cancellation notifications are awaiting your confirmation before artisan crating/dispatch halts are finalized.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderFilter('cancelled');
                  }}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-sm shrink-0"
                >
                  Review & Confirm Seen →
                </button>
              </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-2">
                <p className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
                  Total Export Revenue
                </p>
                <p className="font-serif text-3xl text-[#1C1917]">
                  ${analytics.totalRevenueUsd.toLocaleString('en-US')}
                </p>
                <p className="text-xs font-mono text-[#1E392A] font-semibold">
                  {formatInrAmount(analytics.totalRevenueUsd)} INR Equivalent
                </p>
              </div>

              <div className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-2">
                <p className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
                  Orders & Active Shipments
                </p>
                <p className="font-serif text-3xl text-[#1C1917]">{analytics.totalOrders}</p>
                <p className="text-xs font-sans text-[#57534E]">
                  {analytics.activeShipments} in active transit/crafting •{' '}
                  <span className={analytics.cancelledOrders > 0 ? 'text-red-700 font-semibold' : ''}>
                    {analytics.cancelledOrders} cancelled
                  </span>
                </p>
              </div>

              <div className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-2">
                <p className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
                  Homepage Starred Carousel
                </p>
                <p className="font-serif text-3xl text-[#1C1917]">{featuredProducts.length}</p>
                <p className="text-xs font-sans text-[#57534E]">
                  Starred out of {products.length} total masterworks • {categoryNames.length} categories
                </p>
              </div>

              <div className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-2">
                <p className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
                  Inquiries & Video Reels
                </p>
                <p className="font-serif text-3xl text-[#1C1917]">{inquiries.length}</p>
                <p className="text-xs font-sans text-[#8B5E3C] font-medium">
                  {analytics.newInquiries} New Custom/Trade RFQs • {reels.length} Live Reels
                </p>
              </div>
            </div>

            {/* Quick Summary Snapshots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#1C1917]">
                    Homepage Starred Masterworks ({featuredProducts.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-sans text-[#1E392A] underline font-semibold"
                  >
                    Manage Stars →
                  </button>
                </div>
                <div className="divide-y divide-[#E7E0D3]">
                  {featuredProducts.slice(0, 5).map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-sm border border-[#E7E0D3] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1C1917] truncate">{item.title}</p>
                          <p className="text-[11px] text-[#78716C]">{item.category}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#1E392A] font-semibold shrink-0">
                        ₹{(item.basePriceInr || item.basePriceUsd * 84).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {featuredProducts.length === 0 && (
                    <p className="text-xs text-[#78716C] py-4">
                      No products starred yet. Go to Products tab to star masterworks onto Homepage.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#1C1917]">
                    Recent Custom & Hotel Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs font-sans text-[#1E392A] underline font-semibold"
                  >
                    Open Inquiries →
                  </button>
                </div>
                <div className="divide-y divide-[#E7E0D3]">
                  {inquiries.slice(0, 4).map((inq) => (
                    <div key={inq.id} className="py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1C1917] truncate">
                          {inq.customerName}
                        </p>
                        <p className="text-[11px] text-[#78716C] truncate">
                          {inq.requirementType} • {inq.quantityOrScope}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm shrink-0 ${
                          inq.status === 'NEW'
                            ? 'bg-amber-100 text-amber-900'
                            : inq.status === 'MEETING_SCHEDULED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-[#F3EDE2] text-[#57534E]'
                        }`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS & STARRED CAROUSEL MANAGER ================= */}
        {activeTab === 'products' && (
          <div className="space-y-10">
            {/* Add New Product Form */}
            <section className="bg-white border border-[#E7E0D3] rounded-sm p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-[#E7E0D3]">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8B5E3C] font-semibold">
                    Cloudinary Media + Live Catalog Sync
                  </span>
                  <h2 className="font-serif text-2xl text-[#1C1917]">
                    Add New Handcrafted Masterwork or Wooden Tile Series
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[#1E392A] bg-[#F3EDE2] px-3 py-1 rounded-sm">
                  Syncs live to /shop & Homepage
                </span>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-6">
                {/* Media Uploaders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Image */}
                  <div className="p-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-sans font-semibold uppercase tracking-wider text-[#1C1917]">
                        Primary Image (Cloudinary Upload)
                      </label>
                      {isUploadingPrimaryImg && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8B5E3C]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </span>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-[#8B5E3C]/60 hover:border-[#1E392A] bg-white rounded-sm py-3 px-4 cursor-pointer text-xs font-sans text-[#57534E] hover:text-[#1C1917] transition-colors">
                      <Upload className="w-4 h-4 text-[#8B5E3C]" />
                      <span>Choose Primary Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePrimaryImgUpload(e.target.files?.[0])}
                      />
                    </label>
                    <input
                      type="text"
                      value={primaryImgUrl}
                      onChange={(e) => setPrimaryImgUrl(e.target.value)}
                      placeholder="Or paste image URL (auto-filled after upload)"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                    {primaryImgUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <img
                          src={primaryImgUrl}
                          alt="Primary Preview"
                          className="w-16 h-16 object-cover rounded-sm border border-[#DDD6C9]"
                        />
                        <span className="text-[11px] text-[#1E392A] font-medium">Primary image ready</span>
                      </div>
                    )}
                  </div>

                  {/* PRODUCT GALLERY MEDIA (MULTIPLE PHOTOS & VIDEOS) */}
                  <div className="p-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-sans font-semibold uppercase tracking-wider text-[#1C1917]">
                        PRODUCT GALLERY MEDIA (MULTIPLE PHOTOS & VIDEOS)
                      </label>
                      {isUploadingGalleryMedia && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8B5E3C]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading media...
                        </span>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-[#8B5E3C]/60 hover:border-[#1E392A] bg-white rounded-sm py-3 px-4 cursor-pointer text-xs font-sans text-[#57534E] hover:text-[#1C1917] transition-colors">
                      <Upload className="w-4 h-4 text-[#8B5E3C]" />
                      <span>Choose Multiple Photos & Videos from Device</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleMultipleGalleryUpload(e.target.files)}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={directMediaUrl}
                        onChange={(e) => setDirectMediaUrl(e.target.value)}
                        placeholder="Or paste Image / MP4 Video URL"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDirectMedia();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddDirectMedia}
                        className="px-3.5 py-2 bg-[#1E392A] hover:bg-[#14281D] text-white text-xs font-sans font-semibold rounded-sm shrink-0"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Preview Grid with Remove Button */}
                    {galleryMedia.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2 border-t border-[#E7E0D3]">
                        {galleryMedia.map((media, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-sm overflow-hidden border border-[#DDD6C9] bg-black group"
                          >
                            {media.type === 'video' ? (
                              <div className="w-full h-full relative">
                                <video src={media.url} muted className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/80 text-white text-[9px] font-mono rounded font-bold">
                                  VIDEO
                                </span>
                              </div>
                            ) : (
                              <img
                                src={media.url}
                                alt={`Gallery item ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryMedia(idx)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors"
                              title="Remove"
                              aria-label="Remove item"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      placeholder="e.g. Carved Nagina Heritage Portal Door"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={prodTagline}
                      onChange={(e) => setProdTagline(e.target.value)}
                      placeholder="e.g. Hand-Chiseled Burma Teak Architectural Masterpiece"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      placeholder="e.g. SA-NGN-DOOR-01"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                  </div>
                </div>

                {/* Category + Custom Other + Price + Room */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Category * (Supports New Categories)
                    </label>
                    <select
                      value={prodCategorySelect}
                      onChange={(e) => setProdCategorySelect(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    >
                      {categoryNames.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__OTHER__">+ Other (Add New Category)</option>
                    </select>
                    {prodCategorySelect === '__OTHER__' && (
                      <input
                        type="text"
                        required
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        placeholder="Enter New Category Name (e.g. Carved Wood Doors)"
                        className="mt-2 w-full px-3 py-2 text-sm bg-white border-2 border-[#8B5E3C] rounded-sm outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Base Price in INR (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 85000"
                      value={prodPriceInr}
                      onChange={(e) => setProdPriceInr(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A] font-mono"
                    />
                    {(() => {
                      const inr = Number(prodPriceInr) || 0;
                      const usa = Math.round(inr / 84);
                      const uk = Math.round(inr / 107);
                      const eu = Math.round(inr / 91);
                      const uae = Math.round(inr / 22.85);
                      const au = Math.round(inr / 55);
                      return (
                        <p className="text-[11px] text-[#8B5E3C] font-mono mt-1.5 leading-relaxed bg-[#FAF7F2] p-2 border border-[#E7E0D3] rounded-sm">
                          <span className="font-semibold text-[#1C1917]">Preview:</span> USA ~${usa.toLocaleString()} | UK ~£{uk.toLocaleString()} | Europe ~€{eu.toLocaleString()} | UAE ~AED {uae.toLocaleString()} | Australia ~A${au.toLocaleString()}
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Curated Room Placement
                    </label>
                    <select
                      value={prodRoom}
                      onChange={(e) => setProdRoom(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Kitchen & Dining">Kitchen & Dining</option>
                      <option value="Botanical / Balcony">Botanical Balcony</option>
                      <option value="Architectural Wall">Architectural Wall</option>
                    </select>
                  </div>
                </div>

                {/* Timber & Dimensions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      value={dimL}
                      onChange={(e) => setDimL(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={dimW}
                      onChange={(e) => setDimW(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={dimH}
                      onChange={(e) => setDimH(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                      Net Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={netWeightKg}
                      onChange={(e) => setNetWeightKg(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                      Stock Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                      Origin Hub
                    </label>
                    <input
                      type="text"
                      value={prodOrigin}
                      onChange={(e) => setProdOrigin(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Solid Wood Species
                    </label>
                    <input
                      type="text"
                      value={woodSpecies}
                      onChange={(e) => setWoodSpecies(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Timber Seasoning & Moisture Standard
                    </label>
                    <input
                      type="text"
                      value={prodSeasoning}
                      onChange={(e) => setProdSeasoning(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                    Heirloom Provenance & Craft Description
                  </label>
                  <textarea
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Describe chisel work, lathe turning, kiln equilibrium, and architectural application..."
                    className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                  />
                </div>

                {/* Feature Star Checkbox + Submit */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E7E0D3]">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-[#F7F4EE] border border-[#DDD6C9] px-4 py-2.5 rounded-sm">
                    <input
                      type="checkbox"
                      checked={isFeaturedStarred}
                      onChange={(e) => setIsFeaturedStarred(e.target.checked)}
                      className="w-4 h-4 accent-[#1E392A]"
                    />
                    <Star
                      className={`w-4 h-4 ${
                        isFeaturedStarred ? 'text-[#A37836] fill-[#A37836]' : 'text-[#78716C]'
                      }`}
                    />
                    <span className="text-xs font-sans font-semibold text-[#1C1917]">
                      Star this product on Homepage Featured Carousel
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSavingProduct || isUploadingPrimaryImg || isUploadingGalleryMedia}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#1E392A] hover:bg-[#14281D] disabled:opacity-60 text-white text-xs font-sans font-semibold tracking-[0.18em] uppercase rounded-sm transition-colors"
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Publish Masterwork to Storefront
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Existing Products Catalog & Star Control */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#1C1917]">
                    Catalog & Homepage Starred Carousel Control ({products.length})
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Only <strong className="text-[#1C1917]">★ Starred</strong> products scroll inside the Homepage 3D Featured Masterworks Carousel.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filter by title, category, SKU..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white border rounded-sm overflow-hidden flex flex-col justify-between transition-all ${
                      product.isFeatured
                        ? 'border-[#A37836] ring-1 ring-[#A37836]/25 shadow-sm'
                        : 'border-[#E7E0D3]'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-[#F3EDE2] overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2 py-0.5 bg-[#FAF7F2]/95 text-[#1C1917] text-[10px] font-mono uppercase rounded-sm border border-[#DDD6C9]">
                            {product.category}
                          </span>
                        </div>
                        {product.isFeatured && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#1E392A] text-white text-[10px] font-sans font-semibold uppercase tracking-wider rounded-sm inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#D9A756] text-[#D9A756]" />
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-lg text-[#1C1917] leading-snug">
                            {product.title}
                          </h4>
                          <span className="font-mono text-sm font-semibold text-[#1E392A] shrink-0">
                            ₹{(product.basePriceInr || product.basePriceUsd * 84).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#78716C]">
                          {product.sku} • {product.woodSpecies}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] border-t border-[#E7E0D3] flex items-center justify-between gap-2">
                      <button
                        onClick={async () => {
                          await toggleProductStar(product.id);
                          showToast(
                            product.isFeatured
                              ? `Removed "${product.title}" from Homepage Carousel.`
                              : `Starred "${product.title}" onto Homepage Carousel!`
                          );
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm text-xs font-sans font-semibold transition-colors ${
                          product.isFeatured
                            ? 'bg-[#D9A756] text-[#1C1917] hover:bg-[#C6923F] border border-[#A37836]'
                            : 'bg-stone-100 border border-[#DDD6C9] text-stone-600 hover:border-[#A37836] hover:text-[#1C1917]'
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            product.isFeatured ? 'fill-[#1C1917] text-[#1C1917]' : 'text-stone-500'
                          }`}
                        />
                        <span>{product.isFeatured ? '★ Starred' : '☆ Star'}</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (
                            typeof window === 'undefined' ||
                            window.confirm(`Delete "${product.title}" permanently?`)
                          ) {
                            await deleteProduct(product.id);
                            showToast(`Deleted "${product.title}" from catalog.`);
                          }
                        }}
                        className="p-2 bg-white border border-[#DDD6C9] hover:border-red-400 hover:text-red-700 text-[#78716C] rounded-sm transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 3: DOCUMENTARY REELS & VIDEO UPLOADER ================= */}
        {activeTab === 'reels' && (
          <div className="space-y-10">
            <section className="bg-white border border-[#E7E0D3] rounded-sm p-6 sm:p-8 shadow-xs">
              <div className="pb-5 mb-6 border-b border-[#E7E0D3]">
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8B5E3C] font-semibold">
                  Cloudinary Video Studio
                </span>
                <h2 className="font-serif text-2xl text-[#1C1917] mt-0.5">
                  Upload Nagina Workshop Video Reel to Homepage Documentary Strip
                </h2>
              </div>

              <form onSubmit={handlePublishReel} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Video Upload */}
                  <div className="p-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-sans font-semibold uppercase tracking-wider text-[#1C1917]">
                        Craft Documentary Video (.mp4 / .mov / .webm) *
                      </label>
                      {isUploadingVideo && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8B5E3C]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Video...
                        </span>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-[#8B5E3C]/60 hover:border-[#1E392A] bg-white rounded-sm py-3.5 px-4 cursor-pointer text-xs font-sans text-[#57534E] hover:text-[#1C1917]">
                      <Video className="w-4 h-4 text-[#8B5E3C]" />
                      <span>Upload Video File from Computer / Phone</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleReelFileUpload(e.target.files?.[0], 'video')}
                      />
                    </label>
                    <input
                      type="text"
                      value={reelVideoUrl}
                      onChange={(e) => setReelVideoUrl(e.target.value)}
                      placeholder="Or paste Cloudinary MP4 Video URL"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                    {reelVideoUrl && (
                      <video
                        src={reelVideoUrl}
                        controls
                        className="w-full aspect-video rounded-sm bg-black border border-[#DDD6C9]"
                      />
                    )}
                  </div>

                  {/* Cover Thumbnail Upload */}
                  <div className="p-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-sans font-semibold uppercase tracking-wider text-[#1C1917]">
                        Cover Thumbnail Image (Optional Auto-Fallback)
                      </label>
                      {isUploadingThumb && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8B5E3C]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </span>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-[#8B5E3C]/60 hover:border-[#1E392A] bg-white rounded-sm py-3.5 px-4 cursor-pointer text-xs font-sans text-[#57534E] hover:text-[#1C1917]">
                      <ImageIcon className="w-4 h-4 text-[#8B5E3C]" />
                      <span>Choose Cover Thumbnail Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleReelFileUpload(e.target.files?.[0], 'thumb')}
                      />
                    </label>
                    <input
                      type="text"
                      value={reelThumbUrl}
                      onChange={(e) => setReelThumbUrl(e.target.value)}
                      placeholder="Or paste cover image URL"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                    {reelThumbUrl && (
                      <img
                        src={reelThumbUrl}
                        alt="Reel cover"
                        className="w-full aspect-video object-cover rounded-sm border border-[#DDD6C9]"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Episode Tag
                    </label>
                    <input
                      type="text"
                      value={reelEpisode}
                      onChange={(e) => setReelEpisode(e.target.value)}
                      placeholder="e.g. EPISODE 05"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={reelTitle}
                      onChange={(e) => setReelTitle(e.target.value)}
                      placeholder="e.g. Chisel Carving Relief Wooden Tiles in Nagina"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Duration Label
                    </label>
                    <input
                      type="text"
                      value={reelDuration}
                      onChange={(e) => setReelDuration(e.target.value)}
                      placeholder="e.g. 04:30 MIN"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                    Workshop Narrative Description
                  </label>
                  <textarea
                    rows={2}
                    value={reelDescription}
                    onChange={(e) => setReelDescription(e.target.value)}
                    placeholder="Short story explaining the Nagina turning, kiln drying, or carving technique shown..."
                    className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingReel || isUploadingVideo || isUploadingThumb}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-[#1E392A] hover:bg-[#14281D] disabled:opacity-60 text-white text-xs font-sans font-semibold tracking-[0.18em] uppercase rounded-sm transition-colors"
                  >
                    {isSavingReel ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4" /> Publish Reel to Homepage →
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Uploaded Reels List */}
            <section className="space-y-4">
              <h3 className="font-serif text-2xl text-[#1C1917]">
                Live Homepage Documentary Reels ({reels.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="bg-white border border-[#E7E0D3] rounded-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-[#1C1917]">
                        <img
                          src={reel.thumbnailUrl}
                          alt={reel.title}
                          className="w-full h-full object-cover opacity-90"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/90 text-[#1C1917] text-[10px] font-mono uppercase font-semibold rounded-sm">
                          {reel.episodeNumber}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded-sm">
                          {reel.duration}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <h4 className="font-serif text-base text-[#1C1917] font-semibold">
                          {reel.title}
                        </h4>
                        <p className="text-xs text-[#57534E] line-clamp-2">{reel.description}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] border-t border-[#E7E0D3] flex justify-end">
                      <button
                        onClick={async () => {
                          await deleteReel(reel.id);
                          showToast(`Deleted reel "${reel.title}".`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DDD6C9] hover:border-red-400 text-red-700 text-xs font-sans font-medium rounded-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Video</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 4: ORDERS, HIGHLIGHTED CANCELLATIONS & LIVE TRACKING ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E0D3] pb-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917]">
                  Orders, Highlighted Cancellations & 6-Stage Tracking Control
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  Stage updates sync directly with Customer Consignment Radar (/orders). Stage 5 (Out for Delivery) automatically locks customer cancellation.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: `All (${orders.length})` },
                  { id: 'cancelled', label: `Cancelled Alerts (${analytics.cancelledOrders})` },
                  { id: 'active', label: `Active Shipments (${analytics.activeShipments})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setOrderFilter(pill.id as 'all' | 'cancelled' | 'active')}
                    className={`px-3.5 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                      orderFilter === pill.id
                        ? pill.id === 'cancelled'
                          ? 'bg-red-700 text-white'
                          : 'bg-[#1E392A] text-white'
                        : 'bg-white border border-[#DDD6C9] text-[#44403C]'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const isCancelled = order.status === 'CANCELLED';
                const draft = orderDrafts[order.id];

                if (isCancelled) {
                  return (
                    <div
                      key={order.id}
                      className="bg-red-50 border-2 border-red-400 rounded-sm p-6 space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[11px] font-mono uppercase tracking-wider font-bold rounded-sm">
                              <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ CANCELLED BY CUSTOMER
                            </span>
                            <span className="font-mono text-sm font-bold text-[#1C1917]">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-[#57534E]">
                              • {order.destination}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl text-[#1C1917]">
                            {order.customerName}{' '}
                            {order.customerEmail && (
                              <span className="text-xs font-sans text-[#57534E] font-normal">
                                ({order.customerEmail})
                              </span>
                            )}
                          </h3>
                          <p className="text-xs font-sans text-[#44403C]">
                            <span className="font-semibold">Consignment:</span> {order.itemsSummary} •{' '}
                            <span className="font-mono font-semibold">
                              ${order.totalAmountUsd.toLocaleString()} ({formatInrAmount(order.totalAmountUsd)})
                            </span>
                          </p>
                          <div className="bg-white/80 border border-red-200 rounded-sm p-3 text-xs text-red-950">
                            <span className="font-semibold uppercase tracking-wider text-[10px] text-red-800 block mb-0.5">
                              Customer Cancellation Reason & Timestamp
                            </span>
                            <p>
                              “{order.cancellationReason || 'Patron requested order cancellation before final delivery dispatch.'}”
                            </p>
                            {order.cancelledAt && (
                              <p className="text-[11px] font-mono text-red-700 mt-1">
                                Cancelled At: {new Date(order.cancelledAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-start lg:items-end justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DDD6C9] hover:border-[#1E392A] text-[#1E392A] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View / Print Official Bill</span>
                            </button>
                          </div>
                          {order.ownerCancelConfirmed ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-sans font-semibold rounded-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>✓ Cancellation Acknowledged by Yash Sisodia</span>
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                await confirmOrderCancel(order.id);
                                showToast(
                                  `Confirmed cancellation alert seen for ${order.orderNumber}.`
                                );
                              }}
                              className="inline-flex items-center gap-2 px-5 py-3 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-sm shadow-xs transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span>✓ Confirm Cancel Seen (Acknowledge)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Active / Non-cancelled order with 6-stage controller
                return (
                  <div
                    key={order.id}
                    className="bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-5 shadow-xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E0D3] pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-[#1E392A] bg-[#F3EDE2] px-2.5 py-1 rounded-sm">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm ${
                              order.status === 'OUT_FOR_DELIVERY'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : order.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-[#FAF7F2] text-[#8B5E3C] border border-[#DDD6C9]'
                            }`}
                          >
                            Stage {order.trackingStage}/6 • {order.status.replace(/_/g, ' ')}
                          </span>
                          {order.status === 'OUT_FOR_DELIVERY' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-amber-900">
                              <ShieldCheck className="w-3.5 h-3.5" /> Customer Cancel Locked
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-xl text-[#1C1917]">
                          {order.customerName} —{' '}
                          <span className="text-base font-sans font-normal text-[#57534E]">
                            {order.destination}
                          </span>
                        </h3>
                        <p className="text-xs text-[#57534E]">{order.itemsSummary}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                        <div className="text-left lg:text-right">
                          <p className="font-mono text-lg font-bold text-[#1C1917]">
                            ${order.totalAmountUsd.toLocaleString()}
                          </p>
                          <p className="text-[11px] font-mono text-[#1E392A]">
                            {formatInrAmount(order.totalAmountUsd)} INR
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] hover:bg-white border border-[#DDD6C9] hover:border-[#1E392A] text-[#1E392A] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View / Print Official Bill</span>
                        </button>
                      </div>
                    </div>

                    {/* Visual 6-stage progress strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {ORDER_STAGE_DEFINITIONS.map((st) => {
                        const completed = order.trackingStage >= st.stage;
                        const current = order.trackingStage === st.stage;
                        return (
                          <div
                            key={st.stage}
                            className={`px-2.5 py-2 rounded-sm border text-[11px] font-sans ${
                              current
                                ? 'bg-[#1E392A] border-[#1E392A] text-white font-semibold'
                                : completed
                                ? 'bg-[#F3EDE2] border-[#C9B39A] text-[#1C1917]'
                                : 'bg-[#FAF7F2] border-[#E7E0D3] text-[#78716C]'
                            }`}
                          >
                            <span className="font-mono text-[10px] block opacity-80">
                              STAGE {st.stage}
                            </span>
                            <span className="truncate block">{st.shortLabel}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive Tracking Update Form */}
                    {draft && (
                      <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        <div>
                          <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                            Update Stage (1-6)
                          </label>
                          <select
                            value={draft.status}
                            onChange={(e) =>
                              updateOrderDraftField(
                                order.id,
                                { status: e.target.value as OrderStatusType },
                                true
                              )
                            }
                            className="w-full px-2.5 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                          >
                            {ORDER_STAGE_DEFINITIONS.map((st) => (
                              <option key={st.status} value={st.status}>
                                {st.stage}. {st.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                            Courier Partner
                          </label>
                          <input
                            type="text"
                            value={draft.courierPartner}
                            onChange={(e) =>
                              updateOrderDraftField(order.id, { courierPartner: e.target.value })
                            }
                            className="w-full px-2.5 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                            Tracking Number
                          </label>
                          <input
                            type="text"
                            value={draft.trackingNumber}
                            onChange={(e) =>
                              updateOrderDraftField(order.id, { trackingNumber: e.target.value })
                            }
                            className="w-full px-2.5 py-2 text-xs font-mono bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                            Live Checkpoint & ETA
                          </label>
                          <input
                            type="text"
                            value={draft.currentCheckpoint}
                            onChange={(e) =>
                              updateOrderDraftField(order.id, { currentCheckpoint: e.target.value })
                            }
                            placeholder="e.g. Delhi Cargo Hub / ETA"
                            className="w-full px-2.5 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                          />
                        </div>

                        <div>
                          <button
                            onClick={() => handleSaveOrderTracking(order)}
                            disabled={savingOrderId === order.id}
                            className="w-full py-2.5 px-4 bg-[#1E392A] hover:bg-[#14281D] text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            {savingOrderId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" />
                            )}
                            <span>Update Live Tracking</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 5: CUSTOM, HOTEL & BULK INQUIRIES ================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="border-b border-[#E7E0D3] pb-4">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917]">
                Custom Commissions, Hotel & Trade Inquiries ({inquiries.length})
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                Inquiries submitted via Homepage Custom Quote Form and International Trade RFQ Portal appear here live.
              </p>
            </div>

            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white border border-[#E7E0D3] rounded-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#F3EDE2] text-[#8B5E3C] text-[10px] font-mono uppercase tracking-wider font-semibold rounded-sm">
                        {inq.requirementType}
                      </span>
                      <span className="text-[11px] font-mono text-[#78716C]">
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-[#1C1917]">{inq.customerName}</h3>
                    <p className="text-xs font-mono text-[#1E392A] font-medium">
                      Contact: {inq.contactInfo} • Scope: {inq.quantityOrScope}
                    </p>
                    <p className="text-sm text-[#44403C] bg-[#FAF7F2] border border-[#E7E0D3] p-3.5 rounded-sm leading-relaxed">
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 shrink-0">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-[#78716C] font-semibold">
                      Inquiry Stage
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { val: 'NEW', label: 'New' },
                          { val: 'REPLIED', label: 'Replied' },
                          { val: 'MEETING_SCHEDULED', label: 'Meeting Scheduled' },
                        ] as Array<{ val: InquiryStatus; label: string }>
                      ).map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => {
                            updateInquiryStatus(inq.id, opt.val);
                            showToast(`Marked inquiry from ${inq.customerName} as ${opt.label}.`);
                          }}
                          className={`px-3 py-1.5 text-[11px] font-sans font-semibold rounded-sm transition-colors ${
                            inq.status === opt.val
                              ? 'bg-[#1E392A] text-white'
                              : 'bg-[#FAF7F2] border border-[#DDD6C9] text-[#57534E] hover:border-[#8B5E3C]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="bg-white border border-[#E7E0D3] rounded-sm p-10 text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-[#8B5E3C] mx-auto" />
                  <p className="font-serif text-xl text-[#1C1917]">No Custom Inquiries Yet</p>
                  <p className="text-xs text-[#78716C]">
                    Submissions from the Custom Craftsmanship section and Hotel Trade Portal will stream here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: GST & INTERNATIONAL EXPORT TAX INVOICES ================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E0D3] pb-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917]">
                  Official GST & International Export Tax Invoices ({orders.length})
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  100% compliant export bills (Rule 96A LUT & DDP) and domestic Indian GST invoices with HSN 4420. View or print clean A4 tax receipts for any consignment.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search order, patron, firm or GST..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DDD6C9] rounded-sm outline-none focus:border-[#1E392A]"
                />
              </div>
            </div>

            {/* Invoices KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#78716C] font-semibold">Total Bills Logged</span>
                <p className="font-serif text-2xl text-[#1C1917]">{orders.length} Invoices</p>
                <p className="text-[11px] text-[#57534E]">Both Domestic & DDP International</p>
              </div>

              <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#78716C] font-semibold">HSN Code Standard</span>
                <p className="font-serif text-2xl text-[#1E392A]">HSN 4420</p>
                <p className="text-[11px] text-[#57534E]">Wood Marquetry, Turnings & Furniture</p>
              </div>

              <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#78716C] font-semibold">Export LUT Treatment</span>
                <p className="font-serif text-2xl text-[#8B5E3C]">0% IGST + DDP</p>
                <p className="text-[11px] text-[#57534E]">ARN-AD090326001928K</p>
              </div>

              <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#78716C] font-semibold">Domestic GST Rate</span>
                <p className="font-serif text-2xl text-[#1C1917]">12% GST</p>
                <p className="text-[11px] text-[#57534E]">CGST 6% + SGST 6% / IGST 12%</p>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white border border-[#E7E0D3] rounded-sm overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#FAF7F2] border-b border-[#E7E0D3] text-[#57534E] uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="p-3.5">Invoice No & Date</th>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Patron & Firm Name</th>
                      <th className="p-3.5">Destination</th>
                      <th className="p-3.5">Buyer GST / Tax ID</th>
                      <th className="p-3.5">Tax Classification</th>
                      <th className="p-3.5 text-right">Invoice Total</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0D3] text-[#1C1917]">
                    {orders
                      .filter((ord) => {
                        const q = invoiceSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          ord.orderNumber.toLowerCase().includes(q) ||
                          ord.customerName.toLowerCase().includes(q) ||
                          (ord.firmName && ord.firmName.toLowerCase().includes(q)) ||
                          (ord.gstNumber && ord.gstNumber.toLowerCase().includes(q)) ||
                          ord.destination.toLowerCase().includes(q)
                        );
                      })
                      .map((order) => {
                        const isDomestic =
                          order.currency === 'INR' ||
                          order.destination.toLowerCase().includes('india') ||
                          order.destination.toLowerCase().includes(', in');
                        const invNo = `INV-SA-2026-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '').slice(-6)}`;
                        const invDate = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Today';

                        return (
                          <tr key={order.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-[#1C1917] block">{invNo}</span>
                              <span className="text-[10px] text-[#78716C] block">{invDate}</span>
                            </td>

                            <td className="p-3.5 font-mono">
                              <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs font-semibold">
                                {order.orderNumber}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <p className="font-serif font-semibold text-[#1C1917]">{order.customerName}</p>
                              {order.firmName ? (
                                <p className="text-[11px] text-[#1E392A] font-medium">{order.firmName}</p>
                              ) : (
                                <span className="text-[10px] text-[#78716C] font-mono">Individual Patron</span>
                              )}
                            </td>

                            <td className="p-3.5 text-xs text-[#57534E] max-w-xs truncate">
                              {order.destination}
                            </td>

                            <td className="p-3.5 font-mono text-[11px]">
                              {order.gstNumber ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xs font-bold">
                                  {order.gstNumber}
                                </span>
                              ) : (
                                <span className="text-[#A8A29E]">Unregistered / B2C</span>
                              )}
                            </td>

                            <td className="p-3.5">
                              {isDomestic ? (
                                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-mono rounded-xs font-semibold">
                                  Domestic 12% GST
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-[#EAEFEA] text-[#1E392A] border border-[#1E392A]/30 text-[10px] font-mono rounded-xs font-semibold">
                                  Export 0% LUT + DDP
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-right font-mono">
                              <span className="font-bold text-[#1C1917] block">
                                {order.currency} {order.totalAmountUsd.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-[#8B5E3C] block">
                                {formatInrAmount(order.totalAmountUsd)} INR
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E392A] hover:bg-[#14281D] text-white text-[11px] font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                <Printer className="w-3 h-3" />
                                <span>View / Print</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official Tax & Export Invoice Preview / Print Modal */}
      {selectedInvoiceOrder && (
        <OfficialTaxInvoice
          order={selectedInvoiceOrder}
          isOpen={true}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
