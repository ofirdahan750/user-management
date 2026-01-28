export const MESSAGES = {
  // Registration
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for verification.',
  REGISTRATION_ERROR: 'Registration failed. Please try again.',
  DUPLICATE_EMAIL: 'This email is already registered.',
  
  // Login
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_ERROR: 'Invalid email or password.',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email before logging in.',
  ACCOUNT_LOCKED: 'Your account has been locked due to multiple failed login attempts. Please contact support at support@example.com or try again later.',
  
  // Verification
  VERIFICATION_SUCCESS: 'Email verified successfully!',
  VERIFICATION_ERROR: 'Verification failed. Token expired or invalid.',
  VERIFICATION_LOADING: 'Verifying your email...',
  VERIFICATION_REDIRECT: 'Redirecting to login in',
  RESEND_VERIFICATION_SUCCESS: 'Verification email sent successfully!',
  
  // Password Reset
  PASSWORD_RESET_REQUEST_SUCCESS: 'Check your email for reset instructions.',
  PASSWORD_RESET_SUCCESS: 'Password reset successful!',
  PASSWORD_RESET_ERROR: 'Password reset failed. Token expired or invalid.',
  USER_NOT_FOUND: 'No account was found with this email address.',
  
  // Profile
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  PROFILE_UPDATE_ERROR: 'Failed to update profile.',
  
  // General
  LOADING: 'Loading...',
  ERROR: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this page.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  
  // Form Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and digit.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_DATE_AGE: 'Invalid age. You must be between 13 and 120 years old.',
  INVALID_DATE_FUTURE: 'Birth date cannot be in the future.',
  TERMS_REQUIRED: 'You must accept the terms and conditions.',
  
  // Password Strength
  PASSWORD_WEAK: 'Weak',
  PASSWORD_MEDIUM: 'Medium',
  PASSWORD_STRONG: 'Strong',
  
  // Navigation
  LOGOUT: 'Logout',
  LOGIN: 'Login',
  REGISTER: 'Register',
  PROFILE: 'Profile',
  DASHBOARD: 'Dashboard',
  
  // Time
  SECONDS: 'seconds',
  SECONDS_SHORT: 's',
  
  // Email Helper
  VERIFICATION_EMAIL_SENT: 'Verification email sent! Click the button below to verify your account.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent! Click the button below to reset your password.',
  VERIFICATION_LINK_COPIED: 'Verification link copied to clipboard!',
  RESET_LINK_COPIED: 'Reset link copied to clipboard!',
  VERIFICATION_LINK_FOR: '🔗 Verification link for',
  PASSWORD_RESET_LINK: '🔗 Password reset link:',
  TOKEN_LABEL: 'Token:',
  FULL_URL_LABEL: 'Full URL:',
  UNKNOWN_ERROR_OCCURRED: 'Unknown error occurred',
  FAILED_TO_COPY_TEXT: 'Failed to copy text:',
  
  // Button Labels
  VERIFY_NOW: 'Verify Now',
  RESET_PASSWORD_BUTTON: 'Reset Password',
  
  // Demo Mode
  DEMO_MODE_TITLE: 'Demo Mode:',
  DEMO_MODE_DESCRIPTION: 'Email sending is disabled in this demo environment. Use the button below to reset your password directly.',
  DEMO_MODE_DESCRIPTION_VERIFY: 'Email sending is disabled in this demo environment. Use the button below to verify your email directly.',
  
  // Resend
  DIDNT_RECEIVE_EMAIL: "Didn't receive email? You can resend in",
  RESEND_EMAIL: 'Resend Email',
  
  // 404 Page
  PAGE_NOT_FOUND_TITLE: '404 - Page Not Found',
  PAGE_NOT_FOUND_MESSAGE: 'The page you are looking for does not exist or has been moved.'
} as const;
