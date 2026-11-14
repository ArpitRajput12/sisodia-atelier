import { env } from '../config/env';

function formatTimestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, ...meta: unknown[]): void => {
    console.log(`[${formatTimestamp()}] [INFO] [SISODIA ATELIER ✧] ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]): void => {
    console.warn(`[${formatTimestamp()}] [WARN] [SISODIA ATELIER ✧] ${message}`, ...meta);
  },
  error: (message: string, ...meta: unknown[]): void => {
    console.error(`[${formatTimestamp()}] [ERROR] [SISODIA ATELIER ✧] ${message}`, ...meta);
  },
  debug: (message: string, ...meta: unknown[]): void => {
    if (env.NODE_ENV === 'development') {
      console.debug(`[${formatTimestamp()}] [DEBUG] [SISODIA ATELIER ✧] ${message}`, ...meta);
    }
  },
};
