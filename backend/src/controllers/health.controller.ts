import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

export class HealthController {
  static async check(_req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unreachable';
    }

    const responsePayload = {
      status: dbStatus === 'healthy' ? 'operational' : 'degraded',
      atelier: 'SISODIA ATELIER ✧ API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startTime,
      database: {
        provider: 'Neon Serverless PostgreSQL',
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      exportCurrencies: ['USD', 'GBP', 'EUR', 'AED', 'INR'],
    };

    res.status(dbStatus === 'healthy' ? 200 : 503).json(responsePayload);
  }
}

