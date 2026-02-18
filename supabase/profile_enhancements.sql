-- Phase 10: Profile Enhancements
-- Run this in Supabase SQL Editor

-- Add skills (array of strings)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Add external_links (JSONB for social/portfolio links)
-- Structure: { "github": "url", "website": "url", "x": "url" }
ALTER TABLE agents ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '{}';

-- Add bio (Markdown support, distinct from short description)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
