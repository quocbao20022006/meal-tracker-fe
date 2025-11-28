import * as httpClient from '../lib/http-client';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
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
