// npx ng test --include='**/change-password.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ChangePasswordComponent } from './change-password.component';
import { FormService } from '@core/services/form/form.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { ApiErrorService } from '@core/services/api-error/api-error.service';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { Routes } from '@core/enums/routes.enum';
import { CHANGE_PASSWORD_FORM_CONTROLS } from '@core/constants/form-controls.constants';

describe('ChangePasswordComponent', () => {
  const createChangePasswordForm = (values?: Partial<Record<string, string>>): FormGroup => {
    const form = new FormBuilder().group({
      [CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD]: ['', Validators.required],
      [CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD]: ['', Validators.required],
      [CHANGE_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD]: ['', Validators.required],
    });
    if (values) form.patchValue(values);
    return form;
  };

  const mockFormService = {
    createChangePasswordForm: () => createChangePasswordForm(),
    validateForm: (form: FormGroup) => form.valid,
  };

  const mockAuthService = {
    changePassword: jasmine.createSpy('changePassword').and.returnValue(of(undefined)),
  };

  const mockToastService = {
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError'),
  };

  const mockApiErrorService = {
    getMessageFromHttpError: jasmine.createSpy('getMessageFromHttpError').and.returnValue(MESSAGES.PASSWORD_CHANGE_ERROR),
  };

  beforeEach(async () => {
    mockFormService.validateForm = (form: FormGroup) => form.valid;
    mockAuthService.changePassword.calls.reset();
    mockAuthService.changePassword.and.returnValue(of(undefined));
    mockToastService.showSuccess.calls.reset();
    mockToastService.showError.calls.reset();
    mockApiErrorService.getMessageFromHttpError.calls.reset();
    mockApiErrorService.getMessageFromHttpError.and.returnValue(MESSAGES.PASSWORD_CHANGE_ERROR);

    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: FormService, useValue: mockFormService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: ApiErrorService, useValue: mockApiErrorService },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(ChangePasswordComponent);
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
    expect(component.formControls).toBe(CHANGE_PASSWORD_FORM_CONTROLS);
    expect(component.MESSAGES).toBe(MESSAGES);
  });

  it('should have changePasswordForm with required controls', () => {
    const { component } = createFixture();
    expect(component.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD)).toBeTruthy();
    expect(component.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD)).toBeTruthy();
    expect(component.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD)).toBeTruthy();
  });

  it('onSubmit should not call changePassword when form is invalid', () => {
    mockFormService.validateForm = () => false;
    const { component } = createFixture();
    component.onSubmit();
    expect(mockAuthService.changePassword).not.toHaveBeenCalled();
  });

  it('onSubmit should call changePassword and navigate on success', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    mockFormService.validateForm = () => true;
    const { component } = createFixture();
    component.changePasswordForm.patchValue({
      [CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD]: 'oldPass123',
      [CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD]: 'newPass123',
      [CHANGE_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD]: 'newPass123',
    });
    component.onSubmit();
    expect(mockAuthService.changePassword).toHaveBeenCalledWith('oldPass123', 'newPass123');
    expect(mockToastService.showSuccess).toHaveBeenCalledWith(MESSAGES.PASSWORD_CHANGE_SUCCESS);
    expect(navigateSpy).toHaveBeenCalledWith([Routes.PROFILE]);
  });

  it('onSubmit should show error toast on changePassword failure', () => {
    const error = { error: { errorMessage: 'Wrong password' } };
    mockAuthService.changePassword.and.returnValue(throwError(() => error));
    mockFormService.validateForm = () => true;
    const { component } = createFixture();
    component.changePasswordForm.patchValue({
      [CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD]: 'wrong',
      [CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD]: 'newPass123',
      [CHANGE_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD]: 'newPass123',
    });
    component.onSubmit();
    expect(mockApiErrorService.getMessageFromHttpError).toHaveBeenCalledWith(error, MESSAGES.PASSWORD_CHANGE_ERROR);
    expect(mockToastService.showError).toHaveBeenCalledWith(MESSAGES.PASSWORD_CHANGE_ERROR);
    expect(component.isLoading()).toBe(false);
  });

  it('toggleCurrentPasswordVisibility should toggle hideCurrentPassword', () => {
    const { component } = createFixture();
    expect(component.hideCurrentPassword()).toBe(true);
    component.toggleCurrentPasswordVisibility();
    expect(component.hideCurrentPassword()).toBe(false);
    component.toggleCurrentPasswordVisibility();
    expect(component.hideCurrentPassword()).toBe(true);
  });

  it('hasCurrentPasswordRequiredError should return true when current password is empty and touched', () => {
    const { component } = createFixture();
    const control = component.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD);
    control?.markAsTouched();
    expect(component.hasCurrentPasswordRequiredError).toBe(true);
  });

  it('hasPasswordRequiredError should return true when password is empty and touched', () => {
    const { component } = createFixture();
    const control = component.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD);
    control?.markAsTouched();
    expect(component.hasPasswordRequiredError).toBe(true);
  });

  it('renders change password title', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.change-password__title');
    expect(title?.textContent?.trim()).toBe(LABELS.CHANGE_PASSWORD);
  });
});
