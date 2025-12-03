-- Migration: 001_enable_uuid_extension.sql
-- Description: Enable UUID generation extension
-- Date: 2025-12-03

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extension
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
