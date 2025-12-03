# Feature Specification: Authentication & Authorization System

**Feature Branch**: `feature/auth-system`  
**Created**: 2025-12-03  
**Status**: Draft  
**Priority**: HIGH  
**Dependencies**: Supabase setup

## Overview

Implement authentication system using Supabase Auth để phân biệt admin/author với readers, cho phép quản lý posts và moderate comments.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Login (Priority: P0)

As an admin, I want to log in to the system, so that I can access admin features like post management and comment moderation.

**Why this priority**: Authentication là điều kiện tiên quyết để implement comment moderation và admin CMS.

**Independent Test**: Navigate to `/admin/login`, enter credentials, verify successful login and redirect to dashboard.

**Acceptance Scenarios**:

1. **Given** I am not logged in, **When** I visit `/admin`, **Then** I am redirected to `/admin/login`
2. **Given** I am on the login page, **When** I enter valid email and password, **Then** I am logged in and redirected to `/admin/dashboard`
3. **Given** I enter invalid credentials, **When** I click "Login", **Then** I see error "Invalid email or password"
4. **Given** I am logged in, **When** I close browser and return, **Then** I am still logged in (session persisted)
5. **Given** I am logged in, **When** I click "Logout", **Then** I am logged out and redirected to homepage
6. **Given** I am on login page, **When** page loads, **Then** I see Supabase Magic Link option (passwordless login)

---

### User Story 2 - Protected Admin Routes (Priority: P0)

As the system, I want to protect admin routes from unauthorized access, so that only authenticated admins can access sensitive features.

**Why this priority**: Security requirement - không thể để anonymous users access admin features.

**Independent Test**: Try to access admin routes without authentication, verify redirect to login page.

**Acceptance Scenarios**:

1. **Given** I am not logged in, **When** I try to access `/admin/posts`, **Then** I am redirected to `/admin/login`
2. **Given** I am not logged in, **When** I try to access `/admin/comments`, **Then** I am redirected to `/admin/login`
3. **Given** I am logged in as regular user (not admin), **When** I try to access admin routes, **Then** I see "403 Forbidden" error
4. **Given** I am logged in as admin, **When** I access any admin route, **Then** I can view the page normally
5. **Given** my session expires, **When** I try to perform an admin action, **Then** I see "Session expired" and am redirected to login

---

### User Story 3 - User Role Management (Priority: P1)

As an admin, I want to manage user roles, so that I can grant or revoke admin privileges to other users.

**Why this priority**: Enables multi-admin management, important for team collaboration.

**Independent Test**: Login as super admin, navigate to users page, change user role, verify role is updated.

**Acceptance Scenarios**:

1. **Given** I am super admin, **When** I visit `/admin/users`, **Then** I see a list of all users with their roles
2. **Given** I see a user with role "reader", **When** I change their role to "admin", **Then** they gain admin privileges
3. **Given** I see an admin user, **When** I change their role to "author", **Then** they can create posts but not moderate comments
4. **Given** I am an author, **When** I try to access `/admin/users`, **Then** I see "403 Forbidden" (only super admin can manage users)
5. **Given** a user has role changed, **When** they log in again, **Then** their new permissions take effect

---

### User Story 4 - Magic Link Authentication (Priority: P2)

As a user, I want to log in using a magic link sent to my email, so that I don't need to remember a password.

**Why this priority**: Improves UX, reduces password fatigue, leverages Supabase Auth feature.

**Independent Test**: Enter email on login page, check email for magic link, click link, verify login success.

**Acceptance Scenarios**:

1. **Given** I am on login page, **When** I click "Send Magic Link", **Then** I see email input form
2. **Given** I enter my email, **When** I click "Send", **Then** I see "Check your email for login link"
3. **Given** I receive the magic link email, **When** I click the link, **Then** I am logged in and redirected to dashboard
4. **Given** magic link is older than 1 hour, **When** I click it, **Then** I see "Link expired, request a new one"
5. **Given** magic link was already used, **When** I click it again, **Then** I see "Link already used"

---

### User Story 5 - Session Management (Priority: P1)

As a user, I want my login session to persist across browser sessions, so that I don't have to log in every time.

**Why this priority**: Essential for good UX, reduces friction for frequent admin users.

**Independent Test**: Login, close browser, reopen, verify still logged in. Test logout functionality.

**Acceptance Scenarios**:

1. **Given** I check "Remember me" on login, **When** I close and reopen browser, **Then** I am still logged in
2. **Given** I don't check "Remember me", **When** I close browser, **Then** my session expires (cookie-based, not persistent)
3. **Given** I am logged in, **When** I am inactive for 7 days, **Then** my session expires and I must log in again
4. **Given** I log in on Device A, **When** I log in on Device B, **Then** I have separate active sessions on both devices
5. **Given** I click "Logout", **When** logout completes, **Then** my session is terminated on server and I cannot make authenticated requests

---

## Functional Requirements

### Authentication (FR-A-001 to FR-A-015)

- **FR-A-001**: System MUST use Supabase Auth for authentication
- **FR-A-002**: System MUST support email/password authentication
- **FR-A-003**: System MUST support magic link (passwordless) authentication
- **FR-A-004**: System MUST hash passwords using bcrypt (handled by Supabase)
- **FR-A-005**: System MUST validate email format before sending magic link
- **FR-A-006**: System MUST validate password strength: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- **FR-A-007**: System MUST store user data in Supabase auth.users table
- **FR-A-008**: System MUST generate JWT tokens for authenticated sessions
- **FR-A-009**: System MUST refresh JWT tokens automatically before expiration
- **FR-A-010**: System MUST support "Remember me" option (30-day session vs 24-hour session)
- **FR-A-011**: System MUST log out users after 7 days of inactivity
- **FR-A-012**: System MUST allow users to log out manually
- **FR-A-013**: System MUST clear all client-side auth data on logout
- **FR-A-014**: System MUST revoke server-side session on logout
- **FR-A-015**: System MUST support password reset via email link

### Authorization (FR-A-016 to FR-A-030)

- **FR-A-016**: System MUST implement role-based access control (RBAC)
- **FR-A-017**: System MUST support roles: super_admin, admin, author, reader
- **FR-A-018**: Role "super_admin" MUST have all permissions
- **FR-A-019**: Role "admin" MUST be able to: manage posts, moderate comments, view analytics
- **FR-A-020**: Role "author" MUST be able to: create/edit own posts, view own post analytics
- **FR-A-021**: Role "reader" MUST only have public access (default for new users)
- **FR-A-022**: System MUST store user role in user_metadata field in Supabase
- **FR-A-023**: System MUST include role in JWT token claims
- **FR-A-024**: System MUST check role on every protected API request
- **FR-A-025**: System MUST return 401 Unauthorized if no valid session
- **FR-A-026**: System MUST return 403 Forbidden if insufficient permissions
- **FR-A-027**: Protected admin routes MUST redirect to login if not authenticated
- **FR-A-028**: Protected admin routes MUST show 403 page if authenticated but not admin
- **FR-A-029**: System MUST allow super_admin to change other users' roles
- **FR-A-030**: System MUST prevent users from elevating their own role

### User Management (FR-A-031 to FR-A-040)

- **FR-A-031**: System MUST provide `/admin/users` page for user management (super_admin only)
- **FR-A-032**: User management page MUST display: Email, Role, Created Date, Last Login
- **FR-A-033**: Super admin MUST be able to search users by email
- **FR-A-034**: Super admin MUST be able to filter users by role
- **FR-A-035**: Super admin MUST be able to change user roles via dropdown
- **FR-A-036**: System MUST confirm role changes before applying
- **FR-A-037**: System MUST log all role changes with timestamp and admin who made the change
- **FR-A-038**: Super admin MUST be able to delete user accounts
- **FR-A-039**: System MUST soft-delete users (keep data with deleted_at timestamp)
- **FR-A-040**: Deleted users MUST NOT be able to log in

### Security (FR-A-041 to FR-A-050)

- **FR-A-041**: System MUST implement rate limiting: max 5 login attempts per email per 15 minutes
- **FR-A-042**: System MUST lock account after 5 failed login attempts for 30 minutes
- **FR-A-043**: System MUST send email notification on suspicious login (new device/location)
- **FR-A-044**: System MUST use HTTPS for all authentication requests
- **FR-A-045**: System MUST set secure, httpOnly cookies for session tokens
- **FR-A-046**: System MUST implement CSRF protection for auth endpoints
- **FR-A-047**: Magic links MUST expire after 1 hour
- **FR-A-048**: Magic links MUST be single-use only
- **FR-A-049**: Password reset links MUST expire after 1 hour
- **FR-A-050**: System MUST log all authentication events (login, logout, failed attempts)

---

## Non-Functional Requirements

### Performance (NFR-A-001 to NFR-A-005)

- **NFR-A-001**: Login MUST complete within 2 seconds
- **NFR-A-002**: Session validation MUST complete within 100ms
- **NFR-A-003**: Token refresh MUST complete within 500ms
- **NFR-A-004**: Logout MUST complete within 1 second
- **NFR-A-005**: User list page MUST load within 2 seconds for up to 10,000 users

### Security (NFR-A-006 to NFR-A-012)

- **NFR-A-006**: JWT tokens MUST use RS256 algorithm
- **NFR-A-007**: Tokens MUST expire after 1 hour (short-lived)
- **NFR-A-008**: Refresh tokens MUST be stored in httpOnly cookies
- **NFR-A-009**: Passwords MUST NEVER be logged or exposed in errors
- **NFR-A-010**: Session hijacking MUST be prevented via token rotation
- **NFR-A-011**: All auth endpoints MUST have rate limiting
- **NFR-A-012**: Supabase RLS policies MUST be enabled for all tables

### Usability (NFR-A-013 to NFR-A-016)

- **NFR-A-013**: Login page MUST be accessible and WCAG 2.1 Level AA compliant
- **NFR-A-014**: Error messages MUST be clear and actionable
- **NFR-A-015**: Login form MUST support password managers
- **NFR-A-016**: Mobile responsive design for all auth pages

---

## Database Schema

### User Roles (stored in auth.users metadata)

```sql
-- Supabase auth.users already exists
-- We extend it with custom metadata

-- Example user_metadata structure:
{
  "role": "admin", -- super_admin, admin, author, reader
  "display_name": "John Doe",
  "created_by": "admin_uuid", -- who created this user
  "last_login": "2025-12-03T10:30:00Z"
}
```

### Role Change Log Table

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

### Auth Events Log

```sql
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- login, logout, failed_login, password_reset, etc.
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

---

## API Specification

### POST /api/auth/login

Login with email/password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "displayName": "John Doe"
  },
  "session": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresAt": "2025-12-03T11:30:00Z"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

**Error (429 Too Many Requests):**
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "retryAfter": 900
}
```

---

### POST /api/auth/magic-link

Send magic link for passwordless login.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Check your email for a login link"
}
```

---

### POST /api/auth/logout

Logout current user.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/session

Get current user session.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "displayName": "John Doe"
  },
  "session": {
    "expiresAt": "2025-12-03T11:30:00Z"
  }
}
```

---

### GET /api/admin/users

Get all users (super_admin only).

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `role` (optional): Filter by role
- `search` (optional): Search by email
- `page`, `limit`: Pagination

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "author",
      "displayName": "Jane Smith",
      "createdAt": "2025-11-01T00:00:00Z",
      "lastLogin": "2025-12-03T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

---

### PUT /api/admin/users/[id]/role

Change user role (super_admin only).

**Request Body:**
```json
{
  "role": "admin",
  "reason": "Promoted to admin for content management"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": "uuid",
    "role": "admin"
  }
}
```

---

## UI/UX Specifications

### Login Page (`/admin/login`)

```tsx
<LoginPage>
  - Logo/Site name at top
  - Heading: "Admin Login"
  - Form:
    - Email input (type=email, required)
    - Password input (type=password, required, show/hide toggle)
    - Remember me checkbox
    - Submit button: "Login"
  - OR divider
  - Magic Link button: "Send Magic Link"
  - Forgot password link
  - Error alert at top (if error)
  - Loading state on submit
</LoginPage>
```

### Admin Navbar (when logged in)

```tsx
<AdminNavbar>
  - Logo (links to /admin/dashboard)
  - Navigation: Dashboard, Posts, Comments, Users (if super_admin)
  - Right side:
    - Notifications icon (with badge)
    - User dropdown:
      - Display name + email
      - View Profile
      - Settings
      - Logout button
</AdminNavbar>
```

### User Management Page (`/admin/users`)

```tsx
<UserManagementPage>
  - Header: "User Management"
  - Filters:
    - Search box (by email)
    - Role dropdown filter
  - Table:
    - Email
    - Display Name
    - Role (editable dropdown for super_admin)
    - Created Date
    - Last Login
    - Actions (Edit, Delete)
  - Pagination
  - Confirmation modal for role changes
</UserManagementPage>
```

---

## Middleware Setup

### Auth Middleware (`middleware.ts`)

```typescript
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request });
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    const userRole = session.user.user_metadata?.role;
    
    // Check admin role
    if (!['super_admin', 'admin', 'author'].includes(userRole)) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    
    // Check super_admin for /admin/users
    if (request.nextUrl.pathname.startsWith('/admin/users')) {
      if (userRole !== 'super_admin') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
```

---

## Success Criteria

- [ ] Users can log in with email/password
- [ ] Users can log in with magic link
- [ ] Sessions persist across browser sessions (if Remember Me checked)
- [ ] Sessions expire appropriately (1 hour tokens, 7 days inactivity)
- [ ] Protected admin routes redirect to login if not authenticated
- [ ] Admin routes check role and show 403 if insufficient permissions
- [ ] Super admin can view all users
- [ ] Super admin can change user roles
- [ ] Role changes are logged
- [ ] Rate limiting prevents brute force attacks
- [ ] Account lockout after 5 failed attempts
- [ ] Password reset flow works
- [ ] Logout clears session properly
- [ ] UI is responsive and accessible
- [ ] All security requirements met

---

## Integration Points

### With Supabase
- Use Supabase Auth for authentication
- Store roles in user_metadata
- Use RLS policies for authorization
- Use Supabase client libraries

### With Comments System
- Comment moderation requires admin role
- Check role in API endpoints
- Show admin UI only to admins

### With CMS Features
- Post creation requires author/admin role
- Post editing respects ownership (authors can only edit own posts)
- Admin can edit any post

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Next Review**: After Supabase Setup
