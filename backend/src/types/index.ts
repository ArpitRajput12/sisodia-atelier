import { Request } from 'express';
import { UserRole, Currency } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedCustomer {
  customerId: string;
  email: string;
  name: string;
  countryCode: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  customer?: AuthenticatedCustomer;
  guestSessionId?: string;
  preferredCurrency?: Currency;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface WhiteGloveQuote {
  baseCurrency: Currency;
  subtotal: number;
  cratingFee: number;
  freightFee: number;
  insuranceFee: number;
  customsDutyEstimate: number;
  totalEstimatedAmount: number;
  leadTimeWeeks: number;
}

