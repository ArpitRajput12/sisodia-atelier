import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/apiError';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Patron authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Atelier privileges restricted. Requires one of: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
}

