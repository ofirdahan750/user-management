import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
  signal,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { selectUser } from '@core/store/auth/auth.selectors';
import { FormService } from '@core/services/form.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { EmailHelperService } from '@core/services/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { Timeouts } from '@core/enums/timeouts.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { ForgotPasswordFormValue } from '@core/types/form.types';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { BackLinkComponent } from '@shared/ui/links/back-link/back-link.component';
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
    MatButtonModule,
    SubmitButtonComponent,
    BackLinkComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly icons = ICONS;
  readonly MaterialColor = MaterialColor;

  private formService: FormService = inject(FormService); // form service
  private router: Router = inject(Router); // router service
  private store: Store = inject(Store); // store service
  private actions$: Actions = inject(Actions); // actions service
  private toastService: ToastNotificationService = inject(ToastNotificationService); // toast notification service
  private emailHelper: EmailHelperService = inject(EmailHelperService); // email helper service
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef); // change detector service

  forgotPasswordForm: FormGroup = this.formService.createForgotPasswordForm() || ({} as FormGroup); // forgot password form

  isLoading: WritableSignal<boolean> = signal(false);
  isSuccess = signal<boolean>(false);
  resetToken = signal<string>('');
  countdown = signal<number>(0);
  canResend = signal<boolean>(false);

  private countdownSubscription: Subscription = new Subscription(); // countdown subscription

  ngOnInit(): void {
    // Pre-fill email from temporary storage (one-time use, cleared automatically)
    let email = this.emailHelper.getAndClearTemporaryEmail();

    // If no email from temporary storage, try to get from current user if authenticated
    if (!email) {
      this.store
        .select(selectUser)
        .pipe(take(1))
        .subscribe((user) => {
          if (user && user.email) {
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

  // Getters for form controls to avoid optional chaining in template
  get emailControl(): FormControl {
    return this.forgotPasswordForm.get('email') as FormControl;
  }

  get hasEmailRequiredError(): boolean {
    const control = this.emailControl;
    return control.hasError('required') && control.touched;
  }

  get hasEmailFormatError(): boolean {
    const control = this.emailControl;
    return control.hasError('email') && control.touched;
  }

  ngOnDestroy(): void {
    this.countdownSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.forgotPasswordForm)) {
      return;
    }

    const formValue = this.forgotPasswordForm.value as ForgotPasswordFormValue;
    this.isLoading.set(true);
    this.store.dispatch(AuthActions.requestPasswordReset({ email: formValue.email }));

    // Listen for the result
    this.actions$
      .pipe(
        ofType(AuthActions.requestPasswordResetSuccess, AuthActions.requestPasswordResetFailure),
        take(1),
      )
      .subscribe((action) => {
        if (action.type === '[Auth] Request Password Reset Success') {
          const successAction = action as ReturnType<
            typeof AuthActions.requestPasswordResetSuccess
          >;
          // Only show success screen if we have a resetToken
          if (successAction.resetToken && successAction.resetToken !== '') {
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
    this.countdownSubscription.unsubscribe();

    this.canResend.set(false);
    this.countdown.set(Timeouts.RESEND_TIMEOUT_SECONDS);

    this.countdownSubscription = interval(Timeouts.COUNTDOWN_INTERVAL).subscribe(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
        this.cdr.markForCheck();
      } else {
        this.canResend.set(true);
        this.countdownSubscription.unsubscribe();
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
        queryParams: { token },
      });
      return this.router.serializeUrl(urlTree);
    }
    return '';
  }

  copyResetLink(): void {
    const token = this.resetToken();
    if (token && navigator.clipboard) {
      const urlTree = this.router.createUrlTree([Routes.RESET_PASSWORD], {
        queryParams: { token },
      });
      const fullUrl = `${window.location.origin}${this.router.serializeUrl(urlTree)}`;
      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          this.toastService.showSuccess(MESSAGES.RESET_LINK_COPIED);
        })
        .catch(() => {
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
        queryParams: { token },
      });
    }
  }
}
