/**
 * API Error response structure
 */
export interface ApiError {
  statusCode?: number;
  errorMessage?: string;
  message?: string;
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && ('errorMessage' in error || 'message' in error || 'statusCode' in error);
}

/**
 * Extract error message from ApiError or return default
 */
export function getErrorMessage(apiError: ApiError | null, defaultMessage: string): string {
  if (!apiError) {
    return defaultMessage;
  }
  
  if (apiError.errorMessage) {
    return apiError.errorMessage;
  }
  
  if (apiError.message) {
    return apiError.message;
  }
  
  return defaultMessage;
}
