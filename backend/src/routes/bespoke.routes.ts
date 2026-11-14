import { Router } from 'express';
import { BespokeController } from '../controllers/bespoke.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  submitBespokeInquirySchema,
  updateBespokeStatusSchema,
  bespokeQuerySchema,
} from '../validators/bespoke.validator';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { bespokeInquiryRateLimiter } from '../middlewares/rateLimiter';
import { UserRole } from '@prisma/client';

const router = Router();

// Submit bespoke commission inquiry (Guests or authenticated patrons)
router.post(
  '/',
  bespokeInquiryRateLimiter,
  optionalAuthenticate,
  validateRequest({ body: submitBespokeInquirySchema }),
  BespokeController.submitInquiry
);

// Get inquiries placed by authenticated patron
router.get('/my-inquiries', authenticate, BespokeController.getPatronInquiries);

// Atelier Concierge & Admin routes
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ARTISAN_CURATOR),
  validateRequest({ query: bespokeQuerySchema as any }),
  BespokeController.getAllInquiries
);

router.get('/:reference', optionalAuthenticate, BespokeController.getInquiryByReference);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ARTISAN_CURATOR),
  validateRequest({ body: updateBespokeStatusSchema }),
  BespokeController.updateInquiryStatus
);

export default router;

