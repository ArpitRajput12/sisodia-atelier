import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { OwnerController } from '../controllers/owner.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import { authenticate, authenticateCustomer } from '../middlewares/authenticate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { countryGuard } from '../middlewares/countryGuard';

const router = Router();

// ==============================================================================
// 1. CUSTOMER 1-CLICK GOOGLE & EMAIL OTP AUTHENTICATION (STRICT 11-COUNTRY GUARD)
// ==============================================================================

router.post('/google', authRateLimiter, AuthController.googleAuth);
router.post('/otp/send', authRateLimiter, countryGuard, AuthController.sendOtp);
router.post('/otp/verify', authRateLimiter, countryGuard, AuthController.verifyOtp);
router.patch('/profile', AuthController.updateCustomerProfile);

// ==============================================================================
// 1B. PATRON STRICT CART ISOLATION (DATABASE PERSISTENCE)
// ==============================================================================

router.get('/cart', authenticateCustomer, AuthController.getCustomerCart);
router.put('/cart', authenticateCustomer, AuthController.updateCustomerCart);

// ==============================================================================
// 2. SESSION PROFILE & LOGOUT
// ==============================================================================

router.get('/me', AuthController.getMe);
router.post('/logout', AuthController.logout);
router.post('/owner-login', authRateLimiter, OwnerController.login);

// ==============================================================================
// 3. LEGACY ADMIN / STAFF BACKOFFICE AUTHENTICATION
// ==============================================================================

router.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  AuthController.login
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema.partial() }),
  AuthController.refresh
);

router.patch(
  '/me',
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  AuthController.updateMe
);

router.post(
  '/change-password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  AuthController.changePassword
);

export default router;

