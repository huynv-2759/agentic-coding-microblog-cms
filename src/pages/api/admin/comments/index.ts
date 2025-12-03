/**
 * Admin Comments Moderation API
 * 
 * GET: Fetch all comments (with filters)
 * 
 * GET /api/admin/comments?status=pending&limit=20&offset=0
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "comments": [...],
 *   "total": 150,
 *   "counts": {
 *     "total": 150,
 *     "pending": 12,
 *     "approved": 135,
 *     "rejected": 3
 *   }
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Get query parameters
    const { status, postSlug, limit = '20', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Build query
    let query = supabase
      .from('comments')
      .select('id, post_slug, author_name, author_email, content, status, created_at', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (postSlug) {
      query = query.eq('post_slug', postSlug);
    }

    // Super admin sees all comments - no filtering needed

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    const { data: comments, error, count } = await query;

    if (error) {
      console.error('Comments fetch error:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch comments',
      });
    }

    // Get counts for each status
    const countsQuery = supabase
      .from('comments')
      .select('status', { count: 'exact' });

    const { data: allComments } = await countsQuery;
    
    const counts = {
      total: allComments?.length || 0,
      pending: allComments?.filter(c => c.status === 'pending').length || 0,
      approved: allComments?.filter(c => c.status === 'approved').length || 0,
      rejected: allComments?.filter(c => c.status === 'rejected').length || 0,
    };

    return res.status(200).json({
      success: true,
      comments,
      total: count || 0,
      counts,
    });

  } catch (error) {
    console.error('Admin comments API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
