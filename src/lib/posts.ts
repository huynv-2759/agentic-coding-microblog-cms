/**
 * Post Management Utilities
 * 
 * Handles fetching and managing blog posts from Supabase database.
 */

import { createClient } from '@supabase/supabase-js';
import { Post, PostMetadata } from './types';
import { markdownToHtml, calculateReadingTime } from './markdown';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gets all post slugs from database
 * 
 * @returns Array of post slugs
 * 
 * @example
 * ```typescript
 * const slugs = await getAllPostSlugs();
 * console.log(slugs); // ["hello-world", "nextjs-tutorial", "typescript-tips"]
 * ```
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching post slugs:', error);
      return [];
    }

    return data?.map(post => post.slug) || [];
  } catch (error) {
    console.error('Error in getAllPostSlugs:', error);
    return [];
  }
}

/**
 * Gets a single post by slug
 * 
 * @param slug - Post slug
 * @returns Complete post with HTML content
 * @throws Error if post not found
 * 
 * @example
 * ```typescript
 * const post = await getPostBySlug("hello-world");
 * console.log(post.title); // "Hello World"
 * console.log(post.content); // "<h1>Hello World</h1>..."
 * ```
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      throw new Error(`Post not found: ${slug}`);
    }

    // Fetch author separately
    const { data: authorData } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', data.author_id)
      .single();

    // Convert markdown to HTML
    const htmlContent = await markdownToHtml(data.content);
    const readingTime = calculateReadingTime(data.content);

    return {
      slug: data.slug,
      title: data.title,
      date: data.published_at || data.created_at,
      tags: data.tags || [],
      excerpt: data.excerpt,
      content: htmlContent,
      author: authorData?.full_name || 'Anonymous',
      readingTime,
    };
  } catch (error) {
    console.error('Error in getPostBySlug:', error);
    throw error;
  }
}

/**
 * Gets all posts metadata sorted by date (newest first)
 * 
 * @param includeDrafts - Whether to include draft posts (default: false)
 * @returns Array of post metadata sorted by date descending
 * 
 * @example
 * ```typescript
 * const posts = await getAllPostsMetadata();
 * console.log(posts[0].title); // Most recent post
 * ```
 */
export async function getAllPostsMetadata(includeDrafts = false): Promise<PostMetadata[]> {
  try {
    let query = supabase
      .from('posts')
      .select('slug, title, excerpt, tags, content, published_at, created_at, author_id')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (!includeDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts metadata:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get unique author IDs
    const authorIds = [...new Set(data.map(post => post.author_id))];
    
    // Fetch all authors
    const { data: authors } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', authorIds);

    // Create author lookup map
    const authorMap = new Map(authors?.map(a => [a.id, a.full_name]) || []);

    return data.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.published_at || post.created_at,
      tags: post.tags || [],
      excerpt: post.excerpt,
      author: authorMap.get(post.author_id) || 'Anonymous',
      readingTime: calculateReadingTime(post.content),
    }));
  } catch (error) {
    console.error('Error in getAllPostsMetadata:', error);
    return [];
  }
}

/**
 * Gets recent posts (limited number)
 * 
 * @param limit - Maximum number of posts to return
 * @param includeDrafts - Whether to include draft posts
 * @returns Array of recent post metadata
 * 
 * @example
 * ```typescript
 * const recentPosts = await getRecentPosts(5);
 * console.log(recentPosts.length); // Up to 5 posts
 * ```
 */
export async function getRecentPosts(limit: number, includeDrafts = false): Promise<PostMetadata[]> {
  const allPosts = await getAllPostsMetadata(includeDrafts);
  return allPosts.slice(0, limit);
}

/**
 * Gets posts by tag
 * 
 * @param tag - Tag to filter by
 * @returns Array of post metadata with the specified tag
 * 
 * @example
 * ```typescript
 * const posts = await getPostsByTag("nextjs");
 * ```
 */
export async function getPostsByTag(tag: string): Promise<PostMetadata[]> {
  try {
    const { data, error} = await supabase
      .from('posts')
      .select('slug, title, excerpt, tags, content, published_at, created_at, author_id')
      .eq('status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get unique author IDs and fetch authors
    const authorIds = [...new Set(data.map(post => post.author_id))];
    const { data: authors } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', authorIds);
    const authorMap = new Map(authors?.map(a => [a.id, a.full_name]) || []);

    return data.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.published_at || post.created_at,
      tags: post.tags || [],
      excerpt: post.excerpt,
      author: authorMap.get(post.author_id) || 'Anonymous',
      readingTime: calculateReadingTime(post.content),
    }));
  } catch (error) {
    console.error('Error in getPostsByTag:', error);
    return [];
  }
}

/**
 * Gets all unique tags from all published posts
 * 
 * @returns Array of unique tags sorted alphabetically
 * 
 * @example
 * ```typescript
 * const tags = await getAllTags();
 * console.log(tags); // ["javascript", "nextjs", "react", "typescript"]
 * ```
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    // Collect all tags and remove duplicates
    const allTags = new Set<string>();
    data?.forEach(post => {
      post.tags?.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
}

/**
 * Search posts by title or content
 * 
 * @param query - Search query
 * @returns Array of matching post metadata
 * 
 * @example
 * ```typescript
 * const results = await searchPosts("typescript");
 * ```
 */
export async function searchPosts(query: string): Promise<PostMetadata[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('slug, title, excerpt, tags, content, published_at, created_at, author_id')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get unique author IDs and fetch authors
    const authorIds = [...new Set(data.map(post => post.author_id))];
    const { data: authors } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', authorIds);
    const authorMap = new Map(authors?.map(a => [a.id, a.full_name]) || []);

    return data.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.published_at || post.created_at,
      tags: post.tags || [],
      excerpt: post.excerpt,
      author: authorMap.get(post.author_id) || 'Anonymous',
      readingTime: calculateReadingTime(post.content),
    }));
  } catch (error) {
    console.error('Error in searchPosts:', error);
    return [];
  }
}
