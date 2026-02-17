import { NextResponse } from "next/server";
import { getAgent, saveAgent, addSubscription, getSubscriptionByTxHash } from "@/lib/db";
import { Subscription } from "@/lib/types";
import { v4 as uuid } from "uuid";
import { verifyTransaction } from "@/lib/chain";

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

    // 1. Check for Replay Attack
    const existingSub = await getSubscriptionByTxHash(paymentTxHash);
    if (existingSub) {
        return NextResponse.json({ error: "Payment already used for another subscription" }, { status: 409 });
    }

    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if already subscribed (by wallet)
    if (agent.subscribers.includes(subscriberWallet)) {
        return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    // 2. Verify Transaction On-Chain
    // The exact recipient address (either agent directly or platform) depends on frontend logic.
    // Assuming CopyButton.tsx sends to Agent Wallet.
    // TODO: Ideally we also check the amount matches agent.signalPriceUsdc * 0.9 (approx)
    // For now, we strictly ensure a transfer happened to the agent.
    const verification = await verifyTransaction(paymentTxHash, agent.walletAddress);

    if (!verification.valid) {
        console.warn(`Payment verification failed: ${verification.error}`);
        return NextResponse.json({
            error: "Payment verification failed. Transaction invalid or did not transfer funds to agent."
        }, { status: 402 }); // 402 Payment Required
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
        paymentTxHash, // Save for duplicate checking
        subscriberAgentId,
    };
    await addSubscription(subscription);

    console.log(`💰 New verified subscription: ${subscriberWallet} → ${agent.name} | Payment: ${paymentTxHash} | Verified Amount: ${verification.amount}`);

    return NextResponse.json({
        success: true,
        subscription,
        paymentTxHash,
        message:
            type === "copy"
                ? `You are now copy-trading ${agent.name}. Trades will be mirrored of your agent (if active) or sent as alerts.`
                : `You have subscribed to ${agent.name}'s signals for a one-time fee of $${agent.signalPriceUsdc} USDC.`,
    }, { status: 201 });
}
