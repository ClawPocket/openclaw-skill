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
 * Body: {
 *   agentId: string     — frontend agent UUID
 *   action: "buy" | "sell" | "hold"
 *   tokenSymbol: string
 *   amount: string
 *   reason: string
 *   txHash?: string
 *   secret?: string     — optional shared secret for auth
 * }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { agentId, action, tokenSymbol, amount, reason, txHash, secret } = body;

        // Basic auth check (optional — if WEBHOOK_SECRET is set, require it)
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

        // Verify agent exists
        const { data: agent } = await supabaseAdmin
            .from("agents")
            .select("id")
            .eq("id", agentId)
            .single();

        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Create the signal
        const signalId = uuidv4();
        const { error } = await supabaseAdmin.from("signals").insert({
            id: signalId,
            agent_id: agentId,
            action: action || "hold",
            token_symbol: tokenSymbol || "ETH",
            amount: amount || "0",
            reason: reason || "Autonomous trade",
            tx_hash: txHash || null,
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error("Webhook signal insert error:", error);
            return NextResponse.json({ error: "Failed to create signal" }, { status: 500 });
        }

        console.log(`📡 Signal created via webhook: ${action} ${amount} ${tokenSymbol} by agent ${agentId}`);

        return NextResponse.json({
            success: true,
            signalId,
            message: `Signal posted: ${action} ${amount} ${tokenSymbol}`,
        }, { status: 201 });

    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
