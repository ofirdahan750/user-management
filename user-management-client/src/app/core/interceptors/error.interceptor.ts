import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MESSAGES } from '@core/constants/messages.constants';
import { ERROR_MESSAGES } from '@core/constants/error-messages.constants';
import { ApiError, isApiError, getErrorMessage } from '@core/types/api-error.types';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastNotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip toast for auth endpoints (handled by effects) and change-password (handled by component)
      const url = req.url.toLowerCase();
      const skipToast = url.includes('/auth/login') || 
                        url.includes('/auth/register') ||
                        url.includes('/auth/verify') ||
                        url.includes('/auth/reset-password') ||
                        url.includes('/auth/forgot-password') ||
                        url.includes('/user/change-password');
      
      if (!skipToast || error.error instanceof ErrorEvent) {
        let errorMessage: string = MESSAGES.ERROR;

        if (error.error instanceof ErrorEvent) {
          errorMessage = MESSAGES.NETWORK_ERROR;
        } else {
          // Handle backend API error format
          const apiError: ApiError | null = isApiError(error.error) ? error.error : null;
          
          switch (error.status) {
            case 400:
              errorMessage = getErrorMessage(apiError, ERROR_MESSAGES.BAD_REQUEST);
              break;
            case 401:
              // Check if it's an account locked scenario
              const errorMsg = apiError ? (getErrorMessage(apiError, '')).toLowerCase() : '';
              if (errorMsg.includes('locked') || errorMsg.includes('lockout')) {
                errorMessage = MESSAGES.ACCOUNT_LOCKED;
              } else {
                errorMessage = getErrorMessage(apiError, MESSAGES.UNAUTHORIZED);
              }
              break;
            case 403:
              errorMessage = getErrorMessage(apiError, MESSAGES.UNAUTHORIZED);
              break;
            case 404:
              errorMessage = getErrorMessage(apiError, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
              break;
            case 409:
              errorMessage = getErrorMessage(apiError, MESSAGES.DUPLICATE_EMAIL);
              break;
            case 423: // Account Locked status code
              errorMessage = MESSAGES.ACCOUNT_LOCKED;
              break;
            case 429:
              errorMessage = getErrorMessage(apiError, ERROR_MESSAGES.TOO_MANY_REQUESTS);
              break;
            case 500:
              errorMessage = getErrorMessage(apiError, ERROR_MESSAGES.SERVER_ERROR);
              break;
            default:
              // Check for account locked in error message
              const defaultErrorMsg = apiError ? getErrorMessage(apiError, '').toLowerCase() : '';
              if (defaultErrorMsg.includes('locked') || defaultErrorMsg.includes('lockout')) {
                errorMessage = MESSAGES.ACCOUNT_LOCKED;
              } else {
                errorMessage = getErrorMessage(apiError, MESSAGES.ERROR);
              }
          }
        }

        toastService.showError(errorMessage);
      }
      
      return throwError(() => error);
    })
  );
};
