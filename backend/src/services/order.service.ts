import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/apiError';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export class OrderService {
  /**
   * Helper to format an Order row into the standard API order format
   */
  public static formatOrder(order: any) {
    let lineItems: any[] = [];
    try {
      lineItems =
        typeof order.itemsJson === 'string'
          ? JSON.parse(order.itemsJson)
          : Array.isArray(order.itemsJson)
          ? order.itemsJson
          : [];
    } catch {
      lineItems = [];
    }

    const itemsSummary =
      lineItems.length > 0
        ? lineItems.map((i: any) => `${i.quantity || 1}x ${i.title || i.name}`).join(', ')
        : 'SISODIA ATELIER ✧ Solid Heartwood Consignment';

    const stage = order.stage ?? 1;
    let status = 'ORDER_CONFIRMED';
    if (order.isCancelled) {
      status = 'CANCELLED';
    } else if (stage === 6) {
      status = 'DELIVERED';
    } else if (stage === 5) {
      status = 'OUT_FOR_DELIVERY';
    } else if (stage === 4) {
      status = 'IN_TRANSIT';
    } else if (stage >= 2) {
      status = 'IN_CRAFTING';
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      firmName: order.firmName || undefined,
      gstNumber: order.gstOrTaxId || undefined,
      paymentGateway: order.paymentGateway,
      destination: `${order.city}, ${order.countryName || order.countryCode}`,
      shippingAddress: {
        line1: order.shippingAddress,
        city: order.city,
        postalCode: order.postalCode,
        countryCode: order.countryCode,
        phoneNumber: order.customerPhone || '',
      },
      lineItems,
      itemsSummary,
      totalAmountUsd: Number(order.totalForeign),
      totalAmountInr: Number(order.totalINR),
      currency: order.currencyCode,
      status,
      trackingStage: stage,
      courierPartner: order.courierPartner || 'DHL Express Priority Air Cargo',
      trackingNumber:
        order.trackingNumber ||
        `DHL-EXP-${String(order.orderNumber || '').replace(/[^0-9]/g, '').slice(-6)}`,
      currentCheckpoint:
        order.liveCheckpoint ||
        'Nagina Woodcraft Atelier — ISPM-15 Cedar Vault Sealed with 3-Axis Tilt Sensors',
      ownerCancelConfirmed: Boolean(order.isCancelled),
      isCancelled: Boolean(order.isCancelled),
      cancelReason: order.cancelReason,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
    };
  }

  /**
   * Create an order and dispatch real email notifications
   */
  static async createOrderFromCart(input: any) {
    const orderNumber =
      input.orderNumber ||
      `SIS-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const shipping = input.shippingAddress || {};
    const customerName =
      input.customerName ||
      shipping.fullName ||
      input.fullName ||
      'Valued Sisodia Patron';
    const customerEmail =
      input.customerEmail ||
      input.guestEmail ||
      input.email ||
      'patron@sisodiaatelier.com';
    const customerPhone =
      input.customerPhone ||
      input.guestPhone ||
      shipping.phoneNumber ||
      input.phone ||
      null;

    const shippingAddress =
      shipping.addressLine1 || shipping.line1 || input.address || 'Patron Residence';
    const city = shipping.city || input.city || 'Global Destination';
    const postalCode = shipping.postalCode || input.postalCode || '000000';
    const countryCode = shipping.countryCode || input.countryCode || 'US';
    const countryName = shipping.countryName || input.countryName || countryCode;

    const currencyCode = input.currency || input.currencyCode || 'USD';
    const currencySymbol = input.currencySymbol || '$';

    const totalINR = input.totalINR || input.totalAmountInr || 0;
    const totalForeign =
      input.totalForeign ||
      input.totalAmountUsd ||
      Math.round((totalINR > 0 ? totalINR : 84000) / 84);

    const items = input.items || input.lineItems || [];

    // Atomic transaction: Check inventory stock, decrement atomically, create order, and update customer profile
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify inventory stock and decrement atomically
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const prodId = item.id || item.productId;
          const qty = Math.max(1, Number(item.quantity) || 1);
          if (prodId && typeof prodId === 'string') {
            const prod = await tx.product.findUnique({ where: { id: prodId } });
            if (prod) {
              if (prod.stock < qty) {
                throw new BadRequestError(
                  `Insufficient inventory for "${prod.name}". Available stock: ${prod.stock}, requested: ${qty}.`
                );
              }
              await tx.product.update({
                where: { id: prodId },
                data: { stock: { decrement: qty } },
              });
            }
          }
        }
      }

      // 2. Persist the Order in database
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          firmName: input.firmName || null,
          gstOrTaxId: input.gstOrTaxId || input.gstNumber || null,
          shippingAddress,
          city,
          postalCode,
          countryCode,
          countryName,
          currencyCode,
          currencySymbol,
          totalForeign: new Prisma.Decimal(totalForeign),
          totalINR: new Prisma.Decimal(totalINR > 0 ? totalINR : Math.round(totalForeign * 84)),
          paymentGateway: input.paymentGateway || input.paymentProvider || 'STRIPE',
          paymentStatus: 'PAID',
          stage: 1,
          courierPartner:
            countryCode === 'IN'
              ? 'BlueDart Apex Priority (DDP Doorstep Handover)'
              : 'DHL Express Transatlantic Air Cargo',
          trackingNumber:
            countryCode === 'IN'
              ? `SA-NAGINA-LATHE-${Math.floor(1000 + Math.random() * 9000)}`
              : `DHL-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
          liveCheckpoint: 'Nagina Atelier Dispatch Enclave — ISPM-15 Cedar Crate Assigned',
          itemsJson: items,
        },
      });

      // 3. Auto-link/update Customer record in database
      try {
        const existingCustomer = await tx.customer.findUnique({
          where: { email: customerEmail.toLowerCase().trim() },
        });
        if (existingCustomer) {
          await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: customerName || existingCustomer.name,
              phone: customerPhone || existingCustomer.phone,
              savedAddress: shippingAddress || existingCustomer.savedAddress,
              savedCity: city || existingCustomer.savedCity,
              savedPostalCode: postalCode || existingCustomer.savedPostalCode,
              firmName: input.firmName || existingCustomer.firmName,
              gstOrTaxId: (input.gstOrTaxId || input.gstNumber) || existingCustomer.gstOrTaxId,
              ...(countryCode ? { countryCode, countryName } : {}),
            },
          });
        } else {
          await tx.customer.create({
            data: {
              email: customerEmail.toLowerCase().trim(),
              name: customerName || 'Valued Patron',
              phone: customerPhone || null,
              countryCode: countryCode || 'US',
              countryName: countryName || 'USA',
              savedAddress: shippingAddress || null,
              savedCity: city || null,
              savedPostalCode: postalCode || null,
              firmName: input.firmName || null,
              gstOrTaxId: (input.gstOrTaxId || input.gstNumber) || null,
              authProvider: 'EMAIL_OTP',
            },
          });
        }
      } catch (custErr) {
        logger.warn('Non-blocking customer auto-link error on checkout:', custErr);
      }

      return createdOrder;
    });

    logger.info(`New Order committed atomically in Neon DB: ${order.orderNumber} for ${customerEmail}`);

    // Non-blocking transactional email notification after DB commit (allows response in < 300ms)
    EmailService.sendOrderNotifications({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      firmName: order.firmName,
      gstOrTaxId: order.gstOrTaxId,
      shippingAddress: order.shippingAddress,
      city: order.city,
      postalCode: order.postalCode,
      countryName: order.countryName,
      currencyCode: order.currencyCode,
      currencySymbol: order.currencySymbol,
      totalForeign: Number(order.totalForeign),
      totalINR: Number(order.totalINR),
      paymentGateway: order.paymentGateway,
      trackingNumber: order.trackingNumber,
      items: items.map((i: any) => ({
        title: i.title || i.name || 'Solid Wood Masterwork',
        quantity: i.quantity || 1,
        unitPrice: i.priceUsd || i.priceInr || totalForeign,
      })),
    }).catch((emailErr) => {
      logger.error('Non-blocking order notification email error:', emailErr);
    });

    return this.formatOrder(order);
  }

  /**
   * Track order by order number or ID
   */
  static async trackOrder(orderNumberOrId: string) {
    const q = orderNumberOrId.trim();
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: q, mode: 'insensitive' } },
          { id: { equals: q } },
          { trackingNumber: { equals: q, mode: 'insensitive' } },
        ],
      },
    });

    if (!order) {
      throw new NotFoundError(`Consignment "${q}" was not found.`);
    }

    return this.formatOrder(order);
  }

  /**
   * Get order details
   */
  static async getOrderDetails(orderNumberOrId: string, _userId?: string) {
    return this.trackOrder(orderNumberOrId);
  }

  /**
   * Get orders for a specific patron email
   */
  static async getPatronOrders(userEmail: string) {
    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: userEmail, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.formatOrder(o));
  }

  /**
   * Retrieve all orders for backoffice (with pagination)
   */
  static async getAllOrders(query: { page?: number; limit?: number; search?: string } = {}) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(Math.max(1, Number(query.limit || 50)), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { customerName: { contains: s, mode: 'insensitive' } },
        { customerEmail: { contains: s, mode: 'insensitive' } },
        { trackingNumber: { contains: s, mode: 'insensitive' } },
      ];
    }

    try {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      return {
        data: orders.map((o) => this.formatOrder(o)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (err: any) {
      logger.error('Error fetching all orders from Neon DB:', err);
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 1 },
      };
    }
  }

  /**
   * Update order tracking stage, courier, and live checkpoint
   */
  static async updateOrderTracking(
    idOrNumber: string,
    data: {
      stage?: number;
      trackingStage?: number;
      courierPartner?: string;
      trackingNumber?: string;
      liveCheckpoint?: string;
      currentCheckpoint?: string;
    }
  ) {
    const target = await prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
    });

    if (!target) {
      throw new NotFoundError(`Order "${idOrNumber}" not found.`);
    }

    const stage = data.stage ?? data.trackingStage ?? target.stage;
    const courierPartner = data.courierPartner || target.courierPartner;
    const trackingNumber = data.trackingNumber || target.trackingNumber;
    const liveCheckpoint = data.liveCheckpoint || data.currentCheckpoint || target.liveCheckpoint;

    const updated = await prisma.order.update({
      where: { id: target.id },
      data: {
        stage,
        courierPartner,
        trackingNumber,
        liveCheckpoint,
      },
    });

    return this.formatOrder(updated);
  }

  /**
   * Cancel an order & restore inventory stock atomically inside a transaction
   */
  static async cancelOrder(idOrNumber: string, reason?: string) {
    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.order.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
        },
      });

      if (!target) {
        throw new NotFoundError(`Order "${idOrNumber}" not found.`);
      }

      if (target.isCancelled) {
        throw new BadRequestError('This order has already been cancelled.');
      }

      if (target.stage >= 5) {
        throw new BadRequestError('Orders that are out for delivery cannot be cancelled online.');
      }

      // Restore inventory stock atomically for all ordered pieces
      let lineItems: any[] = [];
      try {
        lineItems =
          typeof target.itemsJson === 'string'
            ? JSON.parse(target.itemsJson)
            : Array.isArray(target.itemsJson)
            ? target.itemsJson
            : [];
      } catch {
        lineItems = [];
      }

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        for (const item of lineItems) {
          const prodId = item.id || item.productId;
          const qty = Math.max(1, Number(item.quantity) || 1);
          if (prodId && typeof prodId === 'string') {
            const prod = await tx.product.findUnique({ where: { id: prodId } });
            if (prod) {
              await tx.product.update({
                where: { id: prodId },
                data: { stock: { increment: qty } },
              });
            }
          }
        }
      }

      return await tx.order.update({
        where: { id: target.id },
        data: {
          isCancelled: true,
          cancelReason: reason || 'Customer requested cancellation before dispatch',
        },
      });
    });

    return this.formatOrder(updated);
  }

  /**
   * Acknowledge cancellation
   */
  static async confirmOrderCancellation(idOrNumber: string) {
    return this.cancelOrder(idOrNumber, 'Confirmed by Atelier Principal');
  }
}
