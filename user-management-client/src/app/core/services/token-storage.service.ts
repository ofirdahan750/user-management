import { Injectable } from '@angular/core';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { LocalStorageService } from '@core/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  
  constructor(private localStorageService: LocalStorageService) {}

  saveToken(token: string): void {
    this.localStorageService.setItem(StorageKeys.TOKEN, token);
  }

  getToken(): string | null {
    return this.localStorageService.getItem(StorageKeys.TOKEN);
  }

  removeToken(): void {
    this.localStorageService.removeItem(StorageKeys.TOKEN);
  }

  saveRefreshToken(token: string): void {
    this.localStorageService.setItem(StorageKeys.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.localStorageService.getItem(StorageKeys.REFRESH_TOKEN);
  }

  removeRefreshToken(): void {
    this.localStorageService.removeItem(StorageKeys.REFRESH_TOKEN);
  }

  clear(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}
