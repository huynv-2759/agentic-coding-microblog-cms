# Supabase Database Migrations

**Total Migrations**: 9  
**Estimated Time**: 10-15 minutes  
**Status**: Ready to run

## Overview

These SQL migrations create the complete database schema for Microblog CMS Phase 2, including:
- 7 tables (posts, comments, tags, post_tags, user_role_changes, auth_events, post_revisions)
- 25+ indexes for performance
- 40+ Row Level Security (RLS) policies
- Triggers for auto-updating timestamps

## How to Run Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Navigate to **SQL Editor** in left sidebar
3. Run each migration file in order (001 → 009)
4. Copy/paste the SQL content
5. Click "Run" or press Cmd/Ctrl + Enter
6. Verify no errors in output
7. Repeat for all 9 files

### Method 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

## Migration Files (Run in Order)

### 001_enable_uuid_extension.sql
- **Purpose**: Enable UUID generation
- **Time**: < 1 minute
- **Output**: UUID extension enabled

### 002_create_posts_table.sql
- **Purpose**: Create posts table with indexes and triggers
- **Time**: 1-2 minutes
- **Output**: `posts` table with 6 indexes, 1 trigger

### 003_create_comments_table.sql
- **Purpose**: Create comments table with threading support
- **Time**: 1-2 minutes
- **Output**: `comments` table with 5 indexes, 1 trigger

### 004_create_tags_tables.sql
- **Purpose**: Create tags and post_tags junction table
- **Time**: 1 minute
- **Output**: `tags` and `post_tags` tables with indexes

### 005_create_audit_tables.sql
- **Purpose**: Create audit and logging tables
- **Time**: 1-2 minutes
- **Output**: `user_role_changes`, `auth_events`, `post_revisions` tables

### 006_enable_rls.sql
- **Purpose**: Enable Row Level Security on all tables
- **Time**: 1 minute
- **Output**: RLS enabled, `get_user_role()` function created

### 007_posts_rls_policies.sql
- **Purpose**: Create RLS policies for posts table
- **Time**: 1-2 minutes
- **Output**: 6 policies on posts table

### 008_comments_rls_policies.sql
- **Purpose**: Create RLS policies for comments table
- **Time**: 1-2 minutes
- **Output**: 7 policies on comments table

### 009_tags_and_audit_rls_policies.sql
- **Purpose**: Create RLS policies for remaining tables
- **Time**: 2-3 minutes
- **Output**: 13 policies on tags, post_tags, audit tables

## Verification Checklist

After running all migrations, verify:

- [ ] All 7 tables exist in **Database → Tables**
- [ ] No errors in SQL Editor output
- [ ] RLS is enabled (green lock icon on tables)
- [ ] Run this query to verify policies:

```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('posts', 'comments', 'tags', 'post_tags', 'user_role_changes', 'auth_events', 'post_revisions')
GROUP BY tablename
ORDER BY tablename;
```

Expected output:
```
tablename            | policy_count
---------------------+-------------
auth_events          | 3
comments             | 7
post_revisions       | 3
post_tags            | 3
posts                | 6
tags                 | 2
user_role_changes    | 2
```

**Total policies**: 26

## Troubleshooting

### Error: "relation already exists"
- **Solution**: Table already created. Skip that migration or drop table first:
  ```sql
  DROP TABLE IF EXISTS table_name CASCADE;
  ```

### Error: "permission denied"
- **Solution**: Make sure you're logged in as project owner

### Error: "function does not exist"
- **Solution**: Run migrations in order. Some depend on previous ones.

### Error: "violates foreign key constraint"
- **Solution**: Ensure auth.users table exists (it should by default)

## Rollback (if needed)

To rollback all changes:

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS post_revisions CASCADE;
DROP TABLE IF EXISTS auth_events CASCADE;
DROP TABLE IF EXISTS user_role_changes CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Next Steps

After migrations complete:

1. ✅ Verify all tables and policies
2. 🔄 Configure Storage bucket (see `PHASE_2A_START.md`)
3. 🔄 Configure Authentication (email provider)
4. 🔄 Create first admin user
5. 🔄 Install Supabase client libraries (`npm install @supabase/supabase-js @supabase/ssr`)

---

**Created**: 2025-12-03  
**Last Updated**: 2025-12-03  
**Maintained By**: Development Team
