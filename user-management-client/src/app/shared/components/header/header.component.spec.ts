// npx ng test --include='**/header.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { signal } from '@angular/core';
import { Theme } from '@core/enums/theme.enum';
import { ThemeService } from '@core/services/theme/theme.service';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { authReducer } from '@core/store/auth/auth.reducer';
import * as AuthActions from '@core/store/auth/auth.actions';
import { HeaderComponent } from './header.component';
import { UserProfile } from '@core/models/user.model';
import { Routes } from '@core/enums/routes.enum';

@Component({ standalone: true, template: '' })
class StubComponent {}

describe('HeaderComponent', () => {
  const mockThemeService = {
    currentTheme: signal<Theme>(Theme.LIGHT),
    toggleTheme: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([
          { path: 'login', component: StubComponent },
          { path: '', component: StubComponent },
        ]),
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
    const spy = spyOn(mockThemeService, 'toggleTheme');
    component.toggleTheme();
    expect(spy).toHaveBeenCalled();
  });

  it('getThemeTooltip returns dark mode tooltip when theme is LIGHT', () => {
    mockThemeService.currentTheme.set(Theme.LIGHT);
    const { component } = createFixture();
    expect(component.getThemeTooltip()).toBe(component.labels.TOOLTIP_SWITCH_TO_DARK_MODE);
  });

  it('getThemeTooltip returns light mode tooltip when theme is DARK', () => {
    mockThemeService.currentTheme.set(Theme.DARK);
    const { component } = createFixture();
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
    const dispatchSpy = spyOn(store, 'dispatch');
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

  it('isOnLoginPage returns false when not on login route', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/']);
    const { component } = createFixture();
    expect(component.isOnLoginPage()).toBe(false);
  });

  it('isOnLoginPage returns true when on login route', async () => {
    const router = TestBed.inject(Router);
    await router.navigate([Routes.LOGIN]);
    const { component } = createFixture();
    expect(component.isOnLoginPage()).toBe(true);
  });

  it('applies wobble class to register button when on login page', async () => {
    const router = TestBed.inject(Router);
    await router.navigate([Routes.LOGIN]);
    const { fixture } = createFixture();
    fixture.detectChanges();
    const registerBtn = fixture.nativeElement.querySelector('.header__register-btn--wobble');
    expect(registerBtn).toBeTruthy();
  });

  it('getFullName returns first and last name concatenated', () => {
    const { component } = createFixture();
    const user: UserProfile = {
      UID: '1',
      email: 'test@test.com',
      firstName: 'john',
      lastName: 'doe',
      phoneNumber: '',
      isVerified: true,
      registrationDate: '2024-01-01',
      lastLoginDate: '2024-01-15',
    };
    expect(component.getFullName(user)).toBe('john doe');
  });

  it('subscribeToLoginPageRoute updates isOnLoginPage when navigating', async () => {
    const router = TestBed.inject(Router);
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    await router.navigate(['/']);
    fixture.detectChanges();
    expect(component.isOnLoginPage()).toBe(false);
    await router.navigate([Routes.LOGIN]);
    fixture.detectChanges();
    expect(component.isOnLoginPage()).toBe(true);
  });
});
