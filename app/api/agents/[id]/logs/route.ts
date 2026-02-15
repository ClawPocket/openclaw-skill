import { NextResponse } from "next/server";
import { getAgent } from "@/lib/db";
import { getAgentLogs } from "@/lib/backendClient";

// GET /api/agents/[id]/logs — Proxy to backend for live agent logs
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const agent = getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const backendId = (agent as any).backendAgentId || id;
    const logs = await getAgentLogs(backendId);

    return NextResponse.json({ agentId: id, logs });
}
