import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserProfile } from '@core/models/user.model';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

/** Returns [user] when authenticated, [] otherwise. Use for streams that should emit only UserProfile. */
export const selectUserProfileList = createSelector(
  selectAuthState,
  (state: AuthState): UserProfile[] => (state.user ? [state.user] : [])
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
