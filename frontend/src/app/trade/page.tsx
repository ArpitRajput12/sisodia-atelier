'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAtelier } from '@/context/AtelierContext';
import {
  ShieldCheck,
  Building2,
  Container,
  Flame,
  Plane,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  FileText,
  Clock,
  Check,
  Calendar,
} from 'lucide-react';

export default function TradeProgramPage() {
  const { addInquiry } = useAtelier();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<'rfq' | 'meeting'>('rfq');

  // Form State
  const [firmName, setFirmName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('USA');
  const [projectScope, setProjectScope] = useState('Boutique Luxury Hotel');
  const [estimatedVolume, setEstimatedVolume] = useState('Full 40ft High-Cube Container');
  const [specifications, setSpecifications] = useState('');

  // Meeting specific
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('14:00 - 15:00 IST');
  const [meetingTopic, setMeetingTopic] = useState('Architectural Specifications & Timber Review');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formMode === 'meeting') {
        await addInquiry({
          customerName: `${contactPerson || 'Trade Principal'} (${firmName || 'Architecture Studio'})`,
          contactInfo: `${email}${phone ? ` • ${phone}` : ''}`,
          requirementType: 'MEETING_REQUEST',
          quantityOrScope: `${country} • Slot: ${meetingDate || 'Next Available'} ${meetingTime}`,
          message: `Topic: ${meetingTopic}. Notes: ${specifications || 'Private consultation requested with Yash Sisodia.'}`,
        });
      } else {
        await addInquiry({
          customerName: `${contactPerson || 'Trade Principal'} (${firmName || 'Architecture Studio'})`,
          contactInfo: `${email}${phone ? ` • ${phone}` : ''}`,
          requirementType: `Hotel & Trade — ${projectScope}`,
          quantityOrScope: `${estimatedVolume} (${country})`,
          message: specifications || `${projectScope} specification inquiry for ${country}.`,
        });
      }
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Path */}
        <nav className="flex items-center space-x-2 text-xs font-sans text-[#78716C] mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-[#1E392A] transition-colors">
            Atelier Home
          </Link>
          <span>/</span>
          <span className="text-[#8B5E3C] font-semibold">International Trade & Contract Program</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F1E8DC] border border-[#E7E0D3] text-[#8B5E3C] text-[11px] font-sans tracking-[2px] uppercase mb-4 rounded-full font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Architectural & Hospitality Contract Division</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal tracking-tight leading-tight">
            Bulk Consignments & Bespoke Hotel Commissions
          </h1>

          <p className="mt-5 text-sm sm:text-base text-[#44403C] font-sans leading-relaxed">
            Collaborating with world-class interior architecture studios, five-star heritage hotels, and
            luxury private estates across Manhattan, Mayfair, Geneva, and Dubai. We manufacture
            monolithic solid heartwood furniture at scale with uncompromising master craftsmanship.
          </p>
        </div>

        {/* 3 Key Metric Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-8 bg-white border border-[#E7E0D3] rounded-sm shadow-xs hover:border-[#8B5E3C] transition-all">
            <div className="w-12 h-12 rounded-sm bg-[#F7F4EE] border border-[#DDD6C9] flex items-center justify-center text-[#1E392A] mb-6">
              <Container className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-bold mb-2">
              20+ 40ft High-Cube
            </div>
            <h3 className="text-xs font-sans uppercase tracking-[1.5px] text-[#8B5E3C] font-semibold mb-2">
              Containers Exported Annually
            </h3>
            <p className="text-xs text-[#44403C] font-sans leading-relaxed">
              Consolidated ocean freight to Rotterdam, Hamburg, Southampton, New York, Long Beach, and
              Jebel Ali. Full container load (FCL) and less than container load (LCL).
            </p>
          </div>

          <div className="p-8 bg-white border border-[#E7E0D3] rounded-sm shadow-xs hover:border-[#8B5E3C] transition-all">
            <div className="w-12 h-12 rounded-sm bg-[#F7F4EE] border border-[#DDD6C9] flex items-center justify-center text-[#1E392A] mb-6">
              <Flame className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-bold mb-2">
              7.2% Certified
            </div>
            <h3 className="text-xs font-sans uppercase tracking-[1.5px] text-[#8B5E3C] font-semibold mb-2">
              Kiln-Dried Timber Equilibrium
            </h3>
            <p className="text-xs text-[#44403C] font-sans leading-relaxed">
              Every timber blank undergoes automated moisture equilibrium audits. Certified to withstand
              extreme US/EU winter indoor central heating without warping, checking, or seam splitting.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#E7E0D3] rounded-sm shadow-xs hover:border-[#8B5E3C] transition-all">
            <div className="w-12 h-12 rounded-sm bg-[#F7F4EE] border border-[#DDD6C9] flex items-center justify-center text-[#1E392A] mb-6">
              <Plane className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-bold mb-2">
              DDP Port-to-Door
            </div>
            <h3 className="text-xs font-sans uppercase tracking-[1.5px] text-[#8B5E3C] font-semibold mb-2">
              Delivered Duty Paid Worldwide
            </h3>
            <p className="text-xs text-[#44403C] font-sans leading-relaxed">
              Zero customs paperwork for your procurement team. SISODIA ATELIER ✧ handles international
              tariffs, Phytosanitary ISPM-15, CITES legal timber verification, and white-glove site delivery.
            </p>
          </div>
        </div>

        {/* 2-Column Trade Section: RFQ Form & Direct Liaison Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Trade RFQ Form */}
          <div className="lg:col-span-7 bg-white border border-[#E7E0D3] rounded-sm p-6 sm:p-10 shadow-lg">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#EAEFEA] border border-[#1E392A]/30 mx-auto flex items-center justify-center text-[#1E392A]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-normal">
                  {formMode === 'meeting' ? 'Consultation Request Confirmed' : 'Contract RFQ Transmitted'}
                </h3>
                <p className="text-xs text-[#44403C] font-sans max-w-md mx-auto leading-relaxed">
                  Official Liaison Desk: Yash Sisodia (SISODIA ATELIER ✧, Nagina) has received your dossier for{' '}
                  <span className="text-[#8B5E3C] font-semibold">{firmName}</span>. A formal trade catalog,
                  timber moisture audit sheet, and confirmation will be dispatched to{' '}
                  <span className="text-[#8B5E3C] font-semibold">{email}</span> within 24 business hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-[#F7F4EE] hover:bg-[#F3EDE2] text-[#1C1917] text-xs font-sans uppercase tracking-wider rounded-sm transition-colors border border-[#DDD6C9]"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Mode Toggle */}
                <div className="flex border border-[#DDD6C9] rounded-sm p-1 bg-[#FAF7F2] gap-1">
                  <button
                    type="button"
                    onClick={() => setFormMode('rfq')}
                    className={`flex-1 py-2 text-xs font-sans uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
                      formMode === 'rfq'
                        ? 'bg-[#1E392A] text-white shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Commercial Trade RFQ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode('meeting')}
                    className={`flex-1 py-2 text-xs font-sans uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
                      formMode === 'meeting'
                        ? 'bg-[#1E392A] text-white shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Consultation</span>
                  </button>
                </div>

                <div>
                  <h2 className="font-serif text-2xl text-[#1C1917] font-normal">
                    {formMode === 'meeting'
                      ? 'Schedule a Private Architectural Consultation'
                      : 'Request Commercial Trade Dossier & Quote'}
                  </h2>
                  <p className="text-xs text-[#78716C] font-sans mt-1">
                    {formMode === 'meeting'
                      ? 'Direct appointment with Yash Sisodia to review blueprints, timber specs, and volume schedules.'
                      : 'Direct factory-gate pricing with turnkey DDP export clearance.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                      Architecture / Hospitality Firm *
                    </label>
                    <input
                      type="text"
                      required
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      placeholder="e.g. Rockwell Group / Aman Resorts"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                      Lead Architect / Procurement Contact *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Marcus Vance, Principal"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="procurement@firm.com"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                      Direct WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (212) 555-0182"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                      Destination Country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3 py-2.5 rounded-sm outline-none font-sans"
                    >
                      <option value="USA">USA (USD $)</option>
                      <option value="UK">UK (GBP £)</option>
                      <option value="Europe">Europe (EUR €)</option>
                      <option value="Australia">Australia (AUD A$)</option>
                      <option value="Dubai">Dubai (AED د.إ)</option>
                      <option value="Netherlands">Netherlands (EUR €)</option>
                      <option value="Germany">Germany (EUR €)</option>
                      <option value="Canada">Canada (CAD C$)</option>
                      <option value="France">France (EUR €)</option>
                      <option value="Mexico">Mexico (MXN MX$)</option>
                      <option value="UAE">UAE (AED د.إ)</option>
                    </select>
                  </div>

                  {formMode === 'rfq' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Project Typology *
                        </label>
                        <select
                          value={projectScope}
                          onChange={(e) => setProjectScope(e.target.value)}
                          className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3 py-2.5 rounded-sm outline-none font-sans"
                        >
                          <option value="Boutique Luxury Hotel">Boutique Luxury Hotel</option>
                          <option value="Private Estate & Villa">Private Estate & Villa</option>
                          <option value="Heritage Palace Restoration">Heritage Palace Restoration</option>
                          <option value="High-End Dining Salon">High-End Dining Salon</option>
                          <option value="Art Gallery / Museum">Art Gallery / Museum</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Estimated Volume *
                        </label>
                        <select
                          value={estimatedVolume}
                          onChange={(e) => setEstimatedVolume(e.target.value)}
                          className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3 py-2.5 rounded-sm outline-none font-sans"
                        >
                          <option value="Single Prototype / Sampling">Single Prototype / Sampling</option>
                          <option value="Partial Container (LCL - 10-25 Pieces)">
                            Partial Container (LCL - 10-25 Pieces)
                          </option>
                          <option value="Full 20ft Container (30-60 Pieces)">
                            Full 20ft Container (30-60 Pieces)
                          </option>
                          <option value="Full 40ft High-Cube (80+ Pieces)">
                            Full 40ft High-Cube (80+ Pieces)
                          </option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Preferred Date *
                        </label>
                        <input
                          type="date"
                          required={formMode === 'meeting'}
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3 py-2.5 rounded-sm outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Time Slot (IST) *
                        </label>
                        <select
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3 py-2.5 rounded-sm outline-none font-sans"
                        >
                          <option value="11:00 - 12:00 IST">11:00 - 12:00 IST (Morning)</option>
                          <option value="14:00 - 15:00 IST">14:00 - 15:00 IST (Afternoon)</option>
                          <option value="16:00 - 17:00 IST">16:00 - 17:00 IST (Evening)</option>
                          <option value="19:00 - 20:00 IST">19:00 - 20:00 IST (Europe/US Sync)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {formMode === 'meeting' && (
                  <div>
                    <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                      Consultation Topic *
                    </label>
                    <select
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3 py-2.5 rounded-sm outline-none font-sans"
                    >
                      <option value="Architectural Specifications & Timber Review">
                        Architectural Specifications & Timber Review
                      </option>
                      <option value="Monolithic Urns & Planters Sizing">
                        Monolithic Urns & Planters Sizing
                      </option>
                      <option value="Custom Solid Wooden Tiles & Panels">
                        Custom Solid Wooden Tiles & Panels
                      </option>
                      <option value="Hotel FCL/LCL Container Export Logistics">
                        Hotel FCL/LCL Container Export Logistics
                      </option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                    {formMode === 'meeting'
                      ? 'Consultation Notes & Design Brief'
                      : 'Custom Architectural Specifications & CAD Scope'}
                  </label>
                  <textarea
                    rows={4}
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    placeholder={
                      formMode === 'meeting'
                        ? 'Briefly outline the space, timber species, or specific architectural topics you wish to review during the consultation...'
                        : 'Provide details on requested timber species (Burma Teak, Desert Sheesham, Vijaysar, Rosewood), custom dimensions, brass inlay patterns, or target installation dates...'
                    }
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#8B5E3C] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#1E392A] hover:bg-[#162C20] disabled:bg-[#DDD6C9] text-white font-sans text-xs tracking-[2px] uppercase font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Encrypting & Transmitting Dossier...
                    </span>
                  ) : (
                    <>
                      {formMode === 'meeting' ? (
                        <>
                          <Calendar className="w-4 h-4" />
                          Confirm Consultation Request
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Submit Commercial Trade RFQ
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Trade Liaison Desk */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 bg-white border border-[#E7E0D3] rounded-sm space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-sans tracking-[2px] uppercase text-[#8B5E3C] block mb-1 font-semibold">
                  Immediate Export Inquiry
                </span>
                <h3 className="font-serif text-2xl text-[#1C1917] font-normal">
                  Official Liaison Desk: Yash Sisodia
                </h3>
                <p className="text-xs text-[#78716C] font-sans mt-1">
                  Founder & Principal: Yash Sisodia (SISODIA ATELIER ✧, Nagina)
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-[#F3EDE2] text-xs font-sans">
                <a
                  href="mailto:Sisodiaatelier09@gmail.com"
                  className="flex items-center gap-3 p-3.5 bg-[#F7F4EE] border border-[#DDD6C9] hover:border-[#8B5E3C] rounded-sm text-[#1C1917] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#78716C] block font-medium">Direct Trade Email</span>
                    <span className="font-semibold text-[#1C1917]">Sisodiaatelier09@gmail.com</span>
                  </div>
                </a>

                <a
                  href="https://wa.me/918868031460?text=Hello%20Yash%20Sisodia%20Desk%2C%20we%20have%20an%20architectural%20inquiry%20for%20SISODIA%20ATELIER%20%E2%9C%A7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-[#F7F4EE] border border-[#DDD6C9] hover:border-[#1E392A] rounded-sm text-[#1C1917] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#1E392A] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#78716C] block font-medium">WhatsApp Export Desk (IST Hours)</span>
                    <span className="font-semibold text-[#1C1917]">+91 8868031460</span>
                  </div>
                </a>
              </div>

              {/* Direct Architectural Woodcraft Concierge */}
              <div className="p-4 bg-[#EAEFEA] border border-[#1E392A]/20 rounded-sm space-y-2">
                <div className="flex items-center gap-2 text-[#1E392A] text-xs font-semibold font-sans">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Direct Yash Sisodia Architectural Concierge</span>
                </div>
                <p className="text-[11px] text-[#44403C] font-sans leading-relaxed">
                  Architects and hospitality procurement teams can share CAD drawings, 3D relief tile patterns, and timber species requirements for rapid formal RFQ quotation.
                </p>
              </div>
            </div>

            {/* Contract Standards */}
            <div className="p-6 bg-white border border-[#E7E0D3] rounded-sm space-y-3 font-sans text-xs shadow-xs">
              <h4 className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold mb-2">
                Atelier Contract Guarantees
              </h4>

              <div className="space-y-2 text-[#44403C] text-[11px]">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0 mt-0.5" />
                  <span>Complete CITES Certificate of Origin for international legal forestry compliance</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0 mt-0.5" />
                  <span>CAD file conversion & 1:1 scale mockups within 14 business days</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0 mt-0.5" />
                  <span>Custom laser or engraved bronze identity hallmark plaques for hotel projects</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1E392A] shrink-0 mt-0.5" />
                  <span>Rigid ISPM-15 export crating with 3-axis electronic impact indicators</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
