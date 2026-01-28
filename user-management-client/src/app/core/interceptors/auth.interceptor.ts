import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenStorageService } from '@core/services/token-storage.service';
import { AuthService } from '@core/services/auth.service';
import { Routes } from '@core/enums/routes.enum';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenStorage.getToken();
  
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
