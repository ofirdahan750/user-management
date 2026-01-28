import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoadingState } from './loading.reducer';

export const selectLoadingState = createFeatureSelector<LoadingState>('loading');

export const selectIsLoading = createSelector(
  selectLoadingState,
  (state: LoadingState) => state.isLoading
);

export const selectRequestCount = createSelector(
  selectLoadingState,
  (state: LoadingState) => state.requestCount
);
