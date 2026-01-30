import { Injectable } from '@angular/core';
import { ApiError } from '@core/types/api-error.types';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  /**
   * Type guard to check if error is ApiError
   */
  isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && ('errorMessage' in error || 'statusMessage' in error || 'message' in error || 'statusCode' in error);
  }

  /**
   * Extract error message from ApiError or return default
   */
  getErrorMessage(apiError: ApiError | null, defaultMessage: string): string {
    if (!apiError) return defaultMessage;
    return apiError.errorMessage ?? apiError.statusMessage ?? apiError.message ?? defaultMessage;
  }

  /**
   * Extract user-friendly message from HTTP error (HttpErrorResponse from subscribe error callback).
   * Priority: error.error.errorMessage → error.error.statusMessage → error.error.message → defaultMessage.
   */
  getMessageFromHttpError(error: unknown, defaultMessage: string): string {
    const body = typeof error === 'object' && error !== null && 'error' in error ? (error as { error: unknown }).error : null;
    const apiError = body && this.isApiError(body) ? body : null;
    return this.getErrorMessage(apiError, defaultMessage);
  }
}
