-- Add price_usdc and pnl_pct to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS price_usdc NUMERIC;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS pnl_pct NUMERIC;
