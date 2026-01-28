import { createAction, props } from '@ngrx/store';
import { UserProfile, ProfileUpdate } from '@core/models/user.model';
import { LoginRequest, RegisterRequest } from '@core/models/auth.model';

// Login Actions
export const login = createAction('[Auth] Login', props<{ credentials: LoginRequest; rememberMe?: boolean }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: UserProfile }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// Register Actions
export const register = createAction('[Auth] Register', props<{ data: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ email: string; verificationToken?: string }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

// Logout Actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Profile Actions
export const updateProfile = createAction('[Auth] Update Profile', props<{ data: ProfileUpdate }>());
export const updateProfileSuccess = createAction('[Auth] Update Profile Success', props<{ user: UserProfile }>());
export const updateProfileFailure = createAction('[Auth] Update Profile Failure', props<{ error: string }>());

// Load User Actions
export const loadUser = createAction('[Auth] Load User');
export const loadUserSuccess = createAction('[Auth] Load User Success', props<{ user: UserProfile }>());
export const loadUserFailure = createAction('[Auth] Load User Failure');

// Verification Actions
export const verifyEmail = createAction('[Auth] Verify Email', props<{ token: string; email: string }>());
export const verifyEmailSuccess = createAction('[Auth] Verify Email Success');
export const verifyEmailFailure = createAction('[Auth] Verify Email Failure', props<{ error: string }>());

// Password Reset Actions
export const requestPasswordReset = createAction('[Auth] Request Password Reset', props<{ email: string }>());
export const requestPasswordResetSuccess = createAction('[Auth] Request Password Reset Success', props<{ resetToken?: string }>());
export const requestPasswordResetFailure = createAction('[Auth] Request Password Reset Failure', props<{ error: string }>());

export const resetPassword = createAction('[Auth] Reset Password', props<{ token: string; password: string }>());
export const resetPasswordSuccess = createAction('[Auth] Reset Password Success');
export const resetPasswordFailure = createAction('[Auth] Reset Password Failure', props<{ error: string }>());
