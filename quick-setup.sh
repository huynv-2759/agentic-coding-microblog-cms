#!/bin/bash

# Quick Setup Script for Microblog CMS
# Usage: ./quick-setup.sh

set -e

echo "🚀 MICROBLOG CMS - QUICK SETUP"
echo "================================"
echo ""

# Step 1: Test connection
echo "📝 Step 1: Testing database connection..."
if npx ts-node scripts/test-connection.ts | grep -q "Table.*OK"; then
    echo "✅ Database connection OK!"
    echo ""
else
    echo "❌ Database connection FAILED!"
    echo ""
    echo "⚠️  Vui lòng:"
    echo "1. Mở file: STEP-BY-STEP-GUIDE.md"
    echo "2. Làm theo BƯỚC 1: Chạy Migrations"
    echo "3. Chạy lại script này"
    echo ""
    exit 1
fi

# Step 2: Check admin user
echo "📝 Step 2: Checking for super admin user..."
# This will be handled by migrate script

# Step 3: Migrate posts
echo "📝 Step 3: Migrating posts to database..."
if npx ts-node scripts/migrate-posts.ts; then
    echo "✅ Posts migrated successfully!"
    echo ""
else
    echo "❌ Migration failed!"
    echo ""
    echo "⚠️  Nếu lỗi 'No super_admin user found':"
    echo "1. Mở file: STEP-BY-STEP-GUIDE.md"
    echo "2. Làm theo BƯỚC 2: Tạo Admin User"
    echo "3. Chạy lại script này"
    echo ""
    exit 1
fi

# Step 4: Start dev server
echo "📝 Step 4: Starting development server..."
echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Opening browser in 3 seconds..."
echo ""
sleep 3

# Open browser (works on Linux with xdg-open)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &
fi

# Start dev server
npm run dev
