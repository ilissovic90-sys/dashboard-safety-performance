import { createClient } from '@supabase/supabase-js';

// Vite embeds these values during the GitHub Pages build.
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Supabase JS needs the project root URL, not the REST or Auth endpoint.
// Normalize common pasted values such as "...supabase.co/rest/v1/".
const url = rawUrl
  .replace(/\/+$/, '')
  .replace(/\/(rest\/v1|auth\/v1)$/i, '');

const isValidProjectUrl = (() => {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      Boolean(parsed.hostname);
  } catch {
    return false;
  }
})();

export const isSupabaseConfigured =
  Boolean(isValidProjectUrl && anonKey && !url.includes('YOUR_PROJECT'));

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
