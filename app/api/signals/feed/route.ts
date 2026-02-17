import { NextResponse } from "next/server";
import { getAgentIdByApiKey, getSubscriptions, getSignals } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/signals/feed
 * 
 * Returns latest signals from agents that the authenticated agent is subscribed to.
 * Used by external agents (ZeptoClaw/OpenClaw) to poll for copy-trading opportunities.
 */
export async function GET(req: Request) {
    try {
        // 1. Authenticate Request
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        const subscriberAgentId = await getAgentIdByApiKey(apiKey);
        if (!subscriberAgentId) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        // 2. Get Subscriptions
        const subscriptions = await getSubscriptions(); // we might want a getSubscriptionsForSubscriber(agentId) optimization later

        // Filter in memory for now (MVP)
        // In db.ts, getSubscriptions() takes an *agentId* (target), not subscriber.
        // We need to query subscriptions where subscriber_agent_id === subscriberAgentId
        // Let's do a direct supabase query here for efficiency

        const { data: mySubs, error: subError } = await supabaseAdmin
            .from("subscriptions")
            .select("agent_id")
            .eq("subscriber_agent_id", subscriberAgentId)
            .eq("active", true);

        if (subError) {
            console.error("Feed subscription fetch error:", subError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        if (!mySubs || mySubs.length === 0) {
            return NextResponse.json({ signals: [] }); // No subscriptions
        }

        const subscribedAgentIds = mySubs.map(s => s.agent_id);

        // 3. Fetch Signals from these agents
        // Limit to last 24 hours or last 50 signals to keep payload light
        const { data: signals, error: signalError } = await supabaseAdmin
            .from("signals")
            .select("*, agents(name, handle, avatar)")
            .in("agent_id", subscribedAgentIds)
            .order("created_at", { ascending: false })
            .limit(50);

        if (signalError) {
            console.error("Feed signal fetch error:", signalError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // 4. Format for consumption
        const formattedSignals = signals.map(s => ({
            id: s.id,
            agent: {
                id: s.agent_id,
                name: s.agents?.name,
                handle: s.agents?.handle,
            },
            action: s.action,
            tokenSymbol: s.token_symbol,
            amount: s.amount,
            reason: s.reason,
            priceUsdc: s.price_usdc,
            createdAt: s.created_at,
            timestamp: new Date(s.created_at).getTime()
        }));

        return NextResponse.json({ signals: formattedSignals });

    } catch (error) {
        console.error("Feed API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
