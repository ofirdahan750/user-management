// npx ng test --include='**/session-storage.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';
import { StorageKeys } from '@core/enums/storage-keys.enum';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get item', () => {
    service.setItem(StorageKeys.TOKEN, 'test-token');
    expect(service.getItem(StorageKeys.TOKEN)).toBe('test-token');
  });

  it('should remove item', () => {
    service.setItem(StorageKeys.TOKEN, 'test');
    service.removeItem(StorageKeys.TOKEN);
    expect(service.getItem(StorageKeys.TOKEN)).toBeNull();
  });

  it('should return null for non-existent key', () => {
    expect(service.getItem(StorageKeys.TOKEN)).toBeNull();
  });

  it('should return true for exists when key has value', () => {
    service.setItem(StorageKeys.TOKEN, 'value');
    expect(service.exists(StorageKeys.TOKEN)).toBe(true);
  });

  it('should return false for exists when key does not exist', () => {
    expect(service.exists(StorageKeys.TOKEN)).toBe(false);
  });

  it('should clear all items', () => {
    service.setItem(StorageKeys.TOKEN, 'token');
    service.clear();
    expect(service.getItem(StorageKeys.TOKEN)).toBeNull();
  });
});
