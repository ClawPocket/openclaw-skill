import { supabaseAdmin } from "./supabase";
import { AgentListing, Signal, Subscription } from "./types";

// ── Helpers: Convert between Supabase snake_case and app camelCase ──

function toAgent(row: any): AgentListing {
    return {
        id: row.id,
        ownerWallet: row.owner_wallet,
        name: row.name,
        handle: row.handle,
        persona: row.persona,
        description: row.description,
        signalPriceUsdc: row.signal_price_usdc,
        walletAddress: row.wallet_address,
        totalTrades: row.total_trades,
        roiPct: row.roi_pct,
        subscribers: row.subscribers || [],
        avatar: row.avatar,
        color: row.color,
        createdAt: new Date(row.created_at).getTime(),
        backendAgentId: row.backend_agent_id || undefined,
    };
}

function toSignal(row: any): Signal {
    return {
        id: row.id,
        agentId: row.agent_id,
        action: row.action,
        tokenSymbol: row.token_symbol,
        amount: row.amount,
        reason: row.reason,
        txHash: row.tx_hash || undefined,
        createdAt: new Date(row.created_at).getTime(),
        priceUsdc: row.price_usdc ? parseFloat(row.price_usdc) : undefined,
        pnlPct: row.pnl_pct ? parseFloat(row.pnl_pct) : undefined,
    };
}

function toSubscription(row: any): Subscription {
    return {
        id: row.id,
        subscriberWallet: row.subscriber_wallet,
        agentId: row.agent_id,
        type: row.type,
        active: row.active,
        createdAt: new Date(row.created_at).getTime(),
        subscriberAgentId: row.subscriber_agent_id || undefined,
    };
}

// ── Agents ──

export async function getAgents(): Promise<AgentListing[]> {
    const { data, error } = await supabaseAdmin
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getAgents error:", error);
        return [];
    }
    return (data || []).map(toAgent);
}

// Helper to check if string is UUID
function isUUID(str: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function getAgent(idOrHandle: string): Promise<AgentListing | undefined> {
    let query = supabaseAdmin.from("agents").select("*");

    if (isUUID(idOrHandle)) {
        query = query.eq("id", idOrHandle);
    } else {
        // Assume handle — ensure it starts with @
        const handle = idOrHandle.startsWith("@") ? idOrHandle : `@${idOrHandle}`;
        query = query.eq("handle", handle);
    }

    const { data, error } = await query.single();

    if (error || !data) return undefined;
    return toAgent(data);
}

export async function saveAgent(agent: AgentListing): Promise<void> {
    const row = {
        id: agent.id,
        owner_wallet: agent.ownerWallet,
        name: agent.name,
        handle: agent.handle,
        persona: agent.persona,
        description: agent.description,
        signal_price_usdc: agent.signalPriceUsdc,
        wallet_address: agent.walletAddress,
        total_trades: agent.totalTrades,
        roi_pct: agent.roiPct,
        subscribers: agent.subscribers,
        avatar: agent.avatar,
        color: agent.color,
        backend_agent_id: agent.backendAgentId || null,
        created_at: new Date(agent.createdAt).toISOString(),
    };

    const { error } = await supabaseAdmin
        .from("agents")
        .upsert(row, { onConflict: "id" });

    if (error) console.error("saveAgent error:", error);
}

// ── Signals ──

export async function getSignals(agentId?: string): Promise<Signal[]> {
    let query = supabaseAdmin
        .from("signals")
        .select("*")
        .order("created_at", { ascending: false });

    if (agentId) {
        query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("getSignals error:", error);
        return [];
    }
    return (data || []).map(toSignal);
}

export async function addSignal(signal: Signal): Promise<void> {
    const row = {
        id: signal.id,
        agent_id: signal.agentId,
        action: signal.action,
        token_symbol: signal.tokenSymbol,
        amount: signal.amount,
        reason: signal.reason,
        tx_hash: signal.txHash || null,
        created_at: new Date(signal.createdAt).toISOString(),
    };

    const { error } = await supabaseAdmin.from("signals").insert(row);
    if (error) console.error("addSignal error:", error);
}

// ── Subscriptions ──

export async function getSubscriptions(agentId?: string): Promise<Subscription[]> {
    let query = supabaseAdmin
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

    if (agentId) {
        query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("getSubscriptions error:", error);
        return [];
    }
    return (data || []).map(toSubscription);
}

export async function addSubscription(sub: Subscription): Promise<void> {
    const row = {
        id: sub.id,
        subscriber_wallet: sub.subscriberWallet,
        agent_id: sub.agentId,
        type: sub.type,
        active: sub.active,
        created_at: new Date(sub.createdAt).toISOString(),
        subscriber_agent_id: sub.subscriberAgentId || null,
    };

    const { error } = await supabaseAdmin.from("subscriptions").upsert(row);
    if (error) console.error("addSubscription error:", error);
}
