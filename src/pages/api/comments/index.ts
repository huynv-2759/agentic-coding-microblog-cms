/**
 * Comments API Endpoint
 * 
 * POST: Submit a new comment (public, no auth required)
 * 
 * POST /api/comments
 * Request Body:
 * {
 *   "postSlug": "my-post",
 *   "authorName": "John Doe",
 *   "authorEmail": "john@example.com",
 *   "content": "Great article!"
 * }
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "message": "Your comment is awaiting moderation",
 *   "commentId": "uuid"
 * }
 * 
 * Response (400):
 * {
 *   "error": "Validation Error",
 *   "message": "Invalid input",
 *   "details": { "authorName": "Name is required" }
 * }
 * 
 * Response (429):
 * {
 *   "error": "Rate Limit Exceeded",
 *   "message": "Too many comments. Please slow down."
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

// In-memory rate limiting (for production, use Redis or database)
const commentAttempts = new Map<string, { count: number; resetAt: number }>();

// Rate limit: 3 comments per minute per email
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in ms

// Validation constants
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
const CONTENT_MIN_LENGTH = 10;
const CONTENT_MAX_LENGTH = 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CommentInput {
  postSlug: string;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string | null;
}

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate comment input
 */
function validateComment(input: Partial<CommentInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate post slug
  if (!input.postSlug || typeof input.postSlug !== 'string') {
    errors.postSlug = 'Post slug is required';
  }

  // Validate author name
  if (!input.authorName || typeof input.authorName !== 'string') {
    errors.authorName = 'Name is required';
  } else {
    const trimmedName = input.authorName.trim();
    if (trimmedName.length < NAME_MIN_LENGTH) {
      errors.authorName = `Name must be at least ${NAME_MIN_LENGTH} characters`;
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      errors.authorName = `Name must not exceed ${NAME_MAX_LENGTH} characters`;
    }
  }

  // Validate email
  if (!input.authorEmail || typeof input.authorEmail !== 'string') {
    errors.authorEmail = 'Email is required';
  } else if (!EMAIL_REGEX.test(input.authorEmail.trim())) {
    errors.authorEmail = 'Valid email is required';
  }

  // Validate content
  if (!input.content || typeof input.content !== 'string') {
    errors.content = 'Comment is required';
  } else {
    const trimmedContent = input.content.trim();
    if (trimmedContent.length < CONTENT_MIN_LENGTH) {
      errors.content = `Comment must be at least ${CONTENT_MIN_LENGTH} characters`;
    } else if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      errors.content = `Comment must not exceed ${CONTENT_MAX_LENGTH} characters`;
    }
  }

  return errors;
}

/**
 * Sanitize comment content (remove dangerous HTML)
 */
function sanitizeContent(content: string): string {
  // Remove all HTML tags except safe ones
  // For now, strip all HTML - can extend later to allow <strong>, <em>, <a>
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Check rate limit for comment submission
 */
function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempt = commentAttempts.get(email);

  // Clean up old entries
  if (attempt && now > attempt.resetAt) {
    commentAttempts.delete(email);
  }

  const current = commentAttempts.get(email);

  if (!current) {
    commentAttempts.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (current.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: RATE_LIMIT - current.count };
}

/**
 * Get client IP address
 */
function getClientIp(req: NextApiRequest): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || null;
  
  // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Validate IP format (basic check)
  if (ip && !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && !/^[0-9a-fA-F:]+$/.test(ip)) {
    return null; // Invalid IP format
  }
  
  return ip;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST for comment submission
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const input: Partial<CommentInput> = req.body;

    // Validate input
    const errors = validateComment(input);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input',
        details: errors,
      });
    }

    // Type assertion after validation
    const validInput = input as CommentInput;

    // Normalize email
    const normalizedEmail = validInput.authorEmail.trim().toLowerCase();

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(normalizedEmail);
    if (!allowed) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many comments. Please wait a minute and try again.',
        retryAfter: 60,
      });
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(validInput.content);
    const trimmedName = validInput.authorName.trim();

    // Get client IP (may be null if invalid)
    const clientIp = getClientIp(req);

    // Insert comment into database
    const supabase = createClient(req, res);
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_slug: validInput.postSlug,
        author_name: trimmedName,
        author_email: normalizedEmail,
        content: sanitizedContent,
        parent_id: validInput.parentId || null,
        status: 'pending',
        ip_address: clientIp, // Store actual IP or null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Comment insertion error:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to save comment. Please try again.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Your comment is awaiting moderation. Thank you!',
      commentId: data.id,
      remaining,
    });

  } catch (error) {
    console.error('Comment API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
