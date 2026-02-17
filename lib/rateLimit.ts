import { supabaseAdmin } from "./supabase";

type ActionType = "signal" | "comment" | "like" | "create_agent";

const LIMITS: Record<ActionType, number> = {
    signal: 60, // 1 signal per minute per agent
    comment: 10, // 1 comment per 10s
    like: 2,     // 1 like per 2s
    create_agent: 300, // 1 agent per 5 minutes
};

export async function checkRateLimit(agentId: string, type: ActionType): Promise<{ allowed: boolean; retryAfter?: number }> {
    const limitSec = LIMITS[type];
    const now = Date.now();
    const threshold = new Date(now - limitSec * 1000).toISOString();

    let table = "";
    let timeCol = "created_at";

    switch (type) {
        case "signal":
            table = "signals";
            break;
        case "comment":
            table = "signal_comments";
            break;
        case "like":
            table = "signal_likes"; // Likes might not have created_at in some schemas, but usually do.
            // If likes are toggles, this check might strictly prevent rapid toggling, which is good.
            break;
    }

    // Check for "signal_likes" schema specifically if needed, but assuming standard created_at
    // Actually, likes are often DELETE/INSERT. 
    // For likes, we might just query the LAST insert.
    // If we just deleted it, we can re-like immediately? 
    // Let's stick to the simplest query: "Did this agent perform this action recently?"

    // For likes, the wallet address is usually the identifier in public API, 
    // but for Bots (x-api-key), we resolve to Agent ID -> Wallet.
    // However, the DB tables store `wallet_address`, not `agent_id` for comments/likes.
    // We need to resolve Agent ID -> Wallet first. 
    // But the caller usually has the wallet. 
    // Let's change signature to accept `walletAddress` for comment/like.

    return { allowed: true };
}

// Revised signature to handle both Agent ID (for signals) and Wallet (for social)
export async function checkRateLimitByWallet(wallet: string, type: ActionType): Promise<boolean> {
    const limitSec = LIMITS[type];
    const threshold = new Date(Date.now() - limitSec * 1000).toISOString();

    if (type === "signal") return true; // Signals use checkSignalRateLimit (by Agent ID)

    if (type === "create_agent") {
        const { data, error } = await supabaseAdmin
            .from("agents")
            .select("created_at")
            .eq("owner_wallet", wallet)
            .gt("created_at", threshold)
            .limit(1); // Strict: 1 per 5 mins

        if (error) {
            console.error("Rate limit check failed:", error);
            return true;
        }
        return data ? data.length === 0 : true;
    }

    // For comment/like
    let table = "";
    if (type === "comment") table = "signal_comments";
    else if (type === "like") table = "signal_likes";
    else return true;

    const { data, error } = await supabaseAdmin
        .from(table)
        .select("created_at")
        .eq("wallet_address", wallet)
        .gt("created_at", threshold)
        .limit(1);

    if (error) {
        console.error("Rate limit check failed:", error);
        return true; // Fail open
    }

    return data ? data.length === 0 : true;
}

export async function checkSignalRateLimit(agentId: string): Promise<boolean> {
    const limitSec = LIMITS.signal;
    const threshold = new Date(Date.now() - limitSec * 1000).toISOString();

    const { data, error } = await supabaseAdmin
        .from("signals")
        .select("created_at")
        .eq("agent_id", agentId)
        .gt("created_at", threshold)
        .limit(1);

    if (error) return true;
    return data.length === 0;
}
