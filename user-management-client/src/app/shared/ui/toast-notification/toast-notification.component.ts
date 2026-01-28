import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { ToastType } from '@core/enums/toast-type.enum';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, MatIconModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastNotificationComponent {
  public readonly ariaLabels = ARIA_LABELS;
  public readonly icons = ICONS;
  public readonly ToastType = ToastType;
  
  constructor(public toastService: ToastNotificationService) {}
  
  getIconForType(type: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS:
        return this.icons.CHECK_CIRCLE;
      case ToastType.ERROR:
        return this.icons.ERROR;
      case ToastType.WARNING:
        return this.icons.WARNING;
      case ToastType.INFO:
        return this.icons.INFO;
      default:
        return this.icons.INFO;
    }
  }
}
