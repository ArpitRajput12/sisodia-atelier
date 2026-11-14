import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { Currency } from '@prisma/client';

export class CartController {
  private static getCartContext(req: AuthenticatedRequest) {
    return {
      userId: req.user?.id,
      guestSessionId: req.guestSessionId,
    };
  }

  static async getCart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const context = CartController.getCartContext(req);
      const currency = (req.query.currency as Currency) || Currency.USD;
      const cart = await CartService.getOrCreateCart(context.userId, context.guestSessionId, currency);
      ApiResponse.success(res, cart, 'Patron cart retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async addItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const context = CartController.getCartContext(req);
      const cart = await CartService.addItem(context, req.body);
      ApiResponse.success(res, cart, 'Item added to your heirloom selection.');
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { itemId } = req.params;
      await CartService.updateItem(itemId, req.body);
      const context = CartController.getCartContext(req);
      const cart = await CartService.getOrCreateCart(context.userId, context.guestSessionId);
      ApiResponse.success(res, cart, 'Cart selection updated.');
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { itemId } = req.params;
      await CartService.removeItem(itemId);
      const context = CartController.getCartContext(req);
      const cart = await CartService.getOrCreateCart(context.userId, context.guestSessionId);
      ApiResponse.success(res, cart, 'Item removed from cart.');
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrency(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const context = CartController.getCartContext(req);
      const cart = await CartService.updateCurrency(context, req.body.currency);
      ApiResponse.success(res, cart, `Cart currency updated to ${req.body.currency}.`);
    } catch (error) {
      next(error);
    }
  }
}

