import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';
import { FormService } from '@core/services/form.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { BackLinkComponent } from '@shared/ui/links/back-link/back-link.component';

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
    BackLinkComponent
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {
  private formService = inject(FormService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastNotificationService);

  changePasswordForm: FormGroup;
  isLoading = signal<boolean>(false);
  hideCurrentPassword = signal<boolean>(true);
  hidePassword = signal<boolean>(true);
  hideConfirmPassword = signal<boolean>(true);

  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;

  constructor() {
    this.changePasswordForm = this.formService.createChangePasswordForm();
  }
  
  // Getters for form controls
  get currentPasswordControl() {
    return this.changePasswordForm.get('currentPassword');
  }
  
  get passwordControl() {
    return this.changePasswordForm.get('password');
  }
  
  get confirmPasswordControl() {
    return this.changePasswordForm.get('confirmPassword');
  }
  
  // Error checkers
  get hasCurrentPasswordRequiredError(): boolean {
    const control = this.currentPasswordControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasPasswordRequiredError(): boolean {
    const control = this.passwordControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasPasswordValidationError(): boolean {
    const control = this.passwordControl;
    return control ? (control.hasError('minLength') || control.hasError('uppercase') || control.hasError('lowercase') || control.hasError('digit')) : false;
  }
  
  get hasConfirmPasswordRequiredError(): boolean {
    const control = this.confirmPasswordControl;
    return control ? control.hasError('required') && control.touched : false;
  }
  
  get hasPasswordMismatchError(): boolean {
    const control = this.confirmPasswordControl;
    return this.changePasswordForm.hasError('passwordMismatch') && (control ? control.touched : false);
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.changePasswordForm)) {
      return;
    }

    this.isLoading.set(true);
    const { currentPassword, password } = this.changePasswordForm.value;

    this.authService.changePassword(currentPassword, password).subscribe({
      next: () => {
        this.toastService.showSuccess(MESSAGES.PASSWORD_CHANGE_SUCCESS || 'Password changed successfully');
        this.router.navigate([Routes.PROFILE]);
      },
      error: (error) => {
        console.error('Change password error:', error);
        let errorMessage = MESSAGES.PASSWORD_CHANGE_ERROR || 'Failed to change password';
        
        if (error?.error?.errorMessage) {
          errorMessage = error.error.errorMessage;
        } else if (error?.error?.statusMessage) {
          errorMessage = error.error.statusMessage;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        this.toastService.showError(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.hideCurrentPassword.update(value => !value);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }
}
