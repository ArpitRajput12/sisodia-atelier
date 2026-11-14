'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useAtelier } from '@/context/AtelierContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheck,
  ShoppingBag,
  Scale,
  Sparkles,
  Droplets,
  Check,
  Film,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductDetailViewProps {
  id: string;
}

export function ProductDetailView({ id }: ProductDetailViewProps) {
  const { formatPriceFromINR } = useCurrency();
  const { addItem, setIsCartOpen } = useCart();
  const { products } = useAtelier();

  const product =
    products.find((p) => p.id === id || p.slug === id) || products[0];

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);

  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'provenance' | 'ayurveda' | 'logistics'>('specs');

  // Build complete deduplicated media list (photos & videos)
  const mediaList = useMemo(() => {
    const list: Array<{ url: string; type: 'image' | 'video' }> = [];
    const seen = new Set<string>();

    const append = (url: string, type?: 'image' | 'video') => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      const isVideo =
        type === 'video' ||
        /\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(url) ||
        url.includes('/video/upload/');
      list.push({
        url,
        type: isVideo ? ('video' as const) : ('image' as const),
      });
    };

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => append(img, 'image'));
    }
    if (product.galleryMedia && Array.isArray(product.galleryMedia)) {
      product.galleryMedia.forEach((m) => append(m.url, m.type));
    }
    if (list.length === 0) {
      list.push({ url: '/logo.jpeg', type: 'image' });
    }
    return list;
  }, [product]);

  const currentMedia = mediaList[selectedMediaIndex] || mediaList[0] || { url: '/logo.jpeg', type: 'image' };

  const handlePrevMedia = () => {
    if (mediaList.length <= 1) return;
    setSelectedMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleNextMedia = () => {
    if (mediaList.length <= 1) return;
    setSelectedMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  // Touch swipe handlers (> 40px threshold)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentMedia.type === 'video') return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || currentMedia.type === 'video') return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (diff > 40) {
      handlePrevMedia();
    } else if (diff < -40) {
      handleNextMedia();
    }
    touchStartXRef.current = null;
  };

  // Mouse swipe handlers (> 40px threshold)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentMedia.type === 'video') return;
    mouseStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartXRef.current === null || currentMedia.type === 'video') return;
    const diff = e.clientX - mouseStartXRef.current;
    if (diff > 40) {
      handlePrevMedia();
    } else if (diff < -40) {
      handleNextMedia();
    }
    mouseStartXRef.current = null;
  };

  const handleAddToCart = () => {
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Path */}
        <nav className="flex items-center space-x-2 text-xs font-sans text-[#78716C] mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-[#1E392A] transition-colors">
            Atelier Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#1E392A] transition-colors">
            The Collection
          </Link>
          <span>/</span>
          <span className="text-[#8B5E3C] font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Real Product Image & Media Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Trait Header */}
            <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-3">
              <span className="text-xs font-serif italic text-[#1C1917]">
                {product.woodSpecies} • {product.origin || 'Nagina Atelier Floor'}
              </span>
              <div className="text-[11px] font-sans text-[#8B5E3C] flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single Solid Trunk Turning • Zero Plywood</span>
              </div>
            </div>

            {/* Main Media Stage: Flat Full-Frame Image with Horizontal Swipe / Swap */}
            <div className="relative bg-[#F7F4EE] border border-[#E7E0D3] rounded-sm overflow-hidden min-h-[480px] sm:min-h-[540px] flex items-center justify-center p-4 shadow-inner select-none group">
              {currentMedia.type === 'video' ? (
                <div className="w-full aspect-video rounded-sm overflow-hidden bg-black flex items-center justify-center">
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing"
                  title={mediaList.length > 1 ? 'Swipe horizontally or use arrows to view photos' : product.title}
                >
                  <img
                    src={currentMedia.url}
                    alt={product.title}
                    draggable={false}
                    className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-xl"
                  />
                </div>
              )}

              {/* Navigation Arrows (‹ / ›) when multiple photos exist */}
              {mediaList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMedia();
                    }}
                    aria-label="Previous Photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-[#1C1917] hover:text-white text-[#1C1917] border border-[#DDD6C9] flex items-center justify-center transition-all shadow-md z-10 text-xl font-serif"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMedia();
                    }}
                    aria-label="Next Photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-[#1C1917] hover:text-white text-[#1C1917] border border-[#DDD6C9] flex items-center justify-center transition-all shadow-md z-10 text-xl font-serif"
                  >
                    ›
                  </button>

                  {/* Photo Counter Badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono rounded-full font-medium pointer-events-none z-10">
                    {selectedMediaIndex + 1} / {mediaList.length}
                  </div>
                </>
              )}
            </div>

            {/* Gallery Media Thumbnail Strip (Photos & Videos) */}
            {mediaList.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-1">
                {mediaList.map((media, idx) => {
                  const isSelected = selectedMediaIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedMediaIndex(idx)}
                      className={`relative aspect-square rounded-sm overflow-hidden border transition-all ${
                        isSelected
                          ? 'border-[#1E392A] ring-2 ring-[#1E392A] shadow-xs'
                          : 'border-[#DDD6C9] opacity-75 hover:opacity-100 hover:border-[#8B5E3C]'
                      }`}
                    >
                      {media.type === 'video' ? (
                        <div className="w-full h-full bg-black relative flex items-center justify-center">
                          <video src={media.url} muted className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[9px] font-mono rounded flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5" /> VIDEO
                          </span>
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={`${product.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Title, Purity Badges, Pricing, CTAs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-[#F1E8DC] border border-[#E7E0D3] text-[#8B5E3C] text-[10px] font-sans tracking-[2px] uppercase rounded-sm font-semibold">
                  SKU: {product.sku}
                </span>
                <span className="px-2.5 py-1 bg-[#EAEFEA] border border-[#1E392A]/20 text-[#1E392A] text-[10px] font-sans tracking-[1.5px] uppercase rounded-sm font-semibold">
                  Zero Polyurethane Lacquer
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal leading-tight">
                {product.title}
              </h1>
              <p className="text-xs text-[#8B5E3C] font-sans tracking-wide mt-2 font-medium">
                {product.tagline}
              </p>
            </div>

            {/* DDP Pricing Callout Box */}
            <div className="p-5 bg-white border border-[#E7E0D3] rounded-sm space-y-3 shadow-xs">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-sans block">
                    Investment Value (All Import Duties Pre-Paid)
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-bold">
                    {formatPriceFromINR(product.basePriceInr || product.basePriceUsd * 84)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-[#EAEFEA] text-[#1E392A] text-[10px] font-sans font-bold uppercase rounded-sm">
                    DDP Guaranteed
                  </span>
                  <span className="block text-[11px] text-[#78716C] font-sans mt-0.5">
                    $0 Doorstep Tariffs
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm text-[11px] font-sans text-[#44403C] space-y-1.5">
                <div className="flex items-center gap-2 text-[#1E392A]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">100% Delivered Duty Paid Tariff Guarantee</span>
                </div>
                <p className="text-[#78716C] text-[10px] leading-relaxed">
                  We pre-clear all US, UK, EU, and UAE import customs, VAT, and CITES export forestry
                  permits before dispatch. You will never receive a secondary carrier bill.
                </p>
              </div>
            </div>

            {/* Timber Science Key Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              <div className="p-3 bg-white border border-[#E7E0D3] rounded-sm shadow-xs">
                <div className="flex items-center gap-1.5 text-[#8B5E3C] mb-1 font-semibold">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>7.2% Kiln Moisture</span>
                </div>
                <p className="text-[10px] text-[#78716C] leading-snug">
                  Desert-seasoned equilibrium. Zero radiator warping in winter lofts.
                </p>
              </div>

              <div className="p-3 bg-white border border-[#E7E0D3] rounded-sm shadow-xs">
                <div className="flex items-center gap-1.5 text-[#8B5E3C] mb-1 font-semibold">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{product.netWeightKg} kg Solid Core</span>
                </div>
                <p className="text-[10px] text-[#78716C] leading-snug">
                  100% unjoined heartwood. Zero plywood, particle board, or veneer.
                </p>
              </div>
            </div>

            {/* Primary & Secondary Call to Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-4 text-xs font-sans tracking-[2px] uppercase font-semibold rounded-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#1E392A] hover:bg-[#162C20] text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Allocated to Consignment Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add Solid Heartwood Piece to Bag
                  </>
                )}
              </button>
            </div>

            {/* Reassurance Checklist */}
            <div className="border-t border-[#E7E0D3] pt-4 space-y-2 text-[11px] font-sans text-[#44403C]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0" />
                <span>ISPM-15 Certified Cedar Vault Crating with 3-Axis Shock & Tilt Sensors</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0" />
                <span>Cold-Pressed Kashmiri Walnut Oil & Pure Desert Beeswax Hand-Burnish</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0" />
                <span>Transatlantic Air Cargo Transit via DHL Express with Real-Time Radar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive Tabs */}
        <section className="mt-20 border-t border-[#E7E0D3] pt-12">
          <div className="flex items-center gap-2 border-b border-[#E7E0D3] pb-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-5 py-2.5 text-xs font-sans tracking-[1.5px] uppercase rounded-sm transition-all whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'bg-[#1E392A] text-white font-semibold'
                  : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('provenance')}
              className={`px-5 py-2.5 text-xs font-sans tracking-[1.5px] uppercase rounded-sm transition-all whitespace-nowrap ${
                activeTab === 'provenance'
                  ? 'bg-[#1E392A] text-white font-semibold'
                  : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
              }`}
            >
              Provenance & Harvesting
            </button>
            <button
              onClick={() => setActiveTab('ayurveda')}
              className={`px-5 py-2.5 text-xs font-sans tracking-[1.5px] uppercase rounded-sm transition-all whitespace-nowrap ${
                activeTab === 'ayurveda'
                  ? 'bg-[#1E392A] text-white font-semibold'
                  : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
              }`}
            >
              Ayurvedic & Botanical Science
            </button>
            <button
              onClick={() => setActiveTab('logistics')}
              className={`px-5 py-2.5 text-xs font-sans tracking-[1.5px] uppercase rounded-sm transition-all whitespace-nowrap ${
                activeTab === 'logistics'
                  ? 'bg-[#1E392A] text-white font-semibold'
                  : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
              }`}
            >
              DDP White-Glove Logistics
            </button>
          </div>

          <div className="py-8 font-sans">
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                <div className="space-y-3 bg-white p-6 border border-[#E7E0D3] rounded-sm">
                  <h4 className="font-serif text-lg text-[#1C1917] font-semibold border-b border-[#E7E0D3] pb-2">
                    Physical Dimensions & Mass
                  </h4>
                  <div className="flex justify-between py-1.5 border-b border-[#F7F4EE]">
                    <span className="text-[#78716C]">Length × Width × Height</span>
                    <span className="font-mono text-[#1C1917]">
                      {product.dimensionsCm.length} × {product.dimensionsCm.width} × {product.dimensionsCm.height} cm
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F7F4EE]">
                    <span className="text-[#78716C]">Net Solid Heartwood Mass</span>
                    <span className="font-mono text-[#1C1917] font-semibold">{product.netWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F7F4EE]">
                    <span className="text-[#78716C]">Core Moisture Content</span>
                    <span className="font-mono text-[#1E392A] font-semibold">7.2% Calibrated (Wagner Meter)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#78716C]">Joinery Construction</span>
                    <span className="text-[#1C1917]">100% Monolithic Uncut Trunk</span>
                  </div>
                </div>

                <div className="space-y-3 bg-white p-6 border border-[#E7E0D3] rounded-sm">
                  <h4 className="font-serif text-lg text-[#1C1917] font-semibold border-b border-[#E7E0D3] pb-2">
                    Finishing & Botanical Integrity
                  </h4>
                  <div className="flex justify-between py-1.5 border-b border-[#F7F4EE]">
                    <span className="text-[#78716C]">Surface Sealant</span>
                    <span className="text-[#1C1917]">{product.finishType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F7F4EE]">
                    <span className="text-[#78716C]">Polyurethane / Lacquer</span>
                    <span className="font-mono text-[#1E392A] font-semibold">0% (Completely Non-Toxic)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F7F4EE]">
                    <span className="text-[#78716C]">Food Contact Safety</span>
                    <span className="text-[#1C1917]">100% Certified Edible Organic Oils</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#78716C]">Lead Time to Export</span>
                    <span className="font-mono text-[#1C1917]">
                      {product.isMadeToOrder ? `${product.leadTimeWeeks} Weeks Turning` : 'Immediate Air Dispatch'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'provenance' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-serif text-2xl text-[#1C1917] font-normal">
                  Harvest Provenance & Lathe Monolith
                </h3>
                <p className="text-sm text-[#44403C] font-serif leading-relaxed">
                  {product.provenanceStory ||
                    'Sourced strictly from naturally fallen mature timber in state-regulated forestry zones. Before the gouge chisel touches the bark, the raw bole is kiln-aged across seasonal Thar desert temperature swings to release internal cellular stress.'}
                </p>
                <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm">
                  <span className="text-xs uppercase font-sans tracking-wider text-[#8B5E3C] block font-semibold mb-1">
                    Special Atelier Trait
                  </span>
                  <p className="text-xs text-[#1C1917] font-sans">{product.specialTrait}</p>
                </div>
              </div>
            )}

            {activeTab === 'ayurveda' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-serif text-2xl text-[#1C1917] font-normal">
                  Ayurvedic Chemistry of Living Heartwood
                </h3>
                <p className="text-sm text-[#44403C] font-serif leading-relaxed">
                  {product.ayurvedicProperties ||
                    'Teak heartwood possesses high natural concentrations of tectoquinone and silica, naturally repelling pests and moisture without the need for toxic insecticides or synthetic primers.'}
                </p>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-serif text-2xl text-[#1C1917] font-normal">
                  Delivered Duty Paid (DDP) Sovereign Transit
                </h3>
                <p className="text-sm text-[#44403C] font-serif leading-relaxed">
                  Exporting heavy heirloom solid wood across international frontiers requires absolute compliance with timber phytosanitary protocols. SISODIA ATELIER ✧ manages 100% of the logistics burden on behalf of our patrons.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
