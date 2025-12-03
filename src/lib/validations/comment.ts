/**
 * Comment Validation Schemas
 * 
 * Zod schemas for validating comment input on both client and server side.
 * Provides type-safe validation with detailed error messages.
 * 
 * Usage:
 * ```ts
 * import { commentSubmissionSchema } from '@/lib/validations/comment';
 * 
 * const result = commentSubmissionSchema.safeParse(data);
 * if (!result.success) {
 *   console.error(result.error.flatten());
 * }
 * ```
 */

import { z } from 'zod';

/**
 * Name validation
 * - Required
 * - Minimum 2 characters
 * - Maximum 100 characters
 * - Trimmed
 */
const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

/**
 * Email validation
 * - Required
 * - Valid email format
 * - Normalized to lowercase
 * - Trimmed
 */
const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .toLowerCase();

/**
 * Comment content validation
 * - Required
 * - Minimum 10 characters
 * - Maximum 2000 characters
 * - Trimmed
 */
const contentSchema = z
  .string()
  .trim()
  .min(10, 'Comment must be at least 10 characters')
  .max(2000, 'Comment must not exceed 2000 characters');

/**
 * Post slug validation
 * - Required
 * - Must be a valid slug format (alphanumeric with hyphens)
 */
const postSlugSchema = z
  .string()
  .trim()
  .min(1, 'Post slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid post slug format');

/**
 * Parent comment ID validation
 * - Optional
 * - Must be a valid UUID if provided
 */
const parentIdSchema = z
  .string()
  .uuid('Invalid parent comment ID')
  .optional()
  .nullable();

/**
 * Complete comment submission schema
 * 
 * Used for validating new comment submissions from users.
 */
export const commentSubmissionSchema = z.object({
  postSlug: postSlugSchema,
  authorName: nameSchema,
  authorEmail: emailSchema,
  content: contentSchema,
  parentId: parentIdSchema,
});

/**
 * Comment moderation schema
 * 
 * Used for admin moderation actions (approve/reject/delete).
 */
export const commentModerationSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
  action: z.enum(['approve', 'reject', 'delete']),
});

/**
 * Bulk comment moderation schema
 * 
 * Used for bulk moderation actions on multiple comments.
 */
export const bulkCommentModerationSchema = z.object({
  commentIds: z
    .array(z.string().uuid())
    .min(1, 'At least one comment must be selected')
    .max(50, 'Cannot moderate more than 50 comments at once'),
  action: z.enum(['approve', 'reject', 'delete']),
});

/**
 * Comment filter schema
 * 
 * Used for filtering comments in admin interface.
 */
export const commentFilterSchema = z.object({
  status: z
    .enum(['all', 'pending', 'approved', 'rejected'])
    .default('all'),
  postSlug: z.string().optional(),
  authorEmail: z.string().email().optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0),
});

/**
 * Type exports derived from schemas
 */
export type CommentSubmission = z.infer<typeof commentSubmissionSchema>;
export type CommentModeration = z.infer<typeof commentModerationSchema>;
export type BulkCommentModeration = z.infer<typeof bulkCommentModerationSchema>;
export type CommentFilter = z.infer<typeof commentFilterSchema>;

/**
 * Validation error formatter
 * 
 * Converts Zod error to user-friendly format.
 */
export function formatValidationError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  });
  
  return formatted;
}

/**
 * Sanitize comment content
 * 
 * Removes potentially dangerous content while preserving basic formatting.
 * - Strips all HTML tags except whitelisted ones
 * - Removes scripts and event handlers
 * - Preserves line breaks
 */
export function sanitizeCommentContent(content: string): string {
  // Remove script tags and their content
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  
  // For now, strip all HTML tags (can be extended to allow safe tags)
  // Allowed tags could be: <strong>, <em>, <a>, <p>, <br>
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  return sanitized.trim();
}

/**
 * Check if content contains potential spam patterns
 * 
 * Returns true if content is likely spam.
 */
export function isLikelySpam(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // Spam keywords
  const spamKeywords = [
    'viagra',
    'casino',
    'lottery',
    'click here',
    'buy now',
    'make money fast',
    'work from home',
    'weight loss',
  ];
  
  // Check for spam keywords
  if (spamKeywords.some(keyword => lowerContent.includes(keyword))) {
    return true;
  }
  
  // Check for excessive URLs (more than 3)
  const urlCount = (content.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) {
    return true;
  }
  
  // Check for excessive capitalization (more than 50%)
  const upperCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 20 && upperCount / letterCount > 0.5) {
    return true;
  }
  
  return false;
}
