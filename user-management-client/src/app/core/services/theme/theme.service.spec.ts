// npx ng test --include='**/theme.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { Theme } from '@core/enums/theme.enum';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have currentTheme signal', () => {
    expect(service.currentTheme()).toBeDefined();
    expect([Theme.LIGHT, Theme.DARK]).toContain(service.currentTheme());
  });

  it('should toggle theme', () => {
    const initial = service.currentTheme();
    service.toggleTheme();
    expect(service.currentTheme()).toBe(initial === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    service.toggleTheme();
    expect(service.currentTheme()).toBe(initial);
  });
});
