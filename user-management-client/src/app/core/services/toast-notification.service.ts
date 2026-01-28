import { Injectable, signal } from '@angular/core';
import { ToastType } from '@core/enums/toast-type.enum';
import { ToastMessage } from '@core/models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  public messages = signal<ToastMessage[]>([]);

  showSuccess(message: string, duration: number = 3000): void {
    this.addMessage(message, ToastType.SUCCESS, duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.addMessage(message, ToastType.ERROR, duration);
  }

  showInfo(message: string, duration: number = 3000, actionUrl?: string, actionLabel?: string): void {
    this.addMessage(message, ToastType.INFO, duration, actionUrl, actionLabel);
  }

  showWarning(message: string, duration: number = 4000): void {
    this.addMessage(message, ToastType.WARNING, duration);
  }

  private addMessage(message: string, type: ToastType, duration: number, actionUrl?: string, actionLabel?: string): void {
    const id = Math.random().toString(36).substring(7);
    const toast: ToastMessage = { id, message, type, duration, actionUrl, actionLabel };
    
    this.messages.update(messages => [...messages, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeMessage(id);
      }, duration);
    }
  }

  removeMessage(id: string): void {
    this.messages.update(messages => messages.filter(msg => msg.id !== id));
  }

  clear(): void {
    this.messages.set([]);
  }
}
