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
    const { message, wallet } = body;

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    // Check access (Owner or Rental/Sub)
    const isOwner = agent.ownerWallet.toLowerCase() === wallet.toLowerCase();
    if (!isOwner) {
        const { hasActiveAccess } = await import("@/lib/db");
        const access = await hasActiveAccess(id, wallet);
        if (!access.hasAccess) {
            return NextResponse.json({ error: "Access denied. Rent this agent to use its brain." }, { status: 403 });
        }
    }


    // Use the agent's backendId if stored, otherwise use the local id
    const backendId = (agent as any).backendAgentId || id;
    let thought = await triggerAgentThink(backendId, message);

    // If agent not found on backend (likely due to server restart/wipe), try to restore it
    if (thought.includes("404") || thought.includes("Not Found") || thought.includes("Agent not found")) {
        console.log(`⚠️ Agent ${backendId} not found on backend. Attempting to restore...`);
        const { createBackendAgent } = await import("@/lib/backendClient");
        const restored = await createBackendAgent({
            name: agent.name,
            persona: agent.persona,
            risk: agent.persona === "trader" ? 60 : agent.persona === "creator" ? 20 : 40,
            id: backendId, // Restore with SAME ID
        });

        if (restored) {
            console.log(`✅ Agent ${backendId} restored. Retrying think...`);
            thought = await triggerAgentThink(backendId, message);
        } else {
            thought = "Error: Agent could not be restored on backend.";
        }
    }

    return NextResponse.json({ thought, agentId: id });
}
