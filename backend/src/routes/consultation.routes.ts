import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  bookConsultationSchema,
  consultationQuerySchema,
} from '../validators/consultation.validator';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

// Public consultation booking and slot inquiry
router.get('/available-slots', ConsultationController.getAvailableSlots);

router.post(
  '/',
  validateRequest({ body: bookConsultationSchema }),
  ConsultationController.bookConsultation
);

// Atelier Concierge & Curator administration
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ARTISAN_CURATOR),
  validateRequest({ query: consultationQuerySchema as any }),
  ConsultationController.getAllConsultations
);

export default router;

