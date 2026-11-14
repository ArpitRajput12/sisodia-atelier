'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtelier } from '@/context/AtelierContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ChevronLeft, ChevronRight, ShieldCheck, Star } from 'lucide-react';

export function SerpentineCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const { formatPriceFromINR } = useCurrency();
  const { featuredProducts } = useAtelier();
  const products = featuredProducts;
  const count = products.length;

  useEffect(() => {
    if (count > 0 && activeIndex >= count) {
      setActiveIndex(0);
    }
  }, [count, activeIndex]);

  const handlePrev = () => {
    if (count === 0) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = () => {
    if (count === 0) return;
    setActiveIndex((prev) => (prev + 1) % count);
  };

  // Autoplay timer with pause on hover / touch (2800ms per slide)
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPaused, count]);

  return (
    <section className="bg-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Carousel Header */}
        <div className="flex items-center justify-between mb-12 border-b border-[#E7E0D3] pb-5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#8B5E3C]" />
            <h2 className="font-sans text-xs uppercase tracking-[3px] text-[#8B5E3C] font-semibold">
              FEATURED MASTERWORKS CAROUSEL
            </h2>
          </div>

          {/* Navigation Controls (< and >) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-sm bg-white hover:bg-[#1E392A] text-[#1C1917] hover:text-white border border-[#E7E0D3] hover:border-[#1E392A] transition-all flex items-center justify-center shadow-xs"
              aria-label="Previous Masterwork"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-sm bg-white hover:bg-[#1E392A] text-[#1C1917] hover:text-white border border-[#E7E0D3] hover:border-[#1E392A] transition-all flex items-center justify-center shadow-xs"
              aria-label="Next Masterwork"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Serpentine Depth Stage */}
        {count === 0 ? (
          <div className="bg-white border border-[#E7E0D3] rounded-sm p-12 text-center">
            <Star className="w-8 h-8 text-[#A37836] mx-auto mb-3" />
            <h3 className="font-serif text-xl text-[#1C1917] mb-1">
              Featured Gallery Awaiting Owner Curation
            </h3>
            <p className="text-xs text-[#78716C] font-sans">
              Star any heirloom piece inside Yash Sisodia’s Owner Portal to feature it here.
            </p>
          </div>
        ) : (
        <div
          className="relative h-[480px] sm:h-[520px] flex items-center justify-center perspective-[1200px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center preserve-3d">
            {products.map((product, idx) => {
              // Calculate shortest cyclic offset
              let offset = idx - activeIndex;
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;

              const absOffset = Math.abs(offset);
              const isVisible = absOffset <= 2.5;

              if (!isVisible) return null;

              const isCenter = offset === 0;

              // 3D serpentine depth coordinates
              const translateX = offset * 240;
              const translateZ = isCenter ? 80 : -140 * absOffset;
              const rotateY = -offset * 20;
              const scale = isCenter ? 1.15 : Math.max(0.72, 0.82 - (absOffset - 1) * 0.1);
              const opacity = isCenter ? 1 : absOffset === 1 ? 0.65 : 0.35;
              const zIndex = isCenter ? 40 : 30 - Math.round(absOffset * 10);

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (isCenter) {
                      router.push(`/products/${product.id}`);
                    } else {
                      setActiveIndex(idx);
                    }
                  }}
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: 'all 600ms cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                  className={`absolute w-[270px] aspect-[3/4] bg-white border border-[#E7E0D3] rounded-sm overflow-hidden flex flex-col justify-between shadow-lg cursor-pointer group ${
                    isCenter ? 'ring-1 ring-[#8B5E3C]/30 shadow-2xl' : 'hover:opacity-85'
                  }`}
                >
                  {/* Timber Photograph (68% height) */}
                  <div className="relative h-[68%] w-full overflow-hidden bg-[#F7F4EE]">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* DDP $0 Doorstep Green Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-[#EAEFEA] text-[#1E392A] border border-[#1E392A]/20 px-2 py-0.5 text-[9px] font-sans font-bold uppercase rounded-sm flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-[#1E392A]" />
                      <span>DDP $0 Doorstep</span>
                    </div>

                    {/* Origin / Seasoning */}
                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#8B5E3C] px-2 py-0.5 text-[9px] font-sans font-medium uppercase tracking-wider border border-[#E7E0D3] rounded-sm">
                      {product.woodSpecies.split('(')[0]}
                    </div>
                  </div>

                  {/* Card Content & Valuation */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#78716C] font-sans mb-0.5">
                        {product.room || product.category}
                      </div>
                      <h3 className="font-serif text-sm sm:text-base text-[#1C1917] font-medium leading-snug line-clamp-1 group-hover:text-[#1E392A] transition-colors">
                        {product.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#F3EDE2] pt-2 mt-2">
                      <div>
                        <span className="text-[9px] text-[#78716C] uppercase tracking-wider block font-sans">
                          Delivered Value
                        </span>
                        <span className="font-serif text-base font-semibold text-[#1C1917]">
                          {formatPriceFromINR(product.basePriceInr || product.basePriceUsd * 84)}
                        </span>
                      </div>

                      <span className="text-[10px] font-sans uppercase tracking-wider text-[#8B5E3C] group-hover:text-[#1E392A] font-semibold underline decoration-[#DDD6C9]">
                        {isCenter ? 'Inspect →' : 'View'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

