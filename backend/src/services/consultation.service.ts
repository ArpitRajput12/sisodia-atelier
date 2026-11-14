import { BadRequestError } from '../utils/apiError';
import { InquiryService } from './inquiry.service';
import { prisma } from '../config/prisma';

export const ALLOWED_CONSULTATION_SLOTS = [
  '11:00 AM – 11:30 AM IST',
  '11:30 AM – 12:00 PM IST',
  '12:00 PM – 12:30 PM IST',
  '12:30 PM – 01:00 PM IST',
  '01:00 PM – 01:30 PM IST',
  '01:30 PM – 02:00 PM IST',
] as const;

export class ConsultationService {
  /**
   * Check available slots for a given meeting date (YYYY-MM-DD)
   */
  static async getAvailableSlots(dateString: string) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      throw new BadRequestError('Invalid date format. Expected YYYY-MM-DD.');
    }

    let bookedSlotsSet = new Set<string>();
    try {
      const meetings = await prisma.inquiry.findMany({
        where: {
          type: 'MEETING_REQUEST',
          preferredDateTime: { contains: dateString },
          status: { not: 'CANCELLED' },
        },
        select: { preferredDateTime: true },
      });
      bookedSlotsSet = new Set(
        meetings
          .map((m) => m.preferredDateTime?.split('@')[1]?.trim() || '')
          .filter(Boolean)
      );
    } catch {
      // Graceful fallback
    }

    const slots = ALLOWED_CONSULTATION_SLOTS.map((slot) => ({
      slot,
      isAvailable: !bookedSlotsSet.has(slot),
    }));

    return {
      date: dateString,
      atelierHours: '11:00 AM – 02:00 PM IST (Strict)',
      timeZone: 'Asia/Kolkata (IST)',
      slots,
    };
  }

  /**
   * Book a consultation / in-person meeting with Master Yash Sisodia
   */
  static async bookConsultation(data: {
    patronName: string;
    patronEmail: string;
    patronPhone?: string;
    patronCountry?: string;
    meetingDate: string;
    timeSlot: string;
    projectScopeNotes?: string;
  }) {
    const preferredDateTime = `${data.meetingDate} @ ${data.timeSlot}`;

    const inquiry = await InquiryService.createInquiry({
      customerName: data.patronName,
      customerEmail: data.patronEmail,
      customerPhone: data.patronPhone,
      country: data.patronCountry,
      type: 'MEETING_REQUEST',
      subject: `[Consultation Scheduled] ${data.patronName} (${preferredDateTime})`,
      message: data.projectScopeNotes || 'In-Person Nagina Atelier / Phone Consultation Request',
      preferredDateTime,
    });

    return {
      id: inquiry.id,
      meetingDate: data.meetingDate,
      timeSlot: data.timeSlot,
      status: 'CONFIRMED',
      patronName: data.patronName,
      patronEmail: data.patronEmail,
    };
  }

  static async getAllConsultations(date?: string) {
    return prisma.inquiry.findMany({
      where: {
        type: 'MEETING_REQUEST',
        ...(date ? { preferredDateTime: { contains: date } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUpcomingConsultations() {
    return prisma.inquiry.findMany({
      where: { type: 'MEETING_REQUEST' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
