/**
 * Get Comments for Post API Endpoint
 * 
 * Returns approved comments for a specific post.
 * Public endpoint - no authentication required.
 * 
 * GET /api/comments/[postSlug]
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "comments": [
 *     {
 *       "id": "uuid",
 *       "authorName": "John Doe",
 *       "content": "Great article!",
 *       "createdAt": "2025-12-03T10:30:00Z",
 *       "parentId": null
 *     }
 *   ],
 *   "count": 5
 * }
 * 
 * Response (404):
 * {
 *   "error": "Not Found",
 *   "message": "Post not found"
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
    const { postSlug } = req.query;

    // Validate post slug
    if (!postSlug || typeof postSlug !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Post slug is required',
      });
    }

    const supabase = createClient(req, res);

    // Fetch approved comments for this post
    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, author_name, content, created_at, parent_id')
      .eq('post_slug', postSlug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comment fetch error:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch comments',
      });
    }

    // Format response
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      authorName: comment.author_name,
      content: comment.content,
      createdAt: comment.created_at,
      parentId: comment.parent_id,
    }));

    return res.status(200).json({
      success: true,
      comments: formattedComments,
      count: formattedComments.length,
    });

  } catch (error) {
    console.error('Get comments API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
