import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const ISRAELI_PHONE_REGEX = /^(\+972|0)(5[0-9]|2[0-9]|3[0-9]|4[0-9]|7[0-9]|8[0-9]|9[0-9])-?[0-9]{7}$/;

export function israeliPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const phone = control.value as string;
    const cleanedPhone = phone.replace(/\s+/g, '');

    if (!ISRAELI_PHONE_REGEX.test(cleanedPhone)) {
      return { invalidPhone: true };
    }

    return null;
  };
}
