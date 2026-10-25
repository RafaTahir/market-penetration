import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export type AuthResult = { error: Error | null };
export type ProfileMetadata = Record<string, unknown>;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: ProfileMetadata) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfile: (updates: ProfileMetadata) => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
