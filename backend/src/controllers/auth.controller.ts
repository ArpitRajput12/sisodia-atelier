import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { CustomerAuthService } from '../services/customerAuth.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/apiError';
import { verifyApprovedCountryAccess } from '../middlewares/countryGuard';
import { isApprovedTerritoryCode } from '../config/approvedCountries';
import { prisma } from '../config/prisma';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'sisodia_atelier_ultra_secret_key_2026';

export class AuthController {
  // --------------------------------------------------------------------------
  // 1. CUSTOMER 1-CLICK GOOGLE & EMAIL OTP AUTHENTICATION
  // --------------------------------------------------------------------------

  static async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body.credential) {
        throw new ApiError(400, 'Google credential token is required.');
      }

      // 1. Decode and verify incoming Google ID token first
      const { email, name, picture } = await CustomerAuthService.verifyGoogleIdToken(req.body.credential);

      // 2. Immediately run zero-cost IP geolocation check before creating/returning any session
      const countryCheck = await verifyApprovedCountryAccess(req, email);
      if (!countryCheck.allowed) {
        res.status(403).json({
          success: false,
          code: 'COUNTRY_UNAUTHORIZED',
          message: 'Sorry, client login and registration are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.',
        });
        return;
      }

      // Check returning customer's stored countryCode
      const existingCustomer = await prisma.customer.findUnique({ where: { email } });
      const isOwner = email.toLowerCase().trim() === 'sisodiaatelier09@gmail.com';
      if (existingCustomer && !isOwner && !isApprovedTerritoryCode(existingCustomer.countryCode)) {
        res.status(403).json({
          success: false,
          code: 'COUNTRY_UNAUTHORIZED',
          message: 'Sorry, client login and registration are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.',
        });
        return;
      }

      const result = await CustomerAuthService.googleAuth({
        credential: req.body.credential,
        preferredCountryCode: req.body.preferredCountryCode,
        detectedCountry: countryCheck.detectedCountry,
        verifiedUser: { email, name, picture },
      });

      res.cookie('customerToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        result,
        result.isNewUser
          ? 'Welcome to SISODIA ATELIER ✧. Your patron profile has been created.'
          : 'Welcome back to SISODIA ATELIER ✧.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const detectedCountry = (
        (req.headers['x-test-country'] as string) ||
        (req.headers['x-vercel-ip-country'] as string) ||
        (req.headers['cf-ipcountry'] as string) ||
        (req.headers['x-country-code'] as string) ||
        null
      );

      const result = await CustomerAuthService.sendOtp({
        email: req.body.email,
        preferredCountryCode: req.body.preferredCountryCode,
        detectedCountry,
      });

      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const detectedCountry = (
        (req.headers['x-test-country'] as string) ||
        (req.headers['x-vercel-ip-country'] as string) ||
        (req.headers['cf-ipcountry'] as string) ||
        (req.headers['x-country-code'] as string) ||
        null
      );

      const result = await CustomerAuthService.verifyOtp({
        email: req.body.email,
        otp: req.body.otp,
        name: req.body.name,
        countryCode: req.body.countryCode,
        detectedCountry,
      });

      if ('requiresRegistrationDetails' in result && result.requiresRegistrationDetails) {
        ApiResponse.success(
          res,
          result,
          'Verification successful. Please provide your name and country to complete registration.'
        );
        return;
      }

      res.cookie('customerToken', (result as any).token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        result,
        (result as any).isNewUser
          ? 'Welcome to SISODIA ATELIER ✧. Your patron account has been activated.'
          : 'Welcome back to SISODIA ATELIER ✧.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token =
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
        req.cookies?.customerToken;

      if (!token) {
        throw new ApiError(401, 'Authentication token missing. Please sign in.');
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const customerId = decoded.customerId;

      if (!customerId) {
        throw new ApiError(401, 'Invalid customer session token.');
      }

      const updated = await CustomerAuthService.updateCustomerProfile(customerId, req.body);
      ApiResponse.success(res, { customer: updated }, 'Patron profile details updated.');
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // 1B. PATRON STRICT CART ISOLATION (DATABASE PERSISTENCE)
  // --------------------------------------------------------------------------

  static async getCustomerCart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.customer?.customerId;
      if (!customerId) {
        throw new ApiError(401, 'Patron authentication required.');
      }

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { cartJson: true },
      });

      let cart = [];
      if (customer?.cartJson) {
        cart =
          typeof customer.cartJson === 'string'
            ? JSON.parse(customer.cartJson)
            : customer.cartJson;
      }

      ApiResponse.success(res, { cart }, 'Patron cart retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomerCart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.customer?.customerId;
      if (!customerId) {
        throw new ApiError(401, 'Patron authentication required.');
      }

      const cartData = req.body.cart !== undefined ? req.body.cart : req.body.items || [];

      const updated = await prisma.customer.update({
        where: { id: customerId },
        data: {
          cartJson: cartData,
        },
        select: { cartJson: true },
      });

      ApiResponse.success(res, { cart: updated.cartJson }, 'Patron cart synchronized.');
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // 2. UNIFIED GET /ME (SUPPORTS BOTH CUSTOMER PATRON AND ADMIN USERS)
  // --------------------------------------------------------------------------

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token =
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
        req.cookies?.customerToken ||
        req.cookies?.accessToken;

      if (!token) {
        throw new ApiError(401, 'Authentication required.');
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        // Try fallback with JWT_ACCESS_SECRET if different
        try {
          decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || JWT_SECRET);
        } catch {
          throw new ApiError(401, 'Session token is invalid or expired. Please sign in again.');
        }
      }

      if (decoded.customerId) {
        const data = await CustomerAuthService.getCustomerProfile(decoded.customerId);
        ApiResponse.success(res, data, 'Patron profile retrieved.');
        return;
      }

      if (decoded.userId) {
        const user = await AuthService.getProfile(decoded.userId);
        ApiResponse.success(res, user, 'User profile retrieved.');
        return;
      }

      throw new ApiError(401, 'Unrecognized session token format.');
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // 3. LEGACY ADMIN / STAFF AUTHENTICATION
  // --------------------------------------------------------------------------

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      // Set refresh token in secure HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.created(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Welcome to SISODIA ATELIER ✧.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Patron authentication successful.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await AuthService.refresh(token);
      ApiResponse.success(res, result, 'Access token refreshed.');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (token) {
        await AuthService.logout(token).catch(() => {});
      }
      res.clearCookie('refreshToken');
      res.clearCookie('customerToken');
      ApiResponse.success(res, null, 'Signed out from SISODIA ATELIER ✧.');
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AuthService.updateProfile(req.user!.id, req.body);
      ApiResponse.success(res, updated, 'Profile details updated.');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.changePassword(req.user!.id, req.body);
      ApiResponse.success(res, result, 'Password changed successfully.');
    } catch (error) {
      next(error);
    }
  }
}


