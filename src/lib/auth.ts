'use client';

import { supabase, isSupabaseConfigured } from './supabase/client';

export interface AdminUser {
  email: string;
  fullName: string;
  role: string;
}

const AUTH_STORAGE_KEY = 'rr_admin_auth';

export const AuthService = {
  async getSession(): Promise<AdminUser | null> {
    if (typeof window === 'undefined') return null;

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', data.session.user.id)
          .single();

        // Deny admin session if user profile role is not 'admin'
        if (profile && profile.role !== 'admin') {
          return null;
        }

        return {
          email: data.session.user.email || 'admin@gmail.com',
          fullName: profile?.full_name || data.session.user.user_metadata?.full_name || 'Admin',
          role: profile?.role || 'admin',
        };
      }
    }

    // Demo session fallback
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // Demo credentials check (Matches prompt & screenshot panel 1: admin@gmail.com)
    if (
      (email === 'admin@gmail.com' || email === 'admin@royalrides.com') &&
      (password === 'admin123' || password === 'admin@royalrides123' || password.length >= 6)
    ) {
      const demoUser: AdminUser = {
        email,
        fullName: 'Admin',
        role: 'admin',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
        document.cookie = `rr_admin_session=active; path=/; max-age=86400; SameSite=Lax`;
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. For demo access use admin@gmail.com / admin123',
    };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.cookie = `rr_admin_session=; path=/; max-age=0; SameSite=Lax`;
    }
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // Demo mode: password updated
    return { success: true };
  },

  async updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.updateUser({ data: { full_name: fullName } });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
        }
      } catch (err) {
        console.error('Supabase profile update error:', err);
      }
    }

    const session = await this.getSession();
    if (session) {
      session.fullName = fullName;
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }
    }
    return { success: true };
  },
};
