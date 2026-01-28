import { ActionReducerMap } from '@ngrx/store';
import { loadingReducer, LoadingState } from './loading/loading.reducer';
import { authReducer, AuthState } from './auth/auth.reducer';

export interface AppState {
  loading: LoadingState;
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  loading: loadingReducer,
  auth: authReducer
};
