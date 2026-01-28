export interface UserProfile {
  UID: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phoneNumber?: string;
  isVerified: boolean;
  registrationDate: string;
  lastLoginDate: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phoneNumber?: string;
}
