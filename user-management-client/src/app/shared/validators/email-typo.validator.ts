import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Common email domain typos: wrong -> correct */
const COMMON_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmail.cpm': 'gmail.com',
  'gnail.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.con': 'outlook.com',
};

/**
 * Validator that suggests correction for common email domain typos.
 * Returns an error with suggested correction when a known typo is detected.
 */
export function emailTypoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;

    const lower = value.toLowerCase().trim();
    const atIndex = lower.lastIndexOf('@');
    if (atIndex <= 0) return null;

    const domain = lower.slice(atIndex + 1);
    const suggestion = COMMON_TYPOS[domain];
    if (!suggestion) return null;

    const localPart = value.slice(0, atIndex);
    const suggestedEmail = `${localPart}@${suggestion}`;

    return { emailTypo: { suggested: suggestedEmail } };
  };
}
