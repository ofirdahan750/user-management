import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong'
}

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const password = control.value as string;
    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = true;
    }

    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }

    if (!/\d/.test(password)) {
      errors['digit'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return PasswordStrength.WEAK;
  }

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) {
    return PasswordStrength.WEAK;
  } else if (strength <= 4) {
    return PasswordStrength.MEDIUM;
  } else {
    return PasswordStrength.STRONG;
  }
}
