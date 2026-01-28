import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getPasswordStrength, PasswordStrength } from '@shared/validators/password-strength.validator';
import { FormService } from '@core/services/form.service';
import { EmailHelperService } from '@core/services/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { RegisterFormValue } from '@core/types/form.types';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { PLACEHOLDERS } from '@core/constants/placeholders.constants';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    SubmitButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private formService = inject(FormService);
  private store = inject(Store);
  private router = inject(Router);
  private emailHelper = inject(EmailHelperService);

  registerForm: FormGroup;
  hidePassword = signal<boolean>(true);
  hideConfirmPassword = signal<boolean>(true);
  passwordStrength = signal<PasswordStrength>(PasswordStrength.WEAK);
  combinedLoading$: Observable<boolean>;

  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly PasswordStrength = PasswordStrength;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;
  readonly placeholders = PLACEHOLDERS;

  constructor() {
    this.registerForm = this.formService.createRegisterForm();
    this.combinedLoading$ = this.formService.getCombinedLoading$();

    const passwordControl = this.registerForm.get('password');
    if (passwordControl) {
      passwordControl.valueChanges.subscribe(password => {
        if (password) {
          this.passwordStrength.set(getPasswordStrength(password));
        }
      });
    }
  }
  
  // Getters for form controls to avoid optional chaining in template
  get firstNameControl() {
    return this.registerForm.get('firstName');
  }
  
  get lastNameControl() {
    return this.registerForm.get('lastName');
  }
  
  get emailControl() {
    return this.registerForm.get('email');
  }
  
  get passwordControl() {
    return this.registerForm.get('password');
  }
  
  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }
  
  get birthDateControl() {
    return this.registerForm.get('birthDate');
  }
  
  get phoneNumberControl() {
    return this.registerForm.get('phoneNumber');
  }
  
  get termsControl() {
    return this.registerForm.get('terms');
  }
  
  // Error checkers
  get hasFirstNameRequiredError(): boolean {
    const control = this.firstNameControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasLastNameRequiredError(): boolean {
    const control = this.lastNameControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasEmailRequiredError(): boolean {
    const control = this.emailControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasEmailFormatError(): boolean {
    const control = this.emailControl;
    return control ? control.hasError('email') && control.touched : false;
  }
  
  get hasPasswordRequiredError(): boolean {
    const control = this.passwordControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasPasswordValidationError(): boolean {
    const control = this.passwordControl;
    return control ? (control.hasError('minLength') || control.hasError('uppercase') || control.hasError('lowercase') || control.hasError('digit')) : false;
  }
  
  get hasPasswordValue(): boolean {
    const control = this.passwordControl;
    return control ? !!control.value && control.dirty : false;
  }
  
  get hasConfirmPasswordRequiredError(): boolean {
    const control = this.confirmPasswordControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasPasswordMismatchError(): boolean {
    const control = this.confirmPasswordControl;
    return this.registerForm.hasError('passwordMismatch') && (control ? control.touched : false);
  }
  
  get hasBirthDateError(): boolean {
    const control = this.birthDateControl;
    return control ? control.invalid && (control.touched || control.dirty) && !!this.getBirthDateErrorMessage() : false;
  }
  
  get hasPhoneNumberError(): boolean {
    const control = this.phoneNumberControl;
    return control ? control.hasError('invalidPhone') && control.touched : false;
  }
  
  get hasTermsRequiredError(): boolean {
    const control = this.termsControl;
    return control ? control.hasError('required') && control.touched : false;
  }

  ngOnInit(): void {
    // Pre-fill email from temporary storage (one-time use, cleared automatically)
    const email = this.emailHelper.getAndClearTemporaryEmail();
    if (email) {
      this.registerForm.patchValue({ email });
    }
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.registerForm)) {
      return;
    }

    const formValue = this.registerForm.value as RegisterFormValue;

    const profile: { firstName: string; lastName: string; birthDate?: string; phoneNumber?: string } = {
      firstName: formValue.firstName,
      lastName: formValue.lastName
    };
    
    if (formValue.birthDate) {
      profile.birthDate = new Date(formValue.birthDate).toISOString();
    }
    
    if (formValue.phoneNumber) {
      profile.phoneNumber = formValue.phoneNumber;
    }

    const registerData = {
      email: formValue.email,
      password: formValue.password,
      profile
    };

    this.store.dispatch(LoadingActions.showLoading());
    this.store.dispatch(AuthActions.register({ data: registerData }));
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  getPasswordStrengthClass(): string {
    const strength = this.passwordStrength();
    return `register__strength--${strength}`;
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    switch (strength) {
      case PasswordStrength.WEAK:
        return MESSAGES.PASSWORD_WEAK;
      case PasswordStrength.MEDIUM:
        return MESSAGES.PASSWORD_MEDIUM;
      case PasswordStrength.STRONG:
        return MESSAGES.PASSWORD_STRONG;
      default:
        return '';
    }
  }

  getBirthDateErrorMessage(): string {
    const control = this.registerForm.get('birthDate');
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('invalidDate')) {
      return MESSAGES.INVALID_DATE;
    }
    if (control.hasError('futureDate')) {
      return MESSAGES.INVALID_DATE_FUTURE;
    }
    if (control.hasError('minAge') || control.hasError('maxAge')) {
      return MESSAGES.INVALID_DATE_AGE;
    }

    return '';
  }
}
