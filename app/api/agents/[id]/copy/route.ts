import { NextResponse } from "next/server";
import { getAgent, saveAgent, addSubscription } from "@/lib/db";
import { Subscription } from "@/lib/types";
import { v4 as uuid } from "uuid";

// POST /api/agents/[id]/copy
// Subscribe to copy an agent's trades
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const { subscriberWallet, type = "signal" } = body;

    if (!subscriberWallet) {
        return NextResponse.json({ error: "Missing subscriberWallet" }, { status: 400 });
    }

    const agent = getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if already subscribed
    if (agent.subscribers.includes(subscriberWallet)) {
        return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    // Add subscriber to agent
    agent.subscribers.push(subscriberWallet);
    saveAgent(agent);

    // Create subscription record
    const subscription: Subscription = {
        id: uuid(),
        subscriberWallet,
        agentId: id,
        type: type as "signal" | "copy",
        active: true,
        createdAt: Date.now(),
    };
    addSubscription(subscription);

    return NextResponse.json({
        success: true,
        subscription,
        message:
            type === "copy"
                ? `You are now copy-trading ${agent.name}. Trades will be mirrored to your wallet.`
                : `You are now subscribed to ${agent.name}'s signals at $${agent.signalPriceUsdc}/signal.`,
    }, { status: 201 });
}
