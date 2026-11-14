'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useAtelier } from '@/context/AtelierContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { SearchOverlayModal } from './SearchOverlayModal';
import { CustomerProfileModal } from '@/components/auth/CustomerProfileModal';
import {
  ShoppingBag,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  Package,
  LogOut,
  ArrowRight,
  Truck,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  // Optional navigation properties
}

export function Navbar(_props?: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { siteAssets } = useAtelier();
  const { selectedCountry, setSelectedCountry, availableCountries, countryConfig } = useCurrency();
  const { itemCount, setIsCartOpen } = useCart();
  const { customer, isLoggedIn, logoutCustomer, openAuthModal } = useCustomerAuth();

  const [hasMounted, setHasMounted] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const brandLogoUrl = siteAssets?.brand_logo || '/logo.jpeg?v=3';

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (pathname === '/') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#contact');
    }
  };

  return (
    <>
      {/* 1. Top Announcement & Currency Bar */}
      <div className="bg-[#FAF7F2] border-b border-[#E7E0D3] text-[#44403C] font-sans py-2 px-3 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Micro-banner with green pulse dot - strictly single line on mobile */}
          <div className="flex items-center gap-2 min-w-0 flex-1 whitespace-nowrap truncate text-[10px] sm:text-[11px] text-[#1C1917] tracking-[0.5px]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span className="whitespace-nowrap truncate font-semibold uppercase">
              PURE NAGINA SOLID WOOD • 100% INSURED DDP DELIVERY
            </span>
          </div>

          {/* Country & Currency Picker Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#F7F4EE] border border-[#DDD6C9] text-xs font-sans text-[#1C1917] hover:border-[#8B5E3C] transition-all cursor-pointer"
              aria-label="Select Country and Currency"
            >
              <span suppressHydrationWarning>{hasMounted ? countryConfig.flag : '🇺🇸'}</span>
              <span className="font-medium" suppressHydrationWarning>
                {hasMounted ? countryConfig.label : 'USA (USD $)'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
            </button>

            {isCurrencyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 max-h-80 overflow-y-auto bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#78716C] border-b border-[#E7E0D3] font-semibold flex items-center justify-between">
                  <span>Ship To / Currency</span>
                  <span className="text-[9px] text-[#1E392A] font-mono">100% DDP</span>
                </div>
                {availableCountries.map((c) => (
                  <button
                    key={c.countryCode}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      setSelectedCountry(c.countryCode);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-sans flex items-center justify-between hover:bg-[#F3EDE2] transition-colors cursor-pointer ${
                      selectedCountry === c.countryCode
                        ? 'text-[#1E392A] font-bold bg-[#F1E8DC]'
                        : 'text-[#1C1917]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span>{c.label}</span>
                    </span>
                    <span className="text-[#8B5E3C] font-mono text-[11px] font-semibold">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Header Navigation with 3-Group Desktop Separation */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7E0D3] transition-all">
        <div className="max-w-[1440px] mx-auto px-2.5 sm:px-6 lg:px-10 h-14 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-6 xl:gap-12">
          {/* GROUP 1: LEFT GROUP (Brand Identity) */}
          <div className="shrink-0 flex items-center gap-1.5 sm:gap-3 pr-1 sm:pr-4 min-w-0">
            <Link href="/" className="group flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#1E392A]/25 bg-[#F5EFE6] flex items-center justify-center shrink-0 shadow-2xs group-hover:border-[#8B5E3C] transition-all">
                <img
                  src={brandLogoUrl}
                  alt="SISODIA ATELIER ✧"
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <span className="font-serif uppercase text-[10px] sm:text-xs md:text-sm xl:text-lg tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.14em] text-[#1C1917] font-medium whitespace-nowrap">
                SISODIA ATELIER ✧
              </span>
            </Link>
          </div>

          {/* GROUP 2: CENTER GROUP (Navigation Links — xl: and up) */}
          <nav className="hidden xl:flex items-center justify-center gap-6 2xl:gap-8 mx-auto px-6 text-xs font-sans tracking-[1.5px] uppercase text-[#44403C]">
            <Link href="/" className="hover:text-[#1E392A] transition-colors font-medium whitespace-nowrap">
              HOME
            </Link>
            <Link href="/shop" className="hover:text-[#1E392A] transition-colors font-medium whitespace-nowrap">
              SHOP
            </Link>
            <Link href="/trade" className="hover:text-[#1E392A] transition-colors font-medium whitespace-nowrap">
              BULK/TRADE
            </Link>
            <Link href="/#purity-blueprint" className="hover:text-[#1E392A] transition-colors font-medium whitespace-nowrap">
              CRAFT & PURITY
            </Link>
            <a
              href="/#contact"
              onClick={handleContactClick}
              className="hover:text-[#1E392A] transition-colors font-medium cursor-pointer whitespace-nowrap"
            >
              CONTACT
            </a>
          </nav>

          {/* GROUP 3: RIGHT GROUP (Compressed Utility Cluster) */}
          <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 md:gap-2 pl-1 sm:pl-4">
            {/* 1. Search Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsSearchOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#44403C] hover:text-[#1E392A] transition-colors cursor-pointer shrink-0"
              aria-label="Search Collection"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
            </button>

            {/* 2. Truck Icon Button for Orders & Track */}
            {/* Mobile (< md): ONLY Delivery Truck icon */}
            <Link
              href="/orders"
              className="md:hidden w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-[#44403C] hover:text-[#1E392A] transition-colors cursor-pointer shrink-0"
              aria-label="Orders & Track Order"
              title="Orders & Live Consignment Tracking"
            >
              <Truck className="w-4 h-4 text-[#1C1917]" />
            </Link>

            {/* Desktop (md+): full ORDERS & TRACK pill */}
            <Link
              href="/orders"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full border border-[#1E392A]/25 bg-white/80 hover:bg-[#1E392A] hover:text-white transition whitespace-nowrap group shadow-2xs shrink-0"
              title="Orders & Live Consignment Tracking"
            >
              <Truck className="w-3 h-3 text-[#8B5E3C] group-hover:text-white transition-colors" />
              <span>Orders & Track</span>
            </Link>

            {/* 3. Mobile Login / Register Button (or Profile Icon when logged in) */}
            {!isLoggedIn ? (
              <>
                {/* Mobile (< md) button */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => openAuthModal()}
                  className="md:hidden px-2 py-1 text-[9px] font-semibold uppercase tracking-wide rounded-full border border-[#1E392A]/40 text-[#1C1917] hover:bg-[#1E392A] hover:text-white transition whitespace-nowrap shrink-0"
                >
                  Login / Register
                </button>

                {/* Desktop (md+) pill */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => openAuthModal()}
                  className="hidden md:inline-flex items-center px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full border border-[#1E392A]/35 text-[#1C1917] hover:bg-[#1E392A] hover:text-white transition whitespace-nowrap cursor-pointer shadow-2xs shrink-0"
                >
                  Login / Register
                </button>
              </>
            ) : (
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#1E392A]/35 bg-[#1E392A] text-[#FAF7F2] flex items-center justify-center shadow-2xs relative transition-all cursor-pointer shrink-0 hover:bg-[#162C20]"
                  aria-label="Customer Profile Menu"
                  title={customer?.name || 'Patron Profile'}
                >
                  <User className="w-4 h-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#FAF7F2]" />
                </button>

                {/* Customer Profile Dropdown / Popover */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-start gap-3 border-b border-[#E7E0D3] pb-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E392A] text-[#FAF7F2] flex items-center justify-center font-serif text-base font-semibold shrink-0 border border-[#1E392A]/35 shadow-xs">
                        {customer?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-sm font-semibold text-[#1C1917] truncate leading-tight">
                          {customer?.name}
                        </p>
                        <p className="text-[11px] text-[#57534E] truncate font-sans mt-0.5">
                          {customer?.email}
                        </p>
                        {customer?.phone && (
                          <p className="text-[10px] text-[#78716C] font-mono mt-0.5">
                            {customer.phone}
                          </p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#EAEFEA] text-[#1E392A] text-[9.5px] font-mono rounded-xs font-semibold">
                          {customer?.countryCode ? `${customer.countryCode} • ${customer.countryName || customer.country || 'USA'}` : (customer?.country || 'USA')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        href="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full py-2 px-3 bg-white hover:bg-[#1E392A] text-[#1C1917] hover:text-white border border-[#DDD6C9] hover:border-[#1E392A] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-between"
                      >
                        <span>My Orders & Live Tracking</span>
                        <Truck className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full py-2 px-3 bg-white hover:bg-[#F3EDE2] text-[#1C1917] border border-[#DDD6C9] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Saved Profile & Address</span>
                        <Settings className="w-3.5 h-3.5 text-[#78716C]" />
                      </button>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => {
                          logoutCustomer();
                          setIsProfileOpen(false);
                        }}
                        className="w-full py-2 px-3 bg-[#F7F4EE] hover:bg-red-50 text-red-700 hover:text-red-800 border border-[#DDD6C9] hover:border-red-200 text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Logout</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Cart Bag Icon Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsCartOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full relative flex items-center justify-center hover:bg-black/5 text-[#44403C] hover:text-[#1E392A] transition-colors cursor-pointer shrink-0"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#1E392A] text-white text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-sans">
                  {itemCount}
                </span>
              )}
            </button>

            {/* 5. Hamburger Menu (☰) Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#44403C] hover:text-[#1E392A] cursor-pointer shrink-0"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out / Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-[#FAF7F2] border-b border-[#E7E0D3] px-4 sm:px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            {/* Dedicated Easy-to-Tap Action Cards at the Top */}
            <div className="space-y-2.5 pb-3 border-b border-[#E7E0D3]">
              {/* Card 1: Orders & Track Order */}
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full p-3 bg-white border border-[#DDD6C9] hover:border-[#1E392A] rounded-sm flex items-center justify-between transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3EDE2] text-[#8B5E3C] group-hover:bg-[#1E392A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-xs uppercase tracking-wider text-[#1C1917] block">
                      Orders & Track Order
                    </span>
                    <span className="text-[10px] text-[#78716C] font-sans">
                      Live 6-stage telemetry & official invoices
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#1E392A] group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Card 2: Login / Register OR Customer Profile Card */}
              {!isLoggedIn ? (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full p-3 bg-[#1E392A] hover:bg-[#14281D] text-white rounded-sm flex items-center justify-between transition-colors cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-white/15 text-emerald-300 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-xs uppercase tracking-wider block">
                        Login / Register
                      </span>
                      <span className="text-[10px] text-emerald-200 font-sans">
                        Access personalized consignment radar
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              ) : (
                <div className="p-3.5 bg-white border border-[#DDD6C9] rounded-sm space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-2">
                    <div>
                      <span className="font-serif text-sm font-semibold text-[#1C1917] block">
                        {customer?.name}
                      </span>
                      <span className="text-[11px] text-[#57534E] font-sans block">
                        {customer?.email}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-[#EAEFEA] text-[#1E392A] rounded-xs font-semibold">
                      Active Patron
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#78716C] font-mono">
                      {customer?.phone || customer?.country || 'Verified'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        logoutCustomer();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs text-red-700 hover:text-red-900 font-sans font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Followed by Navigation Links */}
            <div className="space-y-3 pt-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs tracking-[1.5px] uppercase text-[#1C1917] hover:text-[#1E392A] font-medium py-1"
              >
                HOME
              </Link>
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs tracking-[1.5px] uppercase text-[#1C1917] hover:text-[#1E392A] font-medium py-1"
              >
                SHOP
              </Link>
              <Link
                href="/trade"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs tracking-[1.5px] uppercase text-[#1C1917] hover:text-[#1E392A] font-medium py-1"
              >
                BULK/TRADE
              </Link>
              <Link
                href="/#purity-blueprint"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs tracking-[1.5px] uppercase text-[#1C1917] hover:text-[#1E392A] font-medium py-1"
              >
                CRAFT & PURITY
              </Link>
              <a
                href="/#contact"
                onClick={handleContactClick}
                className="block text-xs tracking-[1.5px] uppercase text-[#1E392A] font-semibold py-1 cursor-pointer"
              >
                CONTACT
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Overlay Modal */}
      <SearchOverlayModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Customer Profile & Address Modal */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
