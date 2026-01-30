import { Injectable, signal, inject } from '@angular/core';
import { ToastType } from '@core/enums/toast-type.enum';
import { Timeouts } from '@core/enums/timeouts.enum';
import { ToastMessage } from '@core/models/toast.model';
import { UtilService } from '@core/services/util/util.service';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  private readonly utilService = inject(UtilService);

  private static readonly DEFAULT_DURATIONS: Record<ToastType, number> = {
    [ToastType.SUCCESS]: Timeouts.TOAST_SUCCESS_DURATION,
    [ToastType.ERROR]: Timeouts.TOAST_ERROR_DURATION,
    [ToastType.WARNING]: Timeouts.TOAST_WARNING_DURATION,
    [ToastType.INFO]: Timeouts.TOAST_INFO_DEFAULT_DURATION,
  };

  messages = signal<ToastMessage[]>([]);

  showSuccess(message: string, duration?: number): void {
    this.addMessage(message, ToastType.SUCCESS, duration);
  }

  showError(message: string, duration?: number): void {
    this.addMessage(message, ToastType.ERROR, duration);
  }

  showInfo(message: string, duration?: number, actionUrl?: string, actionLabel?: string): void {
    this.addMessage(message, ToastType.INFO, duration, actionUrl, actionLabel);
  }

  showWarning(message: string, duration?: number): void {
    this.addMessage(message, ToastType.WARNING, duration);
  }

  private addMessage(
    message: string,
    type: ToastType,
    duration?: number,
    actionUrl?: string,
    actionLabel?: string,
  ): void {
    const resolvedDuration = duration ?? ToastNotificationService.DEFAULT_DURATIONS[type];
    const id: string = this.utilService.generateId();
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: resolvedDuration,
      actionUrl,
      actionLabel,
    };

    this.messages.update((messages: ToastMessage[]) => [...messages, toast]);
    const shouldAutoDismiss: boolean = resolvedDuration > 0;
    if (shouldAutoDismiss) {
      setTimeout(() => this.removeMessage(id), resolvedDuration);
    }
  }

  removeMessage(id: string): void {
    this.messages.update((messages: ToastMessage[]) =>
      messages.filter((msg: ToastMessage) => msg.id !== id),
    );
  }

  clear(): void {
    this.messages.set([]);
  }
}
