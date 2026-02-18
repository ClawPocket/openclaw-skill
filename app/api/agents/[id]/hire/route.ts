import { NextResponse } from "next/server";
import { getAgent, addRental, getRentalByTxHash, getActiveRental } from "@/lib/db";
import { verifyTransaction } from "@/lib/chain";
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
// Rent an agent for time-bound access to its brain and premium signals
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const { renterWallet, tier, paymentTxHash } = body;

    // ── Validation ──
    if (!renterWallet) {
        return NextResponse.json({ error: "Missing renterWallet" }, { status: 400 });
    }
    if (!tier || !TIER_DURATION[tier]) {
        return NextResponse.json({ error: "Invalid tier. Must be 'day', 'week', or 'month'." }, { status: 400 });
    }
    if (!paymentTxHash) {
        return NextResponse.json({ error: "Payment required. Submit USDC payment first." }, { status: 402 });
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

    // ── Replay Protection ──
    const existingTxRental = await getRentalByTxHash(paymentTxHash);
    if (existingTxRental) {
        return NextResponse.json({ error: "Payment already used for another rental" }, { status: 409 });
    }

    // ── Expected price calculation ──
    const basePricePerDay = parseFloat(agent.rentalPriceUsdc || "5.00");
    const expectedPrice = basePricePerDay * TIER_MULTIPLIER[tier];

    // ── On-chain Payment Verification ──
    const verification = await verifyTransaction(paymentTxHash, agent.ownerWallet);
    if (!verification.valid) {
        console.warn(`Rental payment verification failed: ${verification.error}`);
        return NextResponse.json({
            error: "Payment verification failed. Transaction invalid or did not transfer funds to agent.",
        }, { status: 402 });
    }

    // Check amount (USDC has 6 decimals)
    const paidAmount = Number(verification.amount || 0n) / 1_000_000;
    if (paidAmount < expectedPrice * 0.95) { // Allow 5% slippage
        return NextResponse.json({
            error: `Insufficient payment. Expected $${expectedPrice.toFixed(2)} USDC, received $${paidAmount.toFixed(2)} USDC.`,
        }, { status: 402 });
    }

    // ── Create Rental ──
    const now = Date.now();
    const rental: Rental = {
        id: uuid(),
        renterWallet: renterWallet.toLowerCase(),
        agentId: id,
        tier: tier as "day" | "week" | "month",
        paymentTxHash,
        startsAt: now,
        expiresAt: now + TIER_DURATION[tier],
        active: true,
        createdAt: now,
    };

    await addRental(rental);

    console.log(`🔑 New rental: ${renterWallet} → ${agent.name} | Tier: ${tier} | Expires: ${new Date(rental.expiresAt).toISOString()} | Payment: ${paymentTxHash}`);

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
            paid: paidAmount,
        },
        message: `You have rented ${agent.name} for ${tier === "day" ? "24 hours" : tier === "week" ? "7 days" : "30 days"}. You now have full access to the agent's brain and premium signals.`,
    }, { status: 201 });
}

// GET /api/agents/[id]/hire — Check rental status
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet query param" }, { status: 400 });
    }

    const agent = await getAgent(id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Owner always has access
    if (agent.ownerWallet.toLowerCase() === wallet.toLowerCase()) {
        return NextResponse.json({
            hasAccess: true,
            via: "owner",
            pricing: {
                day: parseFloat(agent.rentalPriceUsdc || "5.00") * TIER_MULTIPLIER.day,
                week: parseFloat(agent.rentalPriceUsdc || "5.00") * TIER_MULTIPLIER.week,
                month: parseFloat(agent.rentalPriceUsdc || "5.00") * TIER_MULTIPLIER.month,
            },
        });
    }

    const rental = await getActiveRental(id, wallet);

    return NextResponse.json({
        hasAccess: !!rental,
        via: rental ? "rental" : "none",
        rental: rental || null,
        pricing: {
            day: parseFloat(agent.rentalPriceUsdc || "5.00") * TIER_MULTIPLIER.day,
            week: parseFloat(agent.rentalPriceUsdc || "5.00") * TIER_MULTIPLIER.week,
            month: parseFloat(agent.rentalPriceUsdc || "5.00") * TIER_MULTIPLIER.month,
        },
    });
}
