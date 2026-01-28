import { Component, ViewEncapsulation, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '@core/services/theme.service';
import { Routes } from '@core/enums/routes.enum';
import { Theme } from '@core/enums/theme.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { UserProfile } from '@core/models/user.model';
import { LABELS } from '@core/constants/labels.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { selectIsAuthenticated, selectUser } from '@core/store/auth/auth.selectors';
import * as AuthActions from '@core/store/auth/auth.actions';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { LinkButtonComponent } from '@shared/ui/buttons/link-button/link-button.component';
import { AppState } from '@core/store';

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
    LinkButtonComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private store:Store<AppState> = inject(Store);
  private themeService:ThemeService = inject(ThemeService);
  private router:Router = inject(Router);

  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  currentUser$: Observable<UserProfile | null> = this.store.select(selectUser);
  currentTheme = computed(() => this.themeService.currentTheme());
  mobileMenuOpen = signal(false);

  readonly routes = Routes;
  readonly labels = LABELS;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;
  readonly Theme = Theme;
  readonly MaterialColor = MaterialColor;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeTooltip(): string {
    return this.currentTheme() === Theme.LIGHT 
      ? this.labels.TOOLTIP_SWITCH_TO_DARK_MODE 
      : this.labels.TOOLTIP_SWITCH_TO_LIGHT_MODE;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.closeMobileMenu();
  }
}
