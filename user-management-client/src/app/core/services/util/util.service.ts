import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  /**
   * Capitalizes the first letter of a string and lowercases the rest.
   * e.g. "john" -> "John", "JOHN" -> "John"
   */
  capitalizeFirst(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  /**
   * Generates a short random string suitable for use as a unique ID.
   */
  generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
