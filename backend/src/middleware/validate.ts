// src/middleware/validate.ts
// Reusable Zod Request Validation Middleware

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "../utils/responseHandler";

/**
 * Formats a ZodError into a clean key-value map of field errors
 */
const formatZodErrors = (error: ZodError): Record<string, string> => {
  const issues = error.issues || [];
  return issues.reduce((acc, err) => {
    const field = err.path.join(".") || "error";
    acc[field] = err.message;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Validates request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return res.status(400).json(errorResponse("Validation failed", errors));
    }
    req.body = result.data;
    next();
  };
};

/**
 * Validates request query parameters against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return res.status(400).json(errorResponse("Invalid query parameters", errors));
    }
    req.query = result.data as any;
    next();
  };
};

/**
 * Validates request path parameters against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return res.status(400).json(errorResponse("Invalid URL parameters", errors));
    }
    req.params = result.data as any;
    next();
  };
};

/**
 * Validates body, query, and/or params simultaneously
 */
export const validateRequest = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json(errorResponse("Invalid URL parameters", formatZodErrors(result.error)));
      }
      req.params = result.data as any;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json(errorResponse("Invalid query parameters", formatZodErrors(result.error)));
      }
      req.query = result.data as any;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json(errorResponse("Validation failed", formatZodErrors(result.error)));
      }
      req.body = result.data;
    }

    next();
  };
};

export default validateBody;
