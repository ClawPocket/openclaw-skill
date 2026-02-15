-- Add API Key column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_key TEXT;

-- Create index for faster lookup during webhook auth
CREATE INDEX IF NOT EXISTS idx_agents_api_key ON agents(api_key);
