import { createReducer, on } from '@ngrx/store';
import { showLoading, hideLoading, setLoading } from './loading.actions';

export interface LoadingState {
  isLoading: boolean;
  requestCount: number;
}

export const initialState: LoadingState = {
  isLoading: false,
  requestCount: 0
};

export const loadingReducer = createReducer(
  initialState,
  on(showLoading, (state) => ({
    ...state,
    requestCount: state.requestCount + 1,
    isLoading: true
  })),
  on(hideLoading, (state) => {
    const newCount = Math.max(0, state.requestCount - 1);
    return {
      ...state,
      requestCount: newCount,
      isLoading: newCount > 0
    };
  }),
  on(setLoading, (state, { isLoading }) => ({
    ...state,
    isLoading,
    requestCount: isLoading ? 1 : 0
  }))
);
