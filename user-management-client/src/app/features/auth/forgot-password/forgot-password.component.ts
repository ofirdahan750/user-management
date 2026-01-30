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
import { FormService } from '@core/services/form/form.service';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { EmailHelperService } from '@core/services/email-helper/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { Timeouts } from '@core/enums/timeouts.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { ForgotPasswordFormValue } from '@core/types/form.types';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { FORGOT_PASSWORD_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { BackToLinkComponent } from '@shared/ui/links/back-to-link/back-to-link.component';
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
    BackToLinkComponent,
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
  readonly formControls = FORGOT_PASSWORD_FORM_CONTROLS;

  private formService: FormService = inject(FormService); // form service
  private router: Router = inject(Router); // router service
  private store: Store = inject(Store); // store service
  private actions$: Actions = inject(Actions); // actions service
  private toastService: ToastNotificationService = inject(ToastNotificationService); // toast notification service
  private emailHelper: EmailHelperService = inject(EmailHelperService); // email helper service
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef); // change detector service

  forgotPasswordForm: FormGroup = this.formService.createForgotPasswordForm() || ({} as FormGroup); // forgot password form

  isLoading: WritableSignal<boolean> = signal(false); // is loading signal (true when loading, false when not loading)
  isSuccess = signal<boolean>(false); // is success signal (true when success, false when not success)
  resetToken = signal<string>(''); // reset token signal - empty string when no reset token
  countdown = signal<number>(0); // countdown signal - 0 when no countdown
  canResend = signal<boolean>(false); // can resend signal (true when can resend, false when cannot resend)

  private countdownSubscription: Subscription = new Subscription(); // countdown subscription

  ngOnInit(): void {
    this.prefillEmail();
  }

  // Prefill email from temporary storage or current user if authenticated
  private prefillEmail(): void {
    // get and clear temporary email from email helper service
    const email: string = this.emailHelper.getAndClearTemporaryEmail(); // get and clear temporary email from email helper service
    // if no email, get from current user if authenticated else patch value to form
    if (!email) {
      this.store
        .select(selectUser)
        .pipe(take(1))
        .subscribe((user) => {
          if (user?.email) {
            this.forgotPasswordForm.patchValue({
              [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: user.email,
            });
            this.cdr.markForCheck();
          }
        });
    } else {
      this.forgotPasswordForm.patchValue({
        [FORGOT_PASSWORD_FORM_CONTROLS.EMAIL]: email,
      });
      this.cdr.markForCheck();
    }
  }

  // Getters for form controls to avoid optional chaining in template
  get hasEmailRequiredError(): boolean {
    const control = this.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL); // get email control from form
    return (control?.hasError('required') && control?.touched) ?? false; // return true if email is required and touched
  }

  // Getter for email format error to avoid optional chaining in template
  get hasEmailTypoError(): boolean {
    const control = this.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL);
    return control ? !!control.getError('emailTypo')?.suggested && control.touched : false;
  }

  get emailTypoSuggestion(): string {
    const control = this.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL);
    return control?.getError('emailTypo')?.suggested ?? '';
  }

  get hasEmailFormatError(): boolean {
    const control = this.forgotPasswordForm.get(FORGOT_PASSWORD_FORM_CONTROLS.EMAIL); // get email control from form
    return (control?.hasError('email') && control?.touched) ?? false; // return true if email is invalid and touched
  }

  ngOnDestroy(): void {
    this.countdownSubscription.unsubscribe(); // unsubscribe from countdown subscription
  }

  // On submit forgot password form
  onSubmit(): void {
    if (!this.formService.validateForm(this.forgotPasswordForm)) return; // if form is invalid, return
    const formValue = this.forgotPasswordForm.value as ForgotPasswordFormValue; // get form values
    this.isLoading.set(true); // set is loading to true
    this.store.dispatch(AuthActions.requestPasswordReset({ email: formValue.email })); // dispatch request password reset action

    // Listen for the result
    this.actions$
      .pipe(
        // listen for request password reset success or failure actions
        ofType(AuthActions.requestPasswordResetSuccess, AuthActions.requestPasswordResetFailure),
        take(1),
      )
      .subscribe((action) => {
        if (action.type === AuthActions.requestPasswordResetSuccess.type) {
          // if request password reset success action
          const successAction = // get success action
            action as ReturnType<typeof AuthActions.requestPasswordResetSuccess>; // cast action to RequestPasswordResetSuccessAction
          // Only show success screen if we have a resetToken
          if (successAction.resetToken && successAction.resetToken !== '') {
            this.resetToken.set(successAction.resetToken); // set reset token
            this.isSuccess.set(true); // set is success to true
            this.isLoading.set(false); // set is loading to false
            this.startCountdown(); // start countdown to resend email after 60 seconds
            this.cdr.markForCheck(); // mark for check to update the view
          } else {
            // No resetToken means email doesn't exist - treat as failure
            this.isSuccess.set(false); // set is success to false
            this.isLoading.set(false); // set is loading to false
            this.toastService.showError(MESSAGES.USER_NOT_FOUND); // show error toast
            this.cdr.markForCheck(); // mark for check to update the view
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
    // Stop existing countdown if any else unsubscribe from countdown subscription
    this.countdownSubscription.unsubscribe();

    this.canResend.set(false); // set can resend to false initially
    this.countdown.set(Timeouts.RESEND_TIMEOUT_SECONDS); // set countdown to 60 seconds initially

    this.countdownSubscription = interval(Timeouts.COUNTDOWN_INTERVAL).subscribe(() => {
      const current = this.countdown(); // get current countdown value
      if (current > 0) {
        this.countdown.set(current - 1); // decrement countdown value by 1 second
        this.cdr.markForCheck(); // mark for check to update the view
      } else {
        this.canResend.set(true); // set can resend to true after countdown reaches 0
        this.countdownSubscription.unsubscribe(); // unsubscribe from countdown subscription else it will keep running indefinitely
        this.cdr.markForCheck(); // mark for check to update the view after countdown reaches 0
      }
    });
  }

  resendEmail(): void {
    //submit button to resend email
    if (this.canResend()) {
      // if can resend is true
      this.onSubmit(); // submit forgot password form
    }
  }

  getResetPasswordUrl(): string {
    //get reset password url with token from reset token
    const token = this.resetToken(); // get reset token from reset token signal
    if (token) {
      // if token is not empty
      // Use Router to create proper URL with query params
      const urlTree = this.router.createUrlTree([Routes.RESET_PASSWORD], {
        queryParams: { token },
      });
      return this.router.serializeUrl(urlTree); // return serialized url with token
    } else {
      // if token is empty, return empty string
      return '';
    }
  }

  copyResetLink(): void {
    const fullUrl = this.getResetPasswordUrl(); // get reset password url with token from reset token
    if (fullUrl) {
      // if full url is not empty
      this.emailHelper.copyTextToClipboard(
        // copy text to clipboard
        `${window.location.origin}${fullUrl}`, // full url with origin and full url
        MESSAGES.RESET_LINK_COPIED, // reset link copied message
      );
    }
  }

  navigateToResetPassword(): void {
    const token = this.resetToken(); // get reset token from reset token signal
    if (token) {
      // if token is not empty
      this.router.navigate([Routes.RESET_PASSWORD], {
        // navigate to reset password route with token
        queryParams: { token }, // query params with token as query parameter
      });
    }
  }
}
