import { Injectable } from '@angular/core';
import { StorageKeys } from '@core/enums/storage-keys.enum';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  
  setItem(key: StorageKeys, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  getItem(key: StorageKeys): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }

  removeItem(key: StorageKeys): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  exists(key: StorageKeys): boolean {
    return this.getItem(key) !== null;
  }
}
