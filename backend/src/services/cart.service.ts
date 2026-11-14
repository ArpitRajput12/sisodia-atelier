import { Currency } from '@prisma/client';
import { CurrencyConverter } from '../utils/currency';

interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    priceUsd: number;
    priceInr: number;
    imageUrl: string;
  };
}

interface InMemCart {
  id: string;
  userId?: string | null;
  guestSessionId?: string | null;
  currency: Currency;
  items: CartItemData[];
}

const memoryCarts = new Map<string, InMemCart>();

export class CartService {
  static async getOrCreateCart(
    userId?: string,
    guestSessionId?: string,
    currency: Currency = Currency.USD
  ) {
    const key = userId || guestSessionId || 'default-guest';
    let cart = memoryCarts.get(key);
    if (!cart) {
      cart = {
        id: `cart-${Date.now()}`,
        userId: userId || null,
        guestSessionId: guestSessionId || null,
        currency,
        items: [],
      };
      memoryCarts.set(key, cart);
    }
    return this.calculateCartSummary(cart);
  }

  private static calculateCartSummary(cart: InMemCart) {
    const currency = cart.currency;
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0);

    return {
      id: cart.id,
      currency: cart.currency,
      items: cart.items,
      subtotalAmount: subtotal,
      formattedSubtotal: CurrencyConverter.format(subtotal, currency),
      cratingFeeAmount: 0,
      formattedCratingFee: CurrencyConverter.format(0, currency),
      freightFeeAmount: 0,
      formattedFreightFee: CurrencyConverter.format(0, currency),
      insuranceFeeAmount: 0,
      formattedInsuranceFee: CurrencyConverter.format(0, currency),
      totalAmount: subtotal,
      formattedTotalAmount: CurrencyConverter.format(subtotal, currency),
      totalWeightKg: 0,
      ddpGuaranteed: true,
    };
  }

  static async addItem(
    contextOrInput: any,
    body?: { productId: string; quantity: number }
  ) {
    const userId = contextOrInput.userId;
    const guestSessionId = contextOrInput.guestSessionId;
    const productId = body?.productId || contextOrInput.productId;
    const quantity = body?.quantity || contextOrInput.quantity || 1;
    const currency = contextOrInput.currency || Currency.USD;

    const key = userId || guestSessionId || 'default-guest';
    let cart = memoryCarts.get(key);
    if (!cart) {
      cart = {
        id: `cart-${Date.now()}`,
        userId: userId || null,
        guestSessionId: guestSessionId || null,
        currency,
        items: [],
      };
      memoryCarts.set(key, cart);
    }

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        id: `ci-${Date.now()}`,
        productId,
        quantity,
        product: {
          id: productId,
          title: 'Sisodia Atelier Solid Heartwood Piece',
          priceUsd: 1200,
          priceInr: 100800,
          imageUrl: '/logo.jpeg',
        },
      });
    }

    return this.calculateCartSummary(cart);
  }

  static async updateItem(itemIdOrInput: any, body?: { quantity: number }) {
    const itemId = typeof itemIdOrInput === 'string' ? itemIdOrInput : itemIdOrInput.itemId;
    const quantity = body?.quantity || itemIdOrInput.quantity || 1;

    for (const cart of memoryCarts.values()) {
      const item = cart.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        return this.calculateCartSummary(cart);
      }
    }
    return this.getOrCreateCart();
  }

  static async removeItem(itemIdOrInput: any) {
    const itemId = typeof itemIdOrInput === 'string' ? itemIdOrInput : itemIdOrInput.itemId;

    for (const cart of memoryCarts.values()) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    }
    return this.getOrCreateCart();
  }

  static async updateCurrency(contextOrInput: any, currencyArg?: Currency) {
    const key = contextOrInput.userId || contextOrInput.guestSessionId || 'default-guest';
    const currency = currencyArg || contextOrInput.currency || Currency.USD;
    let cart = memoryCarts.get(key);
    if (cart) {
      cart.currency = currency;
      return this.calculateCartSummary(cart);
    }
    return this.getOrCreateCart(contextOrInput.userId, contextOrInput.guestSessionId, currency);
  }

  static async clearCart(userId?: string, guestSessionId?: string) {
    const key = userId || guestSessionId || 'default-guest';
    memoryCarts.delete(key);
  }
}
