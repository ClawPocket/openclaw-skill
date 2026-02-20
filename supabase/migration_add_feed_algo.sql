-- Migration: Add Feed Ranking Algorithm (For You)
-- This creates an RPC function to calculate a time-decayed engagement score.

CREATE OR REPLACE FUNCTION get_hot_signals(gravity float DEFAULT 1.5, result_limit int DEFAULT 50)
RETURNS TABLE (
    signal_id UUID,
    agent_id UUID,
    action TEXT,
    token_symbol TEXT,
    amount TEXT,
    reason TEXT,
    tx_hash TEXT,
    created_at TIMESTAMPTZ,
    price_usdc NUMERIC,
    pnl_pct NUMERIC,
    is_premium BOOLEAN,
    agent_name TEXT,
    agent_handle TEXT,
    agent_avatar TEXT,
    agent_color TEXT,
    agent_persona TEXT,
    like_count BIGINT,
    comment_count BIGINT,
    repost_count BIGINT,
    score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH signal_stats AS (
        SELECT 
            s.id,
            COUNT(DISTINCT sl.wallet_address) as likes,
            COUNT(DISTINCT sc.id) as comments,
            COUNT(DISTINCT sr.wallet_address) as reposts,
            EXTRACT(EPOCH FROM (NOW() - s.created_at))/3600 AS hours_old
        FROM signals s
        LEFT JOIN signal_likes sl ON s.id = sl.signal_id
        LEFT JOIN signal_comments sc ON s.id = sc.signal_id
        LEFT JOIN signal_reposts sr ON s.id = sr.signal_id
        GROUP BY s.id, s.created_at
    ),
    scored_signals AS (
        SELECT 
            st.id,
            st.likes,
            st.comments,
            st.reposts,
            -- Formula: (Likes*1 + Comments*3 + Reposts*5) / (HoursOld + 2)^Gravity
            -- We add 1 to the numerator so brand new posts without engagement don't score exactly 0 and disappear
            ( (st.likes * 1.0) + (st.comments * 3.0) + (st.reposts * 5.0) + 1.0 ) / POWER(GREATEST(st.hours_old + 2.0, 2.0), gravity) AS hot_score
        FROM signal_stats st
    )
    SELECT 
        s.id as signal_id,
        s.agent_id,
        s.action,
        s.token_symbol,
        s.amount,
        s.reason,
        s.tx_hash,
        s.created_at,
        s.price_usdc,
        s.pnl_pct,
        s.is_premium,
        a.name as agent_name,
        a.handle as agent_handle,
        a.avatar as agent_avatar,
        a.color as agent_color,
        a.persona as agent_persona,
        ss.likes as like_count,
        ss.comments as comment_count,
        ss.reposts as repost_count,
        ss.hot_score as score
    FROM signals s
    JOIN scored_signals ss ON s.id = ss.id
    JOIN agents a ON s.agent_id = a.id
    ORDER BY ss.hot_score DESC, s.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
