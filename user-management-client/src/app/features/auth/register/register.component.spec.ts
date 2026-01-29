import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { LABELS } from '@core/constants/labels.constants';
import { REGISTER_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { Routes } from '@core/enums/routes.enum';
import { MESSAGES } from '@core/constants/messages.constants';
import { RegisterComponent } from './register.component';
import { FormService } from '@core/services/form.service';
import { EmailHelperService } from '@core/services/email-helper.service';
import { authReducer } from '@core/store/auth/auth.reducer';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import { passwordStrengthValidator } from '@shared/validators/password-strength.validator';
import { defaultDateAgeValidator } from '@shared/validators/date-age.validator';
import { israeliPhoneValidator } from '@shared/validators/israeli-phone.validator';
import { PasswordStrength } from '@shared/validators/password-strength.validator';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';

describe('RegisterComponent', () => {
  const createRegisterForm = (): FormGroup =>
    new FormBuilder().group(
      {
        [REGISTER_FORM_CONTROLS.FIRST_NAME]: ['', Validators.required],
        [REGISTER_FORM_CONTROLS.LAST_NAME]: ['', Validators.required],
        [REGISTER_FORM_CONTROLS.EMAIL]: ['', [Validators.required, Validators.email]],
        [REGISTER_FORM_CONTROLS.PASSWORD]: ['', [Validators.required, passwordStrengthValidator()]],
        [REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD]: ['', Validators.required],
        [REGISTER_FORM_CONTROLS.BIRTH_DATE]: ['', [defaultDateAgeValidator()]],
        [REGISTER_FORM_CONTROLS.PHONE_NUMBER]: ['', [israeliPhoneValidator()]],
        [REGISTER_FORM_CONTROLS.TERMS]: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator() }
    );

  const mockFormService = {
    createRegisterForm,
    validateForm: (form: FormGroup) => form.valid,
    getCombinedLoading$: () => of(false),
  };

  const mockEmailHelper = {
    getAndClearTemporaryEmail: vi.fn().mockReturnValue(''),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideStore({ auth: authReducer }),
        { provide: FormService, useValue: mockFormService },
        { provide: EmailHelperService, useValue: mockEmailHelper },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  };

  const validFormValue = {
    [REGISTER_FORM_CONTROLS.FIRST_NAME]: 'John',
    [REGISTER_FORM_CONTROLS.LAST_NAME]: 'Doe',
    [REGISTER_FORM_CONTROLS.EMAIL]: 'john@test.com',
    [REGISTER_FORM_CONTROLS.PASSWORD]: 'Password1',
    [REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD]: 'Password1',
    [REGISTER_FORM_CONTROLS.BIRTH_DATE]: '',
    [REGISTER_FORM_CONTROLS.PHONE_NUMBER]: '',
    [REGISTER_FORM_CONTROLS.TERMS]: true,
  };

  it('should create component successfully', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels, routes, MESSAGES, PasswordStrength, formControls and placeholders', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
    expect(component.MESSAGES).toBe(MESSAGES);
    expect(component.PasswordStrength).toBe(PasswordStrength);
    expect(component.formControls).toBe(REGISTER_FORM_CONTROLS);
    expect(component.placeholders).toBeDefined();
    expect(component.ariaLabels).toBeDefined();
    expect(component.icons).toBeDefined();
  });

  it('should have registerForm with all controls', () => {
    const { component } = createFixture();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.FIRST_NAME)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.LAST_NAME)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.BIRTH_DATE)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.PHONE_NUMBER)).toBeTruthy();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.TERMS)).toBeTruthy();
  });

  it('should prefill email when getAndClearTemporaryEmail returns a value', () => {
    mockEmailHelper.getAndClearTemporaryEmail.mockReturnValue('prefill@test.com');
    const { component } = createFixture();
    component.ngOnInit();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL)?.value).toBe('prefill@test.com');
  });

  it('should not patch email when getAndClearTemporaryEmail returns empty', () => {
    mockEmailHelper.getAndClearTemporaryEmail.mockReturnValue('');
    const { component } = createFixture();
    component.ngOnInit();
    expect(component.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL)?.value).toBe('');
  });

  it('should update passwordStrength when password value changes', () => {
    const { component } = createFixture();
    component.ngOnInit();
    expect(component.passwordStrength()).toBe(PasswordStrength.WEAK);

    component.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD)?.setValue('weak');
    expect(component.passwordStrength()).toBe(PasswordStrength.WEAK);

    component.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD)?.setValue('Medium1');
    expect(component.passwordStrength()).toBe(PasswordStrength.MEDIUM);

    component.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD)?.setValue('StrongPass1!');
    expect(component.passwordStrength()).toBe(PasswordStrength.STRONG);
  });

  it('onSubmit should not dispatch when form is invalid', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.registerForm.patchValue({ [REGISTER_FORM_CONTROLS.EMAIL]: '' });
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('onSubmit should dispatch showLoading and register when form is valid', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.registerForm.patchValue(validFormValue);
    component.onSubmit();
    expect(dispatchSpy).toHaveBeenCalledWith(LoadingActions.showLoading());
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.register({
        data: {
          email: 'john@test.com',
          password: 'Password1',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      })
    );
  });

  it('onSubmit should include birthDate and phoneNumber in profile when set', () => {
    const { component } = createFixture();
    const store = TestBed.inject(Store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const birthDate = '1990-05-15';
    component.registerForm.patchValue({
      ...validFormValue,
      [REGISTER_FORM_CONTROLS.BIRTH_DATE]: birthDate,
      [REGISTER_FORM_CONTROLS.PHONE_NUMBER]: '0501234567',
    });
    component.onSubmit();
    const expectedData = {
      email: 'john@test.com',
      password: 'Password1',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date(birthDate).toISOString(),
        phoneNumber: '0501234567',
      },
    };
    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.register({ data: expectedData }));
  });

  it('togglePasswordVisibility should flip hidePassword signal', () => {
    const { component } = createFixture();
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  it('toggleConfirmPasswordVisibility should flip hideConfirmPassword signal', () => {
    const { component } = createFixture();
    expect(component.hideConfirmPassword()).toBe(true);
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(false);
  });

  it('getPasswordStrengthClass should return class based on strength', () => {
    const { component } = createFixture();
    component.passwordStrength.set(PasswordStrength.WEAK);
    expect(component.getPasswordStrengthClass()).toBe('register__strength--weak');
    component.passwordStrength.set(PasswordStrength.MEDIUM);
    expect(component.getPasswordStrengthClass()).toBe('register__strength--medium');
    component.passwordStrength.set(PasswordStrength.STRONG);
    expect(component.getPasswordStrengthClass()).toBe('register__strength--strong');
  });

  it('getPasswordStrengthText should return MESSAGES text for each strength', () => {
    const { component } = createFixture();
    component.passwordStrength.set(PasswordStrength.WEAK);
    expect(component.getPasswordStrengthText()).toBe(MESSAGES.PASSWORD_WEAK);
    component.passwordStrength.set(PasswordStrength.MEDIUM);
    expect(component.getPasswordStrengthText()).toBe(MESSAGES.PASSWORD_MEDIUM);
    component.passwordStrength.set(PasswordStrength.STRONG);
    expect(component.getPasswordStrengthText()).toBe(MESSAGES.PASSWORD_STRONG);
  });

  it('hasFirstNameRequiredError should return true when first name is empty and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.FIRST_NAME);
    control?.setValue('');
    control?.markAsTouched();
    expect(component.hasFirstNameRequiredError).toBe(true);
  });

  it('hasLastNameRequiredError should return true when last name is empty and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.LAST_NAME);
    control?.setValue('');
    control?.markAsTouched();
    expect(component.hasLastNameRequiredError).toBe(true);
  });

  it('hasEmailRequiredError should return true when email is empty and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    control?.setValue('');
    control?.markAsTouched();
    expect(component.hasEmailRequiredError).toBe(true);
  });

  it('hasEmailFormatError should return true when email is invalid and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    control?.setValue('invalid');
    control?.markAsTouched();
    expect(component.hasEmailFormatError).toBe(true);
  });

  it('hasPasswordRequiredError should return true when password is empty and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    control?.setValue('');
    control?.markAsTouched();
    expect(component.hasPasswordRequiredError).toBe(true);
  });

  it('hasConfirmPasswordRequiredError should return true when confirm password is empty and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD);
    control?.setValue('');
    control?.markAsTouched();
    expect(component.hasConfirmPasswordRequiredError).toBe(true);
  });

  it('hasTermsRequiredError should return true when terms not accepted and touched', () => {
    const { component } = createFixture();
    const control = component.registerForm.get(REGISTER_FORM_CONTROLS.TERMS);
    control?.setValue(false);
    control?.markAsTouched();
    expect(component.hasTermsRequiredError).toBe(true);
  });

  it('should render register title', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.register__title');
    expect(title?.textContent?.trim()).toBe(component.labels.REGISTER);
  });

  it('should have link to login route', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('.register__login-link');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href') ?? link?.getAttribute('ng-reflect-router-link')).toContain(
      Routes.LOGIN
    );
  });
});
