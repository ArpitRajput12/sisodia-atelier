import { InquiryService } from './inquiry.service';
import { prisma } from '../config/prisma';

export class BespokeService {
  private static generateReference(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `SIS-BESPOKE-${year}-${randomHex}`;
  }

  static async submitInquiry(data: any, _userId?: string) {
    const inquiryReference = this.generateReference();
    const message = [
      data.specialNotes || '',
      data.customDimensionsDesc ? `Dimensions: ${data.customDimensionsDesc}` : '',
      data.estimatedBudget ? `Budget: ${data.estimatedBudget}` : '',
      data.woodPreference ? `Wood: ${data.woodPreference}` : '',
    ].filter(Boolean).join('\n');

    const created = await InquiryService.createInquiry({
      customerName: data.patronName,
      customerEmail: data.patronEmail,
      customerPhone: data.patronPhone,
      country: data.patronCountry,
      type: 'CUSTOM_ORDER',
      subject: `[Bespoke ${inquiryReference}] ${data.projectTitle || 'Commission Request'}`,
      message,
    });

    return {
      ...created,
      inquiryReference,
      projectTitle: data.projectTitle,
      status: 'INQUIRY_RECEIVED',
    };
  }

  static async getPatronInquiries(userEmail: string) {
    return prisma.inquiry.findMany({
      where: {
        customerEmail: { equals: userEmail, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAllInquiries(options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inquiry.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getInquiryByReference(referenceOrId: string) {
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        OR: [
          { id: referenceOrId },
          { subject: { contains: referenceOrId, mode: 'insensitive' } },
        ],
      },
    });

    return inquiry;
  }

  static async updateInquiryStatus(id: string, data: any) {
    return prisma.inquiry.update({
      where: { id },
      data: { status: data.status || 'REVIEWED' },
    });
  }
}
