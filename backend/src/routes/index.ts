import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import collectionRoutes from './collection.routes';
import bespokeRoutes from './bespoke.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import currencyRoutes from './currency.routes';
import healthRoutes from './health.routes';
import paymentRoutes from './payment.routes';
import chatRoutes from './chat.routes';
import reviewRoutes from './review.routes';
import consultationRoutes from './consultation.routes';
import uploadRoutes from './upload.routes';
import reelRoutes from './reel.routes';
import inquiryRoutes from './inquiry.routes';
import siteAssetRoutes from './siteAsset.routes';
import ownerRoutes from './owner.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/owner', ownerRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/collections', collectionRoutes);
apiRouter.use('/bespoke', bespokeRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/currencies', currencyRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/consultations', consultationRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/reels', reelRoutes);
apiRouter.use('/inquiries', inquiryRoutes);
apiRouter.use('/site-assets', siteAssetRoutes);

export default apiRouter;

