import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodError } from 'zod';

/**
 * Validation middleware for request validation using Zod schemas
 */
export function validate(schema: AnyZodObject | ZodEffects<AnyZodObject>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data against schema
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      } else {
        // Pass other errors to error handler
        next(error);
      }
    }
  };
}

/**
 * Validate request body only
 */
export function validateBody(schema: AnyZodObject | ZodEffects<AnyZodObject>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: 'Request body validation failed',
          details: errors,
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query parameters only
 */
export function validateQuery(schema: AnyZodObject | ZodEffects<AnyZodObject>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: 'Query parameter validation failed',
          details: errors,
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request path parameters only
 */
export function validateParams(schema: AnyZodObject | ZodEffects<AnyZodObject>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: 'Path parameter validation failed',
          details: errors,
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate file uploads (simplified - checks for file existence)
 */
export function validateFileUpload(fieldName: string, maxSizeMB: number = 5) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Type-safe file access
      let file: any = req.file;
      
      if (!file && req.files) {
        if (Array.isArray(req.files)) {
          file = req.files[0]; // First file if array
        } else if (typeof req.files === 'object') {
          file = (req.files as any)[fieldName];
          if (Array.isArray(file)) {
            file = file[0]; // Take first file from array
          }
        }
      }
      
      if (!file) {
        return res.status(400).json({
          success: false,
          error: `File upload required for field: ${fieldName}`,
        });
      }

      // Check file size if it's a single file
      if (file && !Array.isArray(file) && file.size) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          return res.status(400).json({
            success: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
          });
        }
      }

      return next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'File validation failed',
      });
    }
  };
}