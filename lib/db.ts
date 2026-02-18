import { supabaseAdmin } from "./supabase";
import { AgentListing, Signal, Subscription, Rental } from "./types";

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
        type: (row.type as "clawpocket" | "openclaw" | "zeptoclaw") || "clawpocket",
        // Profile Enhancements
        skills: row.skills || [],
        externalLinks: row.external_links || {},
        bio: row.bio || "",
        // x402 Agent Commerce
        rentalPriceUsdc: row.rental_price_usdc || "5.00",
        x402Enabled: row.x402_enabled || false,
    };
}

function toRental(row: any): Rental {
    return {
        id: row.id,
        renterWallet: row.renter_wallet,
        agentId: row.agent_id,
        tier: row.tier,
        paymentTxHash: row.payment_tx_hash,
        startsAt: new Date(row.starts_at).getTime(),
        expiresAt: new Date(row.expires_at).getTime(),
        active: row.active,
        createdAt: new Date(row.created_at).getTime(),
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
        isPremium: row.is_premium || false,
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
        paymentTxHash: row.payment_tx_hash || undefined,
        subscriberAgentId: row.subscriber_agent_id || undefined,
    };
}

// ... (getSubscriptionByTxHash) ...

export async function getSubscriptionByTxHash(txHash: string): Promise<Subscription | undefined> {
    const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("payment_tx_hash", txHash)
        .single();

    if (error || !data) return undefined;
    return toSubscription(data);
}

// ... (addSubscription) ...

export async function addSubscription(sub: Subscription): Promise<void> {
    const row = {
        id: sub.id,
        subscriber_wallet: sub.subscriberWallet,
        agent_id: sub.agentId,
        type: sub.type,
        active: sub.active,
        created_at: new Date(sub.createdAt).toISOString(),
        payment_tx_hash: sub.paymentTxHash || null,
        subscriber_agent_id: sub.subscriberAgentId || null,
    };

    const { error } = await supabaseAdmin.from("subscriptions").upsert(row);
    if (error) console.error("addSubscription error:", error);
}

// ── Agents ──

export async function getAgents(limit: number = 100, offset: number = 0): Promise<AgentListing[]> {
    const { data, error } = await supabaseAdmin
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

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
        api_key: agent.apiKey || null, // Persist API key
        type: agent.type || "clawpocket",
        // Profile Enhancements
        skills: agent.skills || [],
        external_links: agent.externalLinks || {},
        bio: agent.bio || "",
        created_at: new Date(agent.createdAt).toISOString(),
        // x402 Agent Commerce
        rental_price_usdc: agent.rentalPriceUsdc || "5.00",
        x402_enabled: agent.x402Enabled || false,
    };

    const { error } = await supabaseAdmin
        .from("agents")
        .upsert(row, { onConflict: "id" });

    if (error) console.error("saveAgent error:", error);
}

export async function updateAgent(agent: AgentListing): Promise<void> {
    const row: any = {
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
        type: agent.type || "clawpocket",
        created_at: new Date(agent.createdAt).toISOString(),
        // x402 Agent Commerce
        rental_price_usdc: agent.rentalPriceUsdc || "5.00",
        x402_enabled: agent.x402Enabled || false,
    };

    // Only update API key if explicitly provided (prevents wiping it since getAgents() doesn't return it)
    if (agent.apiKey !== undefined) {
        row.api_key = agent.apiKey;
    }

    const { error } = await supabaseAdmin
        .from("agents")
        .update(row)
        .eq("id", agent.id);

    if (error) console.error("updateAgent error:", error);
}

export async function deleteAgent(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from("agents")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("deleteAgent error:", error);
        return false;
    }
    return true;
}

export async function getAgentIdByApiKey(apiKey: string): Promise<string | undefined> {
    const { data, error } = await supabaseAdmin
        .from("agents")
        .select("id")
        .eq("api_key", apiKey)
        .single();

    if (error || !data) return undefined;
    return data.id;
}

export async function getAgentApiKey(agentId: string): Promise<string | undefined> {
    const { data, error } = await supabaseAdmin
        .from("agents")
        .select("api_key")
        .eq("id", agentId)
        .single();

    if (error || !data) return undefined;
    return data.api_key;
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

// ── Rentals (x402 Agent Commerce) ──

export async function addRental(rental: Rental): Promise<void> {
    const row = {
        id: rental.id,
        renter_wallet: rental.renterWallet,
        agent_id: rental.agentId,
        tier: rental.tier,
        payment_tx_hash: rental.paymentTxHash,
        starts_at: new Date(rental.startsAt).toISOString(),
        expires_at: new Date(rental.expiresAt).toISOString(),
        active: rental.active,
        created_at: new Date(rental.createdAt).toISOString(),
    };

    const { error } = await supabaseAdmin.from("rentals").insert(row);
    if (error) console.error("addRental error:", error);
}

export async function getActiveRental(
    agentId: string,
    wallet: string
): Promise<Rental | undefined> {
    const { data, error } = await supabaseAdmin
        .from("rentals")
        .select("*")
        .eq("agent_id", agentId)
        .eq("renter_wallet", wallet.toLowerCase())
        .eq("active", true)
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return undefined;
    return toRental(data);
}

export async function getRentals(agentId: string): Promise<Rental[]> {
    const { data, error } = await supabaseAdmin
        .from("rentals")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getRentals error:", error);
        return [];
    }
    return (data || []).map(toRental);
}

export async function getRentalByTxHash(txHash: string): Promise<Rental | undefined> {
    const { data, error } = await supabaseAdmin
        .from("rentals")
        .select("*")
        .eq("payment_tx_hash", txHash)
        .single();

    if (error || !data) return undefined;
    return toRental(data);
}

/**
 * Check if a wallet has active access to an agent (via subscription OR rental).
 * Used to gate AgentBrain, premium signals, etc.
 */
export async function hasActiveAccess(
    agentId: string,
    wallet: string
): Promise<{ hasAccess: boolean; via: "owner" | "subscription" | "rental" | "none"; expiresAt?: number }> {
    // 1. Check subscription (permanent access)
    const { data: subData } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("agent_id", agentId)
        .eq("subscriber_wallet", wallet.toLowerCase())
        .eq("active", true)
        .limit(1);

    if (subData && subData.length > 0) {
        return { hasAccess: true, via: "subscription" };
    }

    // 2. Check active rental (time-bound access)
    const rental = await getActiveRental(agentId, wallet);
    if (rental) {
        return { hasAccess: true, via: "rental", expiresAt: rental.expiresAt };
    }

    return { hasAccess: false, via: "none" };
}

