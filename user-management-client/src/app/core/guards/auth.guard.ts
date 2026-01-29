import { inject } from '@angular/core';
import {
  Router,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthGuardAllowOnly } from '@core/enums/auth-guard.enum';
import { Routes } from '@core/enums/routes.enum';
import { selectIsAuthenticated } from '@core/store/auth/auth.selectors';
import { AppState } from '@core/store';

// create the auth guard - allow only authenticated or guest users
function createAuthGuard(allowOnly: AuthGuardAllowOnly): CanActivateFn {
  return (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
    const store: Store<AppState> = inject(Store); // inject the store
    const router: Router = inject(Router); // inject the router

    return store.select(selectIsAuthenticated).pipe( // select the isAuthenticated state
      take(1),
      map((isAuthenticated: boolean) => {
        // if the user is authenticated and the allowOnly is authenticated
        if (allowOnly === AuthGuardAllowOnly.AUTHENTICATED) {
          if (isAuthenticated) return true; // return true to allow access to the route
          router.navigate([Routes.LOGIN], { queryParams: { returnUrl: state.url } });
          return false; // return false to prevent access to the route
        }
        if (!isAuthenticated) return true; // return true to allow access to the route
        router.navigate([Routes.DASHBOARD]); // navigate to the dashboard if the user is not authenticated
        return false; // return false to prevent access to the route
      }),
    );
  };
}

// export the auth guard - allow only authenticated users
export const authGuard = createAuthGuard(AuthGuardAllowOnly.AUTHENTICATED);
// export the no auth guard - allow only guest users
export const noAuthGuard = createAuthGuard(AuthGuardAllowOnly.GUEST);
