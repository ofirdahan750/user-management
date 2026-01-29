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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { FormService } from '@core/services/form.service';
import { EmailHelperService } from '@core/services/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { RegisterFormValue } from '@core/types/form.types';
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
  private router: Router = inject(Router); // router
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

  private setupPasswordStrengthListener(): void {
    const passwordControl: FormControl = this.registerForm.get(
      REGISTER_FORM_CONTROLS.PASSWORD,
    ) as FormControl;
    if (passwordControl) {
      passwordControl.valueChanges.subscribe((password) => {
        if (password) {
          this.passwordStrength.set(getPasswordStrength(password));
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.registerForm)) {
      return;
    }

    const formValue = this.registerForm.value as RegisterFormValue;

    const profile: {
      firstName: string;
      lastName: string;
      birthDate?: string;
      phoneNumber?: string;
    } = {
      firstName: formValue[REGISTER_FORM_CONTROLS.FIRST_NAME],
      lastName: formValue[REGISTER_FORM_CONTROLS.LAST_NAME],
    };

    const birthDate = formValue[REGISTER_FORM_CONTROLS.BIRTH_DATE];
    if (birthDate) {
      profile.birthDate = new Date(birthDate).toISOString();
    }

    const phoneNumber = formValue[REGISTER_FORM_CONTROLS.PHONE_NUMBER];
    if (phoneNumber) {
      profile.phoneNumber = phoneNumber;
    }

    const registerData = {
      email: formValue[REGISTER_FORM_CONTROLS.EMAIL],
      password: formValue[REGISTER_FORM_CONTROLS.PASSWORD],
      profile,
    };

    this.store.dispatch(LoadingActions.showLoading());
    this.store.dispatch(AuthActions.register({ data: registerData }));
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value: boolean) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value: boolean) => !value);
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
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.BIRTH_DATE);
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

  get hasFirstNameRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.FIRST_NAME);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasLastNameRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.LAST_NAME);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasEmailRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasEmailFormatError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.EMAIL);
    return control ? control.hasError('email') && control.touched : false;
  }

  get hasPasswordRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasPasswordValidationError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    return control
      ? control.hasError('minLength') ||
          control.hasError('uppercase') ||
          control.hasError('lowercase') ||
          control.hasError('digit')
      : false;
  }

  get hasPasswordValue(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PASSWORD);
    return control ? !!control.value && control.dirty : false;
  }

  get hasConfirmPasswordRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasPasswordMismatchError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.CONFIRM_PASSWORD);
    return this.registerForm.hasError('passwordMismatch') && (control ? control.touched : false);
  }

  get hasBirthDateError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.BIRTH_DATE);
    return control
      ? control.invalid && (control.touched || control.dirty) && !!this.getBirthDateErrorMessage()
      : false;
  }

  get hasPhoneNumberError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.PHONE_NUMBER);
    return control ? control.hasError('invalidPhone') && control.touched : false;
  }

  get hasTermsRequiredError(): boolean {
    const control = this.registerForm.get(REGISTER_FORM_CONTROLS.TERMS);
    return control ? control.hasError('required') && control.touched : false;
  }
}
