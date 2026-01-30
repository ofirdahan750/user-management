// npx ng test --include='**/date-format.pipe.spec.ts' --no-watch --browsers=ChromeHeadless
import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  const pipe = new DateFormatPipe();

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(pipe.transform('invalid-date')).toBe('');
    expect(pipe.transform('not a date')).toBe('');
  });

  it('should format valid date with short format by default', () => {
    const result = pipe.transform('2024-01-15T12:00:00Z');
    expect(result).toBeTruthy();
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('should format valid date with short format explicitly', () => {
    const result = pipe.transform('2024-06-20', 'short');
    expect(result).toBeTruthy();
    expect(result).toContain('2024');
    expect(result).toContain('Jun');
    expect(result).toContain('20');
  });

  it('should format valid date with long format', () => {
    const result = pipe.transform('2024-01-15T14:30:00Z', 'long');
    expect(result).toBeTruthy();
    expect(result).toContain('2024');
    expect(result).toContain('January');
    expect(result).toContain('15');
  });
});
