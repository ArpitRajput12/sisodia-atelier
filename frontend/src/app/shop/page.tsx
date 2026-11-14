'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAtelier } from '@/context/AtelierContext';
import { slugifyCategory } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { ProductItem } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CraftsmanChatWidget } from '@/components/chat/CraftsmanChatWidget';
import {
  Search,
  Filter,
  ShoppingBag,
  Check,
  Sparkles,
  ShieldCheck,
  Scale,
  X,
  SlidersHorizontal,
} from 'lucide-react';

type FilterMode = 'rooms' | 'categories';

const ROOM_PILLS = [
  'All Rooms',
  'Living Room',
  'Kitchen & Dining',
  'Botanical / Balcony',
  'Architectural Wall',
];

const CATEGORY_PILLS = [
  'All Categories',
  'Solid Wooden Tiles',
  'Urns & Planters',
  'Bowls & Vessels',
  'Haveli Consoles',
  'Carved Trays & Boards',
];

export default function ShopPage() {
  const { products, categories } = useAtelier();
  const { formatPriceFromINR } = useCurrency();
  const { addItem } = useCart();

  const categoryPills = useMemo(
    () => ['All Categories', ...categories.map((cat) => cat.title)],
    [categories]
  );

  // Mode and Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>('categories');
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'weight'>('featured');

  // Sync category param from URL query if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) {
        const CATEGORY_MAP: Record<string, string> = {
          urns: 'Urns & Planters',
          consoles: 'Haveli Consoles',
          trays: 'Carved Trays & Boards',
          bowls: 'Bowls & Vessels',
          tiles: 'Solid Wooden Tiles',
          'solid wooden tiles': 'Solid Wooden Tiles',
          'solid-wooden-tiles': 'Solid Wooden Tiles',
          'solid wooden tiles (wall & floor)': 'Solid Wooden Tiles',
          'urns & planters': 'Urns & Planters',
          'urns-planters': 'Urns & Planters',
          'carved trays & boards': 'Carved Trays & Boards',
          'carved-trays-boards': 'Carved Trays & Boards',
          'bowls & vessels': 'Bowls & Vessels',
          'bowls-vessels': 'Bowls & Vessels',
          'haveli consoles': 'Haveli Consoles',
          'haveli-consoles': 'Haveli Consoles',
        };
        const normalizedParam = catParam.toLowerCase();
        const dynamicMatch = categories.find(
          (cat) =>
            cat.catKey === normalizedParam ||
            slugifyCategory(cat.title) === normalizedParam ||
            cat.title.toLowerCase() === normalizedParam
        );
        const targetCategory = CATEGORY_MAP[normalizedParam] || dynamicMatch?.title;
        if (targetCategory) {
          setFilterMode('categories');
          setSelectedCategory(targetCategory);
        }
      }
    }
  }, [categories]);

  // UI state
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Filter logic
  const filteredProducts = useMemo(() => {
    const selectedCategorySlug = slugifyCategory(selectedCategory);
    return products.filter((product) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          product.title.toLowerCase().includes(q) ||
          product.woodSpecies.toLowerCase().includes(q) ||
          product.shortDescription.toLowerCase().includes(q) ||
          product.origin?.toLowerCase().includes(q) ||
          product.specialTrait.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Mode Pill Filter
      if (filterMode === 'rooms') {
        if (selectedRoom !== 'All Rooms' && product.room !== selectedRoom) {
          return false;
        }
      } else {
        const prodCat = (product.category || '').toLowerCase().trim();
        const selCat = selectedCategory.toLowerCase().trim();
        if (
          selectedCategory !== 'All Categories' &&
          product.category !== selectedCategory &&
          prodCat !== selCat &&
          !prodCat.includes(selCat) &&
          !selCat.includes(prodCat) &&
          slugifyCategory(product.catKey || product.category) !== selectedCategorySlug
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePriceUsd - b.basePriceUsd;
      if (sortBy === 'price-desc') return b.basePriceUsd - a.basePriceUsd;
      if (sortBy === 'weight') return b.netWeightKg - a.netWeightKg;
      return 0;
    });
  }, [products, filterMode, selectedRoom, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: ProductItem) => {
    addItem(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  const resetFilters = () => {
    setSelectedRoom('All Rooms');
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setSortBy('featured');
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    (filterMode === 'rooms' && selectedRoom !== 'All Rooms') ||
    (filterMode === 'categories' && selectedCategory !== 'All Categories') ||
    sortBy !== 'featured';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-sans text-[#78716C] mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-[#1E392A] transition-colors">
            Atelier Home
          </Link>
          <span>/</span>
          <span className="text-[#8B5E3C] font-semibold">The Collection</span>
        </nav>

        {/* Editorial Header */}
        <header className="mb-12 border-b border-[#E7E0D3] pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F1E8DC] border border-[#E7E0D3] text-[#8B5E3C] text-[11px] font-sans tracking-[2px] uppercase mb-4 rounded-full font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Monolithic Solid Heartwood</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal tracking-tight leading-tight">
                Shop — The Collection
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#44403C] font-sans leading-relaxed">
                Solid wood, slow-grown and hand-shaped in Nagina, India. Browse by room or by
                category. Certified 7.2% desert-kiln equilibrium and delivered duty paid to your estate.
              </p>
            </div>

            {/* Live Stats Pill */}
            <div className="bg-white border border-[#E7E0D3] p-4 rounded-sm font-sans text-xs space-y-1 shadow-xs">
              <div className="text-[#1C1917] font-serif text-xl font-bold">
                {filteredProducts.length} Monolithic Masterpieces
              </div>
              <div className="text-[#78716C] text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E392A]" />
                DDP Zero-Tariff Export Guarantee
              </div>
            </div>
          </div>
        </header>

        {/* Filter Controls & Dual-Pill Selector */}
        <section className="mb-10 space-y-6">
          {/* Top Bar: Search, Dual Mode Toggle & Sort */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#F7F4EE] p-4 border border-[#E7E0D3] rounded-sm">
            {/* Live Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by timber, dimension, or artisan technique..."
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#8B5E3C] text-xs text-[#1C1917] pl-10 pr-9 py-2.5 rounded-sm outline-none font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dual Mode Switcher (Rooms vs Categories) */}
            <div className="flex items-center gap-1 bg-white p-1 border border-[#DDD6C9] rounded-sm self-start lg:self-auto">
              <button
                onClick={() => setFilterMode('categories')}
                className={`px-4 py-2 text-xs font-sans tracking-[1.5px] uppercase rounded-sm transition-all ${
                  filterMode === 'categories'
                    ? 'bg-[#1E392A] text-white font-semibold shadow-xs'
                    : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                Browse Categories
              </button>
              <button
                onClick={() => setFilterMode('rooms')}
                className={`px-4 py-2 text-xs font-sans tracking-[1.5px] uppercase rounded-sm transition-all ${
                  filterMode === 'rooms'
                    ? 'bg-[#1E392A] text-white font-semibold shadow-xs'
                    : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                Browse Rooms
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#78716C]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-[#DDD6C9] text-[#1C1917] text-xs px-3 py-2 rounded-sm outline-none font-sans"
              >
                <option value="featured">Sort: Atelier Curated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="weight">Heartwood Density (Weight)</option>
              </select>
            </div>
          </div>

          {/* Active Sub-Pills Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {filterMode === 'categories' ? (
                categoryPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setSelectedCategory(pill)}
                    className={`px-4 py-2 text-xs font-sans tracking-wider uppercase rounded-sm transition-all whitespace-nowrap ${
                      selectedCategory === pill
                        ? 'bg-[#1E392A] text-white font-semibold'
                        : 'bg-white border border-[#E7E0D3] text-[#44403C] hover:border-[#8B5E3C] hover:text-[#1C1917]'
                    }`}
                  >
                    {pill}
                  </button>
                ))
              ) : (
                ROOM_PILLS.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setSelectedRoom(pill)}
                    className={`px-4 py-2 text-xs font-sans tracking-wider uppercase rounded-sm transition-all whitespace-nowrap ${
                      selectedRoom === pill
                        ? 'bg-[#1E392A] text-white font-semibold'
                        : 'bg-white border border-[#E7E0D3] text-[#44403C] hover:border-[#8B5E3C] hover:text-[#1C1917]'
                    }`}
                  >
                    {pill}
                  </button>
                ))
              )}
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#8B5E3C] hover:underline font-sans font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </section>

        {/* 4-Column Responsive Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white border border-[#E7E0D3] rounded-sm">
            <Filter className="w-12 h-12 mx-auto mb-4 text-[#DDD6C9] stroke-1" />
            <h3 className="font-serif text-2xl text-[#1C1917]">No Masterpieces Found</h3>
            <p className="text-xs text-[#78716C] font-sans mt-2 max-w-sm mx-auto">
              No solid wood pieces match your current filter parameters. Try clearing your search or
              exploring another category.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-2.5 bg-[#1E392A] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-sm hover:bg-[#162C20]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isAdded = addedProductId === product.id;
              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Masterpiece Photo & Badges */}
                    <div className="relative h-64 w-full overflow-hidden bg-[#F7F4EE]">
                      <Link href={`/products/${product.id}`} className="block w-full h-full">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </Link>

                      {/* Origin Tag */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 text-[9px] font-sans tracking-widest text-[#8B5E3C] border border-[#E7E0D3] uppercase font-semibold">
                        {product.origin || 'Nagina Atelier'}
                      </div>

                      {/* Seasoning Badge */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[9px] font-sans tracking-wider text-[#44403C] border border-[#E7E0D3]">
                        {product.timberSeasoning || '7.2% Desert-Cured'}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[10px] font-sans text-[#78716C] uppercase tracking-widest mb-1.5 font-medium">
                        <span>{product.category}</span>
                        {product.room && <span className="text-[#8B5E3C]">{product.room}</span>}
                      </div>

                      <Link href={`/products/${product.id}`} className="block group-hover:text-[#1E392A] transition-colors">
                        <h3 className="font-serif text-lg text-[#1C1917] font-semibold leading-snug line-clamp-1 mb-1">
                          {product.title}
                        </h3>
                      </Link>

                      <p className="text-[11px] text-[#8B5E3C] font-sans mb-3 line-clamp-1 font-medium">
                        {product.woodSpecies}
                      </p>

                      <p className="text-xs text-[#44403C] font-sans leading-relaxed line-clamp-2 mb-4">
                        {product.shortDescription}
                      </p>

                      {/* Dimensions & Weight Metric */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-[#78716C] border-t border-[#F3EDE2] pt-3">
                        <div className="truncate">
                          {product.dimensionsCm.length} × {product.dimensionsCm.width} × {product.dimensionsCm.height} cm
                        </div>
                        <div className="flex items-center gap-1 justify-end text-[#1C1917] font-medium">
                          <Scale className="w-3 h-3 text-[#8B5E3C]" />
                          <span>{product.netWeightKg} kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add to Consignment Action */}
                  <div className="p-5 pt-0 border-t border-[#F3EDE2] mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#78716C] block font-sans">
                        DDP Investment
                      </span>
                      <span className="font-serif text-xl text-[#1C1917] font-bold">
                        {formatPriceFromINR(product.basePriceInr || product.basePriceUsd * 84)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`px-3.5 py-2 rounded-sm text-[11px] font-sans tracking-[1px] uppercase transition-all duration-300 flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-[#1E392A] hover:bg-[#162C20] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Acquire
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CraftsmanChatWidget />
      <Footer />
    </div>
  );
}
