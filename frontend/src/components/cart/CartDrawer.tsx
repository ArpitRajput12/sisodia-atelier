'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { CheckoutModal } from './CheckoutModal';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ShoppingBag,
  Lock,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    requestCheckout,
    removeItem,
    updateQuantity,
    subtotalInr,
  } = useCart();
  const { formatPriceFromINR } = useCurrency();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E7E0D3] text-[#1C1917] flex flex-col justify-between shadow-2xl">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E7E0D3] flex items-center justify-between bg-[#F7F4EE]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#8B5E3C]" />
              <h3 className="font-serif text-xl text-[#1C1917] font-semibold">
                Consignment Bag
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#78716C] hover:text-[#1C1917] p-1"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bag Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 text-[#78716C] font-sans text-xs">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 stroke-1 text-[#DDD6C9]" />
                <p className="text-[#1C1917] text-base font-serif mb-1">
                  Your consignment bag is empty.
                </p>
                <p>Browse our heirloom masterworks to begin your collection.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-white border border-[#E7E0D3] rounded-sm shadow-xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded-sm border border-[#E7E0D3] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm text-[#1C1917] font-semibold leading-snug">
                        {item.product.title}
                      </h4>
                      <p className="text-[11px] text-[#8B5E3C] font-sans">
                        {item.product.woodSpecies.split('(')[0]}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#DDD6C9] rounded-sm bg-[#FAF7F2]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#F3EDE2] text-[#44403C]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-sans font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#F3EDE2] text-[#44403C]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-serif text-base text-[#1C1917] font-semibold">
                          {formatPriceFromINR((item.product.basePriceInr || item.product.basePriceUsd * 84) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-[#78716C] hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E7E0D3] bg-[#F7F4EE] font-sans text-xs space-y-4">
              {/* Trust Tag */}
              <div className="p-3 bg-[#EAEFEA] border border-[#1E392A]/20 rounded-sm flex items-center gap-2.5 text-[#1E392A] text-[11px] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% DDP Customs Tariffs Pre-Paid • Zero Doorstep Taxes</span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#44403C] uppercase tracking-wider text-xs font-medium">
                  Estimated Investment
                </span>
                <span className="font-serif text-2xl text-[#1C1917] font-bold">
                  {formatPriceFromINR(subtotalInr)}
                </span>
              </div>

              <p className="text-[11px] text-[#78716C] leading-normal">
                Includes ISPM-15 certified cedar vault packaging, 3-axis transit tilt sensors, and white-glove DHL Express air transit.
              </p>

              <button
                onClick={requestCheckout}
                className="w-full py-4 bg-[#1E392A] hover:bg-[#162C20] text-white font-semibold text-xs tracking-[2px] uppercase rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Proceed to Secure Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
