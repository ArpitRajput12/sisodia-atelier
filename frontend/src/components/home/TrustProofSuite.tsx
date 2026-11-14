'use client';

import React from 'react';
import {
  Layers,
  Droplets,
  Sparkles,
  ShieldCheck,
  Box,
  Award,
  CheckCircle2,
} from 'lucide-react';

export function TrustProofSuite() {
  const trustPillars = [
    {
      icon: Layers,
      title: '100% Monolithic Single-Trunk Timber',
      tag: 'NAGINA HEARTWOOD HERITAGE',
      description:
        'Each piece is lathe-turned or chiseled from one solid, continuous trunk. Zero plywood, zero chemical resin glue seams, and zero thin veneers.',
      hallmark: 'Zero Veneer • Pure Heartwood',
    },
    {
      icon: Droplets,
      title: '7.2% Certified Kiln-Dried Equilibrium',
      tag: 'CLIMATE & WINTER RADIATOR PROOF',
      description:
        'Scientifically conditioned cell tension guarantees your wood will never develop hairline splits, crack, or warp, even beside intense dry winter radiator heating in the USA or Europe.',
      hallmark: 'Winter Radiator Equilibrium',
    },
    {
      icon: Sparkles,
      title: '100% Chemical-Free Edible Finish',
      tag: 'AYURVEDIC NUT OILS & DESERT BEESWAX',
      description:
        'We reject all polyurethane, polyester, and artificial stains. Burnished exclusively by hand with pure cold-pressed walnut oil and organic river beeswax. Completely food-safe and organic.',
      hallmark: 'Food-Safe Organic Polish',
    },
    {
      icon: ShieldCheck,
      title: '100% Delivered Duty Paid (DDP) Guarantee',
      tag: 'ZERO DOORSTEP TARIFFS OR IMPORT TAXES',
      description:
        'All customs formalities, overseas shipping duties, and clearances are pre-paid by SISODIA ATELIER ✧. You pay $0.00 at delivery across USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.',
      hallmark: '$0.00 Doorstep Tariff Liability',
    },
    {
      icon: Box,
      title: 'ISPM-15 Certified Cedar Travel Vaults',
      tag: 'MUSEUM CONSERVATION PACKAGING',
      description:
        'Custom-built heat-treated fumigated wooden travel crates with internal neoprene shock dampeners and 3-axis tilt impact sensors to ensure damage-free arrival.',
      hallmark: 'Zero-Impact Shock Dampening',
    },
    {
      icon: Award,
      title: 'Direct Artisan Atelier Transparency',
      tag: 'NAGINA WOODCRAFT HUB • PROVENANCE',
      description:
        'Founded in Nagina, India. Directed by Yash Sisodia, patrons receive direct access to master carvers, custom sizing, and verified GI authenticity.',
      hallmark: 'Direct Yash Sisodia Atelier Desk',
    },
  ];

  return (
    <section id="trust-proof" className="bg-[#FAF7F2] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="mb-4">
            <span className="bg-[#F1E8DC] text-[#8B5E3C] px-3.5 py-1 rounded-full text-[10.5px] font-mono tracking-widest uppercase inline-block font-semibold border border-[#E7E0D3]">
              ★ HERITAGE CRAFT & WORLDWIDE ASSURANCE ★
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Why Customers Trust SISODIA ATELIER ✧
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#44403C] font-sans leading-relaxed">
            From private collectors in Manhattan and Mayfair to royal villas in Dubai, discerning patrons choose SISODIA ATELIER ✧ for our unyielding fidelity to pure single-trunk heartwood, zero chemical adulteration, and centuries-old Nagina architectural woodcraft traditions.
          </p>
        </div>

        {/* 2-Column Responsive Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {trustPillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E7E0D3] p-6 sm:p-8 rounded-sm shadow-xs hover:border-[#1E392A] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-sm bg-[#F7F4EE] border border-[#DDD6C9] flex items-center justify-center text-[#1E392A] group-hover:bg-[#1E392A] group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 bg-[#F1E8DC] text-[#8B5E3C] rounded-sm border border-[#E7E0D3]">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal leading-snug mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#44403C] font-sans leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F3EDE2] flex items-center justify-between text-xs font-sans">
                  <span className="flex items-center gap-1.5 text-[#1E392A] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#1E392A]" />
                    {pillar.hallmark}
                  </span>
                  <span className="text-[#78716C] font-mono text-[11px]">0{idx + 1} / 06</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
