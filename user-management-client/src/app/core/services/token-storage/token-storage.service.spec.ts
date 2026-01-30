// npx ng test --include='**/token-storage.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { StorageKeys } from '@core/enums/storage-keys.enum';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and get token with rememberMe false', () => {
    service.saveToken('token123', false);
    expect(service.getToken()).toBe('token123');
  });

  it('should save and get token with rememberMe true', () => {
    service.saveToken('token456', true);
    expect(service.getToken()).toBe('token456');
  });

  it('should clear token', () => {
    service.saveToken('token', false);
    service.clear();
    expect(service.getToken()).toBeNull();
  });
});
