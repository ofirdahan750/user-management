import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { LABELS } from '@core/constants/labels.constants';
import { FORGOT_PASSWORD_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { Routes } from '@core/enums/routes.enum';
import { MESSAGES } from '@core/constants/messages.constants';
import { ForgotPasswordComponent } from './forgot-password.component';
import { FormService } from '@core/services/form.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { EmailHelperService } from '@core/services/email-helper.service';
import { authReducer } from '@core/store/auth/auth.reducer';
import * as AuthActions from '@core/store/auth/auth.actions';

describe('ForgotPasswordComponent', () => {
  const createForgotPasswordForm = (): FormGroup =>
    new FormBuilder().group({
      [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: ['', [Validators.required, Validators.email]],
    });

  let actionsSubject: Subject<ReturnType<typeof AuthActions.requestPasswordResetSuccess> | ReturnType<typeof AuthActions.requestPasswordResetFailure>>;

  const mockFormService = {
    createForgotPasswordForm,
    validateForm: (form: FormGroup) => form.valid,
  };

  const mockToastService = {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  };

  const mockEmailHelper = {
    getAndClearTemporaryEmail: vi.fn().mockReturnValue(''),
    copyTextToClipboard: vi.fn(),
  };

  beforeEach(async () => {
    actionsSubject = new Subject();
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideStore({ auth: authReducer }),
        { provide: FormService, useValue: mockFormService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: EmailHelperService, useValue: mockEmailHelper },
        { provide: Actions, useValue: actionsSubject },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  };

  it('should create component successfully', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels, routes, MESSAGES and icons', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
    expect(component.MESSAGES).toBe(MESSAGES);
    expect(component.icons).toBeDefined();
    expect(component.formControls).toBe(FORGOT_PASSWORD_FORM_CONTROLS);
  });

  it('should have forgotPasswordForm with email control', () => {
    const { component } = createFixture();
    expect(component.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL)).toBeTruthy();
  });

  it('hasEmailRequiredError should return true when email is required and touched', () => {
    const { component } = createFixture();
    const control = component.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL);
    control?.setValue('');
    control?.markAsTouched();
    expect(component.hasEmailRequiredError).toBe(true);
  });

  it('hasEmailFormatError should return true when email is invalid and touched', () => {
    const { component } = createFixture();
    const control = component.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL);
    control?.setValue('invalid');
    control?.markAsTouched();
    expect(component.hasEmailFormatError).toBe(true);
  });

  it('onSubmit should not dispatch when form is invalid', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.forgotPasswordForm.patchValue({ [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: '' });
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('onSubmit should dispatch requestPasswordReset when form is valid', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.forgotPasswordForm.patchValue({
      [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: 'user@test.com',
    });
    component.onSubmit();
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.requestPasswordReset({ email: 'user@test.com' })
    );
  });

  it('onSubmit should set isSuccess and resetToken when success action has resetToken', async () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
    component.forgotPasswordForm.patchValue({
      [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: 'user@test.com',
    });
    component.onSubmit();
    actionsSubject.next(
      AuthActions.requestPasswordResetSuccess({ resetToken: 'token123' })
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(component.isSuccess()).toBe(true);
    expect(component.resetToken()).toBe('token123');
    expect(component.isLoading()).toBe(false);
  });

  it('onSubmit should show error toast when success action has no resetToken', async () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
    component.forgotPasswordForm.patchValue({
      [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: 'user@test.com',
    });
    component.onSubmit();
    actionsSubject.next(AuthActions.requestPasswordResetSuccess({ resetToken: '' }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockToastService.showError).toHaveBeenCalledWith(MESSAGES.USER_NOT_FOUND);
    expect(component.isSuccess()).toBe(false);
    expect(component.isLoading()).toBe(false);
  });

  it('getResetPasswordUrl should return serialized URL with token when resetToken is set', () => {
    const { component } = createFixture();
    component.resetToken.set('abc123');
    const url = component.getResetPasswordUrl();
    expect(url).toContain(Routes.RESET_PASSWORD);
    expect(url).toContain('token=abc123');
  });

  it('getResetPasswordUrl should return empty string when resetToken is empty', () => {
    const { component } = createFixture();
    component.resetToken.set('');
    expect(component.getResetPasswordUrl()).toBe('');
  });

  it('copyResetLink should call emailHelper.copyTextToClipboard when resetToken is set', () => {
    const { component } = createFixture();
    component.resetToken.set('token123');
    component.copyResetLink();
    expect(mockEmailHelper.copyTextToClipboard).toHaveBeenCalledWith(
      expect.stringContaining('token=token123'),
      MESSAGES.RESET_LINK_COPIED
    );
  });

  it('copyResetLink should not call copyTextToClipboard when resetToken is empty', () => {
    const { component } = createFixture();
    component.resetToken.set('');
    component.copyResetLink();
    expect(mockEmailHelper.copyTextToClipboard).not.toHaveBeenCalled();
  });

  it('navigateToResetPassword should navigate with token when resetToken is set', () => {
    const { component } = createFixture();
    const router = TestBed.inject(Router) as Router;
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.resetToken.set('token123');
    component.navigateToResetPassword();
    expect(navigateSpy).toHaveBeenCalledWith([Routes.RESET_PASSWORD], {
      queryParams: { token: 'token123' },
    });
  });

  it('navigateToResetPassword should not navigate when resetToken is empty', () => {
    const { component } = createFixture();
    const router = TestBed.inject(Router) as Router;
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.resetToken.set('');
    component.navigateToResetPassword();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('resendEmail should call onSubmit when canResend is true', () => {
    const { component } = createFixture();
    const onSubmitSpy = vi.spyOn(component, 'onSubmit');
    component.canResend.set(true);
    component.forgotPasswordForm.patchValue({
      [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: 'user@test.com',
    });
    component.resendEmail();
    expect(onSubmitSpy).toHaveBeenCalled();
  });

  it('resendEmail should not call onSubmit when canResend is false', () => {
    const { component } = createFixture();
    const onSubmitSpy = vi.spyOn(component, 'onSubmit');
    component.canResend.set(false);
    component.resendEmail();
    expect(onSubmitSpy).not.toHaveBeenCalled();
  });

  it('should render reset password title', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.forgot-password__title');
    expect(title?.textContent?.trim()).toBe(component.labels.RESET_PASSWORD);
  });
});
