import { ActionReducerMap } from '@ngrx/store';
import { loadingReducer, LoadingState } from './loading/loading.reducer';
import { authReducer, AuthState } from './auth/auth.reducer';

export interface AppState {
  loading: LoadingState; // loading state
  auth: AuthState; // auth state
}

export const reducers: ActionReducerMap<AppState> = {
  loading: loadingReducer, // loading reducer
  auth: authReducer // auth reducer
};
