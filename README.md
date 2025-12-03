# Microblog CMS

A modern, fast, and beautiful static blog system built with Next.js, TypeScript, and TailwindCSS.

## Features

- 📝 **Markdown-based** - Write posts in simple Markdown format
- ⚡ **Lightning fast** - Static site generation for optimal performance
- 🎨 **Beautiful design** - Clean, responsive interface that works on all devices
- 🏷️ **Tag system** - Organize content with tags
- 🔍 **SEO optimized** - Built-in SEO features for better discoverability
- 📱 **Mobile-first** - Fully responsive design
- 🎯 **TypeScript** - Full type safety
- 🎨 **TailwindCSS** - Beautiful utility-first styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd microblog-cms
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Creating a New Post

1. Create a new `.md` file in the `content/posts/` directory
2. Add front matter at the top:

```markdown
---
title: "Your Post Title"
date: "2025-12-03"
tags: ["tag1", "tag2"]
excerpt: "A short description of your post"
author: "Your Name"
---

# Your Content Here

Write your post content using Markdown...
```

3. The post will automatically appear on your blog!

## Front Matter Fields

- **title** (required): Post title
- **date** (required): Publication date in YYYY-MM-DD format
- **tags** (required): Array of tags
- **excerpt** (optional): Short description (auto-generated if not provided)
- **author** (optional): Author name
- **draft** (optional): Set to `true` to hide from production

## Project Structure

```
microblog-cms/
├── content/posts/          # Your blog posts (.md files)
├── public/                 # Static assets
│   └── assets/images/      # Images
├── src/
│   ├── components/         # React components
│   │   ├── layout/         # Layout components (Navbar, Footer, Layout)
│   │   ├── post/           # Post components (PostCard, MarkdownRenderer)
│   │   ├── tag/            # Tag components (TagList)
│   │   └── seo/            # SEO components (Meta)
│   ├── lib/                # Utility functions
│   │   ├── markdown.ts     # Markdown processing
│   │   ├── posts.ts        # Post management
│   │   ├── tags.ts         # Tag management
│   │   └── types.ts        # TypeScript types
│   ├── pages/              # Next.js pages
│   │   ├── posts/[slug].tsx    # Dynamic post page
│   │   ├── tags/[tag].tsx      # Dynamic tag page
│   │   ├── tags/index.tsx      # All tags page
│   │   ├── index.tsx           # Homepage
│   │   ├── 404.tsx             # Custom 404 page
│   │   ├── _app.tsx            # App wrapper
│   │   └── _document.tsx       # HTML document
│   └── styles/
│       └── globals.css     # Global styles
├── specs/                  # Project specifications
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # TailwindCSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Deploy!

Your blog will automatically rebuild and deploy when you push changes.

### Deploy to Other Platforms

The blog works with any static hosting platform:
- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

## Customization

### Change Site Name

Edit the site name in:
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/seo/Meta.tsx`

### Change Colors

Edit `tailwind.config.js` to customize your color scheme.

### Add Social Links

Edit the `Footer` component in `src/components/layout/Footer.tsx` to add your social media links.

## Technology Stack

- **Next.js 14** - React framework with SSG
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **gray-matter** - Front matter parsing
- **remark** - Markdown processing
- **rehype** - HTML processing

## Performance

- ⚡ First Contentful Paint < 1.5s
- 📊 Lighthouse Performance Score ≥ 90
- 📦 Initial bundle size < 200KB (gzipped)
- 🎯 SEO Score ≥ 90

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TailwindCSS
