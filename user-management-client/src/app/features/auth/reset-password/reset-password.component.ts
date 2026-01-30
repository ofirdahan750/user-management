import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth/auth.service';
import { FormService } from '@core/services/form/form.service';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { LABELS } from '@core/constants/labels.constants';
import { RESET_PASSWORD_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    IconButtonComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly formControls = RESET_PASSWORD_FORM_CONTROLS;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;

  private formService: FormService = inject(FormService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastNotificationService = inject(ToastNotificationService);

  resetPasswordForm: FormGroup = this.formService.createResetPasswordForm() || ({} as FormGroup); // reset password form
  isLoading: WritableSignal<boolean> = signal(false); // is loading signal (true when loading, false when not loading)
  hidePassword: WritableSignal<boolean> = signal(true); // hide password signal (true when hiding, false when showing)
  hideConfirmPassword: WritableSignal<boolean> = signal(true); // hide confirm password signal (true when hiding, false when showing)
  token: WritableSignal<string> = signal(''); // token signal (empty string when no token)

  ngOnInit(): void {
    this.initTokenFromRoute(); // initialize token from route
  }

  // initialize token from route for prefilling the form with the token
  private initTokenFromRoute(): void {
    const tokenParam: string = this.route.snapshot.queryParams['token'] || ''; // get token from route query params
    if (!tokenParam) {
      this.toastService.showError(MESSAGES.PASSWORD_RESET_ERROR); // show error toast of password reset error
      this.router.navigate([Routes.FORGOT_PASSWORD]); // navigate to forgot password page
      return;
    }
    this.token.set(tokenParam); // set token to token signal
  }

  get hasPasswordRequiredError(): boolean {
    const control = this.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasPasswordValidationError(): boolean {
    const control = this.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.PASSWORD);
    return control
      ? control.hasError('minLength') ||
          control.hasError('uppercase') ||
          control.hasError('lowercase') ||
          control.hasError('digit')
      : false;
  }

  get hasConfirmPasswordRequiredError(): boolean {
    const control = this.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  get hasPasswordMismatchError(): boolean {
    const control = this.resetPasswordForm.get(RESET_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD);
    return (
      this.resetPasswordForm.hasError('passwordMismatch') && (control ? control.touched : false)
    );
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.resetPasswordForm)) {
      return;
    }

    const token = this.token();
    if (!token || token === '') {
      return;
    }

    this.isLoading.set(true);
    const password = this.resetPasswordForm.value[RESET_PASSWORD_FORM_CONTROLS.PASSWORD];

    this.authService.resetPassword(token, password).subscribe({
      next: () => {
        this.toastService.showSuccess(MESSAGES.PASSWORD_RESET_SUCCESS);
        this.router.navigate([Routes.LOGIN]);
      },
      error: () => {
        this.toastService.showError(MESSAGES.PASSWORD_RESET_ERROR);
        this.isLoading.set(false);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }
}
