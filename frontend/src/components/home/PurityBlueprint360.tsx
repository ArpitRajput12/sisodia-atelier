'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCw, Compass, Sparkles, ShieldCheck, Droplets, Award, Trees } from 'lucide-react';

export function PurityBlueprint360() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const lastXRef = useRef<number>(0);

  // 6 Branching Circular Badges (Left 3 & Right 3 surrounding the vessel)
  const leftBadges = [
    {
      title: 'Natural material',
      subtitle: '100% Monolithic Solid Heartwood',
      desc: 'Extracted exclusively from slow-grown ancient trees. Zero plywood cores, zero glue seams, and zero laminates.',
      icon: Trees,
      accentColor: '#8B5E3C',
    },
    {
      title: 'Traditional craft',
      subtitle: 'Low-RPM Hand Lathe Turning',
      desc: 'Sculpted freehand by senior ustads in Nagina with specialized gouges honed on waterstones.',
      icon: Compass,
      accentColor: '#8B5E3C',
    },
    {
      title: 'Chemical free',
      subtitle: 'Zero Synthetic Lacquers',
      desc: 'No polyurethane, no nitrocellulose varnish, and zero toxic chemical odor. 100% natural and food-safe.',
      icon: Sparkles,
      accentColor: '#8B5E3C',
    },
  ];

  const rightBadges = [
    {
      title: 'Reusable & durable',
      subtitle: 'Heirloom Century Durability',
      desc: '7.2% desert kiln-dried timber permanently immune to warping, checking, or steam radiator cracks.',
      icon: ShieldCheck,
      accentColor: '#1E392A',
    },
    {
      title: 'Handcrafted finish',
      subtitle: 'Walnut Oil & Desert Beeswax',
      desc: 'Burnished exclusively with virgin cold-pressed walnut oil and wild raw Chambal river beeswax.',
      icon: Droplets,
      accentColor: '#1E392A',
    },
    {
      title: 'Ayurvedic tradition',
      subtitle: 'Living Botanical Tracheids',
      desc: 'Ancient medicinal woods like Vijaysar naturally release therapeutic polyphenols and flavonoids.',
      icon: Award,
      accentColor: '#1E392A',
    },
  ];

  // Render Master-Turned Solid Burma Teak Flower Pot on Canvas
  const renderCanvas = useCallback(
    (curAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const cx = w / 2;
      const cy = h / 2 - 6;
      const rad = (curAngle * Math.PI) / 180;

      // Planter Pot Geometry Dimensions
      const topY = cy - 90;
      const baseTopY = cy + 124;
      const baseBottomY = cy + 142;

      const mouthRx = 108; // Wide open planter mouth
      const mouthRy = 24;  // Perspective ellipse radius
      const shoulderY = cy - 40;
      const shoulderRx = 118; // Graceful swelling below mouth
      const baseRx = 64;   // Elegant tapered pedestal waist

      // 1. Soft Oval Floor Contact Shadow
      const shadowY = baseBottomY + 4;
      const shadowGrad = ctx.createRadialGradient(cx, shadowY, 20, cx, shadowY, 150);
      shadowGrad.addColorStop(0, 'rgba(28, 25, 23, 0.36)');
      shadowGrad.addColorStop(0.35, 'rgba(28, 25, 23, 0.16)');
      shadowGrad.addColorStop(0.7, 'rgba(28, 25, 23, 0.04)');
      shadowGrad.addColorStop(1, 'rgba(247, 243, 235, 0)');

      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, 135, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Pedestal Base Ring (Turned Solid Teak Plinth)
      const pedestalGrad = ctx.createLinearGradient(cx - baseRx - 10, baseTopY, cx + baseRx + 10, baseBottomY);
      const pedHighlight = 0.45 + Math.sin(rad) * 0.18;
      pedestalGrad.addColorStop(0, '#4A250E');
      pedestalGrad.addColorStop(Math.max(0.1, pedHighlight - 0.2), '#6B3B1B');
      pedestalGrad.addColorStop(pedHighlight, '#9C5E31');
      pedestalGrad.addColorStop(Math.min(0.9, pedHighlight + 0.2), '#6B3B1B');
      pedestalGrad.addColorStop(1, '#3A1C0A');

      // Pedestal lower rim
      ctx.fillStyle = pedestalGrad;
      ctx.beginPath();
      ctx.ellipse(cx, baseBottomY, baseRx + 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal cylinder rise
      ctx.beginPath();
      ctx.moveTo(cx - (baseRx + 6), baseBottomY);
      ctx.lineTo(cx - baseRx, baseTopY);
      ctx.ellipse(cx, baseTopY, baseRx, 10, 0, Math.PI, 0, true);
      ctx.lineTo(cx + (baseRx + 6), baseBottomY);
      ctx.ellipse(cx, baseBottomY, baseRx + 6, 12, 0, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();

      // 3. Flower Pot Outer Body (Wide open mouth, tapered curved sides)
      const potBodyGrad = ctx.createLinearGradient(cx - shoulderRx, cy - 60, cx + shoulderRx, cy + 80);
      const highlightPos = 0.42 + Math.sin(rad) * 0.18;
      potBodyGrad.addColorStop(0, '#3E1C0A');
      potBodyGrad.addColorStop(Math.max(0.08, highlightPos - 0.22), '#6B3B1B');
      potBodyGrad.addColorStop(Math.max(0.15, highlightPos - 0.08), '#8C522B');
      potBodyGrad.addColorStop(highlightPos, '#B27645'); // Warm satin highlight
      potBodyGrad.addColorStop(Math.min(0.85, highlightPos + 0.12), '#7A431F');
      potBodyGrad.addColorStop(Math.min(0.92, highlightPos + 0.25), '#542911');
      potBodyGrad.addColorStop(1, '#331707');

      ctx.save();
      ctx.beginPath();
      // Start at left mouth
      ctx.moveTo(cx - mouthRx, topY);
      // Shoulder curve
      ctx.bezierCurveTo(cx - shoulderRx - 2, cy - 65, cx - shoulderRx, shoulderY, cx - baseRx - 8, cy + 60);
      // Taper into base
      ctx.bezierCurveTo(cx - baseRx - 4, cy + 95, cx - baseRx - 1, cy + 115, cx - baseRx, baseTopY);
      // Base bottom curve
      ctx.ellipse(cx, baseTopY, baseRx, 10, 0, Math.PI, 0, true);
      // Up right side
      ctx.bezierCurveTo(cx + baseRx + 1, cy + 115, cx + baseRx + 4, cy + 95, cx + baseRx + 8, cy + 60);
      ctx.bezierCurveTo(cx + shoulderRx, shoulderY, cx + shoulderRx + 2, cy - 65, cx + mouthRx, topY);
      // Front half of mouth ellipse
      ctx.ellipse(cx, topY, mouthRx, mouthRy, 0, 0, Math.PI, false);
      ctx.closePath();

      ctx.fillStyle = potBodyGrad;
      ctx.fill();

      // Clip within pot body for wood grain, lathe fluting & annular rings
      ctx.clip();

      // 4. Annular Growth Rings (Concentric horizontal wood rings)
      ctx.lineWidth = 1;
      for (let r = 0; r <= 240; r += 16) {
        const ringY = topY + 15 + r;
        const progress = r / 240;
        // Interpolate width from mouth to base
        const curWidth = mouthRx * (1 - progress) + baseRx * progress + 8;
        const ringRy = 14 + (1 - progress) * 8;
        const ringAlpha = 0.09 + Math.sin(r * 0.15 + rad) * 0.04;
        ctx.strokeStyle = `rgba(32, 14, 5, ${ringAlpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, ringY, curWidth, ringRy, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Vertical Lathe Gouge Flutes & Natural Timber Grain (Smoothly rotating 360°)
      const numFlutes = 26;
      for (let f = 0; f < numFlutes; f++) {
        const fluteAngle = (f / numFlutes) * Math.PI * 2 + rad;
        const xFactor = Math.sin(fluteAngle);
        const normalZ = Math.cos(fluteAngle);

        if (normalZ > -0.25) {
          const fluteAlpha = Math.max(0.06, normalZ * 0.35);
          ctx.strokeStyle =
            normalZ > 0.45
              ? `rgba(247, 225, 195, ${fluteAlpha * 0.55})` // Specular satin sheen
              : `rgba(35, 15, 6, ${fluteAlpha * 0.75})`;   // Warm grain shadow
          ctx.lineWidth = normalZ > 0.45 ? 2.8 : 2.2;

          const xTop = cx + xFactor * (mouthRx - 4);
          const xShoulder = cx + xFactor * (shoulderRx - 4);
          const xBase = cx + xFactor * (baseRx - 4);

          ctx.beginPath();
          ctx.moveTo(xTop, topY);
          ctx.bezierCurveTo(xShoulder, cy - 50, xShoulder, shoulderY + 20, xBase, baseTopY);
          ctx.stroke();
        }
      }

      // 6. Subtle Horizontal Lathe Finishing Grooves (Incised Bead Lines)
      const drawGroove = (gy: number, gRadius: number) => {
        // Dark recess
        ctx.strokeStyle = 'rgba(28, 12, 4, 0.45)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, gy, gRadius, 14, 0, 0, Math.PI);
        ctx.stroke();
        // Thin lower highlight reflection
        ctx.strokeStyle = 'rgba(235, 195, 150, 0.35)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(cx, gy + 1.8, gRadius, 14, 0, 0, Math.PI);
        ctx.stroke();
      };

      drawGroove(topY + 32, mouthRx - 2);
      drawGroove(topY + 40, shoulderRx - 2);
      drawGroove(cy + 92, baseRx + 12);
      drawGroove(cy + 102, baseRx + 8);

      ctx.restore(); // Restore from pot body clip

      // 7. Dark Hollowed Interior Rim (Planter Pot Cavity Depth)
      const mouthInnerRx = mouthRx - 9;
      const mouthInnerRy = mouthRy - 4;

      const interiorGrad = ctx.createRadialGradient(cx, topY + 4, 10, cx, topY + 8, mouthInnerRx);
      interiorGrad.addColorStop(0, '#150A04'); // Deep potting cavity darkness
      interiorGrad.addColorStop(0.55, '#221108');
      interiorGrad.addColorStop(0.85, '#351B0D');
      interiorGrad.addColorStop(1, '#4A2612');

      ctx.fillStyle = interiorGrad;
      ctx.beginPath();
      ctx.ellipse(cx, topY, mouthInnerRx, mouthInnerRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep inner shadow on back wall of interior
      const innerShadow = ctx.createLinearGradient(cx, topY - mouthInnerRy, cx, topY + mouthInnerRy);
      innerShadow.addColorStop(0, 'rgba(10, 5, 2, 0.85)');
      innerShadow.addColorStop(0.5, 'rgba(15, 8, 3, 0.4)');
      innerShadow.addColorStop(1, 'rgba(40, 20, 10, 0)');
      ctx.fillStyle = innerShadow;
      ctx.beginPath();
      ctx.ellipse(cx, topY, mouthInnerRx, mouthInnerRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // 8. Polished Virgin Brass Inlay Along Top Lip
      const brassGrad = ctx.createLinearGradient(cx - mouthRx, topY - mouthRy, cx + mouthRx, topY + mouthRy);
      const brassHighlight = 0.5 + Math.sin(rad * 2) * 0.22;
      brassGrad.addColorStop(0, '#9E7230');
      brassGrad.addColorStop(Math.max(0.1, brassHighlight - 0.2), '#C59A4E');
      brassGrad.addColorStop(brassHighlight, '#FFF3D1'); // Glistening brass glint
      brassGrad.addColorStop(Math.min(0.9, brassHighlight + 0.2), '#B3843B');
      brassGrad.addColorStop(1, '#7A541E');

      // Outer brass lip rim
      ctx.lineWidth = 3.6;
      ctx.strokeStyle = brassGrad;
      ctx.beginPath();
      ctx.ellipse(cx, topY, mouthRx - 2, mouthRy, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle specular highlight arc on brass lip
      const glintArcStart = rad * 1.5;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx, topY, mouthRx - 1.5, mouthRy, 0, glintArcStart, glintArcStart + Math.PI * 0.4);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 460 * dpr;
    canvas.height = 420 * dpr;
    renderCanvas(angle);
  }, [angle, renderCanvas]);

  // Pointer drag handlers for buttery-smooth horizontal 360° rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    setAngle((prev) => (prev + delta * 0.75 + 360) % 360);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <section id="purity-blueprint" className="bg-[#FAF7F2] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1E8DC] text-[#8B5E3C] text-xs font-sans font-semibold tracking-[2px] uppercase mb-4 border border-[#E7E0D3]">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Purity Blueprint & 360° Wood Grain</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Turning
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#44403C] font-sans leading-relaxed">
            Drag horizontally to rotate the turned vessel 360°. Inspect the lathe gouge grooves, annular tree growth rings, and pure virgin brass rim reflection.
          </p>
        </div>

        {/* Forced 3-Column Surrounding Layout (col-span-4 Left • col-span-4 Center Canvas • col-span-4 Right) across ALL screen sizes */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-4 md:gap-6 items-center">
          {/* Left Qualities (4 cols) */}
          <div className="col-span-4 space-y-1.5 sm:space-y-3.5 md:space-y-4">
            {leftBadges.map((badge, i) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={i}
                  className="p-1.5 sm:p-3 md:p-4 bg-white border border-[#E7E0D3] rounded-sm shadow-xs hover:border-[#8B5E3C] transition-all"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#F7F4EE] border border-[#E7E0D3] flex items-center justify-center shrink-0">
                      <IconComp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#8B5E3C]" />
                    </div>
                    <h4 className="font-serif text-[10px] sm:text-xs md:text-sm lg:text-base text-[#1C1917] font-semibold leading-tight line-clamp-1">
                      {badge.title}
                    </h4>
                  </div>
                  <div className="text-[7px] sm:text-[9px] md:text-[10px] font-sans font-medium text-[#8B5E3C] uppercase tracking-wider mb-0.5 sm:mb-1 line-clamp-1">
                    {badge.subtitle}
                  </div>
                  <p className="text-[7px] sm:text-[9px] md:text-[11px] text-[#44403C] font-sans leading-tight sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {badge.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Center Interactive 360° Wood Grain Canvas (4 cols) */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative w-full aspect-square bg-[#F7F3EB]/85 border border-[#E6DFD3] rounded-sm flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing select-none p-1 sm:p-2 overflow-hidden touch-none"
              title="Click & drag horizontally to rotate the turned vessel 360°"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />

              {/* Angle readout pill */}
              <div className="absolute bottom-1 sm:bottom-2 md:bottom-2.5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full border border-[#DDD6C9] shadow-xs flex items-center gap-1 sm:gap-1.5 text-[7px] sm:text-[9px] md:text-xs font-sans text-[#1C1917] whitespace-nowrap pointer-events-none">
                <RotateCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#8B5E3C] animate-spin-slow shrink-0" />
                <span>↻ 360° · {Math.round(angle)}°</span>
              </div>
            </div>
          </div>

          {/* Right Qualities (4 cols) */}
          <div className="col-span-4 space-y-1.5 sm:space-y-3.5 md:space-y-4">
            {rightBadges.map((badge, i) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={i}
                  className="p-1.5 sm:p-3 md:p-4 bg-white border border-[#E7E0D3] rounded-sm shadow-xs hover:border-[#1E392A] transition-all"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#EAEFEA] border border-[#1E392A]/20 flex items-center justify-center shrink-0">
                      <IconComp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#1E392A]" />
                    </div>
                    <h4 className="font-serif text-[10px] sm:text-xs md:text-sm lg:text-base text-[#1C1917] font-semibold leading-tight line-clamp-1">
                      {badge.title}
                    </h4>
                  </div>
                  <div className="text-[7px] sm:text-[9px] md:text-[10px] font-sans font-medium text-[#1E392A] uppercase tracking-wider mb-0.5 sm:mb-1 line-clamp-1">
                    {badge.subtitle}
                  </div>
                  <p className="text-[7px] sm:text-[9px] md:text-[11px] text-[#44403C] font-sans leading-tight sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {badge.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
