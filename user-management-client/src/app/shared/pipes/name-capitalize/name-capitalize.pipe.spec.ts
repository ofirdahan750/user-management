// npx ng test --include='**/name-capitalize.pipe.spec.ts' --no-watch --browsers=ChromeHeadless
import { NameCapitalizePipe } from './name-capitalize.pipe';

describe('NameCapitalizePipe', () => {
  const pipe = new NameCapitalizePipe();

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

  it('should capitalize each word', () => {
    expect(pipe.transform('john doe')).toBe('John Doe');
    expect(pipe.transform('JANE SMITH')).toBe('Jane Smith');
  });

  it('should handle single word', () => {
    expect(pipe.transform('hello')).toBe('Hello');
    expect(pipe.transform('WORLD')).toBe('World');
  });

  it('should handle mixed case', () => {
    expect(pipe.transform('jOhN dOE')).toBe('John Doe');
  });

  it('should handle multiple spaces between words', () => {
    expect(pipe.transform('john   doe')).toBe('John   Doe');
  });
});
