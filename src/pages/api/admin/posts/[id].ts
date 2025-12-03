/**
 * Admin Single Post API - Get, Update, Delete
 * GET /api/admin/posts/[id] - Get single post
 * PUT /api/admin/posts/[id] - Update post
 * DELETE /api/admin/posts/[id] - Delete post
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid post ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

/**
 * GET - Get single post
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, postId: string) {
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

    // Get post
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Authors can only access their own posts
    if (profile.role === 'author' && post.author_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Error in GET /api/admin/posts/[id]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * PUT - Update post
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, postId: string) {
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

    // Get existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, status')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Authors can only update their own posts
    if (profile.role === 'author' && existingPost.author_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Validate request body
    const { title, slug, content, excerpt, tags, status } = req.body;

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) {
      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
        });
      }

      // Check for duplicate slug
      const { data: duplicate } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', postId)
        .single();

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'A post with this slug already exists',
        });
      }

      updateData.slug = slug;
    }
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) {
      updateData.status = status;
      // Set published_at when publishing
      if (status === 'published' && existingPost.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Update post
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating post:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update post' });
    }

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/posts/[id]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * DELETE - Delete post
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, postId: string) {
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

    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete posts',
      });
    }

    // Delete post (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return res.status(500).json({ success: false, message: 'Failed to delete post' });
    }

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/posts/[id]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
