import { Request, Response, NextFunction } from 'express';
import { InquiryService } from '../services/inquiry.service';
import { ApiResponse } from '../utils/apiResponse';
import { CreateInquiryInput } from '../validators/inquiry.validator';

/**
 * HTTP handlers for Custom & Bulk Inquiries.
 */
export class InquiryController {
  static async createInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateInquiryInput;
      const inquiry = await InquiryService.createInquiry(payload);
      ApiResponse.created(
        res,
        inquiry,
        'Your custom & bulk inquiry has been received by Yash Sisodia & the Nagina Atelier team.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getInquiries(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiries = await InquiryService.getAllInquiries();
      ApiResponse.success(res, inquiries, 'Customer custom & bulk inquiries retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }
}

