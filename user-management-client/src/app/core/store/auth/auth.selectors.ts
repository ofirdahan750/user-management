import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// select the auth state
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// select the user state
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

// select the isAuthenticated state
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

// select the isLoading state
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState): boolean => state.isLoading
);

// select the error state
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState): string | null => state.error
);
