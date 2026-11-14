import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (!global.prismaInstance) {
  global.prismaInstance = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✨ Connected successfully to Neon PostgreSQL database.');
  } catch (error) {
    console.warn('⚠️ Warning: Could not connect to Neon PostgreSQL database on startup.', error);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

