import { useCallback } from 'react';
import * as authService from '../services/auth.service';
import { useMutation } from './useFetch';
import { AuthResponse, LoginRequest, SignupRequest } from '../types';

/**
 * Hook để quản lý authentication
 */
export function useAuth() {
  const loginMutation = useMutation<AuthResponse>(async (credentials: LoginRequest) => {
    return authService.login(credentials);
  });

  const signupMutation = useMutation<AuthResponse>(async (credentials: SignupRequest) => {
    return authService.signup(credentials);
  });

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  return {
    login: loginMutation.mutate,
    loginLoading: loginMutation.loading,
    loginError: loginMutation.error,
    
    signup: signupMutation.mutate,
    signupLoading: signupMutation.loading,
    signupError: signupMutation.error,
    
    logout,
    isAuthenticated,
  };
}
