-- Migration: Add weekly and monthly rental pricing
-- Run this in Supabase SQL Editor

ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS weekly_price_usdc TEXT,
ADD COLUMN IF NOT EXISTS monthly_price_usdc TEXT;
