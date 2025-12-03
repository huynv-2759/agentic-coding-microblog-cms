/**
 * Admin Stats API Endpoint
 * 
 * Returns statistics for admin dashboard.
 * Requires authentication and admin/author role.
 * 
 * GET /api/admin/stats
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "stats": {
 *     "posts": {
 *       "total": 25,
 *       "published": 20,
 *       "drafts": 5
 *     },
 *     "comments": {
 *       "total": 150,
 *       "pending": 12,
 *       "approved": 135,
 *       "rejected": 3
 *     },
 *     "recentPosts": [...],
 *     "recentComments": [...]
 *   }
 * }
 * 
 * Response (401):
 * {
 *   "error": "Unauthorized",
 *   "message": "Authentication required"
 * }
 * 
 * Response (403):
 * {
 *   "error": "Forbidden",
 *   "message": "Insufficient permissions"
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

    const userId = user.id;

    // Super admin sees all stats
    const postsQuery = supabase.from('posts').select('id, title, slug, status, created_at');
    const commentsQuery = supabase.from('comments').select('id, post_slug, author_name, content, status, created_at');

    // Fetch posts
    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      console.error('Posts fetch error:', postsError);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch posts statistics',
      });
    }

    // Calculate post stats
    const postStats = {
      total: posts?.length || 0,
      published: posts?.filter(p => p.status === 'published').length || 0,
      drafts: posts?.filter(p => p.status === 'draft').length || 0,
    };

    // Fetch comments
    const { data: comments, error: commentsError } = await commentsQuery;

    if (commentsError) {
      console.error('Comments fetch error:', commentsError);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch comments statistics',
      });
    }

    // Calculate comment stats
    const commentStats = {
      total: comments?.length || 0,
      pending: comments?.filter(c => c.status === 'pending').length || 0,
      approved: comments?.filter(c => c.status === 'approved').length || 0,
      rejected: comments?.filter(c => c.status === 'rejected').length || 0,
    };

    // Get recent posts (last 5)
    const recentPosts = posts
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        createdAt: p.created_at,
      })) || [];

    // Get recent comments (last 10)
    const recentComments = comments
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        postSlug: c.post_slug,
        authorName: c.author_name,
        content: c.content.substring(0, 100) + (c.content.length > 100 ? '...' : ''),
        status: c.status,
        createdAt: c.created_at,
      })) || [];

    return res.status(200).json({
      success: true,
      stats: {
        posts: postStats,
        comments: commentStats,
        recentPosts,
        recentComments,
      },
    });

  } catch (error) {
    console.error('Admin stats API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
