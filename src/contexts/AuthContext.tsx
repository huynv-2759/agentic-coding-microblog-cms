/**
 * Authentication Context Provider
 * 
 * Provides authentication state and methods throughout the application.
 * Uses Supabase Auth for authentication management.
 * 
 * Usage:
 * ```tsx
 * import { useAuth } from '@/contexts/AuthContext';
 * 
 * function MyComponent() {
 *   const { user, session, login, logout, loading } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not logged in</div>;
 *   
 *   return <div>Welcome, {user.displayName}!</div>;
 * }
 * ```
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User, AuthSession, LoginCredentials, MagicLinkRequest, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  roleLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  loginWithMagicLink: (request: MagicLinkRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Converts Supabase user and session to our User type
 */
function mapSupabaseUser(supabaseUser: SupabaseUser, session: Session): User {
  const metadata = supabaseUser.user_metadata || {};
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role: (metadata.role as UserRole) || 'reader',
    displayName: metadata.display_name || metadata.full_name || supabaseUser.email || 'Anonymous',
    createdAt: supabaseUser.created_at,
    lastLogin: metadata.last_login,
  };
}

/**
 * Converts Supabase session to our AuthSession type
 */
function mapSupabaseSession(session: Session, user: User): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: new Date(session.expires_at! * 1000).toISOString(),
    user,
  };
}

/**
 * Auth Provider Component
 * 
 * Wraps the application to provide authentication context.
 * Automatically handles session refresh and user state updates.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const supabase = createBrowserClient();

  /**
   * Initialize auth state from Supabase session
   */
  useEffect(() => {
    let isInitialized = false;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user, session);
        // Set default role first for faster loading
        mappedUser.role = 'reader';
        setUser(mappedUser);
        setSession(mapSupabaseSession(session, mappedUser));
        
        // Then fetch real role
        setRoleLoading(true);
        try {
          const response = await fetch(`/api/auth/get-role?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            mappedUser.role = data.role || 'reader';
            setUser({...mappedUser}); // Update with real role
          }
        } catch (err) {
          console.error('Failed to fetch role:', err);
        } finally {
          setRoleLoading(false);
        }
      }
      setLoading(false);
      isInitialized = true;
    }).catch(err => {
      console.error('Auth session error:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip initial SIGNED_IN event if we already initialized
      if (event === 'SIGNED_IN' && isInitialized) {
        return;
      }
      
      console.log('Auth state change:', event);
      
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user, session);
        mappedUser.role = 'reader'; // Default
        setUser(mappedUser);
        setSession(mapSupabaseSession(session, mappedUser));
        
        // Fetch real role
        setRoleLoading(true);
        try {
          const response = await fetch(`/api/auth/get-role?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            mappedUser.role = data.role || 'reader';
            setUser({...mappedUser});
          }
        } catch (err) {
          console.error('Failed to fetch role:', err);
        } finally {
          setRoleLoading(false);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login with email and password
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        // Log failed login attempt
        await logAuthEvent('failed_login', false, { email: credentials.email });
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        // Update last login time
        await supabase.auth.updateUser({
          data: { last_login: new Date().toISOString() }
        });

        // Log successful login
        await logAuthEvent('login', true, { user_id: data.user.id });

        const mappedUser = mapSupabaseUser(data.user, data.session);
        setUser(mappedUser);
        setSession(mapSupabaseSession(data.session, mappedUser));
        
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during login' 
      };
    }
  };

  /**
   * Login with magic link (passwordless)
   */
  const loginWithMagicLink = async (request: MagicLinkRequest) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: request.email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Log magic link sent
      await logAuthEvent('magic_link_sent', true, { email: request.email });

      return { success: true };
    } catch (error) {
      console.error('Magic link error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      };
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      const userId = user?.id;
      
      // Log logout event before signing out
      if (userId) {
        await logAuthEvent('logout', true, { user_id: userId });
      }

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Refresh the current session
   */
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.session?.user) {
        const mappedUser = mapSupabaseUser(data.session.user, data.session);
        setUser(mappedUser);
        setSession(mapSupabaseSession(data.session, mappedUser));
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setUser(null);
      setSession(null);
    }
  };

  /**
   * Log authentication event to database
   */
  const logAuthEvent = async (
    eventType: string,
    success: boolean,
    metadata: Record<string, unknown>
  ) => {
    try {
      await supabase.from('auth_events').insert({
        user_id: metadata.user_id || null,
        event_type: eventType,
        success,
        metadata,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      // Don't throw - logging failures shouldn't break auth flow
      console.error('Auth event logging error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    roleLoading,
    login,
    loginWithMagicLink,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Higher-order component to require authentication
 * 
 * Usage:
 * ```tsx
 * export default withAuth(MyProtectedPage);
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, roleLoading } = useAuth();

    if (loading || roleLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      return null;
    }

    // Check role if specified
    if (requiredRole) {
      const roleHierarchy: Record<UserRole, number> = {
        reader: 0,
        author: 1,
        admin: 2,
        super_admin: 3,
      };

      if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">403 Forbidden</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}
