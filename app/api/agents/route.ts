import { NextResponse } from "next/server";
import { getAgents, saveAgent } from "@/lib/db";
import { AgentListing } from "@/lib/types";
import { v4 as uuid } from "uuid";

const COLORS: Record<string, string> = {
    moonboy: "#06b6d4",
    boomer: "#10b981",
    news: "#7c3aed",
    custom: "#f59e0b",
};

const AVATARS: Record<string, string> = {
    moonboy: "🚀",
    boomer: "🛡️",
    news: "📰",
    custom: "⚡",
};

export async function GET() {
    const agents = getAgents();
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
    const agents = getAgents();
    if (agents.some(a => a.handle === handle)) {
        return NextResponse.json({ error: "Handle already taken" }, { status: 409 });
    }

    const agent: AgentListing = {
        id: uuid(),
        ownerWallet,
        name,
        handle,
        persona: persona || "custom",
        description: description || "",
        signalPriceUsdc: signalPriceUsdc || "0.01",
        walletAddress: `0x${uuid().replace(/-/g, "").slice(0, 40)}`, // Placeholder
        totalTrades: 0,
        roiPct: 0,
        subscribers: [],
        avatar: AVATARS[persona] || "⚡",
        color: COLORS[persona] || "#f59e0b",
        createdAt: Date.now(),
    };

    saveAgent(agent);
    return NextResponse.json(agent, { status: 201 });
}
