import { Response } from 'express';

export interface MetaPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Request completed successfully',
    statusCode = 200,
    meta?: Record<string, unknown>
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ): Response {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: MetaPagination,
    message = 'Records retrieved successfully'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

