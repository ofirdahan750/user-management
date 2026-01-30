export interface UserProfile {
  UID: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phoneNumber: string;
  isVerified: boolean;
  registrationDate: string;
  lastLoginDate: string;
}

/** Default empty user when none is loaded. Use for observable initial values. */
export const DEFAULT_USER_PROFILE: UserProfile = {
  UID: '',
  email: '',
  firstName: '',
  lastName: '',
  isVerified: false,
  registrationDate: '',
  lastLoginDate: '',
  phoneNumber: '',
};

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phoneNumber?: string;
}
