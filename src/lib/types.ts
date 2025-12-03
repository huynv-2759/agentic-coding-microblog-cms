/**
 * TypeScript type definitions for the Microblog CMS
 * 
 * This file contains all shared types and interfaces used throughout the application.
 * It re-exports types from the contracts directory for convenience.
 */

/**
 * Represents a complete blog post with all metadata and rendered content
 */
export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  author?: string;
  readingTime?: number;
}

/**
 * Represents post metadata without full content
 * Used for listing pages to reduce data transfer
 */
export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  author?: string;
  readingTime?: number;
}

/**
 * Represents a tag with associated posts
 */
export interface Tag {
  name: string;
  displayName: string;
  postCount: number;
  posts: PostMetadata[];
}

/**
 * Tag summary for listing
 */
export interface TagSummary {
  name: string;
  displayName: string;
  postCount: number;
}

/**
 * Front matter schema for Markdown files
 */
export interface FrontMatter {
  title: string;
  date: string;
  tags: string[];
  excerpt?: string;
  author?: string;
  draft?: boolean;
}

/**
 * User roles in the system
 */
export type UserRole = 'super_admin' | 'admin' | 'author' | 'reader';

/**
 * Represents an authenticated user
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Represents an authentication session
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Magic link request
 */
export interface MagicLinkRequest {
  email: string;
}

/**
 * Auth event types for logging
 */
export type AuthEventType = 
  | 'login' 
  | 'logout' 
  | 'failed_login' 
  | 'magic_link_sent' 
  | 'magic_link_used' 
  | 'session_expired'
  | 'password_reset';

/**
 * Auth event log entry
 */
export interface AuthEvent {
  id: string;
  userId?: string;
  eventType: AuthEventType;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Validates front matter against schema
 * @throws Error if validation fails
 */
export function validateFrontMatter(data: unknown): FrontMatter {
  if (!data || typeof data !== 'object') {
    throw new Error('Front matter must be an object');
  }
  
  const fm = data as Partial<FrontMatter>;
  
  if (!fm.title || typeof fm.title !== 'string') {
    throw new Error('Front matter must have a string "title" field');
  }
  
  if (!fm.date || typeof fm.date !== 'string') {
    throw new Error('Front matter must have a string "date" field');
  }
  
  // Date format validation (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  
  if (!fm.tags || !Array.isArray(fm.tags)) {
    throw new Error('Front matter must have a "tags" array');
  }
  
  return {
    title: fm.title,
    date: fm.date,
    tags: fm.tags,
    excerpt: fm.excerpt,
    author: fm.author,
    draft: fm.draft ?? false,
  };
}
