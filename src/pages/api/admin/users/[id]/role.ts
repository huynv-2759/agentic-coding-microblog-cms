/**
 * Admin User Role Change API
 * PUT /api/admin/users/[id]/role - Change a user's role
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { role } = req.body;

  // Validate input
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ message: 'Role is required' });
  }

  // Validate role value
  const validRoles = ['super_admin', 'admin', 'author', 'reader'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
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

    // Prevent changing own role
    if (user.id === id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    // Check if target user exists (use service client)
    const { data: targetUser, error: targetError } = await serviceClient
      .from('user_profiles')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (targetError || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role (use service client)
    const { error: updateError } = await serviceClient
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return res.status(500).json({ message: 'Failed to update user role' });
    }

    // Log the role change (use service client)
    const { error: logError } = await serviceClient.from('user_role_changes').insert({
      user_id: id,
      old_role: targetUser.role,
      new_role: role,
      changed_by: user.id,
      changed_at: new Date().toISOString(),
      reason: `Role changed from ${targetUser.role} to ${role} by super admin`,
    });

    if (logError) {
      console.error('Error logging role change:', logError);
      // Don't fail the request if logging fails
    }

    return res.status(200).json({
      success: true,
      message: `User role updated from ${targetUser.role} to ${role}`,
    });
  } catch (error) {
    console.error('Error in role change API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
