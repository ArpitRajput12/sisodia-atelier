import 'dotenv/config';
import './config/env';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/prisma';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = createApp();

  // Verify database connection asynchronously without blocking server startup
  connectDatabase().catch((err) => {
    logger.warn('Initial Neon database connection failed. Server is running in resilient mode.', err);
  });

  const server = app.listen(env.PORT, () => {
    logger.info(`SISODIA ATELIER ✧ REST API running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    logger.info(`Health check available at http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down SISODIA ATELIER ✧ server cleanly...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      logger.info('Database connection closed.');
      process.exit(0);
    });

    // Force shutdown if taking longer than 10s
    setTimeout(() => {
      logger.error('Forceful shutdown triggered after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start SISODIA ATELIER ✧ server:', error);
  process.exit(1);
});
