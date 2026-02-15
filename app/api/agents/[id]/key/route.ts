import { NextResponse } from "next/server";
import { getAgent, getAgentApiKey } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/agents/[id]/key
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const signature = searchParams.get("signature");
    const wallet = searchParams.get("wallet"); // The wallet requesting the key

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    // 1. Fetch Agent to check ownership
    // Note: In a real app, we must verify a cryptographic signature here to prove identity.
    // For this MVP, we will simpler check if the requested wallet matches the owner.
    // "signature" param is reserved for future implementation.

    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
        return NextResponse.json({ error: "Unauthorized: You are not the owner" }, { status: 403 });
    }

    // 2. Reveal Key
    const apiKey = await getAgentApiKey(agent.id);

    return NextResponse.json({ apiKey });
}
