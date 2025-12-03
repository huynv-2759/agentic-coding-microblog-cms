/**
 * Supabase Server Client
 * 
 * Use this client for server-side operations (getServerSideProps, API routes, Server Components).
 * This client handles cookies for authentication state.
 * 
 * Usage in API routes:
 * ```ts
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const supabase = createClient(req, res);
 *   const { data } = await supabase.from('posts').select('*');
 * }
 * ```
 * 
 * Usage in getServerSideProps:
 * ```ts
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export async function getServerSideProps(context) {
 *   const supabase = createClient(context.req, context.res);
 *   const { data } = await supabase.from('posts').select('*');
 * }
 * ```
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';

export function createClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', `${name}=${value}; ${formatCookieOptions(options)}`);
        },
        remove(name: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', `${name}=; Max-Age=0; ${formatCookieOptions(options)}`);
        },
      },
    }
  );
}

/**
 * Format cookie options into a Set-Cookie header string
 */
function formatCookieOptions(options: CookieOptions): string {
  const parts: string[] = [];
  
  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  
  if (options.secure) {
    parts.push('Secure');
  }
  
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  
  return parts.join('; ');
}
