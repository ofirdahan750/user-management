// npx ng test --include='**/reset-password.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { authReducer } from '@core/store/auth/auth.reducer';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { of } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { FormService } from '@core/services/form/form.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { Routes } from '@core/enums/routes.enum';
import { RESET_PASSWORD_FORM_CONTROLS } from '@core/constants/form-controls.constants';

describe('ResetPasswordComponent', () => {
  const createResetPasswordForm = (): FormGroup =>
    new FormBuilder().group({
      [RESET_PASSWORD_FORM_CONTROLS.PASSWORD]: ['', Validators.required],
      [RESET_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD]: ['', Validators.required],
    });

  const mockFormService = {
    createResetPasswordForm,
    validateForm: (form: FormGroup) => form.valid,
  };

  const mockAuthService = {
    resetPassword: jasmine.createSpy('resetPassword').and.returnValue(of(undefined)),
  };

  const mockToastService = {
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError'),
  };

  const mockActivatedRoute = {
    snapshot: { queryParams: { token: 'test-token' } },
  };

  beforeEach(async () => {
    mockFormService.validateForm = (form: FormGroup) => form.valid;
    mockAuthService.resetPassword.calls.reset();
    mockAuthService.resetPassword.and.returnValue(of(undefined));
    mockToastService.showSuccess.calls.reset();
    mockToastService.showError.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideStore({ auth: authReducer, loading: loadingReducer }),
        { provide: FormService, useValue: mockFormService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels, routes, formControls and MESSAGES', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
    expect(component.formControls).toBe(RESET_PASSWORD_FORM_CONTROLS);
    expect(component.MESSAGES).toBe(MESSAGES);
  });

  it('should have resetPasswordForm with required controls', () => {
    const { component } = createFixture();
    expect(component.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.PASSWORD)).toBeTruthy();
    expect(component.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD)).toBeTruthy();
  });

  it('onSubmit should not call resetPassword when form is invalid', () => {
    mockFormService.validateForm = () => false;
    const { component } = createFixture();
    component.onSubmit();
    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('onSubmit should call resetPassword when form valid and token set', () => {
    const { component } = createFixture();
    component.token.set('test-token');
    component.resetPasswordForm.patchValue({
      [RESET_PASSWORD_FORM_CONTROLS.PASSWORD]: 'newPass123',
      [RESET_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD]: 'newPass123',
    });
    component.onSubmit();
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test-token', 'newPass123');
  });

  it('togglePasswordVisibility should toggle hidePassword', () => {
    const { component } = createFixture();
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
  });

  it('hasPasswordRequiredError should return true when password is empty and touched', () => {
    const { component } = createFixture();
    const control = component.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.PASSWORD);
    control?.markAsTouched();
    expect(component.hasPasswordRequiredError).toBe(true);
  });

  it('renders reset password title', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.reset-password__title');
    expect(title?.textContent?.trim()).toBe(LABELS.RESET_PASSWORD);
  });
});
