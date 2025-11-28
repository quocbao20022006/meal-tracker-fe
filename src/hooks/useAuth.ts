import { useCallback } from 'react';
import * as authService from '../services/auth.service';
import { useMutation } from './useFetch';
import { AuthResponse, LoginRequest, SignupRequest } from '../types';

/**
 * Hook để quản lý authentication
 */
export function useAuth() {
  const loginMutation = useMutation<AuthResponse>(async (credentials: LoginRequest) => {
    const result = await authService.login(credentials);
    if (result.data) {
      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify({
        id: result.data.user_id,
      }));
    }
    return result;
  });

  const signupMutation = useMutation<AuthResponse>(async (credentials: SignupRequest) => {
    const result = await authService.register(credentials);
    if (result.data) {
      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify({
        id: result.data.user_id,
      }));
    }
    return result;
  });

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('hasProfile');
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
