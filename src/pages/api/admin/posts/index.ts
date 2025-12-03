/**
 * Admin Posts API - List and Create
 * GET /api/admin/posts - Get all posts
 * POST /api/admin/posts - Create new post
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

/**
 * GET - List all posts
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createClient(req, res);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

      if (!profile || profile.role !== 'super_admin') {
        console.error('❌ Access denied. Profile:', profile, 'Error:', profileError);
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          debug: { 
            hasProfile: !!profile, 
            role: profile?.role,
            error: profileError?.message 
          }
        });
      }

    // Parse query params
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        status,
        tags,
        published_at,
        created_at,
        updated_at,
        author_id
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by status
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    // Authors can only see their own posts
    if (profile.role === 'author') {
      query = query.eq('author_id', user.id);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }

    // Fetch authors for all posts
    if (posts && posts.length > 0) {
      const authorIds = [...new Set(posts.map((p: any) => p.author_id))];
      const { data: authors } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', authorIds);

      // Map authors to posts
      const authorMap = new Map(authors?.map(a => [a.id, a]) || []);
      posts.forEach((post: any) => {
        post.author = authorMap.get(post.author_id) || { id: post.author_id, full_name: 'Unknown', email: '' };
      });
    }

    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('posts')
      .select('status')
      .eq(profile.role === 'author' ? 'author_id' : 'id', profile.role === 'author' ? user.id : undefined);

    const counts = {
      total: count || 0,
      draft: statusCounts?.filter((p: any) => p.status === 'draft').length || 0,
      published: statusCounts?.filter((p: any) => p.status === 'published').length || 0,
      archived: statusCounts?.filter((p: any) => p.status === 'archived').length || 0,
    };

    return res.status(200).json({
      success: true,
      posts,
      counts,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/posts:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * POST - Create new post
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createClient(req, res);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'admin', 'author'].includes(profile.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    // Validate request body
    const { title, slug, content, excerpt, tags, status } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, slug, content',
      });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
      });
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A post with this slug already exists',
      });
    }

    // Create post
    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      tags: tags || [],
      status: status || 'draft',
      author_id: user.id,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    const { data: post, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ success: false, message: 'Failed to create post' });
    }

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/posts:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
