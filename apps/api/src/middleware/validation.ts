import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import type { ApiResponse } from '@jadapi/types';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: error.errors,
        };
        return res.status(400).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request data',
      };
      res.status(400).json(response);
    }
  };
};