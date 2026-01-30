// npx ng test --include='**/email-helper.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EmailHelperService } from './email-helper.service';

describe('EmailHelperService', () => {
  let service: EmailHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    service = TestBed.inject(EmailHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setTemporaryEmail and getAndClearTemporaryEmail should work', () => {
    service.setTemporaryEmail('test@example.com');
    expect(service.getAndClearTemporaryEmail()).toBe('test@example.com');
    expect(service.getAndClearTemporaryEmail()).toBe('');
  });
});
