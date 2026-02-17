import { NextResponse } from "next/server";
import { getAgents, saveAgent } from "@/lib/db";
import { AgentListing } from "@/lib/types";
import { v4 as uuid } from "uuid";
import { createBackendAgent } from "@/lib/backendClient";

const COLORS: Record<string, string> = {
    moonboy: "#f97316",
    boomer: "#10b981",
    news: "#dc2626",
    custom: "#f59e0b",
};

const AVATARS: Record<string, string> = {
    moonboy: "🚀",
    boomer: "🛡️",
    news: "📰",
    custom: "⚡",
};

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const query = searchParams.get("q");

    // Pagination (default: 100)
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let agents = await getAgents(limit, offset);

    if (owner) {
        agents = agents.filter(a => a.ownerWallet && a.ownerWallet.toLowerCase() === owner.toLowerCase());
    }

    if (query) {
        const lowerQ = query.toLowerCase();
        agents = agents.filter(a =>
            a.name.toLowerCase().includes(lowerQ) ||
            a.handle.toLowerCase().includes(lowerQ) ||
            a.persona.toLowerCase().includes(lowerQ)
        );
    }

    return NextResponse.json(agents);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, handle, persona, description, signalPriceUsdc, ownerWallet, avatar, customPrompt } = body;

    if (!name || !handle || !persona || !ownerWallet) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Rate Limit
    const { checkRateLimitByWallet } = await import("@/lib/rateLimit");
    const allowed = await checkRateLimitByWallet(ownerWallet, "create_agent");
    if (!allowed) {
        return NextResponse.json({ error: "Rate limit exceeded. You can create 1 agent every 5 minutes." }, { status: 429 });
    }

    // 2. Input Validation
    if (parseFloat(signalPriceUsdc) < 0) {
        return NextResponse.json({ error: "Price cannot be negative" }, { status: 400 });
    }
    if (description && description.length > 500) {
        return NextResponse.json({ error: "Description too long (max 500 chars)" }, { status: 400 });
    }

    // Validate handle format
    const handleRegex = /^@[a-z0-9._]{4,}$/;
    if (!handleRegex.test(handle)) {
        return NextResponse.json({
            error: "Handle must be at least 4 characters and contain only letters, numbers, '.', or '_'"
        }, { status: 400 });
    }

    // Check for duplicate handle
    const agents = await getAgents();
    if (agents.some(a => a.handle === handle)) {
        return NextResponse.json({ error: "Handle already taken" }, { status: 409 });
    }

    // Create backend AI agent (ONLY for official "clawpocket" agents)
    let backendAgentId: string | undefined;
    let agentWalletAddress: string = ownerWallet; // Default to owner's wallet (safe fallback)
    const agentType = body.type || "clawpocket";

    if (agentType === "clawpocket") {
        try {
            const backendAgent = await createBackendAgent({
                name,
                persona,
                risk: persona === "moonboy" ? 75 : persona === "boomer" ? 15 : 40,
                customPrompt: persona === "custom" ? customPrompt : undefined,
            });
            if (backendAgent) {
                backendAgentId = backendAgent.id;
                // Use real CDP wallet if the backend returned one
                if (backendAgent.walletAddress && backendAgent.walletAddress !== "unknown") {
                    agentWalletAddress = backendAgent.walletAddress;
                }
                console.log(`Backend agent created: ${backendAgentId}, wallet: ${agentWalletAddress}`);
            }
        } catch (err) {
            console.warn("Backend agent creation failed (non-fatal):", err);
        }
    } else {
        // For external agents (ZeptoClaw/OpenClaw), use a placeholder or the owner's wallet
        // In the future, they might publish their own wallet address via API
        console.log(`Creating external agent (${agentType}): ${name}`);
    }

    const agent: AgentListing = {
        id: uuid(),
        ownerWallet,
        name,
        handle,
        persona: persona || "custom",
        description: description || "",
        signalPriceUsdc: signalPriceUsdc || "0.01",
        walletAddress: agentWalletAddress,
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: avatar || AVATARS[persona] || "⚡",
        color: COLORS[persona] || "#f59e0b",
        createdAt: Date.now(),
        backendAgentId,
        apiKey: uuid(), // Generate secret key for remote webhook
        type: agentType,
    };

    await saveAgent(agent);
    return NextResponse.json(agent, { status: 201 });
}

export async function PATCH(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        const { getAgentIdByApiKey, updateAgent } = await import("@/lib/db");
        const agentId = await getAgentIdByApiKey(apiKey);

        if (!agentId) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, avatar, persona, signalPriceUsdc } = body;

        // Fetch existing to validate ownership (implicit via API key)
        const agents = await getAgents();
        const existing = agents.find((a) => a.id === agentId);

        if (!existing) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Merge updates
        const updatedAgent: AgentListing = {
            ...existing,
            name: name || existing.name,
            description: description || existing.description,
            avatar: avatar || existing.avatar,
            persona: persona || existing.persona,
            signalPriceUsdc: signalPriceUsdc || existing.signalPriceUsdc,
            color: (persona && COLORS[persona]) || existing.color, // Auto-update color if persona changes
        };

        await updateAgent(updatedAgent);

        console.log(`🤖 Agent ${agentId} updated via API`);

        return NextResponse.json({ success: true, agent: updatedAgent });
    } catch (error) {
        console.error("Agent update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
