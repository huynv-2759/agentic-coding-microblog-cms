/**
 * Comment Moderation Action API
 * 
 * PUT: Update comment status (approve/reject)
 * DELETE: Delete comment permanently
 * 
 * PUT /api/admin/comments/[id]
 * Body: { "action": "approve" | "reject" }
 * 
 * DELETE /api/admin/comments/[id]
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Comment ID is required',
    });
  }

  try {
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

    // Handle PUT (approve/reject)
    if (req.method === 'PUT') {
      const { action } = req.body;

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Action must be "approve" or "reject"',
        });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // Get comment to check permissions
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('post_slug')
        .eq('id', id)
        .single();

      if (fetchError || !comment) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Comment not found',
        });
      }

      // Super admin can moderate all comments

      // Update comment status
      const { error: updateError } = await supabase
        .from('comments')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) {
        console.error('Comment update error:', updateError);
        return res.status(500).json({
          error: 'Database Error',
          message: 'Failed to update comment',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Comment ${action}d successfully`,
      });
    }

    // Handle DELETE
    if (req.method === 'DELETE') {
      // Get comment to check permissions
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('post_slug')
        .eq('id', id)
        .single();

      if (fetchError || !comment) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Comment not found',
        });
      }

      // Super admin can delete all comments

      // Delete comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Comment delete error:', deleteError);
        return res.status(500).json({
          error: 'Database Error',
          message: 'Failed to delete comment',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Comment moderation API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
