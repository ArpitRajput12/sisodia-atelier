'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerUser, OrderRecord, CustomerAuthResult } from '@/types';
import {
  customerGoogleAuthApi,
  customerSendOtpApi,
  customerVerifyOtpApi,
  customerGetMeApi,
  customerUpdateProfileApi,
} from '@/lib/api';

export type { CustomerUser };

interface CustomerAuthContextValue {
  customer: CustomerUser | null;
  token: string | null;
  orders: OrderRecord[];
  isLoggedIn: boolean;
  isLoading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalSubtitle: string | null;
  openAuthModal: (subtitle?: string) => void;
  closeAuthModal: () => void;
  loginWithGoogle: (credential: string, preferredCountryCode?: string) => Promise<CustomerAuthResult>;
  sendOtp: (
    email: string,
    preferredCountryCode?: string
  ) => Promise<{ success: boolean; message: string; isExistingUser?: boolean; code?: string }>;
  verifyOtp: (
    email: string,
    otp: string,
    name?: string,
    countryCode?: string
  ) => Promise<CustomerAuthResult>;
  logoutCustomer: () => void;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    countryCode?: string;
    savedAddress?: string;
    savedCity?: string;
    savedPostalCode?: string;
    firmName?: string;
    gstOrTaxId?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  setAuthError: (err: string | null) => void;
}

const SESSION_STORAGE_KEY = 'sisodia_customer_session_v1';
const TOKEN_STORAGE_KEY = 'sisodia_customer_token_v1';

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalSubtitle, setAuthModalSubtitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Sync token and customer to localStorage
  const saveSession = (newCustomer: CustomerUser | null, newToken: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (newCustomer) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newCustomer));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      if (newToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      // quota or private browsing fallback
    }
  };

  // Safe client hydration & background session validation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let savedCustomer: CustomerUser | null = null;
    let savedToken: string | null = null;

    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        savedCustomer = JSON.parse(storedSession);
      }
      savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (savedCustomer && savedCustomer.email) {
      setCustomer(savedCustomer);
    }
    if (savedToken) {
      setToken(savedToken);
      // Validate session with backend and refresh patron profile + linked orders
      customerGetMeApi(savedToken)
        .then((res) => {
          if (res.success && res.customer) {
            setCustomer(res.customer);
            if (res.orders) setOrders(res.orders);
            try {
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.customer));
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {
          // Keep offline session cache
        });
    }

    setHasMounted(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY) {
        if (e.newValue) {
          try {
            setCustomer(JSON.parse(e.newValue));
          } catch {
            setCustomer(null);
          }
        } else {
          setCustomer(null);
        }
      }
      if (e.key === TOKEN_STORAGE_KEY) {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const openAuthModal = useCallback((subtitle?: string) => {
    setAuthError(null);
    setAuthModalSubtitle(subtitle || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setAuthModalSubtitle(null);
  }, []);

  const logoutCustomer = useCallback(() => {
    setCustomer(null);
    setToken(null);
    setOrders([]);
    saveSession(null, null);
  }, []);

  // Google 1-Click Authentication
  const loginWithGoogle = useCallback(
    async (credential: string, preferredCountryCode?: string): Promise<CustomerAuthResult> => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const result = await customerGoogleAuthApi(credential, preferredCountryCode);
        if (result.success && result.customer && result.token) {
          setCustomer(result.customer);
          setToken(result.token);
          if (result.orders) setOrders(result.orders);
          saveSession(result.customer, result.token);
          setIsAuthModalOpen(false);
        } else {
          // Strictly ensure no local patron session is established if backend returns 403 or failure
          setCustomer(null);
          setToken(null);
          saveSession(null, null);
          setAuthError(result.message || 'Google authentication unsuccessful.');
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Send 6-Digit Email OTP
  const sendOtp = useCallback(
    async (
      email: string,
      preferredCountryCode?: string
    ): Promise<{ success: boolean; message: string; isExistingUser?: boolean; code?: string }> => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const res = await customerSendOtpApi(email, preferredCountryCode);
        if (!res.success) {
          setAuthError(res.message);
        }
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Verify 6-Digit Email OTP
  const verifyOtp = useCallback(
    async (
      email: string,
      otp: string,
      name?: string,
      countryCode?: string
    ): Promise<CustomerAuthResult> => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const result = await customerVerifyOtpApi({ email, otp, name, countryCode });
        if (result.success && result.customer) {
          setCustomer(result.customer);
          if (result.token) setToken(result.token);
          if (result.orders) setOrders(result.orders);
          saveSession(result.customer, result.token || null);
          setIsAuthModalOpen(false);
        } else if (!result.requiresRegistrationDetails) {
          setAuthError(result.message || 'OTP verification failed.');
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update Customer Profile
  const updateProfile = useCallback(
    async (data: {
      name?: string;
      phone?: string;
      countryCode?: string;
      savedAddress?: string;
      savedCity?: string;
      savedPostalCode?: string;
      firmName?: string;
      gstOrTaxId?: string;
    }): Promise<{ success: boolean; message?: string }> => {
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      setIsLoading(true);
      try {
        const res = await customerUpdateProfileApi(token, data);
        if (res.success && res.customer) {
          setCustomer((prev) => (prev ? { ...prev, ...res.customer } : res.customer!));
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({ ...customer, ...res.customer })
              );
            } catch {
              // ignore
            }
          }
          return { success: true, message: 'Patron profile updated.' };
        }
        return { success: false, message: res.message || 'Failed to update profile' };
      } finally {
        setIsLoading(false);
      }
    },
    [token, customer]
  );

  // Refresh Customer Profile from Backend
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await customerGetMeApi(token);
      if (res.success && res.customer) {
        setCustomer(res.customer);
        if (res.orders) setOrders(res.orders);
        saveSession(res.customer, token);
      }
    } catch {
      // ignore
    }
  }, [token]);

  const value: CustomerAuthContextValue = {
    customer,
    token,
    orders,
    isLoggedIn: Boolean(hasMounted && customer && customer.email),
    isLoading,
    authError,
    isAuthModalOpen,
    authModalSubtitle,
    openAuthModal,
    closeAuthModal,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    logoutCustomer,
    updateProfile,
    refreshProfile,
    setAuthError,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return ctx;
}
