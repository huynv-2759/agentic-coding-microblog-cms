# Development Checklist: Microblog CMS

## Phase 1: Project Setup ✓

### Initial Setup
- [ ] Initialize Next.js project with TypeScript
  ```bash
  npx create-next-app@latest microblog-cms --typescript --tailwind --app
  ```
- [ ] Configure TypeScript (`tsconfig.json`) with strict mode
- [ ] Setup TailwindCSS configuration
- [ ] Create project directory structure
  - [ ] `/content/posts/`
  - [ ] `/components/`
  - [ ] `/lib/`
  - [ ] `/public/assets/`
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Setup package.json scripts

### Dependencies Installation
- [ ] Install core dependencies:
  ```bash
  npm install gray-matter remark remark-html rehype-highlight
  ```
- [ ] Install dev dependencies:
  ```bash
  npm install -D @types/node
  ```
- [ ] Verify all dependencies are installed

### Configuration Files
- [ ] Create/update `next.config.js`
- [ ] Create `tailwind.config.js` with custom theme
- [ ] Create `postcss.config.js`
- [ ] Setup environment variables (if needed)

---

## Phase 2: Core Utilities (Priority P1)

### Markdown Parsing (`/lib/markdown.ts`)
- [ ] Create function to parse front matter with gray-matter
- [ ] Create function to convert Markdown to HTML with remark
- [ ] Add syntax highlighting with rehype-highlight
- [ ] Create TypeScript interface for FrontMatter
- [ ] Add front matter validation logic
- [ ] Test with sample Markdown files

### Posts Management (`/lib/posts.ts`)
- [ ] Create function to get all post filenames from `/content/posts`
- [ ] Create function to read and parse a single post
- [ ] Create function to get all posts metadata
- [ ] Create function to filter out draft posts
- [ ] Create function to sort posts by date (descending)
- [ ] Create function to get post by slug
- [ ] Create function to generate post slug from filename
- [ ] Test all utility functions

### Tags Management (`/lib/tags.ts`)
- [ ] Create function to extract all unique tags from posts
- [ ] Create function to get posts by specific tag
- [ ] Create function to count posts per tag
- [ ] Create function to get all tags with post counts
- [ ] Test tag filtering logic

---

## Phase 3: UI Components (Priority P1)

### Layout Components

#### Navbar (`/components/Navbar.tsx`)
- [ ] Create Navbar component with TypeScript interface
- [ ] Add logo/site title
- [ ] Add navigation links (Home, Tags)
- [ ] Implement mobile hamburger menu
- [ ] Add responsive breakpoints
- [ ] Style with TailwindCSS
- [ ] Test on mobile, tablet, desktop

#### Footer (`/components/Footer.tsx`)
- [ ] Create Footer component
- [ ] Add copyright information
- [ ] Add optional social links
- [ ] Style with TailwindCSS
- [ ] Make responsive

### Content Components

#### PostCard (`/components/PostCard.tsx`)
- [ ] Create PostCard component with Props interface
- [ ] Display post title
- [ ] Display publication date (formatted)
- [ ] Display tag badges
- [ ] Display excerpt
- [ ] Make entire card clickable with Next.js Link
- [ ] Add hover effects
- [ ] Ensure 44x44px tap targets on mobile
- [ ] Style with TailwindCSS
- [ ] Test responsiveness

#### TagList (`/components/TagList.tsx`)
- [ ] Create TagList component
- [ ] Display all tags as badges/pills
- [ ] Show post count for each tag
- [ ] Make tags clickable (link to `/tags/[tag]`)
- [ ] Style with TailwindCSS
- [ ] Add hover effects

#### MarkdownRenderer (`/components/MarkdownRenderer.tsx`)
- [ ] Create MarkdownRenderer component
- [ ] Accept HTML content as prop
- [ ] Apply typography styles for all Markdown elements:
  - [ ] Headings (h1-h6)
  - [ ] Paragraphs
  - [ ] Lists (ul, ol)
  - [ ] Links
  - [ ] Images
  - [ ] Code blocks
  - [ ] Inline code
  - [ ] Tables
  - [ ] Blockquotes
- [ ] Ensure responsive images
- [ ] Test with various Markdown content

---

## Phase 4: Pages (Priority P1)

### Homepage (`/pages/index.tsx` or `/app/page.tsx`)
- [ ] Create homepage component
- [ ] Use `getStaticProps` to fetch all posts
- [ ] Sort posts by date (newest first)
- [ ] Render PostCard for each post
- [ ] Add page title and meta description
- [ ] Implement responsive grid layout:
  - [ ] 1 column on mobile
  - [ ] 2 columns on tablet
  - [ ] 3 columns on desktop
- [ ] Test with 0 posts (empty state)
- [ ] Test with multiple posts

### Post Page (`/pages/posts/[slug].tsx`)
- [ ] Create dynamic post page component
- [ ] Implement `getStaticPaths` to generate all post routes
- [ ] Implement `getStaticProps` to fetch post data
- [ ] Render post title as h1
- [ ] Render publication date
- [ ] Render tag badges
- [ ] Render Markdown content with MarkdownRenderer
- [ ] Add SEO meta tags (title, description, OG tags)
- [ ] Add "Back to Home" link or breadcrumbs
- [ ] Test with various posts
- [ ] Test 404 for non-existent slugs

---

## Phase 5: Tag System (Priority P2)

### Tag Page (`/pages/tags/[tag].tsx`)
- [ ] Create dynamic tag page component
- [ ] Implement `getStaticPaths` for all tags
- [ ] Implement `getStaticProps` to fetch posts by tag
- [ ] Display tag name as heading
- [ ] Display post count for the tag
- [ ] Render PostCard for each filtered post
- [ ] Add SEO meta tags
- [ ] Test with various tags

### Tags Index Page (Optional)
- [ ] Create `/pages/tags/index.tsx`
- [ ] Display all tags with TagList component
- [ ] Add page title "Browse by Tags"
- [ ] Add SEO meta tags

---

## Phase 6: SEO & Metadata (Priority P2)

### Meta Tags Component
- [ ] Create reusable SEO component (`/components/SEO.tsx`)
- [ ] Accept props: title, description, ogImage, url
- [ ] Generate `<title>` tag
- [ ] Generate meta description
- [ ] Generate Open Graph tags
- [ ] Generate Twitter Card tags
- [ ] Generate canonical URL

### Sitemap Generation
- [ ] Create `pages/sitemap.xml.tsx` with `getServerSideProps`
- [ ] Generate XML with all post URLs
- [ ] Include homepage and tag pages
- [ ] Add lastmod dates
- [ ] Test sitemap accessibility at `/sitemap.xml`

### Robots.txt
- [ ] Create `public/robots.txt`
- [ ] Allow all crawlers
- [ ] Reference sitemap URL

---

## Phase 7: Styling & Responsiveness (Priority P1)

### Global Styles
- [ ] Configure TailwindCSS theme (colors, fonts, spacing)
- [ ] Add custom CSS for typography
- [ ] Ensure consistent spacing and margins
- [ ] Add focus styles for accessibility

### Responsive Design Testing
- [ ] Test on mobile (320px - 640px):
  - [ ] Homepage timeline
  - [ ] Post page
  - [ ] Tag pages
  - [ ] Navigation
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Verify no horizontal scrolling on any viewport
- [ ] Test touch interactions on real mobile device

### Accessibility
- [ ] Ensure all images have alt text
- [ ] Use semantic HTML (nav, main, article, aside)
- [ ] Add ARIA labels where needed
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios (4.5:1 minimum)
- [ ] Run Lighthouse accessibility audit

---

## Phase 8: Performance Optimization (Priority P2)

### Image Optimization
- [ ] Replace `<img>` with Next.js `<Image>` component
- [ ] Configure image sizes and formats
- [ ] Enable lazy loading
- [ ] Test image loading on slow connections

### Bundle Optimization
- [ ] Analyze bundle size with `next build`
- [ ] Enable code splitting
- [ ] Remove unused dependencies
- [ ] Minimize CSS and JavaScript
- [ ] Test bundle size < 200KB gzipped

### Performance Testing
- [ ] Run Lighthouse performance audit
- [ ] Ensure FCP < 1.5s on 3G
- [ ] Ensure Performance score ≥ 90
- [ ] Test on slow network (Chrome DevTools throttling)

---

## Phase 9: Content Creation & Testing

### Sample Content
- [ ] Create 5-10 sample blog posts in `/content/posts/`
- [ ] Include various Markdown elements in posts:
  - [ ] Headings
  - [ ] Lists
  - [ ] Links
  - [ ] Images
  - [ ] Code blocks (multiple languages)
  - [ ] Tables
  - [ ] Blockquotes
- [ ] Use different tags for posts
- [ ] Test with posts of varying lengths

### Build Testing
- [ ] Run `npm run build` successfully
- [ ] Verify build time < 2 minutes
- [ ] Check for build warnings/errors
- [ ] Verify all pages are generated
- [ ] Test locally with `npm run start`

---

## Phase 10: Error Handling & Edge Cases

### Front Matter Validation
- [ ] Test with missing title → should fail build
- [ ] Test with missing date → should fail build
- [ ] Test with invalid date format → should fail build
- [ ] Test with missing tags → should fail build
- [ ] Verify clear error messages

### Edge Case Testing
- [ ] Test with 0 posts (empty homepage)
- [ ] Test with post with no tags
- [ ] Test with very long post title
- [ ] Test with special characters in title
- [ ] Test with broken image links
- [ ] Test with duplicate slugs → should fail build
- [ ] Test 404 page for non-existent posts
- [ ] Test with draft posts (should be excluded)

---

## Phase 11: Deployment (Priority P1)

### Pre-Deployment
- [ ] Run final build locally
- [ ] Test production build with `npm run start`
- [ ] Check all environment variables
- [ ] Verify `.gitignore` is correct
- [ ] Run all manual tests

### Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings
- [ ] Set environment variables (if any)
- [ ] Deploy to production
- [ ] Test live site on multiple devices
- [ ] Verify custom domain (if applicable)

### Post-Deployment
- [ ] Test live site functionality
- [ ] Run Lighthouse on live site
- [ ] Check sitemap.xml accessibility
- [ ] Test social sharing previews
- [ ] Monitor build times on Vercel

---

## Phase 12: Documentation

### README.md
- [ ] Add project description
- [ ] Add installation instructions
- [ ] Add usage guide (how to add new posts)
- [ ] Document folder structure
- [ ] Add development commands
- [ ] Add deployment instructions
- [ ] Include license information

### Content Guidelines
- [ ] Document front matter schema
- [ ] Provide sample post template
- [ ] Document supported Markdown syntax
- [ ] Add guidelines for images and assets

---

## Phase 13: Optional Features (Priority P3)

### Global Search
- [ ] Implement client-side search index
- [ ] Create search UI component
- [ ] Add search results page
- [ ] Test search functionality

### Additional Enhancements
- [ ] Add reading time calculation
- [ ] Add "Related Posts" section
- [ ] Add table of contents for long posts
- [ ] Add dark mode toggle
- [ ] Add RSS feed generation
- [ ] Add social sharing buttons

---

## Quality Gates

### Before Moving to Next Phase
- [ ] All items in current phase checked
- [ ] Manual testing completed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code committed to Git

### Before Deployment
- [ ] All P1 features completed
- [ ] Lighthouse scores ≥ 90 (Performance, Accessibility, SEO)
- [ ] Build time < 2 minutes
- [ ] Responsive on all devices
- [ ] All manual tests passed
- [ ] Documentation updated

---

## Success Metrics

After completion, verify:
- [ ] New posts appear on timeline after rebuild
- [ ] All Markdown elements render correctly
- [ ] Tag filtering works perfectly
- [ ] Mobile experience is excellent
- [ ] Lighthouse scores meet requirements
- [ ] Build and deployment are smooth
- [ ] Content creators can easily add posts

---

**Last Updated**: 2025-12-03  
**Status**: Ready for Development
