import * as httpClient from '../lib/http-client';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  OtpResponse,
  PasswordResetResponse,
} from '../types';

export const login = async (request: LoginRequest) => {
  const { data, error } = await httpClient.post<AuthResponse>(
    '/v1/auth/login',
    request
  );
  if (data?.access_token) {
    httpClient.setToken(data.access_token);
  }
  return { data, error };
};

export const register = async (request: SignupRequest) => {
  const { data, error } = await httpClient.post<AuthResponse>(
    '/v1/auth/register',
    request
  );
  if (data?.access_token) {
    httpClient.setToken(data.access_token);
  }
  return { data, error };
};

export const logout = () => {
  httpClient.clearToken();
};

export const getToken = () => {
  return httpClient.getToken();
};

export const isAuthenticated = () => {
  return !!httpClient.getToken();
};

export const forgotPassword = async (request: ForgotPasswordRequest) => {
  return httpClient.post<OtpResponse>('/v1/auth/forgot-password', request);
};

export const verifyOtp = async (request: VerifyOtpRequest) => {
  return httpClient.post<OtpResponse>('/v1/auth/verify-otp', request);
};

export const resetPassword = async (request: ResetPasswordRequest) => {
  return httpClient.post<PasswordResetResponse>('/v1/auth/reset-password', request);
};
