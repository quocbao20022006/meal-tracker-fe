import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const signUp = async (_email: string, _password: string) => {
    try {
      setLoading(true);
      // Auth operations would be handled via useAuth hook with auth.service
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (_email: string, _password: string) => {
    try {
      setLoading(true);
      // Auth operations would be handled via useAuth hook with auth.service
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Auth operations would be handled via useAuth hook with auth.service
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
