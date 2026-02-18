-- Add is_premium column to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create an index for filtering premium signals
CREATE INDEX IF NOT EXISTS idx_signals_is_premium ON signals(is_premium);

-- The 'signals' table row level security policies remain the same (publicly readable),
-- but the specific content columns will be redacted by the API layer for premium signals.
