import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs';
import { showLoading, hideLoading } from '@core/store/loading/loading.actions';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  store.dispatch(showLoading());

  return next(req).pipe(
    finalize(() => {
      store.dispatch(hideLoading());
    })
  );
};
