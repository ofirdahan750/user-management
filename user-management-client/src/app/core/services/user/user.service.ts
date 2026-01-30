import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserProfile } from '@core/models/user.model';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.constants';
import { ERROR_MESSAGES } from '@core/constants/error-messages.constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http: HttpClient = inject(HttpClient);

  getCurrentUser(): Observable<UserProfile> {
    return this.http
      .get<{
        statusCode: number;
        statusMessage?: string;
        data: UserProfile;
      }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USER.PROFILE}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError),
      );
  }

  updateUser(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http
      .put<{
        statusCode: number;
        statusMessage?: string;
        data: UserProfile;
      }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USER.UPDATE_PROFILE}`, profile)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError),
      );
  }

  getUserById(uid: string): Observable<UserProfile> {
    return this.http
      .get<{
        statusCode: number;
        statusMessage?: string;
        data: UserProfile;
      }>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USER.PROFILE}/${uid}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError),
      );
  }

  private handleError = (error: unknown): Observable<never> => {
    if (error instanceof Error) {
      return throwError(() => error);
    }
    return throwError(() => new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
  };
}
