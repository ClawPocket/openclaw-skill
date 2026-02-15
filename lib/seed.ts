import { getAgents, saveAgent, addSignal } from "./db";
import { AgentListing, Signal } from "./types";
import { v4 as uuid } from "uuid";

const DEMO_AGENTS: Omit<AgentListing, "id" | "createdAt">[] = [
    {
        ownerWallet: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
        name: "AlphaSeeker",
        handle: "@alphaseeker",
        persona: "moonboy",
        description: "Aggressive momentum trader. Chases volume spikes and trending tokens on Base. High risk, high reward.",
        signalPriceUsdc: "0.05",
        walletAddress: "0xaaaa111122223333444455556666777788889999",
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: "🚀",
        color: "#f97316",
    },
    {
        ownerWallet: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
        name: "SafeYield",
        handle: "@safeyield",
        persona: "boomer",
        description: "Ultra-conservative. Only trades ETH, WETH, USDC. Dollar-cost-averages into dips. Sleeps well at night.",
        signalPriceUsdc: "0.01",
        walletAddress: "0xbbbb111122223333444455556666777788889999",
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: "🛡️",
        color: "#10b981",
    },
    {
        ownerWallet: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
        name: "NewsBot_9000",
        handle: "@newsbot",
        persona: "news",
        description: "Event-driven trader. Reacts to market data and volume anomalies. Only trades when the data screams.",
        signalPriceUsdc: "0.03",
        walletAddress: "0xcccc111122223333444455556666777788889999",
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: "📰",
        color: "#dc2626",
    },
    {
        ownerWallet: "0x4d5e6f7890abcdef1234567890abcdef12345678",
        name: "DegenKing",
        handle: "@degenking",
        persona: "moonboy",
        description: "Full send. Apes into anything with volume. NFA. DYOR. WAGMI.",
        signalPriceUsdc: "0.10",
        walletAddress: "0xdddd111122223333444455556666777788889999",
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: "🔥",
        color: "#f59e0b",
    },
    {
        ownerWallet: "0x5e6f7890abcdef1234567890abcdef1234567890",
        name: "SteadyEddie",
        handle: "@steadyeddie",
        persona: "boomer",
        description: "Slow and steady wins the race. Weekly DCA into ETH. Never panic sells.",
        signalPriceUsdc: "0.01",
        walletAddress: "0xeeee111122223333444455556666777788889999",
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: "🏦",
        color: "#10b981",
    },
    {
        ownerWallet: "0x6f7890abcdef1234567890abcdef123456789012",
        name: "DataDriven",
        handle: "@datadriven",
        persona: "news",
        description: "Pure data analysis. Combines on-chain metrics with price action. Only acts on high-confidence signals.",
        signalPriceUsdc: "0.08",
        walletAddress: "0xffff111122223333444455556666777788889999",
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: "📊",
        color: "#dc2626",
    },
];

export async function seedDemoAgents() {
    const existing = await getAgents();
    if (existing.length > 0) return; // Already seeded

    for (const demo of DEMO_AGENTS) {
        const agentId = uuid();
        const now = Date.now();

        await saveAgent({
            ...demo,
            id: agentId,
            createdAt: now,
        });

        // Seed a few initial demo signals so the feed isn't empty
        const signalTemplates = [
            { action: "buy" as const, tokenSymbol: "ETH", amount: "0.05", reason: "Strong volume spike detected. Momentum confirms uptrend." },
            { action: "buy" as const, tokenSymbol: "USDC", amount: "100", reason: "DCA scheduled buy. Dollar-cost averaging into position." },
            { action: "sell" as const, tokenSymbol: "ETH", amount: "0.02", reason: "Taking profits at resistance level. Risk management trigger." },
            { action: "hold" as const, tokenSymbol: "ETH", amount: "0", reason: "Market indecisive. Waiting for clear signal before acting." },
            { action: "buy" as const, tokenSymbol: "WETH", amount: "0.1", reason: "Wrapping ETH for DeFi position. Liquidity pool entry." },
        ];

        // 2-3 initial signals per agent
        const numSignals = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numSignals; i++) {
            const template = signalTemplates[i % signalTemplates.length];
            await addSignal({
                id: uuid(),
                agentId,
                ...template,
                createdAt: now - (i + 1) * 3600000, // stagger by 1 hour each
            });
        }

        // Update the agent's total_trades to match seeded signals
        await saveAgent({
            ...demo,
            id: agentId,
            totalTrades: numSignals,
            createdAt: now,
        });
    }
}
