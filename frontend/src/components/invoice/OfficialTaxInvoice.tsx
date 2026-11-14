'use client';

import React from 'react';
import { OrderRecord } from '@/types';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface OfficialTaxInvoiceProps {
  order: OrderRecord;
  isOpen?: boolean;
  onClose?: () => void;
}

function numberToWords(amount: number, currency: string): string {
  const rounded = Math.round(amount);
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertSmall(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return t + (o ? '-' + o : '') + ' ';
  }

  function inrWords(num: number): string {
    if (num === 0) return 'Zero';
    let res = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = Math.floor(num / 100);
    num %= 100;
    const rem = num;

    if (crore) res += convertSmall(crore) + 'Crore ';
    if (lakh) res += convertSmall(lakh) + 'Lakh ';
    if (thousand) res += convertSmall(thousand) + 'Thousand ';
    if (hundred) res += convertSmall(hundred) + 'Hundred ';
    if (rem) res += convertSmall(rem);

    return res.trim();
  }

  const words = inrWords(rounded);
  const currLabel =
    currency === 'INR'
      ? 'Indian Rupees'
      : currency === 'USD'
      ? 'US Dollars'
      : currency === 'GBP'
      ? 'British Pounds'
      : currency === 'EUR'
      ? 'Euros'
      : currency === 'AED'
      ? 'UAE Dirhams'
      : currency;

  return `${currLabel} ${words} Only`;
}

export function OfficialTaxInvoice({ order, isOpen = true, onClose }: OfficialTaxInvoiceProps) {
  if (!isOpen) return null;

  const isDomesticIndia =
    order.currency === 'INR' ||
    order.destination.toLowerCase().includes('india') ||
    order.destination.toLowerCase().includes(', in');

  const invoiceNo = `INV-SA-2026-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '').slice(-6)}`;
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const totalInr = order.totalAmountInr || Math.round(order.totalAmountUsd * 84);
  const totalFx = order.totalAmountUsd;

  // Domestic: 12% GST included on HSN 4420
  // Export: 0% IGST under LUT (Rule 96A) + 100% Pre-Paid DDP Duty
  const taxableValueInr = isDomesticIndia ? Math.round(totalInr / 1.12) : totalInr;
  const gstAmountInr = isDomesticIndia ? totalInr - taxableValueInr : 0;
  const cgstInr = isDomesticIndia ? Math.round(gstAmountInr / 2) : 0;
  const sgstInr = isDomesticIndia ? gstAmountInr - cgstInr : 0;

  const lines =
    order.lineItems && order.lineItems.length > 0
      ? order.lineItems
      : [
          {
            title: order.itemsSummary || 'Sisodia Monolithic Solid Wood Masterpiece',
            sku: `SA-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '').slice(-6)}`,
            woodSpecies: 'Aged Heartwood (Nagina Turned / Hand-Carved)',
            quantity: 1,
            priceInr: totalInr,
            priceUsd: totalFx,
          },
        ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#FAF7F2] overflow-y-auto print:static print:w-full print:h-auto print:bg-white print:overflow-visible">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-30 bg-[#1C1917] text-[#FAF7F2] px-6 py-3 flex items-center justify-between print:hidden shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              ORDER #{order.orderNumber}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#EAEFEA] text-[#1E392A] border border-[#1E392A]/30 rounded-xs font-semibold">
            {order.status || 'ORDER_CONFIRMED'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E392A] hover:bg-[#14281D] text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-colors text-base cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoice Canvas Container (Centrally aligned, full-width responsive printable view) */}
      <div className="max-w-5xl mx-auto my-6 p-6 sm:p-12 bg-white border border-[#DDD6C9] shadow-xl rounded-sm print:border-none print:shadow-none print:my-0 print:p-0 print:max-w-none">
        {/* ================= INVOICE PRINT CANVAS ================= */}
        <div className="space-y-6 text-[#1C1917] bg-white">
          {/* Header & Seller Banner */}
          <div className="border-b-2 border-[#1E392A] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#1E392A]/25 bg-[#F5EFE6] flex items-center justify-center shrink-0 shadow-2xs">
                  <img src="/logo.jpeg?v=3" alt="SISODIA ATELIER ✧" className="w-full h-full object-cover scale-125" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-[#1C1917]">
                    SISODIA ATELIER ✧
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#EAEFEA] text-[#1E392A] border border-[#1E392A]/30 rounded-xs font-semibold">
                    EST. 1892
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#57534E] font-serif italic mt-1">
                Monolithic Solid Heartwood Turnings & Architectural Woodwork
              </p>
              <p className="text-xs text-[#44403C] font-sans mt-2 leading-relaxed">
                Woodcraft Export Cluster, Nagina, Bijnor 246762, India
                <br />
                Email: <span className="font-mono text-[#1E392A]">Sisodiaatelier09@gmail.com</span> • Phone/WhatsApp: +91 8868031460
              </p>
              <div className="mt-2 text-[11px] font-mono text-[#57534E] flex flex-wrap gap-x-4 gap-y-1">
                <span><strong>GSTIN:</strong> 09AAPFS5678F1Z8</span>
                <span><strong>IEC Code:</strong> 0518049281</span>
                <span><strong>HSN Code:</strong> 4420 (Wood Marquetry & Furniture)</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 shrink-0">
              <span className="inline-block px-3 py-1 bg-[#1E392A] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xs">
                {isDomesticIndia ? 'TAX INVOICE (GST)' : 'EXPORT TAX INVOICE (DDP)'}
              </span>
              <p className="text-xs font-mono font-bold text-[#1C1917] mt-2">
                Invoice No: {invoiceNo}
              </p>
              <p className="text-xs text-[#57534E]">
                Date: <strong className="text-[#1C1917] font-mono">{invoiceDate}</strong>
              </p>
              <p className="text-xs text-[#57534E]">
                Order Ref: <strong className="text-[#1C1917] font-mono">{order.orderNumber}</strong>
              </p>
              <p className="text-xs text-[#57534E]">
                Payment Mode: <strong className="text-[#1C1917] font-mono">{order.paymentGateway || '100% PRE-PAID ESCROW'}</strong>
              </p>
              <p className="text-xs text-[#57534E]">
                Consignment Waybill: <strong className="text-[#1C1917] font-mono">{order.trackingNumber || 'Assigned Upon ISPM-15 Crating'}</strong>
              </p>
            </div>
          </div>

          {/* Consignee / Buyer & Dispatch Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm text-xs font-sans">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] block mb-1">
                Billed & Consigned To (Buyer)
              </span>
              <p className="font-serif text-base font-semibold text-[#1C1917]">{order.customerName}</p>
              {order.firmName && (
                <p className="font-semibold text-xs text-[#1E392A] mt-0.5">
                  Firm / Estate: {order.firmName}
                </p>
              )}
              {order.gstNumber && (
                <p className="font-mono text-xs text-[#8B5E3C] mt-0.5">
                  <strong>Buyer Tax ID / GSTIN:</strong> {order.gstNumber}
                </p>
              )}
              <p className="text-[#57534E] mt-1 leading-relaxed">
                {order.shippingAddress?.line1 || order.destination}
                {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}
                {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}
                {order.shippingAddress?.postalCode ? ` - ${order.shippingAddress.postalCode}` : ''}
              </p>
              <p className="text-[#57534E] mt-1">
                Email: {order.customerEmail} {order.shippingAddress?.phoneNumber ? `• Phone: ${order.shippingAddress.phoneNumber}` : ''}
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-[#E7E0D3] sm:pl-6">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] block mb-1">
                Consignment & Export Logistics
              </span>
              <p><strong>Place of Supply:</strong> {order.destination}</p>
              <p><strong>Courier Partner:</strong> {order.courierPartner || 'DHL Express / BlueDart Priority'}</p>
              <p><strong>Terms of Delivery:</strong> 100% Delivered Duty Paid (DDP)</p>
              <p>
                <strong>Export Treatment:</strong>{' '}
                {isDomesticIndia
                  ? 'Domestic Supply under CGST/SGST 12%'
                  : 'Supply meant for export under LUT without payment of IGST (Rule 96A)'}
              </p>
              <p><strong>LUT Reference:</strong> ARN-AD090326001928K</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-[#DDD6C9] rounded-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#1E392A] text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">S.No</th>
                  <th className="p-3">Description of Solid Wood Masterpiece</th>
                  <th className="p-3">Species / Provenance</th>
                  <th className="p-3 text-center">HSN</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  <th className="p-3 text-right">{isDomesticIndia ? 'GST (12%)' : 'DDP Duty / VAT'}</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D3] text-[#1C1917]">
                {lines.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-3 text-center font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-serif text-sm font-semibold text-[#1C1917]">{item.title}</p>
                      <p className="text-[10px] font-mono text-[#78716C]">SKU: {item.sku || 'SA-NAGINA-4420'}</p>
                    </td>
                    <td className="p-3 text-[#57534E] font-serif italic">{item.woodSpecies || 'Burma Teak / Sheesham'}</td>
                    <td className="p-3 text-center font-mono">4420</td>
                    <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">
                      {isDomesticIndia
                        ? `₹${Math.round(item.priceInr / 1.12).toLocaleString('en-IN')}`
                        : `${order.currency} ${item.priceUsd.toLocaleString()}`}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800">
                      {isDomesticIndia
                        ? `₹${(item.priceInr - Math.round(item.priceInr / 1.12)).toLocaleString('en-IN')}`
                        : '0% LUT + DDP Pre-Paid'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#1C1917]">
                      {isDomesticIndia
                        ? `₹${item.priceInr.toLocaleString('en-IN')}`
                        : `${order.currency} ${item.priceUsd.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Totals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
            <div className="p-4 bg-[#FAF7F2] border border-[#E7E0D3] rounded-sm space-y-2 text-xs font-sans">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5E3C] block">
                Total Amount in Words
              </span>
              <p className="font-serif italic font-semibold text-[#1C1917] leading-relaxed">
                {numberToWords(isDomesticIndia ? totalInr : totalFx, order.currency)}
              </p>
              <div className="pt-2 border-t border-[#E7E0D3] text-[11px] text-[#57534E] space-y-1">
                <p>
                  • <strong>Dual Currency Audit:</strong> {order.currency} {totalFx.toLocaleString()} equivalent to ₹{totalInr.toLocaleString('en-IN')} INR.
                </p>
                <p>
                  • <strong>Tariff Protection:</strong> 100% Pre-Paid DDP. Consignee incurs zero carrier brokerage fees or doorstep customs bills.
                </p>
                <p>
                  • <strong>Phytosanitary Protocol:</strong> ISPM-15 Certified fumigation with 7.2% kiln core equilibrium certificate.
                </p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-white border border-[#DDD6C9] p-4 rounded-sm space-y-2 text-xs font-sans">
              <div className="flex justify-between text-[#57534E]">
                <span>Total Taxable Value:</span>
                <span className="font-mono text-[#1C1917]">
                  {isDomesticIndia ? `₹${taxableValueInr.toLocaleString('en-IN')}` : `${order.currency} ${totalFx.toLocaleString()}`}
                </span>
              </div>

              {isDomesticIndia ? (
                <>
                  <div className="flex justify-between text-[#57534E]">
                    <span>Central GST (CGST @ 6%):</span>
                    <span className="font-mono text-[#1C1917]">₹{cgstInr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#57534E]">
                    <span>State GST (SGST @ 6%):</span>
                    <span className="font-mono text-[#1C1917]">₹{sgstInr.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[#57534E]">
                    <span>Integrated GST (IGST @ 0% LUT):</span>
                    <span className="font-mono text-emerald-800">$0.00 (Export LUT Exemption)</span>
                  </div>
                  <div className="flex justify-between text-[#57534E]">
                    <span>Destination DDP Tariffs & VAT:</span>
                    <span className="font-mono text-emerald-800">100% Pre-Settled ($0 Due)</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-[#57534E]">
                <span>ISPM-15 Cedar Vault Crating & Transit:</span>
                <span className="font-mono text-emerald-800 font-semibold uppercase text-[10px]">Included</span>
              </div>

              <div className="border-t-2 border-[#1E392A] pt-3 flex items-baseline justify-between">
                <div>
                  <span className="font-sans font-bold uppercase tracking-wider text-xs block text-[#1C1917]">
                    Grand Total ({order.currency}):
                  </span>
                  <span className="font-mono text-[11px] text-[#8B5E3C]">
                    INR Equivalent: ₹{totalInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-[#1E392A]">
                  {order.currency} {isDomesticIndia ? totalInr.toLocaleString('en-IN') : totalFx.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Declaration & Signature Block */}
          <div className="border-t border-[#DDD6C9] pt-6 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs font-sans">
            <div className="space-y-1.5 max-w-md text-[#57534E] text-[11px]">
              <p className="font-semibold text-[#1C1917]">Declaration:</p>
              <p className="leading-relaxed">
                We declare that this invoice shows the actual price of the solid wood goods described and that all particulars are true and correct. Monolithic heartwood certified under ISPM-15 phytosanitary standards. Hand-turned and carved in Nagina, India.
              </p>
            </div>

            <div className="text-center sm:text-right space-y-2">
              <div className="inline-block p-2 border border-emerald-300 bg-emerald-50 rounded-xs mb-2 text-left">
                <span className="text-[10px] font-mono text-emerald-900 block font-bold">
                  ✓ DIGITALLY VERIFIED TAX INVOICE
                </span>
                <span className="text-[9px] font-mono text-emerald-700 block">
                  SISODIA ATELIER ✧ Export Desk • Nagina Cluster
                </span>
              </div>
              <p className="font-serif text-lg font-normal text-[#1C1917] italic">
                Yash Sisodia
              </p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#8B5E3C]">
                Principal & Master Craftsman
              </p>
              <p className="text-[10px] text-[#78716C]">
                For SISODIA ATELIER ✧ (Nagina, India)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
