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
import { fetchTokenPrice } from "@/lib/coingecko";

// ... (imports remain same)

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { agentId: bodyAgentId, action, tokenSymbol, amount, reason, txHash, secret } = body;
        const apiKey = req.headers.get("x-api-key");

        let agentId = bodyAgentId;

        // AUTHENTICATION
        // 1. Check API Key (Preferred)
        if (apiKey) {
            const { getAgentIdByApiKey } = await import("@/lib/db");
            const foundAgentId = await getAgentIdByApiKey(apiKey);
            if (foundAgentId) {
                agentId = foundAgentId; // Trust the key's owner
            } else {
                return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
            }
        }
        // 2. Fallback to Global Secret (Legacy/Internal)
        else if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!agentId) return NextResponse.json({ error: "Missing Agent ID" }, { status: 400 });

        // ... rest of logic

        // 1. Fetch Real Price
        let priceUsdc: number | null = null;
        if (tokenSymbol) {
            priceUsdc = await fetchTokenPrice(tokenSymbol);
        }

        // 2. Create the signal with price
        const signalId = uuidv4();

        // Calculate PnL if selling
        let pnlPct: number | null = null;

        if (action === "sell" && priceUsdc) {
            // Find most recent buy signal for this token to calc PnL
            // Simple LIFO approach for now
            const { data: lastBuy } = await supabaseAdmin
                .from("signals")
                .select("price_usdc")
                .eq("agent_id", agentId)
                .eq("token_symbol", tokenSymbol)
                .eq("action", "buy")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (lastBuy?.price_usdc) {
                const buyPrice = parseFloat(lastBuy.price_usdc);
                if (buyPrice > 0) {
                    pnlPct = ((priceUsdc - buyPrice) / buyPrice) * 100;
                    // Format to 2 decimal places
                    pnlPct = Math.round(pnlPct * 100) / 100;
                }
            }
        }

        const { error: signalError } = await supabaseAdmin.from("signals").insert({
            id: signalId,
            agent_id: agentId,
            action: action || "hold",
            token_symbol: tokenSymbol || "ETH",
            amount: amount || "0",
            reason: reason || "Autonomous trade",
            tx_hash: txHash || null,
            created_at: new Date().toISOString(),
            price_usdc: priceUsdc,
            pnl_pct: pnlPct
        });

        // ... (trigger copiers logic matches original)

        // ── Auto-update agent stats ──

        // 1. Increment total_trades
        const { data: agent } = await supabaseAdmin
            .from("agents")
            .select("total_trades, roi_pct")
            .eq("id", agentId)
            .single();

        const newTotalTrades = (agent?.total_trades || 0) + 1;

        // 2. Recalculate ROI
        //    New formula: Base activity score + Sum of all realized PnL
        let roiPct = agent?.roi_pct || 0;

        if (pnlPct !== null) {
            // Add realized PnL directly to ROI
            roiPct += pnlPct;
        } else if (action === "buy") {
            // Small activity bumps for buying (0.5%)
            roiPct += 0.1;
        }

        // Cap excessive ROI jumps (optional safety) or just let it fly?
        // Let's round it
        roiPct = Math.round(roiPct * 100) / 100;

        // Update agent stats
        await supabaseAdmin
            .from("agents")
            .update({
                total_trades: newTotalTrades,
                roi_pct: roiPct,
            })
            .eq("id", agentId);

        console.log(`📡 Signal created: ${action} ${amount} ${tokenSymbol} @ $${priceUsdc} | PnL: ${pnlPct}% | New ROI: ${roiPct}%`);

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
