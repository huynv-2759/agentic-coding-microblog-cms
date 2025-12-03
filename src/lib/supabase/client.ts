/**
 * Supabase Browser Client
 * 
 * Use this client for client-side operations (React components, browser-only code).
 * This client uses the ANON key which is safe to expose in the browser.
 * 
 * Usage:
 * ```ts
 * import { createBrowserClient } from '@/lib/supabase/client';
 * 
 * const supabase = createBrowserClient();
 * const { data, error } = await supabase.from('posts').select('*');
 * ```
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
