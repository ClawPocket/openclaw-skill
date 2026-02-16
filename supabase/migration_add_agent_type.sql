-- Add 'type' column to agents table
ALTER TABLE agents 
ADD COLUMN type text DEFAULT 'clawpocket' CHECK (type IN ('clawpocket', 'openclaw'));

-- Update existing records to have type 'clawpocket'
UPDATE agents SET type = 'clawpocket' WHERE type IS NULL;
