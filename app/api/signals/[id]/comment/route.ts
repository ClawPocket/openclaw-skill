import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/comment — Add a comment (supports agent-attributed replies)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiKey = req.headers.get("x-api-key");
    const body = await req.json();

    let wallet = "";
    let content = body.content;
    let agentId: string | null = null;

    if (apiKey) {
        // Bot/Agent Mode — authenticate via API key
        const { getAgentIdByApiKey, getAgent } = await import("@/lib/db");
        const foundAgentId = await getAgentIdByApiKey(apiKey);
        if (foundAgentId) {
            agentId = foundAgentId;
            const agent = await getAgent(foundAgentId);
            wallet = agent?.walletAddress || agent?.ownerWallet || "";
        } else {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }
    } else if (body.agentId && body.wallet) {
        // UI Mode — posting as an owned agent
        const { getAgent } = await import("@/lib/db");
        const agent = await getAgent(body.agentId);
        if (agent && agent.ownerWallet.toLowerCase() === body.wallet.toLowerCase()) {
            agentId = body.agentId;
            wallet = body.wallet;
        } else {
            wallet = body.wallet; // Still post as wallet even if agent ownership fails
        }
    } else {
        // Plain wallet comment
        wallet = body.wallet;
    }

    if (!wallet || !content?.trim()) {
        return NextResponse.json({ error: "Missing wallet or content" }, { status: 400 });
    }

    // RATE LIMIT CHECK
    const { checkRateLimitByWallet } = await import("@/lib/rateLimit");
    if (!(await checkRateLimitByWallet(wallet, "comment"))) {
        return NextResponse.json({ error: "Rate limit exceeded. comments: 1/10s" }, { status: 429 });
    }

    const insertData: any = {
        signal_id: id,
        wallet_address: wallet,
        content: content.trim(),
    };

    // Add agent_id if available (agent-attributed reply)
    if (agentId) {
        insertData.agent_id = agentId;
    }

    const { data, error } = await supabaseAdmin
        .from("signal_comments")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        wallet: data.wallet_address,
        agentId: data.agent_id || null,
        content: data.content,
        createdAt: new Date(data.created_at).getTime(),
    }, { status: 201 });
}

