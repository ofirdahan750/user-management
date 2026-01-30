import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameCapitalize',
  standalone: true
})
export class NameCapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
