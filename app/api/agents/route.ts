import { NextResponse } from "next/server";
import { getAgents, saveAgent } from "@/lib/db";
import { AgentListing } from "@/lib/types";
import { v4 as uuid } from "uuid";
import { createBackendAgent } from "@/lib/backendClient";

const PERSONA_COLORS: Record<string, string> = {
    creator: "#ec4899", // pink-500
    developer: "#3b82f6", // blue-500
    trader: "#10b981", // emerald-500
    custom: "#6366f1", // indigo-500
};

const PERSONA_AVATARS: Record<string, string> = {
    creator: "✨",
    developer: "⚡",
    trader: "📈",
    custom: "🤖",
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
    const { name, handle, persona, description, signalPriceUsdc, weeklyPriceUsdc, monthlyPriceUsdc, rentalPriceUsdc, ownerWallet, avatar, customPrompt } = body;

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
    if (parseFloat(signalPriceUsdc) < 0 || (rentalPriceUsdc && parseFloat(rentalPriceUsdc) < 0)) {
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

    const newAgentId = uuid(); // Generate ID early for backend agent creation

    if (agentType === "clawpocket") {
        try {
            const systemPrompt =
                customPrompt ||
                `You are ${name} (@${handle}), a specialized AI ${persona} on ClawPocket Marketplace.
${description}
Respond to think/trade requests appropriately for your persona.`;

            // Setup the backend agent
            const backendAgent = await createBackendAgent({
                id: newAgentId,
                name,
                persona,
                customPrompt: systemPrompt,
                risk: persona === "trader" ? 60 : persona === "creator" ? 20 : 40,
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
        id: newAgentId,
        ownerWallet,
        name,
        handle,
        description: description || "",
        persona: persona || "custom",
        signalPriceUsdc: signalPriceUsdc || "0.01",
        weeklyPriceUsdc: weeklyPriceUsdc || "0.05",
        monthlyPriceUsdc: monthlyPriceUsdc || "0.20",
        walletAddress: agentWalletAddress,
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: avatar || PERSONA_AVATARS[persona] || "⚡",
        color: PERSONA_COLORS[persona] || "#f59e0b",
        createdAt: Date.now(),
        backendAgentId,
        apiKey: uuid(), // Generate secret key for remote webhook
        type: agentType,
        rentalPriceUsdc: rentalPriceUsdc || "5.00",
    };

    await saveAgent(agent);

    // Strip sensitive fields before returning
    const { apiKey: _apiKey, ...safeAgent } = agent;
    return NextResponse.json(safeAgent, { status: 201 });
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
            color: (persona && PERSONA_COLORS[persona]) || existing.color, // Auto-update color if persona changes
        };

        await updateAgent(updatedAgent);

        console.log(`🤖 Agent ${agentId} updated via API`);

        return NextResponse.json({ success: true, agent: updatedAgent });
    } catch (error) {
        console.error("Agent update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
