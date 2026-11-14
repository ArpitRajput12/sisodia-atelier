import { Router } from 'express';
import { OwnerController } from '../controllers/owner.controller';
import { requireOwnerAuth } from '../middlewares/authenticate';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Owner Passcode Authentication & Session Verification
router.post('/login', authRateLimiter, OwnerController.login);
router.get('/verify', requireOwnerAuth, OwnerController.verify);

export default router;
