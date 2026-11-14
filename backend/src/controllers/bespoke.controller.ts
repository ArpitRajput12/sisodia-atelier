import { Request, Response, NextFunction } from 'express';
import { BespokeService } from '../services/bespoke.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class BespokeController {
  static async submitInquiry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const inquiry = await BespokeService.submitInquiry(req.body, req.user?.id);
      ApiResponse.created(
        res,
        inquiry,
        `Your bespoke commission inquiry ${inquiry.inquiryReference} has been received by our Master Concierge.`
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPatronInquiries(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const inquiries = await BespokeService.getPatronInquiries(req.user!.id);
      ApiResponse.success(res, inquiries, 'Your bespoke commission history.');
    } catch (error) {
      next(error);
    }
  }

  static async getAllInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BespokeService.getAllInquiries(req.query as any);
      ApiResponse.paginated(
        res,
        result.data,
        result.meta,
        'Atelier bespoke commission inquiries retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getInquiryByReference(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { reference } = req.params;
      const inquiry = await BespokeService.getInquiryByReference(reference);
      ApiResponse.success(res, inquiry, 'Bespoke inquiry details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async updateInquiryStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await BespokeService.updateInquiryStatus(id, req.body);
      ApiResponse.success(res, updated, 'Bespoke inquiry workflow status updated.');
    } catch (error) {
      next(error);
    }
  }
}

