'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ORDER_STAGE_DEFINITIONS } from '@/context/AtelierContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { OfficialTaxInvoice } from '@/components/invoice/OfficialTaxInvoice';
import { OrderRecord } from '@/types';
import { fetchMyOrdersApi, cancelMyOrderApi } from '@/lib/api';
import {
  Search,
  Plane,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  AlertTriangle,
  XCircle,
  Truck,
  Package,
  Compass,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const STAGE_CONDITIONS: Record<number, string> = {
  1: 'Wagner Pinless Meter Audit: 7.2% Timber Equilibrium Verified in Kiln Chamber',
  2: 'Solid Lathe Gouge Relieved & Cold-Pressed Walnut Oil Hand-Burnished',
  3: 'ISPM-15 Cedar Vault Sealed with Multi-Axis Impact & Tilt Sensors',
  4: 'International Air Freight Airborne • 100% DDP Bonded Clearance Verified',
  5: 'Local White-Glove Courier Fleet Dispatched for Doorstep Handover',
  6: 'Private Residence Handover & Uncrating Completed • Provenance Signed',
};

const STAGE_DESCRIPTIONS: Record<number, string> = {
  1: 'Heartwood moisture verified at 7.2% equilibrium via pinless Wagner meters. Monolithic block reserved in Nagina atelier.',
  2: 'Hand-turned on low-RPM Nagina lathe or chisel-carved by master craftsmen and burnished with cold-pressed walnut oil & beeswax.',
  3: 'Sealed inside an ISPM-15 fumigated cedar travel vault with multi-axis tilt sensors and full CITES / DDP export paperwork.',
  4: 'Airborne or bonded express transit with climate-buffered timber protection and DDP pre-cleared destination customs.',
  5: 'Out with local white-glove specialist courier fleet for final estate arrival and doorstep uncrating handover.',
  6: 'Consignment safely handed over at patron destination with signed atelier provenance certificate.',
};

type OrderFilterTab = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';

export default function OrderTrackingPage() {
  const { customer, token, isLoggedIn, openAuthModal } = useCustomerAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('ALL');
  const [searchInput, setSearchInput] = useState('');

  // Expanded tracking panels state
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Invoice modal state
  const [invoiceOrder, setInvoiceOrder] = useState<OrderRecord | null>(null);

  // Cancel order workflow state
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load dedicated customer orders from backend
  const loadOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchMyOrdersApi(token);
      if (data) {
        setOrders(data);
        // Default expand the first active order if any
        if (data.length > 0) {
          setExpandedOrders({ [data[0].orderNumber]: true });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isLoggedIn && token) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [isLoggedIn, token, loadOrders]);

  // Tab Counts
  const counts = useMemo(() => {
    const active = orders.filter(
      (o) => !o.isCancelled && o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (o.trackingStage ?? 1) < 6
    ).length;
    const delivered = orders.filter(
      (o) => !o.isCancelled && (o.status === 'DELIVERED' || (o.trackingStage ?? 1) === 6)
    ).length;
    const cancelled = orders.filter((o) => o.isCancelled || o.status === 'CANCELLED').length;
    return { all: orders.length, active, delivered, cancelled };
  }, [orders]);

  // Filtered Orders for Display
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // 1. Tab filter
    if (activeTab === 'ACTIVE') {
      list = list.filter(
        (o) => !o.isCancelled && o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (o.trackingStage ?? 1) < 6
      );
    } else if (activeTab === 'DELIVERED') {
      list = list.filter(
        (o) => !o.isCancelled && (o.status === 'DELIVERED' || (o.trackingStage ?? 1) === 6)
      );
    } else if (activeTab === 'CANCELLED') {
      list = list.filter((o) => o.isCancelled || o.status === 'CANCELLED');
    }

    // 2. Search query filter
    const query = searchInput.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query)) ||
          o.itemsSummary.toLowerCase().includes(query) ||
          o.destination.toLowerCase().includes(query)
      );
    }

    return list;
  }, [orders, activeTab, searchInput]);

  const toggleTrackingPanel = (orderNumber: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNumber]: !prev[orderNumber],
    }));
  };

  const handleConfirmCancel = async (orderId: string, orderNumber: string) => {
    if (!token) return;
    if (!cancelReason.trim()) {
      setCancelError('Please state a reason for cancellation.');
      return;
    }

    setCancelError(null);
    setIsCancelling(true);
    try {
      const res = await cancelMyOrderApi(token, orderId, cancelReason.trim());
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o.orderNumber === orderNumber
              ? {
                  ...o,
                  status: 'CANCELLED',
                  isCancelled: true,
                  cancellationReason: cancelReason.trim(),
                  ownerCancelConfirmed: true,
                }
              : o
          )
        );
        setCancellingOrderId(null);
        setCancelReason('');
      } else {
        setCancelError(res.message || 'Unable to cancel this order.');
      }
    } catch (err: any) {
      setCancelError(err?.message || 'Network error occurred while cancelling order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const isOrderLockedForCancellation = (ord: OrderRecord) => {
    return (
      ord.isCancelled ||
      ord.status === 'CANCELLED' ||
      (ord.trackingStage !== undefined && ord.trackingStage >= 3) ||
      ord.status === 'QUALITY_AND_CRATING' ||
      ord.status === 'IN_TRANSIT' ||
      ord.status === 'OUT_FOR_DELIVERY' ||
      ord.status === 'DELIVERED'
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-24">
        {/* Header Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.22em] text-[#8B5E3C] uppercase font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#8B5E3C]" />
              Live Export Telemetry & DDP Dispatch Radar
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#1C1917] font-normal">
              My Orders & Live Consignment Tracking
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] font-sans leading-relaxed">
              Monitor your handcrafted Nagina solid wood heirlooms across all 6 atelier crafting, crating, and international DDP delivery stages. Access real-time kiln moisture telemetry, courier waybills, and official tax invoices anytime.
            </p>

            {/* Patron Session Pill */}
            {isLoggedIn && customer && (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#EAEFEA] border border-[#1E392A]/20 text-[#1E392A] text-xs font-sans rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>
                  Authenticated Patron: <strong className="font-semibold">{customer.name}</strong> ({customer.email})
                </span>
                {customer.countryCode && (
                  <span className="text-[10px] font-mono uppercase bg-white/70 px-2 py-0.5 rounded-full text-[#1E392A]">
                    {customer.countryCode} • {customer.countryName || 'USA'}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 1. LOGGED-OUT STATE: STRICT PRIVACY WALL (NO ORDERS RENDERED)             */}
        {/* ========================================================================= */}
        {!isLoggedIn ? (
          <section className="max-w-xl mx-auto px-4 sm:px-6 py-6">
            <div className="bg-white border border-[#DDD6C9] rounded-sm p-8 sm:p-10 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#1E392A] text-white flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-[2px] text-[#8B5E3C] font-bold">
                  Sovereign Patron Security
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-semibold">
                  Sign In to Access Your Orders & Live Tracking
                </h2>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-md mx-auto pt-1">
                  Past consignments, cancelled orders, live kiln moisture telemetry, carrier waybills, and official tax invoices are strictly private to your verified patron account.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('Sign in to view your orders and live consignment tracking.')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1E392A] hover:bg-[#14281D] text-white font-sans font-semibold text-xs tracking-[1.5px] uppercase rounded-sm transition-colors cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Register with 1-Click</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#F3EDE2] text-[11px] text-[#78716C] flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E392A]" />
                <span>Protected by 11-Territory Export Security & 256-Bit Encryption</span>
              </div>
            </div>
          </section>
        ) : (
          /* ========================================================================= */
          /* 2. LOGGED-IN STATE: DEDICATED PATRON ORDERS & TRACKING                    */
          /* ========================================================================= */
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Filter Tabs & Search Controls */}
            <div className="bg-white border border-[#DDD6C9] p-3 sm:p-4 rounded-sm shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-sans font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-[#1E392A] text-white'
                      : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#F3EDE2]'
                  }`}
                >
                  All Orders ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ACTIVE')}
                  className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-sans font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    activeTab === 'ACTIVE'
                      ? 'bg-[#1E392A] text-white'
                      : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#F3EDE2]'
                  }`}
                >
                  Active & In Transit ({counts.active})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('DELIVERED')}
                  className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-sans font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    activeTab === 'DELIVERED'
                      ? 'bg-[#1E392A] text-white'
                      : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#F3EDE2]'
                  }`}
                >
                  Past / Delivered ({counts.delivered})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CANCELLED')}
                  className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-sans font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    activeTab === 'CANCELLED'
                      ? 'bg-[#1E392A] text-white'
                      : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#F3EDE2]'
                  }`}
                >
                  Cancelled ({counts.cancelled})
                </button>
              </div>

              {/* Search Within Orders */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Filter by Order # or Waybill..."
                  className="w-full bg-[#FAF7F2] focus:bg-white border border-[#E7E0D3] focus:border-[#1E392A] rounded-sm pl-8 pr-3 py-1.5 text-xs font-sans text-[#1C1917] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-12 text-center text-[#78716C] flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E392A]" />
                <span className="text-xs font-sans uppercase tracking-wider">Synchronizing Atelier Vault...</span>
              </div>
            )}

            {/* Empty State when tab has 0 orders */}
            {!isLoading && filteredOrders.length === 0 && (
              <div className="p-12 bg-white border border-[#DDD6C9] rounded-sm text-center space-y-4 shadow-xs">
                <Package className="w-10 h-10 text-[#8B5E3C] mx-auto stroke-1" />
                <h3 className="font-serif text-2xl text-[#1C1917]">
                  {activeTab === 'ALL'
                    ? 'No Consignments Placed Yet'
                    : `No ${activeTab.toLowerCase().replace(/_/g, ' ')} orders found`}
                </h3>
                <p className="text-xs text-[#78716C] max-w-md mx-auto leading-relaxed">
                  {activeTab === 'ALL'
                    ? 'Every solid wood masterpiece you commission will appear here with live 6-stage telemetry and verifiable CITES provenance.'
                    : `There are currently no orders under the "${activeTab.toLowerCase().replace(/_/g, ' ')}" category.`}
                </p>
                {activeTab === 'ALL' && (
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1E392A] text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#14281D] transition-colors shadow-xs"
                  >
                    <span>Explore Masterpiece Range</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Render Each Order Card */}
            {!isLoading &&
              filteredOrders.map((order) => {
                const isCancelled = order.status === 'CANCELLED' || Boolean(order.isCancelled);
                const stage = order.trackingStage ?? 1;
                const isStage5 = stage === 5 || order.status === 'OUT_FOR_DELIVERY';
                const isStage6 = stage === 6 || order.status === 'DELIVERED';
                const isLocked = isOrderLockedForCancellation(order);
                const isExpanded = !!expandedOrders[order.orderNumber];

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-[#E7E0D3] rounded-sm p-5 sm:p-8 shadow-xs space-y-6 transition-all hover:border-[#DDD6C9]"
                  >
                    {/* Cancelled Alert Banner */}
                    {isCancelled && (
                      <div className="bg-red-50 border border-red-300 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900">
                        <div className="flex items-center gap-2.5">
                          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                          <div>
                            <span className="font-sans font-bold text-xs uppercase tracking-wider block">
                              Consignment Cancelled ({order.orderNumber})
                            </span>
                            <p className="text-xs text-red-800 mt-0.5">
                              {order.cancellationReason ||
                                order.cancelReason ||
                                'Patron requested cancellation prior to crating and dispatch.'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-white border border-red-200 text-red-900 text-[10px] font-mono uppercase font-bold rounded-xs shrink-0">
                          {order.ownerCancelConfirmed ? '✓ Acknowledged by Atelier' : '⏳ Owner Desk Notified'}
                        </span>
                      </div>
                    )}

                    {/* Card Header & Metadata */}
                    <div
                      onClick={() => toggleTrackingPanel(order.orderNumber)}
                      className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-[#E7E0D3] pb-6 cursor-pointer group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              isCancelled
                                ? 'bg-red-600'
                                : isStage5
                                ? 'bg-amber-500 animate-pulse'
                                : isStage6
                                ? 'bg-emerald-600'
                                : 'bg-[#1E392A] animate-pulse'
                            }`}
                          />
                          <span className="font-mono text-base font-bold text-[#1C1917] group-hover:text-[#1E392A] transition-colors">
                            {order.orderNumber}
                          </span>

                          {/* Stage & Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-sm inline-flex items-center gap-1.5 ${
                              isCancelled
                                ? 'bg-red-100 text-red-900 border border-red-300'
                                : isStage5
                                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                : isStage6
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : 'bg-[#F3EDE2] text-[#8B5E3C] border border-[#DDD6C9]'
                            }`}
                          >
                            {isStage5 && <Package className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
                            {isStage6 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isCancelled
                              ? 'CANCELLED'
                              : isStage5
                              ? 'STAGE 05 OF 06 • OUT FOR DELIVERY'
                              : isStage6
                              ? 'STAGE 06 OF 06 • DELIVERED'
                              : `STAGE 0${stage} OF 06 • ${order.status.replace(/_/g, ' ')}`}
                          </span>

                          {order.firmName && (
                            <span className="text-[11px] font-sans text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 border border-[#DDD6C9] rounded-xs">
                              Firm: {order.firmName}
                            </span>
                          )}
                        </div>

                        <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-normal group-hover:text-[#1E392A] transition-colors">
                          {order.itemsSummary}
                        </h2>

                        <p className="text-xs text-[#57534E] font-sans">
                          Patron: <strong className="text-[#1C1917]">{order.customerName}</strong> • Destination:{' '}
                          <strong className="text-[#1C1917]">{order.destination}</strong> • Investment:{' '}
                          <strong className="font-mono text-[#1E392A]">
                            {order.currency} {order.totalAmountUsd?.toLocaleString() || '0'}{' '}
                            {order.currency !== 'INR' && order.totalAmountInr
                              ? `(₹${order.totalAmountInr.toLocaleString('en-IN')})`
                              : ''}
                          </strong>
                        </p>

                        {/* Current Shipment Condition Tag */}
                        <div className="pt-1 flex items-center gap-2 text-[11px] font-sans text-[#8B5E3C]">
                          <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                          <span>
                            <strong>Condition:</strong>{' '}
                            {STAGE_CONDITIONS[stage] || 'ISPM-15 Cedar Vault Verified'}
                          </span>
                        </div>
                      </div>

                      {/* Tracking Number & Courier Partner Widget */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm p-4 space-y-2 min-w-[280px] shrink-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5E3C] font-semibold flex items-center gap-1.5">
                            <Plane className="w-3.5 h-3.5" />
                            {order.courierPartner || 'DHL Express International'}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-xs font-semibold">
                            DDP 100%
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-[#78716C] font-sans block">Waybill / Tracking No:</span>
                          <p className="font-mono text-sm font-bold text-[#1C1917] select-all">
                            {order.trackingNumber || 'Assigned Upon Crating'}
                          </p>
                        </div>

                        <div className="text-xs text-[#57534E] font-sans pt-1 border-t border-[#E7E0D3]/60 flex items-center justify-between">
                          <span>ETA: <strong className="text-[#1E392A]">{order.estimatedDelivery || '7–10 Days Worldwide Express'}</strong></span>
                          <span className="text-[10px] text-[#8B5E3C] font-semibold underline">
                            {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Checkpoint Callout Banner */}
                    {!isCancelled && (
                      <div className="bg-[#F7F4EE] border border-[#E7E0D3] px-4 py-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-[#1C1917]">
                          <MapPin className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                          <span>
                            <strong>Live Checkpoint:</strong>{' '}
                            {order.currentCheckpoint || 'Nagina Atelier Export Enclave — 7.2% Moisture Equilibrium Verified'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-[#1E392A] font-semibold shrink-0">
                          <span>{Math.round((stage / 6) * 100)}% Consignment Transit Completed</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Track Your Order Toggle */}
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => toggleTrackingPanel(order.orderNumber)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1C1917] border border-[#DDD6C9] hover:border-[#1E392A] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-2xs"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#8B5E3C]" />
                            <span>{isExpanded ? 'Hide Telemetry' : 'Track Consignment (6 Stages)'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Download Tax Invoice Button */}
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#1E392A] border border-[#1E392A]/40 hover:border-[#1E392A] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#1E392A]" />
                          <span>View Official Tax Invoice</span>
                        </button>
                      </div>

                      {/* Cancel Button or Locked Status */}
                      {!isCancelled && (
                        <div>
                          {isLocked ? (
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-950 text-xs font-sans rounded-sm">
                              <Lock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                              <span>
                                {isStage6
                                  ? 'Consignment Handover Complete'
                                  : 'Crated / In Transit — Cancellation Locked'}
                              </span>
                            </div>
                          ) : (
                            cancellingOrderId !== order.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancellingOrderId(order.id);
                                  setCancelReason('');
                                  setCancelError(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Cancel Order</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cancel Prompt Inline Form (Only active when stage <= 2) */}
                    {cancellingOrderId === order.id && !isLocked && (
                      <div className="bg-red-50/70 border border-red-300 rounded-sm p-4 space-y-3">
                        <label className="block text-xs font-sans font-semibold text-red-950">
                          Reason for cancelling order {order.orderNumber}:
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please provide a brief reason for cancellation..."
                          className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-sm outline-none focus:border-red-500 font-sans"
                        />
                        {cancelError && <p className="text-xs text-red-700 font-semibold">{cancelError}</p>}
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setCancellingOrderId(null)}
                            className="px-4 py-2 text-xs font-sans text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                          >
                            Keep Order
                          </button>
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => handleConfirmCancel(order.id, order.orderNumber)}
                            className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-sm inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Confirm Order Cancellation</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ================= EXPANDABLE 6-STAGE TRACKING PANEL ================= */}
                    {isExpanded && !isCancelled && (
                      <div className="space-y-6 pt-4 border-t border-[#E7E0D3] transition-all">
                        {/* Visual 6-Stage Progress Indicator */}
                        <div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                            {ORDER_STAGE_DEFINITIONS.map((st) => {
                              const isCompleted = stage > st.stage;
                              const isCurrent = stage === st.stage;

                              return (
                                <div
                                  key={st.stage}
                                  className={`p-3.5 rounded-sm border transition-all relative ${
                                    isCurrent
                                      ? 'bg-[#1E392A] border-[#1E392A] text-white shadow-sm ring-1 ring-[#1E392A]'
                                      : isCompleted
                                      ? 'bg-[#F3EDE2] border-[#C9B39A] text-[#1C1917]'
                                      : 'bg-[#FAF7F2] border-[#E7E0D3] text-[#A8A29E] opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono uppercase font-bold">
                                      0{st.stage}
                                    </span>
                                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                    {isCurrent && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    )}
                                  </div>

                                  <h4 className="font-serif text-sm font-semibold leading-tight mb-1">
                                    {st.label}
                                  </h4>

                                  <span className="text-[9.5px] uppercase font-mono tracking-wider opacity-80 block mb-1.5">
                                    {st.shortLabel}
                                  </span>

                                  <p
                                    className={`text-[10.5px] leading-relaxed line-clamp-3 ${
                                      isCurrent ? 'text-emerald-100' : 'text-[#78716C]'
                                    }`}
                                  >
                                    {STAGE_CONDITIONS[st.stage]}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detailed Timeline Breakdown */}
                        <div className="bg-[#FAF7F2] border border-[#E7E0D3] p-4 sm:p-5 rounded-sm space-y-4">
                          <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-2.5">
                            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#1C1917] flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#8B5E3C]" />
                              <span>Consignment Telemetry Ledger</span>
                            </span>
                            <span className="text-[11px] font-mono text-[#8B5E3C]">
                              Nagina Lathe & Vault Registry
                            </span>
                          </div>

                          <div className="space-y-3">
                            {ORDER_STAGE_DEFINITIONS.map((st) => {
                              const isCompleted = stage > st.stage;
                              const isCurrent = stage === st.stage;

                              return (
                                <div
                                  key={st.stage}
                                  className={`flex items-start gap-3 text-xs ${
                                    isCurrent
                                      ? 'text-[#1C1917] font-medium'
                                      : isCompleted
                                      ? 'text-[#57534E]'
                                      : 'text-[#A8A29E]'
                                  }`}
                                >
                                  <div className="pt-0.5 shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : isCurrent ? (
                                      <span className="w-4 h-4 rounded-full border-2 border-[#1E392A] bg-white flex items-center justify-center">
                                        <span className="w-2 h-2 rounded-full bg-[#1E392A]" />
                                      </span>
                                    ) : (
                                      <span className="w-4 h-4 rounded-full border border-[#D6CEBF] bg-[#F7F4EE] block" />
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-semibold">
                                        Stage {st.stage}: {st.label}
                                      </span>
                                      {isCurrent && (
                                        <span className="px-2 py-0.5 bg-[#1E392A] text-white text-[10px] font-mono uppercase rounded-xs">
                                          Active Stage
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[#57534E] font-sans mt-1 leading-relaxed">
                                      {isCurrent && order.currentCheckpoint ? (
                                        <strong className="text-[#1C1917]">
                                          Live Telemetry: {order.currentCheckpoint}.{' '}
                                        </strong>
                                      ) : null}
                                      {STAGE_DESCRIPTIONS[st.stage]}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </section>
        )}
      </main>

      {/* Official Tax & Export Invoice Modal */}
      {invoiceOrder && (
        <OfficialTaxInvoice
          order={invoiceOrder}
          isOpen={true}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      <Footer />
    </div>
  );
}
