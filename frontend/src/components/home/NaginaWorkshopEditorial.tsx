'use client';

import React from 'react';
import Link from 'next/link';
import { useAtelier } from '@/context/AtelierContext';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export function NaginaWorkshopEditorial() {
  const { siteAssets } = useAtelier();
  return (
    <section className="bg-[#FAF7F2] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Workshop Lathe Turning Looping Video */}
          <div className="lg:col-span-6">
            <div className="relative rounded-sm overflow-hidden border border-[#E7E0D3] shadow-xl bg-[#1C1917]">
              <div className="relative w-full h-full min-h-[420px] sm:min-h-[500px] lg:min-h-[540px] overflow-hidden bg-[#1C1917]">
                <video
                  src={siteAssets?.atelier_floor_video || '/videos/atelier-lathe.mp4'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none" />
              </div>

              {/* Artisan Floor Tag Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-sm border border-[#E7E0D3] shadow-md flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-[#1E392A]" />
                <span className="text-xs font-sans uppercase tracking-[1.5px] text-[#1C1917] font-semibold">
                  Nagina Woodcraft Atelier Floor • Live Lathe Turning & Carving Since 1892
                </span>
              </div>

              {/* Bottom Quote Callout */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#FAF7F2]/95 backdrop-blur-xs p-4 rounded-sm border border-[#E7E0D3] shadow-lg z-10">
                <p className="font-serif text-sm sm:text-base text-[#1C1917] italic leading-snug">
                  &ldquo;A glued joint is an apology for an undersized tree. We wait sixteen years for the trunk to dry, then turn the whole vessel from its sovereign heart.&rdquo;
                </p>
                <span className="text-[11px] font-sans text-[#8B5E3C] uppercase tracking-wider block mt-1 font-semibold">
                  — Master Craftsman Khemraj, Senior Ustad
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1E8DC] text-[#8B5E3C] text-xs font-sans font-semibold tracking-[2px] uppercase border border-[#E7E0D3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Slow-Grown Single Monolith Craft</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal leading-tight tracking-tight">
              Turned and hand-carved in Nagina.
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#44403C] leading-relaxed">
              In an industrial era dominated by edge-glued panels, MDF fillers, and synthetic polyurethane lacquers,
              SISODIA ATELIER ✧ preserves the uncompromising purism of traditional Indian woodwrighting.
            </p>

            <p className="font-sans text-sm sm:text-base text-[#44403C] leading-relaxed">
              Every turned urn, vessel, and pedestal begins as a massive, uncut log of ancient Burma Teak,
              mountain Walnut, or medicinal Vijaysar. Mounted onto low-RPM manual lathes, our ustads guide
              curved chisels purely by ear and muscle memory — hollowing the vessel from the core outwards
              without a single seam, dowel, or glue point.
            </p>

            {/* Hallmarks List */}
            <div className="pt-2 space-y-3 font-sans text-xs sm:text-sm text-[#1C1917]">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAEFEA] text-[#1E392A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="font-semibold text-[#1C1917]">Zero Chemical Lacquers:</strong> Sealed exclusively with cold-pressed Kashmiri walnut oil and organic Chambal river beeswax.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAEFEA] text-[#1E392A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="font-semibold text-[#1C1917]">Single Solid Trunk Integrity:</strong> Will never delaminate or fissure because there are zero glued interfaces.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAEFEA] text-[#1E392A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="font-semibold text-[#1C1917]">7.2% Solar Kiln Seasoning:</strong> Equilibrium tested to resist winter radiator dryness in American and European penthouses.
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-[#1E392A] hover:bg-[#162C20] text-white text-xs font-sans tracking-[2px] uppercase font-semibold rounded-sm transition-all shadow-md flex items-center gap-2"
              >
                <span>Explore Turned Masterpieces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const SaharanpurWorkshopEditorial = NaginaWorkshopEditorial;
