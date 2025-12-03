/**
 * Admin Tags API - Update/Delete Tag
 * PUT /api/admin/tags/[id] - Rename tag
 * DELETE /api/admin/tags/[id] - Delete tag (only if no posts)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Tag ID required' });
  }

  if (req.method === 'PUT') {
    return handleUpdate(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

/**
 * PUT - Rename tag
 */
async function handleUpdate(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check authentication with regular client
    const supabase = createClient(req, res);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Use service role client to bypass RLS for user_profiles queries
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check user role
    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Tag name required' });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Update tag
    const { data: tag, error } = await supabase
      .from('tags')
      .update({ name: name.trim(), slug })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tag:', error);
      return res.status(500).json({ success: false, message: 'Failed to update tag' });
    }

    return res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/tags/[id]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * DELETE - Delete tag (only if no posts)
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check authentication with regular client
    const supabase = createClient(req, res);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Use service role client to bypass RLS for user_profiles queries
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check user role
    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    // Check if tag has any posts
    const { count } = await supabase
      .from('post_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', id);

    if (count && count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tag. It is used by ${count} post(s).`,
      });
    }

    // Delete tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tag:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete tag' });
    }

    return res.status(200).json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/tags/[id]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
