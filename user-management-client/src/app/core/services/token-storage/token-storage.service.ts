import { Injectable, inject } from '@angular/core';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private sessionStorageService: SessionStorageService = inject(SessionStorageService);
  private localStorageService: LocalStorageService = inject(LocalStorageService);

  saveToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      this.localStorageService.setItem(StorageKeys.TOKEN, token);
      this.sessionStorageService.removeItem(StorageKeys.TOKEN);
    } else {
      this.sessionStorageService.setItem(StorageKeys.TOKEN, token);
      this.localStorageService.removeItem(StorageKeys.TOKEN);
    }
  }

  getToken(): string | null {
    return (
      this.localStorageService.getItem(StorageKeys.TOKEN) ||
      this.sessionStorageService.getItem(StorageKeys.TOKEN)
    );
  }

  removeToken(): void {
    this.sessionStorageService.removeItem(StorageKeys.TOKEN);
    this.localStorageService.removeItem(StorageKeys.TOKEN);
  }

  saveRefreshToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      this.localStorageService.setItem(StorageKeys.REFRESH_TOKEN, token);
      this.sessionStorageService.removeItem(StorageKeys.REFRESH_TOKEN);
    } else {
      this.sessionStorageService.setItem(StorageKeys.REFRESH_TOKEN, token);
      this.localStorageService.removeItem(StorageKeys.REFRESH_TOKEN);
    }
  }

  getRefreshToken(): string | null {
    return (
      this.localStorageService.getItem(StorageKeys.REFRESH_TOKEN) ||
      this.sessionStorageService.getItem(StorageKeys.REFRESH_TOKEN)
    );
  }

  removeRefreshToken(): void {
    this.sessionStorageService.removeItem(StorageKeys.REFRESH_TOKEN);
    this.localStorageService.removeItem(StorageKeys.REFRESH_TOKEN);
  }

  clear(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}
