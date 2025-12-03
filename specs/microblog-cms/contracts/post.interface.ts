/**
 * Post Interface
 * 
 * Defines the structure of a blog post with metadata and content.
 * Used throughout the application for type safety.
 */

/**
 * Complete post object with full content
 */
export interface Post {
  /** Unique identifier derived from filename (without .md extension) */
  slug: string;
  
  /** Post title from front matter */
  title: string;
  
  /** Publication date in ISO 8601 format (YYYY-MM-DD) */
  date: string;
  
  /** Array of topic tags */
  tags: string[];
  
  /** Short description (from front matter or auto-generated from content) */
  excerpt: string;
  
  /** Full post content in HTML format (converted from Markdown) */
  content: string;
  
  /** Optional author name */
  author?: string;
  
  /** Optional estimated reading time in minutes */
  readingTime?: number;
}

/**
 * Post metadata without full content
 * Used for listing pages (timeline, tag pages) to reduce data transfer
 */
export interface PostMetadata {
  /** Unique identifier derived from filename */
  slug: string;
  
  /** Post title */
  title: string;
  
  /** Publication date in ISO 8601 format (YYYY-MM-DD) */
  date: string;
  
  /** Array of topic tags */
  tags: string[];
  
  /** Short description */
  excerpt: string;
  
  /** Optional author name */
  author?: string;
  
  /** Optional estimated reading time in minutes */
  readingTime?: number;
}

/**
 * Type guard to check if an object is a valid Post
 */
export function isPost(obj: unknown): obj is Post {
  if (!obj || typeof obj !== 'object') return false;
  
  const post = obj as Partial<Post>;
  
  return (
    typeof post.slug === 'string' &&
    typeof post.title === 'string' &&
    typeof post.date === 'string' &&
    Array.isArray(post.tags) &&
    typeof post.excerpt === 'string' &&
    typeof post.content === 'string'
  );
}

/**
 * Type guard to check if an object is valid PostMetadata
 */
export function isPostMetadata(obj: unknown): obj is PostMetadata {
  if (!obj || typeof obj !== 'object') return false;
  
  const metadata = obj as Partial<PostMetadata>;
  
  return (
    typeof metadata.slug === 'string' &&
    typeof metadata.title === 'string' &&
    typeof metadata.date === 'string' &&
    Array.isArray(metadata.tags) &&
    typeof metadata.excerpt === 'string'
  );
}

/**
 * Converts a Post to PostMetadata by omitting the content field
 */
export function toPostMetadata(post: Post): PostMetadata {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    excerpt: post.excerpt,
    author: post.author,
    readingTime: post.readingTime,
  };
}
