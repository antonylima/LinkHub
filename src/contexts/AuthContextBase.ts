import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null; message?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
