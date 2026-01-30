// npx ng test --include='**/loading.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should set isLoading true when show is called', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should set isLoading false when hide is called after show', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should reset to false', () => {
    service.show();
    service.reset();
    expect(service.isLoading()).toBe(false);
  });
});
