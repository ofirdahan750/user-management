import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
  computed,
  inject,
  signal,
  WritableSignal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, EMPTY } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '@core/services/theme/theme.service';
import { Routes } from '@core/enums/routes.enum';
import { Theme } from '@core/enums/theme.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { UserProfile } from '@core/models/user.model';
import { LABELS } from '@core/constants/labels.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { selectIsAuthenticated, selectUserProfileList } from '@core/store/auth/auth.selectors';
import * as AuthActions from '@core/store/auth/auth.actions';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { LinkButtonComponent } from '@shared/ui/buttons/link-button/link-button.component';
import { NameCapitalizePipe } from '@shared/pipes/name-capitalize/name-capitalize.pipe';
import { AppState } from '@core/store/root-state.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSidenavModule,
    MatDividerModule,
    IconButtonComponent,
    LinkButtonComponent,
    NameCapitalizePipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  readonly routes = Routes;
  readonly labels = LABELS;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;
  readonly Theme = Theme;
  readonly MaterialColor = MaterialColor;
  private store: Store<AppState> = inject(Store);
  private themeService: ThemeService = inject(ThemeService);
  private router = inject(Router);

  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  isOnLoginPage: WritableSignal<boolean> = signal(this.router.url.startsWith(Routes.LOGIN));

  currentUser$: Observable<UserProfile> = this.store
    .select(selectUserProfileList)
    .pipe(switchMap((users) => (users.length > 0 ? of(users[0]) : EMPTY))); // current user state
  currentTheme: Signal<Theme> = computed(() => this.themeService.currentTheme()); // current theme
  mobileMenuOpen: WritableSignal<boolean> = signal(false); // mobile menu open state

  ngOnInit(): void {
    this.subscribeToLoginPageRoute(); // subscribe to the login page route for the wobble effect (register button animation)
  }

  // subscribe to the login page route for the wobble effect (register button animation)
  private subscribeToLoginPageRoute(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.isOnLoginPage.set(this.router.url.startsWith(Routes.LOGIN)));
    // subscribe to the login page route for the wobble effect (register button animation)
  }

  // toggle the theme
  toggleTheme(): void {
    this.themeService.toggleTheme(); // toggle the theme and save to local storage
  }
  // get the theme tooltip
  getThemeTooltip(): string {
    return this.currentTheme() === Theme.LIGHT
      ? this.labels.TOOLTIP_SWITCH_TO_DARK_MODE // tooltip for dark mode
      : this.labels.TOOLTIP_SWITCH_TO_LIGHT_MODE; // tooltip for light mode
  }

  // toggle the mobile menu
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  getFullName(user: UserProfile): string {
    return `${user.firstName} ${user.lastName}`;
  }

  logout(): void {
    // logout the user and close the mobile menu
    this.store.dispatch(AuthActions.logout()); // dispatch the logout action
    this.closeMobileMenu(); // close the mobile menu
  }
}
