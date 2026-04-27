import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log full error details server-side (always)
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errorCode = error.code || 'INTERNAL_ERROR';
  let details = error.details;

  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
    details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
    errorCode = 'DATABASE_ERROR';
    
    // Handle specific Prisma error codes
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      message = 'Duplicate entry found';
      details = { fields: prismaError.meta?.target };
    } else if (prismaError.code === 'P2025') {
      message = 'Record not found';
    }

    // In production, don't expose Prisma error details
    if (isProduction) {
      details = undefined;
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Handle rate limiting errors
  if (error.message.includes('Too many requests')) {
    statusCode = 429;
    message = error.message;
    errorCode = 'RATE_LIMIT_EXCEEDED';
  }

  // Ensure status code is within valid range
  if (statusCode < 400 || statusCode >= 600) {
    statusCode = 500;
  }

  // In production, sanitize 500 errors — don't leak internal details
  if (isProduction && statusCode === 500) {
    message = 'Internal server error';
    errorCode = 'INTERNAL_ERROR';
    details = undefined;
  }

  // Construct error response
  const errorResponse: any = {
    success: false,
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Include details if available
  if (details) {
    errorResponse.details = details;
  }

  // Include stack trace only in development
  if (!isProduction) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Async error handler wrapper for Express routes
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create custom application error
 */
export function createAppError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  if (code !== undefined) {
    error.code = code;
  }
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

// Common error types
export const Errors = {
  // Authentication errors
  UNAUTHORIZED: createAppError('Unauthorized access', 401, 'UNAUTHORIZED'),
  FORBIDDEN: createAppError('Forbidden access', 403, 'FORBIDDEN'),
  INVALID_CREDENTIALS: createAppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'),
  
  // Resource errors
  NOT_FOUND: createAppError('Resource not found', 404, 'NOT_FOUND'),
  CONFLICT: createAppError('Resource conflict', 409, 'CONFLICT'),
  
  // Validation errors
  VALIDATION_ERROR: createAppError('Validation failed', 400, 'VALIDATION_ERROR'),
  
  // Server errors
  INTERNAL_ERROR: createAppError('Internal server error', 500, 'INTERNAL_ERROR'),
  SERVICE_UNAVAILABLE: createAppError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE'),
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: createAppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS'),
  INVALID_OPERATION: createAppError('Invalid operation', 400, 'INVALID_OPERATION'),
};
