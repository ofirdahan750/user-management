import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { Routes } from '@core/enums/routes.enum';
import { selectIsAuthenticated } from '@core/store/auth/auth.selectors';

export const noAuthGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return true;
      }
      router.navigate([Routes.DASHBOARD]);
      return false;
    })
  );
};
