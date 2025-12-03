# Supabase Setup Guide for Microblog CMS

**Version**: 1.0.0  
**Created**: 2025-12-03  
**Status**: Implementation Ready  
**Estimated Time**: 2-3 hours

## Overview

Guide chi tiết để setup Supabase project từ đầu, bao gồm database schema, RLS policies, storage buckets, và environment configuration cho Microblog CMS.

## Prerequisites

- [ ] Supabase account (free tier is sufficient)
- [ ] Node.js 18+ installed
- [ ] Next.js project already initialized
- [ ] Git repository setup

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Login

1. Visit [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended for easy deployment)

### 1.2 Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name**: `microblog-cms` (or your preferred name)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Free tier is fine for development
3. Click "Create new project"
4. Wait 2-3 minutes for project to be provisioned

### 1.3 Save Credentials

Once project is ready, go to **Settings > API**:

```env
# Copy these values to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (keep secret!)
```

**IMPORTANT**: 
- `ANON_KEY` is safe to use in client-side code
- `SERVICE_ROLE_KEY` should ONLY be used server-side (bypasses RLS)

---

## Step 2: Database Schema Setup

### 2.1 Enable UUID Extension

Go to **SQL Editor** and run:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2.2 Create Posts Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  auto_save_data JSONB
);

-- Indexes for performance
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_posts_deleted ON posts(deleted_at) WHERE deleted_at IS NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Create Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_address INET,
  user_agent TEXT,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post ON comments(post_slug);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
CREATE INDEX idx_comments_email ON comments(author_email);

-- Trigger for updated_at
CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.4 Create Tags Table

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);
```

### 2.5 Create Post-Tags Junction Table

```sql
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
```

### 2.6 Create User Role Changes Log

```sql
CREATE TABLE user_role_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_role_changes_user ON user_role_changes(user_id);
CREATE INDEX idx_role_changes_date ON user_role_changes(created_at DESC);
```

### 2.7 Create Auth Events Log

```sql
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_events_user ON auth_events(user_id);
CREATE INDEX idx_auth_events_type ON auth_events(event_type);
CREATE INDEX idx_auth_events_date ON auth_events(created_at DESC);
```

### 2.8 Create Post Revisions Table

```sql
CREATE TABLE post_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_revisions_post ON post_revisions(post_id);
CREATE INDEX idx_revisions_date ON post_revisions(created_at DESC);
```

---

## Step 3: Row Level Security (RLS) Policies

### 3.1 Enable RLS on All Tables

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;
```

### 3.2 Helper Function for User Role

```sql
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT (auth.users.raw_user_meta_data->>'role')::TEXT
    FROM auth.users
    WHERE auth.users.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 Posts Table Policies

```sql
-- Public can read published posts (not deleted)
CREATE POLICY "Public can read published posts"
ON posts FOR SELECT
USING (
  status = 'published' 
  AND deleted_at IS NULL
);

-- Authors can create their own posts
CREATE POLICY "Authors can create posts"
ON posts FOR INSERT
WITH CHECK (
  auth.uid() = author_id 
  AND get_user_role(auth.uid()) IN ('author', 'admin', 'super_admin')
);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON posts FOR UPDATE
USING (
  author_id = auth.uid()
  AND get_user_role(auth.uid()) IN ('author', 'admin', 'super_admin')
);

-- Admins can update any post
CREATE POLICY "Admins can update any post"
ON posts FOR UPDATE
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Authors can delete own posts, admins can delete any
CREATE POLICY "Authors can delete own posts"
ON posts FOR DELETE
USING (
  author_id = auth.uid()
  OR get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Authors/Admins can read all posts (including drafts)
CREATE POLICY "Authors can read all posts"
ON posts FOR SELECT
USING (
  get_user_role(auth.uid()) IN ('author', 'admin', 'super_admin')
);
```

### 3.4 Comments Table Policies

```sql
-- Public can read approved comments
CREATE POLICY "Public can read approved comments"
ON comments FOR SELECT
USING (status = 'approved');

-- Public can create comments (anonymous submissions)
CREATE POLICY "Anyone can create comments"
ON comments FOR INSERT
WITH CHECK (true);

-- Admins can read all comments
CREATE POLICY "Admins can read all comments"
ON comments FOR SELECT
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Authors can read comments on their own posts
CREATE POLICY "Authors can read comments on own posts"
ON comments FOR SELECT
USING (
  get_user_role(auth.uid()) = 'author'
  AND post_slug IN (
    SELECT slug FROM posts WHERE author_id = auth.uid()
  )
);

-- Admins can update any comment (moderation)
CREATE POLICY "Admins can moderate comments"
ON comments FOR UPDATE
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Authors can moderate comments on their own posts
CREATE POLICY "Authors can moderate own post comments"
ON comments FOR UPDATE
USING (
  get_user_role(auth.uid()) = 'author'
  AND post_slug IN (
    SELECT slug FROM posts WHERE author_id = auth.uid()
  )
);

-- Admins can delete comments
CREATE POLICY "Admins can delete comments"
ON comments FOR DELETE
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);
```

### 3.5 Tags Table Policies

```sql
-- Public can read all tags
CREATE POLICY "Public can read tags"
ON tags FOR SELECT
USING (true);

-- Admins can manage tags
CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);
```

### 3.6 Post Tags Policies

```sql
-- Public can read post-tag relationships
CREATE POLICY "Public can read post_tags"
ON post_tags FOR SELECT
USING (true);

-- Authors can manage tags on their own posts
CREATE POLICY "Authors can manage own post tags"
ON post_tags FOR ALL
USING (
  post_id IN (
    SELECT id FROM posts WHERE author_id = auth.uid()
  )
);

-- Admins can manage all post tags
CREATE POLICY "Admins can manage all post tags"
ON post_tags FOR ALL
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);
```

### 3.7 User Role Changes Policies

```sql
-- Super admins can read all role changes
CREATE POLICY "Super admins can read role changes"
ON user_role_changes FOR SELECT
USING (
  get_user_role(auth.uid()) = 'super_admin'
);

-- Super admins can create role change records
CREATE POLICY "Super admins can log role changes"
ON user_role_changes FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) = 'super_admin'
);
```

### 3.8 Auth Events Policies

```sql
-- Users can read their own auth events
CREATE POLICY "Users can read own auth events"
ON auth_events FOR SELECT
USING (user_id = auth.uid());

-- Super admins can read all auth events
CREATE POLICY "Super admins can read all auth events"
ON auth_events FOR SELECT
USING (
  get_user_role(auth.uid()) = 'super_admin'
);

-- System can insert auth events (via service role)
CREATE POLICY "System can log auth events"
ON auth_events FOR INSERT
WITH CHECK (true);
```

### 3.9 Post Revisions Policies

```sql
-- Authors can read revisions of their own posts
CREATE POLICY "Authors can read own post revisions"
ON post_revisions FOR SELECT
USING (
  post_id IN (
    SELECT id FROM posts WHERE author_id = auth.uid()
  )
);

-- Admins can read all revisions
CREATE POLICY "Admins can read all revisions"
ON post_revisions FOR SELECT
USING (
  get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- System can create revisions
CREATE POLICY "System can create revisions"
ON post_revisions FOR INSERT
WITH CHECK (true);
```

---

## Step 4: Storage Setup

### 4.1 Create Storage Bucket for Images

1. Go to **Storage** in Supabase dashboard
2. Click "Create bucket"
3. Settings:
   - **Name**: `post-images`
   - **Public**: ✅ (so images can be viewed without auth)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### 4.2 Storage Policies

Go to **Storage > post-images > Policies**:

```sql
-- Allow public to view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
```

**Folder structure convention**:
```
post-images/
  └── {user_id}/
      ├── image-1.jpg
      ├── image-2.png
      └── ...
```

---

## Step 5: Authentication Configuration

### 5.1 Enable Email Provider

1. Go to **Authentication > Providers**
2. Email provider should be enabled by default
3. Configuration:
   - **Enable email confirmations**: ✅ (for production)
   - **Enable email change confirmations**: ✅
   - **Secure email change**: ✅

### 5.2 Configure Email Templates

Go to **Authentication > Email Templates**:

**Confirm signup template**:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

**Magic Link template**:
```html
<h2>Login to Microblog CMS</h2>
<p>Click this link to log in:</p>
<p><a href="{{ .Token }}">Log in</a></p>
<p>This link expires in 1 hour.</p>
```

**Password Reset template**:
```html
<h2>Reset your password</h2>
<p>Click this link to reset your password:</p>
<p><a href="{{ .Token }}">Reset password</a></p>
<p>This link expires in 1 hour.</p>
```

### 5.3 Configure Redirect URLs

Go to **Authentication > URL Configuration**:

- **Site URL**: `http://localhost:3000` (development)
- **Redirect URLs** (add these):
  - `http://localhost:3000/admin/login`
  - `http://localhost:3000/auth/callback`
  - `https://your-production-domain.com/admin/login` (add when deploying)
  - `https://your-production-domain.com/auth/callback`

### 5.4 Create First Admin User

Go to **Authentication > Users > Add user** (or via SQL):

```sql
-- Via SQL Editor (get user ID from result)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@example.com',
  crypt('YourSecurePassword123', gen_salt('bf')),
  NOW(),
  '{"role": "super_admin", "display_name": "Admin User"}'::jsonb
);
```

**OR** use Supabase Dashboard:
1. Go to **Authentication > Users**
2. Click "Add user"
3. Fill in:
   - Email: `admin@example.com`
   - Password: Strong password
   - Auto Confirm User: ✅
4. After creation, click user → Edit user
5. Add to **User Metadata**:
   ```json
   {
     "role": "super_admin",
     "display_name": "Admin User"
   }
   ```

---

## Step 6: Environment Variables Setup

### 6.1 Create `.env.local` File

In your Next.js project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6.2 Update `.gitignore`

Ensure these are ignored:

```gitignore
# Local env files
.env*.local
.env

# Supabase
.supabase/
```

### 6.3 Add Example File `.env.example`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 7: Install Supabase Client Libraries

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 7.1 Create Supabase Client Utilities

**`src/lib/supabase/client.ts`** (for client-side):

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`src/lib/supabase/server.ts`** (for server-side):

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  );
}
```

**`src/lib/supabase/middleware.ts`** (for middleware):

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

---

## Step 8: Testing Database Connection

### 8.1 Create Test API Route

**`src/pages/api/test-db.ts`**:

```typescript
import { createClient } from '@/lib/supabase/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient();
  
  // Test posts query
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .limit(5);
  
  // Test comments query
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .limit(5);
  
  if (postsError || commentsError) {
    return res.status(500).json({
      error: 'Database query failed',
      details: { postsError, commentsError }
    });
  }
  
  return res.status(200).json({
    message: 'Database connection successful',
    data: { posts, comments }
  });
}
```

### 8.2 Test in Browser

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/test-db`
3. Should see success message (with empty arrays if no data yet)

---

## Step 9: Migrate Existing Content (Optional)

If you have existing Markdown posts in `content/posts/`:

### 9.1 Create Migration Script

**`scripts/migrate-to-supabase.ts`**:

```typescript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS
);

async function migrate() {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    const slug = file.replace('.md', '');
    
    // Insert post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: frontmatter.title,
        slug,
        content,
        excerpt: frontmatter.excerpt || '',
        tags: frontmatter.tags || [],
        status: 'published',
        author_id: 'your-admin-user-id', // Replace with actual admin user ID
        published_at: new Date(frontmatter.date),
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error migrating ${file}:`, error);
    } else {
      console.log(`✅ Migrated: ${file}`);
    }
  }
  
  console.log('Migration complete!');
}

migrate();
```

### 9.2 Run Migration

```bash
npx ts-node scripts/migrate-to-supabase.ts
```

---

## Step 10: Verification Checklist

- [ ] Supabase project created and provisioned
- [ ] All tables created successfully
- [ ] All indexes created
- [ ] RLS enabled on all tables
- [ ] RLS policies created and working
- [ ] Storage bucket `post-images` created
- [ ] Storage policies configured
- [ ] Email provider enabled
- [ ] First admin user created with `super_admin` role
- [ ] `.env.local` file configured with correct keys
- [ ] Supabase client libraries installed
- [ ] Client/Server/Middleware utilities created
- [ ] Test API route returns successful connection
- [ ] Can query posts and comments tables (even if empty)
- [ ] Authentication works (can login with admin user)

---

## Troubleshooting

### Issue: "relation does not exist"

**Solution**: Make sure you ran all SQL commands in order. Check **Database > Tables** to verify tables exist.

### Issue: RLS policies blocking queries

**Solution**: 
1. Check that user has correct role in `user_metadata`
2. Verify `get_user_role()` function exists and works
3. Test with service role key temporarily to isolate RLS issues

### Issue: Storage upload fails

**Solution**:
1. Verify bucket name is correct (`post-images`)
2. Check storage policies are created
3. Ensure user is authenticated
4. Check file size < 5MB

### Issue: Authentication redirect not working

**Solution**:
1. Check redirect URLs in **Authentication > URL Configuration**
2. Verify `NEXT_PUBLIC_SITE_URL` is correct
3. Check callback route exists (`/auth/callback`)

### Issue: Environment variables not loading

**Solution**:
1. Restart Next.js dev server after changing `.env.local`
2. Verify no typos in variable names
3. Check `.env.local` is in project root
4. Make sure variables start with `NEXT_PUBLIC_` for client-side access

---

## Next Steps

After completing this setup:

1. ✅ **Implement Authentication System** (see `specs/auth-system/spec.md`)
2. ✅ **Implement Comments System** (see `specs/comments-system/spec.md`)
3. ✅ **Implement Admin CMS** (see `specs/admin-cms/spec.md`)
4. ✅ **Deploy to Vercel/Cloudflare**
5. ✅ **Update production environment variables**

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Enable email confirmations
- [ ] Set up custom SMTP (optional, but recommended)
- [ ] Review and tighten RLS policies
- [ ] Set up database backups
- [ ] Enable point-in-time recovery (PITR)
- [ ] Set up monitoring and alerts
- [ ] Review storage limits and upgrade if needed
- [ ] Add production environment variables to hosting platform

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Maintained by**: Development Team  
**Support**: [Supabase Docs](https://supabase.com/docs)
