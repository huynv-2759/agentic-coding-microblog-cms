/**
 * Get User Role API
 * GET /api/auth/get-role?userId=xxx
 * 
 * Returns user role from database, bypassing RLS issues
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return res.status(200).json({ role: 'reader' });
    }

    return res.status(200).json({ role: data?.role || 'reader' });
  } catch (error) {
    console.error('Exception in get-role:', error);
    return res.status(200).json({ role: 'reader' });
  }
}
