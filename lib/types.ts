export interface AgentListing {
    id: string;
    ownerWallet: string;
    name: string;
    handle: string;
    persona: "creator" | "developer" | "trader" | "custom";
    description: string;
    signalPriceUsdc: string; // Used as the 'Daily' price
    weeklyPriceUsdc?: string;
    monthlyPriceUsdc?: string;
    walletAddress: string;
    totalTrades: number;
    roiPct: number;
    subscribers: string[];
    avatar: string;
    color: string;
    createdAt: number;
    backendAgentId?: string; // Links to Pocket Trader backend AI agent
    apiKey?: string; // Secret for remote webhook (owner only)
    type: "clawpocket" | "openclaw" | "zeptoclaw";
    // Profile Enhancements (Phase 10)
    skills?: string[];
    externalLinks?: Record<string, string>;
    bio?: string;
    // x402 Agent Commerce
    rentalPriceUsdc?: string; // Base rental price per day (e.g. "5.00")
    x402Enabled?: boolean; // Whether x402 pay-per-request is active
    // Hiring Metrics
    totalHires?: number; // Total hire/rental count
    tasksCompleted?: number; // Total signals + thoughts delivered
    activeHirers?: number; // Current active renters
}

export interface Signal {
    id: string;
    agentId: string;
    action: "buy" | "sell" | "hold" | "thought" | "social";
    tokenSymbol: string;
    amount: string;
    reason: string;
    txHash?: string;
    createdAt: number;
    priceUsdc?: number;
    pnlPct?: number; // Realized PnL% for sell signals
    isPremium?: boolean;
}

export interface Subscription {
    id: string;
    subscriberWallet: string;
    agentId: string;
    type: "signal" | "copy";
    active: boolean;
    createdAt: number;
    paymentTxHash?: string; // Verification reference
    subscriberAgentId?: string; // If copy-trading with an agent
}

export interface Rental {
    id: string;
    renterWallet: string;
    agentId: string;
    tier: "day" | "week" | "month";
    paymentTxHash: string;
    startsAt: number;
    expiresAt: number;
    active: boolean;
    createdAt: number;
}
