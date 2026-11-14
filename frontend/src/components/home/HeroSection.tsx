'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Procedural subtle organic tree-ring concentric circles with breathing animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : window.innerWidth * dpr;
      canvas.height = canvas.parentElement?.clientHeight ? canvas.parentElement.clientHeight * dpr : 700 * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 - 30;
      const numRings = 24;
      const maxRadius = Math.max(w, h) * 0.72;

      for (let i = 1; i <= numRings; i++) {
        const baseRadius = (i / numRings) * maxRadius;
        const breath = Math.sin(time * 0.0015 + i * 0.35) * (3 + i * 0.4);
        const radius = baseRadius + breath;

        ctx.beginPath();
        // Draw organic polygon approximating growth ring with subtle irregularities
        const steps = 120;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const wobble =
            Math.sin(theta * 4 + i) * 3 +
            Math.cos(theta * 7 + time * 0.001) * 2 +
            Math.sin(theta * 2 + i * 0.5) * 4;

          const r = radius + wobble;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * (r * 0.92); // Slight natural elliptical growth

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Delicate warm linen and heartwood tones
        const alpha = Math.max(0.02, 0.075 - (i / numRings) * 0.05);
        ctx.strokeStyle = `rgba(139, 94, 60, ${alpha})`;
        ctx.lineWidth = i % 5 === 0 ? 1.4 : 0.75;
        ctx.stroke();
      }

      time += 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">
      {/* Procedural Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Hero Foreground Content */}
      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1E8DC] text-[#8B5E3C] text-[11px] font-sans font-semibold tracking-[2px] uppercase mb-8 border border-[#E7E0D3] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
          <span>NAGINA • THE GLOBAL HUB OF FINE WOODCRAFT & WOODEN TILES</span>
        </div>

        {/* Heading: Cormorant Garamond serif */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#1C1917] font-normal leading-[1.08] tracking-tight mb-8">
          Solid wood, slow-grown & turned by hand.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto font-sans text-sm sm:text-base md:text-lg text-[#44403C] font-light leading-relaxed mb-12 tracking-wide">
          Only the dense heartwood of slow-grown trees. Each piece is hollowed on a lathe from one
          continuous solid monolith — not laminated, not joined with glue, and free of synthetic
          chemical lacquer.
        </p>

        {/* Action Button: Centered Single Button */}
        <div className="flex justify-center">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-10 py-4 bg-[#1E392A] hover:bg-[#162C20] text-white font-sans font-semibold text-xs tracking-[2px] uppercase rounded-sm transition-all shadow-md flex items-center justify-center gap-2.5 group"
          >
            <span>BROWSE THE COLLECTION</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
