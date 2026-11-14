import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createOrderSchema,
  updateOrderTrackingSchema,
  orderQuerySchema,
} from '../validators/order.validator';
import {
  authenticateCustomer,
  authenticateOwner,
  optionalAuthenticate,
} from '../middlewares/authenticate';

const router = Router();

// Checkout / Create order (Strictly requires authenticated customer)
router.post(
  '/',
  authenticateCustomer,
  validateRequest({ body: createOrderSchema }),
  OrderController.createOrder
);

// Dedicated Patron order history & active tracking (Strictly scoped by customer JWT)
router.get('/my-orders', authenticateCustomer, OrderController.getMyOrders);

// Owner Dashboard: list all orders (strictly protected for Atelier Owner / Admin)
router.get(
  '/',
  authenticateOwner,
  validateRequest({ query: orderQuerySchema as any }),
  OrderController.getAllOrders
);

// Public live tracking lookup by orderNumber or courier trackingNumber (MUST precede /:orderNumberOrId)
router.get('/track/:orderNumber', OrderController.trackOrder);

// Single order lookup by ID or orderNumber
router.get('/:orderNumberOrId', optionalAuthenticate, OrderController.getOrderDetails);

// Customer cancellation endpoint (Early stage 1-2 only, strictly scoped to order patron)
router.patch(
  '/:id/cancel',
  authenticateCustomer,
  OrderController.cancelCustomerOrder
);

router.post(
  '/:id/cancel',
  authenticateCustomer,
  OrderController.cancelCustomerOrder
);

// Owner Live Tracking update (supports both /tracking and legacy /status)
router.patch(
  '/:id/tracking',
  authenticateOwner,
  validateRequest({ body: updateOrderTrackingSchema }),
  OrderController.updateOrderTracking
);

router.patch(
  '/:id/status',
  authenticateOwner,
  validateRequest({ body: updateOrderTrackingSchema }),
  OrderController.updateOrderStatus
);

// Owner cancellation acknowledgement ("Confirm Cancel" button)
router.patch(
  '/:id/confirm-cancel',
  authenticateOwner,
  OrderController.confirmCancellation
);

export default router;
