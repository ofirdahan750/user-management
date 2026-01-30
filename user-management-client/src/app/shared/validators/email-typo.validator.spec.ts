// npx ng test --include='**/email-typo.validator.spec.ts' --no-watch --browsers=ChromeHeadless
import { FormControl } from '@angular/forms';
import { emailTypoValidator } from './email-typo.validator';

describe('emailTypoValidator', () => {
  it('should return null for valid email', () => {
    const control = new FormControl('user@gmail.com', emailTypoValidator());
    expect(control.errors).toBeNull();
  });

  it('should return null for empty value', () => {
    const control = new FormControl('', emailTypoValidator());
    expect(control.errors).toBeNull();
  });

  it('should return emailTypo error for gmial.com', () => {
    const control = new FormControl('user@gmial.com', emailTypoValidator());
    expect(control.errors?.['emailTypo']).toBeDefined();
    expect(control.errors?.['emailTypo'].suggested).toBe('user@gmail.com');
  });

  it('should return emailTypo error for gmail.con', () => {
    const control = new FormControl('test@gmail.con', emailTypoValidator());
    expect(control.errors?.['emailTypo']).toBeDefined();
    expect(control.errors?.['emailTypo'].suggested).toBe('test@gmail.com');
  });

  it('should return emailTypo error for yaho.com', () => {
    const control = new FormControl('john@yaho.com', emailTypoValidator());
    expect(control.errors?.['emailTypo']).toBeDefined();
    expect(control.errors?.['emailTypo'].suggested).toBe('john@yahoo.com');
  });

  it('should return null for unknown typo domain', () => {
    const control = new FormControl('user@example.com', emailTypoValidator());
    expect(control.errors).toBeNull();
  });
});
