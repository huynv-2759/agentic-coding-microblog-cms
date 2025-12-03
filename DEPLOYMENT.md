# Deployment Guide

This guide explains how to deploy your Microblog CMS to production.

## Prerequisites

- Git repository (GitHub, GitLab, Bitbucket)
- Vercel account (recommended) or other hosting platform
- Domain name (optional)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications.

### Step 1: Prepare Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Microblog CMS"

# Push to GitHub
git remote add origin https://github.com/yourusername/microblog-cms.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In" with GitHub
3. Click "New Project"
4. Import your Git repository
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
6. Click "Deploy"

Your site will be live in ~2 minutes! 🚀

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (~24-48 hours)

### Step 4: Update SEO URLs

After deployment, update the URLs in your Meta components:

```typescript
// src/components/seo/Meta.tsx
// Replace "https://yourdomain.com" with your actual domain
url="https://your-actual-domain.com"
```

Commit and push the changes to trigger a new deployment.

## Option 2: Deploy to Netlify

### Step 1: Prepare Your Repository

Same as Vercel - push your code to Git.

### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click "Deploy site"

### Step 3: Configure Next.js

Add `next.config.js` export configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // For static export
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
```

Note: This disables some Next.js features but works for static sites.

## Option 3: Deploy to Cloudflare Pages

### Step 1: Push to Git

Same as above.

### Step 2: Deploy to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect your Git repository
4. Configure build:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`
5. Click "Save and Deploy"

## Option 4: Static Export for Any Host

Generate a static export that works anywhere:

### Step 1: Configure for Static Export

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

### Step 2: Build Static Files

```bash
npm run build
```

This creates an `out/` directory with static files.

### Step 3: Deploy to Any Host

Upload the `out/` directory to:
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting
- Any web server (Apache, Nginx)

## Continuous Deployment

### Automatic Deployments

Vercel, Netlify, and Cloudflare Pages automatically deploy when you push to your Git repository.

**Workflow:**
1. Write a new blog post
2. Create `.md` file in `content/posts/`
3. Commit and push to Git
4. Automatic deployment triggered
5. New post is live!

### Preview Deployments

Most platforms create preview deployments for branches:
- Push to feature branch → Get preview URL
- Review changes before merging
- Merge to main → Deploy to production

## Environment Variables

If you need environment variables:

### Vercel
1. Go to Project Settings → Environment Variables
2. Add your variables
3. Redeploy

### Netlify
1. Go to Site Settings → Environment
2. Add your variables
3. Redeploy

## Performance Optimization

### Enable Compression

Most platforms enable Brotli/Gzip automatically.

### CDN Configuration

- Vercel: Global CDN included
- Netlify: Global CDN included
- Cloudflare: Global CDN included

### Caching Headers

Add to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

## Monitoring

### Analytics

Add analytics to track visitors:

1. **Google Analytics**
```typescript
// Add to src/pages/_document.tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

2. **Plausible** (privacy-friendly)
```typescript
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

3. **Vercel Analytics**
```bash
npm install @vercel/analytics
```

### Error Tracking

Consider adding error tracking:
- Sentry
- LogRocket
- Rollbar

## Security

### Headers

Add security headers in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ]
}
```

### HTTPS

All mentioned platforms provide free SSL certificates automatically.

## Backup

### Content Backup

Your blog posts are in Git, so they're already backed up!

To backup:
```bash
git push
```

### Database-less

Since we use filesystem-based content, no database backup needed.

## Troubleshooting

### Build Fails

1. Check build logs on platform dashboard
2. Verify `package.json` dependencies
3. Test build locally: `npm run build`
4. Check Node.js version (18+ required)

### Images Not Loading

1. Update `next.config.js` image domains
2. Use `next/image` component
3. Check image paths in Markdown

### 404 Errors

1. Verify routing configuration
2. Check file paths are correct
3. Ensure `fallback: false` in getStaticPaths

## Post-Deployment Checklist

- [ ] Site is accessible via URL
- [ ] All pages load correctly
- [ ] Images display properly
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] Meta tags are correct (view source)
- [ ] robots.txt is accessible
- [ ] Test on multiple devices/browsers
- [ ] Check Lighthouse scores
- [ ] Set up analytics (optional)
- [ ] Configure custom domain (optional)

## Updating Your Blog

To add new content:

1. Create new `.md` file in `content/posts/`
2. Add front matter
3. Write content
4. Commit and push
5. Automatic deployment!

```bash
# Example workflow
git add content/posts/my-new-post.md
git commit -m "Add new post: My New Post"
git push
```

## Support

- **Vercel**: https://vercel.com/docs
- **Netlify**: https://docs.netlify.com
- **Cloudflare**: https://developers.cloudflare.com/pages/
- **Next.js**: https://nextjs.org/docs

---

🎉 **Congratulations!** Your blog is now live!

**Next steps:**
1. Share your blog URL
2. Write more posts
3. Promote on social media
4. Engage with readers

Happy blogging! 📝✨
