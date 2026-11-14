'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useAtelier } from '@/context/AtelierContext';
import { CategoryMeta } from '@/types';

interface CategoryCoverDefinition {
  localUrl: string;
  cloudinaryFallback: string;
  siteAssetKey: string;
  title: string;
  subtitle: string;
  tag: string;
  woodType: string;
  href: string;
}

export const CATEGORY_COVER_MAP: Record<string, CategoryCoverDefinition> = {
  'solid-wooden-tiles': {
    localUrl: '/images/categories/solid-wooden-tiles.jpg?v=5',
    cloudinaryFallback:
      'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682446/sisodia-atelier/categories/solid-wooden-tiles.jpg',
    siteAssetKey: 'category_solid_wooden_tiles',
    title: 'Solid Wooden Tiles',
    subtitle: 'Hand-carved architectural Nagina relief tiles with interlocking tongue-and-groove',
    tag: 'PALATIAL SURFACE PANELING',
    woodType: 'Kiln-Dried Hardwoods',
    href: '/shop?category=Solid%20Wooden%20Tiles',
  },
  'urns-planters': {
    localUrl: '/images/categories/urns-planters.jpg?v=5',
    cloudinaryFallback:
      'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682454/sisodia-atelier/categories/urns-planters.jpg',
    siteAssetKey: 'category_urns_planters',
    title: 'Urns & Planters',
    subtitle: 'Single-trunk lathe-turned monolithic floor urns and solid heartwood planters',
    tag: 'MONOLITHIC LATHE TURNING',
    woodType: 'Reclaimed Burma Teak',
    href: '/shop?category=Urns%20%26%20Planters',
  },
  'bowls-vessels': {
    localUrl: '/images/categories/bowls-vessels.jpg?v=5',
    cloudinaryFallback:
      'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682458/sisodia-atelier/categories/bowls-vessels.jpg',
    siteAssetKey: 'category_bowls_vessels',
    title: 'Bowls & Vessels',
    subtitle: 'Ayurvedic Vijaysar water basins & deep rosewood centerpieces',
    tag: 'AYURVEDIC LIVING WOOD',
    woodType: 'Medicinal Vijaysar Heartwood',
    href: '/shop?category=Bowls%20%26%20Vessels',
  },
  'haveli-consoles': {
    localUrl: '/images/categories/haveli-consoles.jpg?v=5',
    cloudinaryFallback:
      'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682461/sisodia-atelier/categories/haveli-consoles.jpg',
    siteAssetKey: 'category_haveli_consoles',
    title: 'Haveli Consoles',
    subtitle: 'Royal jharokha screens & Mewar console tables carved with floral lattice',
    tag: 'NAGINA ARCHITECTURAL CARVING',
    woodType: 'Century-Old Heartwood',
    href: '/shop?category=Haveli%20Consoles',
  },
  'carved-trays-boards': {
    localUrl: '/images/categories/carved-trays-boards.jpg?v=5',
    cloudinaryFallback:
      'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682465/sisodia-atelier/categories/carved-trays-boards.jpg',
    siteAssetKey: 'category_carved_trays_boards',
    title: 'Carved Trays & Boards',
    subtitle: 'Food-safe walnut-oiled solid teak serving platters and relief boards',
    tag: 'CULINARY HEARTWOOD',
    woodType: 'Slow-Grown Sheesham',
    href: '/shop?category=Carved%20Trays%20%26%20Boards',
  },
  'hospitality-accents': {
    localUrl: '/images/categories/hospitality-accents.jpg?v=5',
    cloudinaryFallback:
      'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682470/sisodia-atelier/categories/hospitality-accents.jpg',
    siteAssetKey: 'category_hospitality_accents',
    title: 'Hospitality & Hotel Bulk Accents',
    subtitle: 'Custom contract suites, resort consoles, and turnkey heritage millwork',
    tag: 'Turnkey Contract Supply',
    woodType: 'Direct Yash Sisodia Desk',
    href: '/trade',
  },
};

export function CategoryRangeCarousel() {
  const { products, siteAssets } = useAtelier();

  // Strict binding: CategoryRangeCarousel always displays the authentic 6 fixed woodworking categories
  const categoryItems = useMemo<Array<CategoryMeta & { fallbackUrl: string }>>(() => {
    return Object.entries(CATEGORY_COVER_MAP).map(([id, def]) => {
      let count = '0 items';
      let matchingCount = 0;

      if (id === 'hospitality-accents') {
        count = 'Bespoke Trade Dossiers';
      } else {
        matchingCount = products.filter((p) => {
          const pCat = (p.category || '').toLowerCase().trim();
          const cTitle = def.title.toLowerCase().trim();
          return (
            pCat === cTitle ||
            pCat.includes(cTitle) ||
            cTitle.includes(pCat) ||
            (id === 'solid-wooden-tiles' && pCat.includes('tile'))
          );
        }).length;
        count = `${matchingCount} ${matchingCount === 1 ? 'item' : 'items'}`;
      }

      const dynamicFallback = siteAssets?.[def.siteAssetKey] || def.cloudinaryFallback;

      return {
        id,
        catKey: id,
        title: def.title,
        subtitle: def.subtitle,
        tag: def.tag,
        imageUrl: def.localUrl,
        fallbackUrl: dynamicFallback,
        woodType: def.woodType,
        count,
        productCount: matchingCount,
        href: def.href,
      };
    });
  }, [products, siteAssets]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update arrow availability
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition, { passive: true });
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Continuous auto-sweep interval (advances every 3200ms when not paused by user touch/hover)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const step = 340;

      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        // Loop back to start smoothly
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const step = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-[#FAF7F2] py-20 sm:py-28 border-b border-[#E7E0D3] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono tracking-[3px] uppercase text-[#8B5E3C] block mb-3 font-semibold">
              — CURATED PORTFOLIO —
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
              Explore Our Masterpiece Range
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#44403C] font-sans leading-relaxed">
              Click any category to explore authentic Nagina hand-turned and chiseled heirloom collections.
            </p>
          </div>

          {/* Navigation Controls & Status */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider mr-2 hidden sm:inline">
              Swipe or Click to Browse
            </span>
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous Category"
              className={`w-11 h-11 rounded-full border border-[#DDD6C9] flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'bg-white text-[#1C1917] hover:bg-[#1E392A] hover:text-white hover:border-[#1E392A] shadow-xs cursor-pointer'
                  : 'bg-[#F3EDE2] text-[#A8A29E] cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next Category"
              className={`w-11 h-11 rounded-full border border-[#DDD6C9] flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'bg-white text-[#1C1917] hover:bg-[#1E392A] hover:text-white hover:border-[#1E392A] shadow-xs cursor-pointer'
                  : 'bg-[#F3EDE2] text-[#A8A29E] cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Continuous Horizontal Row (Single line, scrollable / auto-sweep with manual drag support) */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoryItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 snap-start bg-white border border-[#E7E0D3] rounded-sm overflow-hidden shadow-xs hover:shadow-xl hover:border-[#1E392A] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F4EE]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      const fallback = (item as any).fallbackUrl;
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                  {/* Subtle Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badge: Piece Count & Tag */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-[#FAF7F2]/90 backdrop-blur-xs text-[#1C1917] text-[10px] font-mono uppercase tracking-wider rounded-xs border border-[#E7E0D3] shadow-xs font-semibold">
                      {item.count}
                    </span>
                    <span className="px-2.5 py-1 bg-[#1E392A]/90 backdrop-blur-xs text-white text-[9.5px] font-sans uppercase tracking-widest rounded-xs shadow-xs font-medium">
                      {item.tag}
                    </span>
                  </div>

                  {/* Bottom Image Sub-info */}
                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-[11px] font-sans font-light drop-shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#F1E8DC]" />
                    <span>{item.woodType}</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-6">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal leading-snug group-hover:text-[#1E392A] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#57534E] font-sans leading-relaxed line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-[#FBF9F5] border-t border-[#F3EDE2] flex items-center justify-between group-hover:bg-[#1E392A] transition-colors duration-300">
                <span className="text-[11px] font-sans uppercase tracking-[1.5px] font-semibold text-[#8B5E3C] group-hover:text-white transition-colors">
                  Explore Category
                </span>
                <div className="w-7 h-7 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center text-[#1C1917] group-hover:text-[#1E392A] transition-colors group-hover:translate-x-1 duration-200 shadow-2xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
