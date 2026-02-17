import { NextResponse } from "next/server";
import { getAgent, saveAgent, addSubscription } from "@/lib/db";
import { Subscription } from "@/lib/types";
import { v4 as uuid } from "uuid";

// POST /api/agents/[id]/copy
// Subscribe to copy an agent's trades (requires USDC payment)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const { subscriberWallet, type = "signal", paymentTxHash, subscriberAgentId } = body;

    if (!subscriberWallet) {
        return NextResponse.json({ error: "Missing subscriberWallet" }, { status: 400 });
    }

    if (!paymentTxHash) {
        return NextResponse.json({ error: "Payment required. Submit USDC payment first." }, { status: 402 });
    }

    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if already subscribed (by wallet)
    if (agent.subscribers.includes(subscriberWallet)) {
        return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    // Add subscriber to agent
    agent.subscribers.push(subscriberWallet);
    await saveAgent(agent);

    // Create subscription record with payment reference
    const subscription: Subscription = {
        id: uuid(),
        subscriberWallet,
        agentId: id,
        type: type as "signal" | "copy",
        active: true,
        createdAt: Date.now(),
        subscriberAgentId,
    };
    await addSubscription(subscription);

    console.log(`💰 New subscription: ${subscriberWallet} → ${agent.name} | Payment: ${paymentTxHash}`);

    return NextResponse.json({
        success: true,
        subscription,
        paymentTxHash,
        message:
            type === "copy"
                ? `You are now copy-trading ${agent.name}. Trades will be mirrored to your wallet.`
                : `You have subscribed to ${agent.name}'s signals for a one-time fee of $${agent.signalPriceUsdc} USDC.`,
    }, { status: 201 });
}
