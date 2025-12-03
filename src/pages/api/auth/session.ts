/**
 * Session Check API Endpoint
 * 
 * Returns current user session and authentication status.
 * Used by frontend to verify authentication state.
 * 
 * GET /api/auth/session
 * 
 * Response (200) - Authenticated:
 * {
 *   "authenticated": true,
 *   "user": {
 *     "id": "uuid",
 *     "email": "admin@example.com",
 *     "role": "admin",
 *     "displayName": "John Doe"
 *   },
 *   "session": {
 *     "expiresAt": "2025-12-03T11:30:00Z"
 *   }
 * }
 * 
 * Response (401) - Not authenticated:
 * {
 *   "authenticated": false,
 *   "message": "No active session"
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(req, res);

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return res.status(401).json({
        authenticated: false,
        message: 'No active session',
      });
    }

    // Get user data
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({
        authenticated: false,
        message: 'User not found',
      });
    }

    // Prepare response
    const userData = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'reader',
      displayName: user.user_metadata?.display_name || 
                   user.user_metadata?.full_name || 
                   user.email,
    };

    const sessionData = {
      expiresAt: new Date(session.expires_at! * 1000).toISOString(),
    };

    return res.status(200).json({
      authenticated: true,
      user: userData,
      session: sessionData,
    });

  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check session',
    });
  }
}
