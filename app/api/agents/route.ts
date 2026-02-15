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

export async function GET() {
    const agents = await getAgents();
    return NextResponse.json(agents);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, handle, persona, description, signalPriceUsdc, ownerWallet } = body;

    if (!name || !handle || !persona || !ownerWallet) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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

    // Create backend AI agent (non-blocking — if it fails, listing still works)
    let backendAgentId: string | undefined;
    try {
        const backendAgent = await createBackendAgent({
            name,
            persona,
            risk: persona === "moonboy" ? 75 : persona === "boomer" ? 15 : 40,
        });
        if (backendAgent) {
            backendAgentId = backendAgent.id;
            console.log(`Backend agent created: ${backendAgentId}`);
        }
    } catch (err) {
        console.warn("Backend agent creation failed (non-fatal):", err);
    }

    const agent: AgentListing = {
        id: uuid(),
        ownerWallet,
        name,
        handle,
        persona: persona || "custom",
        description: description || "",
        signalPriceUsdc: signalPriceUsdc || "0.01",
        walletAddress: `0x${uuid().replace(/-/g, "").slice(0, 40)}`,
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: AVATARS[persona] || "⚡",
        color: COLORS[persona] || "#f59e0b",
        createdAt: Date.now(),
        backendAgentId,
    };

    await saveAgent(agent);
    return NextResponse.json(agent, { status: 201 });
}
