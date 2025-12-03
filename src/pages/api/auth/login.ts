/**
 * Login API Endpoint
 * 
 * Handles user authentication with email/password.
 * Logs authentication events and implements rate limiting.
 * 
 * POST /api/auth/login
 * 
 * Request Body:
 * {
 *   "email": "admin@example.com",
 *   "password": "password123",
 *   "rememberMe": true
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "user": { id, email, role, displayName },
 *   "session": { accessToken, refreshToken, expiresAt }
 * }
 * 
 * Response (401):
 * {
 *   "error": "Authentication Failed",
 *   "message": "Invalid email or password"
 * }
 * 
 * Response (429):
 * {
 *   "error": "Rate Limit Exceeded",
 *   "message": "Too many login attempts. Try again in 15 minutes."
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

// In-memory rate limiting (for production, use Redis or database)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Rate limit: 5 attempts per 15 minutes per IP
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  // Clean up old entries
  if (attempt && now > attempt.resetAt) {
    loginAttempts.delete(ip);
  }

  const current = loginAttempts.get(ip);

  if (!current) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (current.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: RATE_LIMIT - current.count };
}

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0] 
    : req.socket.remoteAddress || 'unknown';
  return ip;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    // Check rate limit
    const clientIp = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(clientIp);

    if (!allowed) {
      // Log failed attempt
      const supabase = createClient(req, res);
      await supabase.from('auth_events').insert({
        event_type: 'failed_login',
        success: false,
        ip_address: clientIp,
        user_agent: req.headers['user-agent'],
        metadata: { 
          reason: 'rate_limit_exceeded',
          email 
        },
      });

      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many login attempts. Please try again in 15 minutes.',
      });
    }

    // Attempt login
    const supabase = createClient(req, res);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      // Log failed login
      await supabase.from('auth_events').insert({
        event_type: 'failed_login',
        success: false,
        ip_address: clientIp,
        user_agent: req.headers['user-agent'],
        metadata: { 
          reason: error?.message || 'unknown',
          email 
        },
      });

      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password',
      });
    }

    // Update user metadata with last login
    await supabase.auth.updateUser({
      data: { last_login: new Date().toISOString() }
    });

    // Log successful login
    await supabase.from('auth_events').insert({
      user_id: data.user.id,
      event_type: 'login',
      success: true,
      ip_address: clientIp,
      user_agent: req.headers['user-agent'],
      metadata: { 
        remember_me: rememberMe,
        email 
      },
    });

    // Prepare response
    const user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'reader',
      displayName: data.user.user_metadata?.display_name || 
                   data.user.user_metadata?.full_name || 
                   data.user.email,
    };

    const session = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
    };

    return res.status(200).json({
      success: true,
      user,
      session,
    });

  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during login',
    });
  }
}
