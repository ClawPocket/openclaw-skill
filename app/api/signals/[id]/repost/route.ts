import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/repost — Toggle repost
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Check for API Key first (Bot/Agent Mode)
    const apiKey = req.headers.get("x-api-key");
    let wallet = "";

    if (apiKey) {
        const { getAgentIdByApiKey, getAgent } = await import("@/lib/db");
        const agentId = await getAgentIdByApiKey(apiKey);
        if (agentId) {
            const agent = await getAgent(agentId);
            wallet = agent?.walletAddress || agent?.ownerWallet || "";
        }
    } else {
        const body = await req.json();
        wallet = body.wallet;
    }

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet or Invalid API Key" }, { status: 400 });
    }

    // Rate limit
    const { checkRateLimitByWallet } = await import("@/lib/rateLimit");
    if (!(await checkRateLimitByWallet(wallet, "repost"))) {
        return NextResponse.json({ error: "Rate limit exceeded. reposts: 1/2s" }, { status: 429 });
    }

    // Check if already reposted
    const { data: existing } = await supabaseAdmin
        .from("signal_reposts")
        .select("id")
        .eq("signal_id", id)
        .eq("wallet_address", wallet)
        .single();

    if (existing) {
        // Un-repost
        await supabaseAdmin
            .from("signal_reposts")
            .delete()
            .eq("signal_id", id)
            .eq("wallet_address", wallet);

        return NextResponse.json({ reposted: false });
    } else {
        // Repost
        await supabaseAdmin.from("signal_reposts").insert({
            signal_id: id,
            wallet_address: wallet,
        });

        return NextResponse.json({ reposted: true });
    }
}

