# Microblog CMS - Phase 2 Specifications

**Status**: Ready for Implementation  
**Created**: 2025-12-03  
**Phase**: 2 (Dynamic Features)

## Overview

Phase 2 specifications bổ sung các tính năng động cần thiết để hoàn thành 100% yêu cầu của assignment:
- **Comments System**: Cho phép người dùng comment và admin moderate
- **Authentication System**: Phân biệt admin/author với readers
- **Admin CMS Interface**: Dashboard quản lý posts và comments
- **Supabase Integration**: Database, storage, và authentication backend

## Current Implementation Status

### ✅ Phase 1 Complete (Static Features)
- Next.js 14 project setup with TypeScript
- TailwindCSS styling with typography plugin
- Markdown-based blog posts (filesystem)
- Tag system and filtering
- Timeline homepage
- Dynamic post pages
- SEO optimization
- 21 static pages, build successful

### ❌ Phase 2 Missing (Dynamic Features)
- Comments submission and display
- Comment moderation
- Supabase database integration
- Authentication (login/logout)
- Admin dashboard
- Post CRUD via UI
- Image upload

**Compliance**: Currently 60% (6/10 features from assignment)

## Specification Documents

### 1. Comments System (`comments-system/spec.md`)

**Priority**: P0 (CRITICAL)  
**Dependencies**: Supabase setup

**Key Features**:
- Comment submission form (name, email, content)
- Comment display with threading (1 level)
- Admin moderation (approve/reject/delete)
- Status workflow (pending → approved/rejected)
- Spam prevention (rate limiting, validation)
- Email notifications (optional)

**Database Tables**:
- `comments` table with RLS policies
- Status: pending | approved | rejected
- Parent-child relationship for threading

**API Endpoints**:
- `POST /api/comments` - Submit comment
- `GET /api/comments/[postSlug]` - Get approved comments
- `PUT /api/admin/comments/[id]/moderate` - Approve/reject
- `DELETE /api/admin/comments/[id]` - Delete

**Requirements**: 45 functional, 22 non-functional

---

### 2. Authentication System (`auth-system/spec.md`)

**Priority**: P0 (HIGH)  
**Dependencies**: Supabase setup

**Key Features**:
- Email/password authentication
- Magic link (passwordless) login
- Role-based access control (RBAC)
- Roles: super_admin, admin, author, reader
- Protected admin routes
- Session management (JWT tokens)
- Password reset flow
- User management page (super_admin only)

**Database Tables**:
- Uses Supabase `auth.users`
- `user_role_changes` log table
- `auth_events` log table

**API Endpoints**:
- `POST /api/auth/login` - Login
- `POST /api/auth/magic-link` - Send magic link
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current user
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/[id]/role` - Change role

**Requirements**: 50 functional, 16 non-functional

---

### 3. Admin CMS Interface (`admin-cms/spec.md`)

**Priority**: P0 (HIGH)  
**Dependencies**: Authentication system, Supabase setup

**Key Features**:
- Admin dashboard with statistics
- Posts management (CRUD)
- Markdown editor with live preview
- Tag management (rename, merge, delete)
- Comment moderation interface
- Image upload to Supabase Storage
- Auto-save drafts
- Post revisions history

**Pages**:
- `/admin/dashboard` - Overview
- `/admin/posts` - Posts list
- `/admin/posts/new` - Create post
- `/admin/posts/[id]/edit` - Edit post
- `/admin/comments` - Moderate comments
- `/admin/tags` - Manage tags
- `/admin/users` - User management (super_admin only)

**API Endpoints**:
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/posts` - List posts
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post
- `POST /api/admin/upload` - Upload image
- `GET /api/admin/tags` - List tags
- `PUT /api/admin/tags/[id]` - Update tag

**Requirements**: 65 functional, 18 non-functional

---

### 4. Supabase Setup Guide (`supabase-setup/setup-guide.md`)

**Priority**: P0 (CRITICAL)  
**Type**: Implementation Guide

**Steps**:
1. Create Supabase project
2. Setup database schema (8 tables)
3. Configure RLS policies
4. Create storage bucket
5. Configure authentication
6. Setup environment variables
7. Install client libraries
8. Test connection
9. Migrate existing content (optional)
10. Verification checklist

**Tables Created**:
- `posts` - Blog posts
- `comments` - User comments
- `tags` - Tag definitions
- `post_tags` - Many-to-many junction
- `user_role_changes` - Audit log
- `auth_events` - Auth log
- `post_revisions` - Edit history

**Estimated Time**: 2-3 hours

---

## Implementation Roadmap

### Phase 2A: Backend Foundation (Est. 8-10 hours)

**Priority: CRITICAL - Must complete first**

#### Step 1: Supabase Setup (2-3 hours)
- [ ] Create Supabase project
- [ ] Run all database migrations
- [ ] Configure RLS policies
- [ ] Create storage bucket
- [ ] Setup authentication
- [ ] Test database connection
- [ ] Migrate existing markdown posts to database

**Dependencies**: None  
**Blockers**: None  
**Output**: Working Supabase backend

#### Step 2: Authentication Implementation (3-4 hours)
- [ ] Install `@supabase/supabase-js`, `@supabase/ssr`
- [ ] Create Supabase client utilities (client, server, middleware)
- [ ] Implement login page (`/admin/login`)
- [ ] Implement logout functionality
- [ ] Setup middleware for protected routes
- [ ] Create first admin user
- [ ] Test login/logout flow

**Dependencies**: Step 1 (Supabase)  
**Blockers**: Database must be ready  
**Output**: Working authentication system

#### Step 3: Core API Routes (3-4 hours)
- [ ] `POST /api/comments` - Submit comment
- [ ] `GET /api/comments/[postSlug]` - Get comments
- [ ] `POST /api/auth/login` - Login endpoint
- [ ] `POST /api/auth/logout` - Logout endpoint
- [ ] `GET /api/auth/session` - Session check
- [ ] Test all API routes with Postman/Thunder Client

**Dependencies**: Step 1, 2  
**Blockers**: Auth must work first  
**Output**: Functional API layer

---

### Phase 2B: Comments System (Est. 6-8 hours)

**Priority: HIGH - Core feature**

#### Step 4: Comment Submission (2-3 hours)
- [ ] Create `CommentForm` component
- [ ] Add form to post pages
- [ ] Implement validation (name, email, content)
- [ ] Add rate limiting
- [ ] Show success/error messages
- [ ] Test submission flow

**Dependencies**: Step 3 (API)  
**Output**: Users can submit comments

#### Step 5: Comment Display (2-3 hours)
- [ ] Create `CommentsList` component
- [ ] Fetch and display approved comments
- [ ] Implement threading UI (1 level)
- [ ] Add reply functionality
- [ ] Show comment count
- [ ] Test on public post pages

**Dependencies**: Step 4  
**Output**: Comments visible on posts

#### Step 6: Comment Moderation (2-3 hours)
- [ ] Create `/admin/comments` page
- [ ] Display pending comments
- [ ] Implement approve/reject actions
- [ ] Add bulk actions
- [ ] Show moderation status
- [ ] Test moderation workflow

**Dependencies**: Step 2 (Auth), Step 3 (API)  
**Output**: Admins can moderate comments

---

### Phase 2C: Admin CMS (Est. 10-12 hours)

**Priority: HIGH - Admin functionality**

#### Step 7: Admin Dashboard (2-3 hours)
- [ ] Create `/admin/dashboard` page
- [ ] Fetch and display statistics
- [ ] Show recent posts
- [ ] Show pending comments
- [ ] Add quick action buttons
- [ ] Test dashboard data accuracy

**Dependencies**: Step 2 (Auth)  
**Output**: Working admin dashboard

#### Step 8: Post Management (4-5 hours)
- [ ] Create `/admin/posts` listing page
- [ ] Implement filters (status, search)
- [ ] Create `/admin/posts/new` form
- [ ] Create `/admin/posts/[id]/edit` form
- [ ] Build Markdown editor with preview
- [ ] Implement auto-save
- [ ] Add slug auto-generation
- [ ] Test CRUD operations

**Dependencies**: Step 2, 3  
**Output**: Admin can manage posts via UI

#### Step 9: Image Upload (2-3 hours)
- [ ] Implement upload to Supabase Storage
- [ ] Add upload button to editor
- [ ] Show upload progress
- [ ] Insert Markdown image syntax
- [ ] Test with various image formats

**Dependencies**: Step 1 (Supabase Storage)  
**Output**: Can upload images in editor

#### Step 10: Tag Management (1-2 hours)
- [ ] Create `/admin/tags` page
- [ ] Display tags with post counts
- [ ] Implement rename functionality
- [ ] Implement merge functionality
- [ ] Test tag operations

**Dependencies**: Step 2  
**Output**: Admin can manage tags

---

### Phase 2D: Polish & Deploy (Est. 4-6 hours)

**Priority: MEDIUM - Finishing touches**

#### Step 11: User Management (2-3 hours)
- [ ] Create `/admin/users` page (super_admin only)
- [ ] Display user list with roles
- [ ] Implement role change
- [ ] Add user search/filter
- [ ] Test permission checks

**Dependencies**: Step 2  
**Output**: Super admin can manage users

#### Step 12: Testing & Bug Fixes (1-2 hours)
- [ ] Test all user flows end-to-end
- [ ] Fix any bugs discovered
- [ ] Test responsive design on mobile
- [ ] Test accessibility
- [ ] Verify RLS policies work correctly

**Output**: Stable, bug-free application

#### Step 13: Documentation & Deployment (1-2 hours)
- [ ] Update README with new features
- [ ] Document environment variables
- [ ] Create deployment guide
- [ ] Deploy to Vercel/Cloudflare
- [ ] Test production deployment
- [ ] Update Supabase redirect URLs

**Output**: Live production application

---

## Total Effort Estimate

| Phase | Tasks | Hours | Priority |
|-------|-------|-------|----------|
| 2A: Backend Foundation | Steps 1-3 | 8-10 | CRITICAL |
| 2B: Comments System | Steps 4-6 | 6-8 | HIGH |
| 2C: Admin CMS | Steps 7-10 | 10-12 | HIGH |
| 2D: Polish & Deploy | Steps 11-13 | 4-6 | MEDIUM |
| **TOTAL** | **13 steps** | **28-36 hours** | - |

**Realistic Timeline**: 1-1.5 weeks (full-time) or 2-3 weeks (part-time)

---

## Success Criteria

### Functional Requirements
- [ ] Users can submit comments on posts
- [ ] Comments require moderation before appearing
- [ ] Admin can approve/reject comments
- [ ] Admin can login/logout
- [ ] Admin can create/edit/delete posts via UI
- [ ] Admin can upload images
- [ ] Admin can manage tags
- [ ] Super admin can manage user roles
- [ ] All data stored in Supabase
- [ ] RLS policies enforce permissions

### Non-Functional Requirements
- [ ] Application loads in < 3 seconds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Responsive on mobile
- [ ] Accessible (WCAG 2.1 Level AA)
- [ ] Deployed to Vercel/Cloudflare
- [ ] 100% compliant with assignment requirements

---

## Risk Assessment

### High Risk Items
1. **RLS Policy Complexity**: Policies are complex, may need debugging
   - *Mitigation*: Test with service role first, then add RLS gradually
2. **Data Migration**: Moving from filesystem to database
   - *Mitigation*: Create migration script, test with backup first
3. **Authentication Flow**: Supabase Auth + Next.js middleware can be tricky
   - *Mitigation*: Follow Supabase docs carefully, use SSR helpers

### Medium Risk Items
1. **Comment Threading**: UI complexity for nested replies
   - *Mitigation*: Limit to 1 level of nesting initially
2. **Image Upload**: Storage policies and file handling
   - *Mitigation*: Test extensively with various file types/sizes

### Low Risk Items
1. **Markdown Editor**: Many libraries available
2. **Dashboard Stats**: Straightforward SQL queries
3. **Tag Management**: Simple CRUD operations

---

## Technical Decisions

### Why Supabase?
- ✅ Specified in assignment requirements
- ✅ Provides auth, database, storage in one platform
- ✅ PostgreSQL with RLS for security
- ✅ Generous free tier
- ✅ Good Next.js integration

### Why Pages Router (not App Router)?
- ✅ Current implementation uses Pages Router
- ✅ More mature, stable ecosystem
- ✅ Simpler authentication patterns
- ⚠️ Consider App Router for future rewrite

### Why Markdown Editor (not Rich Text)?
- ✅ Assignment mentions "viết bài ngắn" (short posts)
- ✅ Markdown is lightweight, portable
- ✅ Already using Markdown for content
- ✅ Live preview provides WYSIWYG-like experience

---

## Reference Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
- [Assignment Requirements](../microblog-cms/requirements.md)

---

## Getting Help

If you encounter issues during implementation:

1. **Check Supabase Logs**: Dashboard > Database > Logs
2. **Test with Service Role**: Temporarily bypass RLS to isolate issues
3. **Review RLS Policies**: Common cause of "permission denied" errors
4. **Check Environment Variables**: Restart dev server after changes
5. **Consult Specs**: All requirements documented in detail

---

**Next Action**: Start with `supabase-setup/setup-guide.md` to create backend infrastructure.
