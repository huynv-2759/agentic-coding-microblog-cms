/**
 * Test Supabase Connection
 * 
 * Kiểm tra kết nối đến Supabase và các tables
 * Run: npx ts-node scripts/test-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Kiểm tra cấu hình...\n');

// Check environment variables
if (!SUPABASE_URL) {
  console.error('❌ Thiếu NEXT_PUBLIC_SUPABASE_URL trong .env.local');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local');
  process.exit(1);
}

console.log('✅ Environment variables:');
console.log(`   SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`   ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log();

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔌 Kiểm tra kết nối đến Supabase...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1️⃣  Test kết nối cơ bản...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('posts')
      .select('count')
      .limit(1);

    if (healthError) {
      if (healthError.message.includes('relation "public.posts" does not exist')) {
        console.log('   ⚠️  Kết nối thành công NHƯNG chưa có table "posts"');
        console.log('   ℹ️  Bạn cần chạy migrations trong Supabase Dashboard');
        console.log();
        return false;
      }
      throw healthError;
    }

    console.log('   ✅ Kết nối thành công!\n');

    // Test 2: Check tables exist
    console.log('2️⃣  Kiểm tra các tables...');
    const tables = ['posts', 'comments', 'tags', 'post_tags', 'user_profiles'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`   ❌ Table "${table}" không tồn tại hoặc không có quyền truy cập`);
        } else {
          console.log(`   ✅ Table "${table}" OK`);
        }
      } catch (err) {
        console.log(`   ❌ Lỗi khi check table "${table}":`, err);
      }
    }
    console.log();

    // Test 3: Count posts
    console.log('3️⃣  Đếm số lượng posts...');
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('   ❌ Không thể đếm posts:', countError.message);
    } else {
      console.log(`   ✅ Có ${count} bài posts trong database`);
    }
    console.log();

    // Test 4: Get sample post
    console.log('4️⃣  Lấy mẫu 1 post...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('slug, title, status, created_at')
      .limit(1);

    if (postsError) {
      console.log('   ❌ Không thể lấy posts:', postsError.message);
    } else if (posts && posts.length > 0) {
      console.log('   ✅ Post mẫu:', JSON.stringify(posts[0], null, 2));
    } else {
      console.log('   ⚠️  Không có post nào trong database');
      console.log('   ℹ️  Chạy: npx ts-node scripts/migrate-posts.ts');
    }
    console.log();

    // Test 5: Check RLS policies
    console.log('5️⃣  Kiểm tra RLS policies...');
    const { data: publicPosts, error: rlsError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .limit(1);

    if (rlsError) {
      console.log('   ⚠️  RLS có thể chưa được cấu hình đúng:', rlsError.message);
    } else {
      console.log('   ✅ RLS policies hoạt động OK');
    }
    console.log();

    return true;
  } catch (error: any) {
    console.error('❌ Lỗi kết nối:', error.message);
    console.log();
    console.log('📝 Các bước khắc phục:');
    console.log('1. Kiểm tra URL trong .env.local có đúng không');
    console.log('2. Kiểm tra API key có đúng không');
    console.log('3. Kiểm tra Supabase project có đang hoạt động không');
    console.log('4. Chạy migrations trong Supabase Dashboard (SQL Editor)');
    console.log();
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('   SUPABASE CONNECTION TEST');
  console.log('═══════════════════════════════════════════\n');

  const success = await testConnection();

  console.log('═══════════════════════════════════════════');
  if (success) {
    console.log('✅ Tất cả test PASSED!');
    console.log('✅ Database đã sẵn sàng sử dụng!');
  } else {
    console.log('❌ Một số test FAILED');
    console.log('⚠️  Vui lòng kiểm tra lại cấu hình');
  }
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
