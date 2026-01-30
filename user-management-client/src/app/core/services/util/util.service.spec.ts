// npx ng test --include='**/util.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { UtilService } from './util.service';

describe('UtilService', () => {
  let service: UtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generateId should return a non-empty string', () => {
    const id = service.generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('generateId should return unique values', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(service.generateId());
    }
    expect(ids.size).toBe(100);
  });
});
