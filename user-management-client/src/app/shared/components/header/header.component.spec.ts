import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { signal } from '@angular/core';
import { Theme } from '@core/enums/theme.enum';
import { ThemeService } from '@core/services/theme.service';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { authReducer } from '@core/store/auth/auth.reducer';
import * as AuthActions from '@core/store/auth/auth.actions';
import { HeaderComponent } from './header.component';
import { UserProfile } from '@core/models/user.model';

describe('HeaderComponent', () => {
  const mockThemeService = {
    currentTheme: signal<Theme>(Theme.LIGHT),
    toggleTheme: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideStore({
          loading: loadingReducer,
          auth: authReducer,
        }),
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('toggleTheme calls themeService.toggleTheme', () => {
    const { component } = createFixture();
    const spy = vi.spyOn(mockThemeService, 'toggleTheme');
    component.toggleTheme();
    expect(spy).toHaveBeenCalled();
  });

  it('getThemeTooltip returns dark mode tooltip when theme is LIGHT', () => {
    const { component } = createFixture();
    expect(component.getThemeTooltip()).toBe(component.labels.TOOLTIP_SWITCH_TO_DARK_MODE);
  });

  it('getThemeTooltip returns light mode tooltip when theme is DARK', () => {
    const { component } = createFixture();
    mockThemeService.currentTheme.set(Theme.DARK);
    expect(component.getThemeTooltip()).toBe(component.labels.TOOLTIP_SWITCH_TO_LIGHT_MODE);
  });

  it('toggleMobileMenu toggles mobileMenuOpen', () => {
    const { component } = createFixture();
    expect(component.mobileMenuOpen()).toBe(false);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('closeMobileMenu sets mobileMenuOpen to false', () => {
    const { component } = createFixture();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('logout dispatches logout and closes mobile menu', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.toggleMobileMenu();
    component.logout();
    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.logout());
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('renders app name in logo', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const logo = el.querySelector('.header__logo');
    expect(logo?.textContent?.trim()).toBe(component.labels.APP_NAME);
  });
});
