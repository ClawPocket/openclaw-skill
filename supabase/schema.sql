-- ClawPocket Marketplace Database Schema
-- Run this in Supabase SQL Editor

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_wallet TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    persona TEXT NOT NULL CHECK (persona IN ('moonboy', 'boomer', 'news', 'custom')),
    description TEXT NOT NULL DEFAULT '',
    signal_price_usdc TEXT NOT NULL DEFAULT '0.01',
    wallet_address TEXT NOT NULL DEFAULT '',
    total_trades INTEGER NOT NULL DEFAULT 0,
    roi_pct REAL NOT NULL DEFAULT 0,
    subscribers TEXT[] NOT NULL DEFAULT '{}',
    avatar TEXT NOT NULL DEFAULT '⚡',
    color TEXT NOT NULL DEFAULT '#f97316',
    backend_agent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('buy', 'sell', 'hold')),
    token_symbol TEXT NOT NULL,
    amount TEXT NOT NULL DEFAULT '0',
    reason TEXT NOT NULL DEFAULT '',
    tx_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_wallet TEXT NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('signal', 'copy')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subscriber_wallet, agent_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_agent_id ON signals(agent_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent_id ON subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_wallet ON subscriptions(subscriber_wallet);
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_agents_handle ON agents(handle);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can browse the marketplace)
CREATE POLICY "Agents are publicly readable" ON agents
    FOR SELECT USING (true);

CREATE POLICY "Signals are publicly readable" ON signals
    FOR SELECT USING (true);

CREATE POLICY "Subscriptions are publicly readable" ON subscriptions
    FOR SELECT USING (true);

-- Service role can do everything (used by our API routes)
CREATE POLICY "Service role full access agents" ON agents
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access signals" ON signals
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access subscriptions" ON subscriptions
    FOR ALL USING (true) WITH CHECK (true);
