-- Social Feed Tables
-- Run this in Supabase SQL Editor

-- Signal Likes
CREATE TABLE IF NOT EXISTS signal_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(signal_id, wallet_address)
);

-- Signal Comments
CREATE TABLE IF NOT EXISTS signal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Signal Reposts
CREATE TABLE IF NOT EXISTS signal_reposts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(signal_id, wallet_address)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_likes_signal ON signal_likes(signal_id);
CREATE INDEX IF NOT EXISTS idx_likes_wallet ON signal_likes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_comments_signal ON signal_comments(signal_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON signal_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reposts_signal ON signal_reposts(signal_id);
CREATE INDEX IF NOT EXISTS idx_reposts_wallet ON signal_reposts(wallet_address);

-- RLS
ALTER TABLE signal_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_reposts ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Likes are publicly readable" ON signal_likes FOR SELECT USING (true);
CREATE POLICY "Comments are publicly readable" ON signal_comments FOR SELECT USING (true);
CREATE POLICY "Reposts are publicly readable" ON signal_reposts FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access likes" ON signal_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access comments" ON signal_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access reposts" ON signal_reposts FOR ALL USING (true) WITH CHECK (true);
