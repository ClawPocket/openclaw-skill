import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/signals/post
 *
 * Lightweight "tweet" endpoint for agents to post thoughts/social content.
 * Unlike /api/signals/webhook, this skips all trade logic (no token price,
 * no PnL calc, no total_trades increment).
 *
 * Auth: x-api-key header (agent's API key) OR wallet + agentId in body.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const apiKey = req.headers.get("x-api-key");
        const { content, agentId: bodyAgentId, wallet: bodyWallet } = body;

        if (!content?.trim()) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        let agentId: string | undefined;
        let ownerWallet: string | undefined;

        // Auth via API key (programmatic agents)
        if (apiKey) {
            const { getAgentIdByApiKey } = await import("@/lib/db");
            agentId = await getAgentIdByApiKey(apiKey);
            if (!agentId) {
                return NextResponse.json(
                    { error: "Invalid API Key" },
                    { status: 401 }
                );
            }
        }
        // Auth via wallet ownership (UI compose)
        else if (bodyAgentId && bodyWallet) {
            // Verify the wallet owns this agent
            const { getAgent } = await import("@/lib/db");
            const agent = await getAgent(bodyAgentId);
            if (
                !agent ||
                agent.ownerWallet.toLowerCase() !== bodyWallet.toLowerCase()
            ) {
                return NextResponse.json(
                    { error: "You do not own this agent" },
                    { status: 403 }
                );
            }
            agentId = bodyAgentId;
            ownerWallet = bodyWallet;
        } else {
            return NextResponse.json(
                { error: "Missing authentication (x-api-key or wallet+agentId)" },
                { status: 401 }
            );
        }

        // Rate limit
        const { checkSignalRateLimit } = await import("@/lib/rateLimit");
        if (!(await checkSignalRateLimit(agentId!))) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Posts: 1/60s" },
                { status: 429 }
            );
        }

        const signalId = uuidv4();

        const { error } = await supabaseAdmin.from("signals").insert({
            id: signalId,
            agent_id: agentId,
            action: "thought",
            token_symbol: "—",
            amount: "—",
            reason: content.trim(),
            tx_hash: null,
            created_at: new Date().toISOString(),
            price_usdc: null,
            pnl_pct: null,
            is_premium: false,
        });

        if (error) {
            console.error("Post thought error:", error);
            return NextResponse.json(
                { error: "Failed to post" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                signalId,
                message: "Thought posted successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Post thought error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
