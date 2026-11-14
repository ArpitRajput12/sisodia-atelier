import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { UnauthorizedError } from '../utils/apiError';
import { verifyAccessToken } from '../utils/tokens';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'sisodia_atelier_ultra_secret_key_2026';

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is missing. Please sign in.');
    }

    const payload = verifyAccessToken(token);

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account is invalid or deactivated.');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    } as AuthenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
          },
        });

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          } as AuthenticatedUser;
        }
      } catch {
        // Silently continue as guest if token is expired or invalid
      }
    }

    // Capture guest session ID if sent from client headers
    const guestSessionHeader = req.headers['x-guest-session-id'] as string;
    if (guestSessionHeader) {
      req.guestSessionId = guestSessionHeader;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticates Owner / Atelier Admin requests via either:
 * 1) Valid Signed Owner JWT (Bearer token, x-owner-token, or cookie)
 * 2) Valid Staff / Admin JWT Bearer token
 * 3) Direct timing-safe comparison with backend OWNER_PASSCODE
 */
export async function authenticateOwner(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-owner-token']) {
      token = String(req.headers['x-owner-token']);
    } else if (req.cookies && (req.cookies.ownerToken || req.cookies.accessToken)) {
      token = req.cookies.ownerToken || req.cookies.accessToken;
    }

    // 1. Verify Signed Owner JWT Token
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (
          decoded &&
          (decoded.role === 'OWNER' ||
            decoded.isOwner === true ||
            decoded.email?.toLowerCase() === 'sisodiaatelier09@gmail.com')
        ) {
          req.user = {
            id: 'founder-yash-sisodia',
            email: 'Sisodiaatelier09@gmail.com',
            role: UserRole.SUPER_ADMIN,
            firstName: 'Yash',
            lastName: 'Sisodia',
          } as AuthenticatedUser;
          return next();
        }
      } catch {
        // Fallback: check database user JWT
        try {
          const payload = verifyAccessToken(token);
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          });

          if (
            user &&
            ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ARTISAN_CURATOR] as UserRole[]).includes(user.role)
          ) {
            req.user = user as AuthenticatedUser;
            return next();
          }
        } catch {}
      }
    }

    // 2. Direct Passcode Header Fallback (timing-safe check against backend env)
    const ownerPasscode =
      (req.headers['x-owner-passcode'] as string) ||
      (req.headers['x-founder-passcode'] as string);

    const expectedPasscode = (process.env.OWNER_PASSCODE || env.OWNER_PASSCODE || '').trim();

    if (ownerPasscode && expectedPasscode) {
      const bufA = Buffer.from(ownerPasscode.trim());
      const bufB = Buffer.from(expectedPasscode);
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        req.user = {
          id: 'founder-yash-sisodia',
          email: 'Sisodiaatelier09@gmail.com',
          role: UserRole.SUPER_ADMIN,
          firstName: 'Yash',
          lastName: 'Sisodia',
        } as AuthenticatedUser;
        return next();
      }
    }

    throw new UnauthorizedError(
      'Owner authentication required. Please sign in to the Yash Sisodia Founder Desk.'
    );
  } catch (error) {
    next(error);
  }
}

export const requireOwnerAuth = authenticateOwner;

/**
 * Authenticates Customer Patron requests using customer JWT Bearer token
 * from Authorization header or customerToken cookie.
 */
export async function authenticateCustomer(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && (req.cookies.customerToken || req.cookies.accessToken)) {
      token = req.cookies.customerToken || req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Patron authentication required. Please sign in to proceed.');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || JWT_SECRET);
      } catch {
        throw new UnauthorizedError('Patron session has expired. Please sign in again.');
      }
    }

    if (!decoded || (!decoded.customerId && !decoded.email)) {
      throw new UnauthorizedError('Invalid patron session token.');
    }

    req.customer = {
      customerId: decoded.customerId || decoded.id,
      email: String(decoded.email).toLowerCase().trim(),
      name: decoded.name || 'Valued Patron',
      countryCode: decoded.countryCode || 'US',
      role: decoded.role || 'CLIENT',
    };

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticateCustomer(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && (req.cookies.customerToken || req.cookies.accessToken)) {
      token = req.cookies.customerToken || req.cookies.accessToken;
    }

    if (token) {
      try {
        let decoded: any;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch {
          decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || JWT_SECRET);
        }
        if (decoded && (decoded.customerId || decoded.email)) {
          req.customer = {
            customerId: decoded.customerId || decoded.id,
            email: String(decoded.email).toLowerCase().trim(),
            name: decoded.name || 'Valued Patron',
            countryCode: decoded.countryCode || 'US',
            role: decoded.role || 'CLIENT',
          };
        }
      } catch {
        // Continue without customer
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
