import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('972')) {
      const rest = cleaned.substring(3);
      if (rest.length === 9) {
        return `+972-${rest.substring(0, 2)}-${rest.substring(2)}`;
      }
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    }

    return value;
  }
}
