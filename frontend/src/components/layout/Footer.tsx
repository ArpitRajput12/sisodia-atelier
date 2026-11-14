'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAtelier } from '@/context/AtelierContext';
import { FounderBackofficeModal } from './FounderBackofficeModal';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Lock,
  Box,
  Droplets,
  Plane,
} from 'lucide-react';

export function Footer() {
  const { siteAssets } = useAtelier();
  const [isBackofficeOpen, setIsBackofficeOpen] = useState(false);

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E7E0D3] text-[#44403C] font-sans text-xs">
      {/* Serviceable Regions Worldwide DDP Bar */}
      <div className="bg-[#1E392A] text-[#FAF7F2] py-3 px-4 text-center text-[10px] sm:text-xs font-sans tracking-[1px] uppercase font-semibold">
        SHIPPING DDP WORLDWIDE: USA • UK • EUROPE • AUSTRALIA • DUBAI • NETHERLANDS • GERMANY • CANADA • FRANCE • MEXICO • UAE
      </div>

      {/* Upper Atelier Hallmark Band */}
      <div className="border-b border-[#E7E0D3] py-12 px-4 sm:px-6 lg:px-8 bg-[#F7F4EE]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-[#1C1917] text-lg font-semibold">100% Solid Heartwood</span>
            <p className="text-[11px] text-[#78716C] max-w-xs">
              Single-trunk turning with traditional joinery. Zero plywood, zero veneer, zero MDF.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-[#1C1917] text-lg font-semibold">7.2% Desert Equilibrium</span>
            <p className="text-[11px] text-[#78716C] max-w-xs">
              Solar-kilned in Thar Desert winds. Permanently immune to Western radiator cracking.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-[#1C1917] text-lg font-semibold">100% DDP Global Export</span>
            <p className="text-[11px] text-[#78716C] max-w-xs">
              All import duties, foreign tariffs, and port taxes pre-paid for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico & UAE.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-[#1C1917] text-lg font-semibold">Fumigated Cedar Vaults</span>
            <p className="text-[11px] text-[#78716C] max-w-xs">
              ISPM-15 certified with 3-axis calibrated shock and tilt transit accountability sensors.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Heritage Info */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#1E392A]/25 bg-[#F5EFE6] flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src={siteAssets?.brand_logo || '/logo.jpeg?v=3'}
                alt="SISODIA ATELIER ✧"
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <span className="font-serif tracking-wide uppercase text-xl sm:text-2xl text-[#1C1917] font-medium">
              SISODIA ATELIER ✧
            </span>
          </Link>
          <p className="text-[11px] text-[#44403C] leading-relaxed font-light">
            An ultra-luxury handicraft atelier preserving living generations of royal fine wood sculpting and architectural wooden tiles. Providing bespoke monolithic heirlooms to discerning patrons worldwide.
          </p>
          <div className="pt-2">
            <Link
              href="/trade"
              className="text-xs text-[#1E392A] font-semibold hover:underline flex items-center gap-1.5"
            >
              <span>Custom Commissions & Inquiries &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Guild Locations */}
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-[#8B5E3C] uppercase tracking-[2px] block">
            Atelier Guilds & Direct Desk
          </span>
          <div className="space-y-2 text-[#44403C] text-[11px] leading-relaxed">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
              <span>Nagina Woodcraft Guild Quarter, Bijnor 246762, India</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
              <span>Nagina Master Woodcarving & Wooden Tiles Centre, Bijnor 246762, India</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Mail className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
              <a href="mailto:Sisodiaatelier09@gmail.com" className="hover:text-[#1E392A] transition-colors">
                Sisodiaatelier09@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
              <a href="tel:+918868031460" className="hover:text-[#1E392A] transition-colors">
                +91 8868031460
              </a>
              <span className="text-[#A8A29E]">•</span>
              <a href="https://wa.me/918868031460" target="_blank" rel="noopener noreferrer" className="text-[#1E392A] font-semibold hover:underline">
                WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <a
                href="https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E392A] font-medium hover:underline"
              >
                Instagram
              </a>
              <span className="text-[#A8A29E]">•</span>
              <a
                href="https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E392A] font-medium hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Patron Navigation */}
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-[#8B5E3C] uppercase tracking-[2px] block">
            Patron Services
          </span>
          <ul className="space-y-2 text-[11px] text-[#44403C]">
            <li>
              <Link href="/shop" className="hover:text-[#1E392A] transition-colors">
                The Collection (Shop)
              </Link>
            </li>
            <li>
              <Link href="/trade" className="hover:text-[#1E392A] transition-colors">
                International Bulk / Trade Program
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-[#1E392A] transition-colors">
                Consignment Tracking Radar
              </Link>
            </li>
            <li>
              <Link href="/#purity-blueprint" className="hover:text-[#1E392A] transition-colors">
                Purity Blueprint & 360° Wood Grain
              </Link>
            </li>
            <li>
              <Link href="/#trust-proof" className="hover:text-[#1E392A] transition-colors">
                7.2% Moisture & Safe Delivery Proof
              </Link>
            </li>
            <li>
              <Link href="/trade" className="hover:text-[#1E392A] transition-colors">
                Bespoke & Bulk Order Inquiries
              </Link>
            </li>
          </ul>
        </div>

        {/* Private Salon Newsletter */}
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-[#8B5E3C] uppercase tracking-[2px] block">
            Private Salon Gazettes
          </span>
          <p className="text-[11px] text-[#44403C] leading-relaxed font-light">
            Receive private releases of aged single-trunk timber blanks and seasonal master carving consignments.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to the SISODIA ATELIER ✧ Gazette.');
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              required
              placeholder="patron@estate.com"
              className="bg-white border border-[#DDD6C9] text-[#1C1917] text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B5E3C] w-full"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#1E392A] text-white font-semibold text-xs uppercase tracking-wider rounded-sm hover:bg-[#162C20] transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Legal & Discreet Founder Back-Office Link */}
      <div className="border-t border-[#E7E0D3] py-6 px-4 bg-[#F7F4EE]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#78716C]">
          <div>
            © 1892–2026 SISODIA ATELIER ✧. NAGINA WOOD HUB. • All rights reserved. • CITES Appendix II & VPA Timber Compliant.
          </div>

          {/* Discreet Owner Portal Back-Office Link */}
          <button
            onClick={() => setIsBackofficeOpen(true)}
            className="inline-flex items-center gap-1.5 text-[10px] text-[#78716C] hover:text-[#1C1917] uppercase tracking-wider transition-colors"
            title="Owner Portal • Yash Sisodia Desk"
          >
            <Lock className="w-3 h-3 text-[#8B5E3C]" />
            <span>Owner Portal</span>
          </button>
        </div>
      </div>

      {/* Founder Back-Office Modal */}
      <FounderBackofficeModal
        isOpen={isBackofficeOpen}
        onClose={() => setIsBackofficeOpen(false)}
      />
    </footer>
  );
}
