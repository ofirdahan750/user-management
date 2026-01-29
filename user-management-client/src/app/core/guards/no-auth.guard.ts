import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { Routes } from '@core/enums/routes.enum';
import { selectIsAuthenticated } from '@core/store/auth/auth.selectors';
import { AppState } from '@core/store';
import { Observable } from 'rxjs';

// check if the user is authenticated
export const noAuthGuard: CanActivateFn = (): Observable<boolean> => {
  const store: Store<AppState> = inject(Store); // inject the store
  const router: Router = inject(Router); // inject the router

  return store.select(selectIsAuthenticated).pipe(
    // select the isAuthenticated state
    take(1),
    map((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        // if the user is not authenticated
        return true; // return true to allow access to the route
      }
      router.navigate([Routes.DASHBOARD]); // navigate to the dashboard if the user is authenticated
      return false; // return false to prevent access to the route
    }),
  );
};
