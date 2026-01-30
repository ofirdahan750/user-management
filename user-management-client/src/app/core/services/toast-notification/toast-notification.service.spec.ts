// npx ng test --include='**/toast-notification.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { ToastNotificationService } from './toast-notification.service';

describe('ToastNotificationService', () => {
  let service: ToastNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastNotificationService);
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add message on showSuccess', () => {
    service.showSuccess('Success!');
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].message).toBe('Success!');
  });

  it('should add message on showError', () => {
    service.showError('Error!');
    expect(service.messages().length).toBe(1);
  });

  it('should remove message by id', () => {
    service.showSuccess('Test');
    const id = service.messages()[0].id;
    service.removeMessage(id);
    expect(service.messages().length).toBe(0);
  });

  it('should clear all messages', () => {
    service.showSuccess('1');
    service.showError('2');
    service.clear();
    expect(service.messages().length).toBe(0);
  });
});
