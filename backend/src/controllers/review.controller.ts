import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class ReviewController {
  static async getCuratedReviews(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await ReviewService.getCuratedReviews();
      ApiResponse.success(res, reviews, 'Curated verified patron heirloom reviews retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getReviewsSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await ReviewService.getReviewsSummary();
      ApiResponse.success(res, summary, 'Verified patron review metrics & consignment audit.');
    } catch (error) {
      next(error);
    }
  }

  static async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await ReviewService.submitReview({
        ...req.body,
        userId: req.user?.id,
      });
      ApiResponse.created(res, review, 'Patron review submitted to atelier archives.');
    } catch (error) {
      next(error);
    }
  }
}

