/**
 * Combine All Migrations Script
 * 
 * Gộp tất cả migration files thành 1 file duy nhất
 * Run: npx ts-node scripts/combine-migrations.ts
 */

import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const outputFile = path.join(process.cwd(), 'supabase', 'all-migrations.sql');

const migrationFiles = [
  '000_create_user_profiles.sql',
  '001_enable_uuid_extension.sql',
  '002_create_posts_table.sql',
  '003_create_comments_table.sql',
  '004_create_tags_tables.sql',
  '005_create_audit_tables.sql',
  '006_enable_rls.sql',
  '007_posts_rls_policies.sql',
  '008_comments_rls_policies.sql',
  '009_tags_and_audit_rls_policies.sql',
];

console.log('📦 Combining migrations...\n');

let combinedSQL = `-- ============================================
-- MICROBLOG CMS - ALL MIGRATIONS COMBINED
-- Generated: ${new Date().toISOString()}
-- ============================================
-- 
-- HƯỚNG DẪN:
-- 1. Copy toàn bộ file này
-- 2. Paste vào Supabase SQL Editor
-- 3. Click "Run" để chạy tất cả migrations
-- 
-- ============================================

`;

migrationFiles.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  combinedSQL += `
-- ============================================
-- ${String(index + 1).padStart(3, '0')}. ${file}
-- ============================================

${content}

`;

  console.log(`✅ Added: ${file}`);
});

// Write combined file
fs.writeFileSync(outputFile, combinedSQL);

console.log(`\n✅ All migrations combined!`);
console.log(`📄 Output file: supabase/all-migrations.sql`);
console.log(`\n📋 Next steps:`);
console.log(`1. Mở file: supabase/all-migrations.sql`);
console.log(`2. Copy toàn bộ nội dung`);
console.log(`3. Paste vào Supabase SQL Editor`);
console.log(`4. Click "Run"`);
console.log();
