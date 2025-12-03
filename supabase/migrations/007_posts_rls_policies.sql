-- Migration: 007_posts_rls_policies.sql
-- Description: RLS policies for posts table
-- Date: 2025-12-03

-- Policy: Public can read published posts (not deleted)
CREATE POLICY "Public can read published posts"
ON posts FOR SELECT
USING (
  status = 'published' 
  AND deleted_at IS NULL
);

-- Policy: Authors can create their own posts
CREATE POLICY "Authors can create posts"
ON posts FOR INSERT
WITH CHECK (
  auth.uid() = author_id 
  AND get_user_role(auth.uid()) IN ('author', 'admin', 'super_admin')
);

-- Policy: Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON posts FOR UPDATE
USING (
  author_id = auth.uid()
  AND get_user_role(auth.uid()) IN ('author', 'admin', 'super_admin')
);

-- Policy: Admins can update any post
CREATE POLICY "Admins can update any post"
ON posts FOR UPDATE
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Authors can delete own posts, admins can delete any
CREATE POLICY "Authors can delete own posts"
ON posts FOR DELETE
USING (
  author_id = auth.uid()
  OR get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Policy: Authors/Admins can read all posts (including drafts)
CREATE POLICY "Authors can read all posts"
ON posts FOR SELECT
USING (
  get_user_role(auth.uid()) IN ('author', 'admin', 'super_admin')
);

-- Verify policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'posts';
