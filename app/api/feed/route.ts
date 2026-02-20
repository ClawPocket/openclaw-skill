import { NextResponse } from "next/server";
import { getSignals, getAgents, getHotSignals } from "@/lib/db";
import { listBackendAgents } from "@/lib/backendClient";
import { Signal } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FeedSignalInput = (Signal | Record<string, any>) & { [key: string]: any };

// GET /api/feed — Global activity feed merging local signals + backend logs
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "latest";

    const agents = await getAgents();
    let allSignals: FeedSignalInput[] = [];

    if (sort === "hot") {
        allSignals = await getHotSignals() as FeedSignalInput[];
    } else {
        allSignals = await getSignals() as FeedSignalInput[];
    }

    // Fetch backend agent logs and convert to feed format
    const backendFeedItems: Record<string, unknown>[] = [];
    try {
        const backendAgents = await listBackendAgents();
        for (const ba of backendAgents) {
            if (ba.logs && ba.logs.length > 0) {
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
            // Hot signals return pre-joined agent data. Local signals need linking.
            const agentId = signal.agentId || signal.agent_id;
            const agent = agents.find((a) => a.id === agentId);
            const isPremium = signal.isPremium || signal.is_premium;
            const action = signal.action;
            const tokenSymbol = signal.tokenSymbol || signal.token_symbol;
            const amount = signal.amount;
            const reason = signal.reason;
            const txHash = signal.txHash || signal.tx_hash;
            const pnlPct = signal.pnlPct || signal.pnl_pct;
            const priceUsdc = signal.priceUsdc || signal.price_usdc;
            const createdAt = signal.createdAt || new Date(signal.created_at).getTime();

            return {
                id: signal.id || signal.signal_id,
                agentId,
                action: isPremium ? "thought" : action,
                tokenSymbol: isPremium ? "???" : tokenSymbol,
                amount: isPremium ? "Hidden" : amount,
                reason: isPremium ? "🔒 Premium Signal - Unlock to view details" : reason,
                txHash: isPremium ? undefined : txHash,
                pnlPct,
                priceUsdc,
                createdAt,
                agentName: signal.agent_name || agent?.name || "Unknown",
                agentAvatar: signal.agent_avatar || agent?.avatar || "⚡",
                agentColor: signal.agent_color || agent?.color || "#f59e0b",
                agentPersona: signal.agent_persona || agent?.persona || "custom",
                agentRoi: agent?.roiPct || 0,
                // Hot algo fields
                score: signal.score || 0,
                likeCount: signal.like_count || 0,
                commentCount: signal.comment_count || 0,
                repostCount: signal.repost_count || 0,
                source: sort === "hot" ? "hot" : "local",
                isPremium,
            };
        });

    // Merge and sort
    const feed = [...localFeed, ...backendFeedItems];

    if (sort === "hot") {
        // Sort purely by the RPC's score
        feed.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
        // Sort by time
        feed.sort((a, b) => b.createdAt - a.createdAt);
    }

    return NextResponse.json(feed.slice(0, 50));
}
