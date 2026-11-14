import { Router } from 'express';
import { ReelController } from '../controllers/reel.controller';
import { authenticateOwner } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { createReelSchema, reelIdParamSchema } from '../validators/reel.validator';

const router = Router();

// Public storefront feed of documentary reels
router.get('/', ReelController.getReels);

// Owner-protected reel publishing & archival deletion
router.post(
  '/',
  authenticateOwner,
  validateRequest({ body: createReelSchema }),
  ReelController.createReel
);

router.delete(
  '/:id',
  authenticateOwner,
  validateRequest({ params: reelIdParamSchema }),
  ReelController.deleteReel
);

export default router;

