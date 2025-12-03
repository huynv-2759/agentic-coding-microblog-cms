/**
 * Logout API Endpoint
 * 
 * Handles user logout and session cleanup.
 * Logs logout events for audit trail.
 * 
 * POST /api/auth/logout
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 * 
 * Response (500):
 * {
 *   "error": "Internal Server Error",
 *   "message": "Failed to logout"
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

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
    const supabase = createClient(req, res);

    // Get current user before logout
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Log logout event before signing out
    if (userId) {
      await supabase.from('auth_events').insert({
        user_id: userId,
        event_type: 'logout',
        success: true,
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent'],
        metadata: {},
      });
    }

    // Sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        error: 'Logout Failed',
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('Logout API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during logout',
    });
  }
}
