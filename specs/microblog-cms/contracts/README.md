# Contracts Directory

This directory contains TypeScript interfaces and schemas that define the data contracts for the Microblog CMS feature.

## Purpose

Contracts serve as the **single source of truth** for data structures used throughout the application. They ensure:
- Type safety across all code
- Consistent data shapes
- Clear API boundaries
- Self-documenting code
- Validation logic

## Files

### 📄 [post.interface.ts](./post.interface.ts)
**Defines**: Blog post data structures

**Interfaces**:
- `Post` - Complete post with HTML content
- `PostMetadata` - Lightweight post data for listings

**Functions**:
- `isPost(obj)` - Type guard for Post
- `isPostMetadata(obj)` - Type guard for PostMetadata
- `toPostMetadata(post)` - Converts Post to PostMetadata

**Usage**:
```typescript
import { Post, PostMetadata } from './post.interface';

const post: Post = {
  slug: 'hello-world',
  title: 'Hello World',
  date: '2025-12-03',
  tags: ['intro'],
  excerpt: 'My first post',
  content: '<p>Hello World</p>',
};
```

---

### 🏷️ [tag.interface.ts](./tag.interface.ts)
**Defines**: Tag and tag-related data structures

**Interfaces**:
- `Tag` - Complete tag with associated posts
- `TagSummary` - Lightweight tag data for listings

**Functions**:
- `isTag(obj)` - Type guard for Tag
- `isTagSummary(obj)` - Type guard for TagSummary
- `toTagSummary(tag)` - Converts Tag to TagSummary
- `normalizeTagName(name)` - Converts to URL-safe format
- `formatTagDisplayName(name)` - Formats for display

**Usage**:
```typescript
import { Tag, normalizeTagName } from './tag.interface';

const tagName = normalizeTagName('Next.js Tips'); // 'nextjs-tips'
```

---

### ✅ [frontmatter.schema.ts](./frontmatter.schema.ts)
**Defines**: Front matter structure and validation

**Interface**:
- `FrontMatter` - YAML front matter schema

**Classes**:
- `FrontMatterValidationError` - Custom validation error

**Functions**:
- `validateFrontMatter(data, filename?)` - Validates and returns typed front matter
- `isDraft(frontMatter)` - Checks if post is draft
- `getExcerpt(frontMatter, content, maxLength)` - Gets/generates excerpt

**Validation Rules**:
- `title`: Required, non-empty string
- `date`: Required, YYYY-MM-DD format, valid date
- `tags`: Required array of strings (can be empty)
- `excerpt`: Optional string
- `author`: Optional string
- `draft`: Optional boolean (default: false)

**Usage**:
```typescript
import { validateFrontMatter, FrontMatterValidationError } from './frontmatter.schema';

try {
  const frontMatter = validateFrontMatter(rawData, 'my-post.md');
  console.log(frontMatter.title); // Typed and validated
} catch (error) {
  if (error instanceof FrontMatterValidationError) {
    console.error(`Validation failed: ${error.message}`);
  }
}
```

---

## Usage Guidelines

### In Utility Functions (`/lib`)
```typescript
// lib/posts.ts
import { Post, PostMetadata } from '../specs/microblog-cms/contracts/post.interface';
import { validateFrontMatter } from '../specs/microblog-cms/contracts/frontmatter.schema';

export function getPostBySlug(slug: string): Post {
  // Implementation with typed return
}
```

### In React Components
```typescript
// components/post/PostCard.tsx
import { PostMetadata } from '../specs/microblog-cms/contracts/post.interface';

interface PostCardProps {
  post: PostMetadata;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div>
      <h2>{post.title}</h2>
      <time>{post.date}</time>
    </div>
  );
}
```

### In Next.js Pages
```typescript
// pages/posts/[slug].tsx
import { Post } from '../specs/microblog-cms/contracts/post.interface';
import { GetStaticProps, GetStaticPaths } from 'next';

interface PostPageProps {
  post: Post;
}

export default function PostPage({ post }: PostPageProps) {
  // Typed post object
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  // Return typed props
};
```

---

## Validation Examples

### Valid Front Matter
```yaml
---
title: "Introduction to Next.js"
date: "2025-12-03"
tags: ["nextjs", "tutorial"]
excerpt: "Learn the basics of Next.js"
author: "Jane Doe"
draft: false
---
```
✅ Passes validation

### Invalid Front Matter Examples

**Missing required field**:
```yaml
---
title: "My Post"
tags: ["nextjs"]
# Missing "date"
---
```
❌ Throws: `Missing required field "date"`

**Invalid date format**:
```yaml
---
title: "My Post"
date: "12/03/2025"  # Wrong format
tags: ["nextjs"]
---
```
❌ Throws: `Field "date" must be in YYYY-MM-DD format`

**Tags not an array**:
```yaml
---
title: "My Post"
date: "2025-12-03"
tags: "nextjs, typescript"  # String instead of array
---
```
❌ Throws: `Field "tags" must be an array`

---

## Type Safety Benefits

### Without Contracts
```typescript
// ❌ No type safety
function renderPost(post: any) {
  return <h1>{post.tilte}</h1>; // Typo! Runtime error
}
```

### With Contracts
```typescript
// ✅ Type safety catches errors
import { Post } from './post.interface';

function renderPost(post: Post) {
  return <h1>{post.tilte}</h1>; // TypeScript error: Property 'tilte' does not exist
  return <h1>{post.title}</h1>; // ✅ Correct
}
```

---

## Extending Contracts

### Adding New Fields

1. **Update interface**:
```typescript
// post.interface.ts
export interface Post {
  // ... existing fields
  featuredImage?: string;  // New optional field
  tags: string[];
}
```

2. **Update validation** (if new field is required):
```typescript
// frontmatter.schema.ts
export interface FrontMatter {
  // ... existing fields
  featuredImage?: string;
}

export function validateFrontMatter(data: unknown): FrontMatter {
  // Add validation logic for new field
}
```

3. **Update implementation**:
```typescript
// lib/posts.ts - Update functions to handle new field
```

4. **Update components**:
```typescript
// components/post/PostCard.tsx - Render new field
```

---

## Testing Contracts

Contracts include type guards and validation functions that can be tested:

```typescript
// Example test (future)
import { isPost, toPostMetadata } from './post.interface';
import { validateFrontMatter } from './frontmatter.schema';

describe('Post Interface', () => {
  it('should validate correct post object', () => {
    const post = { /* ... */ };
    expect(isPost(post)).toBe(true);
  });
  
  it('should convert Post to PostMetadata', () => {
    const post: Post = { /* ... */ };
    const metadata = toPostMetadata(post);
    expect(metadata).not.toHaveProperty('content');
  });
});

describe('FrontMatter Schema', () => {
  it('should throw error for missing title', () => {
    expect(() => validateFrontMatter({ date: '2025-12-03', tags: [] }))
      .toThrow('Missing required field "title"');
  });
});
```

---

## Related Documentation

- [Technical Plan](../plan.md) - See Phase 1.1 for contract design decisions
- [Requirements](../requirements.md) - FR-002 defines front matter requirements
- [Specification](../spec.md) - See "Key Entities" section

---

**Last Updated**: 2025-12-03  
**Version**: 1.0.0  
**Status**: Ready for Implementation
