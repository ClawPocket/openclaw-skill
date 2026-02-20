import { NextResponse } from "next/server";
import { getAgent, getActiveRental } from "@/lib/db";

// Tier price multipliers (base = rental_price_usdc per day)
const TIER_MULTIPLIER: Record<string, number> = {
    day: 1,
    week: 5,
    month: 20,
};

// GET /api/agents/[id]/rental-status — Check rental status (no payment required)
// This is separate from /hire which is behind the x402 paywall.
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
