/**
 * Tag Interface
 * 
 * Defines the structure for content tags and tag-related data.
 * Tags are used to categorize and filter blog posts.
 */

import { PostMetadata } from './post.interface';

/**
 * Complete tag object with associated posts
 */
export interface Tag {
  /** Lowercase tag identifier (URL-safe) */
  name: string;
  
  /** Human-readable tag name (capitalized) */
  displayName: string;
  
  /** Number of posts associated with this tag */
  postCount: number;
  
  /** Array of post metadata for posts with this tag */
  posts: PostMetadata[];
}

/**
 * Tag summary for listing/navigation
 * Lightweight version without full post data
 */
export interface TagSummary {
  /** Lowercase tag identifier */
  name: string;
  
  /** Human-readable tag name */
  displayName: string;
  
  /** Number of posts with this tag */
  postCount: number;
}

/**
 * Type guard to check if an object is a valid Tag
 */
export function isTag(obj: unknown): obj is Tag {
  if (!obj || typeof obj !== 'object') return false;
  
  const tag = obj as Partial<Tag>;
  
  return (
    typeof tag.name === 'string' &&
    typeof tag.displayName === 'string' &&
    typeof tag.postCount === 'number' &&
    Array.isArray(tag.posts)
  );
}

/**
 * Type guard to check if an object is a valid TagSummary
 */
export function isTagSummary(obj: unknown): obj is TagSummary {
  if (!obj || typeof obj !== 'object') return false;
  
  const summary = obj as Partial<TagSummary>;
  
  return (
    typeof summary.name === 'string' &&
    typeof summary.displayName === 'string' &&
    typeof summary.postCount === 'number'
  );
}

/**
 * Converts a Tag to TagSummary by omitting posts array
 */
export function toTagSummary(tag: Tag): TagSummary {
  return {
    name: tag.name,
    displayName: tag.displayName,
    postCount: tag.postCount,
  };
}

/**
 * Normalizes a tag name to lowercase and URL-safe format
 */
export function normalizeTagName(tagName: string): string {
  return tagName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')    // Remove special characters
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Formats a tag name for display (capitalizes first letter)
 */
export function formatTagDisplayName(tagName: string): string {
  const normalized = normalizeTagName(tagName);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
