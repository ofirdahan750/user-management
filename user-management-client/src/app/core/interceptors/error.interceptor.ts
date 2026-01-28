import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MESSAGES } from '@core/constants/messages.constants';
import { ERROR_MESSAGES } from '@core/constants/error-messages.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastNotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip toast notification for auth endpoints - they are handled by effects
      const url = req.url.toLowerCase();
      const isAuthEndpoint = url.includes('/auth/login') || 
                             url.includes('/auth/register') ||
                             url.includes('/auth/verify') ||
                             url.includes('/auth/reset-password') ||
                             url.includes('/auth/forgot-password');
      
      // Only show toast for non-auth errors or network errors
      if (!isAuthEndpoint || error.error instanceof ErrorEvent) {
        let errorMessage: string = MESSAGES.ERROR;

        if (error.error instanceof ErrorEvent) {
          errorMessage = MESSAGES.NETWORK_ERROR;
        } else {
          // Handle backend API error format
          const apiError = error.error as { statusCode?: number; errorMessage?: string; message?: string };
          
          switch (error.status) {
            case 400:
              errorMessage = apiError?.errorMessage || apiError?.message || ERROR_MESSAGES.BAD_REQUEST;
              break;
            case 401:
              errorMessage = apiError?.errorMessage || MESSAGES.UNAUTHORIZED;
              break;
            case 403:
              errorMessage = apiError?.errorMessage || MESSAGES.UNAUTHORIZED;
              break;
            case 404:
              errorMessage = apiError?.errorMessage || ERROR_MESSAGES.RESOURCE_NOT_FOUND;
              break;
            case 409:
              errorMessage = apiError?.errorMessage || MESSAGES.DUPLICATE_EMAIL;
              break;
            case 429:
              errorMessage = apiError?.errorMessage || ERROR_MESSAGES.TOO_MANY_REQUESTS;
              break;
            case 500:
              errorMessage = apiError?.errorMessage || ERROR_MESSAGES.SERVER_ERROR;
              break;
            default:
              errorMessage = apiError?.errorMessage || apiError?.message || MESSAGES.ERROR;
          }
        }

        toastService.showError(errorMessage);
      }
      
      return throwError(() => error);
    })
  );
};
