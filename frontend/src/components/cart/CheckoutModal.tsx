'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAtelier } from '@/context/AtelierContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  createOrder,
  createStripePaymentIntent,
  createPayPalOrder,
  createRazorpayOrder,
} from '@/lib/api';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  Plane,
  ArrowRight,
  Sparkles,
  Building,
  AlertCircle,
  User,
} from 'lucide-react';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentGateway = 'STRIPE' | 'PAYPAL' | 'RAZORPAY';

const COUNTRIES = [
  { code: 'US', name: 'USA (USD $)', defaultCurr: 'USD' },
  { code: 'GB', name: 'UK (GBP £)', defaultCurr: 'GBP' },
  { code: 'EU', name: 'Europe (EUR €)', defaultCurr: 'EUR' },
  { code: 'AU', name: 'Australia (AUD A$)', defaultCurr: 'AUD' },
  { code: 'AE-DU', name: 'Dubai (AED د.إ)', defaultCurr: 'AED' },
  { code: 'NL', name: 'Netherlands (EUR €)', defaultCurr: 'EUR' },
  { code: 'DE', name: 'Germany (EUR €)', defaultCurr: 'EUR' },
  { code: 'CA', name: 'Canada (CAD C$)', defaultCurr: 'CAD' },
  { code: 'FR', name: 'France (EUR €)', defaultCurr: 'EUR' },
  { code: 'MX', name: 'Mexico (MXN MX$)', defaultCurr: 'MXN' },
  { code: 'AE', name: 'UAE (AED د.إ)', defaultCurr: 'AED' },
];

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotalUsd, subtotalInr, clearCart } = useCart();
  const { currency, formatPriceFromINR } = useCurrency();
  const { addOrder } = useAtelier();
  const { customer, token, isLoggedIn, openAuthModal } = useCustomerAuth();

  // Initial gateway selection: Stripe or PayPal for international export
  const [gateway, setGateway] = useState<PaymentGateway>('STRIPE');

  // Form State
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxError, setTaxError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [patronNotes, setPatronNotes] = useState('');

  // Auto-fill patron details when customer is logged in
  useEffect(() => {
    if (isOpen && customer) {
      if (customer.name) setFullName(customer.name);
      if (customer.email) setEmail(customer.email);
      if (customer.phone) setPhone(customer.phone);
      if (customer.savedAddress) setAddressLine1(customer.savedAddress);
      if (customer.savedCity) setCity(customer.savedCity);
      if (customer.savedPostalCode) setPostalCode(customer.savedPostalCode);
      if (customer.countryCode) setCountryCode(customer.countryCode);
      if (customer.firmName) setCompanyName(customer.firmName);
      if (customer.gstOrTaxId) setTaxId(customer.gstOrTaxId);
    }
  }, [isOpen, customer]);

  // Status
  const [status, setStatus] = useState<'idle' | 'processing' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedConsignment, setConfirmedConsignment] = useState<{
    orderNumber: string;
    trackingCode: string;
    carrier: string;
    date: string;
  } | null>(null);

  // Close on Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxError(null);
    setErrorMessage('');

    // Mandatory GST / Tax ID validation when Estate / Firm Name is non-empty
    const trimmedFirm = companyName.trim();
    const trimmedTax = taxId.trim();

    if (trimmedFirm.length > 0) {
      if (!trimmedTax) {
        const errorText =
          countryCode === 'IN'
            ? '15-digit GSTIN is mandatory when Estate / Firm Name is specified.'
            : 'Business Tax ID / VAT / EIN is mandatory when Estate / Firm Name is specified.';
        setTaxError(errorText);
        return;
      }

      if (countryCode === 'IN') {
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
        if (!gstinRegex.test(trimmedTax)) {
          setTaxError(
            'Invalid Indian GSTIN format. Must be 15 alphanumeric characters (e.g. 09ABCDE5678F1Z5).'
          );
          return;
        }
      } else {
        if (trimmedTax.length < 5) {
          setTaxError(
            'Please provide a valid Business Tax ID / VAT / EIN (minimum 5 characters).'
          );
          return;
        }
      }
    }

    setStatus('processing');

    try {
      const inrTotal = subtotalInr || Math.round(subtotalUsd * 84);
      const lineItems = items.map((item) => ({
        title: item.product.title,
        sku: item.product.sku,
        woodSpecies: item.product.woodSpecies,
        quantity: item.quantity,
        priceInr: item.product.basePriceInr || Math.round(item.product.basePriceUsd * 84),
        priceUsd: item.product.basePriceUsd,
      }));

      // 1. Create order payload
      const orderPayload = {
        currency,
        paymentProvider: gateway,
        customerEmail: email || customer?.email,
        customerName: fullName || customer?.name,
        guestEmail: email || customer?.email,
        guestPhone: phone,
        totalINR: inrTotal,
        totalForeign: subtotalUsd,
        items: lineItems,
        shippingAddress: {
          fullName,
          companyName: trimmedFirm || undefined,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          stateProvince,
          postalCode,
          countryCode,
          phoneNumber: phone,
          vatTaxNumber: trimmedTax || undefined,
        },
        patronNotes: patronNotes || undefined,
      };

      const orderRes = await createOrder(orderPayload, token);
      const generatedOrderId =
        orderRes?.data?.orderNumber ||
        `SC-${Math.floor(1000 + Math.random() * 9000)}-${countryCode === 'IN' ? 'DEL' : 'INTL'}`;

      // 2. Trigger relevant payment initiation
      if (gateway === 'STRIPE') {
        await createStripePaymentIntent(generatedOrderId, currency);
      } else if (gateway === 'PAYPAL') {
        await createPayPalOrder(generatedOrderId);
      } else if (gateway === 'RAZORPAY') {
        await createRazorpayOrder(generatedOrderId);
      }

      const trackingCode =
        countryCode === 'IN'
          ? `SA-NAGINA-LATHE-${Math.floor(1000 + Math.random() * 9000)}`
          : `DHL-EXP-${Math.floor(100000 + Math.random() * 900000)}`;
      const carrier =
        countryCode === 'IN'
          ? 'BlueDart Apex Priority (DDP Doorstep Handover)'
          : 'DHL Express Transatlantic Air Cargo';

      addOrder({
        id: `ord-${Date.now()}`,
        orderNumber: generatedOrderId,
        customerName: fullName,
        customerEmail: email,
        firmName: trimmedFirm || undefined,
        gstNumber: trimmedFirm ? trimmedTax.toUpperCase() : undefined,
        paymentGateway: gateway,
        destination: `${city}${stateProvince ? `, ${stateProvince}` : ''}, ${countryCode}`,
        shippingAddress: {
          line1: addressLine1,
          line2: addressLine2 || undefined,
          city,
          state: stateProvince,
          postalCode,
          countryCode,
          phoneNumber: phone,
        },
        lineItems: items.map((item) => ({
          title: item.product.title,
          sku: item.product.sku,
          woodSpecies: item.product.woodSpecies,
          quantity: item.quantity,
          priceInr: item.product.basePriceInr || Math.round(item.product.basePriceUsd * 84),
          priceUsd: item.product.basePriceUsd,
        })),
        itemsSummary:
          items.length > 0
            ? items.map((item) => `${item.quantity}x ${item.product.title}`).join(', ')
            : 'SISODIA ATELIER ✧ Bespoke Timber Consignment',
        totalAmountUsd: subtotalUsd,
        totalAmountInr: inrTotal,
        currency,
        status: 'ORDER_CONFIRMED',
        trackingStage: 1,
        courierPartner: carrier,
        trackingNumber: trackingCode,
        currentCheckpoint: 'Nagina Atelier Dispatch Desk — ISPM-15 Cedar Crate Assigned',
        estimatedDelivery: countryCode === 'IN' ? '3–5 Days Domestic Express' : '7–10 Days Worldwide Air Express',
        ownerCancelConfirmed: false,
        createdAt: new Date().toISOString(),
      });

      // 3. Mark success
      setConfirmedConsignment({
        orderNumber: generatedOrderId,
        trackingCode,
        carrier,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      });
      clearCart();
      setStatus('confirmed');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Payment initiation encountered an error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative w-[96vw] max-w-6xl mx-auto my-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm shadow-2xl overflow-hidden text-[#1C1917] font-sans flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E7E0D3] flex items-center justify-between bg-[#F7F4EE] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-sm bg-[#1E392A] text-white flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal leading-tight">
                {status === 'confirmed' ? 'Consignment Allocated' : 'DDP Secure Atelier Checkout'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#8B5E3C] font-sans tracking-wider uppercase font-semibold">
                Pure Nagina Solid Wood • 100% Insured DDP Delivery • $0 Doorstep Tariffs
              </p>
            </div>
          </div>
          {/* Top-Right Close (×) Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[#E5DEC9] bg-white hover:bg-[#1C1917] hover:text-white flex items-center justify-center transition-colors text-2xl font-serif leading-none shrink-0 shadow-xs text-[#57534E]"
            aria-label="Close Checkout"
          >
            ×
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8">
          {status === 'confirmed' && confirmedConsignment ? (
            <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="w-16 h-16 rounded-full bg-[#EAEFEA] border border-[#1E392A]/30 mx-auto flex items-center justify-center text-[#1E392A]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-[2px] text-[#8B5E3C] font-sans font-bold block mb-1">
                  Consignment Sealed in Nagina Logs
                </span>
                <h3 className="font-serif text-3xl text-[#1C1917] font-normal">
                  Thank You, {fullName || 'Honored Patron'}
                </h3>
                <p className="text-xs text-[#57534E] font-sans max-w-lg mx-auto mt-2 leading-relaxed">
                  Your solid heartwood heirloom is logged under atelier order{' '}
                  <strong className="text-[#1C1917] font-mono">{confirmedConsignment.orderNumber}</strong>.
                  Kiln moisture audit and ISPM-15 fumigated cedar vault crating have commenced.
                </p>
              </div>

              {/* Consignment Badge */}
              <div className="bg-white border border-[#E7E0D3] p-5 rounded-sm max-w-lg mx-auto text-left font-sans space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-[#F3EDE2]">
                  <span className="text-[#78716C]">Order Reference:</span>
                  <span className="font-mono text-[#8B5E3C] font-bold">{confirmedConsignment.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-[#F3EDE2]">
                  <span className="text-[#78716C]">Consignment Waybill:</span>
                  <span className="font-mono text-[#1C1917] font-bold">{confirmedConsignment.trackingCode}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-[#F3EDE2]">
                  <span className="text-[#78716C]">Air Freight Courier:</span>
                  <span className="text-[#1C1917] font-medium">{confirmedConsignment.carrier}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#78716C]">Customs Clearance:</span>
                  <span className="text-emerald-800 font-semibold">100% Pre-Paid DDP ($0 Doorstep Tariffs)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="px-6 py-3 bg-[#1E392A] hover:bg-[#162C20] text-white font-sans text-xs tracking-[1.5px] uppercase font-semibold rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  Track on Live Consignment Radar
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white hover:bg-[#F3EDE2] text-[#1C1917] border border-[#DDD6C9] rounded-sm font-sans text-xs tracking-wider uppercase transition-colors"
                >
                  Return to Atelier
                </button>
              </div>
            </div>
          ) : !isLoggedIn ? (
            <div className="max-w-md mx-auto text-center py-12 px-6 bg-white border border-[#E7E0D3] rounded-sm shadow-xs space-y-4 my-8">
              <div className="w-12 h-12 rounded-full bg-[#1E392A] text-white flex items-center justify-center mx-auto shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
                Patron Sign-In Required
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                To guarantee white-glove DDP shipment protection, customs provenance certificates, and private shipment tracking, an authenticated client account is required before placing an order.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('Sign in or register to proceed with your order.');
                }}
                className="w-full py-3.5 bg-[#1E392A] hover:bg-[#162C20] text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition cursor-pointer shadow-xs"
              >
                Sign In or Register with 1-Click
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trust Banner */}
              <div className="p-3.5 bg-[#EAEFEA] border border-[#1E392A]/20 rounded-sm flex items-center justify-between text-[#1E392A] text-xs font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#1E392A]" />
                  <span>
                    <strong>100% Delivered Duty Paid (DDP) Sovereign Transit</strong> — Destination import tariffs,
                    customs clearance, and CITES compliance are 100% pre-settled.
                  </span>
                </div>
                <span className="hidden md:inline font-mono font-bold text-xs shrink-0">$0 Doorstep Fees</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (7 cols): Payment, Patron & Shipping Information */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Gateway Selector */}
                  <div>
                    <label className="block text-[11px] font-sans tracking-[1.5px] uppercase text-[#44403C] font-semibold mb-2.5">
                      Select Escrow Payment Gateway
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Stripe */}
                      <button
                        type="button"
                        onClick={() => setGateway('STRIPE')}
                        className={`p-3.5 border rounded-sm text-left transition-all ${
                          gateway === 'STRIPE'
                            ? 'border-[#1E392A] bg-white text-[#1C1917] shadow-xs ring-1 ring-[#1E392A]'
                            : 'border-[#DDD6C9] bg-[#F7F4EE] text-[#44403C] hover:border-[#8B5E3C]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif text-sm font-semibold">Stripe Global</span>
                          <CreditCard className="w-4 h-4 text-[#8B5E3C]" />
                        </div>
                        <p className="text-[10px] text-[#78716C] font-sans leading-tight">
                          Visa, MasterCard, Amex, Apple Pay & Google Pay
                        </p>
                      </button>

                      {/* PayPal */}
                      <button
                        type="button"
                        onClick={() => setGateway('PAYPAL')}
                        className={`p-3.5 border rounded-sm text-left transition-all ${
                          gateway === 'PAYPAL'
                            ? 'border-[#1E392A] bg-white text-[#1C1917] shadow-xs ring-1 ring-[#1E392A]'
                            : 'border-[#DDD6C9] bg-[#F7F4EE] text-[#44403C] hover:border-[#8B5E3C]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif text-sm font-semibold">PayPal Vault</span>
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-[10px] text-[#78716C] font-sans leading-tight">
                          Global Collector Protection (USD, GBP, EUR, CHF)
                        </p>
                      </button>

                      {/* Razorpay */}
                      <button
                        type="button"
                        onClick={() => setGateway('RAZORPAY')}
                        className={`p-3.5 border rounded-sm text-left transition-all ${
                          gateway === 'RAZORPAY'
                            ? 'border-[#1E392A] bg-white text-[#1C1917] shadow-xs ring-1 ring-[#1E392A]'
                            : 'border-[#DDD6C9] bg-[#F7F4EE] text-[#44403C] hover:border-[#8B5E3C]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif text-sm font-semibold">Razorpay India</span>
                          <Building className="w-4 h-4 text-emerald-700" />
                        </div>
                        <p className="text-[10px] text-[#78716C] font-sans leading-tight">
                          UPI, RuPay, Corporate RTGS & Netbanking (INR)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Patron Details */}
                  <div className="space-y-4">
                    {isLoggedIn && (
                      <div className="p-3 bg-[#EAEFEA] border border-[#1E392A]/20 rounded-sm text-xs text-[#1E392A] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                          <span>
                            Autofilled from verified patron profile: <strong>{customer?.name}</strong> ({customer?.email})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-[#1E392A] text-white px-2 py-0.5 rounded-xs">
                          Patron
                        </span>
                      </div>
                    )}

                    <h4 className="text-[11px] font-sans tracking-[1.5px] uppercase text-[#1C1917] font-semibold border-b border-[#E7E0D3] pb-1">
                      Patron & Estate Credentials
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Patron Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alexander Wright"
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Estate / Firm Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (!e.target.value.trim()) setTaxError(null);
                          }}
                          placeholder="e.g. Wright Heritage Residences / Studio"
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Conditional Mandatory GST / Business Tax ID Field */}
                    {companyName.trim().length > 0 && (
                      <div className="p-3.5 bg-[#FAF3EA] border border-[#E0D0BE] rounded-sm space-y-1.5 transition-all">
                        <label className="block text-[11px] font-sans font-semibold text-[#8B5E3C] uppercase tracking-wider">
                          {countryCode === 'IN'
                            ? 'Firm GSTIN (Mandatory 15-Digit Indian Tax ID) *'
                            : 'Business Tax ID / VAT / EIN (Mandatory for Firm Invoices) *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={taxId}
                          onChange={(e) => {
                            setTaxId(e.target.value);
                            setTaxError(null);
                          }}
                          placeholder={
                            countryCode === 'IN'
                              ? 'e.g. 09ABCDE5678F1Z5'
                              : 'e.g. GB-VAT-99281940 / US-EIN-12-9847291'
                          }
                          className={`w-full bg-white border text-xs px-3.5 py-2.5 rounded-sm outline-none font-mono uppercase ${
                            taxError
                              ? 'border-red-500 focus:border-red-600'
                              : 'border-[#DDD6C9] focus:border-[#1E392A]'
                          }`}
                        />
                        {taxError ? (
                          <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {taxError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#78716C] font-sans">
                            {countryCode === 'IN'
                              ? 'Official 15-digit GSTIN used to generate valid B2B tax invoice with 12% GST credit.'
                              : 'Used for export customs declaration and official foreign trade tax receipt.'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Patron Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patron@estate.com"
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Direct Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (212) 555-0199 / +91 98110 00000"
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Delivery Coordinates */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[11px] font-sans tracking-[1.5px] uppercase text-[#1C1917] font-semibold border-b border-[#E7E0D3] pb-1">
                        Consignment Destination Coordinates
                      </h4>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Delivery Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder="Street address, villa number, private estate entry"
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans mb-2"
                        />
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Apartment, suite, building, gate code (optional)"
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. New York / London"
                            className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                            State / Province *
                          </label>
                          <input
                            type="text"
                            required
                            value={stateProvince}
                            onChange={(e) => setStateProvince(e.target.value)}
                            placeholder="e.g. NY / Greater London"
                            className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 10013 / W1K 4QG"
                            className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Destination Country (DDP Sovereign Clearance) *
                        </label>
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2.5 rounded-sm outline-none font-sans"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans text-[#44403C] font-medium mb-1">
                          Atelier Monogram & Gate Handover Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={patronNotes}
                          onChange={(e) => setPatronNotes(e.target.value)}
                          placeholder="Custom brass inlay initials, uncrating appointment preference, or gate security clearance..."
                          className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] text-[#1C1917] text-xs px-3.5 py-2 rounded-sm outline-none font-sans resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (5 cols): Order Summary, DDP Guarantee, and Pay */}
                <div className="lg:col-span-5 bg-white border border-[#E7E0D3] rounded-sm p-6 space-y-5 shadow-xs">
                  <h4 className="font-serif text-xl text-[#1C1917] border-b border-[#E7E0D3] pb-3 flex items-center justify-between">
                    <span>Consignment Summary</span>
                    <span className="text-xs font-sans text-[#8B5E3C] font-semibold uppercase tracking-wider">
                      {items.length} {items.length === 1 ? 'Piece' : 'Pieces'}
                    </span>
                  </h4>

                  {/* Line Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#F3EDE2] pr-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <p className="font-serif text-sm text-[#1C1917] font-semibold">{item.product.title}</p>
                          <p className="text-[11px] text-[#78716C] font-sans mt-0.5">
                            {item.quantity} × {item.product.woodSpecies}
                          </p>
                          <span className="text-[10px] font-mono text-[#8B5E3C]">SKU: {item.product.sku}</span>
                        </div>
                        <span className="font-serif font-bold text-[#1C1917] shrink-0 text-sm">
                          {formatPriceFromINR((item.product.basePriceInr || item.product.basePriceUsd * 84) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Itemized Calculation */}
                  <div className="space-y-2 border-t border-[#E7E0D3] pt-4 text-xs font-sans">
                    <div className="flex justify-between text-[#57534E]">
                      <span>Heartwood Timber Subtotal</span>
                      <span className="font-mono text-[#1C1917]">
                        {formatPriceFromINR(subtotalInr || subtotalUsd * 84)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#57534E]">
                      <span>ISPM-15 Cedar Vault Crating</span>
                      <span className="text-emerald-800 font-semibold uppercase text-[11px]">Complimentary</span>
                    </div>

                    <div className="flex justify-between text-[#57534E]">
                      <span>Import Customs, Duty & VAT (DDP)</span>
                      <span className="text-emerald-800 font-semibold uppercase text-[11px]">100% Pre-Paid</span>
                    </div>

                    <div className="flex justify-between text-[#57534E]">
                      <span>Transatlantic Air Cargo Express</span>
                      <span className="text-emerald-800 font-semibold uppercase text-[11px]">Included</span>
                    </div>

                    <div className="border-t border-[#E7E0D3] pt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#78716C] block font-sans font-bold">
                          Total Investment ({currency})
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold">
                          $0 Doorstep Tariffs Guaranteed
                        </span>
                      </div>
                      <span className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-bold">
                        {formatPriceFromINR(subtotalInr || subtotalUsd * 84)}
                      </span>
                    </div>
                  </div>

                  {/* Reassurance Callout */}
                  <div className="p-3 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm text-[11px] font-sans text-[#44403C] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#1E392A] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Atelier CITES & Phytosanitary Protection</span>
                    </div>
                    <p className="text-[#78716C] text-[10px] leading-relaxed">
                      All wood species are harvested under strict Indian Ministry of Environment & Forests permits. No secondary broker invoices.
                    </p>
                  </div>

                  {/* Error Banner */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-sm">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'processing'}
                    className="w-full py-4 bg-[#1E392A] hover:bg-[#162C20] disabled:bg-[#DDD6C9] text-white font-sans text-xs tracking-[2px] uppercase font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {status === 'processing' ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Engaging Atelier Escrow...
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Authorize Consignment via {gateway}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
