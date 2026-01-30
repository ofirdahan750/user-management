import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { Timeouts, CssValues } from '@core/enums/timeouts.enum';
import { MESSAGES } from '@core/constants/messages.constants';

@Injectable({
  providedIn: 'root',
})
export class EmailHelperService {
  private router: Router = inject(Router);
  private toastService: ToastNotificationService = inject(ToastNotificationService);

  private temporaryEmail: string = '';

  showVerificationLink(token: string, email: string): void {
    const verificationUrl = `${window.location.origin}${Routes.VERIFY}?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`${MESSAGES.VERIFICATION_LINK_FOR} ${email}:`);
    console.log(`${MESSAGES.TOKEN_LABEL} ${token}`);
    console.log(`${MESSAGES.FULL_URL_LABEL} ${verificationUrl}`);

    this.toastService.showInfo(
      MESSAGES.VERIFICATION_EMAIL_SENT,
      Timeouts.TOAST_INFO_DURATION,
      verificationUrl,
      MESSAGES.VERIFY_NOW,
    );

    this.copyToClipboard(verificationUrl, MESSAGES.VERIFICATION_LINK_COPIED);
  }

  showResetPasswordLink(token: string): void {
    const resetUrl = `${window.location.origin}${Routes.RESET_PASSWORD}?token=${token}`;

    console.log(MESSAGES.PASSWORD_RESET_LINK);
    console.log(`${MESSAGES.TOKEN_LABEL} ${token}`);
    console.log(`${MESSAGES.FULL_URL_LABEL} ${resetUrl}`);

    this.toastService.showInfo(
      MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      Timeouts.TOAST_INFO_DURATION,
      resetUrl,
      MESSAGES.RESET_PASSWORD_BUTTON,
    );

    this.copyToClipboard(resetUrl, MESSAGES.RESET_LINK_COPIED);
  }

  copyTextToClipboard(text: string, successMessage: string): void {
    this.copyToClipboard(text, successMessage);
  }

  private copyToClipboard(text: string, successMessage: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.toastService.showSuccess(successMessage, Timeouts.TOAST_SUCCESS_DURATION);
        })
        .catch(() => {
          this.fallbackCopyToClipboard(text, successMessage);
        });
    } else {
      this.fallbackCopyToClipboard(text, successMessage);
    }
  }

  private fallbackCopyToClipboard(text: string, successMessage: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = CssValues.HIDDEN_POSITION_LEFT;
    textArea.style.top = CssValues.HIDDEN_POSITION_TOP;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.toastService.showSuccess(successMessage, Timeouts.TOAST_SUCCESS_DURATION);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR_OCCURRED;
      console.error(MESSAGES.FAILED_TO_COPY_TEXT, errorMessage, err);
    }

    document.body.removeChild(textArea);
  }

  navigateToVerification(token: string, email: string): void {
    this.router.navigate([Routes.VERIFY], {
      queryParams: { token, email },
    });
  }

  navigateToResetPassword(token: string): void {
    this.router.navigate([Routes.RESET_PASSWORD], {
      queryParams: { token },
    });
  }

  setTemporaryEmail(email: string = ''): void {
    this.temporaryEmail = email;
  }

  getAndClearTemporaryEmail(): string {
    const email: string = this.temporaryEmail;
    this.temporaryEmail = '';
    return email || '';
  }
}
