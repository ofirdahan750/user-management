import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { Routes } from '@core/enums/routes.enum';
import { Timeouts, CssValues } from '@core/enums/timeouts.enum';
import { MESSAGES } from '@core/constants/messages.constants';

@Injectable({
  providedIn: 'root'
})
export class EmailHelperService {
  private router = inject(Router);
  private toastService = inject(ToastNotificationService);
  
  // Temporary email storage for navigation (cleared after use)
  private temporaryEmail: string  = '';

  /**
   * Shows verification link after registration
   * @param token Verification token
   * @param email User email
   */
  showVerificationLink(token: string, email: string): void {
    const verificationUrl = `${window.location.origin}${Routes.VERIFY}?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Log to console for development
    console.log(`${MESSAGES.VERIFICATION_LINK_FOR} ${email}:`);
    console.log(`${MESSAGES.TOKEN_LABEL} ${token}`);
    console.log(`${MESSAGES.FULL_URL_LABEL} ${verificationUrl}`);
    
    // Show toast with clickable link
    this.toastService.showInfo(
      MESSAGES.VERIFICATION_EMAIL_SENT,
      Timeouts.TOAST_INFO_DURATION,
      verificationUrl,
      MESSAGES.VERIFY_NOW
    );
    
    // Copy link to clipboard automatically
    this.copyToClipboard(verificationUrl, MESSAGES.VERIFICATION_LINK_COPIED);
  }

  /**
   * Shows password reset link after forgot password request
   * @param token Reset token
   */
  showResetPasswordLink(token: string): void {
    const resetUrl = `${window.location.origin}${Routes.RESET_PASSWORD}?token=${token}`;
    
    // Log to console for development
    console.log(MESSAGES.PASSWORD_RESET_LINK);
    console.log(`${MESSAGES.TOKEN_LABEL} ${token}`);
    console.log(`${MESSAGES.FULL_URL_LABEL} ${resetUrl}`);
    
    // Show toast with clickable link
    this.toastService.showInfo(
      MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      Timeouts.TOAST_INFO_DURATION,
      resetUrl,
      MESSAGES.RESET_PASSWORD_BUTTON
    );
    
    // Copy link to clipboard automatically
    this.copyToClipboard(resetUrl, MESSAGES.RESET_LINK_COPIED);
  }

  /**
   * Copies text to clipboard
   * @param text Text to copy
   * @param successMessage Success message to show
   */
  private copyToClipboard(text: string, successMessage: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.toastService.showSuccess(successMessage, Timeouts.TOAST_SUCCESS_DURATION);
      }).catch(() => {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(text, successMessage);
      });
    } else {
      this.fallbackCopyToClipboard(text, successMessage);
    }
  }

  /**
   * Fallback method to copy text to clipboard for older browsers
   * @param text Text to copy
   * @param successMessage Success message to show
   */
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

  /**
   * Navigates to verification page with token and email
   * @param token Verification token
   * @param email User email
   */
  navigateToVerification(token: string, email: string): void {
    this.router.navigate([Routes.VERIFY], {
      queryParams: { token, email }
    });
  }

  /**
   * Navigates to reset password page with token
   * @param token Reset token
   */
  navigateToResetPassword(token: string): void {
    this.router.navigate([Routes.RESET_PASSWORD], {
      queryParams: { token }
    });
  }

  /**
   * Sets temporary email for navigation (cleared after retrieval)
   * @param email Email to store temporarily
   */
  setTemporaryEmail(email: string = ''): void {
    this.temporaryEmail = email;
  }

  /**
   * Gets and clears temporary email (one-time use)
   * @returns Email if available, null otherwise
   */
  getAndClearTemporaryEmail(): string | null {
    const email: string = this.temporaryEmail;
    this.temporaryEmail = ''; // Clear immediately after retrieval
    return email;
  }
}
