import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth/auth.service';
import { FormService } from '@core/services/form/form.service';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { LABELS } from '@core/constants/labels.constants';
import { CHANGE_PASSWORD_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ApiErrorService } from '@core/services/api-error/api-error.service';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { BackToLinkComponent } from '@shared/ui/links/back-to-link/back-to-link.component';

@Component({
  selector: 'app-change-password',
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
    BackToLinkComponent,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;
  readonly formControls = CHANGE_PASSWORD_FORM_CONTROLS;

  private formService = inject(FormService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastNotificationService);
  private apiErrorService = inject(ApiErrorService);

  changePasswordForm: FormGroup = this.formService.createChangePasswordForm() || ({} as FormGroup);
  isLoading: WritableSignal<boolean> = signal(false); // is loading signal (true when loading, false when not loading)
  hideCurrentPassword = signal<boolean>(true); // hide current password signal (true when hiding, false when showing)
  hidePassword = signal<boolean>(true); // hide password signal (true when hiding, false when showing)
  hideConfirmPassword = signal<boolean>(true); // hide confirm password signal (true when hiding, false when showing)

  onSubmit(): void {
    if (!this.formService.validateForm(this.changePasswordForm)) return; // if form is invalid, return
    this.isLoading.set(true); // set is loading signal to true
    const currentPassword: string =
      // current password value from form value
      this.changePasswordForm.value[CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD];
    // password value from form value
    const password: string = this.changePasswordForm.value[CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD];

    // change password
    this.authService.changePassword(currentPassword, password).subscribe({
      next: () => {
        this.toastService.showSuccess(MESSAGES.PASSWORD_CHANGE_SUCCESS); // show success toast
        this.router.navigate([Routes.PROFILE]); // navigate to profile page
      },
      error: (error) => {
        console.error('Change password error:', error); // log error
        const errorMessage: string = this.apiErrorService.getMessageFromHttpError(
          error,
          MESSAGES.PASSWORD_CHANGE_ERROR,
        );
        this.toastService.showError(errorMessage); // show error toast 
        this.isLoading.set(false); // set is loading signal to false
      },
    });
  }

  // toggle current password visibilit
  toggleCurrentPasswordVisibility(): void {
    this.hideCurrentPassword.update((value) => !value);
  }

  // toggle password visibility of confirm password
  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  // toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }

  // get current password required error
  get hasCurrentPasswordRequiredError(): boolean {
    const control = this.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.CURRENT_PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  // get password required error
  get hasPasswordRequiredError(): boolean {
    const control = this.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  // get password validation error
  get hasPasswordValidationError(): boolean {
    const control = this.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.PASSWORD);
    return control
      ? control.hasError('minLength') ||
          control.hasError('uppercase') ||
          control.hasError('lowercase') ||
          control.hasError('digit')
      : false;
  }

  // get confirm password required error
  get hasConfirmPasswordRequiredError(): boolean {
    const control = this.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD);
    return control ? control.hasError('required') && control.touched : false;
  }

  // get password mismatch error
  get hasPasswordMismatchError(): boolean {
    const control = this.changePasswordForm.get(CHANGE_PASSWORD_FORM_CONTROLS.CONFIRM_PASSWORD);
    return (
      this.changePasswordForm.hasError('passwordMismatch') && (control ? control.touched : false)
    );
  }
}
