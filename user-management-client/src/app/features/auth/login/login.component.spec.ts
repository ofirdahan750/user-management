// npx ng test --include='**/login.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { Routes } from '@core/enums/routes.enum';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { LABELS } from '@core/constants/labels.constants';
import { LOGIN_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { LoginComponent } from './login.component';
import { FormService } from '@core/services/form/form.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { EmailHelperService } from '@core/services/email-helper/email-helper.service';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { authReducer } from '@core/store/auth/auth.reducer';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';

describe('LoginComponent', () => {
  const createLoginForm = (): FormGroup =>
    new FormBuilder().group({
      [LOGIN_FORM_CONTROLS.LOGIN_ID]: ['', [Validators.required, Validators.email]],
      [LOGIN_FORM_CONTROLS.PASSWORD]: ['', [Validators.required]],
      [LOGIN_FORM_CONTROLS.REMEMBER_ME]: [false],
    });

  const mockFormService = {
    createLoginForm,
    validateForm: (form: FormGroup) => form.valid,
    getCombinedLoading$: () => of(false),
  };

  const mockLocalStorage = {
    setItem: jasmine.createSpy('setItem'),
    removeItem: jasmine.createSpy('removeItem'),
    getItem: jasmine.createSpy('getItem'),
  };

  const mockEmailHelper = {
    setTemporaryEmail: jasmine.createSpy('setTemporaryEmail'),
  };

  beforeEach(async () => {
    mockLocalStorage.setItem.calls.reset();
    mockLocalStorage.removeItem.calls.reset();
    mockLocalStorage.getItem.calls.reset();
    mockEmailHelper.setTemporaryEmail.calls.reset();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideStore({ loading: loadingReducer, auth: authReducer }),
        { provide: FormService, useValue: mockFormService },
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: EmailHelperService, useValue: mockEmailHelper },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(LoginComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels and routes', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
  });

  it('should have loginForm with loginID and password controls', () => {
    const { component } = createFixture();
    expect(component.loginForm.get(LOGIN_FORM_CONTROLS.LOGIN_ID)).toBeTruthy();
    expect(component.loginForm.get(LOGIN_FORM_CONTROLS.PASSWORD)).toBeTruthy();
    expect(component.formControls).toBe(LOGIN_FORM_CONTROLS);
  });

  it('onSubmit should not dispatch when form is invalid', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');
    component.loginForm.patchValue({
      [LOGIN_FORM_CONTROLS.LOGIN_ID]: '',
      [LOGIN_FORM_CONTROLS.PASSWORD]: '',
    });
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('onSubmit should dispatch showLoading and login when form is valid', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');
    component.loginForm.patchValue({
      [LOGIN_FORM_CONTROLS.LOGIN_ID]: 'user@test.com',
      [LOGIN_FORM_CONTROLS.PASSWORD]: 'Pass1234',
      [LOGIN_FORM_CONTROLS.REMEMBER_ME]: false,
    });
    component.onSubmit();
    expect(dispatchSpy).toHaveBeenCalledWith(LoadingActions.showLoading());
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.login({
        credentials: { loginID: 'user@test.com', password: 'Pass1234' },
        rememberMe: false,
      })
    );
  });

  it('onSubmit should set REMEMBER_ME in localStorage when rememberMe is true', () => {
    const { component } = createFixture();
    component.loginForm.patchValue({
      [LOGIN_FORM_CONTROLS.LOGIN_ID]: 'user@test.com',
      [LOGIN_FORM_CONTROLS.PASSWORD]: 'Pass1234',
      [LOGIN_FORM_CONTROLS.REMEMBER_ME]: true,
    });
    component.onSubmit();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      StorageKeys.REMEMBER_ME,
      'user@test.com'
    );
  });

  it('onSubmit should remove REMEMBER_ME from localStorage when rememberMe is false', () => {
    const { component } = createFixture();
    component.loginForm.patchValue({
      [LOGIN_FORM_CONTROLS.LOGIN_ID]: 'user@test.com',
      [LOGIN_FORM_CONTROLS.PASSWORD]: 'Pass1234',
      [LOGIN_FORM_CONTROLS.REMEMBER_ME]: false,
    });
    component.onSubmit();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(StorageKeys.REMEMBER_ME);
  });

  it('navigateWithEmail should preventDefault, set temporary email and navigate', () => {
    const { component } = createFixture();
    const router = TestBed.inject(Router) as Router;
    const navigateSpy = spyOn(router, 'navigate');
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    component.loginForm.patchValue({ [LOGIN_FORM_CONTROLS.LOGIN_ID]: 'user@test.com' });
    component.navigateWithEmail(event, Routes.FORGOT_PASSWORD);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockEmailHelper.setTemporaryEmail).toHaveBeenCalledWith('user@test.com');
    expect(navigateSpy).toHaveBeenCalledWith([Routes.FORGOT_PASSWORD]);
  });

  it('navigateWithEmail should navigate without setting email when loginID is empty', () => {
    const { component } = createFixture();
    const router = TestBed.inject(Router) as Router;
    const navigateSpy = spyOn(router, 'navigate');
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    component.loginForm.patchValue({ [LOGIN_FORM_CONTROLS.LOGIN_ID]: '' });
    component.navigateWithEmail(event, Routes.REGISTER);
    expect(mockEmailHelper.setTemporaryEmail).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith([Routes.REGISTER]);
  });

  it('should render login title', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.login__title');
    expect(title?.textContent?.trim()).toBe(component.labels.LOGIN);
  });
});
