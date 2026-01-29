import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  WritableSignal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { Timeouts } from '@core/enums/timeouts.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { LinkButtonComponent } from '@shared/ui/buttons/link-button/link-button.component';
import { BackToLinkComponent } from '@shared/ui/links/back-to-link/back-to-link.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LinkButtonComponent,
    BackToLinkComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyComponent implements OnInit {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly icons = ICONS;
  readonly VerificationStatus = VerificationStatus;
  readonly MaterialColor = MaterialColor;

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastNotificationService = inject(ToastNotificationService);

  status: WritableSignal<VerificationStatus> = signal<VerificationStatus>(
    VerificationStatus.PENDING,
  ); // status of verification
  countdown: WritableSignal<number> = signal<number>(5); // countdown of the verification
  email: WritableSignal<string> = signal<string>(''); // email of the user
  token: WritableSignal<string> = signal<string>(''); // token of the user
  isVerifying: WritableSignal<boolean> = signal<boolean>(false); // is verifying the email

  readonly verifyClickHandler = () => this.onVerifyClick(); // verify click handler
  readonly resendClickHandler = () => this.resendVerification(); // resend click handler

  constructor() {
    // effect() must run in injection context (constructor). Start countdown only when status becomes SUCCESS.
    effect(() => {
      if (this.status() !== VerificationStatus.SUCCESS) return; // if the status is not success, return
      const timer = setInterval(() => {
        this.countdown.update((value) => {
          if (value <= 1) {
            clearInterval(timer); // clear the interval
            this.router.navigate([Routes.LOGIN]); // navigate to the login page
            return 0; // return 0
          }
          return value - 1; // return the value - 1
        });
      }, Timeouts.COUNTDOWN_INTERVAL); // set the interval to the timeout (COUNTDOWN_INTERVAL)
      return () => clearInterval(timer); // return the function to clear the interval (cleanup)
    });
  }

  ngOnInit(): void {
    this.initializeFromRoute(); // initialize the email, token and status from the route
  }

  // initialize from route function to initialize the email, token and status from the route
  private initializeFromRoute(): void {
    const tokenParam: string = this.route.snapshot.queryParams['token'] || '';
    const emailParam: string = this.route.snapshot.queryParams['email'] || '';

    // if the token and email are present, set the email and token and status to loading and verify the email
    if (tokenParam && emailParam) {
      this.email.set(emailParam); // set the email
      this.token.set(tokenParam); // set the token
      this.status.set(VerificationStatus.LOADING); // set the status to loading
      this.verifyEmail(tokenParam, emailParam); // verify the email
    } else if (emailParam) {
      // if the email is present, set the email and status to pending
      this.email.set(emailParam); // set the email
      this.status.set(VerificationStatus.PENDING); // set the status to pending
    } else {
      // if the token and email are not present, set the status to error
      this.status.set(VerificationStatus.ERROR); // set the status to error
    }
  }

  verifyEmail(token: string, email: string): void {
    this.isVerifying.set(true); // set the is verifying to true
    this.authService.verifyEmail(token, email).subscribe({
      next: () => {
        this.isVerifying.set(false); // set the is verifying to false
        this.status.set(VerificationStatus.SUCCESS); // set the status to success
        this.toastService.showSuccess(MESSAGES.VERIFICATION_SUCCESS); // show the success message
      },
      error: () => {
        this.isVerifying.set(false); // set the is verifying to false
        this.status.set(VerificationStatus.ERROR); // set the status to error
        this.toastService.showError(MESSAGES.VERIFICATION_ERROR); // show the error message
      },
    });
  }
  onVerifyClick(): void {
    const token = this.token();
    const email = this.email();
    if (token && email) this.verifyEmail(token, email);
  }

  // on resend verification
  resendVerification(): void {
    const email = this.email(); // get the email
    if (!email) {
      return; // if the email is not present, return
    }

    this.authService.resendVerificationEmail(email).subscribe({
      next: (response) => {
        if (response && response.verificationToken) {
          this.token.set(response.verificationToken); // set the token
          this.status.set(VerificationStatus.PENDING); // set the status to pending
        } else {
          this.toastService.showSuccess(MESSAGES.RESEND_VERIFICATION_SUCCESS); // show the success message
        }
      },
      error: () => {
        this.toastService.showError(MESSAGES.ERROR); // show the error message
      },
    });
  }

  // get verification url function to get the verification url
  getVerificationUrl(): string {
    const token = this.token();
    const email = this.email();
    if (token && email) {
      return `${this.routes.VERIFY}?token=${token}&email=${encodeURIComponent(email)}`;
    }
    return '';
  }

  // copy verification link function to copy the verification link to the clipboard
  copyVerificationLink(): void {
    const url = this.getVerificationUrl(); // get the verification url
    if (url && navigator.clipboard) {
      // if the url is present and the clipboard is present
      navigator.clipboard.writeText(`${window.location.origin}${url}`).then(() => {
        // write the url to the clipboard
        this.toastService.showSuccess(MESSAGES.VERIFICATION_LINK_COPIED); // show the success message
      });
    }
  } // copy verification link function to copy the verification link to the clipboard
}
