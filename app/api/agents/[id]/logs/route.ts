import { NextResponse } from "next/server";
import { getAgent } from "@/lib/db";
import { getAgentLogs } from "@/lib/backendClient";

// GET /api/agents/[id]/logs — Proxy to backend for live agent logs
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(_req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
    }

    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check access (Owner or Rental/Sub)
    const isOwner = agent.ownerWallet.toLowerCase() === wallet.toLowerCase();
    if (!isOwner) {
        const { hasActiveAccess } = await import("@/lib/db");
        const access = await hasActiveAccess(id, wallet);
        if (!access.hasAccess) {
            return NextResponse.json({ error: "Access denied. Rent this agent to view logs." }, { status: 403 });
        }
    }

    const backendId = (agent as any).backendAgentId || id;
    const logs = await getAgentLogs(backendId);

    return NextResponse.json({ agentId: id, logs });
}
