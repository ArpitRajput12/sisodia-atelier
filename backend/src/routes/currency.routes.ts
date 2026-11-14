import { Router } from 'express';
import { CurrencyController } from '../controllers/currency.controller';

const router = Router();

router.get('/', CurrencyController.getSupportedCurrencies);
router.get('/convert', CurrencyController.convert);

export default router;

