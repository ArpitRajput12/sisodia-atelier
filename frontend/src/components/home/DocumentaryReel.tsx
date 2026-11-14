'use client';

import React, { useRef, useState } from 'react';
import { Play, ChevronLeft, ChevronRight, X, Clock, Film } from 'lucide-react';
import { useAtelier } from '@/context/AtelierContext';
import { ReelItem } from '@/types';

const FALLBACK_THUMB =
  'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794679405/sisodia-atelier/permanent/brand_logo.jpg';

export function DocumentaryReel() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { reels } = useAtelier();
  const [selectedEpisode, setSelectedEpisode] = useState<ReelItem | null>(null);

  // If owner has added 0 reels in Neon DB, hide the entire documentary section cleanly
  if (!reels || reels.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Scroll Controls */}
        <div className="flex items-end justify-between mb-10 border-b border-[#E7E0D3] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[2px] text-[#8B5E3C] font-semibold mb-2">
              <Film className="w-4 h-4 text-[#8B5E3C]" />
              <span>Atelier Visual Archives</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1C1917] font-normal">
              Single-Line Atelier Documentary Reel
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-sm bg-white hover:bg-[#1E392A] text-[#1C1917] hover:text-white border border-[#E7E0D3] hover:border-[#1E392A] transition-all flex items-center justify-center shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-sm bg-white hover:bg-[#1E392A] text-[#1C1917] hover:text-white border border-[#E7E0D3] hover:border-[#1E392A] transition-all flex items-center justify-center shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Single-Line Horizontal Scroll Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
        >
          {reels.map((ep) => (
            <div
              key={ep.id}
              onClick={() => setSelectedEpisode(ep)}
              className="w-[310px] sm:w-[350px] shrink-0 bg-white border border-[#E7E0D3] rounded-sm overflow-hidden shadow-xs hover:border-[#8B5E3C] transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Video Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-[#F7F4EE]">
                <img
                  src={ep.thumbnailUrl || FALLBACK_THUMB}
                  alt={ep.title}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== FALLBACK_THUMB) {
                      img.src = FALLBACK_THUMB;
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />

                {/* Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-[#1E392A] text-[#1C1917] group-hover:text-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-sans font-medium px-2 py-0.5 rounded-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{ep.duration}</span>
                </div>
              </div>

              {/* Episode Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[1.5px] text-[#8B5E3C] block mb-1">
                    {ep.episodeNumber}
                  </span>
                  <h3 className="font-serif text-lg text-[#1C1917] font-semibold leading-snug group-hover:text-[#1E392A] transition-colors mb-2">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-[#44403C] font-sans leading-relaxed line-clamp-3">
                    {ep.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F3EDE2] text-[11px] font-sans text-[#1E392A] font-semibold flex items-center gap-1">
                  <span>Watch Atelier Film</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HTML5 Video Player Modal */}
        {selectedEpisode && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedEpisode(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#E7E0D3] flex items-center justify-between bg-[#F7F4EE]">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#8B5E3C]">
                    {selectedEpisode.episodeNumber} • {selectedEpisode.duration}
                  </span>
                  <h3 className="font-serif text-lg text-[#1C1917] font-semibold">
                    {selectedEpisode.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEpisode(null)}
                  className="p-1.5 text-[#78716C] hover:text-[#1C1917]"
                  aria-label="Close video"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Actual HTML5 Video Player */}
              <div className="relative aspect-video bg-[#1C1917] flex items-center justify-center">
                {selectedEpisode.videoUrl.includes('youtube.com/embed') ? (
                  <iframe
                    src={selectedEpisode.videoUrl}
                    title={selectedEpisode.title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={selectedEpisode.id}
                    src={selectedEpisode.videoUrl}
                    poster={selectedEpisode.thumbnailUrl || FALLBACK_THUMB}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>

              {/* Description Strip */}
              <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E7E0D3]">
                <p className="text-xs sm:text-sm text-[#44403C] font-sans leading-relaxed">
                  {selectedEpisode.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
