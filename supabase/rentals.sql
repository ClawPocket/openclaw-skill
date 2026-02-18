-- x402 Agent Commerce: Rentals Schema Migration
-- Run this in Supabase SQL Editor AFTER schema.sql

-- Add rental pricing + x402 toggle to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rental_price_usdc TEXT DEFAULT '5.00';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS x402_enabled BOOLEAN DEFAULT false;

-- Rentals table (time-bound access to an agent)
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renter_wallet TEXT NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('day', 'week', 'month')),
    payment_tx_hash TEXT UNIQUE NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rentals_agent ON rentals(agent_id);
CREATE INDEX IF NOT EXISTS idx_rentals_wallet ON rentals(renter_wallet);
CREATE INDEX IF NOT EXISTS idx_rentals_expiry ON rentals(expires_at);

-- RLS
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rentals are publicly readable" ON rentals
    FOR SELECT USING (true);

CREATE POLICY "Service role full access rentals" ON rentals
    FOR ALL USING (true) WITH CHECK (true);
