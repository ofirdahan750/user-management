// Angular Core
import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// RxJS
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// NgRx
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { selectUser } from '@core/store/auth/auth.selectors';

// Services
import { FormService } from '@core/services/form.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { EmailHelperService } from '@core/services/email-helper.service';

// Enums
import { Routes } from '@core/enums/routes.enum';
import { Timeouts } from '@core/enums/timeouts.enum';

// Types
import { ForgotPasswordFormValue } from '@core/types/form.types';

// Constants
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';

// Components
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { BackLinkComponent } from '@shared/ui/links/back-link/back-link.component';

// Actions
import * as AuthActions from '@core/store/auth/auth.actions';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    SubmitButtonComponent,
    BackLinkComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private formService = inject(FormService);
  private router = inject(Router);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private toastService = inject(ToastNotificationService);
  private emailHelper = inject(EmailHelperService);
  private cdr = inject(ChangeDetectorRef);

  public forgotPasswordForm: FormGroup;
  public isLoading = signal<boolean>(false);
  public isSuccess = signal<boolean>(false);
  public resetToken = signal<string>('');
  public countdown = signal<number>(0);
  public canResend = signal<boolean>(false);
  
  private countdownSubscription?: Subscription;

  public readonly labels = LABELS;
  public readonly routes = Routes;
  public readonly MESSAGES = MESSAGES;
  public readonly icons = ICONS;

  constructor() {
    this.forgotPasswordForm = this.formService.createForgotPasswordForm();
  }

  ngOnInit(): void {
    // Pre-fill email from temporary storage (one-time use, cleared automatically)
    let email = this.emailHelper.getAndClearTemporaryEmail();
    
    // If no email from temporary storage, try to get from current user if authenticated
    if (!email) {
      this.store.select(selectUser).pipe(take(1)).subscribe(user => {
        if (user?.email) {
          email = user.email;
          this.forgotPasswordForm.patchValue({ email });
          this.cdr.markForCheck();
        }
      });
    } else {
      this.forgotPasswordForm.patchValue({ email });
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.forgotPasswordForm)) {
      return;
    }

    const formValue = this.forgotPasswordForm.value as ForgotPasswordFormValue;
    this.isLoading.set(true);
    this.store.dispatch(AuthActions.requestPasswordReset({ email: formValue.email }));
    
    // Listen for the result
    this.actions$.pipe(
      ofType(AuthActions.requestPasswordResetSuccess, AuthActions.requestPasswordResetFailure),
      take(1)
    ).subscribe((action) => {
      if (action.type === '[Auth] Request Password Reset Success') {
        const successAction = action as ReturnType<typeof AuthActions.requestPasswordResetSuccess>;
        // Only show success screen if we have a resetToken
        if (successAction.resetToken) {
          this.resetToken.set(successAction.resetToken);
          this.isSuccess.set(true);
          this.isLoading.set(false);
          this.startCountdown();
          this.cdr.markForCheck();
        } else {
          // No resetToken means email doesn't exist - treat as failure
          this.isSuccess.set(false);
          this.isLoading.set(false);
          this.toastService.showError(MESSAGES.USER_NOT_FOUND);
          this.cdr.markForCheck();
        }
      } else {
        // Handle failure - keep form visible and show error
        this.isSuccess.set(false);
        this.isLoading.set(false);
        // Error toast is already shown by the effect
        this.cdr.markForCheck();
      }
    });
  }

  startCountdown(): void {
    // Stop existing countdown if any
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    this.canResend.set(false);
    this.countdown.set(Timeouts.RESEND_TIMEOUT_SECONDS);

    this.countdownSubscription = interval(Timeouts.COUNTDOWN_INTERVAL).subscribe(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
        this.cdr.markForCheck();
      } else {
        this.canResend.set(true);
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
        this.cdr.markForCheck();
      }
    });
  }

  resendEmail(): void {
    if (this.canResend()) {
      this.onSubmit();
    }
  }

  getResetPasswordUrl(): string {
    const token = this.resetToken();
    if (token) {
      // Use Router to create proper URL with query params
      const urlTree = this.router.createUrlTree([Routes.RESET_PASSWORD], {
        queryParams: { token }
      });
      return this.router.serializeUrl(urlTree);
    }
    return '';
  }

  copyResetLink(): void {
    const token = this.resetToken();
    if (token && navigator.clipboard) {
      const urlTree = this.router.createUrlTree([Routes.RESET_PASSWORD], {
        queryParams: { token }
      });
      const fullUrl = `${window.location.origin}${this.router.serializeUrl(urlTree)}`;
      navigator.clipboard.writeText(fullUrl).then(() => {
        this.toastService.showSuccess(MESSAGES.RESET_LINK_COPIED);
      }).catch(() => {
        // Fallback if clipboard API fails
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.toastService.showSuccess(MESSAGES.RESET_LINK_COPIED);
        } catch {
          // Ignore errors
        }
        document.body.removeChild(textArea);
      });
    }
  }

  navigateToResetPassword(): void {
    const token = this.resetToken();
    if (token) {
      this.router.navigate([Routes.RESET_PASSWORD], {
        queryParams: { token }
      });
    }
  }
}
