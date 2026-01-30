import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ToastNotificationService } from '@core/services/toast-notification/toast-notification.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotificationComponent {
  readonly ariaLabels = ARIA_LABELS;
  readonly icons = ICONS;
  readonly ToastType = ToastType;

  toastNotificationService: ToastNotificationService = inject(ToastNotificationService);

  getIconForType(type: ToastType): string {
    // get icon for type
    switch (type) {
      // success icon
      case ToastType.SUCCESS:
        return this.icons.CHECK_CIRCLE;
      // error icon
      case ToastType.ERROR:
        return this.icons.ERROR;
      // warning icon
      case ToastType.WARNING:
        return this.icons.WARNING;
      // info icon
      case ToastType.INFO:
        return this.icons.INFO;
      default:
        return this.icons.INFO;
    }
  }
}
