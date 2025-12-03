# Feature Specification: Admin CMS Interface

**Feature Branch**: `feature/admin-cms`  
**Created**: 2025-12-03  
**Status**: Draft  
**Priority**: HIGH  
**Dependencies**: Authentication system, Supabase setup

## Overview

Xây dựng giao diện admin CMS để quản lý posts (create, edit, delete, publish/draft) và moderate comments. Admin interface hoạt động như một dashboard tập trung cho tất cả content management tasks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Dashboard Overview (Priority: P1)

As an admin, I want to see an overview dashboard, so that I can quickly understand the status of my blog.

**Why this priority**: Dashboard cung cấp quick access và overview - essential cho admin workflow.

**Independent Test**: Login as admin, navigate to `/admin/dashboard`, verify all widgets display correct data.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I visit `/admin/dashboard`, **Then** I see total posts count
2. **Given** I am on dashboard, **When** page loads, **Then** I see total comments count
3. **Given** I have pending comments, **When** I view dashboard, **Then** I see "X Pending Comments" badge in red
4. **Given** I am on dashboard, **When** page loads, **Then** I see recent posts list (last 5)
5. **Given** I am on dashboard, **When** page loads, **Then** I see recent comments list (last 10)
6. **Given** I click on a recent post, **When** clicked, **Then** I navigate to edit page for that post
7. **Given** I am an author (not admin), **When** I view dashboard, **Then** I only see my own posts statistics

---

### User Story 2 - Create New Post (Priority: P0)

As an author/admin, I want to create new blog posts, so that I can publish content to my blog.

**Why this priority**: Core functionality - không thể có CMS mà không có create post feature.

**Independent Test**: Click "New Post" button, fill form, save as draft, verify post appears in drafts list.

**Acceptance Scenarios**:

1. **Given** I am on `/admin/posts`, **When** I click "New Post", **Then** I navigate to `/admin/posts/new`
2. **Given** I am on new post page, **When** page loads, **Then** I see empty form with: Title, Slug, Tags, Excerpt, Content editor
3. **Given** I fill title "My New Post", **When** I blur title input, **Then** slug is auto-generated as "my-new-post"
4. **Given** I type in content editor, **When** I format text (bold, italic, link), **Then** Markdown syntax is inserted
5. **Given** I have unsaved changes, **When** I try to leave page, **Then** I see confirmation dialog
6. **Given** I click "Save Draft", **When** save completes, **Then** post is saved with status=draft
7. **Given** I click "Publish", **When** publish completes, **Then** post is saved with status=published and current timestamp
8. **Given** I am an author, **When** I save post, **Then** author field is set to my user ID

---

### User Story 3 - Edit Existing Post (Priority: P0)

As an admin/author, I want to edit my existing posts, so that I can fix errors or update content.

**Why this priority**: Essential for content maintenance and corrections.

**Independent Test**: Navigate to posts list, click edit on a post, modify content, save, verify changes persisted.

**Acceptance Scenarios**:

1. **Given** I am on posts list, **When** I click "Edit" on a post, **Then** I navigate to `/admin/posts/[slug]/edit`
2. **Given** I am on edit page, **When** page loads, **Then** form is pre-filled with existing post data
3. **Given** I edit the title, **When** I save, **Then** slug is NOT auto-updated (manual edit required)
4. **Given** post is published, **When** I change it to draft, **Then** it disappears from public site
5. **Given** post is draft, **When** I click "Publish", **Then** it appears on public site immediately
6. **Given** I am author, **When** I try to edit another author's post, **Then** I see "403 Forbidden"
7. **Given** I am admin, **When** I edit any post, **Then** I can edit successfully regardless of author
8. **Given** I edit published post, **When** I save, **Then** updated_at timestamp is updated

---

### User Story 4 - Delete Post (Priority: P1)

As an admin, I want to delete posts, so that I can remove outdated or inappropriate content.

**Why this priority**: Important for content curation, but less critical than create/edit.

**Independent Test**: Click delete on a post, confirm deletion, verify post removed from list.

**Acceptance Scenarios**:

1. **Given** I am on posts list, **When** I click "Delete" on a post, **Then** I see confirmation modal
2. **Given** I see confirmation modal, **When** I click "Cancel", **Then** post is NOT deleted
3. **Given** I see confirmation modal, **When** I click "Confirm Delete", **Then** post is soft-deleted (deleted_at set)
4. **Given** post is deleted, **When** I view posts list, **Then** deleted post does NOT appear
5. **Given** I am author, **When** I try to delete another author's post, **Then** action is forbidden
6. **Given** post has comments, **When** I delete it, **Then** all comments are also soft-deleted
7. **Given** I am super admin, **When** I view trash, **Then** I can permanently delete posts

---

### User Story 5 - Manage Tags (Priority: P2)

As an admin, I want to manage tags, so that I can keep tag taxonomy clean and organized.

**Why this priority**: Nice to have - initially can just use free-form tags from posts.

**Independent Test**: Navigate to tags page, rename a tag, verify all posts with old tag now use new tag.

**Acceptance Scenarios**:

1. **Given** I am on `/admin/tags`, **When** page loads, **Then** I see list of all tags with post counts
2. **Given** I see a tag, **When** I click "Rename", **Then** I see input to change tag name
3. **Given** I rename "javascript" to "JavaScript", **When** I save, **Then** all posts are updated
4. **Given** I see duplicate tags ("js" and "javascript"), **When** I merge them, **Then** all posts use single tag
5. **Given** tag has 0 posts, **When** I view tags, **Then** tag is shown grayed out with "Delete" option
6. **Given** I delete unused tag, **When** deletion completes, **Then** tag removed from system

---

### User Story 6 - Markdown Editor with Preview (Priority: P1)

As an author, I want to write in Markdown with live preview, so that I can see how my post will look.

**Why this priority**: Critical for good authoring experience - Markdown is confirmed format.

**Independent Test**: Type Markdown in editor, verify preview pane shows rendered HTML in real-time.

**Acceptance Scenarios**:

1. **Given** I am on post editor, **When** I type `# Heading`, **Then** preview shows `<h1>Heading</h1>`
2. **Given** I type `**bold**`, **When** preview updates, **Then** I see bold text
3. **Given** I type code block with syntax, **When** preview renders, **Then** I see syntax highlighted code
4. **Given** I click "Preview" tab, **When** tab switches, **Then** I see full-screen preview (no editor)
5. **Given** I upload image, **When** upload completes, **Then** Markdown image syntax `![alt](url)` is inserted
6. **Given** I am on mobile, **When** I edit post, **Then** editor and preview stack vertically

---

### User Story 7 - Comment Moderation Dashboard (Priority: P0)

As an admin, I want to moderate comments from a central dashboard, so that I can quickly approve/reject comments.

**Why this priority**: Core requirement from assignment - "người dùng đọc & comment (moderation)".

**Independent Test**: Navigate to comments page, see pending comments, approve one, reject one, verify status changes.

**Acceptance Scenarios**:

1. **Given** I am on `/admin/comments`, **When** page loads, **Then** I see all comments sorted by newest first
2. **Given** I see pending comments, **When** I filter by "Pending", **Then** only pending comments shown
3. **Given** I see a pending comment, **When** I click "Approve", **Then** comment status changes to approved
4. **Given** I approve a comment, **When** status changes, **Then** comment appears on public post page
5. **Given** I see a spam comment, **When** I click "Reject", **Then** comment status changes to rejected
6. **Given** I reject comment, **When** status changes, **Then** comment does NOT appear on public site
7. **Given** comment is rejected, **When** I view it in admin, **Then** I see strikethrough text and "Rejected" badge
8. **Given** I see approved comment, **When** I click "Unreject" (for mistakenly rejected), **Then** status reverts to approved
9. **Given** comment contains offensive content, **When** I click "Delete", **Then** comment is permanently deleted

---

## Functional Requirements

### Dashboard (FR-D-001 to FR-D-010)

- **FR-D-001**: Dashboard MUST display total posts count (published + drafts)
- **FR-D-002**: Dashboard MUST display total comments count
- **FR-D-003**: Dashboard MUST display pending comments count (badge if > 0)
- **FR-D-004**: Dashboard MUST show list of recent posts (last 5, with status badges)
- **FR-D-005**: Dashboard MUST show list of recent comments (last 10, with moderation status)
- **FR-D-006**: Dashboard MUST show quick actions: "New Post", "View Comments"
- **FR-D-007**: Authors MUST only see statistics for their own posts
- **FR-D-008**: Admins MUST see statistics for all posts
- **FR-D-009**: Dashboard MUST load within 2 seconds
- **FR-D-010**: Dashboard widgets MUST update in real-time when data changes

### Post Management (FR-D-011 to FR-D-035)

- **FR-D-011**: System MUST provide `/admin/posts` page listing all posts
- **FR-D-012**: Posts list MUST display: Title, Status, Author, Created Date, Comments Count, Actions
- **FR-D-013**: Posts list MUST support filtering by status: All, Published, Drafts
- **FR-D-014**: Posts list MUST support search by title
- **FR-D-015**: Posts list MUST be paginated (20 posts per page)
- **FR-D-016**: System MUST provide "New Post" button navigating to `/admin/posts/new`
- **FR-D-017**: New post form MUST include fields: Title, Slug, Tags, Excerpt, Content
- **FR-D-018**: Title field MUST be required
- **FR-D-019**: Slug MUST auto-generate from title (kebab-case)
- **FR-D-020**: User MUST be able to manually edit slug
- **FR-D-021**: Tags MUST be comma-separated input with autocomplete
- **FR-D-022**: Content editor MUST support Markdown syntax
- **FR-D-023**: Content editor MUST have toolbar: Bold, Italic, Link, Image, Code, Heading
- **FR-D-024**: System MUST provide live preview pane
- **FR-D-025**: System MUST warn user before leaving page with unsaved changes
- **FR-D-026**: Save button MUST have two options: "Save Draft" and "Publish"
- **FR-D-027**: "Save Draft" MUST set status=draft, published_at=null
- **FR-D-028**: "Publish" MUST set status=published, published_at=now()
- **FR-D-029**: System MUST auto-save draft every 30 seconds
- **FR-D-030**: Edit post page MUST pre-fill form with existing data
- **FR-D-031**: Authors MUST only be able to edit their own posts
- **FR-D-032**: Admins MUST be able to edit any post
- **FR-D-033**: Delete action MUST soft-delete posts (set deleted_at)
- **FR-D-034**: Authors MUST NOT be able to delete other authors' posts
- **FR-D-035**: Admin MUST be able to delete any post

### Comment Moderation (FR-D-036 to FR-D-050)

- **FR-D-036**: System MUST provide `/admin/comments` page listing all comments
- **FR-D-037**: Comments list MUST display: Post Title, Author Name, Content (truncated), Status, Date, Actions
- **FR-D-038**: Comments list MUST support filtering: All, Pending, Approved, Rejected
- **FR-D-039**: Default filter MUST be "Pending" to prioritize moderation
- **FR-D-040**: Comments MUST be sorted by newest first
- **FR-D-041**: Each comment MUST have actions: Approve, Reject, Delete
- **FR-D-042**: Approve action MUST set status=approved
- **FR-D-043**: Reject action MUST set status=rejected
- **FR-D-044**: Delete action MUST permanently delete comment (not soft delete)
- **FR-D-045**: System MUST allow bulk actions (approve/reject multiple comments)
- **FR-D-046**: System MUST show confirmation for bulk actions
- **FR-D-047**: Comment detail view MUST show full content, author email, IP address, user agent
- **FR-D-048**: Authors MUST be able to moderate comments on their own posts only
- **FR-D-049**: Admins MUST be able to moderate all comments
- **FR-D-050**: System MUST highlight spam-like patterns (multiple links, all caps, etc.)

### Tag Management (FR-D-051 to FR-D-058)

- **FR-D-051**: System MUST provide `/admin/tags` page listing all tags
- **FR-D-052**: Tags list MUST display: Tag Name, Post Count, Actions
- **FR-D-053**: System MUST allow renaming tags
- **FR-D-054**: Renaming tag MUST update all posts using that tag
- **FR-D-055**: System MUST allow merging duplicate tags
- **FR-D-056**: System MUST allow deleting unused tags (0 posts)
- **FR-D-057**: Deleting tag with posts MUST be prevented (require merge or reassign first)
- **FR-D-058**: Tag slug MUST auto-generate from tag name

### Image Upload (FR-D-059 to FR-D-065)

- **FR-D-059**: System MUST provide image upload in post editor
- **FR-D-060**: Upload MUST support: JPG, PNG, GIF, WebP formats
- **FR-D-061**: Max file size MUST be 5MB
- **FR-D-062**: Images MUST be stored in Supabase Storage
- **FR-D-063**: Upload MUST return public URL
- **FR-D-064**: System MUST insert Markdown image syntax after upload
- **FR-D-065**: System MUST show image preview in editor after upload

---

## Non-Functional Requirements

### Performance (NFR-D-001 to NFR-D-006)

- **NFR-D-001**: Dashboard MUST load within 2 seconds
- **NFR-D-002**: Posts list page MUST load within 1.5 seconds (20 posts)
- **NFR-D-003**: Post editor MUST respond to typing within 50ms (no lag)
- **NFR-D-004**: Preview pane MUST update within 200ms of typing
- **NFR-D-005**: Auto-save MUST complete within 1 second
- **NFR-D-006**: Image upload MUST show progress indicator

### Usability (NFR-D-007 to NFR-D-013)

- **NFR-D-007**: All admin pages MUST be responsive (desktop, tablet, mobile)
- **NFR-D-008**: Admin interface MUST be accessible (WCAG 2.1 Level AA)
- **NFR-D-009**: Success/error messages MUST be displayed as toast notifications
- **NFR-D-010**: Forms MUST have inline validation with clear error messages
- **NFR-D-011**: Loading states MUST be indicated with spinners
- **NFR-D-012**: Bulk actions MUST have progress indicators
- **NFR-D-013**: Keyboard shortcuts MUST be available (Ctrl+S to save, etc.)

### Data Integrity (NFR-D-014 to NFR-D-018)

- **NFR-D-014**: Auto-save MUST NOT overwrite manual saves
- **NFR-D-015**: Concurrent edits MUST be detected and user warned
- **NFR-D-016**: All destructive actions MUST require confirmation
- **NFR-D-017**: Deleted content MUST be recoverable for 30 days
- **NFR-D-018**: All data changes MUST be logged with timestamp and user

---

## Database Schema Extensions

### Posts Table (extends existing schema)

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS auto_save_data JSONB; -- for auto-save feature

CREATE INDEX idx_posts_deleted ON posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_author ON posts(author_id);
```

### Post Revisions Table (for edit history)

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

### Tags Table

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

### Post Tags Junction Table

```sql
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
```

---

## API Specification

### GET /api/admin/stats

Get dashboard statistics (admin/author only).

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "totalPosts": 42,
  "publishedPosts": 35,
  "draftPosts": 7,
  "totalComments": 156,
  "pendingComments": 12,
  "recentPosts": [
    {
      "id": "uuid",
      "title": "Latest Post",
      "status": "published",
      "createdAt": "2025-12-03T10:00:00Z",
      "commentsCount": 5
    }
  ],
  "recentComments": [
    {
      "id": "uuid",
      "postTitle": "Some Post",
      "authorName": "John Doe",
      "content": "Great article!",
      "status": "pending",
      "createdAt": "2025-12-03T09:30:00Z"
    }
  ]
}
```

---

### GET /api/admin/posts

Get all posts for admin interface.

**Query Parameters:**
- `status`: all | published | draft
- `search`: Search by title
- `page`, `limit`: Pagination
- `author`: Filter by author (for admins)

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "My Blog Post",
      "slug": "my-blog-post",
      "status": "published",
      "author": {
        "id": "uuid",
        "name": "John Doe"
      },
      "createdAt": "2025-12-01T00:00:00Z",
      "updatedAt": "2025-12-02T10:00:00Z",
      "commentsCount": 8,
      "tags": ["nextjs", "typescript"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

---

### POST /api/admin/posts

Create new post (author/admin only).

**Request Body:**
```json
{
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "# Post content in Markdown...",
  "excerpt": "Short description",
  "tags": ["nextjs", "tutorial"],
  "status": "draft"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "slug": "my-new-post",
    "title": "My New Post"
  }
}
```

---

### PUT /api/admin/posts/[id]

Update existing post.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "updatedAt": "2025-12-03T11:00:00Z"
  }
}
```

---

### DELETE /api/admin/posts/[id]

Soft delete post.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### GET /api/admin/tags

Get all tags with post counts.

**Response (200 OK):**
```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "Next.js",
      "slug": "nextjs",
      "postCount": 15
    },
    {
      "id": "uuid",
      "name": "TypeScript",
      "slug": "typescript",
      "postCount": 12
    }
  ]
}
```

---

### PUT /api/admin/tags/[id]

Rename or merge tag.

**Request Body:**
```json
{
  "name": "NextJS",
  "mergeWith": "uuid-of-another-tag" // optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tag updated successfully"
}
```

---

### POST /api/admin/upload

Upload image for post.

**Request Body:**
```
multipart/form-data with file field
```

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://storage.supabase.co/bucket/image.jpg",
  "markdown": "![Image description](https://storage.supabase.co/bucket/image.jpg)"
}
```

---

### PUT /api/admin/comments/[id]/moderate

Moderate comment (approve/reject).

**Request Body:**
```json
{
  "status": "approved" // or "rejected"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "comment": {
    "id": "uuid",
    "status": "approved"
  }
}
```

---

## UI/UX Specifications

### Admin Dashboard (`/admin/dashboard`)

```tsx
<DashboardPage>
  <StatsGrid>
    <StatCard icon={FileText} title="Total Posts" value={42} />
    <StatCard icon={MessageSquare} title="Total Comments" value={156} />
    <StatCard icon={Clock} title="Pending Comments" value={12} badge="warning" />
    <StatCard icon={Users} title="Authors" value={5} />
  </StatsGrid>
  
  <TwoColumnLayout>
    <LeftColumn>
      <SectionCard title="Recent Posts">
        {recentPosts.map(post => (
          <PostListItem 
            title={post.title}
            status={post.status}
            date={post.createdAt}
            comments={post.commentsCount}
          />
        ))}
      </SectionCard>
    </LeftColumn>
    
    <RightColumn>
      <SectionCard title="Recent Comments">
        {recentComments.map(comment => (
          <CommentListItem 
            postTitle={comment.postTitle}
            author={comment.authorName}
            content={comment.content}
            status={comment.status}
          />
        ))}
      </SectionCard>
    </RightColumn>
  </TwoColumnLayout>
  
  <QuickActions>
    <Button variant="primary" href="/admin/posts/new">New Post</Button>
    <Button variant="secondary" href="/admin/comments">Moderate Comments</Button>
  </QuickActions>
</DashboardPage>
```

### Posts List Page (`/admin/posts`)

```tsx
<PostsListPage>
  <Header>
    <Title>Posts</Title>
    <Actions>
      <SearchInput placeholder="Search posts..." />
      <FilterDropdown options={['All', 'Published', 'Drafts']} />
      <Button variant="primary" href="/admin/posts/new">New Post</Button>
    </Actions>
  </Header>
  
  <Table>
    <TableHeader>
      <Th>Title</Th>
      <Th>Status</Th>
      <Th>Author</Th>
      <Th>Date</Th>
      <Th>Comments</Th>
      <Th>Actions</Th>
    </TableHeader>
    <TableBody>
      {posts.map(post => (
        <Tr>
          <Td>{post.title}</Td>
          <Td><StatusBadge status={post.status} /></Td>
          <Td>{post.author.name}</Td>
          <Td>{formatDate(post.createdAt)}</Td>
          <Td>{post.commentsCount}</Td>
          <Td>
            <IconButton icon="Edit" href={`/admin/posts/${post.id}/edit`} />
            <IconButton icon="Trash" onClick={() => handleDelete(post.id)} />
          </Td>
        </Tr>
      ))}
    </TableBody>
  </Table>
  
  <Pagination page={page} total={total} />
</PostsListPage>
```

### Post Editor (`/admin/posts/new` or `/admin/posts/[id]/edit`)

```tsx
<PostEditorPage>
  <Header>
    <BackButton href="/admin/posts" />
    <Title>{isNew ? 'New Post' : 'Edit Post'}</Title>
    <Actions>
      <SaveButton variant="secondary" onClick={saveDraft}>Save Draft</SaveButton>
      <SaveButton variant="primary" onClick={publish}>Publish</SaveButton>
    </Actions>
  </Header>
  
  <EditorLayout>
    <MetadataPanel>
      <FormField label="Title" required>
        <Input value={title} onChange={setTitle} />
      </FormField>
      
      <FormField label="Slug">
        <Input value={slug} onChange={setSlug} />
        <HelpText>Auto-generated from title</HelpText>
      </FormField>
      
      <FormField label="Tags">
        <TagInput tags={tags} onChange={setTags} />
      </FormField>
      
      <FormField label="Excerpt">
        <Textarea rows={3} value={excerpt} onChange={setExcerpt} />
      </FormField>
    </MetadataPanel>
    
    <EditorPanel>
      <Tabs>
        <Tab label="Edit" active />
        <Tab label="Preview" />
      </Tabs>
      
      <EditorToolbar>
        <ToolbarButton icon="Bold" onClick={insertBold} />
        <ToolbarButton icon="Italic" onClick={insertItalic} />
        <ToolbarButton icon="Link" onClick={insertLink} />
        <ToolbarButton icon="Image" onClick={openImageUpload} />
        <ToolbarButton icon="Code" onClick={insertCode} />
      </EditorToolbar>
      
      <MarkdownEditor value={content} onChange={setContent} />
      
      <PreviewPane html={renderedHTML} />
    </EditorPanel>
  </EditorLayout>
  
  <AutoSaveIndicator lastSaved={lastSaveTime} />
</PostEditorPage>
```

### Comments Moderation Page (`/admin/comments`)

```tsx
<CommentsPage>
  <Header>
    <Title>Comments</Title>
    <FilterTabs>
      <Tab label="Pending (12)" active />
      <Tab label="Approved" />
      <Tab label="Rejected" />
      <Tab label="All" />
    </FilterTabs>
  </Header>
  
  <BulkActions>
    <Checkbox label="Select All" />
    <Button variant="success" onClick={bulkApprove}>Approve Selected</Button>
    <Button variant="danger" onClick={bulkReject}>Reject Selected</Button>
  </BulkActions>
  
  <CommentsList>
    {comments.map(comment => (
      <CommentCard>
        <Checkbox value={comment.id} />
        <CommentMeta>
          <PostTitle>{comment.postTitle}</PostTitle>
          <AuthorInfo>
            <Avatar src={comment.authorEmail} />
            <span>{comment.authorName}</span>
            <span>{formatDate(comment.createdAt)}</span>
          </AuthorInfo>
        </CommentMeta>
        <CommentContent>{comment.content}</CommentContent>
        <CommentActions>
          <Button variant="success" size="sm" onClick={() => approve(comment.id)}>
            Approve
          </Button>
          <Button variant="danger" size="sm" onClick={() => reject(comment.id)}>
            Reject
          </Button>
          <Button variant="ghost" size="sm" onClick={() => viewDetails(comment.id)}>
            Details
          </Button>
        </CommentActions>
      </CommentCard>
    ))}
  </CommentsList>
</CommentsPage>
```

---

## Success Criteria

- [ ] Dashboard displays accurate statistics
- [ ] Can create new posts with all metadata fields
- [ ] Slug auto-generates from title
- [ ] Markdown editor works with toolbar shortcuts
- [ ] Live preview renders Markdown correctly
- [ ] Can save posts as draft or published
- [ ] Auto-save works every 30 seconds
- [ ] Can edit existing posts
- [ ] Authors can only edit own posts, admins can edit all
- [ ] Can delete posts (soft delete)
- [ ] Posts list supports filtering and search
- [ ] Comments page shows all comments with status
- [ ] Can approve/reject individual comments
- [ ] Can perform bulk comment moderation
- [ ] Tag management page works (rename, merge, delete)
- [ ] Image upload works and inserts Markdown
- [ ] All pages are responsive
- [ ] Forms have validation
- [ ] Loading states are shown
- [ ] Success/error toasts appear

---

## Integration Points

### With Authentication System
- All admin routes require authentication
- Check user role for permissions (author vs admin)
- Display user info in admin navbar

### With Comments System
- Dashboard shows pending comments count
- Comments page lists all comments from database
- Moderation actions update comment status

### With Supabase
- Posts stored in `posts` table
- Comments stored in `comments` table
- Images uploaded to Supabase Storage
- RLS policies enforce permissions

### With Public Site
- Published posts appear on homepage
- Approved comments appear on post pages
- Draft posts NOT visible to public

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Next Review**: After Authentication System implementation
