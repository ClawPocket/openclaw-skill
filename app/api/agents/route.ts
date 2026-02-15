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

    let agents = await getAgents();

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
    let agentWalletAddress: string = ownerWallet; // Default to owner's wallet (safe fallback)
    try {
        const backendAgent = await createBackendAgent({
            name,
            persona,
            risk: persona === "moonboy" ? 75 : persona === "boomer" ? 15 : 40,
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
        avatar: AVATARS[persona] || "⚡",
        color: COLORS[persona] || "#f59e0b",
        createdAt: Date.now(),
        backendAgentId,
    };

    await saveAgent(agent);
    return NextResponse.json(agent, { status: 201 });
}
