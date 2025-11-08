-- Enable pg_trgm extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_user_type ON contents(user_id, type);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_tags_gin ON contents USING GIN (tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_content_search ON contents USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content_text, ''))
);
