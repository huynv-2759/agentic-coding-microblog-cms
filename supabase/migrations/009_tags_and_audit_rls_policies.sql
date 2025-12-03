-- Migration: 009_tags_and_audit_rls_policies.sql
-- Description: RLS policies for tags, post_tags, and audit tables
-- Date: 2025-12-03

-- ============================================
-- TAGS TABLE POLICIES
-- ============================================

-- Policy: Public can read all tags
CREATE POLICY "Public can read tags"
ON tags FOR SELECT
USING (true);

-- Policy: Admins can manage tags
CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- ============================================
-- POST_TAGS TABLE POLICIES
-- ============================================

-- Policy: Public can read post-tag relationships
CREATE POLICY "Public can read post_tags"
ON post_tags FOR SELECT
USING (true);

-- Policy: Authors can manage tags on their own posts
CREATE POLICY "Authors can manage own post tags"
ON post_tags FOR ALL
USING (
  post_id IN (
    SELECT id FROM posts WHERE author_id = auth.uid()
  )
);

-- Policy: Admins can manage all post tags
CREATE POLICY "Admins can manage all post tags"
ON post_tags FOR ALL
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- ============================================
-- USER_ROLE_CHANGES TABLE POLICIES
-- ============================================

-- Policy: Super admins can read all role changes
CREATE POLICY "Super admins can read role changes"
ON user_role_changes FOR SELECT
USING (
  get_user_role(auth.uid()) = 'super_admin'
);

-- Policy: Super admins can create role change records
CREATE POLICY "Super admins can log role changes"
ON user_role_changes FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) = 'super_admin'
);

-- ============================================
-- AUTH_EVENTS TABLE POLICIES
-- ============================================

-- Policy: Users can read their own auth events
CREATE POLICY "Users can read own auth events"
ON auth_events FOR SELECT
USING (user_id = auth.uid());

-- Policy: Super admins can read all auth events
CREATE POLICY "Super admins can read all auth events"
ON auth_events FOR SELECT
USING (
  get_user_role(auth.uid()) = 'super_admin'
);

-- Policy: System can insert auth events (via service role)
CREATE POLICY "System can log auth events"
ON auth_events FOR INSERT
WITH CHECK (true);

-- ============================================
-- POST_REVISIONS TABLE POLICIES
-- ============================================

-- Policy: Authors can read revisions of their own posts
CREATE POLICY "Authors can read own post revisions"
ON post_revisions FOR SELECT
USING (
  post_id IN (
    SELECT id FROM posts WHERE author_id = auth.uid()
  )
);

-- Policy: Admins can read all revisions
CREATE POLICY "Admins can read all revisions"
ON post_revisions FOR SELECT
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: System can create revisions
CREATE POLICY "System can create revisions"
ON post_revisions FOR INSERT
WITH CHECK (true);

-- Verify all policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('tags', 'post_tags', 'user_role_changes', 'auth_events', 'post_revisions')
GROUP BY tablename;
