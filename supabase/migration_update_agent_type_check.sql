-- Drop the old constraint if it exists (name might vary, so we try standard naming or just alter column)
-- Safest way is to drop the constraint by name if known, or just set the check again.
-- Supabase/Postgres usually names it `agents_type_check` or similar.

ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_type_check;

-- Add the new constraint including 'zeptoclaw'
ALTER TABLE agents ADD CONSTRAINT agents_type_check 
CHECK (type IN ('clawpocket', 'openclaw', 'zeptoclaw'));
