import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'sisodia_atelier_ultra_secret_key_2026';

export class OwnerController {
  /**
   * Verify Owner Passcode & Issue 12-Hour Signed Owner JWT
   * POST /api/v1/owner/login (and alias /api/v1/auth/owner-login)
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expectedPasscode = (process.env.OWNER_PASSCODE || '').trim();

      if (!expectedPasscode) {
        logger.error('[OWNER AUTH ERROR] OWNER_PASSCODE is not configured in backend/.env');
        res.status(500).json({
          success: false,
          message: 'Owner passcode is not configured on the server.',
        });
        return;
      }

      const submitted = String(
        req.body?.passcode || req.body?.password || req.body?.pin || ''
      ).trim();

      if (!submitted) {
        res.status(401).json({
          success: false,
          message: 'Invalid owner password. Access denied.',
        });
        return;
      }

      const bufA = Buffer.from(submitted);
      const bufB = Buffer.from(expectedPasscode);

      const matches =
        bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

      if (!matches) {
        res.status(401).json({
          success: false,
          message: 'Invalid owner password. Access denied.',
        });
        return;
      }

      // Generate 12-hour signed Owner JWT
      const token = jwt.sign(
        {
          role: 'OWNER',
          email: 'Sisodiaatelier09@gmail.com',
          name: 'Yash Sisodia',
          isOwner: true,
        },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.cookie('ownerToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          token,
          owner: {
            name: 'Yash Sisodia',
            email: 'Sisodiaatelier09@gmail.com',
            role: 'OWNER',
          },
        },
        'Founder desk unlocked. Atelier ledger access granted.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Quick token validity check
   * GET /api/v1/owner/verify
   */
  static async verify(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      ApiResponse.success(
        res,
        {
          valid: true,
          user: req.user,
        },
        'Owner desk session is valid.'
      );
    } catch (error) {
      next(error);
    }
  }
}
