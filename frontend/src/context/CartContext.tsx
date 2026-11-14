'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, ProductItem } from '../types';
import { useCustomerAuth } from './CustomerAuthContext';
import { fetchCustomerCartApi, updateCustomerCartApi } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductItem, quantity?: number, monogram?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  requestCheckout: () => void;
  pendingCheckoutAfterAuth: boolean;
  itemCount: number;
  subtotalUsd: number;
  subtotalInr: number;
}

const GUEST_CART_KEY = 'sisodia_cart_guest';

function getUserCartKey(email?: string | null): string {
  if (!email) return GUEST_CART_KEY;
  return `sisodia_cart_${email.trim().toLowerCase()}`;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { customer, token, isLoggedIn, openAuthModal, closeAuthModal } = useCustomerAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);
  const previousEmailRef = useRef<string | null>(null);

  // Sync / Migrate cart whenever customer changes (login, logout, switch account)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentEmail = customer?.email ? customer.email.trim().toLowerCase() : null;

    // 1. LOGGED OUT STATE
    if (!currentEmail) {
      // If user was previously logged in and now logged out: reset active cart & clear guest storage
      if (previousEmailRef.current) {
        setItems([]);
        try {
          localStorage.removeItem(GUEST_CART_KEY);
        } catch {}
      } else {
        // Initial load as guest: load guest cart if present
        try {
          const guestSaved = localStorage.getItem(GUEST_CART_KEY);
          if (guestSaved) {
            setItems(JSON.parse(guestSaved));
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
      }
      previousEmailRef.current = null;
      return;
    }

    // 2. LOGGED IN STATE
    previousEmailRef.current = currentEmail;
    const userKey = getUserCartKey(currentEmail);

    let userStoredItems: CartItem[] = [];
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) userStoredItems = JSON.parse(stored);
    } catch {}

    // Check if guest had any items to merge
    let guestStoredItems: CartItem[] = [];
    try {
      const guestStored = localStorage.getItem(GUEST_CART_KEY);
      if (guestStored) guestStoredItems = JSON.parse(guestStored);
    } catch {}

    let merged = [...userStoredItems];
    if (guestStoredItems.length > 0) {
      guestStoredItems.forEach((gItem) => {
        const idx = merged.findIndex((m) => m.product.id === gItem.product.id);
        if (idx > -1) {
          merged[idx].quantity += gItem.quantity;
        } else {
          merged.push(gItem);
        }
      });
      // Clear guest cart once merged into user account
      try {
        localStorage.removeItem(GUEST_CART_KEY);
      } catch {}
    }

    setItems(merged);
    try {
      localStorage.setItem(userKey, JSON.stringify(merged));
    } catch {}

    // Sync with Neon PostgreSQL if token available
    if (token) {
      fetchCustomerCartApi(token)
        .then((serverCart) => {
          if (serverCart && serverCart.length > 0 && merged.length === 0) {
            setItems(serverCart);
            try {
              localStorage.setItem(userKey, JSON.stringify(serverCart));
            } catch {}
          } else if (merged.length > 0) {
            updateCustomerCartApi(token, merged).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [customer, token]);

  // Seamless checkout trigger after successful authentication
  useEffect(() => {
    if (isLoggedIn && pendingCheckoutAfterAuth) {
      setPendingCheckoutAfterAuth(false);
      closeAuthModal();
      setIsCheckoutOpen(true);
    }
  }, [isLoggedIn, pendingCheckoutAfterAuth, closeAuthModal]);

  const persistItems = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== 'undefined') {
      const currentEmail = customer?.email ? customer.email.trim().toLowerCase() : null;
      const key = getUserCartKey(currentEmail);
      try {
        localStorage.setItem(key, JSON.stringify(newItems));
      } catch {}

      if (isLoggedIn && token) {
        updateCustomerCartApi(token, newItems).catch(() => {});
      }
    }
  };

  const addItem = (product: ProductItem, quantity = 1, monogram?: string) => {
    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      if (monogram) updated[existingIndex].customMonogram = monogram;
      persistItems(updated);
    } else {
      persistItems([...items, { product, quantity, customMonogram: monogram }]);
    }
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    persistItems(items.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      persistItems(
        items.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    persistItems([]);
  };

  // Mandatory login / register checkout flow
  const requestCheckout = () => {
    if (!isLoggedIn) {
      setPendingCheckoutAfterAuth(true);
      setIsCartOpen(false);
      openAuthModal('Sign in or register to proceed with your order.');
    } else {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUsd = items.reduce(
    (sum, item) => sum + item.product.basePriceUsd * item.quantity,
    0
  );
  const subtotalInr = items.reduce(
    (sum, item) =>
      sum + (item.product.basePriceInr || item.product.basePriceUsd * 84) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        requestCheckout,
        pendingCheckoutAfterAuth,
        itemCount,
        subtotalUsd,
        subtotalInr,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
