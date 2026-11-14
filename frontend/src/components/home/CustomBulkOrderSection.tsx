'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Layers,
  Send,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Factory,
  Hotel,
} from 'lucide-react';
import { useAtelier } from '@/context/AtelierContext';

export function CustomBulkOrderSection() {
  const { addInquiry } = useAtelier();
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [requirementType, setRequirementType] = useState('Bespoke Unique Design');
  const [quantityAndDetails, setQuantityAndDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !contact || !quantityAndDetails) return;

    setIsSubmitting(true);
    try {
      const saved = await addInquiry({
        customerName: fullName,
        contactInfo: contact,
        requirementType,
        quantityOrScope: requirementType,
        message: quantityAndDetails,
      });
      const suffix = saved.id ? saved.id.slice(-5).toUpperCase() : Math.floor(10000 + Math.random() * 90000);
      setSubmittedTicket(`NGN-${suffix}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setContact('');
    setRequirementType('Bespoke Unique Design');
    setQuantityAndDetails('');
    setSubmittedTicket(null);
  };

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28 bg-[#FAF7F2] border-b border-[#E7E0D3] text-[#1C1917] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Wrapper */}
        <div className="bg-[#F7F4EE] border border-[#E7E0D3] rounded-sm p-6 sm:p-10 lg:p-14 shadow-lg relative overflow-hidden">
          {/* Section Header */}
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAEFEA] border border-[#1E392A]/20 text-[#1E392A] text-xs font-sans font-semibold tracking-[1.5px] uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>NAGINA WOODCRAFT HUB • CUSTOM & BULK MANUFACTURING</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-[#1C1917] font-normal tracking-tight mb-4 leading-tight">
              Custom Designs, Hotel Woodwork & Bulk Orders
            </h2>

            <p className="text-sm sm:text-base text-[#44403C] font-sans leading-relaxed">
              Direct from Nagina ateliers: Custom one-of-a-kind art pieces, luxury solid wood wall & floor tiles, resort/hotel architectural orders, and international container shipments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: 4 Highlight Boxes (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Custom & Unique Designs */}
                <div className="p-5 bg-white border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm shadow-xs transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#F1E8DC] border border-[#DDD6C9] flex items-center justify-center mb-3 text-[#8B5E3C]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base text-[#1C1917] font-semibold mb-1.5">
                    Custom & Unique Designs
                  </h4>
                  <p className="text-xs text-[#44403C] font-sans leading-relaxed">
                    Personalized hand-carvings, family crest monograms, heirloom bespoke armoires, and sovereign turned vessels shaped to your exact blueprints.
                  </p>
                </div>

                {/* 2. Luxury Wooden Wall & Floor Tiles */}
                <div className="p-5 bg-white border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm shadow-xs transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#EAEFEA] border border-[#1E392A]/20 flex items-center justify-center mb-3 text-[#1E392A]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base text-[#1C1917] font-semibold mb-1.5">
                    Luxury Wooden Wall & Floor Tiles
                  </h4>
                  <p className="text-xs text-[#44403C] font-sans leading-relaxed">
                    Hand-carved interlocking solid teak and sheesham 3D geometric relief tiles. Perfect for acoustic feature walls, ceiling canopies, and luxury villas.
                  </p>
                </div>

                {/* 3. Hotel & Resort Bulk Wood Items */}
                <div className="p-5 bg-white border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm shadow-xs transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#F1E8DC] border border-[#DDD6C9] flex items-center justify-center mb-3 text-[#8B5E3C]">
                    <Hotel className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base text-[#1C1917] font-semibold mb-1.5">
                    Hotel & Resort Bulk Wood Items
                  </h4>
                  <p className="text-xs text-[#44403C] font-sans leading-relaxed">
                    High-volume manufacturing of luxury hotel amenities: heavy food-safe serving boards, live-edge vanities, haveli room dividers, and turned tabletop vessels.
                  </p>
                </div>

                {/* 4. Direct Factory Meeting & Worldwide DDP Export */}
                <div className="p-5 bg-white border border-[#E7E0D3] hover:border-[#8B5E3C] rounded-sm shadow-xs transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#EAEFEA] border border-[#1E392A]/20 flex items-center justify-center mb-3 text-[#1E392A]">
                    <Factory className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base text-[#1C1917] font-semibold mb-1.5">
                    Factory Meeting & Worldwide DDP Export
                  </h4>
                  <p className="text-xs text-[#44403C] font-sans leading-relaxed">
                    Visit our Nagina facility in person or coordinate timber selection directly with Yash Sisodia. Full FCL/LCL container shipping with 100% pre-paid DDP customs clearance.
                  </p>
                </div>
              </div>

              {/* Direct Atelier WhatsApp Hotline Banner */}
              <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EDFAF1] text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-sans text-xs font-semibold text-[#1C1917] block">
                      Direct Nagina Artisan Desk
                    </span>
                    <span className="text-[11px] text-[#78716C] font-sans">
                      WhatsApp / Voice: +91 8868031460 • Direct Master Woodwright Consultation
                    </span>
                  </div>
                </div>

                <a
                  href="https://wa.me/918868031460?text=Namaste%20Master%20Craftsman%2C%20I%20am%20inquiring%20about%20a%20custom%20woodwork%20or%20hotel%20bulk%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1E392A] hover:bg-[#162C20] text-white text-xs font-sans uppercase tracking-[1px] font-semibold rounded-sm transition-colors shadow-xs"
                >
                  WhatsApp Now ↗
                </a>
              </div>
            </div>

            {/* Right: Direct Inquiry Form (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E7E0D3] rounded-sm p-6 sm:p-8 shadow-sm">
              {submittedTicket ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#EAEFEA] text-[#1E392A] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
                    Inquiry Dispatched to Nagina Atelier
                  </h3>

                  <div className="bg-[#FAF7F2] p-4 rounded-sm border border-[#E7E0D3] text-left space-y-2">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="text-[#78716C]">Inquiry Reference:</span>
                      <strong className="text-[#1E392A] font-mono font-bold">#{submittedTicket}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="text-[#78716C]">Category:</span>
                      <span className="text-[#1C1917] font-medium">{requirementType}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="text-[#78716C]">Patron Contact:</span>
                      <span className="text-[#1C1917] font-medium">{contact}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#44403C] font-sans leading-relaxed">
                    Official Liaison Desk: Yash Sisodia (SISODIA ATELIER ✧, Nagina) along with our Senior Ustad will examine your specifications and reply via WhatsApp/Email within 4 hours with preliminary estimation & timber blanks.
                  </p>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1C1917] border border-[#DDD6C9] rounded-sm text-xs font-sans font-semibold uppercase tracking-[1px] transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-[#F3EDE2] pb-3 mb-2">
                    <h3 className="font-serif text-xl text-[#1C1917] font-semibold">
                      Direct Atelier Inquiry & Meeting Request
                    </h3>
                    <p className="text-[11px] font-sans text-[#78716C] mt-0.5">
                      Receive custom quotation, timber selection, or coordinate an in-person factory visit.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-[#1C1917] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Lord Julian Vance / Alvi Design Studio"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3.5 py-2.5 text-xs text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-[#1C1917] mb-1">
                      Email or WhatsApp Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. contact@domain.com or +1 (555) 019-2834"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3.5 py-2.5 text-xs text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-[#1C1917] mb-1">
                      Requirement Type *
                    </label>
                    <select
                      value={requirementType}
                      onChange={(e) => setRequirementType(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3.5 py-2.5 text-xs text-[#1C1917] outline-none transition-colors cursor-pointer"
                    >
                      <option value="Bespoke Unique Design">Bespoke Unique Design (One-of-a-Kind Art Piece)</option>
                      <option value="Solid Wooden Tiles">Solid Wooden Tiles (Wall & Floor Architectural Inlay)</option>
                      <option value="Hotel / Bulk Order">Hotel & Resort Bulk Wood Items (Hospitality Supply)</option>
                      <option value="Factory Visit & Atelier Meeting">Factory Visit & In-Person Meeting (Nagina Facility)</option>
                      <option value="International Container Export">International Container / FCL Export</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-[#1C1917] mb-1">
                      Order Quantity & Specifications Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={quantityAndDetails}
                      onChange={(e) => setQuantityAndDetails(e.target.value)}
                      placeholder="Specify required dimensions, wood species (Teak/Sheesham/Walnut), estimated square meters or unit quantity, project timeline, or link to CAD/Pinterest moodboards..."
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3.5 py-2.5 text-xs text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#1E392A] hover:bg-[#162C20] disabled:opacity-60 text-white font-sans font-semibold text-xs tracking-[1.5px] uppercase rounded-sm transition-all shadow-md flex items-center justify-center gap-2 group"
                  >
                    <span>{isSubmitting ? 'Transmitting to Atelier...' : 'Send Inquiry / Fix Meeting'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#78716C] font-sans pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E392A]" />
                    <span>Strict NDA Protected • Zero Obligation Atelier Quote • 100% Direct Manufacturer</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

