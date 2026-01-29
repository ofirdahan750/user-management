import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoadingState } from './loading.reducer';

export const selectLoadingState = createFeatureSelector<LoadingState>('loading'); // loading state

/** Selects the isLoading state from the loading state */
export const selectIsLoading = createSelector(
  selectLoadingState,
  (state: LoadingState): boolean => state.isLoading
);

/** Number of requests currently in progress */
export const selectRequestCount = createSelector(
  selectLoadingState,
  (state: LoadingState): number => state.requestCount
);
