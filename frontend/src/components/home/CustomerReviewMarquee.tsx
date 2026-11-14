'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PatronReview {
  id: string;
  flag: string;
  patronName: string;
  location: string;
  commissionPiece: string;
  review: string;
}

const PATRON_REVIEWS: PatronReview[] = [
  {
    id: 'rev-1',
    flag: '🇺🇸',
    patronName: 'Julian Sterling',
    location: 'Tribeca Penthouse, NYC',
    commissionPiece: 'Monolithic Floor Urn',
    review:
      'Living in a historic Manhattan loft with cast-iron steam heating, any ordinary wood turns brittle and fissures. Master Khemraj’s 7.2% desert seasoning is real science: six months through winter and this monolithic teak urn has zero cracks, zero glue lines, and an immaculate cold-pressed walnut oil sheen.',
  },
  {
    id: 'rev-2',
    flag: '🇬🇧',
    patronName: 'Helena Rostova',
    location: 'Mayfair, London',
    commissionPiece: 'Scalloped Sheesham Trays',
    review:
      'We use the scalloped tray daily for sourdough and fruit in our Belgravia salon. The total absence of synthetic lacquer was my non-negotiable prerequisite. Pure river beeswax scent with dense single-piece Thar timber. Arrived in London with zero customs friction under their DDP service.',
  },
  {
    id: 'rev-3',
    flag: '🇦🇪',
    patronName: 'Tariq Al-Mansoor',
    location: 'Palm Jumeirah, Dubai',
    commissionPiece: 'Haveli Jharokha Console',
    review:
      'The pierced jali fretwork on this console anchors our entire entrance gallery. You immediately feel the staggering mass of single-trunk heartwood. Unboxing the custom ISPM-15 cedar vault with intact tilt sensors proved their transatlantic export standard is genuinely world-class.',
  },
  {
    id: 'rev-4',
    flag: '🇨🇭',
    patronName: 'Sophie Laurent',
    location: 'Zurich Residence',
    commissionPiece: 'Barmer Elevated Planter',
    review:
      'Swiss woodworking expectations are notoriously exacting, but this hand-turned monolithic pedestal vessel surpassed our gallery pieces. No chemical odor whatsoever, pure botanical oil burnish, and pristine damage-free delivery through Zurich customs with zero surprise duties.',
  },
  {
    id: 'rev-5',
    flag: '🇬🇷',
    patronName: 'Dr. Aris Vardas',
    location: 'Kolonaki, Athens',
    commissionPiece: 'Vijaysar Heartwood Salad Basin',
    review:
      'As a physician interested in Ayurveda, witnessing the medicinal heartwood release its natural celestial blue tint when filled with water is an astonishing daily ritual. 100% solid, heavy, and sculpted with sacred reverence.',
  },
];

export function CustomerReviewMarquee() {
  return (
    <section className="bg-[#FAF7F2] py-16 sm:py-20 border-b border-[#E7E0D3] overflow-hidden">
      {/* Header Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1E8DC] border border-[#DDD6C9] text-xs font-sans text-[#8B5E3C] font-semibold tracking-[1px] uppercase shadow-xs">
          <Star className="w-3.5 h-3.5 fill-[#A37836] text-[#A37836]" />
          <span>★ 4.98 / 5.0 RATING ACROSS 1,420+ GLOBAL CONSIGNMENTS • 100% DDP DELIVERY</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl text-[#1C1917] font-normal mt-4">
          Verified Patron Consignments Worldwide
        </h2>
      </div>

      {/* Single-Line Horizontal Ticker (Right to Left with Hover Pause) */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAF7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee-infinite hover:[animation-play-state:paused] py-2">
          {/* Duplicate list to enable continuous seamless right-to-left loop */}
          {[...PATRON_REVIEWS, ...PATRON_REVIEWS, ...PATRON_REVIEWS].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[340px] sm:w-[400px] mx-3 sm:mx-4 p-6 bg-white border border-[#E7E0D3] rounded-sm shadow-xs flex flex-col justify-between hover:border-[#8B5E3C] transition-colors shrink-0"
            >
              <div>
                {/* 5 Warm Gold Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#A37836] text-[#A37836]"
                    />
                  ))}
                  <span className="text-[11px] font-sans font-bold text-[#8B5E3C] ml-1.5">
                    5.0
                  </span>
                </div>

                {/* Review Narrative */}
                <p className="text-xs sm:text-[13px] font-sans text-[#44403C] leading-relaxed italic mb-4">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              {/* Patron & Piece Header */}
              <div className="border-t border-[#F3EDE2] pt-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{item.flag}</span>
                    <span className="font-serif text-sm font-semibold text-[#1C1917]">
                      {item.patronName}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-[#78716C]">{item.location}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-[#8B5E3C] block font-medium">
                    Commission
                  </span>
                  <span className="text-xs font-sans text-[#1C1917] font-medium">
                    {item.commissionPiece}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
