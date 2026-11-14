import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  addToCartSchema,
  updateCartItemSchema,
  setCartCurrencySchema,
} from '../validators/cart.validator';
import { optionalAuthenticate } from '../middlewares/authenticate';

const router = Router();

// Cart is accessible to both guests (via x-guest-session-id header) and authenticated users
router.use(optionalAuthenticate);

router.get('/', CartController.getCart);
router.post('/items', validateRequest({ body: addToCartSchema }), CartController.addItem);
router.patch('/items/:itemId', validateRequest({ body: updateCartItemSchema }), CartController.updateItem);
router.delete('/items/:itemId', CartController.removeItem);
router.post('/currency', validateRequest({ body: setCartCurrencySchema }), CartController.updateCurrency);

export default router;

