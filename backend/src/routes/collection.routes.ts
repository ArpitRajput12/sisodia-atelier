import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createCollectionSchema,
  updateCollectionSchema,
} from '../validators/collection.validator';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', CollectionController.getCollections);
router.get('/:slug', CollectionController.getCollectionBySlug);

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ARTISAN_CURATOR),
  validateRequest({ body: createCollectionSchema }),
  CollectionController.createCollection
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ARTISAN_CURATOR),
  validateRequest({ body: updateCollectionSchema }),
  CollectionController.updateCollection
);

export default router;

