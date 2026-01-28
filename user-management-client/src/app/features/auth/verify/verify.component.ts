import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@core/services/auth.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { LinkButtonComponent } from '@shared/ui/buttons/link-button/link-button.component';
import { BackLinkComponent } from '@shared/ui/links/back-link/back-link.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    LinkButtonComponent,
    BackLinkComponent,
    SubmitButtonComponent
  ],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastNotificationService);

  public status = signal<VerificationStatus>(VerificationStatus.LOADING);
  public countdown = signal<number>(5);
  public email = signal<string>('');
  public token = signal<string>('');

  public readonly labels = LABELS;
  public readonly routes = Routes;
  public readonly MESSAGES = MESSAGES;
  public readonly icons = ICONS;
  public readonly VerificationStatus = VerificationStatus;

  constructor() {
    effect(() => {
      if (this.status() === VerificationStatus.SUCCESS && this.countdown() > 0) {
        const timer = setInterval(() => {
          this.countdown.update(value => {
            if (value <= 1) {
              clearInterval(timer);
              this.router.navigate([Routes.LOGIN]);
              return 0;
            }
            return value - 1;
          });
        }, 1000);
      }
    });

    const tokenParam = this.route.snapshot.queryParams['token'];
    const emailParam = this.route.snapshot.queryParams['email'];

    if (tokenParam && emailParam) {
      // Has token - verify automatically
      this.email.set(emailParam);
      this.token.set(tokenParam);
      this.verifyEmail(tokenParam, emailParam);
    } else if (emailParam) {
      // Came from registration - show message with verification link
      this.email.set(emailParam);
      this.status.set(VerificationStatus.PENDING);
    } else {
      this.status.set(VerificationStatus.ERROR);
    }
  }

  verifyEmail(token: string, email: string): void {
    this.authService.verifyEmail(token, email).subscribe({
      next: () => {
        this.status.set(VerificationStatus.SUCCESS);
        this.toastService.showSuccess(MESSAGES.VERIFICATION_SUCCESS);
      },
      error: () => {
        this.status.set(VerificationStatus.ERROR);
        this.toastService.showError(MESSAGES.VERIFICATION_ERROR);
      }
    });
  }

  resendVerification(): void {
    const email = this.email();
    if (!email) {
      return;
    }

    this.authService.resendVerificationEmail(email).subscribe({
      next: (response) => {
        if (response && response.verificationToken) {
          this.token.set(response.verificationToken);
          this.status.set(VerificationStatus.PENDING);
        } else {
          this.toastService.showSuccess(MESSAGES.RESEND_VERIFICATION_SUCCESS);
        }
      },
      error: () => {
        this.toastService.showError(MESSAGES.ERROR);
      }
    });
  }

  getVerificationUrl(): string {
    const token = this.token();
    const email = this.email();
    if (token && email) {
      return `${this.routes.VERIFY}?token=${token}&email=${encodeURIComponent(email)}`;
    }
    return '';
  }

  copyVerificationLink(): void {
    const url = this.getVerificationUrl();
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${url}`).then(() => {
        this.toastService.showSuccess('Verification link copied to clipboard!');
      });
    }
  }
}
