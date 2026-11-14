'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  X,
  TrendingUp,
  Box,
  Plane,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Container,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useAtelier } from '@/context/AtelierContext';

interface FounderBackofficeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FounderBackofficeModal({ isOpen, onClose }: FounderBackofficeModalProps) {
  const router = useRouter();
  const { unlockOwner } = useAtelier();
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'revenue' | 'timber' | 'aircargo'>('revenue');

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsVerifying(true);
    setError(false);
    setAuthErrorMessage('');
    try {
      const ok = await unlockOwner(passcode.trim());
      if (ok) {
        setIsAuthenticated(true);
        setError(false);
        setPasscode('');
        onClose();
        router.push('/owner');
      } else {
        setError(true);
        setAuthErrorMessage('Invalid owner password. Access denied.');
      }
    } catch {
      setError(true);
      setAuthErrorMessage('Failed to authenticate with owner credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPasscode('');
    setIsAuthenticated(false);
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm shadow-2xl overflow-hidden my-8 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#E7E0D3] flex items-center justify-between bg-[#F7F4EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#1E392A] text-white flex items-center justify-center">
              {isAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                SISODIA ATELIER ✧ • Yash Sisodia Founder Desk
              </h3>
              <p className="text-[10px] text-[#8B5E3C] uppercase tracking-wider font-semibold">
                Founder & Principal: Yash Sisodia • Private Export Revenue Ledger & Timber Inventory
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate */}
        {!isAuthenticated ? (
          <form onSubmit={handleUnlock} className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#F1E8DC] text-[#8B5E3C] mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-serif text-2xl text-[#1C1917] font-normal">
                Founder Authentication • Yash Sisodia Desk
              </h4>
              <p className="text-xs text-[#78716C] mt-1">
                Enter founder credentials to inspect export billing ledgers and raw log stock.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter Owner Password..."
                  autoComplete="current-password"
                  className="w-full text-center text-base tracking-wider bg-white border border-[#DDD6C9] focus:border-[#8B5E3C] py-2.5 px-10 rounded-sm outline-none font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-rose-600 font-sans">
                  {authErrorMessage || 'Invalid owner password. Access denied.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-[#1E392A] hover:bg-[#162C20] disabled:opacity-60 text-white text-xs font-sans tracking-[2px] uppercase font-semibold rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate Ledger Access</span>
              )}
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Status Pill */}
            <div className="flex items-center justify-between bg-[#EAEFEA] border border-[#1E392A]/20 p-3 rounded-sm text-xs">
              <span className="flex items-center gap-2 text-[#1E392A] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Welcome Founder Yash Sisodia. Atelier records unlocked.
              </span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-rose-700 hover:underline font-semibold"
              >
                Lock Ledger
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-[#E7E0D3] pb-2">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-4 py-2 text-xs font-sans uppercase tracking-wider rounded-sm transition-all ${
                  activeTab === 'revenue'
                    ? 'bg-[#1E392A] text-white font-semibold'
                    : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
                }`}
              >
                Export Revenue Ledger
              </button>
              <button
                onClick={() => setActiveTab('timber')}
                className={`px-4 py-2 text-xs font-sans uppercase tracking-wider rounded-sm transition-all ${
                  activeTab === 'timber'
                    ? 'bg-[#1E392A] text-white font-semibold'
                    : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
                }`}
              >
                Timber Yard & Kiln Inventory
              </button>
              <button
                onClick={() => setActiveTab('aircargo')}
                className={`px-4 py-2 text-xs font-sans uppercase tracking-wider rounded-sm transition-all ${
                  activeTab === 'aircargo'
                    ? 'bg-[#1E392A] text-white font-semibold'
                    : 'bg-white text-[#44403C] hover:bg-[#F3EDE2] border border-[#DDD6C9]'
                }`}
              >
                Live Air Cargo Telemetry
              </button>
            </div>

            {/* Tab 1: Export Revenue */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm shadow-xs">
                    <span className="text-[10px] text-[#78716C] uppercase tracking-wider block mb-1">
                      YTD Global Consignments Value
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#1C1917]">$4,280,000 USD</span>
                    <span className="text-[11px] text-[#1E392A] font-semibold block mt-1">+34% YoY</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm shadow-xs">
                    <span className="text-[10px] text-[#78716C] uppercase tracking-wider block mb-1">
                      40ft High-Cube FCL Containers
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#1C1917]">24 Dispatched</span>
                    <span className="text-[11px] text-[#8B5E3C] font-semibold block mt-1">100% On-Time DDP</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm shadow-xs">
                    <span className="text-[10px] text-[#78716C] uppercase tracking-wider block mb-1">
                      Doorstep Tariff Claims
                    </span>
                    <span className="font-serif text-2xl font-bold text-emerald-800">$0.00 (Zero)</span>
                    <span className="text-[11px] text-[#78716C] block mt-1">100% Pre-Paid Bonds</span>
                  </div>
                </div>

                {/* Recent Consignments Table */}
                <div className="bg-white border border-[#E7E0D3] rounded-sm overflow-hidden shadow-xs">
                  <div className="p-3 bg-[#F7F4EE] border-b border-[#E7E0D3] text-xs font-semibold text-[#1C1917]">
                    Recent Foreign Patron Dispatches
                  </div>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#FAF7F2] text-[#78716C] border-b border-[#E7E0D3] text-[11px] uppercase">
                        <tr>
                          <th className="p-3">Patron & Destination</th>
                          <th className="p-3">Heirloom Piece</th>
                          <th className="p-3">Declared Value</th>
                          <th className="p-3">Customs & Carrier</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3EDE2]">
                        <tr>
                          <td className="p-3 font-medium">Julian S. (Tribeca, NYC, US)</td>
                          <td className="p-3">Monolithic Teak Urn</td>
                          <td className="p-3 font-semibold">$4,850 USD</td>
                          <td className="p-3 text-[#78716C]">DDP • DHL Flight D0-741</td>
                          <td className="p-3 text-emerald-800 font-semibold">Airborne En Route</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Helena R. (Mayfair, London, UK)</td>
                          <td className="p-3">Scalloped Sheesham Trays</td>
                          <td className="p-3 font-semibold">£2,320 GBP</td>
                          <td className="p-3 text-[#78716C]">DDP • Heathrow Air Cargo</td>
                          <td className="p-3 text-blue-800 font-semibold">Customs Cleared</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Tariq Al-Mansoor (Dubai, UAE)</td>
                          <td className="p-3">Haveli Jharokha Console</td>
                          <td className="p-3 font-semibold">AED 67,895</td>
                          <td className="p-3 text-[#78716C]">DDP • Emirates SkyCargo</td>
                          <td className="p-3 text-emerald-800 font-semibold">Delivered Safe</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Dr. Aris V. (Athens, Greece)</td>
                          <td className="p-3">Vijaysar Sovereign Basin</td>
                          <td className="p-3 font-semibold">€1,700 EUR</td>
                          <td className="p-3 text-[#78716C]">DDP • Lufthansa Cargo</td>
                          <td className="p-3 text-emerald-800 font-semibold">Delivered Safe</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Timber Inventory */}
            {activeTab === 'timber' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm">
                    <span className="font-serif text-base text-[#1C1917] font-semibold block mb-1">
                      Central Kiln Stock (Nagina Atelier Floor)
                    </span>
                    <p className="text-[#44403C] leading-relaxed mb-2">
                      142 monolithic Burma Teak blanks audited at 7.2% ±0.3% moisture equilibrium. Calibrated for export to North America & Europe.
                    </p>
                    <span className="text-[10px] uppercase font-bold text-[#1E392A] bg-[#EAEFEA] px-2 py-0.5 rounded-sm">
                      Ready For Lathe
                    </span>
                  </div>

                  <div className="p-4 bg-white border border-[#E7E0D3] rounded-sm">
                    <span className="font-serif text-base text-[#1C1917] font-semibold block mb-1">
                      Solar Seasoning Yards (Nagina Hub)
                    </span>
                    <p className="text-[#44403C] leading-relaxed mb-2">
                      86 aged Desert Sheesham logs naturally solar-hardened for 12 to 16 years. Dense annular growth rings intact.
                    </p>
                    <span className="text-[10px] uppercase font-bold text-[#8B5E3C] bg-[#F1E8DC] px-2 py-0.5 rounded-sm">
                      Seasoning In Progress
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#F7F4EE] border border-[#E7E0D3] rounded-sm flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#1C1917] block">CITES Appendix II & VPA Compliance</span>
                    <span className="text-[11px] text-[#78716C]">All logs harvested legally under state forestry conservation guidelines. Permit #CITES-IN-2026-99214.</span>
                  </div>
                  <span className="text-emerald-800 font-bold text-xs">Active & Verified</span>
                </div>
              </div>
            )}

            {/* Tab 3: Air Cargo */}
            {activeTab === 'aircargo' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-5 bg-white border border-[#E7E0D3] rounded-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-[#E7E0D3] pb-2">
                    <span className="font-mono font-bold text-[#1C1917]">Consignment SC-9842-INTL (DHL Air Charter)</span>
                    <span className="text-emerald-800 font-semibold bg-[#EAEFEA] px-2 py-0.5 rounded-sm">
                      Airborne Over Atlantic
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 bg-[#FAF7F2] rounded-sm border border-[#E7E0D3]">
                      <span className="text-[10px] text-[#78716C] block">Altitude</span>
                      <span className="font-mono font-bold text-sm">37,000 FT</span>
                    </div>
                    <div className="p-2.5 bg-[#FAF7F2] rounded-sm border border-[#E7E0D3]">
                      <span className="text-[10px] text-[#78716C] block">Cabin Climate</span>
                      <span className="font-mono font-bold text-sm">18.4° C</span>
                    </div>
                    <div className="p-2.5 bg-[#FAF7F2] rounded-sm border border-[#E7E0D3]">
                      <span className="text-[10px] text-[#78716C] block">Tilt Sensor</span>
                      <span className="font-mono font-bold text-sm text-emerald-800">0.0° (Locked)</span>
                    </div>
                    <div className="p-2.5 bg-[#FAF7F2] rounded-sm border border-[#E7E0D3]">
                      <span className="text-[10px] text-[#78716C] block">Customs Duty</span>
                      <span className="font-mono font-bold text-sm text-emerald-800">$0 Pre-Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

