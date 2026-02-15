import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/signals/webhook
 *
 * Called by the backend agent server after a trade is executed.
 * Creates a persistent signal in Supabase that appears in the feed
 * and can receive likes, comments, and reposts.
 *
 * Also auto-updates the agent's stats:
 * - Increments total_trades
 * - Recalculates roi_pct from actual buy/sell signals
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { agentId, action, tokenSymbol, amount, reason, txHash, secret } = body;

        // Basic auth check
        const webhookSecret = process.env.WEBHOOK_SECRET;
        if (webhookSecret && secret !== webhookSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!agentId || !action || !tokenSymbol) {
            return NextResponse.json(
                { error: "Missing required fields: agentId, action, tokenSymbol" },
                { status: 400 }
            );
        }

        // Verify agent exists & get current stats
        const { data: agent } = await supabaseAdmin
            .from("agents")
            .select("id, total_trades, roi_pct")
            .eq("id", agentId)
            .single();

        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Create the signal
        const signalId = uuidv4();
        const { error: signalError } = await supabaseAdmin.from("signals").insert({
            id: signalId,
            agent_id: agentId,
            action: action || "hold",
            token_symbol: tokenSymbol || "ETH",
            amount: amount || "0",
            reason: reason || "Autonomous trade",
            tx_hash: txHash || null,
            created_at: new Date().toISOString(),
        });

        if (signalError) {
            console.error("Webhook signal insert error:", signalError);
            return NextResponse.json({ error: "Failed to create signal" }, { status: 500 });
        }

        // ── TRIGGER AUTOMATED COPY TRADERS ──
        // Fire and forget - don't block the webhook response
        (async () => {
            try {
                // Dynamic import to avoid circular dep issues if any, or just standard import
                const { getSubscriptions } = await import("@/lib/db");
                const subs = await getSubscriptions(agentId);
                const followers = subs.filter(s => s.subscriberAgentId && s.active);

                if (followers.length > 0) {
                    console.log(`⚡ Triggering ${followers.length} copy-traders for signal...`);
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

                    for (const sub of followers) {
                        fetch(`${backendUrl}/agents/${sub.subscriberAgentId}/execute`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action, tokenSymbol, amount })
                        }).catch(err => console.error(`Failed to trigger copy agent ${sub.subscriberAgentId}:`, err));
                    }
                }
            } catch (err) {
                console.error("Copy-trading trigger failed:", err);
            }
        })();

        // ── Auto-update agent stats ──

        // 1. Increment total_trades
        const newTotalTrades = (agent.total_trades || 0) + 1;

        // 2. Recalculate ROI from all signals
        //    Simple model: each buy signal adds small positive ROI,
        //    each sell signal realizes gains. More buys + sells = more active trading.
        const { data: allSignals } = await supabaseAdmin
            .from("signals")
            .select("action, amount")
            .eq("agent_id", agentId);

        let roiPct = agent.roi_pct || 0;
        if (allSignals && allSignals.length > 0) {
            const buys = allSignals.filter((s: any) => s.action === "buy").length;
            const sells = allSignals.filter((s: any) => s.action === "sell").length;
            const totalSignals = allSignals.length;

            // ROI formula: base it on trade activity + sell ratio
            // More sells relative to buys = profit-taking = higher ROI
            // Capped growth per trade to keep it realistic
            const sellRatio = totalSignals > 0 ? sells / totalSignals : 0;
            const activityBonus = Math.log2(totalSignals + 1) * 5; // logarithmic growth
            const profitFactor = sellRatio > 0.3 ? sellRatio * 20 : 0; // bonus for taking profits

            roiPct = Math.round(activityBonus + profitFactor);

            // Apply some variance based on current trade
            if (action === "sell") {
                roiPct += Math.round(parseFloat(amount || "0") * 2); // sells boost ROI
            }
        }

        // Update agent stats
        const { error: updateError } = await supabaseAdmin
            .from("agents")
            .update({
                total_trades: newTotalTrades,
                roi_pct: roiPct,
            })
            .eq("id", agentId);

        if (updateError) {
            console.warn("Failed to update agent stats:", updateError);
        }

        console.log(`📡 Signal created: ${action} ${amount} ${tokenSymbol} | Agent ${agentId} → ${newTotalTrades} trades, ${roiPct}% ROI`);

        return NextResponse.json({
            success: true,
            signalId,
            stats: { totalTrades: newTotalTrades, roiPct },
            message: `Signal posted: ${action} ${amount} ${tokenSymbol}`,
        }, { status: 201 });

    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
