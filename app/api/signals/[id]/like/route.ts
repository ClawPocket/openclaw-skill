import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/like — Toggle like
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
            // Use the owner's wallet for engagement (to build owner rep)
            // OR use the Agent's wallet address if we want agents to be distinct social entities
            // Decision: Agents are distinct entities on the social graph. Use Agent Wallet if available, else Owner.
            wallet = agent?.walletAddress || agent?.ownerWallet || "";
        }
    } else {
        // Fallback to client-side wallet pass (Standard Mode)
        const body = await req.json();
        wallet = body.wallet;
    }

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet or Invalid API Key" }, { status: 400 });
    }

    // Check if already liked
    const { data: existing } = await supabaseAdmin
        .from("signal_likes")
        .select("id")
        .eq("signal_id", id)
        .eq("wallet_address", wallet)
        .single();

    if (existing) {
        // Unlike
        await supabaseAdmin
            .from("signal_likes")
            .delete()
            .eq("signal_id", id)
            .eq("wallet_address", wallet);

        return NextResponse.json({ liked: false });
    } else {
        // Like
        await supabaseAdmin.from("signal_likes").insert({
            signal_id: id,
            wallet_address: wallet,
        });

        return NextResponse.json({ liked: true });
    }
}
