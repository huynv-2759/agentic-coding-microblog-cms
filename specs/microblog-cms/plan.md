# Implementation Plan: Microblog CMS

**Branch**: `main` | **Date**: 2025-12-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/microblog-cms/spec.md`

## Summary

Build a static Markdown blog system using Next.js with static site generation (SSG). The system reads Markdown files from the filesystem at build time, parses front matter metadata, and generates pre-rendered HTML pages for optimal performance. Key features include a homepage timeline, individual post pages with full Markdown rendering, tag-based filtering, mobile-first responsive design, and SEO optimization. No database required - all content is stored as Markdown files in `/content/posts/` directory.

**Technical Approach**: 
- Use Next.js `getStaticProps` and `getStaticPaths` for build-time static generation
- Parse Markdown with `gray-matter` (front matter) + `remark`/`rehype` (HTML conversion)
- Style with TailwindCSS utility classes in mobile-first approach
- Optimize with Next.js Image component and code splitting
- Deploy to Vercel for automatic builds on Git push

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode, Node.js 18+  
**Framework**: Next.js 14+ (Pages Router or App Router)  
**Primary Dependencies**: 
- `react` ^18.x & `react-dom` ^18.x - UI library
- `next` ^14.x - Framework for SSG
- `typescript` ^5.x - Type safety
- `tailwindcss` ^3.x - Styling
- `gray-matter` ^4.x - Front matter parsing
- `remark` ^15.x & `remark-html` ^16.x - Markdown to HTML
- `rehype-highlight` ^7.x or `prism-react-renderer` - Syntax highlighting

**Storage**: Filesystem-based (no database)
- Markdown files in `/content/posts/*.md` 
- Images in `/public/assets/`
- All data embedded in source code for static generation

**Testing**: 
- Manual testing during development
- Lighthouse audits for performance/accessibility/SEO
- Build validation (TypeScript + Next.js build)
- Optional: Jest + React Testing Library for unit tests (future)

**Target Platform**: 
- Static HTML/CSS/JS bundle deployable anywhere
- Primary: Vercel (serverless edge network)
- Alternative: Cloudflare Pages, Netlify, GitHub Pages

**Project Type**: Web application (frontend-only, static site)

**Performance Goals**: 
- First Contentful Paint (FCP) < 1.5s on 3G
- Lighthouse Performance score ≥ 90
- Build time < 2 minutes for 100 posts
- Total bundle size < 200KB (gzipped) initial load

**Constraints**: 
- No database or backend API
- No authentication/authorization (static public site)
- No real-time updates (requires rebuild for new content)
- Build-time only data access (no runtime data fetching)
- SEO must work with static HTML (no client-side rendering for content)

**Scale/Scope**: 
- Target: 50-100 blog posts initially
- 5-10 unique tags
- 3-5 React components
- 3-4 page types (home, post, tag, 404)
- Single author blog (no multi-author support initially)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Static-First Generation**: All pages generated at build time with Next.js SSG  
✅ **Markdown as Single Source of Truth**: Content stored as `.md` files in `/content/posts`  
✅ **Mobile-First Responsive Design**: TailwindCSS with mobile-first breakpoints  
✅ **Component-Based Architecture**: Reusable React components (PostCard, TagList, etc.)  
✅ **Simple & Maintainable**: Minimal dependencies, clear structure, no over-engineering  
✅ **Performance**: Static pages ensure fast load times, meets Lighthouse requirements  
✅ **No Database Constraint**: Filesystem-based content management

**Constitution Compliance**: ✅ All core principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/microblog-cms/
├── README.md            # Feature overview and navigation
├── spec.md              # Complete feature specification
├── requirements.md      # Detailed requirements reference
├── plan.md              # This file - technical implementation plan
├── checklists/
│   └── development.md   # Step-by-step development checklist
└── contracts/           # API/Interface contracts (created in Phase 1)
    ├── post.interface.ts      # Post entity interface
    ├── tag.interface.ts       # Tag entity interface
    └── frontmatter.schema.ts  # Front matter validation schema
```

### Source Code (repository root)

```text
microblog-cms/
├── content/                    # Content directory (Markdown files)
│   └── posts/
│       ├── example-post.md
│       ├── nextjs-tutorial.md
│       └── typescript-tips.md
│
├── public/                     # Static assets
│   ├── assets/
│   │   └── images/
│   └── robots.txt
│
├── src/                        # Source code (or root-level for Pages Router)
│   ├── components/             # React components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── post/
│   │   │   ├── PostCard.tsx
│   │   │   └── MarkdownRenderer.tsx
│   │   ├── tag/
│   │   │   └── TagList.tsx
│   │   └── seo/
│   │       └── Meta.tsx
│   │
│   ├── lib/                    # Utility functions
│   │   ├── markdown.ts         # Markdown parsing & rendering
│   │   ├── posts.ts            # Post data fetching & management
│   │   ├── tags.ts             # Tag extraction & filtering
│   │   └── types.ts            # TypeScript interfaces
│   │
│   ├── pages/                  # Next.js pages (Pages Router)
│   │   ├── _app.tsx            # App wrapper
│   │   ├── _document.tsx       # HTML document
│   │   ├── index.tsx           # Homepage timeline
│   │   ├── posts/
│   │   │   └── [slug].tsx      # Dynamic post page
│   │   ├── tags/
│   │   │   ├── index.tsx       # All tags page
│   │   │   └── [tag].tsx       # Tag filter page
│   │   ├── 404.tsx             # Custom 404 page
│   │   └── sitemap.xml.tsx     # Dynamic sitemap
│   │
│   └── styles/                 # Global styles
│       └── globals.css         # Tailwind imports + custom CSS
│
├── tests/ (optional, future)   # Test files
│   ├── lib/
│   │   ├── markdown.test.ts
│   │   └── posts.test.ts
│   └── components/
│       └── PostCard.test.tsx
│
├── .github/                    # GitHub configuration
│   └── workflows/
│       └── deploy.yml          # CI/CD (if not using Vercel auto-deploy)
│
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

**Structure Decision**: Using **Next.js Pages Router** structure with source code in root-level directories (`/components`, `/lib`, `/pages`). This is simpler than App Router for a static blog and aligns with the "Simple & Maintainable" principle. All content lives in `/content/posts` as Markdown files, keeping a clear separation between code and content.

**Alternative Considered**: App Router (`/app` directory) was considered but adds complexity for this use case since we don't need server components or streaming - pure SSG is sufficient.

## Phase 0: Research & Discovery

### 0.1 Next.js Static Generation Patterns

**Research Question**: What is the optimal way to implement SSG with filesystem-based content in Next.js 14+?

**Key Areas**:
- `getStaticProps` vs `getStaticPaths` usage patterns
- Incremental Static Regeneration (ISR) - do we need it for a personal blog?
- Pages Router vs App Router for pure static sites
- Dynamic routes with `[slug].tsx` implementation
- Build performance optimization for 100+ posts

**Acceptance Criteria**:
- [ ] Documented pattern for reading Markdown files at build time
- [ ] Example of `getStaticPaths` returning all post slugs
- [ ] Verified build time scales linearly with post count
- [ ] ISR decision documented (likely not needed for personal blog)

**Output**: `specs/microblog-cms/research/nextjs-ssg.md`

---

### 0.2 Markdown Processing Pipeline

**Research Question**: What is the best combination of libraries for parsing front matter and rendering Markdown with syntax highlighting?

**Key Areas**:
- `gray-matter` for YAML front matter extraction
- `remark` vs `marked` vs `markdown-it` for Markdown parsing
- `rehype-highlight` vs `prism-react-renderer` vs `shiki` for syntax highlighting
- Handling images in Markdown (Next.js Image compatibility)
- Custom remark/rehype plugins for special formatting

**Acceptance Criteria**:
- [ ] Tested parsing pipeline: Markdown → AST → HTML
- [ ] Front matter schema validation implemented
- [ ] Syntax highlighting works for 5+ languages
- [ ] Performance benchmarked (parse time per post)
- [ ] Image optimization strategy defined

**Output**: `specs/microblog-cms/research/markdown-pipeline.md`

---

### 0.3 TailwindCSS Responsive Patterns

**Research Question**: What are the best TailwindCSS patterns for mobile-first responsive design with good typography?

**Key Areas**:
- Mobile-first breakpoint strategy (sm, md, lg, xl)
- Typography plugin (`@tailwindcss/typography`) for Markdown content
- Grid layouts for post cards (responsive columns)
- Navigation patterns (hamburger menu for mobile)
- Dark mode support (optional, future consideration)

**Acceptance Criteria**:
- [ ] Tailwind config with custom theme defined
- [ ] Responsive grid examples for 1/2/3 columns
- [ ] Typography styles for all Markdown elements
- [ ] Mobile navigation component pattern
- [ ] Minimum tap target (44x44px) utility classes

**Output**: `specs/microblog-cms/research/tailwind-patterns.md`

---

### 0.4 SEO & Metadata Best Practices

**Research Question**: How to implement comprehensive SEO for a static Next.js blog?

**Key Areas**:
- Next.js `<Head>` component for meta tags
- Open Graph tags for social sharing
- JSON-LD structured data for blog posts
- Dynamic sitemap generation (`sitemap.xml.tsx`)
- `robots.txt` configuration
- Canonical URLs for posts

**Acceptance Criteria**:
- [ ] Meta component with all required tags
- [ ] Open Graph validator tested
- [ ] JSON-LD schema for Article/BlogPosting
- [ ] Sitemap generation working for all routes
- [ ] Google Search Console integration guide

**Output**: `specs/microblog-cms/research/seo-implementation.md`

---

### 0.5 Deployment Strategy

**Research Question**: What is the optimal deployment workflow for a Next.js static site with Markdown content?

**Key Areas**:
- Vercel automatic deployments from Git
- Build triggers (push to main → rebuild)
- Environment variables (if any needed)
- Custom domain configuration
- Preview deployments for branches
- Build cache optimization

**Acceptance Criteria**:
- [ ] Vercel project connected to GitHub
- [ ] Build command configured: `next build`
- [ ] Output directory: `.next` or `out` (static export)
- [ ] Deployment time tested with sample content
- [ ] Rollback strategy documented

**Output**: `specs/microblog-cms/research/deployment.md`

---

## Phase 1: Design & Contracts

### 1.1 Data Models & Interfaces

**TypeScript Interfaces** (create in `/specs/microblog-cms/contracts/`):

**`post.interface.ts`**:
```typescript
/**
 * Represents a blog post with metadata and content
 */
export interface Post {
  slug: string;           // Unique identifier from filename
  title: string;          // Post title from front matter
  date: string;           // ISO 8601 date string (YYYY-MM-DD)
  tags: string[];         // Array of tag strings
  excerpt: string;        // Short description (auto or manual)
  content: string;        // Raw Markdown content
  author?: string;        // Optional author name
  readingTime?: number;   // Optional estimated reading time (minutes)
}

/**
 * Post metadata without full content (for listings)
 */
export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  author?: string;
  readingTime?: number;
}
```

**`tag.interface.ts`**:
```typescript
/**
 * Represents a tag with associated posts
 */
export interface Tag {
  name: string;           // Lowercase tag identifier
  displayName: string;    // Human-readable tag name
  postCount: number;      // Number of posts with this tag
  posts: PostMetadata[];  // Posts associated with this tag
}

/**
 * Tag summary for listing
 */
export interface TagSummary {
  name: string;
  displayName: string;
  postCount: number;
}
```

**`frontmatter.schema.ts`**:
```typescript
/**
 * Front matter schema for Markdown files
 */
export interface FrontMatter {
  title: string;          // Required
  date: string;           // Required (YYYY-MM-DD format)
  tags: string[];         // Required (can be empty array)
  excerpt?: string;       // Optional
  author?: string;        // Optional
  draft?: boolean;        // Optional (default: false)
}

/**
 * Validates front matter against schema
 * @throws Error if validation fails
 */
export function validateFrontMatter(data: unknown): FrontMatter {
  // Validation logic here
  if (!data || typeof data !== 'object') {
    throw new Error('Front matter must be an object');
  }
  
  const fm = data as Partial<FrontMatter>;
  
  if (!fm.title || typeof fm.title !== 'string') {
    throw new Error('Front matter must have a string "title" field');
  }
  
  if (!fm.date || typeof fm.date !== 'string') {
    throw new Error('Front matter must have a string "date" field');
  }
  
  // Date format validation (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  
  if (!fm.tags || !Array.isArray(fm.tags)) {
    throw new Error('Front matter must have a "tags" array');
  }
  
  return {
    title: fm.title,
    date: fm.date,
    tags: fm.tags,
    excerpt: fm.excerpt,
    author: fm.author,
    draft: fm.draft ?? false,
  };
}
```

---

### 1.2 Core Utility Functions (Contracts)

**`lib/markdown.ts`** - Markdown Processing:
```typescript
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { FrontMatter, validateFrontMatter } from './types';

/**
 * Parses Markdown file content into front matter and content
 * @param fileContent - Raw Markdown file content
 * @returns Validated front matter and Markdown content
 * @throws Error if front matter is invalid
 */
export function parseMarkdown(fileContent: string): {
  frontMatter: FrontMatter;
  content: string;
} {
  const { data, content } = matter(fileContent);
  const frontMatter = validateFrontMatter(data);
  return { frontMatter, content };
}

/**
 * Converts Markdown content to HTML
 * @param markdown - Raw Markdown string
 * @returns HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
```

**`lib/posts.ts`** - Post Management:
```typescript
import fs from 'fs';
import path from 'path';
import { Post, PostMetadata } from './types';
import { parseMarkdown, markdownToHtml } from './markdown';

const postsDirectory = path.join(process.cwd(), 'content/posts');

/**
 * Gets all post slugs from filesystem
 * @returns Array of post slugs (filenames without .md)
 */
export function getAllPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}

/**
 * Gets a single post by slug
 * @param slug - Post slug (filename without .md)
 * @returns Complete post with HTML content
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const { frontMatter, content } = parseMarkdown(fileContent);
  const htmlContent = await markdownToHtml(content);
  
  return {
    slug,
    title: frontMatter.title,
    date: frontMatter.date,
    tags: frontMatter.tags,
    excerpt: frontMatter.excerpt || content.slice(0, 150),
    content: htmlContent,
    author: frontMatter.author,
  };
}

/**
 * Gets all posts metadata sorted by date (newest first)
 * @param includeDrafts - Whether to include draft posts
 * @returns Array of post metadata
 */
export function getAllPostsMetadata(includeDrafts = false): PostMetadata[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map(slug => {
      const fullPath = path.join(postsDirectory, `${slug}.md`);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const { frontMatter, content } = parseMarkdown(fileContent);
      
      if (!includeDrafts && frontMatter.draft) {
        return null;
      }
      
      return {
        slug,
        title: frontMatter.title,
        date: frontMatter.date,
        tags: frontMatter.tags,
        excerpt: frontMatter.excerpt || content.slice(0, 150),
        author: frontMatter.author,
      };
    })
    .filter((post): post is PostMetadata => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
  
  return posts;
}
```

**`lib/tags.ts`** - Tag Management:
```typescript
import { PostMetadata, Tag, TagSummary } from './types';
import { getAllPostsMetadata } from './posts';

/**
 * Gets all unique tags from all posts
 * @returns Array of tag summaries sorted alphabetically
 */
export function getAllTags(): TagSummary[] {
  const posts = getAllPostsMetadata();
  const tagCounts = new Map<string, number>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([name, postCount]) => ({
      name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      postCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gets all posts for a specific tag
 * @param tagName - Tag to filter by
 * @returns Tag object with associated posts
 */
export function getPostsByTag(tagName: string): Tag {
  const allPosts = getAllPostsMetadata();
  const posts = allPosts.filter(post => 
    post.tags.some(tag => tag.toLowerCase() === tagName.toLowerCase())
  );
  
  return {
    name: tagName.toLowerCase(),
    displayName: tagName.charAt(0).toUpperCase() + tagName.slice(1),
    postCount: posts.length,
    posts,
  };
}

/**
 * Gets all tag names for generating static paths
 * @returns Array of lowercase tag names
 */
export function getAllTagNames(): string[] {
  const tags = getAllTags();
  return tags.map(tag => tag.name);
}
```

---

### 1.3 Component Contracts

**Component Props Interfaces**:

```typescript
// components/layout/Navbar.tsx
export interface NavbarProps {
  siteName: string;
  className?: string;
}

// components/layout/Footer.tsx
export interface FooterProps {
  copyrightYear: number;
  author: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}

// components/post/PostCard.tsx
export interface PostCardProps {
  post: PostMetadata;
  className?: string;
}

// components/post/MarkdownRenderer.tsx
export interface MarkdownRendererProps {
  htmlContent: string;
  className?: string;
}

// components/tag/TagList.tsx
export interface TagListProps {
  tags: TagSummary[];
  className?: string;
}

// components/seo/Meta.tsx
export interface MetaProps {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: string[];
}
```

---

### 1.4 Page Data Flow

**Homepage (`pages/index.tsx`)**:
```typescript
export async function getStaticProps() {
  const posts = getAllPostsMetadata();
  return {
    props: {
      posts,
    },
  };
}
```

**Post Page (`pages/posts/[slug].tsx`)**:
```typescript
export async function getStaticPaths() {
  const slugs = getAllPostSlugs();
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);
  return {
    props: {
      post,
    },
  };
}
```

**Tag Page (`pages/tags/[tag].tsx`)**:
```typescript
export async function getStaticPaths() {
  const tagNames = getAllTagNames();
  return {
    paths: tagNames.map(tag => ({ params: { tag } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const tag = getPostsByTag(params.tag);
  return {
    props: {
      tag,
    },
  };
}
```

---

### 1.5 Quickstart Guide

**Output**: `specs/microblog-cms/quickstart.md`

```markdown
# Quickstart Guide: Microblog CMS

## Prerequisites
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)

## Setup (5 minutes)

1. **Clone or create project**:
   ```bash
   npx create-next-app@latest microblog-cms --typescript --tailwind
   cd microblog-cms
   ```

2. **Install dependencies**:
   ```bash
   npm install gray-matter remark remark-html rehype-highlight
   ```

3. **Create folder structure**:
   ```bash
   mkdir -p content/posts
   mkdir -p src/components/{layout,post,tag,seo}
   mkdir -p src/lib
   ```

4. **Create first post**:
   Create `content/posts/hello-world.md`:
   ```markdown
   ---
   title: "Hello World"
   date: "2025-12-03"
   tags: ["introduction"]
   excerpt: "My first blog post"
   ---
   
   # Hello World
   
   This is my first blog post!
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Adding a New Post (2 minutes)

1. Create file in `content/posts/my-new-post.md`
2. Add front matter:
   ```yaml
   ---
   title: "My New Post"
   date: "2025-12-03"
   tags: ["tutorial", "nextjs"]
   excerpt: "Learn how to..."
   ---
   ```
3. Write content in Markdown
4. Save and refresh browser (dev mode)
5. For production: `npm run build` then deploy

## Deployment to Vercel (3 minutes)

1. Push code to GitHub
2. Go to vercel.com and import project
3. Configure:
   - Build Command: `next build`
   - Output Directory: `.next`
4. Deploy!

New posts will auto-deploy on Git push.
```

---

## Phase 2: Implementation Tasks

*Note: Detailed tasks will be created with `/speckit.tasks` command after Phase 1 is complete.*

**High-Level Task Groups**:

1. **Project Setup** (FR-001, NFR-007, NFR-008)
   - Initialize Next.js with TypeScript
   - Configure TailwindCSS
   - Setup folder structure
   - Install dependencies

2. **Core Utilities** (FR-001, FR-002, FR-005, FR-013)
   - Implement markdown parsing (`lib/markdown.ts`)
   - Implement post management (`lib/posts.ts`)
   - Implement tag management (`lib/tags.ts`)
   - Add front matter validation

3. **Layout Components** (FR-015, FR-016, FR-009)
   - Build Navbar with mobile menu
   - Build Footer
   - Implement responsive breakpoints

4. **Content Components** (FR-008, FR-005, FR-006, FR-018)
   - Build PostCard
   - Build MarkdownRenderer with syntax highlighting
   - Build TagList

5. **Pages** (FR-003, FR-004, FR-007, FR-020)
   - Homepage with timeline
   - Dynamic post page
   - Dynamic tag page
   - 404 page

6. **SEO & Metadata** (FR-011, FR-012, NFR-004)
   - Meta component
   - Sitemap generation
   - Open Graph tags
   - JSON-LD structured data

7. **Optimization** (FR-014, NFR-001, NFR-002, NFR-010)
   - Image optimization
   - Bundle size optimization
   - Performance testing

8. **Testing & Deployment** (NFR-002, NFR-003, NFR-009)
   - Lighthouse audits
   - Responsive testing
   - Deploy to Vercel
   - Custom domain setup

---

## Complexity Tracking

> No constitution violations - all principles satisfied with chosen architecture.

**Justified Complexity** (none required):

The architecture is intentionally simple:
- No database → filesystem only
- No backend API → static generation
- No authentication → public blog
- Minimal dependencies → only essential libraries
- Clear separation → content vs code vs components

**Alternatives Considered & Rejected**:

| Alternative | Why Rejected |
|-------------|-------------|
| **CMS (Contentful, Strapi)** | Unnecessary complexity; Markdown files are simpler and more portable |
| **Database (Supabase, PostgreSQL)** | Over-engineering for a static blog; filesystem is sufficient |
| **GraphQL** | Overkill for simple data fetching; direct file reads are faster at build time |
| **Monorepo** | Unnecessary for single frontend project; adds tooling complexity |
| **App Router** | Pages Router is simpler and sufficient for static generation use case |

---

## Risk Assessment

### Technical Risks

**Risk 1: Build Time Scaling**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: 
  - Test build with 100 sample posts early
  - Implement Incremental Static Regeneration (ISR) if needed
  - Consider build caching strategies
  - Monitor Vercel build times

**Risk 2: Markdown Parsing Edge Cases**
- **Probability**: Medium
- **Impact**: Low
- **Mitigation**:
  - Comprehensive testing with various Markdown formats
  - Fallback rendering for unsupported syntax
  - Clear error messages for invalid Markdown

**Risk 3: Image Optimization Performance**
- **Probability**: Low
- **Impact**: Medium
- **Mitigation**:
  - Use Next.js Image component consistently
  - Compress images before committing
  - Lazy load images below fold
  - Set size limits in documentation

### Process Risks

**Risk 4: Scope Creep (Adding Database/Auth)**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**:
  - Strict adherence to constitution (static-first)
  - Regular reviews against spec
  - Clear "out of scope" documentation
  - Defer features to Phase 2

**Risk 5: Performance Regression**
- **Probability**: Low
- **Impact**: High
- **Mitigation**:
  - Lighthouse audits in development
  - Bundle size monitoring
  - Performance budget in CI/CD (future)
  - Regular testing on 3G simulation

---

## Success Criteria Mapping

| Success Criteria | Implementation Phase | Validation Method |
|------------------|---------------------|-------------------|
| SC-001: Add post in < 2 min | Phase 2: Project Setup | Manual test: time post creation |
| SC-002: Markdown renders correctly | Phase 2: Content Components | Visual inspection + automated tests |
| SC-003: Timeline sorted by date | Phase 2: Pages | Unit test + manual verification |
| SC-004: Tag filtering works | Phase 2: Pages | Manual test all tag pages |
| SC-005: Responsive (no h-scroll) | Phase 2: Layout Components | DevTools responsive testing |
| SC-006: Lighthouse Performance ≥ 90 | Phase 2: Optimization | Lighthouse CI/manual audit |
| SC-007: Lighthouse Accessibility ≥ 90 | Phase 2: Optimization | Lighthouse audit + axe DevTools |
| SC-008: Tap targets ≥ 44px | Phase 2: Layout Components | Manual measurement in DevTools |
| SC-009: Build time < 2 min | Phase 2: Testing | Build timer |
| SC-010: SEO metadata present | Phase 2: SEO & Metadata | View page source + validators |
| SC-011: Sitemap.xml generated | Phase 2: SEO & Metadata | Visit /sitemap.xml |
| SC-012: Syntax highlighting works | Phase 2: Content Components | Visual test with code samples |
| SC-013: Images optimized | Phase 2: Optimization | Network tab inspection |
| SC-014: FCP < 1.5s | Phase 2: Optimization | Lighthouse + WebPageTest |
| SC-015: Bundle < 200KB gzipped | Phase 2: Optimization | Build output analysis |
| SC-016: 404 page styled | Phase 2: Pages | Visit non-existent URL |
| SC-017: Build fails on invalid FM | Phase 2: Core Utilities | Try invalid front matter |
| SC-018: Client-side routing works | Phase 2: Pages | Click through navigation |
| SC-019: 90% users navigate successfully | Post-launch | User testing sessions |
| SC-020: Deploys to Vercel/CF | Phase 2: Deployment | Actual deployment |

---

## Next Steps

1. **Complete Phase 0 Research** (1-2 days)
   - Create research documents for each area
   - Test library combinations
   - Validate technical decisions

2. **Review Phase 1 Contracts** (0.5 day)
   - Team review of interfaces
   - Validate against requirements
   - Finalize data models

3. **Generate Implementation Tasks** (use `/speckit.tasks` command)
   - Break down into granular tasks
   - Assign priorities and estimates
   - Create sprint plan

4. **Begin Development** (1-2 weeks)
   - Follow checklist in `checklists/development.md`
   - Complete phases sequentially
   - Regular check-ins against success criteria

---

**Document Version**: 1.0.0  
**Status**: Ready for Phase 0 Research  
**Last Updated**: 2025-12-03  
**Next Review**: After Phase 0 completion
