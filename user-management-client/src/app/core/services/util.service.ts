import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  
  /**
   * Generates a short random string suitable for use as a unique ID.
   */
  generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
