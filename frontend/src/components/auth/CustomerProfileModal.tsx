'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Building, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { APPROVED_COUNTRY_LIST } from '@/context/CurrencyContext';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerProfileModal({ isOpen, onClose }: CustomerProfileModalProps) {
  const { customer, updateProfile, isLoading } = useCustomerAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [savedAddress, setSavedAddress] = useState('');
  const [savedCity, setSavedCity] = useState('');
  const [savedPostalCode, setSavedPostalCode] = useState('');
  const [firmName, setFirmName] = useState('');
  const [gstOrTaxId, setGstOrTaxId] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setCountryCode(customer.countryCode || 'US');
      setSavedAddress(customer.savedAddress || '');
      setSavedCity(customer.savedCity || '');
      setSavedPostalCode(customer.savedPostalCode || '');
      setFirmName(customer.firmName || '');
      setGstOrTaxId(customer.gstOrTaxId || '');
    }
  }, [customer, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const res = await updateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
      countryCode,
      savedAddress: savedAddress.trim() || undefined,
      savedCity: savedCity.trim() || undefined,
      savedPostalCode: savedPostalCode.trim() || undefined,
      firmName: firmName.trim() || undefined,
      gstOrTaxId: gstOrTaxId.trim() || undefined,
    });

    if (res.success) {
      setMessage('Patron profile details updated successfully.');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1200);
    } else {
      setError(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm shadow-2xl overflow-hidden text-[#1C1917] my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-[#1C1917] text-[#FAF7F2] flex items-center justify-between border-b border-[#332E29]">
          <div>
            <span className="font-serif text-lg tracking-wide text-white">Patron Profile & Address</span>
            <p className="text-[11px] text-stone-300 font-serif italic">
              Pre-cleared DDP Shipping & Estate Invoicing Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors text-sm cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Full Patron Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={customer.email}
                className="w-full bg-[#F3EDE2] border border-[#DDD6C9] text-stone-500 rounded-sm px-3 py-2 text-xs font-sans cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Phone / WhatsApp (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 / +44 / +971..."
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Destination Territory *
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              >
                {APPROVED_COUNTRY_LIST.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.flag} {c.countryName} ({c.currencyCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
              Primary Shipping Address (Street & Suite)
            </label>
            <input
              type="text"
              value={savedAddress}
              onChange={(e) => setSavedAddress(e.target.value)}
              placeholder="e.g. 178 Franklin Street, Penthouse B"
              className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                City / Borough
              </label>
              <input
                type="text"
                value={savedCity}
                onChange={(e) => setSavedCity(e.target.value)}
                placeholder="e.g. New York / London / Dubai"
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Postal Code / ZIP
              </label>
              <input
                type="text"
                value={savedPostalCode}
                onChange={(e) => setSavedPostalCode(e.target.value)}
                placeholder="e.g. 10013 / SW1A 1AA"
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E7E0D3]">
            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Estate / Firm Name (Optional)
              </label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="e.g. Sterling Architectural Group"
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                Tax ID / VAT / GST (Optional)
              </label>
              <input
                type="text"
                value={gstOrTaxId}
                onChange={(e) => setGstOrTaxId(e.target.value)}
                placeholder="e.g. EIN / VAT / GSTIN"
                className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1E392A] hover:bg-[#14281D] disabled:opacity-50 text-white text-xs font-sans font-semibold uppercase tracking-[1.5px] rounded-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Patron Details</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
