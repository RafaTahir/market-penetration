import { useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, SUPABASE_UNAVAILABLE_MESSAGE } from '../services/supabaseClient';
import { AuthContext, type AuthResult, type ProfileMetadata } from './authContextValue';

const asError = (error: unknown) => error instanceof Error ? error : new Error('Authentication failed. Please try again.');
const unavailableResult = (): AuthResult => ({ error: new Error(SUPABASE_UNAVAILABLE_MESSAGE) });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return;
      setSession(error ? null : session);
      setUser(error ? null : session?.user ?? null);
      setAuthError(error);
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setAuthError(asError(error));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
      setUser(session?.user ?? null);
      setAuthError(null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return unavailableResult();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: asError(error) };
    }
  };

  const signUp = async (email: string, password: string, metadata?: ProfileMetadata): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return unavailableResult();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      return { error };
    } catch (error) {
      return { error: asError(error) };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return unavailableResult();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: asError(error) };
    }
  };

  const updateProfile = async (updates: ProfileMetadata): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return unavailableResult();
    try {
      const { error } = await supabase.auth.updateUser({ data: updates });
      return { error };
    } catch (error) {
      return { error: asError(error) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        authError,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
