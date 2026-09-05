import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext, type AuthContextType } from './AuthContextBase';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Erro ao recuperar sessão Supabase:', err);
      setLoading(false);
    });

    // Escutar alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Adicione suas credenciais no arquivo .env' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao realizar login.' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<{ error: string | null; message?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Adicione suas credenciais no arquivo .env' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session) {
        return { error: null, message: 'Conta criada e autenticado com sucesso!' };
      }

      return {
        error: null,
        message: 'Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.',
      };
    } catch (err: any) {
      return { error: err.message || 'Erro ao criar conta.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null; message?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Adicione suas credenciais no arquivo .env' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { error: error.message };
      }

      return {
        error: null,
        message: 'Link de redefinição enviado para o seu e-mail.',
      };
    } catch (err: any) {
      return { error: err.message || 'Erro ao solicitar redefinição de senha.' };
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
    resetPassword,
  }), [user, session, loading, signIn, signUp, signOut, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
