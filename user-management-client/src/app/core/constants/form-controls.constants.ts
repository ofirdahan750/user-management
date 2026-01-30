export const LOGIN_FORM_CONTROLS = {
  LOGIN_ID: 'loginID',
  PASSWORD: 'password',
  REMEMBER_ME: 'rememberMe',
} as const;

export const FORGOT_PASSWORD_FORM_CONTROLS = {
  EMAIL: 'email',
} as const;

export const REGISTER_FORM_CONTROLS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  BIRTH_DATE: 'birthDate',
  PHONE_NUMBER: 'phoneNumber',
  TERMS: 'terms',
} as const;

export const CHANGE_PASSWORD_FORM_CONTROLS = {
  CURRENT_PASSWORD: 'currentPassword',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
} as const;
