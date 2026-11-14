# 🏛️ Sisodia Atelier — Ultra-Luxury Heirloom Solid Wood Storefront

Client storefront for **Sisodia Atelier**, an ultra-luxury heirloom solid wood e-commerce platform catering to international patrons (US, UK, Europe, UAE) and Indian domestic collectors.

Built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, designed with an editorial royal atelier aesthetic, a dual-market currency engine, the infinite right-to-left patron review marquee, and the comprehensive 100% safe delivery trust proof suite.

---

## 🎨 Design Philosophy & Aesthetic Palette

- **Atelier Obsidian (`#0a0908` to `#191612`)**: Deep, warm dark charcoal-black reminiscent of centuries-old seasoned heartwood and Rajasthan desert night skies.
- **Imperial Champagne Gold (`#dfb268` / `#ecd198`)**: Burnished gold accents celebrating royal court Tarkashi wire inlay and hand-beaten brass hardware.
- **Warm Parchment (`#fdfbf7` to `#bca68e`)**: Regal linen and archival parchment tones for editorial readability.
- **Typography**:
  - **Headings**: *Cormorant Garamond* (Classical Renaissance serif inspired by royal proclamations).
  - **Body & UI**: *Jost* (Geometric, legible modern luxury sans-serif).

---

## 📐 Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css                # Custom scrollbar, selection, and marquee keyframes
│   │   ├── layout.tsx                 # Root layout with Google Fonts preconnect, Currency & Cart providers
│   │   └── page.tsx                   # Integrated landing page assembly
│   ├── components/
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx         # Slide-over consignment bag with live currency recalculation & DDP callouts
│   │   ├── chat/
│   │   │   └── CraftsmanChatWidget.tsx# Floating Gemini 1.5 Flash live chat with Master Craftsman Khemraj
│   │   ├── consultation/
│   │   │   └── VideoConsultationModal.tsx # 1-on-1 video inspection salon booking (strict 11 AM - 2 PM IST)
│   │   ├── home/
│   │   │   ├── CustomerReviewMarquee.tsx  # Infinite right-to-left verified patron marquee
│   │   │   ├── HeroSection.tsx        # Cinematic editorial header with 4 core trust pillars
│   │   │   ├── MasterpieceGallery.tsx # Heirloom vault catalog with instant multi-currency valuation
│   │   │   ├── TrustProofSuite.tsx    # 100% safe delivery & 7.2% timber moisture physics suite
│   │   │   └── VideoSalonSection.tsx  # Lathe room stream highlight & consultation reservation CTA
│   │   └── layout/
│   │       ├── Footer.tsx             # Royal heritage footer with guild addresses & hallmark stamps
│   │       └── Navbar.tsx             # Sticky navigation with dual-market currency dropdown & cart badge
│   ├── context/
│   │   ├── CartContext.tsx            # Consignment shopping bag state with localStorage persistence
│   │   └── CurrencyContext.tsx        # Multi-currency engine (USD, GBP, EUR, AED, INR)
│   ├── lib/
│   │   ├── api.ts                     # API client for backend communication with graceful fallbacks
│   │   └── products.ts                # Masterpiece catalog data (Armoire, Tarkashi Table, Jharokha, Basin)
│   └── types/
│       └── index.ts                   # Strict TypeScript definitions
├── .env.local.example                 # Frontend environment variables template
├── next.config.ts                     # Next.js 15 configuration with remote image domains
├── package.json                       # Dependencies & scripts
├── postcss.config.mjs                 # PostCSS configuration
├── tailwind.config.ts                 # Atelier luxury palette & infinite marquee keyframes
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Storefront documentation
```

---

## 💎 Core Features

### 1. Dual-Market Currency Engine ([`src/context/CurrencyContext.tsx`](file:///c:/Users/arpit/OneDrive/Desktop/handcraft/frontend/src/context/CurrencyContext.tsx))
Supports instant, live currency conversion for domestic and global patrons:
- **USD ($)**: United States & Global Patrons (`rate: 1.00`)
- **GBP (£)**: United Kingdom Estates (`rate: 0.79`)
- **EUR (€)**: Continental Europe (`rate: 0.92`)
- **AED (AED)**: United Arab Emirates & Middle East (`rate: 3.67`)
- **INR (₹)**: Indian Domestic Connoisseurs (`rate: 86.50`)
- Selected currency persists seamlessly in `localStorage`.

### 2. Infinite Right-to-Left Customer Review Marquee ([`src/components/home/CustomerReviewMarquee.tsx`](file:///c:/Users/arpit/OneDrive/Desktop/handcraft/frontend/src/components/home/CustomerReviewMarquee.tsx))
- Continuous, silky right-to-left horizontal scrolling loop.
- Pauses smoothly on mouse hover for comfortable reading.
- Showcases verified international patron testimonials:
  - **Julian S.** (Tribeca Penthouse, New York, US) — *5 Stars — Monolithic Fluted Urn*
  - **Helena R.** (Mayfair, London, UK) — *5 Stars — Scalloped Sheesham Trays*
  - **Tariq Al-Mansoor** (Emirates Hills, Dubai, UAE) — *5 Stars — Haveli Jharokha Console*
  - **Dr. Aris V.** (Kolonaki, Athens, Greece) — *5 Stars — Vijaysar Heartwood Salad Basin*
  - **Sophie L.** (Zurich, Switzerland) — *5 Stars — Barmer Fluted Pedestal Stand*
- Verified proof badge: `4.98 ★ from 1,420 Global Consignments • 1,380 Verified Patrons • 100% DDP Delivery`.

### 3. The 100% Safe Delivery & Timber Trust Proof Suite ([`src/components/home/TrustProofSuite.tsx`](file:///c:/Users/arpit/OneDrive/Desktop/handcraft/frontend/src/components/home/TrustProofSuite.tsx))
Six detailed pillars breaking down the physics, ethics, and logistics of Sisodia Atelier:
1. **100% Monolithic Heartwood**: Single-trunk turning; zero veneer, zero plywood, zero MDF.
2. **7.2% Desert-Seasoned Kiln Equilibrium**: The physics of why standard 16% wood cracks in Western radiator heat and why Sisodia Atelier’s 7.2% core moisture is immune to radiator warping.
3. **Chemical-Free Food-Safe Patina**: Pure cold-pressed walnut oil and desert beeswax (zero polyurethane/polyester).
4. **100% DDP (Delivered Duty Paid) Guarantee**: Zero doorstep tariffs or unexpected VAT bills for US, UK, EU, UAE patrons.
5. **ISPM-15 Fumigated Cedar Vaults**: Custom closed-cell foam with 3-axis calibrated shock and tilt sensors.
6. **DHL Express Air Priority Transit**: Rapid white-glove transport to 80+ countries.

### 4. Video Consultation Salon ([`src/components/consultation/VideoConsultationModal.tsx`](file:///c:/Users/arpit/OneDrive/Desktop/handcraft/frontend/src/components/consultation/VideoConsultationModal.tsx))
- Restricts booking slots strictly to the daily **11:00 AM – 2:00 PM IST** atelier window.
- Displays live slot availability (Available vs. Reserved).
- Generates a Google Meet link and sends email confirmations explaining what to expect during the live moisture test and raw blank inspection.

### 5. Floating Gemini 1.5 Flash Craftsman Assistant ([`src/components/chat/CraftsmanChatWidget.tsx`](file:///c:/Users/arpit/OneDrive/Desktop/handcraft/frontend/src/components/chat/CraftsmanChatWidget.tsx))
- Floating widget with live status indicator.
- Powered by **Master Craftsman Khemraj** persona answering questions on timber cellular density, moisture equilibrium, Vijaysar Ayurvedic blue infusion, and custom consignments.

---

## ⚡ Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run strict TypeScript check
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

