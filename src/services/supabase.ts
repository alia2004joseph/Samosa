/**
 * Supabase Client Configuration
 * Allows connecting directly to Supabase cloud instance or self-hosted PostgreSQL
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    localStorage.getItem('collegesamosa_supabase_url') ||
    '';
  const anonKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    localStorage.getItem('collegesamosa_supabase_anon_key') ||
    '';

  const isConfigured = Boolean(url && anonKey && url.startsWith('http'));
  return { url, anonKey, isConfigured };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed initializing Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem('collegesamosa_supabase_url', url.trim());
  localStorage.setItem('collegesamosa_supabase_anon_key', anonKey.trim());
  supabaseClient = null; // reset client instance
}
