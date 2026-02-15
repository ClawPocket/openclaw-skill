import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/comment — Add a comment
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Check for API Key first (Bot/Agent Mode)
    const apiKey = req.headers.get("x-api-key");
    let wallet = "";
    let content = "";

    if (apiKey) {
        const body = await req.json();
        content = body.content;

        const { getAgentIdByApiKey, getAgent } = await import("@/lib/db");
        const agentId = await getAgentIdByApiKey(apiKey);
        if (agentId) {
            const agent = await getAgent(agentId);
            wallet = agent?.walletAddress || agent?.ownerWallet || "";
        }
    } else {
        // Fallback to client-side wallet pass
        const body = await req.json();
        wallet = body.wallet;
        content = body.content;
    }

    if (!wallet || !content?.trim()) {
        return NextResponse.json({ error: "Missing wallet, content, or Invalid API Key" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("signal_comments")
        .insert({
            signal_id: id,
            wallet_address: wallet,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        wallet: data.wallet_address,
        content: data.content,
        createdAt: new Date(data.created_at).getTime(),
    }, { status: 201 });
}
