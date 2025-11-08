-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop old embedding column if it exists and recreate with vector type
ALTER TABLE contents DROP COLUMN IF EXISTS embedding;
ALTER TABLE contents ADD COLUMN embedding vector(768);

-- Create index for vector similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS contents_embedding_idx ON contents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
