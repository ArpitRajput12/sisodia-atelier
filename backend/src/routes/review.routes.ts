import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { submitReviewSchema } from '../validators/review.validator';
import { optionalAuthenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/', ReviewController.getCuratedReviews);
router.get('/summary', ReviewController.getReviewsSummary);
router.post(
  '/',
  optionalAuthenticate,
  validateRequest({ body: submitReviewSchema }),
  ReviewController.submitReview
);

export default router;

