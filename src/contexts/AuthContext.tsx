import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';

export interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  hasProfile: boolean;
  authLoading: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const loadAuthState = () => {
    const token = authService.getToken();
    if (token) {
      // Parse user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        const hasUserProfile = localStorage.getItem('hasProfile') === 'true';
        setHasProfile(hasUserProfile);
      }
    } else {
      setUser(null);
      setHasProfile(false);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('hasProfile');
    setUser(null);
    setHasProfile(false);
  };

  const refreshAuth = () => {
    loadAuthState();
  };

  return (
    <AuthContext.Provider value={{ user, hasProfile, authLoading, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
