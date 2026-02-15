-- Migration: Add subscriber_agent_id to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscriber_agent_id UUID references agents(id);
