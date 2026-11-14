import { Inquiry } from '@prisma/client';
import { prisma } from '../config/prisma';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export interface CreateInquiryPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  contactInfo?: string;
  country?: string;
  type?: string;
  requirementType?: string;
  quantityOrScope?: string;
  subject?: string;
  message: string;
  preferredDateTime?: string;
}

export class InquiryService {
  static async createInquiry(input: CreateInquiryPayload): Promise<Inquiry> {
    const customerName = input.customerName?.trim() || 'Anonymous Patron';

    // Parse email & phone from contactInfo if direct email wasn't provided
    let customerEmail = input.customerEmail?.trim() || '';
    let customerPhone = input.customerPhone?.trim() || '';

    if (!customerEmail && input.contactInfo) {
      const emailMatch = input.contactInfo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        customerEmail = emailMatch[1];
      }
      const phoneMatch = input.contactInfo.match(/(\+?\d[\d\s-]{7,}\d)/);
      if (phoneMatch) {
        customerPhone = phoneMatch[1];
      }
      if (!customerEmail) {
        customerEmail = input.contactInfo.trim();
      }
    }

    if (!customerEmail) {
      customerEmail = 'patron@sisodiaatelier.com';
    }

    // Determine type
    const type =
      input.type ||
      (input.preferredDateTime ? 'MEETING_REQUEST' : input.requirementType ? 'BULK_TRADE' : 'CONTACT');

    const subject =
      input.subject ||
      input.requirementType ||
      (type === 'MEETING_REQUEST' ? 'Private In-Person Meeting Request' : 'Atelier Inbound Inquiry');

    let fullMessage = input.message?.trim() || '';
    if (input.quantityOrScope) {
      fullMessage = `[Scope/Volume: ${input.quantityOrScope}]\n\n${fullMessage}`;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        type,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        country: input.country || null,
        subject,
        message: fullMessage,
        preferredDateTime: input.preferredDateTime || null,
        status: 'NEW',
      },
    });

    logger.info(`Inquiry saved in Neon DB: [${inquiry.id}] from ${customerName} (${type})`);

    // Non-blocking real email alert to Sisodiaatelier09@gmail.com
    EmailService.sendInquiryNotification({
      customerName: inquiry.customerName,
      customerEmail: inquiry.customerEmail,
      customerPhone: inquiry.customerPhone,
      country: inquiry.country,
      type: inquiry.type,
      subject: inquiry.subject,
      message: inquiry.message,
      preferredDateTime: inquiry.preferredDateTime,
    }).catch((err) => {
      logger.error('Non-blocking inquiry notification email error:', err);
    });

    return inquiry;
  }

  static async getAllInquiries(limit?: number): Promise<Inquiry[]> {
    const safeLimit = Math.min(Math.max(1, Number(limit || 50)), 100);
    try {
      return await prisma.inquiry.findMany({
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      logger.error('Error fetching inquiries from Neon DB:', err);
      return [];
    }
  }
}
