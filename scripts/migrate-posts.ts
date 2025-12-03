/**
 * Post Migration Script
 * 
 * Migrates all markdown posts from content/posts/ to Supabase database.
 * Run with: npx ts-node scripts/migrate-posts.ts
 * 
 * Prerequisites:
 * 1. Supabase project created
 * 2. All migrations applied (001-009.sql)
 * 3. Environment variables configured in .env.local
 * 4. Super admin user created (for author_id)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Extract slug from filename
 */
function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '');
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Migrate a single post
 */
async function migratePost(filename: string, authorId: string): Promise<boolean> {
  try {
    const filePath = path.join(POSTS_DIR, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);

    const slug = getSlugFromFilename(filename);

    // Prepare post data
    const postData = {
      slug,
      title: frontmatter.title || slug,
      content,
      excerpt: frontmatter.excerpt || generateExcerpt(content),
      tags: frontmatter.tags || [],
      status: 'published' as const,
      author_id: authorId,
      published_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if post already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      console.log(`⏭️  Skipping ${slug} (already exists)`);
      return true;
    }

    // Insert post
    const { error: postError } = await supabase
      .from('posts')
      .insert(postData);

    if (postError) {
      console.error(`❌ Failed to insert ${slug}:`, postError.message);
      return false;
    }

    console.log(`✅ Migrated: ${slug}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
    return false;
  }
}

/**
 * Get or create super admin user
 */
async function getSuperAdminUser(): Promise<string | null> {
  // Try to find existing super admin
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1);

  if (users && users.length > 0) {
    return users[0].id;
  }

  console.log('⚠️  No super_admin user found.');
  console.log('Please create a super admin user first:');
  console.log('1. Sign up at your Supabase Auth');
  console.log('2. Update the user role in the database:');
  console.log('   UPDATE user_profiles SET role = \'super_admin\' WHERE email = \'your-email@example.com\';');
  return null;
}

/**
 * Migrate all tags
 */
async function migrateTags(posts: Array<{ slug: string; tags: string[] }>): Promise<void> {
  // Collect all unique tags
  const allTags = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
  });

  console.log(`\n📋 Found ${allTags.size} unique tags`);

  // Insert tags (ignore duplicates)
  for (const tagName of allTags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-');
    
    const { error } = await supabase
      .from('tags')
      .insert({
        name: tagName,
        slug,
      })
      .select()
      .single();

    if (error && !error.message.includes('duplicate')) {
      console.error(`❌ Failed to insert tag ${tagName}:`, error.message);
    }
  }

  console.log('✅ Tags migrated');
}

/**
 * Link posts to tags
 */
async function linkPostsToTags(): Promise<void> {
  console.log('\n🔗 Linking posts to tags...');

  // Get all posts with tags
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, tags');

  if (!posts) return;

  // Get all tags
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, slug');

  if (!tags) return;

  // Create tag lookup
  const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag.id]));

  // Link posts to tags
  for (const post of posts) {
    if (!post.tags || post.tags.length === 0) continue;

    for (const tagName of post.tags) {
      const tagId = tagMap.get(tagName.toLowerCase());
      if (!tagId) continue;

      const { error } = await supabase
        .from('post_tags')
        .insert({
          post_id: post.id,
          tag_id: tagId,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`❌ Failed to link ${post.slug} to ${tagName}:`, error.message);
      }
    }
  }

  console.log('✅ Posts linked to tags');
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting post migration...\n');

  // Check if posts directory exists
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`❌ Posts directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  // Get super admin user
  const authorId = await getSuperAdminUser();
  if (!authorId) {
    process.exit(1);
  }

  console.log(`✅ Using author ID: ${authorId}\n`);

  // Get all markdown files
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
  console.log(`📁 Found ${files.length} markdown files\n`);

  // Migrate posts
  let successCount = 0;
  const postsWithTags: Array<{ slug: string; tags: string[] }> = [];

  for (const file of files) {
    const success = await migratePost(file, authorId);
    if (success) {
      successCount++;
      
      // Extract tags for later migration
      const filePath = path.join(POSTS_DIR, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter } = matter(fileContents);
      
      if (frontmatter.tags) {
        postsWithTags.push({
          slug: getSlugFromFilename(file),
          tags: frontmatter.tags,
        });
      }
    }
  }

  console.log(`\n✅ Successfully migrated ${successCount}/${files.length} posts`);

  // Migrate tags and link to posts
  if (postsWithTags.length > 0) {
    await migrateTags(postsWithTags);
    await linkPostsToTags();
  }

  console.log('\n🎉 Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Update src/lib/posts.ts to fetch from database');
  console.log('2. Test the homepage and post pages');
  console.log('3. Verify posts in Supabase dashboard');
}

// Run migration
main().catch(console.error);
