import { Router } from 'express';
import { InquiryController } from '../controllers/inquiry.controller';
import { requireOwnerAuth } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { createInquirySchema } from '../validators/inquiry.validator';
import { bespokeInquiryRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public storefront submission for Custom & Bulk / Hotel Wooden Tile Projects
router.post(
  '/',
  bespokeInquiryRateLimiter,
  validateRequest({ body: createInquirySchema }),
  InquiryController.createInquiry
);

// Inquiry list strictly protected for Yash Sisodia Atelier Dashboard & administrative review
router.get('/', requireOwnerAuth, InquiryController.getInquiries);

export default router;

