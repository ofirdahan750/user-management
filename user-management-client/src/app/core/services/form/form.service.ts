import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { passwordStrengthValidator } from '@shared/validators/password-strength.validator';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import { israeliPhoneValidator } from '@shared/validators/israeli-phone.validator';
import { defaultDateAgeValidator } from '@shared/validators/date-age.validator';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import {
  LOGIN_FORM_CONTROLS,
  REGISTER_FORM_CONTROLS,
} from '@core/constants/form-controls.constants';
import { selectIsLoading } from '@core/store/loading/loading.selectors';
import { selectAuthLoading } from '@core/store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private localStorage = inject(LocalStorageService);

  createRegisterForm(): FormGroup {
    return this.fb.group({
      [REGISTER_FORM_CONTROLS.EMAIL]: ['', [Validators.required, Validators.email]],
      [REGISTER_FORM_CONTROLS.PASSWORD]: ['', [Validators.required, passwordStrengthValidator()]],
      [REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD]: ['', [Validators.required]],
      [REGISTER_FORM_CONTROLS.FIRST_NAME]: ['', [Validators.required]],
      [REGISTER_FORM_CONTROLS.LAST_NAME]: ['', [Validators.required]],
      [REGISTER_FORM_CONTROLS.BIRTH_DATE]: ['', [defaultDateAgeValidator()]],
      [REGISTER_FORM_CONTROLS.PHONE_NUMBER]: ['', [israeliPhoneValidator()]],
      [REGISTER_FORM_CONTROLS.TERMS]: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator() });
  }

  createLoginForm(): FormGroup {
    const form = this.fb.group({
      [LOGIN_FORM_CONTROLS.LOGIN_ID]: ['', [Validators.required, Validators.email]],
      [LOGIN_FORM_CONTROLS.PASSWORD]: ['', [Validators.required]],
      [LOGIN_FORM_CONTROLS.REMEMBER_ME]: [false],
    });

    const savedEmail = this.localStorage.getItem(StorageKeys.REMEMBER_ME);
    if (savedEmail) {
      form.patchValue({
        [LOGIN_FORM_CONTROLS.LOGIN_ID]: savedEmail,
        [LOGIN_FORM_CONTROLS.REMEMBER_ME]: true,
      });
    }

    return form;
  }

  createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  createResetPasswordForm(): FormGroup {
    return this.fb.group({
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
  }

  createChangePasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [israeliPhoneValidator()]],
      birthDate: ['', [defaultDateAgeValidator()]]
    });
  }

  validateForm(form: FormGroup): boolean {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      return false;
    }
    return true;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  resetForm(form: FormGroup, values?: Record<string, unknown>): void {
    form.reset();
    if (values) {
      form.patchValue(values);
    }
  }

  getCombinedLoading$(): Observable<boolean> {
    const isLoading$ = this.store.select(selectIsLoading);
    const authLoading$ = this.store.select(selectAuthLoading);

    return combineLatest([isLoading$, authLoading$]).pipe(
      map(([isLoading, authLoading]) => isLoading || authLoading)
    );
  }

  getLoading$(): Observable<boolean> {
    return this.store.select(selectIsLoading);
  }

  getAuthLoading$(): Observable<boolean> {
    return this.store.select(selectAuthLoading);
  }
}
