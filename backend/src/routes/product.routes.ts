import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
  toggleStarSchema,
} from '../validators/product.validator';
import { authenticateOwner } from '../middlewares/authenticate';

const router = Router();

// Public catalog routes
router.get(
  '/',
  validateRequest({ query: productQuerySchema as any }),
  ProductController.getProducts
);

router.get('/categories', ProductController.getCategories);
router.get('/wood-species', ProductController.getWoodSpeciesCatalog);
router.get('/:slug', ProductController.getProductBySlug);

// Atelier Owner (Yash Sisodia) & Admin CRUD + Star toggle routes
router.post(
  '/',
  authenticateOwner,
  validateRequest({ body: createProductSchema as any }),
  ProductController.createProduct
);

router.patch(
  '/:id/star',
  authenticateOwner,
  validateRequest({ body: toggleStarSchema }),
  ProductController.toggleStar
);

router.patch(
  '/:id',
  authenticateOwner,
  validateRequest({ body: updateProductSchema as any }),
  ProductController.updateProduct
);

router.delete('/:id', authenticateOwner, ProductController.deleteProduct);

export default router;
