import { ToastType } from '@core/enums/toast-type.enum';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  actionUrl?: string;
  actionLabel?: string;
}
