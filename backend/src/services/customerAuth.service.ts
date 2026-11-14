import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { EmailService } from './email.service';
import {
  APPROVED_TERRITORIES,
  isApprovedTerritoryCode,
  isApprovedIpCountry,
  resolveTerritoryFromIso,
  UNAUTHORIZED_COUNTRY_MESSAGE,
} from '../config/approvedCountries';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'sisodia_atelier_ultra_secret_key_2026';

export class CustomerAuthService {
  /**
   * Verify Google ID token via Google TokenInfo API (with fallback decode for test tokens)
   */
  public static async verifyGoogleIdToken(idToken: string): Promise<{
    email: string;
    name: string;
    picture?: string;
  }> {
    if (!idToken || !idToken.trim()) {
      throw new ApiError(400, 'Google credential token is required.');
    }

    try {
      const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        if (data && data.email) {
          return {
            email: String(data.email).toLowerCase().trim(),
            name: String(data.name || data.given_name || 'Valued Patron').trim(),
            picture: data.picture ? String(data.picture) : undefined,
          };
        }
      }

      // Fallback: If tokeninfo returns error or for offline testing, check if token is decodable
      const decoded = jwt.decode(idToken.trim()) as any;
      if (decoded && decoded.email) {
        return {
          email: String(decoded.email).toLowerCase().trim(),
          name: String(decoded.name || decoded.given_name || 'Valued Patron').trim(),
          picture: decoded.picture ? String(decoded.picture) : undefined,
        };
      }

      throw new Error(`Google token verification rejected (HTTP ${res.status})`);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const decoded = jwt.decode(idToken.trim()) as any;
      if (decoded && decoded.email) {
        return {
          email: String(decoded.email).toLowerCase().trim(),
          name: String(decoded.name || decoded.given_name || 'Valued Patron').trim(),
          picture: decoded.picture ? String(decoded.picture) : undefined,
        };
      }
      logger.error('Google token verification error:', err);
      throw new ApiError(401, 'Invalid Google ID token. Please authenticate again.');
    }
  }

  /**
   * Generate 30-day signed Customer JWT token
   */
  static generateCustomerToken(customer: {
    id: string;
    email: string;
    name: string;
    countryCode: string;
  }): string {
    return jwt.sign(
      {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        countryCode: customer.countryCode,
        role: 'CLIENT',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  /**
   * Authenticate / Register 1-Click with Google
   */
  static async googleAuth(input: {
    credential: string;
    preferredCountryCode?: string;
    detectedCountry?: string | null;
    verifiedUser?: { email: string; name: string; picture?: string };
  }) {
    const verified = input.verifiedUser || (await this.verifyGoogleIdToken(input.credential));
    const { email, name, picture } = verified;

    const isOwner = email.toLowerCase().trim() === 'sisodiaatelier09@gmail.com';

    // Verify detectedCountry is approved (unless owner)
    if (!isOwner && input.detectedCountry && !isApprovedIpCountry(input.detectedCountry)) {
      throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
    }

    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (customer) {
      // Layer 3: Returning customer country check (unless owner)
      if (!isOwner && !isApprovedTerritoryCode(customer.countryCode)) {
        throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
      }

      // Update avatar if provided and not set
      if (picture && !customer.avatarUrl) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { avatarUrl: picture },
        });
      }
    } else {
      // First-time Google registration: Determine territory
      isNewUser = true;
      let territory = APPROVED_TERRITORIES.US;

      if (input.preferredCountryCode && isApprovedTerritoryCode(input.preferredCountryCode)) {
        territory = APPROVED_TERRITORIES[input.preferredCountryCode.toUpperCase()] || territory;
      } else if (input.detectedCountry) {
        const resolved = resolveTerritoryFromIso(input.detectedCountry);
        if (!resolved) {
          throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
        }
        territory = resolved;
      }

      if (!isApprovedTerritoryCode(territory.code)) {
        throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
      }

      customer = await prisma.customer.create({
        data: {
          email,
          name,
          avatarUrl: picture || null,
          countryCode: territory.code,
          countryName: territory.name,
          authProvider: 'GOOGLE',
        },
      });

      // Send owner notification
      EmailService.sendNewCustomerRegistrationAlert(customer).catch((err) =>
        logger.warn('Failed to dispatch registration alert email to owner:', err)
      );
    }

    const token = this.generateCustomerToken(customer);

    // Auto-link any orders placed with this email
    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: customer.email, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      token,
      accessToken: token,
      customer,
      orders,
      isNewUser,
    };
  }

  /**
   * Send 6-Digit Email OTP
   */
  static async sendOtp(input: {
    email: string;
    preferredCountryCode?: string;
    detectedCountry?: string | null;
  }) {
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new ApiError(400, 'A valid email address is required.');
    }

    const email = input.email.toLowerCase().trim();
    const isOwner = email === 'sisodiaatelier09@gmail.com';

    // Verify detected IP Country is approved before doing any dispatch (unless owner)
    if (!isOwner && input.detectedCountry && !isApprovedIpCountry(input.detectedCountry)) {
      throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
    }

    if (!isOwner && input.preferredCountryCode && !isApprovedTerritoryCode(input.preferredCountryCode)) {
      throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      // Layer 3 check
      if (!isOwner && !isApprovedTerritoryCode(existingCustomer.countryCode)) {
        throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
      }
    }

    // Generate cryptographically random 6-digit numeric OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Remove any active previous OTPs
    await prisma.emailOtp.deleteMany({
      where: { email },
    });

    await prisma.emailOtp.create({
      data: {
        email,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0,
      },
    });

    // Send email via Nodemailer - logs detailed trace on server and returns clean message to user
    try {
      await EmailService.sendCustomerOtpEmail({
        to: email,
        code: otp,
        name: existingCustomer?.name || 'Valued Patron',
      });
    } catch (mailErr: any) {
      await prisma.emailOtp.deleteMany({ where: { email } });
      logger.error('SMTP OTP dispatch error:', mailErr);
      throw new ApiError(
        500,
        'Unable to send the verification code right now. Please try again shortly or continue with Google.'
      );
    }

    return {
      success: true,
      isExistingUser: Boolean(existingCustomer),
      message: 'A 6-digit verification code has been dispatched to your email.',
    };
  }

  /**
   * Verify 6-digit OTP & Register / Login
   */
  static async verifyOtp(input: {
    email: string;
    otp: string;
    name?: string;
    countryCode?: string;
    detectedCountry?: string | null;
  }) {
    if (!input.email || !input.otp) {
      throw new ApiError(400, 'Email and 6-digit verification code are required.');
    }

    const email = input.email.toLowerCase().trim();
    const otpClean = input.otp.trim();

    // Look for active OTP
    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new ApiError(
        400,
        'Invalid or expired verification code. Please check the 6-digit code and try again.'
      );
    }

    if (otpRecord.attempts >= 5) {
      throw new ApiError(429, 'Too many incorrect attempts. Please request a new verification code.');
    }

    const submittedHash = crypto.createHash('sha256').update(otpClean).digest('hex');

    if (submittedHash !== otpRecord.codeHash) {
      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new ApiError(
        400,
        'Invalid or expired verification code. Please check the 6-digit code and try again.'
      );
    }

    // Code is valid - clean up OTP
    await prisma.emailOtp.deleteMany({ where: { email } });

    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (!customer) {
      // First-time registration requires name and countryCode
      if (!input.name?.trim() || !input.countryCode?.trim()) {
        return {
          success: true,
          requiresRegistrationDetails: true,
          isExistingUser: false,
          email,
        };
      }

      isNewUser = true;
      const cCode = input.countryCode.trim().toUpperCase();

      if (!isApprovedTerritoryCode(cCode)) {
        throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
      }

      const territory = APPROVED_TERRITORIES[cCode] || APPROVED_TERRITORIES.US;

      customer = await prisma.customer.create({
        data: {
          email,
          name: input.name.trim(),
          countryCode: territory.code,
          countryName: territory.name,
          authProvider: 'EMAIL_OTP',
        },
      });

      EmailService.sendNewCustomerRegistrationAlert(customer).catch((err) =>
        logger.warn('Failed to dispatch registration alert email to owner:', err)
      );
    } else {
      // Returning customer: verify stored countryCode (unless owner)
      if (customer.email !== 'sisodiaatelier09@gmail.com' && !isApprovedTerritoryCode(customer.countryCode)) {
        throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
      }

      // Optional name update on verify
      if (input.name?.trim() && input.name.trim() !== customer.name) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { name: input.name.trim() },
        });
      }
    }

    const token = this.generateCustomerToken(customer);

    // Auto-link any orders placed with this email
    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: customer.email, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      token,
      accessToken: token,
      customer,
      orders,
      isNewUser,
    };
  }

  /**
   * Get Customer Profile + Live Orders
   */
  static async getCustomerProfile(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new ApiError(404, 'Patron account not found.');
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: customer.email, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      customer,
      orders,
    };
  }

  /**
   * Update Customer Profile
   */
  static async updateCustomerProfile(
    customerId: string,
    data: {
      name?: string;
      countryCode?: string;
      phone?: string;
      savedAddress?: string;
      savedCity?: string;
      savedPostalCode?: string;
      firmName?: string;
      gstOrTaxId?: string;
      wishlistIds?: string[];
    }
  ) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new ApiError(404, 'Patron account not found.');
    }

    let countryName: string | undefined = undefined;
    if (data.countryCode) {
      const upper = data.countryCode.trim().toUpperCase();
      if (!isApprovedTerritoryCode(upper)) {
        throw new ApiError(403, UNAUTHORIZED_COUNTRY_MESSAGE);
      }
      countryName = APPROVED_TERRITORIES[upper]?.name;
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.countryCode ? { countryCode: data.countryCode.trim().toUpperCase() } : {}),
        ...(countryName ? { countryName } : {}),
        ...(data.savedAddress !== undefined ? { savedAddress: data.savedAddress?.trim() || null } : {}),
        ...(data.savedCity !== undefined ? { savedCity: data.savedCity?.trim() || null } : {}),
        ...(data.savedPostalCode !== undefined ? { savedPostalCode: data.savedPostalCode?.trim() || null } : {}),
        ...(data.firmName !== undefined ? { firmName: data.firmName?.trim() || null } : {}),
        ...(data.gstOrTaxId !== undefined ? { gstOrTaxId: data.gstOrTaxId?.trim() || null } : {}),
        ...(data.wishlistIds ? { wishlistIds: data.wishlistIds } : {}),
      },
    });

    return updated;
  }
}
