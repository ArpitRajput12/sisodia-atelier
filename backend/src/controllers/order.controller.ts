import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';

export class OrderController {
  static async createOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerEmail =
        req.customer?.email ||
        req.body.customerEmail ||
        req.body.guestEmail ||
        req.body.email;

      if (!customerEmail) {
        throw new ApiError(401, 'Please sign in or register to place your order.');
      }

      const customerName =
        req.customer?.name ||
        req.body.customerName ||
        req.body.shippingAddress?.fullName ||
        req.body.fullName ||
        'Valued Patron';

      const order = await OrderService.createOrderFromCart({
        ...req.body,
        customerEmail,
        customerName,
        userId: req.customer?.customerId || req.user?.id,
        guestSessionId: req.guestSessionId,
      });

      // Clear the customer's cartJson in DB upon successful order creation
      if (req.customer?.customerId) {
        await prisma.customer
          .update({
            where: { id: req.customer.customerId },
            data: { cartJson: [] },
          })
          .catch(() => {});
      }

      ApiResponse.created(
        res,
        order,
        `Your order ${order.orderNumber} has been confirmed. White-glove crating preparation commenced.`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated Authenticated Patron Orders Query
   * Strictly scopes orders by customer JWT email
   */
  static async getMyOrders(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const email = req.customer?.email;
      if (!email) {
        throw new ApiError(401, 'Patron authentication required. Please sign in.');
      }

      const orders = await prisma.order.findMany({
        where: {
          customerEmail: { equals: email, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
      });

      ApiResponse.success(
        res,
        orders.map((o) => OrderService.formatOrder(o)),
        'Patron order history & active shipments retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPatronOrders(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return OrderController.getMyOrders(req, res, next);
  }

  /**
   * Patron Order Cancellation (Early stage 1-2 only)
   */
  static async cancelCustomerOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerEmail = req.customer?.email;
      if (!customerEmail) {
        throw new ApiError(401, 'Patron authentication required.');
      }

      const id = String(req.params.id);
      const target = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
        },
      });

      if (!target) {
        throw new ApiError(404, `Consignment "${id}" was not found.`);
      }

      if (target.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
        throw new ApiError(403, 'You are not authorized to cancel this consignment.');
      }

      if (target.isCancelled) {
        throw new ApiError(400, 'This order has already been cancelled.');
      }

      if (target.stage > 2) {
        throw new ApiError(
          400,
          'Orders that have reached Crating, Transit, or Out for Delivery cannot be cancelled online. Please contact concierge.'
        );
      }

      const reason =
        req.body?.reason || req.body?.cancellationReason || 'Customer requested cancellation prior to crating';

      // Atomic cancellation & inventory stock restoration
      const updatedOrder = await OrderService.cancelOrder(target.id, reason);

      // Notify Atelier Principal at Sisodiaatelier09@gmail.com (non-blocking)
      EmailService.sendOrderCancellationAlert({
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        cancelReason: reason,
      }).catch((err) => logger.error('Order cancellation email alert error:', err));

      ApiResponse.success(
        res,
        updatedOrder,
        `Order ${updatedOrder.orderNumber} has been successfully cancelled.`
      );
    } catch (error) {
      next(error);
    }
  }

  static async trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderNumber = String(req.params.orderNumber);
      const tracking = await OrderService.trackOrder(orderNumber);
      ApiResponse.success(res, tracking, 'Live consignment tracking retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderNumberOrId = String(req.params.orderNumberOrId);
      const isAdmin =
        req.user && ['SUPER_ADMIN', 'ADMIN', 'ARTISAN_CURATOR'].includes(req.user.role);

      const order = await OrderService.getOrderDetails(
        orderNumberOrId,
        isAdmin ? undefined : req.user?.id
      );

      ApiResponse.success(res, order, 'Order details & tracking status retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OrderService.getAllOrders(req.query as any);
      ApiResponse.success(
        res,
        result.data,
        'Atelier export & domestic orders retrieved.',
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderTracking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await OrderService.updateOrderTracking(id, req.body);
      ApiResponse.success(res, updated, 'Order live tracking stage and courier updated.');
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return OrderController.updateOrderTracking(req, res, next);
  }

  static async cancelOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id);
      const reason = req.body?.reason ?? req.body?.cancellationReason;
      const cancelled = await OrderService.cancelOrder(id, reason);
      ApiResponse.success(
        res,
        cancelled,
        `Order ${cancelled.orderNumber} has been cancelled prior to Out for Delivery.`
      );
    } catch (error) {
      next(error);
    }
  }

  static async confirmCancellation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id);
      const confirmed = await OrderService.confirmOrderCancellation(id);
      ApiResponse.success(
        res,
        confirmed,
        `Cancellation acknowledged for Order ${confirmed.orderNumber}.`
      );
    } catch (error) {
      next(error);
    }
  }
}
