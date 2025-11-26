import * as httpClient from '../lib/http-client';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
} from '../types';

export const login = async (request: LoginRequest) => {
  const { data, error } = await httpClient.post<AuthResponse>(
    '/auth/login',
    request
  );
  if (data?.token) {
    httpClient.setToken(data.token);
  }
  return { data, error };
};

export const signup = async (request: SignupRequest) => {
  const { data, error } = await httpClient.post<AuthResponse>(
    '/auth/signup',
    request
  );
  if (data?.token) {
    httpClient.setToken(data.token);
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
