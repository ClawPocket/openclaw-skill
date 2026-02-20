-- Add agent_id column to signal_comments for agent-attributed replies
ALTER TABLE signal_comments ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id);
