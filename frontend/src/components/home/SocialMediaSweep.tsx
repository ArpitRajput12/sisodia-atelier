'use client';

import React, { useState } from 'react';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

interface SocialPlatform {
  platform: string;
  handle: string;
  tag: string;
  description: string;
  href: string;
  color: string;
  iconBg: string;
  svgIcon: React.ReactNode;
}

const SOCIAL_CHANNELS: SocialPlatform[] = [
  {
    platform: 'Instagram',
    handle: '@sisodiaatelier9',
    tag: 'Official Atelier Feed',
    description: 'Showreels, lathe turning, kiln seasoning & finished solid wood polish stories',
    href: 'https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0',
    color: '#E1306C',
    iconBg: '#FDF2F4',
    svgIcon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    platform: 'LinkedIn',
    handle: 'Sisodia Atelier',
    tag: 'B2B Hospitality & Trade',
    description: 'B2B hospitality supply, architectural contracts, wooden tiles & international export logistics',
    href: 'https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    color: '#0A66C2',
    iconBg: '#EDF5FC',
    svgIcon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    platform: 'WhatsApp Direct',
    handle: '+91 88680 31460',
    tag: 'Instant Artisan Desk',
    description: 'Direct consultation with Yash Sisodia for custom dimensions, monolithic urns & wooden tiles',
    href: 'https://wa.me/918868031460?text=Namaste%20Yash%20Sisodia%20Ji%2C%20I%20am%20interested%20in%20SISODIA%20ATELIER%20%E2%9C%A7%20custom%20woodwork%20and%20solid%20wooden%20tiles.',
    color: '#25D366',
    iconBg: '#EDFAF1',
    svgIcon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    platform: 'Official Email',
    handle: 'Sisodiaatelier09@gmail.com',
    tag: 'Founder & Export Desk',
    description: 'Direct inquiries, architectural blueprints & formal export trade agreements',
    href: 'mailto:Sisodiaatelier09@gmail.com',
    color: '#1E392A',
    iconBg: '#EAEFEA',
    svgIcon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
];

export function SocialMediaSweep() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E7E0D3] overflow-hidden">
      {/* Upper Micro Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1E8DC] border border-[#DDD6C9] text-xs font-sans text-[#8B5E3C] font-semibold tracking-[1.5px] uppercase shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#8B5E3C] animate-pulse" />
          <span>CONNECT WITH OUR NAGINA ATELIER • DAILY LIVE UPDATES FROM THE WORKSHOP FLOOR</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-normal mt-3">
          Follow the Living Woodcraft Heritage Across the World
        </h3>
      </div>

      {/* Infinite Seamless Right-to-Left Ticker */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Soft edge gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAF7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10 pointer-events-none" />

        <div
          className={`flex w-max ${
            isPaused ? '' : 'animate-marquee-infinite'
          } hover:[animation-play-state:paused] py-2`}
        >
          {/* Quadrupled list for infinite uninterrupted loop */}
          {[...SOCIAL_CHANNELS, ...SOCIAL_CHANNELS, ...SOCIAL_CHANNELS, ...SOCIAL_CHANNELS].map((item, idx) => (
            <a
              key={`${item.platform}-${idx}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[280px] sm:w-[330px] mx-2.5 sm:mx-3 p-4 sm:p-5 bg-white border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm shadow-xs hover:shadow-md transition-all flex flex-col justify-between shrink-0 group select-none"
            >
              <div>
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-[#E7E0D3]/80 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: item.iconBg, color: item.color }}
                    >
                      {item.svgIcon}
                    </div>
                    <div>
                      <span className="font-serif text-sm font-semibold text-[#1C1917] block leading-tight">
                        {item.platform}
                      </span>
                      <span className="text-[10px] font-sans font-medium text-[#78716C]">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#8B5E3C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                {/* Handle */}
                <div className="text-xs font-sans font-semibold text-[#1E392A] mb-1.5 flex items-center gap-1">
                  <span>{item.handle}</span>
                </div>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-[#44403C] font-sans leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Bottom Visit Pill */}
              <div className="border-t border-[#F3EDE2] pt-3 mt-3 flex items-center justify-between text-[11px] font-sans">
                <span className="text-[#8B5E3C] font-medium group-hover:text-[#1E392A] transition-colors">
                  View Feed / Chat Direct
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#A8A29E] group-hover:text-[#8B5E3C]">
                  Official Guild ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

