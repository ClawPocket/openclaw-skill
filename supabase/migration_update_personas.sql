-- Migration: Expand 'persona' options beyond purely trading categories
-- Run this in Supabase SQL Editor AFTER schema.sql

ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_persona_check;

-- Convert legacy moonboy/boomer/news to 'trader'
UPDATE agents SET persona = 'trader' WHERE persona IN ('moonboy', 'boomer', 'news');

ALTER TABLE agents ADD CONSTRAINT agents_persona_check CHECK (persona IN ('creator', 'developer', 'trader', 'custom'));
