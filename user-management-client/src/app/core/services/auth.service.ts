import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { RegisterRequest, RegisterResponse } from '@core/models/auth.model';
import { LoginRequest, LoginResponse } from '@core/models/auth.model';
import { VerificationResponse, TokenResponse } from '@core/models/auth.model';
import { PasswordResetRequest, PasswordResetResponse } from '@core/models/auth.model';
import { UserProfile } from '@core/models/user.model';
import { TokenStorageService } from '@core/services/token-storage.service';
import { LocalStorageService } from '@core/services/local-storage.service';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.constants';
import { ERROR_MESSAGES } from '@core/constants/error-messages.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  public currentUser = signal<UserProfile | null>(null);
  public isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private localStorage: LocalStorageService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.tokenStorage.getToken();
    const userData = this.localStorage.getItem(StorageKeys.USER);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as UserProfile;
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<{ statusCode: number; statusMessage?: string; data: RegisterResponse }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, userData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  login(credentials: LoginRequest, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<{ statusCode: number; statusMessage?: string; data: LoginResponse }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, credentials)
      .pipe(
        map(response => response.data),
        switchMap(response => {
          this.tokenStorage.saveToken(response.token, rememberMe);
          this.tokenStorage.saveRefreshToken(response.refreshToken, rememberMe);
          
          // Get full user profile after login
          return this.getAccountInfo().pipe(
            map(user => {
              this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
              this.currentUser.set(user);
              this.currentUserSubject.next(user);
              this.isAuthenticatedSubject.next(true);
              return response;
            }),
            catchError(() => {
              // Fallback if getAccountInfo fails
              const user: UserProfile = {
                UID: response.user.UID,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                isVerified: false,
                registrationDate: new Date().toISOString(),
                lastLoginDate: new Date().toISOString()
              };
              
              this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
              this.currentUser.set(user);
              this.currentUserSubject.next(user);
              this.isAuthenticatedSubject.next(true);
              return of(response);
            })
          );
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.localStorage.removeItem(StorageKeys.USER);
    this.localStorage.removeItem(StorageKeys.REMEMBER_ME);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  verifyEmail(token: string, email: string): Observable<VerificationResponse> {
    return this.http.post<{ statusCode: number; statusMessage?: string; data: VerificationResponse }>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`,
      { token, email }
    ).pipe(
      map(response => response.data || { success: true, message: response.statusMessage || ERROR_MESSAGES.EMAIL_VERIFIED_SUCCESS }),
      catchError(this.handleError)
    );
  }

  resendVerificationEmail(email: string): Observable<{ verificationToken: string }> {
    return this.http.post<{ statusCode: number; statusMessage?: string; data?: { verificationToken: string } }>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.RESEND_VERIFICATION}`,
      { email }
    ).pipe(
      map(response => response.data || { verificationToken: '' }),
      catchError(this.handleError)
    );
  }

  getAccountInfo(): Observable<UserProfile> {
    return this.http.get<{ statusCode: number; statusMessage?: string; data: UserProfile }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USER.ACCOUNT_INFO}`)
      .pipe(
        map(response => response.data),
        tap(user => {
          this.currentUser.set(user);
          this.currentUserSubject.next(user);
          this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<{ statusCode: number; statusMessage?: string; data: UserProfile }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USER.UPDATE_PROFILE}`, profile)
      .pipe(
        map(response => response.data),
        tap(user => {
          this.currentUser.set(user);
          this.currentUserSubject.next(user);
          this.localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
        }),
        catchError(this.handleError)
      );
  }

  requestPasswordReset(email: string): Observable<PasswordResetResponse> {
    const request: PasswordResetRequest = { email };
    return this.http.post<{ statusCode: number; statusMessage?: string; data?: PasswordResetResponse }>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET}`,
      request
    ).pipe(
      map(response => response.data || { success: true, message: response.statusMessage || ERROR_MESSAGES.PASSWORD_RESET_EMAIL_SENT }),
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`,
      { token, newPassword }
    ).pipe(
      catchError(this.handleError)
    );
  }

  isAuthenticatedCheck(): boolean {
    return this.isAuthenticated();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error(ERROR_MESSAGES.NO_REFRESH_TOKEN));
    }

    return this.http.post<{ statusCode: number; statusMessage?: string; data: TokenResponse }>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refreshToken }
    ).pipe(
      map(response => response.data),
      tap(response => {
        this.tokenStorage.saveToken(response.token);
        this.tokenStorage.saveRefreshToken(response.refreshToken);
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: unknown): Observable<never> => {
    if (error instanceof Error) {
      return throwError(() => error);
    }
    return throwError(() => new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
  };
}
