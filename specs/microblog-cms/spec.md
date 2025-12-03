# Feature Specification: Microblog CMS - Static Markdown Blog

**Feature Branch**: `main`  
**Created**: 2025-12-03  
**Status**: Draft  
**Input**: User description: "Hệ thống Microblog CMS tập trung vào việc viết và publish bài ngắn bằng Markdown. Website render ở dạng static, có timeline, trang đọc bài viết, trang theo Tag và giao diện responsive cho mobile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Content Creator Publishes New Blog Post (Priority: P1)

As a content creator, I want to publish a new blog post by creating a Markdown file in the `/content/posts` directory, so that the post automatically appears on the timeline after the site is rebuilt.

**Why this priority**: This is the core functionality of the CMS. Without the ability to create and publish posts easily, the system has no purpose. This represents the primary use case and must work flawlessly.

**Independent Test**: Can be fully tested by creating a new `.md` file with proper front matter in `/content/posts/`, running `npm run build`, and verifying the post appears on the homepage timeline and has its own accessible page at `/posts/[slug]`. Delivers immediate value by enabling content publication.

**Acceptance Scenarios**:

1. **Given** I create a file `my-first-post.md` in `/content/posts` with valid front matter (title, date, tags), **When** I run the build command, **Then** the post appears on the homepage timeline sorted by date
2. **Given** my Markdown file includes code blocks, tables, images, and links, **When** the post page renders, **Then** all elements display correctly with proper formatting
3. **Given** I set the front matter date to today, **When** I view the timeline, **Then** my post appears at the top of the list (newest first)
4. **Given** I include tags in the front matter like `["nextjs", "typescript"]`, **When** the build completes, **Then** the post is associated with those tags
5. **Given** I add an image with alt text in the Markdown, **When** the post renders, **Then** the image loads and displays properly

---

### User Story 2 - Reader Browses Timeline and Reads Posts (Priority: P1)

As a blog reader, I want to see a chronological timeline of blog posts on the homepage and click to read full articles, so that I can discover and consume content easily on any device.

**Why this priority**: Without readers being able to browse and read content, the blog serves no purpose. This is the fundamental user experience that must work perfectly across all devices, especially mobile.

**Independent Test**: Can be fully tested by visiting the homepage, seeing a list of post cards with titles/dates/tags/excerpts, clicking on any post card, and reading the full rendered Markdown content. Should work identically on mobile, tablet, and desktop viewports.

**Acceptance Scenarios**:

1. **Given** there are multiple published posts, **When** I visit the homepage `/`, **Then** I see all posts displayed as cards sorted by date (newest first)
2. **Given** I am viewing a post card on the timeline, **When** I see the card, **Then** it displays the title, date, tags, and excerpt (first 150 characters or custom excerpt)
3. **Given** I am on the homepage, **When** I click on a post card, **Then** I navigate to `/posts/[slug]` and see the full post content
4. **Given** I am viewing a post on mobile (< 640px), **When** I scroll through the content, **Then** all text, code blocks, and images are readable without horizontal scrolling
5. **Given** I am reading a post with code blocks, **When** the page renders, **Then** code blocks have syntax highlighting and are horizontally scrollable on small screens
6. **Given** I access a post URL directly, **When** the page loads, **Then** it loads quickly as a pre-rendered static HTML page

---

### User Story 3 - Reader Filters Posts by Tag (Priority: P2)

As a blog reader, I want to filter posts by topic tags, so that I can find content relevant to my specific interests.

**Why this priority**: Tag filtering significantly improves content discoverability, but the blog is still functional without it. This is essential for blogs covering multiple topics but not blocking for MVP.

**Independent Test**: Can be fully tested by clicking on a tag (e.g., "typescript"), navigating to `/tags/typescript`, and verifying only posts with that tag are displayed. Delivers value by enabling topic-focused content discovery.

**Acceptance Scenarios**:

1. **Given** posts have various tags, **When** I view the homepage or a post, **Then** I see tag badges displayed for each post
2. **Given** I click on a tag badge (e.g., "nextjs"), **When** the page loads, **Then** I navigate to `/tags/nextjs` showing only posts with that tag
3. **Given** I am on a tag filter page, **When** I view the page, **Then** I see the tag name as a heading and a list of posts with that tag
4. **Given** there is a tag list component, **When** I view it, **Then** each tag displays with a count of associated posts (e.g., "nextjs (5)")
5. **Given** a post has multiple tags, **When** I view the post, **Then** all tags are displayed as clickable badges

---

### User Story 4 - Mobile-First Responsive Experience (Priority: P1)

As a mobile reader, I want the blog to be fully responsive with touch-friendly navigation, so that I can comfortably read and browse on my smartphone.

**Why this priority**: Mobile-first design is a core principle. Most readers will access the blog from mobile devices, making this essential for user experience and not optional.

**Independent Test**: Can be fully tested by accessing the site on mobile viewports (320px-640px), testing touch interactions, verifying no horizontal scroll, and ensuring all content is readable. Delivers value through excellent mobile UX.

**Acceptance Scenarios**:

1. **Given** I access the site on mobile (< 640px width), **When** I view any page, **Then** the layout adapts without horizontal scrolling
2. **Given** I am on mobile, **When** I view the navbar, **Then** it displays a hamburger menu or mobile-friendly navigation
3. **Given** I tap on interactive elements (links, buttons, post cards), **When** I touch them, **Then** tap targets are at least 44x44px for comfortable interaction
4. **Given** I am reading a post on mobile, **When** I view images, **Then** they scale responsively and don't overflow the viewport
5. **Given** I am on tablet (640px-1024px), **When** I view the timeline, **Then** post cards display in an optimal grid layout (e.g., 2 columns)
6. **Given** I am on desktop (> 1024px), **When** I view the timeline, **Then** post cards display in a wider grid layout (e.g., 3 columns) with proper spacing

---

### User Story 5 - SEO and Social Sharing Optimization (Priority: P2)

As a content creator, I want each blog post to have proper SEO metadata and Open Graph tags, so that my content ranks well in search engines and looks attractive when shared on social media.

**Why this priority**: SEO is critical for blog growth and discoverability, but the blog can function without it initially. This can be added after MVP launch to optimize for search engines.

**Independent Test**: Can be fully tested by inspecting page source for meta tags, validating Open Graph tags with social media debugger tools, and checking sitemap.xml generation. Delivers value through improved discoverability.

**Acceptance Scenarios**:

1. **Given** a blog post has title and excerpt in front matter, **When** I view the page source, **Then** I see proper `<title>`, `<meta name="description">`, and Open Graph tags
2. **Given** I share a post URL on social media (Twitter, Facebook), **When** the link is previewed, **Then** it displays the post title, excerpt, and featured image (if available)
3. **Given** the site is built, **When** I navigate to `/sitemap.xml`, **Then** all published posts are listed with proper URLs and lastmod dates
4. **Given** a post page loads, **When** search engines crawl it, **Then** structured data (JSON-LD) is present with Article schema markup
5. **Given** each post has a unique slug, **When** I access the page, **Then** the canonical URL is properly set to avoid duplicate content

---

### User Story 6 - Global Search (Priority: P3)

As a reader, I want to search for posts by keywords, so that I can quickly find specific content without browsing the entire timeline.

**Why this priority**: Search is a nice-to-have feature that improves UX but is not essential for MVP. Users can browse tags and timeline without search. Can be implemented in a future iteration.

**Independent Test**: Can be fully tested by entering keywords in a search box, submitting the search, and verifying relevant posts are displayed in results. Delivers value through enhanced content discovery.

**Acceptance Scenarios**:

1. **Given** there is a search input on the navbar, **When** I type "typescript" and submit, **Then** I see posts containing "typescript" in title, tags, or content
2. **Given** I search for a term that exists in multiple posts, **When** results display, **Then** they are sorted by relevance or date
3. **Given** I search for a term that doesn't exist, **When** results display, **Then** I see a message "No posts found" with a link back to timeline
4. **Given** search is performed, **When** results load, **Then** matched keywords are highlighted in the result snippets

---

### Edge Cases

- **What happens when a Markdown file is missing required front matter (title, date, tags)?**
  - Build process should validate front matter and fail with clear error message indicating which file and which field is missing

- **How does the system handle invalid Markdown syntax?**
  - Parser should render what it can and log warnings for invalid syntax without crashing the build

- **What happens when two posts have the same slug (filename)?**
  - System should detect duplicate slugs during build and throw an error with clear message

- **How does the system handle broken image links in Markdown?**
  - Images should fail gracefully with a broken image icon and build warnings logged

- **What happens when navigating to a non-existent post URL (e.g., `/posts/fake-post`)?**
  - Next.js should serve a styled 404 page with navigation back to homepage

- **How does the system handle posts with no tags?**
  - Post should render normally with empty/hidden tag section, and not appear in any tag filter pages

- **What happens when building with zero posts in `/content/posts`?**
  - Homepage should display an empty state message like "No posts yet" and build should succeed

- **How does the system handle very long post titles or content?**
  - Titles should truncate with ellipsis on cards; content should render normally with proper scrolling

- **What happens when a post has special characters or emojis in the title?**
  - Title should display correctly; slug should be sanitized to URL-safe format (lowercase, hyphens, no special chars)

- **How does the system handle posts with future dates?**
  - Posts with future dates could be optionally excluded from build (draft mode) or displayed normally depending on configuration

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read all Markdown files from `/content/posts` directory at build time
- **FR-002**: System MUST parse front matter from each Markdown file containing: title (string, required), date (YYYY-MM-DD, required), tags (array of strings, required), excerpt (string, optional)
- **FR-003**: System MUST generate a static homepage at `/` displaying all posts as cards sorted by date descending (newest first)
- **FR-004**: System MUST generate static pages for each post at `/posts/[slug]` where slug is derived from the filename
- **FR-005**: System MUST render Markdown content into HTML with support for: headings (h1-h6), paragraphs, lists (ordered/unordered), links, images, code blocks (fenced with language), inline code, tables, blockquotes
- **FR-006**: System MUST implement syntax highlighting for code blocks in common languages (JavaScript, TypeScript, Python, HTML, CSS, JSON, bash)
- **FR-007**: System MUST generate static tag pages at `/tags/[tag]` for each unique tag across all posts
- **FR-008**: System MUST display post cards on timeline containing: title, publication date, tag badges, excerpt
- **FR-009**: System MUST implement responsive layout with breakpoints for: mobile (< 640px), tablet (640px-1024px), desktop (> 1024px)
- **FR-010**: System MUST use TailwindCSS for styling with mobile-first approach
- **FR-011**: System MUST generate SEO metadata for each page including: title tag, meta description, Open Graph tags (og:title, og:description, og:type, og:url, og:image)
- **FR-012**: System MUST generate `/sitemap.xml` containing all post URLs with lastmod dates
- **FR-013**: System MUST validate front matter schema during build and fail with descriptive error if validation fails
- **FR-014**: System MUST optimize images using Next.js Image component with automatic format conversion, lazy loading, and responsive sizes
- **FR-015**: System MUST provide navigation component (Navbar) with links to: Home, Tags page, About (optional)
- **FR-016**: System MUST provide Footer component with copyright information
- **FR-017**: System MUST handle internal links within Markdown using Next.js Link for client-side navigation
- **FR-018**: System MUST display tag count (number of posts per tag) on tag list views
- **FR-019**: System MUST complete build process in under 2 minutes for up to 100 posts
- **FR-020**: System MUST serve all pages as pre-rendered static HTML with minimal JavaScript for hydration only

### Non-Functional Requirements

- **NFR-001**: First Contentful Paint (FCP) MUST be under 1.5 seconds on 3G connection
- **NFR-002**: Lighthouse Performance score MUST be ≥ 90
- **NFR-003**: Lighthouse Accessibility score MUST be ≥ 90
- **NFR-004**: Lighthouse SEO score MUST be ≥ 90
- **NFR-005**: All interactive elements MUST have minimum tap target size of 44x44px
- **NFR-006**: Color contrast ratio MUST meet WCAG 2.1 Level AA standards (4.5:1 for normal text)
- **NFR-007**: Code MUST be written in TypeScript with strict mode enabled
- **NFR-008**: All React components MUST have TypeScript interfaces for props
- **NFR-009**: Build output MUST be deployable to Vercel or Cloudflare Pages without configuration changes
- **NFR-010**: Total JavaScript bundle size MUST be under 200KB (gzipped) for initial page load

### Key Entities *(include if feature involves data)*

- **Post**: Represents a blog post with attributes:
  - `slug`: string (unique identifier from filename)
  - `title`: string (from front matter)
  - `date`: string (ISO 8601 format, from front matter)
  - `tags`: string[] (from front matter)
  - `excerpt`: string (optional, from front matter or auto-generated)
  - `content`: string (Markdown content)
  - `author`: string (optional, from front matter)

- **Tag**: Represents a content category with attributes:
  - `name`: string (lowercase tag identifier)
  - `displayName`: string (human-readable name)
  - `postCount`: number (count of posts with this tag)
  - `posts`: Post[] (array of posts with this tag)

- **FrontMatter**: YAML metadata at the top of each Markdown file:
  ```yaml
  ---
  title: "Post Title"
  date: "2025-12-03"
  tags: ["nextjs", "typescript"]
  excerpt: "Optional short description"
  author: "Author Name"
  draft: false
  ---
  ```

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Content creators can add a new post by creating a Markdown file and see it on the timeline within 2 minutes of build completion
- **SC-002**: All Markdown elements (headings, lists, links, images, code blocks, tables) render correctly with proper formatting on first build
- **SC-003**: Homepage timeline displays all posts in correct chronological order with accurate metadata (title, date, tags, excerpt)
- **SC-004**: Tag filtering works correctly with each `/tags/[tag]` page showing only posts with that specific tag
- **SC-005**: Website is fully responsive with zero horizontal scrolling on viewports from 320px to 1920px width
- **SC-006**: Lighthouse Performance score achieves ≥ 90 on both homepage and post pages
- **SC-007**: Lighthouse Accessibility score achieves ≥ 90 with proper semantic HTML and ARIA attributes
- **SC-008**: All clickable elements (buttons, links, cards) have tap targets ≥ 44x44px on mobile
- **SC-009**: Build process completes in under 2 minutes for a blog with 50 posts
- **SC-010**: SEO metadata (title, description, OG tags) is correctly generated and visible in page source for each post
- **SC-011**: Sitemap.xml is generated automatically and contains all published post URLs
- **SC-012**: Code blocks display with syntax highlighting for at least 5 common languages (JS, TS, Python, HTML, CSS)
- **SC-013**: Images in posts are automatically optimized (WebP format) and lazy-loaded
- **SC-014**: First Contentful Paint is under 1.5s on 3G network simulation
- **SC-015**: Total JavaScript bundle for initial page load is under 200KB gzipped
- **SC-016**: 404 page is properly styled and displayed for non-existent URLs
- **SC-017**: Build fails gracefully with clear error when required front matter is missing
- **SC-018**: Navigation between pages (home → post → tag → home) works smoothly with client-side routing
- **SC-019**: 90% of test users can successfully navigate from homepage to a post and read it on mobile without issues
- **SC-020**: Website deploys successfully to Vercel or Cloudflare Pages with zero configuration
