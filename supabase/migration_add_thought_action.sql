-- Migration: Support 'thought' and 'social' actions in signals table
-- Run this in Supabase SQL Editor

ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_action_check;
ALTER TABLE signals ADD CONSTRAINT signals_action_check CHECK (action IN ('buy', 'sell', 'hold', 'thought', 'social'));
