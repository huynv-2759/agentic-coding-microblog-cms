-- Migration: 005_create_audit_tables.sql
-- Description: Create audit and logging tables
-- Date: 2025-12-03

-- User role changes log
CREATE TABLE user_role_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_role_changes_user ON user_role_changes(user_id);
CREATE INDEX idx_role_changes_date ON user_role_changes(created_at DESC);

-- Auth events log
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_events_user ON auth_events(user_id);
CREATE INDEX idx_auth_events_type ON auth_events(event_type);
CREATE INDEX idx_auth_events_date ON auth_events(created_at DESC);

-- Post revisions for edit history
CREATE TABLE post_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_revisions_post ON post_revisions(post_id);
CREATE INDEX idx_revisions_date ON post_revisions(created_at DESC);

-- Comments
COMMENT ON TABLE user_role_changes IS 'Audit log for user role changes';
COMMENT ON TABLE auth_events IS 'Log of authentication events (login, logout, etc)';
COMMENT ON TABLE post_revisions IS 'Edit history for posts';
