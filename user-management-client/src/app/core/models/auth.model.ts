export interface RegisterProfile {
  firstName: string;
  lastName: string;
  birthDate?: string;
  phoneNumber?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  profile: RegisterProfile;
}

export interface RegisterResponse {
  UID: string;
  email: string;
  message: string;
  verificationToken?: string;
}

export interface LoginRequest {
  loginID: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    UID: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: {
    UID: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    phoneNumber?: string;
    isVerified: boolean;
    registrationDate: string;
    lastLoginDate: string;
  };
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}
