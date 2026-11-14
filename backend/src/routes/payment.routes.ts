import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createStripeIntentSchema,
  createPayPalOrderSchema,
  capturePayPalOrderSchema,
  createRazorpayOrderSchema,
  verifyRazorpaySchema,
} from '../validators/payment.validator';

const router = Router();

// Stripe Endpoints
router.post(
  '/stripe/create-intent',
  validateRequest({ body: createStripeIntentSchema }),
  PaymentController.createStripeIntent
);

router.post('/stripe/webhook', PaymentController.handleStripeWebhook);

// PayPal Endpoints
router.post(
  '/paypal/create-order',
  validateRequest({ body: createPayPalOrderSchema }),
  PaymentController.createPayPalOrder
);

router.post(
  '/paypal/capture-order',
  validateRequest({ body: capturePayPalOrderSchema }),
  PaymentController.capturePayPalOrder
);

// Razorpay Endpoints
router.post(
  '/razorpay/create-order',
  validateRequest({ body: createRazorpayOrderSchema }),
  PaymentController.createRazorpayOrder
);

router.post(
  '/razorpay/verify',
  validateRequest({ body: verifyRazorpaySchema }),
  PaymentController.verifyRazorpayPayment
);

export default router;

