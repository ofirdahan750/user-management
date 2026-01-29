import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenStorageService } from '@core/services/token-storage.service';
import { AuthService } from '@core/services/auth.service';
import { Routes } from '@core/enums/routes.enum';

// create the auth interceptor - intercept the request and add the token to the request headers
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);// token storage service
  const authService = inject(AuthService);// auth service
  const router = inject(Router);// router service

  const token = tokenStorage.getToken();// get the token from the token storage
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = tokenStorage.getRefreshToken();
        
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = tokenStorage.getToken();
              if (newToken) {
                req = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(req);
              }
              return throwError(() => error);
            }),
            catchError(() => {
              authService.logout();
              router.navigate([Routes.LOGIN]);
              return throwError(() => error);
            })
          );
        } else {
          authService.logout();
          router.navigate([Routes.LOGIN]);
        }
      }
      
      return throwError(() => error);
    })
  );
};
