import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface DateAgeOptions {
  minAge?: number;
  maxAge?: number;
}

/**
 * Validator for date input with age restrictions
 * @param options Configuration options for age validation
 * @returns Validator function
 */
export function dateAgeValidator(options: DateAgeOptions = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Optional field
    }

    const date = control.value instanceof Date ? control.value : new Date(control.value);
    
    if (isNaN(date.getTime())) {
      return { invalidDate: true };
    }

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    
    // Calculate exact age
    const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    const errors: ValidationErrors = {};

    if (options.minAge !== undefined && exactAge < options.minAge) {
      errors['minAge'] = { requiredAge: options.minAge, actualAge: exactAge };
    }

    if (options.maxAge !== undefined && exactAge > options.maxAge) {
      errors['maxAge'] = { requiredAge: options.maxAge, actualAge: exactAge };
    }

    // Check if date is in the future
    if (date > today) {
      errors['futureDate'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Default age validator: minimum 13 years, maximum 120 years
 */
export function defaultDateAgeValidator(): ValidatorFn {
  return dateAgeValidator({ minAge: 13, maxAge: 120 });
}
