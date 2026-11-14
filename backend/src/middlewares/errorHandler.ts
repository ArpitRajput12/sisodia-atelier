import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Guarantee CORS headers are preserved on all error responses
  const origin = req.headers.origin;
  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  // Handle custom ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(422).json({
      success: false,
      message: 'Request validation failed',
      errors: formattedErrors,
    });
    return;
  }

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      res.status(409).json({
        success: false,
        message: `A unique constraint failed for field: ${target.join(', ')}`,
        errors: { code: err.code, meta: err.meta },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'The requested record could not be found in the atelier database.',
        errors: { code: err.code },
      });
      return;
    }

    logger.error('Prisma Known Error:', err.message, err.code);
    res.status(400).json({
      success: false,
      message: 'Database query operation failed',
      errors: { code: err.code },
    });
    return;
  }

  // Unhandled / Unexpected Errors
  logger.error('Unhandled Server Exception:', err);

  res.status(500).json({
    success: false,
    message: 'An internal server error occurred at SISODIA ATELIER ✧',
    errors: env.NODE_ENV === 'development' ? err.message : null,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

