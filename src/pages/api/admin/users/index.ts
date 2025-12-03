/**
 * Admin Users API
 * GET /api/admin/users - List all users with search and filter
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication with regular client
    const supabase = createClient(req, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Use service role client to bypass RLS for user_profiles queries
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super_admin
    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden: Super admin access required' });
    }

    // Get query parameters for search and filter
    const { search, role } = req.query;

    // Build query for users (use service client to bypass RLS)
    let query = serviceClient
      .from('user_profiles')
      .select('id, email, role, full_name, created_at')
      .order('created_at', { ascending: false });

    // Apply search filter (by email)
    if (search && typeof search === 'string') {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply role filter
    if (role && typeof role === 'string' && role !== 'all') {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    return res.status(200).json({
      success: true,
      users: users || [],
    });
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
