import { Request, Response, NextFunction } from 'express';
import {
  isApprovedIpCountry,
  isApprovedTerritoryCode,
  UNAUTHORIZED_COUNTRY_MESSAGE,
} from '../config/approvedCountries';
import { logger } from '../utils/logger';

interface CachedCountry {
  country: string;
  expiresAt: number;
}

// In-memory 1-hour cache for IP geolocation ($0 cost, prevents hitting rate limits)
const ipCountryCache = new Map<string, CachedCountry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

/**
 * Checks if an IP is loopback or a private local area network address.
 */
export function isPrivateOrLoopbackIp(ip?: string | null): boolean {
  if (!ip) return true;
  const cleanIp = ip.replace(/^::ffff:/, '').trim().toLowerCase();
  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp === 'unknown'
  ) {
    return true;
  }
  // IPv4 private ranges
  if (/^10\./.test(cleanIp)) return true;
  if (/^192\.168\./.test(cleanIp)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp)) return true;
  if (/^169\.254\./.test(cleanIp)) return true; // Link-local
  // IPv6 private / link-local ranges
  if (/^fc00:|^fe80:/i.test(cleanIp)) return true;
  return false;
}

/**
 * Resolve client IP country using free ($0, no API key required) endpoints with in-memory caching.
 * For local loopback or private IPs, queries the machine's public exit IP.
 */
export async function resolveIpCountry(ip?: string | null): Promise<string | null> {
  const isPrivate = isPrivateOrLoopbackIp(ip);
  const cacheKey = isPrivate
    ? '__machine_public_ip__'
    : (ip || '127.0.0.1').replace(/^::ffff:/, '').trim();

  const now = Date.now();
  const cached = ipCountryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.country;
  }

  let detectedCountry: string | null = null;

  // 1. Primary: https://api.country.is/ ($0 cost, ultra-fast, strict 3000ms timeout)
  try {
    const url = isPrivate ? 'https://api.country.is/' : `https://api.country.is/${cacheKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data: any = await res.json();
      if (data && typeof data.country === 'string' && data.country.trim()) {
        detectedCountry = data.country.trim().toUpperCase();
      }
    }
  } catch (err: any) {
    logger.debug(`api.country.is lookup failed or timed out: ${err.message}`);
  }

  // 2. Secondary Fallback: http://ip-api.com/json/ ($0 cost free endpoint, strict 3000ms timeout)
  if (!detectedCountry) {
    try {
      const url = isPrivate
        ? 'http://ip-api.com/json/?fields=status,countryCode,country'
        : `http://ip-api.com/json/${cacheKey}?fields=status,countryCode,country`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data: any = await res.json();
        if (data && data.status === 'success' && data.countryCode) {
          detectedCountry = String(data.countryCode).trim().toUpperCase();
        }
      }
    } catch (err: any) {
      logger.debug(`ip-api.com lookup fallback failed: ${err.message}`);
    }
  }

  if (detectedCountry) {
    ipCountryCache.set(cacheKey, {
      country: detectedCountry,
      expiresAt: now + CACHE_TTL_MS,
    });
  }

  return detectedCountry;
}

/**
 * Extract client IP from proxy/CDN headers or direct socket
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const val = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
    const first = val.split(',')[0].trim();
    if (first) return first;
  }
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp && typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp && typeof xRealIp === 'string' && xRealIp.trim()) {
    return xRealIp.trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Core country access verification utility for SISODIA ATELIER ✧.
 * Allows bypass ONLY when the email is strictly Sisodiaatelier09@gmail.com.
 * Otherwise verifies detected public IP and payload territory against the 11 approved export territories.
 */
export async function verifyApprovedCountryAccess(
  req: Request,
  email?: string
): Promise<{ allowed: boolean; detectedCountry: string | null; message?: string }> {
  const cleanEmail = (
    email ||
    (req.body?.email as string) ||
    (req.query?.email as string) ||
    ''
  ).toLowerCase().trim();

  // 1. Single Owner Exception: strictly Sisodiaatelier09@gmail.com
  if (cleanEmail === 'sisodiaatelier09@gmail.com') {
    return { allowed: true, detectedCountry: 'US' };
  }

  // 2. Resolve IP Country
  // Trusted Edge/Test Headers take priority if set (e.g. Cloudflare / Vercel edge)
  const rawCountryHeader =
    (req.headers['x-test-country'] as string) ||
    (req.headers['cf-ipcountry'] as string) ||
    (req.headers['x-vercel-ip-country'] as string) ||
    (req.headers['x-country-code'] as string) ||
    (req.headers['x-client-ip-country'] as string);

  let detectedCountry: string | null = rawCountryHeader
    ? rawCountryHeader.trim().toUpperCase()
    : null;

  // If no edge header exists, resolve real public IP country
  if (!detectedCountry) {
    const clientIp = getClientIp(req);
    detectedCountry = await resolveIpCountry(clientIp);
  }

  (req as any).detectedCountry = detectedCountry;

  // 3. Layer 1 Check: Verify IP Country is in approved 11 export territories
  if (detectedCountry && !isApprovedIpCountry(detectedCountry)) {
    return {
      allowed: false,
      detectedCountry,
      message: UNAUTHORIZED_COUNTRY_MESSAGE,
    };
  }

  // 4. Layer 2 Check: Payload Destination Territory Validation
  const submittedCountry = (
    req.body?.countryCode ||
    req.body?.preferredCountryCode ||
    req.query?.countryCode ||
    req.query?.preferredCountryCode
  ) as string | undefined;

  if (submittedCountry && !isApprovedTerritoryCode(submittedCountry)) {
    return {
      allowed: false,
      detectedCountry,
      message: UNAUTHORIZED_COUNTRY_MESSAGE,
    };
  }

  return { allowed: true, detectedCountry };
}

/**
 * Express Middleware running verifyApprovedCountryAccess.
 */
export async function countryGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const check = await verifyApprovedCountryAccess(req);

    if (!check.allowed) {
      res.status(403).json({
        success: false,
        code: 'COUNTRY_UNAUTHORIZED',
        message: check.message || UNAUTHORIZED_COUNTRY_MESSAGE,
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
