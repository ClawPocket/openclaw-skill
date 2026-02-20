import { NextResponse } from "next/server";
import { getAgent, addRental, getActiveRental } from "@/lib/db";
import { Rental } from "@/lib/types";
import { v4 as uuid } from "uuid";
import { createPublicClient, createWalletClient, http, parseUnits, encodeFunctionData } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

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

// Revenue split: 90% to agent creator, 10% platform fee
const CREATOR_SHARE_BPS = 9000; // 90% in basis points

// USDC on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const ERC20_TRANSFER_ABI = [
    {
        name: "transfer",
        type: "function",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
] as const;

/**
 * Forward 90% of the x402 payment to the agent creator's wallet.
 *
 * x402 settles all payments to the PLATFORM_WALLET.
 * This function splits the revenue by sending 90% to the agent creator.
 * The remaining 10% stays in the platform wallet as the platform fee.
 *
 * Requires PLATFORM_WALLET_PRIVATE_KEY env var to sign the transfer.
 * If the key is not set, the split is logged but not executed (manual settlement).
 */
async function forwardCreatorRevenue(
    creatorWallet: string,
    totalPriceUsdc: number,
    agentName: string,
) {
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;

    if (!privateKey) {
        console.log(`💰 Revenue split pending (manual): $${(totalPriceUsdc * CREATOR_SHARE_BPS / 10000).toFixed(2)} → ${creatorWallet} for ${agentName}`);
        return;
    }

    try {
        const creatorAmount = (totalPriceUsdc * CREATOR_SHARE_BPS) / 10000;
        const amountWei = parseUnits(creatorAmount.toFixed(6), 6);

        const account = privateKeyToAccount(privateKey as `0x${string}`);
        const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
        });

        const txHash = await walletClient.sendTransaction({
            to: USDC_ADDRESS as `0x${string}`,
            data: encodeFunctionData({
                abi: ERC20_TRANSFER_ABI,
                functionName: "transfer",
                args: [creatorWallet as `0x${string}`, amountWei],
            }),
        });

        console.log(`💰 Revenue forwarded: $${creatorAmount.toFixed(2)} → ${creatorWallet} for ${agentName} | TX: ${txHash}`);
    } catch (error) {
        console.error(`❌ Revenue forward failed for ${agentName}:`, error);
        // Log for manual reconciliation — payment was still received by platform
    }
}

// POST /api/agents/[id]/hire
// Create a rental after x402 payment is verified by the middleware.
//
// The x402 middleware (middleware.ts) intercepts this route and:
//   1. Returns 402 + PAYMENT-REQUIRED if no payment signature is present
//   2. Verifies the payment via the Coinbase facilitator
//   3. Settles the payment on-chain (to PLATFORM_WALLET)
//   4. Only then forwards the request to this handler
//
// After creating the rental, we forward 90% to the agent creator.
// The remaining 10% stays in the platform wallet as the protocol fee.
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

    // ── Expected price ──
    const basePricePerDay = parseFloat(agent.rentalPriceUsdc || "5.00");
    const expectedPrice = basePricePerDay * TIER_MULTIPLIER[tier];

    // ── Create Rental ──
    const now = Date.now();
    const rental: Rental = {
        id: uuid(),
        renterWallet: renterWallet.toLowerCase(),
        agentId: id,
        tier: tier as "day" | "week" | "month",
        paymentTxHash: `x402-${now}`,
        startsAt: now,
        expiresAt: now + TIER_DURATION[tier],
        active: true,
        createdAt: now,
    };

    await addRental(rental);

    // ── Revenue Split (fire-and-forget) ──
    // Forward 90% of the payment to the agent creator.
    // Don't await — we don't want to block the response.
    forwardCreatorRevenue(agent.ownerWallet, expectedPrice, agent.name).catch(() => { });

    console.log(`🔑 New x402 rental: ${renterWallet} → ${agent.name} | Tier: ${tier} | Price: $${expectedPrice} | Creator gets: $${(expectedPrice * 0.9).toFixed(2)} | Expires: ${new Date(rental.expiresAt).toISOString()}`);

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
            creatorShare: expectedPrice * 0.9,
            platformFee: expectedPrice * 0.1,
        },
        message: `You have hired ${agent.name} for ${tier === "day" ? "24 hours" : tier === "week" ? "7 days" : "30 days"}. Payment verified via x402.`,
    }, { status: 201 });
}
