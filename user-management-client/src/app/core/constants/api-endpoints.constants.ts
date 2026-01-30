import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  BASE_URL: environment.apiUrl,
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    ACCOUNT_INFO: '/user/account-info',
    CHANGE_PASSWORD: '/user/change-password'
  }
} as const;
