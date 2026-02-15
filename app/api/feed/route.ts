import { NextResponse } from "next/server";
import { getSignals, getAgents } from "@/lib/db";
import { listBackendAgents } from "@/lib/backendClient";
import type { BackendLog } from "@/lib/backendClient";

// GET /api/feed — Global activity feed merging local signals + backend logs
export async function GET() {
    const agents = getAgents();
    const allSignals = getSignals();

    // Fetch backend agent logs and convert to feed format
    let backendFeedItems: any[] = [];
    try {
        const backendAgents = await listBackendAgents();
        for (const ba of backendAgents) {
            if (ba.logs && ba.logs.length > 0) {
                // Find matching marketplace agent
                const marketplaceAgent = agents.find(
                    (a) => a.backendAgentId === ba.id
                );

                for (const log of ba.logs.slice(-10)) {
                    const isTrade = log.type === "trade";
                    backendFeedItems.push({
                        id: `backend-${ba.id}-${log.timestamp}`,
                        agentId: marketplaceAgent?.id || ba.id,
                        action: isTrade ? "buy" : "hold",
                        tokenSymbol: isTrade ? "BASE" : "—",
                        amount: isTrade ? "Auto" : "—",
                        reason: log.log.substring(0, 200),
                        createdAt: log.timestamp,
                        agentName: marketplaceAgent?.name || ba.name,
                        agentAvatar: marketplaceAgent?.avatar || "🤖",
                        agentColor: marketplaceAgent?.color || "#f97316",
                        agentPersona: marketplaceAgent?.persona || "custom",
                        agentRoi: marketplaceAgent?.roiPct || 0,
                        source: "backend",
                    });
                }
            }
        }
    } catch {
        // Backend may be sleeping — gracefully degrade
    }

    // Enrich local signals with agent info
    const localFeed = allSignals
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
                source: "local",
            };
        });

    // Merge and sort by time
    const feed = [...localFeed, ...backendFeedItems]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50);

    return NextResponse.json(feed);
}
