/**
 * Admin Tags API - List All Tags
 * GET /api/admin/tags - Get all tags with post counts
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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

    // Check user role - only super_admin
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

    // Get all tags with post counts
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name, slug, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch tags' });
    }

    // Get post counts for each tag
    const tagsWithCounts = await Promise.all(
      (tags || []).map(async (tag) => {
        const { count } = await supabase
          .from('post_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        return {
          ...tag,
          post_count: count || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      tags: tagsWithCounts,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/tags:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
