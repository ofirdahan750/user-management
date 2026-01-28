import { Injectable } from '@angular/core';
import { StorageKeys } from '@core/enums/storage-keys.enum';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  
  setItem(key: StorageKeys, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem(key: StorageKeys): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: StorageKeys): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  exists(key: StorageKeys): boolean {
    return this.getItem(key) !== null;
  }
}
