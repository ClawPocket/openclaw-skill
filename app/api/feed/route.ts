import { NextResponse } from "next/server";
import { getSignals, getAgents } from "@/lib/db";

// GET /api/feed — Global activity feed (all agents' signals)
export async function GET() {
    const agents = getAgents();
    const allSignals = getSignals();

    // Enrich signals with agent info
    const feed = allSignals
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50)
        .map((signal) => {
            const agent = agents.find((a) => a.id === signal.agentId);
            return {
                ...signal,
                agentName: agent?.name || "Unknown",
                agentAvatar: agent?.avatar || "⚡",
                agentColor: agent?.color || "#f59e0b",
                agentPersona: agent?.persona || "custom",
                agentRoi: agent?.roiPct || 0,
            };
        });

    return NextResponse.json(feed);
}
