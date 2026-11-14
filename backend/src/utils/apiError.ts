export class ApiError extends Error {
  public statusCode: number;
  public errors?: unknown;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: unknown, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors?: unknown) {
    super(400, message, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required to access this atelier resource', errors?: unknown) {
    super(401, message, errors);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden: Insufficient permissions for this heirloom resource', errors?: unknown) {
    super(403, message, errors);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Requested resource not found in the Sisodia Atelier catalog', errors?: unknown) {
    super(404, message, errors);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict detected', errors?: unknown) {
    super(409, message, errors);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed for request parameters', errors?: unknown) {
    super(422, message, errors);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'An unexpected error occurred in the Sisodia Atelier server', errors?: unknown) {
    super(500, message, errors, false);
  }
}

