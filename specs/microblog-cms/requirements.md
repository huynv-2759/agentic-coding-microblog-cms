# Requirements: Microblog CMS

## Overview
This document contains the detailed requirements for the Microblog CMS feature, extracted from the specification for quick reference during implementation.

## Functional Requirements

### Core Content Management
- **FR-001**: System MUST read all Markdown files from `/content/posts` directory at build time
- **FR-002**: System MUST parse front matter from each Markdown file containing:
  - `title`: string (required)
  - `date`: YYYY-MM-DD format (required)
  - `tags`: array of strings (required)
  - `excerpt`: string (optional)
  - `author`: string (optional)
  - `draft`: boolean (optional)
- **FR-013**: System MUST validate front matter schema during build and fail with descriptive error if validation fails

### Page Generation
- **FR-003**: System MUST generate a static homepage at `/` displaying all posts as cards sorted by date descending (newest first)
- **FR-004**: System MUST generate static pages for each post at `/posts/[slug]` where slug is derived from the filename
- **FR-007**: System MUST generate static tag pages at `/tags/[tag]` for each unique tag across all posts
- **FR-019**: System MUST complete build process in under 2 minutes for up to 100 posts
- **FR-020**: System MUST serve all pages as pre-rendered static HTML with minimal JavaScript for hydration only

### Markdown Rendering
- **FR-005**: System MUST render Markdown content into HTML with support for:
  - Headings (h1-h6)
  - Paragraphs
  - Lists (ordered/unordered)
  - Links (internal and external)
  - Images with alt text
  - Code blocks (fenced with language specification)
  - Inline code
  - Tables
  - Blockquotes
- **FR-006**: System MUST implement syntax highlighting for code blocks in common languages:
  - JavaScript
  - TypeScript
  - Python
  - HTML
  - CSS
  - JSON
  - bash/shell

### UI Components
- **FR-008**: System MUST display post cards on timeline containing:
  - Title
  - Publication date
  - Tag badges (clickable)
  - Excerpt (first 150 chars or custom from front matter)
- **FR-015**: System MUST provide navigation component (Navbar) with links to:
  - Home
  - Tags page
  - About (optional)
- **FR-016**: System MUST provide Footer component with copyright information
- **FR-018**: System MUST display tag count (number of posts per tag) on tag list views

### Responsive Design
- **FR-009**: System MUST implement responsive layout with breakpoints for:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **FR-010**: System MUST use TailwindCSS for styling with mobile-first approach

### SEO & Optimization
- **FR-011**: System MUST generate SEO metadata for each page including:
  - `<title>` tag
  - `<meta name="description">`
  - Open Graph tags: og:title, og:description, og:type, og:url, og:image
- **FR-012**: System MUST generate `/sitemap.xml` containing all post URLs with lastmod dates
- **FR-014**: System MUST optimize images using Next.js Image component with:
  - Automatic format conversion (WebP)
  - Lazy loading
  - Responsive sizes

### Navigation
- **FR-017**: System MUST handle internal links within Markdown using Next.js Link for client-side navigation

## Non-Functional Requirements

### Performance
- **NFR-001**: First Contentful Paint (FCP) MUST be under 1.5 seconds on 3G connection
- **NFR-002**: Lighthouse Performance score MUST be ≥ 90
- **NFR-010**: Total JavaScript bundle size MUST be under 200KB (gzipped) for initial page load

### Accessibility
- **NFR-003**: Lighthouse Accessibility score MUST be ≥ 90
- **NFR-005**: All interactive elements MUST have minimum tap target size of 44x44px
- **NFR-006**: Color contrast ratio MUST meet WCAG 2.1 Level AA standards (4.5:1 for normal text)

### SEO
- **NFR-004**: Lighthouse SEO score MUST be ≥ 90

### Code Quality
- **NFR-007**: Code MUST be written in TypeScript with strict mode enabled
- **NFR-008**: All React components MUST have TypeScript interfaces for props

### Deployment
- **NFR-009**: Build output MUST be deployable to Vercel or Cloudflare Pages without configuration changes

## Technical Stack Requirements

### Mandatory Technologies
- **Framework**: Next.js (latest stable version)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Markdown Parser**: gray-matter + remark/rehype
- **Syntax Highlighting**: Prism.js or Shiki

### Project Structure
```
/content
  /posts
    *.md
/components
  Navbar.tsx
  Footer.tsx
  PostCard.tsx
  TagList.tsx
  MarkdownRenderer.tsx
/pages
  index.tsx
  /posts
    [slug].tsx
  /tags
    [tag].tsx
/lib
  markdown.ts
  posts.ts
  tags.ts
/public
  /assets
```

## Priority Levels

### P1 - Critical (MVP)
- Content creator can publish posts
- Reader can browse timeline and read posts
- Mobile-first responsive design

### P2 - Important (Enhanced)
- Tag filtering system
- SEO and social sharing optimization
- Mobile navigation enhancements

### P3 - Nice-to-Have (Future)
- Global search functionality
- Advanced features (comments, analytics, etc.)

## Dependencies

### External Libraries (Minimum Required)
- `next` - Framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `gray-matter` - Front matter parsing
- `remark` & `remark-html` - Markdown processing
- `rehype-highlight` or `prism-react-renderer` - Syntax highlighting

### Optional Dependencies
- `date-fns` - Date formatting
- `reading-time` - Calculate reading time
- `sharp` - Image optimization (Next.js handles this)

## Validation Rules

### Front Matter Validation
```typescript
interface FrontMatter {
  title: string;        // Required, non-empty
  date: string;         // Required, YYYY-MM-DD format
  tags: string[];       // Required, can be empty array
  excerpt?: string;     // Optional
  author?: string;      // Optional
  draft?: boolean;      // Optional, default false
}
```

### Slug Generation Rules
- Derived from filename (remove `.md` extension)
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters except hyphens
- Must be unique across all posts

## Error Handling

### Build-Time Errors
- Missing required front matter → Fail build with file path and missing field
- Invalid front matter format → Fail build with parsing error details
- Duplicate slugs → Fail build with conflicting file names
- Invalid Markdown syntax → Log warning, continue build

### Runtime Errors (Static Site)
- Non-existent post URL → Serve 404 page
- Broken image links → Show broken image placeholder
- Missing assets → Log error in browser console

## Testing Requirements

### Manual Testing Checklist
- [ ] Create new post → appears on timeline
- [ ] Post renders all Markdown elements correctly
- [ ] Tag filtering works on all tag pages
- [ ] Responsive on mobile (320px-640px)
- [ ] Responsive on tablet (640px-1024px)
- [ ] Responsive on desktop (1024px+)
- [ ] Navigation works (home ↔ post ↔ tag)
- [ ] SEO meta tags present in page source
- [ ] Sitemap.xml generated and accessible
- [ ] Lighthouse scores ≥ 90 (Performance, Accessibility, SEO)
- [ ] Build completes in < 2 minutes

### Automated Testing (Future)
- Unit tests for utility functions (markdown parsing, slug generation)
- Integration tests for page generation
- E2E tests for critical user flows
- Visual regression tests for responsive design

## Constraints & Limitations

### Content Constraints
- Maximum 100 posts for optimal build time
- Image files should be < 2MB each
- Post content should be < 50,000 characters

### Technical Constraints
- No database required (filesystem-based)
- No server-side runtime (static only)
- No authentication system
- No real-time updates (requires rebuild)

### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## Future Enhancements (Out of Scope)

### Phase 2 Considerations
- Full-text search with client-side index
- RSS feed generation
- Dark mode toggle
- Reading progress indicator
- Related posts suggestions
- Table of contents for long posts
- Social sharing buttons
- View count/analytics
- Comment system (via Supabase or similar)
- Newsletter subscription
- Admin UI for content management

### Integration Possibilities
- Supabase for comments/reactions
- Google Analytics / Plausible for analytics
- Algolia for advanced search
- Cloudinary for image CDN
- GitHub Actions for automated deployment
