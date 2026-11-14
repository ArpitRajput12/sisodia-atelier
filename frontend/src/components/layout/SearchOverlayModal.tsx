'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAtelier } from '@/context/AtelierContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Search, X, ArrowUpRight, Sparkles } from 'lucide-react';

interface SearchOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlayModal({ isOpen, onClose }: SearchOverlayModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPriceFromINR } = useCurrency();
  const { products } = useAtelier();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.woodSpecies.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.room?.toLowerCase().includes(q) ||
        p.specialTrait.toLowerCase().includes(q)
    );
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E7E0D3] flex items-center gap-3 bg-[#F7F4EE]">
          <Search className="w-5 h-5 text-[#8B5E3C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by timber (Teak, Vijaysar, Sheesham), dimension, or room..."
            className="w-full bg-transparent text-sm sm:text-base text-[#1C1917] placeholder:text-[#78716C] outline-none font-sans"
            suppressHydrationWarning
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#78716C] hover:text-[#1C1917] p-1"
              suppressHydrationWarning
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-sans font-medium text-[#78716C] hover:text-[#1C1917] ml-2 px-2 py-1 border border-[#DDD6C9] rounded-sm"
            suppressHydrationWarning
          >
            Esc
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-3">
          {query.trim() === '' ? (
            <div className="py-8 text-center">
              <p className="text-xs font-sans uppercase tracking-[2px] text-[#8B5E3C] mb-2 font-semibold">
                Curated Atelier Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mt-3">
                {['Burma Teak', 'Vijaysar Heartwood', 'Living Room Urn', 'Haveli Console', 'Desert Sheesham'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-[#F3EDE2] hover:bg-[#F1E8DC] text-[#1C1917] text-xs font-sans rounded-sm border border-[#E7E0D3] transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#78716C] font-sans">
              <p className="font-serif text-lg text-[#1C1917] mb-1">No Heirloom Masterworks Found</p>
              <p className="text-xs">
                No pieces match &ldquo;{query}&rdquo;. Try searching for &ldquo;Teak&rdquo; or &ldquo;Urn&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-sans uppercase tracking-wider text-[#78716C] px-1 mb-2">
                Found {results.length} Masterpiece{results.length > 1 ? 's' : ''}
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 bg-white hover:bg-[#F7F4EE] border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm transition-all group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-14 h-14 object-cover rounded-sm border border-[#E7E0D3] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-sans uppercase tracking-wider text-[#8B5E3C] font-medium">
                        {product.woodSpecies.split('(')[0]}
                      </span>
                      <span className="text-[10px] text-[#78716C]">• {product.category}</span>
                    </div>
                    <h4 className="font-serif text-sm sm:text-base text-[#1C1917] group-hover:text-[#1E392A] font-medium truncate">
                      {product.title}
                    </h4>
                    <p className="text-[11px] text-[#78716C] font-sans truncate">
                      {product.dimensionsCm.length} × {product.dimensionsCm.width} × {product.dimensionsCm.height} cm • {product.netWeightKg} kg
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif text-sm font-semibold text-[#1C1917] block">
                      {formatPriceFromINR(product.basePriceInr || product.basePriceUsd * 84)}
                    </span>
                    <span className="text-[10px] font-sans text-emerald-800 bg-[#EAEFEA] px-1.5 py-0.5 rounded-sm">
                      DDP $0
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#8B5E3C] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F3EDE2] border-t border-[#E7E0D3] px-5 flex justify-between items-center text-[11px] font-sans text-[#78716C]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A37836]" />
            100% Monolithic Solid Wood • 7.2% Desert Equilibrium
          </span>
          <Link
            href="/shop"
            onClick={onClose}
            className="text-[#1E392A] font-medium hover:underline flex items-center gap-1"
          >
            View All Collection &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

