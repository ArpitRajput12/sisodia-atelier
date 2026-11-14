import { Request, Response, NextFunction } from 'express';
import { ConsultationService } from '../services/consultation.service';
import { ApiResponse } from '../utils/apiResponse';
import { BadRequestError } from '../utils/apiError';

export class ConsultationController {
  static async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string;
      if (!date) {
        throw new BadRequestError('Query parameter "date" (YYYY-MM-DD) is required.');
      }
      const data = await ConsultationService.getAvailableSlots(date);
      ApiResponse.success(res, data, 'Available salon consultation slots retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async bookConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await ConsultationService.bookConsultation(req.body);
      ApiResponse.created(
        res,
        booking,
        `Your consultation meeting with Principal Yash Sisodia has been confirmed for ${booking.meetingDate} (${booking.timeSlot}).`
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllConsultations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const bookings = await ConsultationService.getAllConsultations(date);
      ApiResponse.success(res, bookings, 'Atelier consultation salon schedule.');
    } catch (error) {
      next(error);
    }
  }
}

