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

// Đăng nhập
export const login = async (request: LoginRequest) => {
  const { data, error } = await httpClient.post<AuthResponse>(
    '/auth/login',
    request
  );
  if (data?.access_token) {
    httpClient.setToken(data.access_token);
  }
  return { data, error };
};

// Đăng ký
export const register = async (request: SignupRequest) => {
  const { data, error } = await httpClient.post<AuthResponse>(
    '/auth/register',
    request
  );
  // Nếu BE tự động login sau khi đăng ký thành công
  if (data?.access_token) {
    httpClient.setToken(data.access_token);
  }
  return { data, error };
};

// Đăng xuất 
export const logout = async () => {
  try {
    await httpClient.post('/auth/logout', {});
  } catch (err) {
    console.warn('Logout API failed, but force logout anyway', err);
  } finally {
    httpClient.clearToken();
    window.location.href = '/login';
  }
};


export const getToken = () => {
  return httpClient.getToken();
};

export const isAuthenticated = () => {
  return !!httpClient.getToken();
};

// Quên mật khẩu
export const forgotPassword = async (request: ForgotPasswordRequest) => {
  return httpClient.post<OtpResponse>('/auth/forgotpassword', request);
};

// Xác thực OTP
export const verifyOtp = async (request: VerifyOtpRequest) => {
  return httpClient.post<OtpResponse>('/auth/verifyotp', request);
};

// Cập nhật mật khẩu mới
export const resetPassword = async (request: ResetPasswordRequest) => {
  return httpClient.post<PasswordResetResponse>('/auth/resetpassword', request);
};
