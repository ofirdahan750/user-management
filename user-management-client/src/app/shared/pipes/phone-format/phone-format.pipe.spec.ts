// npx ng test --include='**/phone-format.pipe.spec.ts' --no-watch --browsers=ChromeHeadless
import { PhoneFormatPipe } from './phone-format.pipe';

describe('PhoneFormatPipe', () => {
  const pipe = new PhoneFormatPipe();

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

  it('should format 972 prefix with 9 digits', () => {
    expect(pipe.transform('972501234567')).toBe('+972-50-1234567');
    expect(pipe.transform('972541234567')).toBe('+972-54-1234567');
  });

  it('should format local format starting with 0', () => {
    expect(pipe.transform('0501234567')).toBe('050-1234567');
    expect(pipe.transform('0541234567')).toBe('054-1234567');
  });

  it('should strip non-digits before formatting', () => {
    expect(pipe.transform('050-123-4567')).toBe('050-1234567');
    expect(pipe.transform('972 50 123 4567')).toBe('+972-50-1234567');
  });

  it('should return value unchanged when format does not match', () => {
    expect(pipe.transform('12345')).toBe('12345');
    expect(pipe.transform('972123')).toBe('972123');
  });
});
