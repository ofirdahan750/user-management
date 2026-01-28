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
import { LABELS } from '@core/constants/labels.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { selectIsAuthenticated, selectUser } from '@core/store/auth/auth.selectors';
import * as AuthActions from '@core/store/auth/auth.actions';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { LinkButtonComponent } from '@shared/ui/buttons/link-button/link-button.component';

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
  private store = inject(Store);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  public isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  public currentUser$: Observable<any> = this.store.select(selectUser);
  public currentTheme = computed(() => this.themeService.currentTheme());
  public mobileMenuOpen = signal(false);

  public readonly routes = Routes;
  public readonly labels = LABELS;
  public readonly ariaLabels = ARIA_LABELS;
  public readonly icons = ICONS;

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
