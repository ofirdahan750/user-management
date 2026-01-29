import { Injectable, signal, inject } from '@angular/core';
import { ToastType } from '@core/enums/toast-type.enum';
import { Timeouts } from '@core/enums/timeouts.enum';
import { ToastMessage } from '@core/models/toast.model';
import { UtilService } from '@core/services/util.service';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  private readonly utilService = inject(UtilService);

  // default durations for each toast type
  private static readonly DEFAULT_DURATIONS: Record<ToastType, number> = {
    [ToastType.SUCCESS]: Timeouts.TOAST_SUCCESS_DURATION, // success duration
    [ToastType.ERROR]: Timeouts.TOAST_ERROR_DURATION, // error duration
    [ToastType.WARNING]: Timeouts.TOAST_WARNING_DURATION, // warning duration
    [ToastType.INFO]: Timeouts.TOAST_INFO_DEFAULT_DURATION, // info duration
  };

  messages = signal<ToastMessage[]>([]); // messages to display

  showSuccess(message: string, duration?: number): void {
    // add success message
    this.addMessage(message, ToastType.SUCCESS, duration);
  }

  showError(message: string, duration?: number): void {
    // add error message
    this.addMessage(message, ToastType.ERROR, duration);
  }

  showInfo(message: string, duration?: number, actionUrl?: string, actionLabel?: string): void {
    // add info message
    this.addMessage(message, ToastType.INFO, duration, actionUrl, actionLabel);
  }

  showWarning(message: string, duration?: number): void {
    // add warning message
    this.addMessage(message, ToastType.WARNING, duration);
  }

  private addMessage(
    message: string, // message to display
    type: ToastType, // type of toast
    duration?: number, // duration of toast
    actionUrl?: string, // action url
    actionLabel?: string, // action label
  ): void {
    const resolvedDuration = duration ?? ToastNotificationService.DEFAULT_DURATIONS[type];
    const id: string = this.utilService.generateId(); // generate id
    const toast: ToastMessage = {
      id, // id of toast
      message, // message to display
      type, // type of toast
      duration: resolvedDuration, // duration of toast
      actionUrl, // action url
      actionLabel,
    };

    this.messages.update((messages: ToastMessage[]) => [...messages, toast]); // add toast to messages
    const shouldAutoDismiss: boolean = resolvedDuration > 0;
    if (shouldAutoDismiss) {
      // if duration is greater than 0
      setTimeout(() => this.removeMessage(id), resolvedDuration); // remove toast after duration
    }
  }

  removeMessage(id: string): void {
    // remove toast from messages
    this.messages.update((messages: ToastMessage[]) =>
      messages.filter((msg: ToastMessage) => msg.id !== id),
    );
  }

  clear(): void {
    // clear all messages
    this.messages.set([]); // set messages to empty array
  }
}
