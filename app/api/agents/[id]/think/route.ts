import { NextResponse } from "next/server";
import { getAgent } from "@/lib/db";
import { triggerAgentThink } from "@/lib/backendClient";

// POST /api/agents/[id]/think — Proxy to backend AI agent
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await req.json();
    const { message } = body;

    // Use the agent's backendId if stored, otherwise use the local id
    const backendId = (agent as any).backendAgentId || id;
    const thought = await triggerAgentThink(backendId, message);

    return NextResponse.json({ thought, agentId: id });
}
