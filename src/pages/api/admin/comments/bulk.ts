/**
 * Bulk Comment Moderation API
 * 
 * POST: Bulk approve/reject/delete multiple comments
 * 
 * POST /api/admin/comments/bulk
 * Body: {
 *   "commentIds": ["uuid1", "uuid2", ...],
 *   "action": "approve" | "reject" | "delete"
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { commentIds, action } = req.body;

    // Validation
    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'commentIds must be a non-empty array',
      });
    }

    if (commentIds.length > 50) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cannot moderate more than 50 comments at once',
      });
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Action must be approve, reject, or delete',
      });
    }

    const supabase = createClient(req, res);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Check user role from database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    // Get comments to check they exist
    const { data: comments, error: fetchError } = await supabase
      .from('comments')
      .select('id, post_slug')
      .in('id', commentIds);

    if (fetchError || !comments) {
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch comments',
      });
    }

    // Super admin can do any action on all comments

    // Perform bulk action
    if (action === 'delete') {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .in('id', commentIds);

      if (deleteError) {
        console.error('Bulk delete error:', deleteError);
        return res.status(500).json({
          error: 'Database Error',
          message: 'Failed to delete comments',
        });
      }
    } else {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('comments')
        .update({ status: newStatus })
        .in('id', commentIds);

      if (updateError) {
        console.error('Bulk update error:', updateError);
        return res.status(500).json({
          error: 'Database Error',
          message: 'Failed to update comments',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully ${action}${action === 'delete' ? 'd' : 'ed'} ${commentIds.length} comment(s)`,
      count: commentIds.length,
    });

  } catch (error) {
    console.error('Bulk moderation API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
