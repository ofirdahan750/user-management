import { AuthState } from '@core/store/auth/auth.reducer';
import { LoadingState } from '@core/store/loading/loading.reducer';

/** Root NgRx store state shape */
export interface AppState {
  auth: AuthState;
  loading: LoadingState;
}
