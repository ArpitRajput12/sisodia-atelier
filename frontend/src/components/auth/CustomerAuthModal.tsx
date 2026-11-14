'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  User,
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCurrency, APPROVED_COUNTRY_LIST } from '@/context/CurrencyContext';

declare global {
  interface Window {
    google?: any;
  }
}

function sanitizeAuthErrorMessage(msg?: string | null): string {
  if (!msg) return 'Unable to complete sign in. Please try again.';
  const lower = msg.toLowerCase();

  // 1. When Country Is Unauthorized (403)
  if (
    lower.includes('unauthorized') ||
    lower.includes('country') ||
    lower.includes('territory') ||
    lower.includes('geographic') ||
    lower.includes('available only for') ||
    lower.includes('sorry, client login')
  ) {
    return 'Access restricted: Client accounts are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.';
  }

  // 2. When OTP Email Dispatch Fails (500)
  if (
    lower.includes('smtp') ||
    lower.includes('535') ||
    lower.includes('badcredentials') ||
    lower.includes('gsmtp') ||
    lower.includes('failed to dispatch') ||
    lower.includes('transporter') ||
    lower.includes('unable to send')
  ) {
    return 'Unable to send the verification code right now. Please try again shortly or continue with Google.';
  }

  // 3. When OTP Is Wrong or Expired (400)
  if (
    lower.includes('otp') ||
    lower.includes('code') ||
    lower.includes('expired') ||
    lower.includes('invalid')
  ) {
    return 'Invalid or expired verification code. Please check the 6-digit code and try again.';
  }

  return msg;
}

export function CustomerAuthModal() {
  const {
    isAuthModalOpen,
    authModalSubtitle,
    closeAuthModal,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    isLoading,
    authError,
    setAuthError,
  } = useCustomerAuth();

  const { selectedCountry } = useCurrency();

  // Auth Step: 1 = Email Input, 2 = Enter 6-Digit OTP & Profile Details (if new user)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState(selectedCountry || 'US');
  const [isNewUser, setIsNewUser] = useState(false);

  // Status & Notifications
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [countryBlockedMessage, setCountryBlockedMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync country code with active CurrencyContext
  useEffect(() => {
    if (selectedCountry) {
      setCountryCode(selectedCountry);
    }
  }, [selectedCountry]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Initialize Google Sign-In button if script is available
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id && googleButtonContainerRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response?.credential) {
              setCountryBlockedMessage(null);
              setAuthError(null);
              const result = await loginWithGoogle(response.credential, countryCode);
              if (!result.success) {
                if (result.code === 'COUNTRY_UNAUTHORIZED') {
                  setCountryBlockedMessage(
                    'Access restricted: Client accounts are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.'
                  );
                } else {
                  setAuthError(sanitizeAuthErrorMessage(result.message));
                }
              }
            }
          },
        });

        googleButtonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonContainerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      // Dynamically load Google script if not yet loaded
      const existingScript = document.getElementById('google-gsi-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogleGsi();
        document.body.appendChild(script);
      }
    }
  }, [isAuthModalOpen, loginWithGoogle, countryCode]);

  if (!isAuthModalOpen) return null;

  // Handle Step 1: Request 6-Digit OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCountryBlockedMessage(null);
    setAuthError(null);
    setStatusMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    const res = await sendOtp(trimmedEmail, countryCode);
    if (res.success) {
      setIsNewUser(res.isExistingUser === false);
      setStep(2);
      setStatusMessage(`Verification code sent to ${trimmedEmail}`);
      setResendCooldown(60);
    } else if (res.code === 'COUNTRY_UNAUTHORIZED') {
      setCountryBlockedMessage(
        'Access restricted: Client accounts are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.'
      );
    } else {
      setAuthError(sanitizeAuthErrorMessage(res.message));
    }
  };

  // Handle Step 2: Verify OTP and Register/Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCountryBlockedMessage(null);
    setAuthError(null);

    const trimmedOtp = otp.trim().replace(/\D/g, '');
    if (trimmedOtp.length !== 6) {
      setAuthError('Please enter the 6-digit verification code.');
      return;
    }

    if (isNewUser && !name.trim()) {
      setAuthError('Patron full name is required for certificate provenance.');
      return;
    }

    const res = await verifyOtp(
      email.trim().toLowerCase(),
      trimmedOtp,
      name.trim() || undefined,
      countryCode
    );

    if (res.success) {
      setStatusMessage('Welcome to SISODIA ATELIER ✧. Access granted.');
    } else if (res.code === 'COUNTRY_UNAUTHORIZED') {
      setCountryBlockedMessage(
        'Access restricted: Client accounts are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.'
      );
    } else if (res.requiresRegistrationDetails) {
      setIsNewUser(true);
      setAuthError('Please provide your full patron name and confirm your export country.');
    } else {
      setAuthError(sanitizeAuthErrorMessage(res.message));
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setAuthError(null);
    const res = await sendOtp(email.trim().toLowerCase(), countryCode);
    if (res.success) {
      setStatusMessage(`New verification code sent to ${email.trim()}`);
      setResendCooldown(60);
    } else if (res.code === 'COUNTRY_UNAUTHORIZED') {
      setCountryBlockedMessage(
        'Access restricted: Client accounts are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.'
      );
    } else {
      setAuthError(sanitizeAuthErrorMessage(res.message));
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#DDD6C9] rounded-sm shadow-2xl overflow-hidden text-[#1C1917] my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Strip */}
        <div className="p-5 sm:p-6 bg-[#1C1917] text-[#FAF7F2] flex items-center justify-between border-b border-[#332E29]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#DDD6C9]/40 shrink-0 bg-[#2C2723]">
              <img src="/logo.jpeg" alt="SISODIA ATELIER ✧" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-wide text-white">SISODIA ATELIER ✧</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-[#FAF7F2]/10 text-[#C9A96E] border border-[#C9A96E]/30 rounded-xs">
                  PATRON PORTAL
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-serif italic">
                Nagina Woodcraft Export Cluster • Est. 1892
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors text-sm cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Checkout Required Notice or Custom Subtitle */}
          {authModalSubtitle && (
            <div className="p-3 bg-[#EAEFEA] border border-[#1E392A]/30 rounded-sm text-xs text-[#1E392A] font-medium flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#1E392A]" />
              <span>{authModalSubtitle}</span>
            </div>
          )}

          {/* Consolidated Error Alert Box */}
          {(countryBlockedMessage || authError) && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-sm text-xs text-red-950 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-semibold text-red-900 uppercase tracking-wide text-[11px]">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span>Unable to Sign In</span>
              </div>
              <p className="leading-relaxed font-medium text-red-900">
                {countryBlockedMessage || authError}
              </p>
            </div>
          )}

          {/* Status Alert */}
          {statusMessage && !countryBlockedMessage && !authError && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* STEP 1: Fast Email + 1-Click Google Sign-In */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Google 1-Click Button Container */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div ref={googleButtonContainerRef} className="w-full flex justify-center min-h-[44px]" />
                <p className="text-[10px] text-[#78716C] font-sans">
                  Instant patron access with your verified Google account
                </p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E7E0D3] w-full" />
                <span className="bg-[#FAF7F2] px-3 text-[10px] uppercase tracking-widest text-[#78716C] font-semibold whitespace-nowrap">
                  Or Continue with Email
                </span>
                <div className="border-t border-[#E7E0D3] w-full" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-[#44403C] mb-1.5">
                    Patron Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. patron@residence.com"
                      className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm pl-10 pr-3.5 py-2.5 text-xs text-[#1C1917] outline-none font-sans shadow-xs transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-[#44403C] mb-1.5">
                    Consignment Destination Territory *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm pl-10 pr-3.5 py-2.5 text-xs text-[#1C1917] outline-none font-sans shadow-xs transition-colors"
                    >
                      {APPROVED_COUNTRY_LIST.map((c) => (
                        <option key={c.countryCode} value={c.countryCode}>
                          {c.flag} {c.countryName} ({c.currencyCode} {c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-[#78716C] mt-1">
                    Strict DDP clearance active for 11 approved territories.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1E392A] hover:bg-[#14281D] disabled:opacity-50 text-white text-xs font-sans font-semibold uppercase tracking-[1.5px] rounded-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: 6-Digit OTP Verification + Minimal 2-Field Registration */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#57534E]">
                  Code sent to <strong className="text-[#1C1917]">{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setAuthError(null);
                    setCountryBlockedMessage(null);
                  }}
                  className="text-[11px] text-[#8B5E3C] hover:underline"
                >
                  Change Email
                </button>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#44403C] mb-1.5">
                  6-Digit Verification Code *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm pl-10 pr-3.5 py-2.5 text-base tracking-[0.3em] font-mono text-[#1C1917] outline-none shadow-xs text-center"
                    autoFocus
                  />
                </div>
              </div>

              {/* Minimal 2 Registration Fields (Shown if New User) */}
              {isNewUser && (
                <div className="p-3.5 bg-[#F5EFE6] border border-[#DDD6C9] rounded-sm space-y-3 animate-in fade-in">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1E392A] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Patron Consignment Registration</span>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                      Full Patron Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-white border border-[#DDD6C9] focus:border-[#1E392A] rounded-sm px-3 py-2 text-xs text-[#1C1917] outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-[#44403C] mb-1">
                      Consignment Destination Territory *
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
              )}

              <div className="flex items-center justify-between text-xs text-[#78716C] pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="hover:text-[#1E392A] disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1E392A] hover:bg-[#14281D] disabled:opacity-50 text-white text-xs font-sans font-semibold uppercase tracking-[1.5px] rounded-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Enter Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy & DDP Security Footer Note */}
          <div className="p-3 bg-[#F7F4EE] border border-[#E7E0D3] rounded-sm flex items-start gap-2.5 text-[11px] text-[#57534E] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#1E392A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1C1917] font-semibold">100% Encrypted Patron Telemetry:</strong>{' '}
              Orders and official tax invoices are strictly private. Zero commercial tracking, zero spam.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
