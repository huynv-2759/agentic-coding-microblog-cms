# Microblog CMS Constitution
<!-- Static Markdown Blog with Next.js -->

## Core Principles

### I. Static-First Generation (NON-NEGOTIABLE)
- All blog content is generated at build time using Next.js Static Site Generation (SSG)
- Each Markdown file in `/content/posts` becomes a static route via Next.js file system routing
- No runtime database queries required for content delivery
- Pre-rendered pages ensure maximum performance and SEO benefits
- Dynamic routes: `/` (homepage timeline), `/posts/[slug]` (individual post), `/tags/[tag]` (tag pages)

### II. Markdown as Single Source of Truth
- All blog posts stored as Markdown files in `/content/posts` directory
- Front matter (YAML) contains metadata: title, date, tags, excerpt, author
- Markdown format ensures portability, version control, and ease of editing
- Adding new posts is as simple as creating a new `.md` file and rebuilding
- No WYSIWYG editor or complex CMS UI - simplicity is key
- Markdown parser must support: code syntax highlighting, tables, lists, links, images

### III. Mobile-First Responsive Design
- TailwindCSS utility-first approach for responsive layouts
- Breakpoints: Mobile (<640px), Tablet (640px-1024px), Desktop (>1024px)
- All components must be designed mobile-first, then enhanced for larger screens
- Touch-friendly interactions: minimum tap targets 44x44px
- Typography scales appropriately across devices
- Images are responsive and lazy-loaded

### IV. Component-Based Architecture
- Reusable UI components: `PostCard`, `TagList`, `Navbar`, `Footer`, `MarkdownRenderer`
- Clear separation of concerns: layout components, feature components, UI primitives
- TypeScript for type safety and better developer experience
- Props interfaces defined for all components
- Each component is self-contained and independently testable
- Follow React best practices: composition over inheritance

### V. Simple & Maintainable
- Minimal dependencies - only essential packages
- No unnecessary abstractions or over-engineering
- Clear folder structure: `/content`, `/components`, `/pages`, `/lib`, `/styles`
- Code readability prioritized over cleverness
- Documentation in code when complexity is unavoidable
- YAGNI principle: features are added only when needed

## Technical Requirements & Constraints

### Technology Stack (MANDATORY)
- **Framework**: Next.js (latest stable) with App Router or Pages Router
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS for utility-first CSS
- **Markdown Parser**: `gray-matter` for front matter, `remark` or `unified` ecosystem for parsing
- **Deployment**: Vercel or Cloudflare Pages
- **Version Control**: Git with semantic commits

### Content Structure
```
/content
  /posts
    - my-first-post.md
    - second-post.md
```

**Front Matter Schema**:
```yaml
---
title: "Post Title"
date: "2025-12-03"
tags: ["nextjs", "typescript"]
excerpt: "Brief description"
author: "Author Name"
---
```

### Core Features (In Scope)
1. **Homepage Timeline**: List all posts sorted by date (newest first)
2. **Post Page** (`/posts/[slug]`): Render individual Markdown post with proper styling
3. **Tag System**: Filter/group posts by tags, tag pages at `/tags/[tag]`
4. **Basic SEO**: Meta tags, Open Graph, structured data (JSON-LD), sitemap.xml
5. **Responsive Design**: Mobile-first, tested on real devices

### Non-Scope (Explicitly Excluded)
- ❌ WYSIWYG editor or admin UI (may add later)
- ❌ Complex authentication system
- ❌ Real-time database or backend API (unless Supabase for comments moderation)
- ❌ User registration/login
- ❌ Search functionality (may add later)
- ❌ Analytics dashboard (use external tools)

### Performance Constraints
- Build time must be under 2 minutes for ~100 posts
- First Contentful Paint (FCP) < 1.5s
- Lighthouse score ≥90 for Performance, Accessibility, SEO, Best Practices
- Bundle size optimized with code splitting and tree shaking
- Images optimized with Next.js Image component (WebP, lazy loading)

### Deployment Requirements
- **Platform**: Vercel (preferred) or Cloudflare Pages
- **Build Command**: `npm run build` or `next build`
- **Output**: Static HTML files + client-side JavaScript
- **Environment**: Production builds must have zero errors
- **Domain**: Custom domain configuration supported

## Development Workflow

### Adding New Posts
1. Create new `.md` file in `/content/posts` with proper front matter
2. Write content using Markdown syntax
3. Preview locally: `npm run dev` and visit `http://localhost:3000`
4. Test responsive layout on mobile viewport
5. Commit to Git: `git commit -m "feat: add new post about [topic]"`
6. Push to main branch → Automatic deployment via Vercel/Cloudflare

### Code Changes
1. Create feature branch from `main`
2. Implement changes with TypeScript type safety
3. Test locally across multiple viewports (mobile, tablet, desktop)
4. Ensure build succeeds: `npm run build`
5. Run linting: `npm run lint`
6. Create pull request with clear description
7. Merge after review (if multi-person) or direct push (if solo)

### Quality Gates
- ✅ TypeScript compilation with no errors
- ✅ Build process completes successfully
- ✅ All pages render correctly on mobile and desktop
- ✅ Links are not broken (internal and external)
- ✅ Images have proper alt text and are optimized
- ✅ Lighthouse audit passes with ≥90 scores
- ✅ Console has no critical errors

### Component Development Guidelines
- Use functional components with TypeScript
- Define Props interfaces explicitly
- Keep components small and focused (Single Responsibility Principle)
- Use TailwindCSS classes for styling (avoid inline styles)
- Implement proper accessibility (ARIA labels, semantic HTML)
- Test component rendering across breakpoints

## Architecture Philosophy

### File System Routing
Next.js generates routes from file structure:
```
/pages
  /index.tsx          → Homepage timeline
  /posts
    /[slug].tsx       → Individual post page
  /tags
    /[tag].tsx        → Tag filter page
```

### Data Flow
1. **Build Time**: Next.js reads Markdown files from `/content/posts`
2. **Parser**: `gray-matter` extracts front matter, `remark` converts Markdown to HTML
3. **Generation**: `getStaticProps` provides data to page components
4. **Output**: Pre-rendered HTML with hydrated React components

### Component Hierarchy
```
App
├── Navbar
├── Page (Home/Post/Tag)
│   ├── PostCard (list view)
│   ├── MarkdownRenderer (post view)
│   └── TagList
└── Footer
```

## Success Criteria

### User Experience
- ✅ Blog posts load instantly (pre-rendered)
- ✅ Markdown content renders beautifully with proper typography
- ✅ Reading experience is pleasant on mobile phones
- ✅ Navigation is intuitive (home, tags, individual posts)
- ✅ Code blocks have syntax highlighting

### Developer Experience
- ✅ Adding a new post takes < 5 minutes (create file + commit)
- ✅ Local development has hot reload
- ✅ Build process is straightforward and documented
- ✅ Code is easy to understand and modify
- ✅ TypeScript provides helpful autocomplete and error checking

### Technical Excellence
- ✅ Fast build times (< 2 min for typical blog size)
- ✅ Excellent performance scores (Lighthouse ≥90)
- ✅ SEO optimized (meta tags, sitemap, structured data)
- ✅ Mobile responsive with no layout shifts
- ✅ Accessible (WCAG 2.1 Level AA basics)

## Governance

This constitution defines the foundational principles for Microblog CMS. All development decisions must align with these principles. When trade-offs are necessary, prioritize in this order:

1. **Simplicity & Maintainability** - Keep it simple, avoid over-engineering
2. **Performance** - Static generation ensures speed
3. **User Experience** - Mobile-first, readable, accessible
4. **Developer Experience** - Easy to add content and modify code

**Amendment Process**: Changes to this constitution require clear documentation of rationale and impact analysis. Non-breaking enhancements (e.g., adding optional Supabase comments) do not require constitutional amendment.

**Exceptions**: Optional features like Supabase for comment moderation can be added without violating core principles, as long as they remain optional and don't compromise static-first generation.

**Version**: 1.0.0 | **Ratified**: 2025-12-03 | **Last Amended**: 2025-12-03
