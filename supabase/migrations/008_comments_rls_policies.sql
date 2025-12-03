-- Migration: 008_comments_rls_policies.sql
-- Description: RLS policies for comments table
-- Date: 2025-12-03

-- Policy: Public can read approved comments
CREATE POLICY "Public can read approved comments"
ON comments FOR SELECT
USING (status = 'approved');

-- Policy: Anyone can create comments (anonymous submissions)
CREATE POLICY "Anyone can create comments"
ON comments FOR INSERT
WITH CHECK (true);

-- Policy: Admins can read all comments
CREATE POLICY "Admins can read all comments"
ON comments FOR SELECT
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Authors can read comments on their own posts
CREATE POLICY "Authors can read comments on own posts"
ON comments FOR SELECT
USING (
  get_user_role(auth.uid()) = 'author'
  AND post_slug IN (
    SELECT slug FROM posts WHERE author_id = auth.uid()
  )
);

-- Policy: Admins can update any comment (moderation)
CREATE POLICY "Admins can moderate comments"
ON comments FOR UPDATE
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Authors can moderate comments on their own posts
CREATE POLICY "Authors can moderate own post comments"
ON comments FOR UPDATE
USING (
  get_user_role(auth.uid()) = 'author'
  AND post_slug IN (
    SELECT slug FROM posts WHERE author_id = auth.uid()
  )
);

-- Policy: Admins can delete comments
CREATE POLICY "Admins can delete comments"
ON comments FOR DELETE
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Verify policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'comments';
