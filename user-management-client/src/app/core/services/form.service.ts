import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { passwordStrengthValidator } from '@shared/validators/password-strength.validator';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import { israeliPhoneValidator } from '@shared/validators/israeli-phone.validator';
import { defaultDateAgeValidator } from '@shared/validators/date-age.validator';
import { LocalStorageService } from '@core/services/local-storage.service';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { selectIsLoading } from '@core/store/loading/loading.selectors';
import { selectAuthLoading } from '@core/store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private localStorage = inject(LocalStorageService);

  /**
   * Creates a registration form with all required validators
   */
  createRegisterForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [defaultDateAgeValidator()]],
      phoneNumber: ['', [israeliPhoneValidator()]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator() });
  }

  /**
   * Creates a login form with email and password fields
   */
  createLoginForm(): FormGroup {
    const form = this.fb.group({
      loginID: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Load saved email if exists
    const savedEmail = this.localStorage.getItem(StorageKeys.REMEMBER_ME);
    if (savedEmail) {
      form.patchValue({ loginID: savedEmail, rememberMe: true });
    }

    return form;
  }

  /**
   * Creates a forgot password form with email field
   */
  createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Creates a reset password form with password and confirm password fields
   */
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

  /**
   * Creates a profile update form with user information fields
   */
  createProfileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [israeliPhoneValidator()]],
      birthDate: ['', [defaultDateAgeValidator()]]
    });
  }

  /**
   * Validates a form and marks all fields as touched if invalid
   * @param form The form group to validate
   * @returns true if form is valid, false otherwise
   */
  validateForm(form: FormGroup): boolean {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      return false;
    }
    return true;
  }

  /**
   * Marks all form controls as touched recursively
   * @param formGroup The form group to mark as touched
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Resets a form to its initial state
   * @param form The form group to reset
   * @param values Optional values to set after reset
   */
  resetForm(form: FormGroup, values?: Record<string, unknown>): void {
    form.reset();
    if (values) {
      form.patchValue(values);
    }
  }

  /**
   * Gets combined loading state from both global loading and auth loading
   * @returns Observable of combined loading state
   */
  getCombinedLoading$(): Observable<boolean> {
    const isLoading$ = this.store.select(selectIsLoading);
    const authLoading$ = this.store.select(selectAuthLoading);
    
    return combineLatest([isLoading$, authLoading$]).pipe(
      map(([isLoading, authLoading]) => isLoading || authLoading)
    );
  }

  /**
   * Gets global loading state
   * @returns Observable of loading state
   */
  getLoading$(): Observable<boolean> {
    return this.store.select(selectIsLoading);
  }

  /**
   * Gets auth loading state
   * @returns Observable of auth loading state
   */
  getAuthLoading$(): Observable<boolean> {
    return this.store.select(selectAuthLoading);
  }
}
