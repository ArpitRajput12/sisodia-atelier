'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { SerpentineCarousel } from '@/components/home/SerpentineCarousel';
import { CustomerReviewMarquee } from '@/components/home/CustomerReviewMarquee';
import { TrustProofSuite } from '@/components/home/TrustProofSuite';
import { NaginaWorkshopEditorial } from '@/components/home/NaginaWorkshopEditorial';
import { PurityBlueprint360 } from '@/components/home/PurityBlueprint360';
import { DocumentaryReel } from '@/components/home/DocumentaryReel';
import { SocialMediaSweep } from '@/components/home/SocialMediaSweep';
import { CategoryRangeCarousel } from '@/components/home/CategoryRangeCarousel';
import { CustomBulkOrderSection } from '@/components/home/CustomBulkOrderSection';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between selection:bg-[#1E392A] selection:text-[#FAF7F2] w-full max-w-full overflow-x-hidden">
      {/* 1. Header Navigation & Top Announcement Bar */}
      <Navbar />

      {/* 2. Hero Section with Organic Breathing Concentric Tree-Ring Canvas */}
      <HeroSection />

      {/* 3. 3D Serpentine Depth Carousel */}
      <SerpentineCarousel />

      {/* 4. Infinite Right-to-Left Customer Reviews Marquee */}
      <CustomerReviewMarquee />

      {/* 5. Nagina Woodcraft Atelier Lathe Turning & Carving Editorial */}
      <NaginaWorkshopEditorial />

      {/* 6. 100% Safe Delivery & Anti-Scam Trust Proof Section */}
      <TrustProofSuite />

      {/* 7. Interactive Purity Blueprint & 360° Wood Grain Canvas */}
      <PurityBlueprint360 />

      {/* 8. Single-Line Atelier Documentary Reel */}
      <DocumentaryReel />

      {/* 9. Social Media Sweeping Marquee Row (Right-to-Left Infinite Loop) */}
      <SocialMediaSweep />

      {/* 10. Our Items Range & Masterpiece Categories Sweeping Carousel */}
      <CategoryRangeCarousel />

      {/* 11. Nagina Bespoke Custom Woodwork, Wooden Tiles & Bulk / Hotel Orders */}
      <CustomBulkOrderSection />

      {/* 12. Royal Atelier Heritage Footer with Founder Back-Office Link */}
      <Footer />

      {/* 13. Slide-over Shopping Bag / Cart Drawer */}
      <CartDrawer />
    </main>
  );
}
