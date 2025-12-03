/**
 * Test Database Connection API
 * 
 * This endpoint tests the connection to Supabase database.
 * Use this to verify that:
 * 1. Environment variables are set correctly
 * 2. Database tables exist
 * 3. RLS policies allow basic queries
 * 
 * Usage:
 * GET http://localhost:3000/api/test-db
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "message": "Database connection successful",
 *   "data": {
 *     "posts": [],
 *     "comments": []
 *   }
 * }
 */

import { createClient } from '@/lib/supabase/server';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success?: boolean;
  message: string;
  data?: {
    posts: any[];
    comments: any[];
  };
  error?: string;
  details?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method not allowed. Use GET.',
    });
  }

  try {
    const supabase = createClient(req, res);

    // Test posts query
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, slug, status, created_at')
      .limit(5);

    // Test comments query
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, post_slug, author_name, status, created_at')
      .limit(5);

    // Check for errors
    if (postsError || commentsError) {
      console.error('Database query error:', {
        postsError,
        commentsError,
      });

      return res.status(500).json({
        message: 'Database query failed',
        error: 'One or more queries returned an error',
        details: {
          postsError: postsError?.message,
          commentsError: commentsError?.message,
        },
      });
    }

    // Success!
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: {
        posts: posts || [],
        comments: comments || [],
      },
    });
  } catch (error: any) {
    console.error('Test DB error:', error);

    return res.status(500).json({
      message: 'Server error',
      error: error.message || 'Unknown error occurred',
    });
  }
}
