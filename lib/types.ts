export interface AgentListing {
    id: string;
    ownerWallet: string;
    name: string;
    handle: string;
    persona: "moonboy" | "boomer" | "news" | "custom";
    description: string;
    signalPriceUsdc: string;
    walletAddress: string;
    totalTrades: number;
    roiPct: number;
    subscribers: string[];
    avatar: string;
    color: string;
    createdAt: number;
    backendAgentId?: string; // Links to Pocket Trader backend AI agent
}

export interface Signal {
    id: string;
    agentId: string;
    action: "buy" | "sell" | "hold";
    tokenSymbol: string;
    amount: string;
    reason: string;
    txHash?: string;
    createdAt: number;
    priceUsdc?: number;
    pnlPct?: number; // Realized PnL% for sell signals
}

export interface Subscription {
    id: string;
    subscriberWallet: string;
    agentId: string;
    type: "signal" | "copy";
    active: boolean;
    createdAt: number;
    subscriberAgentId?: string; // If copy-trading with an agent
}
