# Detailed Task Breakdown: Microblog CMS - Phase 2

**Generated**: 2025-12-03  
**Based on**: [plan.md](./plan.md)  
**Status**: Ready for Implementation  
**Total Estimate**: 28-36 hours across 4 phases

---

## Phase 2A: Backend Foundation (8-10 hours)

### Task Group 2A.1: Supabase Project Setup (3 hours)

#### Task 2A.1.1: Create Supabase project and save credentials
- **Priority**: P0 (Critical - Blocks everything)
- **Estimate**: 30 minutes
- **Dependencies**: None
- **Acceptance Criteria**:
  - [ ] Supabase account created
  - [ ] New project created with strong database password
  - [ ] Project provisioned successfully (wait 2-3 min)
  - [ ] Copied project URL to `.env.local`
  - [ ] Copied ANON_KEY to `.env.local`
  - [ ] Copied SERVICE_ROLE_KEY to `.env.local` (keep secret!)
  - [ ] `.env.example` created with placeholder values
  - [ ] `.env.local` added to `.gitignore`
- **Output**: `.env.local` file with Supabase credentials
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 1)

#### Task 2A.1.2: Create database schema - Core tables
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.1.1
- **Acceptance Criteria**:
  - [ ] UUID extension enabled
  - [ ] `posts` table created with all columns
  - [ ] `comments` table created with all columns
  - [ ] `tags` table created
  - [ ] `post_tags` junction table created
  - [ ] All indexes created (slug, status, author_id, post_slug, etc.)
  - [ ] `update_updated_at_column()` trigger function created
  - [ ] Triggers applied to posts and comments tables
  - [ ] Verified tables exist in Database > Tables
- **Output**: 4 core tables in Supabase database
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 2.1-2.5)

#### Task 2A.1.3: Create database schema - Audit tables
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.1.2
- **Acceptance Criteria**:
  - [ ] `user_role_changes` table created
  - [ ] `auth_events` table created
  - [ ] `post_revisions` table created
  - [ ] All indexes created
  - [ ] Verified all 7 tables exist
- **Output**: 3 audit/log tables in database
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 2.6-2.8)

#### Task 2A.1.4: Enable Row Level Security (RLS)
- **Priority**: P0 (Critical - Security requirement)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.1.3
- **Acceptance Criteria**:
  - [ ] RLS enabled on all 7 tables
  - [ ] `get_user_role()` helper function created
  - [ ] Function tested with sample user
  - [ ] All tables locked down (no access without policies)
  - [ ] Verified RLS enabled in Table Editor > Policies
- **Output**: RLS enabled on all tables
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 3.1-3.2)

---

### Task Group 2A.2: RLS Policies Configuration (2 hours)

#### Task 2A.2.1: Create Posts table RLS policies
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.1.4
- **Acceptance Criteria**:
  - [ ] "Public can read published posts" policy created
  - [ ] "Authors can create posts" policy created
  - [ ] "Authors can update own posts" policy created
  - [ ] "Admins can update any post" policy created
  - [ ] "Authors can delete own posts" policy created
  - [ ] "Authors can read all posts" policy created (including drafts)
  - [ ] All 6 policies tested with different roles
- **Output**: 6 RLS policies on posts table
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 3.3)

#### Task 2A.2.2: Create Comments table RLS policies
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.1.4
- **Acceptance Criteria**:
  - [ ] "Public can read approved comments" policy created
  - [ ] "Anyone can create comments" policy created
  - [ ] "Admins can read all comments" policy created
  - [ ] "Authors can read comments on own posts" policy created
  - [ ] "Admins can moderate comments" policy created
  - [ ] "Authors can moderate own post comments" policy created
  - [ ] "Admins can delete comments" policy created
  - [ ] All 7 policies tested
- **Output**: 7 RLS policies on comments table
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 3.4)

#### Task 2A.2.3: Create Tags and audit table RLS policies
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.1.4
- **Acceptance Criteria**:
  - [ ] Tags table policies (public read, admin manage)
  - [ ] Post_tags table policies (public read, author/admin manage)
  - [ ] User_role_changes policies (super_admin only)
  - [ ] Auth_events policies (users read own, super_admin read all)
  - [ ] Post_revisions policies (authors read own, admins read all)
  - [ ] All policies tested
- **Output**: RLS policies on 5 remaining tables
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 3.5-3.9)

---

### Task Group 2A.3: Storage and Authentication Setup (1 hour)

#### Task 2A.3.1: Create and configure Storage bucket
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.1.1
- **Acceptance Criteria**:
  - [ ] Storage bucket `post-images` created
  - [ ] Bucket set to public
  - [ ] File size limit set to 5MB
  - [ ] Allowed MIME types configured (jpeg, png, gif, webp)
  - [ ] Storage policies created (public view, auth upload, own delete)
  - [ ] Test upload works
- **Output**: Configured storage bucket for images
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 4)

#### Task 2A.3.2: Configure authentication providers
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.1.1
- **Acceptance Criteria**:
  - [ ] Email provider enabled (default)
  - [ ] Email confirmations enabled
  - [ ] Email change confirmations enabled
  - [ ] Redirect URLs configured (localhost:3000, production later)
  - [ ] Email templates customized (optional)
  - [ ] Site URL set correctly
- **Output**: Configured authentication
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 5.1-5.3)

#### Task 2A.3.3: Create first admin user
- **Priority**: P0 (Critical - Need admin to test)
- **Estimate**: 15 minutes
- **Dependencies**: Task 2A.3.2
- **Acceptance Criteria**:
  - [ ] Admin user created via Dashboard or SQL
  - [ ] Email confirmed
  - [ ] User metadata set with `role: "super_admin"`
  - [ ] Display name set
  - [ ] Can login successfully
  - [ ] User ID saved for testing
- **Output**: Super admin user account
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 5.4)

---

### Task Group 2A.4: Supabase Client Setup (1.5 hours)

#### Task 2A.4.1: Install Supabase dependencies
- **Priority**: P0 (Critical)
- **Estimate**: 15 minutes
- **Dependencies**: None
- **Acceptance Criteria**:
  - [ ] `@supabase/supabase-js` installed
  - [ ] `@supabase/ssr` installed
  - [ ] `package.json` updated
  - [ ] `node_modules` contains packages
  - [ ] TypeScript recognizes imports
- **Output**: Supabase packages installed
- **Command**: `npm install @supabase/supabase-js @supabase/ssr`

#### Task 2A.4.2: Create Supabase client utilities
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.4.1
- **Acceptance Criteria**:
  - [ ] `src/lib/supabase/client.ts` created (browser client)
  - [ ] `src/lib/supabase/server.ts` created (server client with cookies)
  - [ ] `src/lib/supabase/middleware.ts` created (middleware helper)
  - [ ] All files use environment variables
  - [ ] TypeScript types correct
  - [ ] Test imports work
- **Output**: 3 Supabase client utility files
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 7.1)

#### Task 2A.4.3: Create test API route for database connection
- **Priority**: P0 (Critical - Validates setup)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.4.2
- **Acceptance Criteria**:
  - [ ] `src/pages/api/test-db.ts` created
  - [ ] Route queries posts table
  - [ ] Route queries comments table
  - [ ] Returns success response
  - [ ] Handles errors gracefully
  - [ ] Tested at `http://localhost:3000/api/test-db`
  - [ ] Returns 200 OK with data (empty arrays OK)
- **Output**: Working test API route
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 8)

---

### Task Group 2A.5: Authentication Implementation (3 hours)

#### Task 2A.5.1: Create authentication types and context
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.4.2
- **Acceptance Criteria**:
  - [ ] `src/lib/types.ts` extended with User, Session interfaces
  - [ ] `src/contexts/AuthContext.tsx` created
  - [ ] Context provides user, session, login, logout functions
  - [ ] Context uses Supabase Auth
  - [ ] TypeScript types complete
- **Output**: Auth context and types
- **Reference**: `specs/auth-system/spec.md`

#### Task 2A.5.2: Create login page
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.5.1
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/login.tsx` created
  - [ ] Form with email and password inputs
  - [ ] "Remember me" checkbox
  - [ ] "Send Magic Link" option
  - [ ] Form validation (email format, password min length)
  - [ ] Error messages display
  - [ ] Success redirects to `/admin/dashboard`
  - [ ] Loading state during login
  - [ ] Mobile responsive
- **Output**: Login page component
- **Reference**: `specs/auth-system/spec.md` (UI/UX section)

#### Task 2A.5.3: Create login API endpoint
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.5.1
- **Acceptance Criteria**:
  - [ ] `src/pages/api/auth/login.ts` created
  - [ ] Handles email/password login
  - [ ] Returns JWT token on success
  - [ ] Returns 401 on invalid credentials
  - [ ] Logs auth event to `auth_events` table
  - [ ] Rate limiting implemented (5 attempts per 15min)
  - [ ] Tested with valid/invalid credentials
- **Output**: Login API endpoint
- **Reference**: `specs/auth-system/spec.md` (API section)

#### Task 2A.5.4: Create logout functionality
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.5.1
- **Acceptance Criteria**:
  - [ ] `src/pages/api/auth/logout.ts` created
  - [ ] Clears Supabase session
  - [ ] Clears cookies
  - [ ] Logs auth event
  - [ ] Returns success response
  - [ ] Tested logout flow
- **Output**: Logout API endpoint
- **Reference**: `specs/auth-system/spec.md`

#### Task 2A.5.5: Create authentication middleware
- **Priority**: P0 (Critical - Protects admin routes)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.5.1
- **Acceptance Criteria**:
  - [ ] `middleware.ts` created in project root
  - [ ] Checks session on `/admin/*` routes
  - [ ] Redirects to login if no session
  - [ ] Checks user role from JWT
  - [ ] Returns 403 if insufficient permissions
  - [ ] Allows `/admin/login` without auth
  - [ ] Tested with auth and without
- **Output**: Auth middleware
- **Reference**: `specs/auth-system/spec.md` (Middleware section)

---

### Task Group 2A.6: Core API Routes (2 hours)

#### Task 2A.6.1: Create session check API endpoint
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/api/auth/session.ts` created
  - [ ] Returns current user and session
  - [ ] Returns 401 if no session
  - [ ] Includes user role in response
  - [ ] Tested with valid/invalid tokens
- **Output**: Session API endpoint
- **Reference**: `specs/auth-system/spec.md`

#### Task 2A.6.2: Create comments submission API endpoint
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.2.2
- **Acceptance Criteria**:
  - [ ] `src/pages/api/comments/index.ts` created (POST)
  - [ ] Validates input (name, email, content)
  - [ ] Validates email format
  - [ ] Checks rate limiting (3 per hour per IP)
  - [ ] Inserts comment with status="pending"
  - [ ] Returns 201 Created on success
  - [ ] Returns 429 on rate limit exceeded
  - [ ] Tested with valid/invalid data
- **Output**: Comment submission API
- **Reference**: `specs/comments-system/spec.md` (API section)

#### Task 2A.6.3: Create get comments API endpoint
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.2.2
- **Acceptance Criteria**:
  - [ ] `src/pages/api/comments/[postSlug].ts` created (GET)
  - [ ] Returns approved comments for post
  - [ ] Orders by created_at ASC (oldest first)
  - [ ] Includes parent_id for threading
  - [ ] Returns empty array if no comments
  - [ ] Tested with various post slugs
- **Output**: Get comments API
- **Reference**: `specs/comments-system/spec.md`

#### Task 2A.6.4: Create admin stats API endpoint
- **Priority**: P1 (Important for dashboard)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/stats.ts` created (GET)
  - [ ] Requires authentication (admin/author role)
  - [ ] Returns total posts, published, drafts
  - [ ] Returns total comments, pending
  - [ ] Returns recent posts (last 5)
  - [ ] Returns recent comments (last 10)
  - [ ] Authors see only own stats
  - [ ] Admins see all stats
  - [ ] Tested with different roles
- **Output**: Admin stats API
- **Reference**: `specs/admin-cms/spec.md` (API section)

---

### Phase 2A Success Criteria

**All tasks must pass before moving to Phase 2B**:

- [ ] Supabase project fully configured with 7 tables
- [ ] All RLS policies created and tested
- [ ] Storage bucket configured for images
- [ ] Authentication working (login/logout)
- [ ] First admin user can login
- [ ] Middleware protects `/admin/*` routes
- [ ] Test API route returns successful connection
- [ ] Core API routes working (session, comments, stats)
- [ ] All Phase 2A acceptance criteria met (60+ items)

**Estimated Total**: 8-10 hours  
**Critical Path**: Setup (3h) → Auth (3h) → API (2h) → Testing (1h)

---

## Phase 2B: Comments System (6-8 hours)

### Task Group 2B.1: Comment Submission (2-3 hours)

#### Task 2B.1.1: Create comment validation schemas
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: None
- **Acceptance Criteria**:
  - [ ] Install `zod` validation library
  - [ ] `src/lib/validations/comment.ts` created
  - [ ] Schema for comment submission (name, email, content)
  - [ ] Name: 2-100 chars required
  - [ ] Email: valid format required
  - [ ] Content: 10-2000 chars required
  - [ ] Parent_id: optional UUID
  - [ ] TypeScript types exported
  - [ ] Tested with valid/invalid data
- **Output**: Comment validation schemas
- **Command**: `npm install zod`

#### Task 2B.1.2: Create CommentForm component
- **Priority**: P0 (Critical)
- **Estimate**: 1.5 hours
- **Dependencies**: Task 2B.1.1
- **Acceptance Criteria**:
  - [ ] `src/components/comments/CommentForm.tsx` created
  - [ ] Form with name, email, content fields
  - [ ] Real-time validation with Zod
  - [ ] Error messages display inline
  - [ ] Submit button disabled during submission
  - [ ] Success message after submission
  - [ ] Form clears after success
  - [ ] Loading state shown
  - [ ] Mobile responsive
  - [ ] TypeScript typed
- **Output**: CommentForm component
- **Reference**: `specs/comments-system/spec.md` (UI/UX section)

#### Task 2B.1.3: Integrate CommentForm into post pages
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2B.1.2
- **Acceptance Criteria**:
  - [ ] `src/pages/posts/[slug].tsx` updated
  - [ ] CommentForm rendered below post content
  - [ ] Post slug passed to form
  - [ ] Form conditionally renders (only if comments enabled)
  - [ ] Tested on multiple posts
- **Output**: Comment form on post pages
- **Reference**: `specs/comments-system/spec.md`

#### Task 2B.1.4: Implement rate limiting for comment submission
- **Priority**: P0 (Critical - Security)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.6.2
- **Acceptance Criteria**:
  - [ ] Track submissions per IP address
  - [ ] Limit: 3 comments per hour per IP
  - [ ] Return 429 error with retry-after header
  - [ ] Clear message shown to user
  - [ ] Tested with rapid submissions
  - [ ] Rate limit resets after 1 hour
- **Output**: Rate limiting on API
- **Reference**: `specs/comments-system/spec.md` (FR-C-028)

---

### Task Group 2B.2: Comment Display (2-3 hours)

#### Task 2B.2.1: Create CommentItem component
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: None
- **Acceptance Criteria**:
  - [ ] `src/components/comments/CommentItem.tsx` created
  - [ ] Displays author name, date, content
  - [ ] Formats date as "X days ago"
  - [ ] Shows gravatar or default avatar
  - [ ] "Reply" button (for threading)
  - [ ] Nested styling for child comments
  - [ ] Mobile responsive
  - [ ] TypeScript typed
- **Output**: CommentItem component
- **Reference**: `specs/comments-system/spec.md` (UI/UX)

#### Task 2B.2.2: Create CommentsList component
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2B.2.1
- **Acceptance Criteria**:
  - [ ] `src/components/comments/CommentsList.tsx` created
  - [ ] Fetches comments for post slug
  - [ ] Groups parent and child comments (1 level threading)
  - [ ] Renders tree structure
  - [ ] Shows "No comments yet" if empty
  - [ ] Shows comment count
  - [ ] Loading state while fetching
  - [ ] Error state if fetch fails
  - [ ] TypeScript typed
- **Output**: CommentsList component
- **Reference**: `specs/comments-system/spec.md`

#### Task 2B.2.3: Integrate CommentsList into post pages
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2B.2.2
- **Acceptance Criteria**:
  - [ ] `src/pages/posts/[slug].tsx` updated
  - [ ] CommentsList rendered below CommentForm
  - [ ] Post slug passed to list
  - [ ] Section header "Comments (X)"
  - [ ] Tested with posts with/without comments
- **Output**: Comments visible on posts
- **Reference**: `specs/comments-system/spec.md`

#### Task 2B.2.4: Implement comment threading (reply functionality)
- **Priority**: P1 (Important)
- **Estimate**: 1 hour
- **Dependencies**: Task 2B.2.3, Task 2B.1.2
- **Acceptance Criteria**:
  - [ ] "Reply" button shows reply form
  - [ ] Reply form includes parent_id
  - [ ] Reply indented under parent
  - [ ] Limit nesting to 1 level (no reply to reply)
  - [ ] Cancel button hides reply form
  - [ ] Tested threading works
- **Output**: Comment threading
- **Reference**: `specs/comments-system/spec.md` (FR-C-017)

---

### Task Group 2B.3: Comment Moderation (2-3 hours)

#### Task 2B.3.1: Create admin comments list page
- **Priority**: P0 (Critical)
- **Estimate**: 1.5 hours
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/comments.tsx` created
  - [ ] Protected route (requires admin/author role)
  - [ ] Fetches all comments (or own post comments for authors)
  - [ ] Table with: Post, Author, Content (truncated), Status, Date, Actions
  - [ ] Filter tabs: All, Pending, Approved, Rejected
  - [ ] Default to "Pending" tab
  - [ ] Search by post title or author
  - [ ] Pagination (20 per page)
  - [ ] Mobile responsive (table → cards on small screens)
  - [ ] TypeScript typed
- **Output**: Admin comments page
- **Reference**: `specs/admin-cms/spec.md` (UI/UX section)

#### Task 2B.3.2: Create comment moderation API endpoints
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/comments/index.ts` created (GET all)
  - [ ] `src/pages/api/admin/comments/[id]/moderate.ts` (PUT approve/reject)
  - [ ] `src/pages/api/admin/comments/[id].ts` (DELETE)
  - [ ] Requires authentication
  - [ ] Checks admin/author role
  - [ ] Authors can only moderate own post comments
  - [ ] Admins can moderate all comments
  - [ ] Updates comment status
  - [ ] Returns updated comment
  - [ ] Tested with different roles
- **Output**: 3 moderation API endpoints
- **Reference**: `specs/admin-cms/spec.md` (API section)

#### Task 2B.3.3: Implement approve/reject/delete actions
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2B.3.1, Task 2B.3.2
- **Acceptance Criteria**:
  - [ ] Approve button updates status to "approved"
  - [ ] Reject button updates status to "rejected"
  - [ ] Delete button permanently deletes (with confirmation)
  - [ ] Optimistic UI updates
  - [ ] Success/error toast messages
  - [ ] Button states (loading, disabled)
  - [ ] Tested all three actions
  - [ ] Approved comments appear on public site
  - [ ] Rejected comments don't appear
- **Output**: Working moderation actions
- **Reference**: `specs/comments-system/spec.md` (FR-C-036 to FR-C-038)

#### Task 2B.3.4: Implement bulk moderation actions
- **Priority**: P1 (Important)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2B.3.3
- **Acceptance Criteria**:
  - [ ] Checkboxes for selecting multiple comments
  - [ ] "Select All" checkbox
  - [ ] Bulk approve button
  - [ ] Bulk reject button
  - [ ] Confirmation dialog for bulk actions
  - [ ] Progress indicator for bulk operations
  - [ ] Tested with 5+ comments selected
- **Output**: Bulk moderation
- **Reference**: `specs/admin-cms/spec.md` (FR-D-045)

---

### Phase 2B Success Criteria

**All tasks must pass before moving to Phase 2C**:

- [ ] Users can submit comments on post pages
- [ ] Comment validation works (inline errors)
- [ ] Rate limiting prevents spam (3/hour per IP)
- [ ] Comments display in threaded format
- [ ] Reply functionality works (1 level)
- [ ] Admin can view all comments
- [ ] Authors can view comments on own posts
- [ ] Admin can approve/reject/delete comments
- [ ] Bulk moderation works
- [ ] Approved comments visible on public site
- [ ] Rejected comments not visible
- [ ] All Phase 2B acceptance criteria met (50+ items)

**Estimated Total**: 6-8 hours  
**Critical Path**: Form (2h) → Display (2h) → Moderation (3h) → Testing (1h)

---

## Phase 2C: Admin CMS (10-12 hours)

### Task Group 2C.1: Admin Dashboard (2-3 hours)

#### Task 2C.1.1: Create admin layout component
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/components/admin/AdminLayout.tsx` created
  - [ ] AdminNavbar with logo, nav links, user menu
  - [ ] Navigation: Dashboard, Posts, Comments, Tags, Users (if super_admin)
  - [ ] User dropdown: Profile, Settings, Logout
  - [ ] Mobile hamburger menu
  - [ ] Responsive design
  - [ ] Used by all admin pages
  - [ ] TypeScript typed
- **Output**: AdminLayout component
- **Reference**: `specs/auth-system/spec.md` (UI/UX)

#### Task 2C.1.2: Create dashboard stats widgets
- **Priority**: P0 (Critical)
- **Estimate**: 1.5 hours
- **Dependencies**: Task 2A.6.4
- **Acceptance Criteria**:
  - [ ] `src/components/admin/Dashboard.tsx` created
  - [ ] StatCard component for metrics
  - [ ] Displays: Total Posts, Total Comments, Pending Comments, Authors
  - [ ] Pending Comments badge (red if > 0)
  - [ ] Recent posts list (last 5)
  - [ ] Recent comments list (last 10)
  - [ ] Quick action buttons: "New Post", "Moderate Comments"
  - [ ] Loading state while fetching
  - [ ] Mobile responsive (2x2 grid → 1 column)
  - [ ] TypeScript typed
- **Output**: Dashboard component
- **Reference**: `specs/admin-cms/spec.md` (UI/UX - Dashboard)

#### Task 2C.1.3: Create admin dashboard page
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2C.1.1, Task 2C.1.2
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/dashboard.tsx` created
  - [ ] Protected route (requires auth)
  - [ ] Uses AdminLayout
  - [ ] Renders Dashboard component
  - [ ] Fetches stats from API
  - [ ] Authors see only own stats
  - [ ] Admins see all stats
  - [ ] Tested with both roles
- **Output**: Dashboard page
- **Reference**: `specs/admin-cms/spec.md`

---

### Task Group 2C.2: Posts Management (4-5 hours)

#### Task 2C.2.1: Create posts list API endpoints
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/posts/index.ts` created (GET, POST)
  - [ ] GET: Returns all posts (or own posts for authors)
  - [ ] Supports filters: status (all, published, draft)
  - [ ] Supports search by title
  - [ ] Pagination: 20 per page
  - [ ] POST: Creates new post
  - [ ] Validates all fields (title required, slug unique)
  - [ ] Sets author_id from session
  - [ ] Returns 401/403 if unauthorized
  - [ ] Tested with different roles
- **Output**: Posts list/create API
- **Reference**: `specs/admin-cms/spec.md` (API section)

#### Task 2C.2.2: Create posts CRUD API endpoints
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2C.2.1
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/posts/[id].ts` created (GET, PUT, DELETE)
  - [ ] GET: Returns post for editing
  - [ ] PUT: Updates post, checks ownership (author) or admin role
  - [ ] DELETE: Soft deletes post (sets deleted_at)
  - [ ] Authors can only edit/delete own posts
  - [ ] Admins can edit/delete any post
  - [ ] Tested all operations
- **Output**: Post edit/delete API
- **Reference**: `specs/admin-cms/spec.md`

#### Task 2C.2.3: Create posts list page
- **Priority**: P0 (Critical)
- **Estimate**: 1.5 hours
- **Dependencies**: Task 2C.1.1, Task 2C.2.1
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/posts/index.tsx` created
  - [ ] Protected route
  - [ ] Uses AdminLayout
  - [ ] Table: Title, Status, Author, Date, Comments, Actions
  - [ ] Status badges (published=green, draft=yellow)
  - [ ] Filter dropdown (All, Published, Drafts)
  - [ ] Search input
  - [ ] "New Post" button
  - [ ] Edit/Delete icons per post
  - [ ] Delete confirmation modal
  - [ ] Pagination controls
  - [ ] Mobile responsive (table → cards)
  - [ ] TypeScript typed
- **Output**: Posts list page
- **Reference**: `specs/admin-cms/spec.md` (UI/UX - Posts List)

#### Task 2C.2.4: Create post validation schemas
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: None
- **Acceptance Criteria**:
  - [ ] `src/lib/validations/post.ts` created
  - [ ] Schema for post creation/editing
  - [ ] Title: required, 3-200 chars
  - [ ] Slug: required, kebab-case, unique
  - [ ] Content: required, 10-50000 chars
  - [ ] Excerpt: optional, max 500 chars
  - [ ] Tags: array of strings
  - [ ] Status: enum (draft, published)
  - [ ] TypeScript types exported
- **Output**: Post validation schemas

---

### Task Group 2C.3: Post Editor (4-5 hours)

#### Task 2C.3.1: Install and configure Markdown editor
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: None
- **Acceptance Criteria**:
  - [ ] Research Markdown editor libraries (react-markdown-editor-lite, etc.)
  - [ ] Install chosen library
  - [ ] Configure with toolbar (Bold, Italic, Link, Image, Code, Heading)
  - [ ] Configure syntax highlighting
  - [ ] Test basic Markdown rendering
- **Output**: Configured editor library
- **Command**: `npm install react-markdown-editor-lite react-markdown`

#### Task 2C.3.2: Create PostEditor component
- **Priority**: P0 (Critical)
- **Estimate**: 2 hours
- **Dependencies**: Task 2C.3.1, Task 2C.2.4
- **Acceptance Criteria**:
  - [ ] `src/components/admin/PostEditor.tsx` created
  - [ ] Metadata panel: Title, Slug, Tags, Excerpt inputs
  - [ ] Title auto-generates slug (kebab-case)
  - [ ] Slug manually editable
  - [ ] Tags input with comma separation
  - [ ] Markdown editor for content
  - [ ] Live preview pane (side-by-side or tabs)
  - [ ] Toolbar shortcuts work
  - [ ] "Save Draft" button
  - [ ] "Publish" button
  - [ ] Unsaved changes warning
  - [ ] Form validation with inline errors
  - [ ] Mobile responsive (vertical stack)
  - [ ] TypeScript typed
- **Output**: PostEditor component
- **Reference**: `specs/admin-cms/spec.md` (UI/UX - Post Editor)

#### Task 2C.3.3: Create new post page
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2C.3.2
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/posts/new.tsx` created
  - [ ] Protected route
  - [ ] Uses AdminLayout
  - [ ] Renders PostEditor with empty form
  - [ ] "Back to Posts" button
  - [ ] Save Draft: status=draft, published_at=null
  - [ ] Publish: status=published, published_at=now()
  - [ ] Success redirect to posts list
  - [ ] Error messages display
  - [ ] Tested creating draft and published post
- **Output**: New post page
- **Reference**: `specs/admin-cms/spec.md`

#### Task 2C.3.4: Create edit post page
- **Priority**: P0 (Critical)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2C.3.2, Task 2C.2.2
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/posts/[id]/edit.tsx` created
  - [ ] Protected route
  - [ ] Fetches post by ID
  - [ ] Pre-fills PostEditor with post data
  - [ ] Authors can only edit own posts (403 otherwise)
  - [ ] Admins can edit any post
  - [ ] Save updates post
  - [ ] Updates updated_at timestamp
  - [ ] Tested editing existing post
- **Output**: Edit post page
- **Reference**: `specs/admin-cms/spec.md`

#### Task 2C.3.5: Implement auto-save functionality
- **Priority**: P1 (Important - Prevents data loss)
- **Estimate**: 1 hour
- **Dependencies**: Task 2C.3.2
- **Acceptance Criteria**:
  - [ ] Auto-save triggers every 30 seconds
  - [ ] Saves to `auto_save_data` JSON column
  - [ ] Only auto-saves if content changed
  - [ ] Shows "Last saved X seconds ago" indicator
  - [ ] Manual save overwrites auto-save
  - [ ] Restores auto-save on page reload
  - [ ] Tested auto-save works
- **Output**: Auto-save feature
- **Reference**: `specs/admin-cms/spec.md` (FR-D-029)

---

### Task Group 2C.4: Image Upload (2 hours)

#### Task 2C.4.1: Create image upload API endpoint
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.3.1
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/upload.ts` created (POST)
  - [ ] Requires authentication
  - [ ] Accepts multipart/form-data
  - [ ] Validates file type (jpeg, png, gif, webp)
  - [ ] Validates file size (max 5MB)
  - [ ] Uploads to Supabase Storage `post-images/{user_id}/`
  - [ ] Returns public URL
  - [ ] Returns Markdown image syntax
  - [ ] Tested with various images
- **Output**: Image upload API
- **Reference**: `specs/admin-cms/spec.md` (API - upload)

#### Task 2C.4.2: Create ImageUpload component
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2C.4.1
- **Acceptance Criteria**:
  - [ ] `src/components/admin/ImageUpload.tsx` created
  - [ ] File input or drag-and-drop zone
  - [ ] Upload button
  - [ ] Progress indicator during upload
  - [ ] Preview uploaded image
  - [ ] Inserts Markdown syntax into editor
  - [ ] Error messages for invalid files
  - [ ] Tested with various images
- **Output**: ImageUpload component
- **Reference**: `specs/admin-cms/spec.md` (FR-D-059 to FR-D-065)

#### Task 2C.4.3: Integrate ImageUpload into PostEditor
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2C.4.2, Task 2C.3.2
- **Acceptance Criteria**:
  - [ ] Image upload button in editor toolbar
  - [ ] Opens ImageUpload modal/panel
  - [ ] Inserts `![alt](url)` at cursor position
  - [ ] Preview updates with image
  - [ ] Tested uploading and inserting
- **Output**: Image upload in editor
- **Reference**: `specs/admin-cms/spec.md`

---

### Task Group 2C.5: Tag Management (1-2 hours)

#### Task 2C.5.1: Create tags API endpoints
- **Priority**: P1 (Important)
- **Estimate**: 45 minutes
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/tags/index.ts` created (GET)
  - [ ] `src/pages/api/admin/tags/[id].ts` created (PUT, DELETE)
  - [ ] GET: Returns all tags with post counts
  - [ ] PUT: Renames tag, updates all posts using it
  - [ ] DELETE: Only if post_count=0
  - [ ] Tested CRUD operations
- **Output**: Tags API endpoints
- **Reference**: `specs/admin-cms/spec.md` (API - tags)

#### Task 2C.5.2: Create tag management page
- **Priority**: P1 (Important)
- **Estimate**: 1 hour
- **Dependencies**: Task 2C.5.1
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/tags.tsx` created
  - [ ] Protected route (admin only)
  - [ ] Table: Tag Name, Post Count, Actions
  - [ ] Rename button opens inline edit
  - [ ] Delete button (only if 0 posts)
  - [ ] Merge button (optional for duplicates)
  - [ ] Confirmation for destructive actions
  - [ ] Tested rename and delete
- **Output**: Tag management page
- **Reference**: `specs/admin-cms/spec.md` (UI/UX - Tags)

---

### Phase 2C Success Criteria

**All tasks must pass before moving to Phase 2D**:

- [ ] Admin dashboard displays accurate statistics
- [ ] Can create new posts with all fields
- [ ] Slug auto-generates from title
- [ ] Markdown editor works with toolbar
- [ ] Live preview renders correctly
- [ ] Can save as draft or publish
- [ ] Auto-save works every 30 seconds
- [ ] Can edit existing posts
- [ ] Authors can only edit own posts
- [ ] Admins can edit any post
- [ ] Can delete posts (soft delete)
- [ ] Posts list with filters and search works
- [ ] Image upload works
- [ ] Images insert into Markdown
- [ ] Tag management works
- [ ] All Phase 2C acceptance criteria met (80+ items)

**Estimated Total**: 10-12 hours  
**Critical Path**: Dashboard (2h) → Posts List (2h) → Editor (4h) → Upload (2h) → Tags (2h)

---

## Phase 2D: Polish & Deploy (4-6 hours)

### Task Group 2D.1: User Management (2-3 hours)

#### Task 2D.1.1: Create user management API endpoints
- **Priority**: P1 (Important)
- **Estimate**: 1 hour
- **Dependencies**: Task 2A.5.5
- **Acceptance Criteria**:
  - [ ] `src/pages/api/admin/users/index.ts` created (GET)
  - [ ] `src/pages/api/admin/users/[id]/role.ts` created (PUT)
  - [ ] GET: Returns all users (super_admin only)
  - [ ] Includes: email, role, display_name, created_at, last_login
  - [ ] Supports search by email
  - [ ] Supports filter by role
  - [ ] PUT: Changes user role (super_admin only)
  - [ ] Logs role change to user_role_changes table
  - [ ] Tested with different roles
- **Output**: User management API
- **Reference**: `specs/auth-system/spec.md` (API - users)

#### Task 2D.1.2: Create user management page
- **Priority**: P1 (Important)
- **Estimate**: 1.5 hours
- **Dependencies**: Task 2D.1.1
- **Acceptance Criteria**:
  - [ ] `src/pages/admin/users.tsx` created
  - [ ] Protected route (super_admin only)
  - [ ] Table: Email, Display Name, Role, Created Date, Last Login, Actions
  - [ ] Search by email
  - [ ] Filter by role dropdown
  - [ ] Role change via dropdown (editable)
  - [ ] Confirmation modal for role changes
  - [ ] Can't change own role (validation)
  - [ ] Pagination
  - [ ] Tested changing roles
- **Output**: User management page
- **Reference**: `specs/auth-system/spec.md` (UI/UX - User Management)

---

### Task Group 2D.2: Data Migration (Optional) (1 hour)

#### Task 2D.2.1: Create migration script for existing posts
- **Priority**: P2 (Optional - if keeping old posts)
- **Estimate**: 1 hour
- **Dependencies**: Phase 2A complete
- **Acceptance Criteria**:
  - [ ] `scripts/migrate-to-supabase.ts` created
  - [ ] Reads all .md files from content/posts/
  - [ ] Parses front matter
  - [ ] Inserts into posts table
  - [ ] Sets author_id to admin user
  - [ ] Sets status=published
  - [ ] Sets published_at from frontmatter date
  - [ ] Logs success/failures
  - [ ] Tested with sample posts
  - [ ] All posts migrated successfully
- **Output**: Migration script
- **Reference**: `specs/supabase-setup/setup-guide.md` (Step 9)
- **Command**: `npx ts-node scripts/migrate-to-supabase.ts`

---

### Task Group 2D.3: Testing & Bug Fixes (1-2 hours)

#### Task 2D.3.1: End-to-end user flow testing
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: All Phase 2A-2C tasks
- **Acceptance Criteria**:
  - [ ] **Reader flow**: Visit site → Read post → Submit comment → Comment pending
  - [ ] **Admin flow**: Login → View dashboard → Approve comment → Comment visible
  - [ ] **Author flow**: Login → Create post → Publish → Post on homepage
  - [ ] **Edit flow**: Edit post → Save → Changes reflected
  - [ ] **Permission flow**: Author tries to edit other's post → 403 error
  - [ ] **Logout flow**: Logout → Access admin → Redirected to login
  - [ ] All flows work without errors
- **Output**: Test results documented

#### Task 2D.3.2: Responsive design verification
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: All UI components
- **Acceptance Criteria**:
  - [ ] Test on mobile (375px width)
  - [ ] Test on tablet (768px width)
  - [ ] Test on desktop (1440px width)
  - [ ] All pages responsive
  - [ ] No horizontal scroll
  - [ ] Touch targets ≥ 44x44px
  - [ ] Forms usable on mobile
  - [ ] Tables convert to cards on mobile
- **Output**: Mobile compatibility confirmed

#### Task 2D.3.3: Accessibility audit
- **Priority**: P1 (Important)
- **Estimate**: 30 minutes
- **Dependencies**: All UI components
- **Acceptance Criteria**:
  - [ ] Run Lighthouse accessibility audit
  - [ ] Score ≥ 90
  - [ ] All images have alt text
  - [ ] Forms have labels
  - [ ] Color contrast meets WCAG AA
  - [ ] Keyboard navigation works
  - [ ] Focus states visible
  - [ ] Screen reader tested (basic)
- **Output**: Accessibility report

#### Task 2D.3.4: Bug fixes and edge cases
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour (buffer)
- **Dependencies**: Task 2D.3.1, 2D.3.2, 2D.3.3
- **Acceptance Criteria**:
  - [ ] Fix any bugs found during testing
  - [ ] Handle edge cases (empty states, errors)
  - [ ] Improve error messages
  - [ ] Add loading states where missing
  - [ ] Test fixes
- **Output**: Bug-free application

---

### Task Group 2D.4: Documentation (1 hour)

#### Task 2D.4.1: Update README.md
- **Priority**: P1 (Important)
- **Estimate**: 30 minutes
- **Dependencies**: Phase 2 complete
- **Acceptance Criteria**:
  - [ ] Update README with Phase 2 features
  - [ ] Add screenshots of admin interface
  - [ ] Document environment variables
  - [ ] Add setup instructions
  - [ ] Add deployment instructions
  - [ ] Link to API documentation
- **Output**: Updated README.md

#### Task 2D.4.2: Create API documentation
- **Priority**: P1 (Important)
- **Estimate**: 30 minutes
- **Dependencies**: All API routes
- **Acceptance Criteria**:
  - [ ] Create `docs/API.md`
  - [ ] Document all 22 API endpoints
  - [ ] Include request/response examples
  - [ ] Document authentication requirements
  - [ ] Document error codes
  - [ ] Document rate limits
- **Output**: API.md file
- **Reference**: All spec.md API sections

---

### Task Group 2D.5: Production Deployment (1-2 hours)

#### Task 2D.5.1: Prepare for production deployment
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: All Phase 2 tasks
- **Acceptance Criteria**:
  - [ ] Update `.env.example` with all variables
  - [ ] Verify no secrets in code
  - [ ] Update `next.config.js` for production
  - [ ] Test production build locally (`npm run build && npm start`)
  - [ ] Fix any build errors
  - [ ] Verify bundle size acceptable
- **Output**: Production-ready codebase

#### Task 2D.5.2: Deploy to Vercel/Cloudflare
- **Priority**: P0 (Critical)
- **Estimate**: 1 hour
- **Dependencies**: Task 2D.5.1
- **Acceptance Criteria**:
  - [ ] Connect Git repository to Vercel/Cloudflare
  - [ ] Set environment variables in platform
  - [ ] Configure build settings
  - [ ] Deploy to production
  - [ ] Verify deployment successful
  - [ ] Test deployed site
  - [ ] Update Supabase redirect URLs with production domain
  - [ ] Test authentication on production
- **Output**: Live production site
- **Reference**: `specs/supabase-setup/setup-guide.md` (Production checklist)

#### Task 2D.5.3: Post-deployment verification
- **Priority**: P0 (Critical)
- **Estimate**: 30 minutes
- **Dependencies**: Task 2D.5.2
- **Acceptance Criteria**:
  - [ ] Homepage loads correctly
  - [ ] Posts display correctly
  - [ ] Comments submission works
  - [ ] Admin login works
  - [ ] Dashboard loads
  - [ ] Can create/edit posts
  - [ ] Comment moderation works
  - [ ] No console errors
  - [ ] Run Lighthouse audit (Performance ≥ 90)
- **Output**: Verified production deployment

---

### Phase 2D Success Criteria

**All tasks must pass for Phase 2 completion**:

- [ ] Super admin can manage users
- [ ] Can change user roles
- [ ] Role changes logged
- [ ] Existing posts migrated (if applicable)
- [ ] All user flows tested
- [ ] Mobile responsive verified
- [ ] Accessibility audit passed
- [ ] All bugs fixed
- [ ] Documentation updated
- [ ] API documented
- [ ] Production build succeeds
- [ ] Deployed to production
- [ ] Production site verified working
- [ ] All Phase 2D acceptance criteria met (40+ items)

**Estimated Total**: 4-6 hours  
**Critical Path**: User Mgmt (2h) → Testing (1h) → Docs (1h) → Deploy (1h)

---

## Phase 2 Summary

### Total Task Count

| Phase | Task Groups | Individual Tasks | Acceptance Criteria | Est. Hours |
|-------|-------------|------------------|---------------------|------------|
| 2A: Backend Foundation | 6 | 18 | 60+ | 8-10 |
| 2B: Comments System | 3 | 11 | 50+ | 6-8 |
| 2C: Admin CMS | 5 | 19 | 80+ | 10-12 |
| 2D: Polish & Deploy | 5 | 13 | 40+ | 4-6 |
| **TOTAL** | **19** | **61** | **230+** | **28-36** |

### Critical Dependencies

```
Phase 2A (Foundation) → Phase 2B (Comments) → Phase 2C (Admin CMS) → Phase 2D (Deploy)
        ↓                       ↓                        ↓
    Auth Setup          Comment API            Post Editor         Testing
        ↓                       ↓                        ↓
    Middleware          Display UI          Image Upload        Deployment
```

### Daily Schedule (Example for 2-week sprint)

**Week 1**:
- Day 1: Tasks 2A.1 (Supabase setup)
- Day 2: Tasks 2A.2-2A.3 (RLS policies, storage, auth)
- Day 3: Tasks 2A.4-2A.5 (Client setup, authentication)
- Day 4: Tasks 2A.6 + 2B.1 (Core API + Comment form)
- Day 5: Tasks 2B.2-2B.3 (Comment display + moderation)

**Week 2**:
- Day 1: Tasks 2C.1 (Dashboard)
- Day 2: Tasks 2C.2 (Posts list + API)
- Day 3: Tasks 2C.3 (Post editor)
- Day 4: Tasks 2C.4-2C.5 (Image upload + Tags)
- Day 5: Tasks 2D (User mgmt, testing, docs, deploy)

### Risk Mitigation Timeline

| Day | Risk Area | Mitigation Task | Time Buffer |
|-----|-----------|-----------------|-------------|
| 1 | Supabase setup | Extra 1h for troubleshooting | +1h |
| 2 | RLS policies | Test each policy incrementally | +1h |
| 3 | Auth flow | Test with multiple roles | +30min |
| 5 | Comment threading | Simplify to 1 level if needed | +1h |
| 7 | Post editor | Use simpler editor if bugs | +1h |
| 10 | Deployment | Test production build early | +1h |

### Success Metrics

**Must Have (100% required)**:
- [ ] All 61 tasks completed
- [ ] All 230+ acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Zero build errors
- [ ] Production deployment successful

**Should Have (90% required)**:
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Mobile responsive on 3+ devices
- [ ] All API endpoints documented

**Nice to Have (optional)**:
- [ ] Unit tests for validation schemas
- [ ] Integration tests for API routes
- [ ] Automated E2E tests
- [ ] Performance monitoring setup

---

## Appendix

### Quick Command Reference

```bash
# Phase 2A - Setup
npm install @supabase/supabase-js @supabase/ssr
npm run dev

# Phase 2B - Comments
npm install zod @hookform/resolvers react-hook-form

# Phase 2C - Admin CMS
npm install react-markdown-editor-lite react-markdown

# Testing
npm run build
npm run start
npm run lint

# Deployment
vercel --prod
```

### File Checklist

**New Files (50+)**:
- [ ] 3 Supabase client utilities
- [ ] 1 middleware file
- [ ] 3 context files (Auth, etc.)
- [ ] 10+ validation schemas
- [ ] 15+ React components
- [ ] 20+ API route files
- [ ] 8+ page files
- [ ] 3+ documentation files

**Modified Files**:
- [ ] `src/pages/posts/[slug].tsx` (add comments)
- [ ] `src/lib/types.ts` (add new interfaces)
- [ ] `package.json` (dependencies)
- [ ] `README.md` (features)
- [ ] `.gitignore` (.env.local)

### Environment Variables Checklist

```bash
# Required for Phase 2
NEXT_PUBLIC_SUPABASE_URL=         # From Supabase dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # From Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY=        # From Supabase dashboard (secret!)
NEXT_PUBLIC_SITE_URL=             # http://localhost:3000 or production URL
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Ready for Implementation**: ✅ Start with Phase 2A, Task Group 2A.1

**Total Effort**: 28-36 hours (61 tasks, 230+ acceptance criteria)
