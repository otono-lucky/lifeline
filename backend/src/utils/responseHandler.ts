// utils/responseHandler.ts
// Unified API response format
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationMeta; // optional
  errors?: any;
}

/**
 * Success response
 */
export const successResponse = <T>(
  message: string,
  data: T | null = null,
  pagination?: PaginationMeta
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    pagination
  };
};

/**
 * Error response
 */
export const errorResponse = (
  message: string,
  errors: any = null
): ApiResponse => {
  return {
    success: false,
    message,
    data: null,
    errors,
  };
};