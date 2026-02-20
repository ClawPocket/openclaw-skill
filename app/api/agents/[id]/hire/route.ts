import { NextResponse } from "next/server";
import { getAgent, addRental, getActiveRental } from "@/lib/db";
import { Rental } from "@/lib/types";
import { v4 as uuid } from "uuid";

// Tier durations in milliseconds
const TIER_DURATION: Record<string, number> = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
};

// Tier price multipliers (base = rental_price_usdc per day)
const TIER_MULTIPLIER: Record<string, number> = {
    day: 1,
    week: 5,   // ~29% discount vs 7 days
    month: 20, // ~33% discount vs 30 days
};

// POST /api/agents/[id]/hire
// Create a rental after x402 payment is verified by the middleware.
//
// The x402 middleware (middleware.ts) intercepts this route and:
//   1. Returns 402 + PAYMENT-REQUIRED if no payment signature is present
//   2. Verifies the payment via the Coinbase facilitator
//   3. Settles the payment on-chain
//   4. Only then forwards the request to this handler
//
// By the time this handler runs, payment has already been verified and settled.
// Both human browser wallets and AI agents (via AgentKit) can pay through
// the same x402 protocol.
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const { renterWallet, tier } = body;

    // ── Validation ──
    if (!renterWallet) {
        return NextResponse.json({ error: "Missing renterWallet" }, { status: 400 });
    }
    if (!tier || !TIER_DURATION[tier]) {
        return NextResponse.json({ error: "Invalid tier. Must be 'day', 'week', or 'month'." }, { status: 400 });
    }

    // ── Agent Lookup ──
    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Can't rent your own agent
    if (agent.ownerWallet.toLowerCase() === renterWallet.toLowerCase()) {
        return NextResponse.json({ error: "You already own this agent." }, { status: 400 });
    }

    // ── Check for existing active rental ──
    const existingRental = await getActiveRental(id, renterWallet);
    if (existingRental) {
        return NextResponse.json({
            error: "You already have an active rental for this agent.",
            rental: existingRental,
        }, { status: 409 });
    }

    // ── Expected price (for logging/reference) ──
    const basePricePerDay = parseFloat(agent.rentalPriceUsdc || "5.00");
    const expectedPrice = basePricePerDay * TIER_MULTIPLIER[tier];

    // ── Create Rental ──
    // Payment was already verified + settled by x402 middleware.
    // The facilitator ensures the USDC was transferred on-chain.
    const now = Date.now();
    const rental: Rental = {
        id: uuid(),
        renterWallet: renterWallet.toLowerCase(),
        agentId: id,
        tier: tier as "day" | "week" | "month",
        paymentTxHash: `x402-${now}`, // x402 settles via facilitator, not a direct user tx
        startsAt: now,
        expiresAt: now + TIER_DURATION[tier],
        active: true,
        createdAt: now,
    };

    await addRental(rental);

    console.log(`🔑 New x402 rental: ${renterWallet} → ${agent.name} | Tier: ${tier} | Price: $${expectedPrice} | Expires: ${new Date(rental.expiresAt).toISOString()}`);

    return NextResponse.json({
        success: true,
        rental,
        agent: {
            id: agent.id,
            name: agent.name,
            handle: agent.handle,
        },
        pricing: {
            tier,
            price: expectedPrice,
        },
        message: `You have hired ${agent.name} for ${tier === "day" ? "24 hours" : tier === "week" ? "7 days" : "30 days"}. Payment verified via x402. You now have full access to the agent's brain and premium signals.`,
    }, { status: 201 });
}


