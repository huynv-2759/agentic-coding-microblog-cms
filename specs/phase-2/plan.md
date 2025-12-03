# Technical Plan: Microblog CMS - Phase 2 (Dynamic Features)

**Branch**: `feature/phase-2-dynamic` | **Date**: 2025-12-03 | **Status**: Ready for Implementation  
**Input**: Specifications from `/specs/comments-system/`, `/specs/auth-system/`, `/specs/admin-cms/`, `/specs/supabase-setup/`

## Executive Summary

Phase 2 transforms the static Microblog CMS into a full-featured dynamic application by adding:
- **Supabase Backend**: PostgreSQL database with Row Level Security (RLS), authentication, and storage
- **Comments System**: User-submitted comments with admin moderation workflow
- **Authentication**: Email/password and magic link login with role-based access control (RBAC)
- **Admin CMS**: Dashboard and UI for managing posts, comments, tags, and users

**Why Phase 2**: Phase 1 delivered a static blog (60% assignment compliance). Phase 2 adds the critical missing features to achieve 100% compliance with assignment requirements: "người dùng đọc & comment (moderation)" and admin content management.

**Technical Approach**:
- Migrate from filesystem to Supabase PostgreSQL database
- Implement Supabase Auth with JWT tokens and RLS policies
- Build API routes for CRUD operations (comments, posts, moderation)
- Create admin interface with protected routes and role checks
- Maintain public static site for readers while adding dynamic admin area

**Estimated Effort**: 28-36 hours (1-1.5 weeks full-time, 2-3 weeks part-time)

## Technical Context

### Architecture Changes

**Phase 1 (Current)**:
```
Markdown Files → gray-matter → remark → Static HTML (SSG)
└─ /content/posts/*.md
```

**Phase 2 (Target)**:
```
Public Site:
  Supabase DB → Next.js API Routes → React Components → SSR/ISR
  
Admin Site:
  Admin UI → API Routes → Supabase (with RLS) → PostgreSQL
                          ↓
                    Auth Middleware (JWT)
```

### Technology Stack

**Backend**:
- **Database**: Supabase PostgreSQL 15+ with RLS policies
- **Authentication**: Supabase Auth (email/password + magic link)
- **Storage**: Supabase Storage for image uploads
- **API**: Next.js API Routes (serverless functions)

**Frontend**:
- **Framework**: Next.js 14+ (Pages Router) - no changes from Phase 1
- **UI Library**: React 18+ with TypeScript
- **Styling**: TailwindCSS 3+ (existing)
- **Forms**: React Hook Form + Zod validation
- **State**: React Context for auth state
- **Editor**: react-markdown-editor-lite or similar for post editor

**New Dependencies**:
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.4"
}
```

### Database Schema

**8 Tables** (see `/specs/supabase-setup/setup-guide.md` for full SQL):

1. **posts** - Blog posts (migrated from Markdown files)
   - Columns: id, title, slug, content, excerpt, tags[], status, author_id, published_at, created_at, updated_at, deleted_at
   - Indexes: slug, status, author, published_at, deleted_at
   
2. **comments** - User comments
   - Columns: id, post_slug, author_name, author_email, content, status, ip_address, user_agent, parent_id, created_at, updated_at
   - Indexes: post_slug, status, parent_id, created_at
   
3. **tags** - Tag definitions
   - Columns: id, name, slug, created_at
   - Indexes: slug, name
   
4. **post_tags** - Post-Tag many-to-many junction
   - Columns: post_id, tag_id, created_at
   - Indexes: post_id, tag_id
   
5. **user_role_changes** - Audit log for role changes
   - Columns: id, user_id, old_role, new_role, changed_by, reason, created_at
   
6. **auth_events** - Authentication event log
   - Columns: id, user_id, event_type, ip_address, user_agent, success, metadata, created_at
   
7. **post_revisions** - Edit history
   - Columns: id, post_id, title, content, excerpt, tags, created_by, created_at

8. **auth.users** - Supabase built-in table (extended with user_metadata)
   - Extended fields: role (super_admin | admin | author | reader), display_name

### Security Model

**Row Level Security (RLS) Policies**:

```sql
-- Example: Posts table policies
- Public can read published posts (status='published', deleted_at IS NULL)
- Authors can create posts (auth.uid() = author_id AND role IN ('author','admin','super_admin'))
- Authors can update own posts (author_id = auth.uid())
- Admins can update any post (role IN ('admin','super_admin'))
- Authors can delete own posts, admins can delete any

-- Comments table policies
- Public can read approved comments (status='approved')
- Anyone can create comments (INSERT with CHECK true)
- Admins can moderate all comments (role IN ('admin','super_admin'))
- Authors can moderate comments on own posts
```

**Role Hierarchy**:
1. **super_admin**: Full access (user management, all posts, all comments)
2. **admin**: Manage all posts and comments (no user management)
3. **author**: Manage own posts and comments on own posts
4. **reader**: Read-only access to public content (default)

### API Design

**22 API Endpoints** across 4 categories:

#### Authentication Endpoints (6)
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/magic-link` - Send magic link
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password

#### Comments Endpoints (6)
- `POST /api/comments` - Submit comment (public)
- `GET /api/comments/[postSlug]` - Get approved comments (public)
- `GET /api/admin/comments` - List all comments (admin)
- `PUT /api/admin/comments/[id]/moderate` - Approve/reject (admin)
- `DELETE /api/admin/comments/[id]` - Delete comment (admin)
- `POST /api/admin/comments/bulk` - Bulk moderation (admin)

#### Posts Management Endpoints (5)
- `GET /api/admin/posts` - List all posts (admin)
- `POST /api/admin/posts` - Create post (author/admin)
- `GET /api/admin/posts/[id]` - Get post for editing (admin)
- `PUT /api/admin/posts/[id]` - Update post (author/admin)
- `DELETE /api/admin/posts/[id]` - Delete post (admin)

#### Admin Endpoints (5)
- `GET /api/admin/stats` - Dashboard statistics (admin)
- `GET /api/admin/tags` - List tags (admin)
- `PUT /api/admin/tags/[id]` - Update tag (admin)
- `GET /api/admin/users` - List users (super_admin)
- `PUT /api/admin/users/[id]/role` - Change user role (super_admin)
- `POST /api/admin/upload` - Upload image (admin)

**API Authentication**: All `/api/admin/*` routes require `Authorization: Bearer <jwt_token>` header.

## Constitution Check

*GATE: Must pass before implementation. Validates alignment with Phase 1 principles.*

✅ **Backward Compatibility**: Public site remains static/SSG, new features are additive  
✅ **Progressive Enhancement**: Readers get static experience, admins get dynamic features  
✅ **Performance**: Static pages unaffected, admin area can be slower (authenticated users)  
✅ **Security First**: RLS policies enforce permissions at database level  
✅ **Maintainable**: Clear separation between public and admin code  
✅ **TypeScript**: All new code fully typed  
✅ **Mobile Responsive**: Admin interface follows same TailwindCSS patterns  
✅ **No Over-Engineering**: Using Supabase instead of building custom auth/backend  

**Constitution Compliance**: ✅ All Phase 1 principles maintained + new security requirements

## Implementation Phases

### Phase 2A: Backend Foundation (Est. 8-10 hours)

**Goal**: Establish Supabase backend, authentication, and core API layer.

**Milestones**:
1. ✅ Supabase project provisioned and configured
2. ✅ Database schema created with all tables and indexes
3. ✅ RLS policies enabled and tested
4. ✅ Storage bucket created for images
5. ✅ Authentication configured (email + magic link)
6. ✅ Supabase client utilities created (client, server, middleware)
7. ✅ First admin user created
8. ✅ Core API routes implemented and tested

**Deliverables**:
- Supabase project with 8 tables
- 40+ RLS policies configured
- Supabase client libraries installed and configured
- Middleware for protected routes
- Login/logout functionality working
- Test API route confirming database connection

**Critical Path**:
```
Supabase Setup → Auth Implementation → API Routes → Testing
     (3h)              (3h)                (3h)         (1h)
```

**Acceptance Criteria**:
- [ ] Can login with admin credentials
- [ ] Protected routes redirect to login
- [ ] API routes return correct data with auth
- [ ] RLS policies block unauthorized access
- [ ] Can query all tables successfully

---

### Phase 2B: Comments System (Est. 6-8 hours)

**Goal**: Enable users to submit comments and admins to moderate them.

**Milestones**:
1. ✅ Comment submission form on post pages
2. ✅ Comment validation and rate limiting
3. ✅ Comment display with threading (1 level)
4. ✅ Admin comments moderation page
5. ✅ Approve/reject/delete actions
6. ✅ Bulk moderation actions
7. ✅ Email notifications (optional)

**Deliverables**:
- `CommentForm` component on public post pages
- `CommentsList` component displaying approved comments
- `/admin/comments` page with moderation UI
- API routes for comment CRUD
- Rate limiting (max 3 comments per IP per hour)
- Spam detection (basic validation)

**Critical Path**:
```
Comment API → Form Component → Display Component → Moderation UI
    (2h)          (2h)              (2h)               (2h)
```

**Acceptance Criteria**:
- [ ] Can submit comment as anonymous user
- [ ] Comment appears as "pending" in admin
- [ ] Admin can approve/reject comments
- [ ] Approved comments visible on post page
- [ ] Rejected comments not visible
- [ ] Can reply to comments (1 level)
- [ ] Rate limiting works (test with multiple submissions)

---

### Phase 2C: Admin CMS (Est. 10-12 hours)

**Goal**: Build full admin interface for content management.

**Milestones**:
1. ✅ Admin dashboard with statistics
2. ✅ Posts listing with filters
3. ✅ Post editor (create/edit)
4. ✅ Markdown editor with live preview
5. ✅ Image upload to Supabase Storage
6. ✅ Tag management interface
7. ✅ Auto-save drafts
8. ✅ Post revisions history

**Deliverables**:
- `/admin/dashboard` - Overview with stats
- `/admin/posts` - Posts list with search/filter
- `/admin/posts/new` - Create post form
- `/admin/posts/[id]/edit` - Edit post form
- `/admin/tags` - Tag management
- Markdown editor component with toolbar
- Image upload component
- Auto-save functionality (every 30s)

**Critical Path**:
```
Dashboard → Posts List → Post Editor → Image Upload → Tag Management
   (2h)        (2h)         (4h)           (2h)            (2h)
```

**Acceptance Criteria**:
- [ ] Dashboard shows accurate post/comment counts
- [ ] Can filter posts by status (published/draft)
- [ ] Can create new post with all fields
- [ ] Slug auto-generates from title
- [ ] Markdown preview works in real-time
- [ ] Can upload images and insert into post
- [ ] Auto-save prevents data loss
- [ ] Can edit existing posts
- [ ] Authors see only own posts, admins see all
- [ ] Can manage tags (rename, merge, delete)

---

### Phase 2D: Polish & Deploy (Est. 4-6 hours)

**Goal**: User management, testing, bug fixes, and production deployment.

**Milestones**:
1. ✅ User management page (super_admin)
2. ✅ Role change functionality
3. ✅ End-to-end testing
4. ✅ Bug fixes and edge cases
5. ✅ Responsive design verification
6. ✅ Accessibility audit
7. ✅ Production deployment
8. ✅ Documentation updates

**Deliverables**:
- `/admin/users` - User management (super_admin only)
- All bugs fixed
- Mobile responsive confirmed
- Accessibility (WCAG 2.1 Level AA) verified
- Deployed to Vercel/Cloudflare
- Updated README with new features
- Environment variables documented

**Critical Path**:
```
User Management → Testing → Bug Fixes → Deployment
      (2h)          (1h)       (2h)         (1h)
```

**Acceptance Criteria**:
- [ ] Super admin can view all users
- [ ] Super admin can change user roles
- [ ] Role changes are logged
- [ ] All user flows tested end-to-end
- [ ] No critical bugs
- [ ] Works on mobile devices
- [ ] Keyboard navigation works
- [ ] Deployed to production
- [ ] Production environment variables set
- [ ] Supabase redirect URLs updated

---

## Project Structure (Updated)

### New Directories

```text
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client (SSR)
│   │   └── middleware.ts     # Middleware helper
│   ├── validations/
│   │   ├── comment.ts        # Comment validation schemas (Zod)
│   │   ├── post.ts           # Post validation schemas
│   │   └── auth.ts           # Auth validation schemas
│   └── hooks/
│       ├── useAuth.ts        # Auth context hook
│       ├── useComments.ts    # Comments data hook
│       └── usePosts.ts       # Posts data hook
├── components/
│   ├── admin/
│   │   ├── Dashboard.tsx          # Dashboard widgets
│   │   ├── PostEditor.tsx         # Markdown editor
│   │   ├── PostsList.tsx          # Posts table
│   │   ├── CommentModeration.tsx  # Comment moderation UI
│   │   ├── TagManager.tsx         # Tag management
│   │   ├── UserManager.tsx        # User management
│   │   ├── ImageUpload.tsx        # Image upload component
│   │   └── AdminNavbar.tsx        # Admin navigation
│   ├── comments/
│   │   ├── CommentForm.tsx        # Comment submission form
│   │   ├── CommentsList.tsx       # Comment display
│   │   └── CommentItem.tsx        # Single comment
│   └── auth/
│       ├── LoginForm.tsx          # Login form
│       └── ProtectedRoute.tsx     # Route guard component
├── pages/
│   ├── admin/
│   │   ├── login.tsx              # Admin login page
│   │   ├── dashboard.tsx          # Admin dashboard
│   │   ├── posts/
│   │   │   ├── index.tsx          # Posts list
│   │   │   ├── new.tsx            # Create post
│   │   │   └── [id]/edit.tsx      # Edit post
│   │   ├── comments.tsx           # Comment moderation
│   │   ├── tags.tsx               # Tag management
│   │   └── users.tsx              # User management (super_admin)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── magic-link.ts
│   │   │   └── session.ts
│   │   ├── comments/
│   │   │   ├── index.ts           # POST new comment
│   │   │   └── [postSlug].ts      # GET comments for post
│   │   └── admin/
│   │       ├── stats.ts           # Dashboard stats
│   │       ├── posts/
│   │       │   ├── index.ts       # GET/POST posts
│   │       │   └── [id].ts        # GET/PUT/DELETE post
│   │       ├── comments/
│   │       │   ├── index.ts       # GET all comments
│   │       │   ├── [id]/moderate.ts  # PUT moderate
│   │       │   └── bulk.ts        # POST bulk actions
│   │       ├── tags/
│   │       │   ├── index.ts       # GET tags
│   │       │   └── [id].ts        # PUT tag
│   │       ├── users/
│   │       │   ├── index.ts       # GET users
│   │       │   └── [id]/role.ts   # PUT change role
│   │       └── upload.ts          # POST image upload
│   └── auth/
│       └── callback.tsx           # OAuth callback handler
├── middleware.ts                   # Auth middleware (protects /admin routes)
└── contexts/
    └── AuthContext.tsx             # Auth state management

specs/phase-2/                      # Phase 2 specifications
├── README.md                       # Overview and roadmap
├── plan.md                         # This file - technical plan
└── tasks.md                        # Granular task breakdown (to be created)

specs/
├── comments-system/
│   └── spec.md                     # Comments system specification
├── auth-system/
│   └── spec.md                     # Authentication specification
├── admin-cms/
│   └── spec.md                     # Admin CMS specification
└── supabase-setup/
    └── setup-guide.md              # Supabase setup guide

.env.local                          # Local environment variables
.env.example                        # Example environment variables
```

### Modified Files

```text
src/pages/posts/[slug].tsx          # Add CommentForm and CommentsList
src/lib/types.ts                    # Add Comment, User interfaces
package.json                        # Add new dependencies
README.md                           # Update with Phase 2 features
```

## Development Workflow

### 1. Environment Setup

```bash
# Install new dependencies
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers

# Create .env.local from .env.example
cp .env.example .env.local

# Add Supabase credentials to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Supabase Setup (Follow guide)

```bash
# Reference: specs/supabase-setup/setup-guide.md

# Steps:
1. Create Supabase project
2. Run database migrations (copy/paste SQL from guide)
3. Enable RLS policies
4. Create storage bucket
5. Configure authentication
6. Create first admin user
7. Test connection with /api/test-db
```

### 3. Development Order

**Week 1**:
- Day 1-2: Supabase setup + Authentication
- Day 3-4: Core API routes + Comments backend
- Day 5: Comment submission form + display

**Week 2**:
- Day 1-2: Admin dashboard + posts list
- Day 3-4: Post editor with Markdown preview
- Day 5: Image upload + tag management

**Week 3**:
- Day 1: User management
- Day 2: Testing and bug fixes
- Day 3: Deployment

### 4. Testing Strategy

**Unit Tests** (optional, but recommended):
- Validation schemas (Zod)
- Utility functions
- React hooks

**Integration Tests**:
- API routes with mock Supabase client
- Component interactions

**Manual Testing**:
- [ ] User flows (submit comment → admin approves → appears on site)
- [ ] Authentication (login → access admin → logout)
- [ ] Post management (create → edit → publish → view on site)
- [ ] Permissions (author can't edit other's posts, admin can)
- [ ] Mobile responsive (test on actual devices)

**Security Testing**:
- [ ] RLS policies prevent unauthorized access
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF protection working
- [ ] Rate limiting effective

### 5. Deployment Process

```bash
# 1. Build locally
npm run build

# 2. Test production build
npm run start

# 3. Deploy to Vercel
vercel --prod

# 4. Update Supabase redirect URLs
# Go to: Supabase Dashboard → Authentication → URL Configuration
# Add: https://your-domain.vercel.app/admin/login
#      https://your-domain.vercel.app/auth/callback

# 5. Set environment variables in Vercel
# Dashboard → Settings → Environment Variables
# Add all NEXT_PUBLIC_* and SUPABASE_SERVICE_ROLE_KEY

# 6. Verify deployment
# Test login, comment submission, admin features
```

## Risk Management

### High Risk Areas

#### 1. RLS Policy Complexity
**Risk**: Policies may be too restrictive or too permissive.

**Mitigation**:
- Test with service role key first (bypasses RLS)
- Add policies incrementally
- Test each policy with different roles
- Use Supabase Dashboard → SQL Editor to test queries

**Rollback Plan**: Disable RLS temporarily, fix policies, re-enable.

#### 2. Data Migration from Markdown
**Risk**: Lose data or metadata during migration.

**Mitigation**:
- Keep original Markdown files as backup
- Test migration script on copy first
- Verify all posts migrated correctly
- Compare counts (files vs DB rows)

**Rollback Plan**: Re-run migration script with fixed issues.

#### 3. Authentication Flow
**Risk**: Users locked out or session issues.

**Mitigation**:
- Test login/logout extensively
- Implement "Forgot Password" flow
- Add session refresh logic
- Provide clear error messages

**Rollback Plan**: Use Supabase Dashboard to manually reset user passwords.

### Medium Risk Areas

#### 4. Comment Spam
**Risk**: Flood of spam comments.

**Mitigation**:
- Rate limiting (3 comments/hour per IP)
- Email validation
- Content length limits
- Admin moderation queue

**Rollback Plan**: Disable comment submission temporarily, bulk reject spam.

#### 5. Image Upload Storage
**Risk**: Running out of storage or upload failures.

**Mitigation**:
- 5MB file size limit
- Supabase free tier: 1GB storage (monitor usage)
- Validate file types (JPG, PNG, GIF, WebP only)
- Compress images before upload

**Rollback Plan**: Delete unused images, upgrade Supabase plan if needed.

### Low Risk Areas

#### 6. Markdown Editor
**Risk**: Editor bugs or UX issues.

**Mitigation**:
- Use battle-tested library (react-markdown-editor-lite)
- Provide preview pane
- Auto-save prevents data loss

**Rollback Plan**: Fallback to plain textarea if editor fails.

## Performance Considerations

### Public Site (Readers)
- **Strategy**: Maintain SSG/ISR for public pages
- **Comments**: Fetch via API on client-side (CSR) or ISR with 60s revalidation
- **Goal**: No performance degradation from Phase 1

### Admin Site
- **Strategy**: Server-side rendering (SSR) with authentication check
- **Acceptable**: Slower than public site (authenticated users, complex UI)
- **Goal**: Dashboard loads in < 2s, post editor responsive (< 50ms typing lag)

### Database Queries
- **Optimization**: Indexes on frequently queried columns (slug, status, post_slug)
- **Pagination**: 20 items per page (posts, comments, users)
- **Caching**: Use Next.js ISR for public pages, no caching for admin

### Image Optimization
- **Upload**: Compress to < 500KB
- **Delivery**: Supabase CDN for fast loading
- **Next.js Image**: Use `next/image` for automatic optimization

## Monitoring & Observability

### Metrics to Track

**Application**:
- Login success/failure rate
- Comment submission rate
- Comment approval rate
- Post creation/edit frequency
- Average session duration

**Infrastructure**:
- Supabase database connections
- Storage usage
- API response times
- Error rates

**User Experience**:
- Lighthouse scores (maintain ≥ 90)
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)

### Logging

**Auth Events**: Logged to `auth_events` table
- Login/logout events
- Failed login attempts
- Password resets

**Admin Actions**: Logged to respective tables
- Post create/edit/delete
- Comment moderation
- Role changes (in `user_role_changes`)

**Error Logging**: 
- Use `console.error` for development
- Consider Sentry for production (optional)

## Success Metrics

### Functional Completeness
- [ ] All 22 API endpoints implemented and working
- [ ] All 17 user stories from specs satisfied
- [ ] 216 total requirements met (160 functional + 56 non-functional)
- [ ] 100% assignment compliance (vs 60% in Phase 1)

### Quality Metrics
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Build succeeds
- [ ] All tests pass (if implemented)
- [ ] Lighthouse Performance ≥ 90 (public pages)
- [ ] Lighthouse Accessibility ≥ 90

### Security Metrics
- [ ] All RLS policies tested and working
- [ ] No unauthorized data access possible
- [ ] Rate limiting prevents abuse
- [ ] CSRF protection enabled
- [ ] Passwords hashed (Supabase handles this)

### User Experience
- [ ] Mobile responsive (tested on 3 device sizes)
- [ ] Keyboard navigation works
- [ ] Forms have clear validation messages
- [ ] Loading states shown
- [ ] Error states handled gracefully

## Documentation Deliverables

### Updated Documentation
- [ ] README.md - Add Phase 2 features
- [ ] IMPLEMENTATION_SUMMARY.md - Update with new features
- [ ] DEPLOYMENT.md - Add Supabase deployment steps
- [ ] API.md - Document all 22 endpoints (new file)

### New Documentation
- [ ] SUPABASE_SETUP.md - Link to setup guide
- [ ] ADMIN_GUIDE.md - How to use admin interface
- [ ] TROUBLESHOOTING.md - Common issues and solutions

### Code Documentation
- [ ] JSDoc comments on all public functions
- [ ] README in each new directory
- [ ] Inline comments for complex logic

## Maintenance Plan

### Regular Tasks

**Daily** (during active development):
- Monitor Supabase logs for errors
- Check comment moderation queue
- Review authentication failures

**Weekly**:
- Review storage usage
- Check for spam comments
- Update dependencies (security patches)

**Monthly**:
- Database backup (Supabase auto-backups, but verify)
- Review RLS policies for improvements
- Analyze usage metrics

### Upgrade Path

**Future Enhancements** (Phase 3):
- Rich text editor (replace Markdown)
- Multiple authors with profiles
- Comment threading (more than 1 level)
- Email notifications for new comments
- Analytics dashboard
- SEO improvements (meta tags per post)
- Dark mode
- Internationalization (i18n)

## Appendix

### Key Files Reference

| File | Purpose | Lines | Complexity |
|------|---------|-------|------------|
| `middleware.ts` | Protect admin routes | ~50 | Medium |
| `src/lib/supabase/server.ts` | Server client | ~40 | Low |
| `src/pages/api/auth/login.ts` | Login endpoint | ~80 | Medium |
| `src/pages/admin/dashboard.tsx` | Dashboard page | ~200 | Medium |
| `src/components/admin/PostEditor.tsx` | Markdown editor | ~300 | High |
| `src/components/comments/CommentForm.tsx` | Comment form | ~150 | Medium |

### Dependencies Breakdown

**Critical** (must have):
- `@supabase/supabase-js` - Database client
- `@supabase/ssr` - SSR helpers
- `react-hook-form` - Form management
- `zod` - Validation

**Important** (recommended):
- `react-markdown-editor-lite` - Markdown editor
- `react-toastify` - Notifications
- `swr` or `react-query` - Data fetching (optional)

**Optional** (nice to have):
- `@sentry/nextjs` - Error tracking
- `jest` + `@testing-library/react` - Testing

### Time Allocation

| Phase | Focus Area | Hours | % of Total |
|-------|------------|-------|------------|
| 2A | Backend Foundation | 8-10 | 29% |
| 2B | Comments System | 6-8 | 21% |
| 2C | Admin CMS | 10-12 | 36% |
| 2D | Polish & Deploy | 4-6 | 14% |
| **Total** | | **28-36** | **100%** |

### External Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Auth Patterns](https://nextjs.org/docs/authentication)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Hook Form Docs](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

---

**Plan Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Next Review**: After Phase 2A completion  
**Maintained By**: Development Team

**Ready for Implementation**: ✅ Proceed to Phase 2A (Supabase Setup)
