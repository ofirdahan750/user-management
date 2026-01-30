import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal } from '@angular/core';
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
    SubmitButtonComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;

  private formService: FormService = inject(FormService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastNotificationService = inject(ToastNotificationService);

  resetPasswordForm!: FormGroup;
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);
  hideConfirmPassword = signal<boolean>(true);
  token = signal<string>('');


  constructor() {
    const tokenParam = this.route.snapshot.queryParams['token'];
    if (!tokenParam || typeof tokenParam !== 'string') {
      this.toastService.showError(MESSAGES.PASSWORD_RESET_ERROR);
      this.router.navigate([Routes.FORGOT_PASSWORD]);
      return;
    }

    this.token.set(tokenParam);
    this.resetPasswordForm = this.formService.createResetPasswordForm();
  }
  
  // Getters for form controls to avoid optional chaining in template
  get passwordControl() {
    return this.resetPasswordForm.get('password');
  }
  
  get confirmPasswordControl() {
    return this.resetPasswordForm.get('confirmPassword');
  }
  
  // Error checkers
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
    return this.resetPasswordForm.hasError('passwordMismatch') && (control ? control.touched : false);
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
    const password = this.resetPasswordForm.value.password;

    this.authService.resetPassword(token, password).subscribe({
      next: () => {
        this.toastService.showSuccess(MESSAGES.PASSWORD_RESET_SUCCESS);
        this.router.navigate([Routes.LOGIN]);
      },
      error: () => {
        this.toastService.showError(MESSAGES.PASSWORD_RESET_ERROR);
        this.isLoading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }
}
