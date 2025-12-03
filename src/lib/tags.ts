/**
 * Tag Management Utilities
 * 
 * Handles tag extraction, filtering, and tag-based post queries.
 */

import { PostMetadata, Tag, TagSummary } from './types';
import { getAllPostsMetadata } from './posts';

/**
 * Gets all unique tags from all posts
 * 
 * @returns Promise<Array of tag summaries sorted alphabetically>
 * 
 * @example
 * ```typescript
 * const tags = await getAllTags();
 * console.log(tags); // [{ name: "nextjs", displayName: "Nextjs", postCount: 5 }, ...]
 * ```
 */
export async function getAllTags(): Promise<TagSummary[]> {
  const posts = await getAllPostsMetadata();
  const tagCounts = new Map<string, number>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([name, postCount]) => ({
      name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      postCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gets all posts for a specific tag
 * 
 * @param tagName - Tag to filter by (case-insensitive)
 * @returns Promise<Tag object with associated posts>
 * 
 * @example
 * ```typescript
 * const tag = await getPostsByTag("nextjs");
 * console.log(tag.postCount); // 5
 * console.log(tag.posts); // Array of posts with "nextjs" tag
 * ```
 */
export async function getPostsByTag(tagName: string): Promise<Tag> {
  const allPosts = await getAllPostsMetadata();
  const normalizedTagName = tagName.toLowerCase();
  
  const posts = allPosts.filter(post => 
    post.tags.some(tag => tag.toLowerCase() === normalizedTagName)
  );
  
  return {
    name: normalizedTagName,
    displayName: normalizedTagName.charAt(0).toUpperCase() + normalizedTagName.slice(1),
    postCount: posts.length,
    posts,
  };
}

/**
 * Gets all tag names for generating static paths
 * 
 * @returns Promise<Array of lowercase tag names>
 * 
 * @example
 * ```typescript
 * const tagNames = await getAllTagNames();
 * console.log(tagNames); // ["nextjs", "typescript", "react"]
 * ```
 */
export async function getAllTagNames(): Promise<string[]> {
  const tags = await getAllTags();
  return tags.map(tag => tag.name);
}

/**
 * Gets the most popular tags (by post count)
 * 
 * @param limit - Maximum number of tags to return
 * @returns Promise<Array of tag summaries sorted by post count (descending)>
 * 
 * @example
 * ```typescript
 * const popularTags = await getPopularTags(5);
 * console.log(popularTags[0].name); // Most popular tag
 * ```
 */
export async function getPopularTags(limit?: number): Promise<TagSummary[]> {
  const tags = await getAllTags();
  const sorted = tags.sort((a, b) => b.postCount - a.postCount);
  return limit ? sorted.slice(0, limit) : sorted;
}
