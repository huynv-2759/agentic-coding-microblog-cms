# Feature Specification: Comments & Moderation System

**Feature Branch**: `feature/comments-system`  
**Created**: 2025-12-03  
**Status**: Draft  
**Priority**: CRITICAL  
**Dependencies**: Supabase setup, Authentication system

## Overview

Thêm hệ thống bình luận (comments) với tính năng moderation cho phép người đọc tương tác với bài viết và admin có thể kiểm duyệt nội dung.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reader Comments on Blog Post (Priority: P0)

As a blog reader, I want to leave comments on posts I find interesting, so that I can share my thoughts and engage with the content.

**Why this priority**: Comments là yêu cầu BẮT BUỘC của đề bài. Không có comments thì không đáp ứng đề bài.

**Independent Test**: Có thể test bằng cách truy cập một post, điền form comment, submit, và verify comment được lưu vào database (status pending).

**Acceptance Scenarios**:

1. **Given** I am reading a blog post, **When** I scroll to the bottom, **Then** I see a comment form with fields: Name, Email, Comment
2. **Given** I fill in all required fields (Name, Email, Comment), **When** I click "Submit Comment", **Then** my comment is saved with status "pending"
3. **Given** I submit a comment, **When** submission succeeds, **Then** I see a success message "Your comment is awaiting moderation"
4. **Given** I try to submit without filling Name, **When** I click Submit, **Then** I see validation error "Name is required"
5. **Given** I try to submit with invalid email, **When** I click Submit, **Then** I see validation error "Valid email is required"
6. **Given** I see the comment section, **When** page loads, **Then** I see only approved comments (pending comments are hidden from readers)
7. **Given** there are 5 approved comments on a post, **When** I view the post, **Then** I see all 5 comments displayed in chronological order (oldest first)

---

### User Story 2 - Admin Moderates Comments (Priority: P0)

As an admin, I want to review and moderate comments before they appear publicly, so that I can prevent spam and inappropriate content.

**Why this priority**: Comment moderation là yêu cầu BẮT BUỘC trong đề bài.

**Independent Test**: Login as admin, navigate to `/admin/comments`, see pending comments, approve/reject them, verify changes in database.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I visit `/admin/comments`, **Then** I see a list of all comments with status badges (Pending/Approved/Rejected)
2. **Given** there are 3 pending comments, **When** I view the admin comments page, **Then** I see a notification badge showing "3 pending"
3. **Given** I see a pending comment, **When** I click "Approve", **Then** the comment status changes to "approved" and appears on the blog post
4. **Given** I see a pending comment, **When** I click "Reject", **Then** the comment status changes to "rejected" and is hidden
5. **Given** I approve a comment, **When** readers visit the post, **Then** they can see the approved comment
6. **Given** I am on the comments page, **When** I filter by "Pending", **Then** I see only pending comments
7. **Given** I select multiple comments, **When** I click "Bulk Approve", **Then** all selected comments are approved at once
8. **Given** I see a comment, **When** I click "View Post", **Then** I navigate to the blog post containing that comment

---

### User Story 3 - Real-time Comment Count Display (Priority: P1)

As a blog reader, I want to see how many comments a post has before opening it, so that I can find posts with active discussions.

**Why this priority**: Giúp readers discover active discussions, khuyến khích engagement.

**Independent Test**: Add comments to a post, verify post card shows correct count, verify count updates when comments are approved.

**Acceptance Scenarios**:

1. **Given** a post has 5 approved comments, **When** I view the post card on homepage, **Then** I see "5 Comments" displayed
2. **Given** a post has 0 comments, **When** I view the post card, **Then** I see "No comments yet" or hide the comment count
3. **Given** a post has 1 comment, **When** I view the post card, **Then** I see "1 Comment" (singular form)
4. **Given** a post has pending comments but no approved comments, **When** readers view the post card, **Then** comment count shows 0
5. **Given** admin approves a comment, **When** page is refreshed, **Then** comment count increases by 1

---

### User Story 4 - Comment Notification for Author (Priority: P2)

As a blog author, I want to receive notifications when new comments are posted, so that I can respond quickly to reader engagement.

**Why this priority**: Enhances author-reader interaction, optional but valuable feature.

**Independent Test**: Submit a comment, verify email notification is sent to author with comment preview and link.

**Acceptance Scenarios**:

1. **Given** a new comment is submitted, **When** it's saved to database, **Then** author receives an email notification
2. **Given** author receives a notification email, **When** they open it, **Then** they see comment preview, author name, and link to moderate
3. **Given** author clicks the moderation link, **When** link is opened, **Then** they are taken to admin comments page with that comment highlighted
4. **Given** author has email notifications enabled, **When** 5 comments are submitted in 1 hour, **Then** author receives 1 digest email instead of 5 separate emails

---

### User Story 5 - Spam Prevention (Priority: P1)

As an admin, I want basic spam prevention measures, so that I don't waste time moderating obvious spam.

**Why this priority**: Protects content quality and saves admin time.

**Independent Test**: Submit comments with spam patterns, verify they are flagged or blocked.

**Acceptance Scenarios**:

1. **Given** a comment contains more than 3 URLs, **When** submitted, **Then** it's auto-flagged as potential spam
2. **Given** a comment is very short (< 10 characters), **When** submitted, **Then** validation error "Comment too short"
3. **Given** a comment contains spam keywords (e.g., "viagra", "casino"), **When** submitted, **Then** it's auto-rejected or flagged
4. **Given** same email submits more than 3 comments in 1 minute, **When** 4th comment is submitted, **Then** rate limit error "Too many comments, please slow down"
5. **Given** a comment has suspicious patterns, **When** admin views it, **Then** they see a "Potential Spam" badge

---

## Functional Requirements

### Comment Submission (FR-C-001 to FR-C-010)

- **FR-C-001**: System MUST allow anonymous users to submit comments without authentication
- **FR-C-002**: Comment form MUST require: Name (text, 2-50 chars), Email (valid email), Comment (text, 10-1000 chars)
- **FR-C-003**: System MUST validate email format using standard email regex
- **FR-C-004**: System MUST store comments in Supabase with fields: id (uuid), post_slug (text), author_name (text), author_email (text), content (text), status (enum: pending/approved/rejected), created_at (timestamp)
- **FR-C-005**: New comments MUST default to "pending" status
- **FR-C-006**: System MUST display success message after successful comment submission
- **FR-C-007**: System MUST display validation errors inline for each field
- **FR-C-008**: System MUST sanitize comment content to prevent XSS attacks (strip HTML tags except safe ones like <strong>, <em>, <a>)
- **FR-C-009**: System MUST rate-limit comment submissions: max 3 comments per email per minute
- **FR-C-010**: System MUST store commenter's IP address for spam prevention

### Comment Display (FR-C-011 to FR-C-020)

- **FR-C-011**: System MUST display only "approved" comments to anonymous readers
- **FR-C-012**: Comments MUST be displayed in chronological order (oldest first)
- **FR-C-013**: Each comment MUST show: Author name, Timestamp (relative, e.g., "2 hours ago"), Content
- **FR-C-014**: System MUST NOT display commenter's email address publicly
- **FR-C-015**: Post cards MUST display approved comment count
- **FR-C-016**: Comment count MUST use singular/plural forms correctly ("1 Comment" vs "5 Comments")
- **FR-C-017**: System MUST show "No comments yet" when post has zero approved comments
- **FR-C-018**: System MUST format comment timestamps using relative time (e.g., "2 minutes ago", "3 days ago")
- **FR-C-019**: Comments section MUST show loading state while fetching comments
- **FR-C-020**: System MUST paginate comments if more than 20 (show 20 per page with "Load More" button)

### Admin Moderation (FR-C-021 to FR-C-035)

- **FR-C-021**: System MUST require authentication to access `/admin/comments`
- **FR-C-022**: Admin MUST be able to view all comments regardless of status
- **FR-C-023**: Admin interface MUST display comments in table with columns: Author, Email, Comment (preview), Post, Status, Date, Actions
- **FR-C-024**: Admin MUST be able to filter comments by status (All/Pending/Approved/Rejected)
- **FR-C-025**: Admin MUST be able to approve pending comments with single click
- **FR-C-026**: Admin MUST be able to reject pending comments with single click
- **FR-C-027**: Admin MUST be able to delete comments permanently
- **FR-C-028**: System MUST show confirmation dialog before deleting comments
- **FR-C-029**: Admin MUST be able to view full comment content in modal/popup
- **FR-C-030**: Admin MUST be able to click "View Post" to navigate to the post containing that comment
- **FR-C-031**: Admin interface MUST show pending comment count in navigation badge
- **FR-C-032**: Admin MUST be able to select multiple comments for bulk actions
- **FR-C-033**: Admin MUST be able to bulk approve selected comments
- **FR-C-034**: Admin MUST be able to bulk reject selected comments
- **FR-C-035**: System MUST show success toast notification after moderation actions

### API Endpoints (FR-C-036 to FR-C-045)

- **FR-C-036**: System MUST provide `POST /api/comments` to create new comments
- **FR-C-037**: System MUST provide `GET /api/comments/[postSlug]` to fetch approved comments for a post
- **FR-C-038**: System MUST provide `GET /api/admin/comments` to fetch all comments (admin only)
- **FR-C-039**: System MUST provide `PUT /api/admin/comments/[id]/approve` to approve comments (admin only)
- **FR-C-040**: System MUST provide `PUT /api/admin/comments/[id]/reject` to reject comments (admin only)
- **FR-C-041**: System MUST provide `DELETE /api/admin/comments/[id]` to delete comments (admin only)
- **FR-C-042**: All admin endpoints MUST verify user authentication
- **FR-C-043**: All admin endpoints MUST verify user has admin role
- **FR-C-044**: API MUST return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **FR-C-045**: API MUST return consistent JSON error format: `{ error: string, message: string }`

---

## Non-Functional Requirements

### Performance (NFR-C-001 to NFR-C-005)

- **NFR-C-001**: Comment submission MUST complete within 2 seconds
- **NFR-C-002**: Loading comments for a post MUST complete within 1 second
- **NFR-C-003**: Admin comments page MUST load within 3 seconds even with 1000+ comments
- **NFR-C-004**: Moderation actions (approve/reject) MUST complete within 1 second
- **NFR-C-005**: System MUST use Supabase Realtime for instant comment updates (optional, nice-to-have)

### Security (NFR-C-006 to NFR-C-012)

- **NFR-C-006**: All comment content MUST be sanitized to prevent XSS
- **NFR-C-007**: Email addresses MUST NEVER be exposed in public API responses
- **NFR-C-008**: Admin endpoints MUST require valid JWT token
- **NFR-C-009**: System MUST implement rate limiting: 3 comments/minute per email
- **NFR-C-010**: System MUST implement CSRF protection for comment submission
- **NFR-C-011**: Comment content MUST be stored with proper character encoding (UTF-8)
- **NFR-C-012**: IP addresses MUST be hashed before storage for privacy compliance

### Data Quality (NFR-C-013 to NFR-C-018)

- **NFR-C-013**: Comment author name MUST be trimmed and validated (2-50 characters)
- **NFR-C-014**: Comment content MUST be trimmed and validated (10-1000 characters)
- **NFR-C-015**: Email MUST be validated and normalized (lowercase)
- **NFR-C-016**: Comments MUST have created_at timestamp in UTC
- **NFR-C-017**: Deleted comments MUST be soft-deleted (keep in DB with deleted_at timestamp)
- **NFR-C-018**: Comment moderation actions MUST be logged (who, when, what action)

### Usability (NFR-C-019 to NFR-C-022)

- **NFR-C-019**: Comment form MUST have clear labels and placeholders
- **NFR-C-020**: Validation errors MUST appear immediately after field blur
- **NFR-C-021**: Success/error messages MUST be clearly visible
- **NFR-C-022**: Admin interface MUST be responsive and work on tablets

---

## Database Schema

### Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_slug TEXT NOT NULL,
  author_name VARCHAR(50) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_hash TEXT, -- Hashed IP for spam prevention
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_comments_post_slug ON comments(post_slug);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_email ON comments(author_email);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public read for approved comments
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved' AND deleted_at IS NULL);

-- Public insert (but defaults to pending)
CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK (status = 'pending');

-- Admin full access
CREATE POLICY "Admins can do everything"
  ON comments FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
```

### Comment Moderation Log (Optional)

```sql
CREATE TABLE comment_moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'delete')),
  moderator_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## API Specification

### POST /api/comments

Submit a new comment.

**Request Body:**
```json
{
  "postSlug": "hello-world",
  "authorName": "John Doe",
  "authorEmail": "john@example.com",
  "content": "Great article! Thanks for sharing."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Your comment is awaiting moderation",
  "comment": {
    "id": "uuid",
    "status": "pending",
    "createdAt": "2025-12-03T10:30:00Z"
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "error": "Validation Error",
  "fields": {
    "authorName": "Name must be between 2 and 50 characters",
    "authorEmail": "Valid email is required",
    "content": "Comment must be between 10 and 1000 characters"
  }
}
```

**Rate Limit Error (429 Too Many Requests):**
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many comments. Please wait before submitting again.",
  "retryAfter": 60
}
```

---

### GET /api/comments/[postSlug]

Get approved comments for a post.

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "uuid",
      "authorName": "John Doe",
      "content": "Great article!",
      "createdAt": "2025-12-03T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /api/admin/comments

Get all comments (admin only).

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending/approved/rejected/all)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "uuid",
      "postSlug": "hello-world",
      "postTitle": "Hello World",
      "authorName": "John Doe",
      "authorEmail": "john@example.com",
      "content": "Great article!",
      "status": "pending",
      "createdAt": "2025-12-03T10:30:00Z"
    }
  ],
  "counts": {
    "pending": 15,
    "approved": 230,
    "rejected": 45,
    "total": 290
  }
}
```

---

### PUT /api/admin/comments/[id]/approve

Approve a comment (admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment approved successfully",
  "comment": {
    "id": "uuid",
    "status": "approved"
  }
}
```

---

### PUT /api/admin/comments/[id]/reject

Reject a comment (admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment rejected successfully"
}
```

---

### DELETE /api/admin/comments/[id]

Delete a comment (admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## UI/UX Specifications

### Comment Form Component

```tsx
<CommentForm>
  - Label: "Leave a Comment"
  - Input: Name (text, required, 2-50 chars)
  - Input: Email (email, required, will not be published)
  - Textarea: Comment (required, 10-1000 chars, rows=4)
  - Character counter: "245 / 1000"
  - Submit button: "Submit Comment" (primary blue)
  - Success message: Green alert with checkmark
  - Error messages: Red text under each field
</CommentForm>
```

### Comments List Component

```tsx
<CommentsList>
  - Header: "Comments (5)" or "No comments yet"
  - Each comment:
    - Avatar: First letter of name in colored circle
    - Author name: Bold, 14px
    - Timestamp: Gray, 12px, "2 hours ago"
    - Content: Regular, 14px, line-height 1.6
    - Divider between comments
  - Load More button if paginated
</CommentsList>
```

### Admin Comments Table

```tsx
<AdminCommentsTable>
  - Filters: Tabs for All/Pending/Approved/Rejected
  - Bulk actions bar (when items selected)
  - Table columns:
    - Checkbox (for bulk selection)
    - Author (name + email)
    - Comment (truncated to 100 chars)
    - Post (clickable link)
    - Status (badge with color)
    - Date (relative time)
    - Actions (Approve/Reject/Delete buttons)
  - Status badges:
    - Pending: Yellow
    - Approved: Green
    - Rejected: Red
  - Pagination at bottom
</AdminCommentsTable>
```

---

## Success Criteria

- [ ] Users can submit comments on any blog post
- [ ] Comments are saved to Supabase with pending status
- [ ] Form validation works correctly with clear error messages
- [ ] Only approved comments are visible to readers
- [ ] Admin can view all comments in admin panel
- [ ] Admin can approve/reject/delete comments
- [ ] Admin can filter comments by status
- [ ] Admin can perform bulk actions on multiple comments
- [ ] Comment count displays correctly on post cards
- [ ] Rate limiting prevents spam (max 3 comments/minute)
- [ ] Comment content is sanitized to prevent XSS
- [ ] API endpoints have proper authentication and authorization
- [ ] All tests pass (unit + integration + E2E)
- [ ] Performance meets requirements (< 2s submission, < 1s loading)
- [ ] UI is responsive and accessible

---

## Out of Scope (Future Enhancements)

- Nested replies to comments
- Comment editing by author
- User profiles for commenters
- Social login for commenting
- Real-time comment notifications
- Comment voting/likes
- Comment search
- Markdown support in comments
- File attachments in comments
- Email notifications to commenters
- Comment thread subscriptions

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Next Review**: After Phase 1 Implementation
