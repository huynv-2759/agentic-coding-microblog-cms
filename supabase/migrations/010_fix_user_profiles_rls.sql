-- ============================================
-- FIX: user_profiles RLS Policies
-- ============================================
-- Problem: Policy in migration 000 causes infinite recursion
-- Solution: Use get_user_role() function instead of querying table

-- Drop the broken policy
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;

-- Create fixed policy using get_user_role() function
-- This breaks the recursion because it doesn't query user_profiles
CREATE POLICY "Super admins can manage all profiles"
  ON user_profiles
  FOR ALL
  USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- Verify the fix
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
