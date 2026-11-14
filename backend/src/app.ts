import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { standardRateLimiter } from './middlewares/rateLimiter';
import apiRouter from './routes';
import { NotFoundError } from './utils/apiError';

export function createApp(): Application {
  const app = express();

  // 1. CORS Configuration mounted as the VERY FIRST middleware
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-owner-token',
      'x-owner-passcode',
      'x-founder-passcode',
      'x-admin-key',
      'X-Guest-Session-Id',
      'Accept',
      'x-test-country',
      'x-country-code',
      'x-vercel-ip-country',
      'cf-ipcountry',
    ],
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // 2. Security headers (with cross-origin resource sharing policy friendly defaults)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Response compression
  app.use(compression());

  // Body and cookie parsing (with rawBody capture for webhook signature verification)
  app.use(
    express.json({
      limit: '2mb',
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Request logging
  app.use(requestLogger);

  // Standard rate limiter for all endpoints
  app.use(standardRateLimiter);

  // Welcome atelier route
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      brand: 'SISODIA ATELIER ✧',
      tagline: 'Ultra-Luxury Heirloom Solid Wood & Wooden Tiles Atelier',
      documentation: '/api/v1/health',
      status: 'active',
    });
  });

  // Mount API V1 routes
  app.use(env.API_PREFIX, apiRouter);

  // Handle 404 for undefined routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`The requested atelier endpoint [${req.method}] ${req.originalUrl} does not exist.`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

