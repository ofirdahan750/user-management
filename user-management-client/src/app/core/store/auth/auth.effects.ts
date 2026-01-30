import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { EmailHelperService } from '@core/services/email-helper/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { MESSAGES } from '@core/constants/messages.constants';
import { ApiError } from '@core/types/api-error.types';
import { ApiErrorService } from '@core/services/api-error/api-error.service';
import * as AuthActions from './auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private localStorage = inject(LocalStorageService);
  private store = inject(Store);
  private router = inject(Router);
  private toastService = inject(ToastNotificationService);
  private emailHelper = inject(EmailHelperService);
  private apiErrorService = inject(ApiErrorService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials, rememberMe = false }) =>
        this.authService.login(credentials, rememberMe).pipe(
          switchMap((loginResponse) =>
            this.authService.getAccountInfo().pipe(
              map((user) => {
                this.store.dispatch(LoadingActions.hideLoading());
                // Save user to localStorage
                this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
                return AuthActions.loginSuccess({ user });
              }),
              catchError(() => {
                const user = {
                  UID: loginResponse.user.UID,
                  email: loginResponse.user.email,
                  firstName: loginResponse.user.firstName,
                  lastName: loginResponse.user.lastName,
                  phoneNumber: '',
                  isVerified: false,
                  registrationDate: new Date().toISOString(),
                  lastLoginDate: new Date().toISOString()
                };
                this.store.dispatch(LoadingActions.hideLoading());
                // Save user to localStorage
                this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
                return of(AuthActions.loginSuccess({ user }));
              })
            )
          ),
          catchError((error) => {
            this.store.dispatch(LoadingActions.hideLoading());
            const apiError: ApiError | null = this.apiErrorService.isApiError(error.error) ? error.error : null;
            const errorMessage = this.apiErrorService.getErrorMessage(apiError, MESSAGES.LOGIN_ERROR);
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => {
        this.toastService.showSuccess(MESSAGES.LOGIN_SUCCESS);
        const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'];
        const isInternalPath = typeof returnUrl === 'string' && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
        const target = isInternalPath ? returnUrl : Routes.DASHBOARD;
        this.router.navigateByUrl(target);
      })
    ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => {
        this.toastService.showError(error);
      })
    ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ data }) =>
        this.authService.register(data).pipe(
          map((response) => {
            this.store.dispatch(LoadingActions.hideLoading());
            return AuthActions.registerSuccess({ 
              email: data.email,
              verificationToken: response.verificationToken 
            });
          }),
          catchError((error: HttpErrorResponse | Error | unknown) => {
            this.store.dispatch(LoadingActions.hideLoading());
            let errorMessage: string;
            
            if (error instanceof HttpErrorResponse) {
              const apiError: ApiError | null = this.apiErrorService.isApiError(error.error) ? error.error : null;
              // Check if it's a duplicate email error (409)
              if (error.status === 409 || (apiError && apiError.errorMessage?.toLowerCase().includes('already registered'))) {
                errorMessage = MESSAGES.DUPLICATE_EMAIL;
              } else {
                errorMessage = this.apiErrorService.getErrorMessage(apiError, MESSAGES.REGISTRATION_ERROR);
              }
            } else {
              errorMessage = MESSAGES.REGISTRATION_ERROR;
            }
            
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ email, verificationToken }) => {
        // Navigate to verify page with token and email
        this.toastService.showSuccess(MESSAGES.REGISTRATION_SUCCESS);
        if (verificationToken) {
          this.router.navigate([Routes.VERIFY], { 
            queryParams: { token: verificationToken, email } 
          });
        } else {
          this.router.navigate([Routes.VERIFY], { queryParams: { email } });
        }
      })
    ),
    { dispatch: false }
  );

  registerFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      tap(({ error }) => {
        this.toastService.showError(error);
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
        this.localStorage.removeItem(StorageKeys.USER);
        this.localStorage.removeItem(StorageKeys.REMEMBER_ME);
        this.store.dispatch(LoadingActions.hideLoading());
        this.store.dispatch(AuthActions.logoutSuccess());
        this.router.navigate([Routes.LOGIN]);
      })
    ),
    { dispatch: false }
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap(({ data }) =>
        this.authService.updateProfile(data).pipe(
          map((user) => {
            this.store.dispatch(LoadingActions.hideLoading());
            // Save user to localStorage
            this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
            return AuthActions.updateProfileSuccess({ user });
          }),
          catchError((error) => {
            this.store.dispatch(LoadingActions.hideLoading());
            const apiError: ApiError | null = this.apiErrorService.isApiError(error.error) ? error.error : null;
            const errorMessage = this.apiErrorService.getErrorMessage(apiError, MESSAGES.PROFILE_UPDATE_ERROR);
            return of(AuthActions.updateProfileFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  updateProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfileSuccess),
      tap(() => {
        this.toastService.showSuccess(MESSAGES.PROFILE_UPDATE_SUCCESS);
      })
    ),
    { dispatch: false }
  );

  updateProfileFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfileFailure),
      tap(({ error }) => {
        this.toastService.showError(error);
      })
    ),
    { dispatch: false }
  );

  verifyEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyEmail),
      switchMap(({ token, email }) =>
        this.authService.verifyEmail(token, email).pipe(
          map(() => {
            this.store.dispatch(LoadingActions.hideLoading());
            return AuthActions.verifyEmailSuccess();
          }),
          catchError((error) => {
            this.store.dispatch(LoadingActions.hideLoading());
            const apiError: ApiError | null = this.apiErrorService.isApiError(error.error) ? error.error : null;
            const errorMessage = this.apiErrorService.getErrorMessage(apiError, MESSAGES.VERIFICATION_ERROR);
            return of(AuthActions.verifyEmailFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  verifyEmailSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyEmailSuccess),
      tap(() => {
        this.toastService.showSuccess(MESSAGES.VERIFICATION_SUCCESS);
      })
    ),
    { dispatch: false }
  );

  verifyEmailFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyEmailFailure),
      tap(({ error }) => {
        this.toastService.showError(error);
      })
    ),
    { dispatch: false }
  );

  requestPasswordReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.requestPasswordReset),
      switchMap(({ email }) =>
        this.authService.requestPasswordReset(email).pipe(
          map((response) => {
            this.store.dispatch(LoadingActions.hideLoading());
            return AuthActions.requestPasswordResetSuccess({ 
              resetToken: response.resetToken 
            });
          }),
          catchError((error) => {
            this.store.dispatch(LoadingActions.hideLoading());
            const apiError: ApiError | null = this.apiErrorService.isApiError(error.error) ? error.error : null;
            const errorMessage = this.apiErrorService.getErrorMessage(apiError, MESSAGES.ERROR);
            return of(AuthActions.requestPasswordResetFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  requestPasswordResetSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.requestPasswordResetSuccess),
      tap(({ resetToken }) => {
        // Success message is displayed in the component, no need for toast
        // Toast notification removed to avoid duplicate message
      })
    ),
    { dispatch: false }
  );

  requestPasswordResetFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.requestPasswordResetFailure),
      tap(({ error }) => {
        this.toastService.showError(error);
      })
    ),
    { dispatch: false }
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      switchMap(({ token, password }) =>
        this.authService.resetPassword(token, password).pipe(
          map(() => {
            this.store.dispatch(LoadingActions.hideLoading());
            return AuthActions.resetPasswordSuccess();
          }),
          catchError((error) => {
            this.store.dispatch(LoadingActions.hideLoading());
            const apiError: ApiError | null = this.apiErrorService.isApiError(error.error) ? error.error : null;
            const errorMessage = this.apiErrorService.getErrorMessage(apiError, MESSAGES.PASSWORD_RESET_ERROR);
            return of(AuthActions.resetPasswordFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  resetPasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPasswordSuccess),
      tap(() => {
        this.toastService.showSuccess(MESSAGES.PASSWORD_RESET_SUCCESS);
        this.router.navigate([Routes.LOGIN]);
      })
    ),
    { dispatch: false }
  );

  resetPasswordFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPasswordFailure),
      tap(({ error }) => {
        this.toastService.showError(error);
      })
    ),
    { dispatch: false }
  );

  // Initialize auth state from localStorage on app start
  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/effects/init'),
      map(() => {
        const token = this.authService.getToken();
        const userData = this.localStorage.getItem(StorageKeys.USER);
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            return AuthActions.loadUserSuccess({ user });
          } catch {
            return AuthActions.loadUserFailure();
          }
        }
        
        return AuthActions.loadUserFailure();
      })
    )
  );
}
