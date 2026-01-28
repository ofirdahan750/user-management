/**
 * Form value types for type-safe form handling
 */

export interface LoginFormValue {
  loginID: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormValue {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phoneNumber: string | null;
  terms: boolean;
}

export interface ForgotPasswordFormValue {
  email: string;
}

export interface ResetPasswordFormValue {
  password: string;
  confirmPassword: string;
}

export interface ProfileFormValue {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  birthDate: string | null;
}
