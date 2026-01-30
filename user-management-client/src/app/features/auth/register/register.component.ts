import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
  signal,
  WritableSignal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  getPasswordStrength,
  PasswordStrength,
} from '@shared/validators/password-strength.validator';
import { FormService } from '@core/services/form/form.service';
import { EmailHelperService } from '@core/services/email-helper/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { RegisterFormValue } from '@core/types/form.types';
import { RegisterProfile, RegisterRequest } from '@core/models/auth.model';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { PLACEHOLDERS } from '@core/constants/placeholders.constants';
import { REGISTER_FORM_CONTROLS } from '@core/constants/form-controls.constants';
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
    SubmitButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly PasswordStrength = PasswordStrength;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;
  readonly placeholders = PLACEHOLDERS;
  readonly formControls = REGISTER_FORM_CONTROLS;

  private formService: FormService = inject(FormService); // form service
  private store: Store = inject(Store); // store 
  private emailHelper: EmailHelperService = inject(EmailHelperService); // email helper service

  registerForm: FormGroup = this.formService.createRegisterForm() || ({} as FormGroup); // register form group
  hidePassword: WritableSignal<boolean> = signal<boolean>(true);
  hideConfirmPassword: WritableSignal<boolean> = signal<boolean>(true);
  passwordStrength: WritableSignal<PasswordStrength> = signal<PasswordStrength>(
    PasswordStrength.WEAK,
  );
  combinedLoading$: Observable<boolean> = this.formService.getCombinedLoading$() || of(false); // combined loading observable

  ngOnInit(): void {
    this.prefillEmail(); // prefill email from temporary storage(from login page)
    this.setupPasswordStrengthListener(); // setup password strength listener
  }

  // prefill email from temporary storage(from login page)
  private prefillEmail(): void {
    const email: string = this.emailHelper.getAndClearTemporaryEmail() || ''; // get and clear temporary email from email helper service
    if (email) {
      // if email is not empty, patch value to register form
      this.registerForm.patchValue({ [REGISTER_FORM_CONTROLS.EMAIL]: email }); // patch value to register form
    }
  }

  // setup password strength listener
  private setupPasswordStrengthListener(): void {
    const passwordControl = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD); // get password control from register form
    if (passwordControl) {
      passwordControl.valueChanges.subscribe((password: string) => {
        // subscribe to password value changes
        if (password) {
          // if password is not empty, set password strength
          this.passwordStrength.set(getPasswordStrength(password)); // set password strength
        }
      });
    }
  }

  // on submit register form
  onSubmit(): void {
    // if form is not valid, return
    if (!this.formService.validateForm(this.registerForm)) return;
    const formValue: RegisterFormValue = this.registerForm.value as RegisterFormValue;

    const profile: RegisterProfile = {
      // create profile object
      firstName: formValue[REGISTER_FORM_CONTROLS.FIRST_NAME], // first name
      lastName: formValue[REGISTER_FORM_CONTROLS.LAST_NAME], // last name
    };

    const birthDate: string = formValue[REGISTER_FORM_CONTROLS.BIRTH_DATE] || ''; // birth date
    if (birthDate) {
      // if birth date is not empty, add to profile
      profile.birthDate = new Date(birthDate).toISOString(); // convert to ISO string
    }

    const phoneNumber = formValue[REGISTER_FORM_CONTROLS.PHONE_NUMBER]; // phone number
    if (phoneNumber) {
      // if phone number is not empty, add to profile
      profile.phoneNumber = phoneNumber; // add phone number to profile
    }

    const registerData: RegisterRequest = {
      // create register data object
      email: formValue[REGISTER_FORM_CONTROLS.EMAIL], // email
      password: formValue[REGISTER_FORM_CONTROLS.PASSWORD], // password
      profile, // profile
    };

    this.store.dispatch(LoadingActions.showLoading()); // show loading
    this.store.dispatch(AuthActions.register({ data: registerData })); // dispatch register action
  }

  // On toggle password visibility
  togglePasswordVisibility(): void {
    this.hidePassword.update((value: boolean) => !value); // toggle password visibility
  }

  // On toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value: boolean) => !value); //toggle confirm password visibility
  }

  // get password strength class
  getPasswordStrengthClass(): string {
    const strength: PasswordStrength = this.passwordStrength(); // get password strength
    return `register__strength--${strength}`; // return password strength class
  }

  // Get password strength text
  getPasswordStrengthText(): string {
    const strength: PasswordStrength = this.passwordStrength(); // get password strength
    switch (
      strength // switch password strength
    ) {
      case PasswordStrength.WEAK:
        return MESSAGES.PASSWORD_WEAK; // return password strength text
      case PasswordStrength.MEDIUM:
        return MESSAGES.PASSWORD_MEDIUM; // return password strength text
      case PasswordStrength.STRONG:
        return MESSAGES.PASSWORD_STRONG; // return password strength text
      default:
        return ''; // return empty string
    }
  }

  // Get birth date error message
  getBirthDateErrorMessage(): string {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.BIRTH_DATE); // Get birth date control from register form
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('invalidDate')) {
      return MESSAGES.INVALID_DATE; // return invalid date error message
    }
    if (control.hasError('futureDate')) {
      return MESSAGES.INVALID_DATE_FUTURE; // return invalid date future error message
    }
    if (control.hasError('minAge') || control.hasError('maxAge')) {
      return MESSAGES.INVALID_DATE_AGE; // return invalid date age error message
    }

    return '';
  }

  // Get first name required error
  get hasFirstNameRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.FIRST_NAME);
    return control ? control.hasError('required') && control.touched : false; // return first name required error
  }

  // Get last name required error
  get hasLastNameRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.LAST_NAME);
    return control ? control.hasError('required') && control.touched : false; // return last name required error
  }

  // Get email required error
  get hasEmailRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    return control ? control.hasError('required') && control.touched : false; // return email required error
  }

  // Get email format error
  get hasEmailFormatError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    return control ? control.hasError('email') && control.touched : false; // return email format error
  }

  // Get email typo error (common typos like gmial.com -> gmail.com)
  get hasEmailTypoError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    return control ? !!control.getError('emailTypo')?.suggested && control.touched : false;
  }

  get emailTypoSuggestion(): string {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    return control?.getError('emailTypo')?.suggested ?? '';
  }

  // Get password required error
  get hasPasswordRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    return control ? control.hasError('required') && control.touched : false; // return password required error
  }

  // Get password validation error
  get hasPasswordValidationError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    return control
      ? control.hasError('minLength') ||
          control.hasError('uppercase') ||
          control.hasError('lowercase') ||
          control.hasError('digit')
      : false; // return password validation error
  }

  // Get password value
  get hasPasswordValue(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    return control ? !!control.value && control.dirty : false; // return password value
  }

  // Get confirm password required error
  get hasConfirmPasswordRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD);
    return control ? control.hasError('required') && control.touched : false; // return confirm password required error
  }

  // Get password mismatch error
  get hasPasswordMismatchError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD);
    return this.registerForm.hasError('passwordMismatch') && (control ? control.touched : false); // return password mismatch error
  }

  // Get birth date error
  get hasBirthDateError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.BIRTH_DATE);
    return control
      ? control.invalid && (control.touched || control.dirty) && !!this.getBirthDateErrorMessage() // return birth date error
      : false;
  }

  // Get phone number error
  get hasPhoneNumberError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PHONE_NUMBER);
    return control ? control.hasError('invalidPhone') && control.touched : false;
  }

  // Get terms required error
  get hasTermsRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.TERMS);
    return control ? control.hasError('required') && control.touched : false; // return terms required error
  }
}
