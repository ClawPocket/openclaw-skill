import { NextResponse } from "next/server";
import { getSignals } from "@/lib/db";

// This endpoint serves agent trade signals.
// In production, this would be protected by x402 middleware
// requiring USDC payment per request.
//
// x402 flow:
// 1. Client requests signals → server returns HTTP 402 with payment details
// 2. Client pays via USDC on Base → gets receipt
// 3. Client retries request with payment receipt → gets signals
//
// For now, we return signals with x402-compatible headers
// indicating this endpoint would require payment.

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const signals = getSignals(id).sort((a, b) => b.createdAt - a.createdAt);

    // x402 payment metadata (ready for middleware integration)
    const headers = new Headers();
    headers.set("X-Payment-Required", "true");
    headers.set("X-Payment-Asset", "USDC");
    headers.set("X-Payment-Network", "base-sepolia");
    headers.set("X-Payment-Amount", "0.01");

    // In production with x402-express middleware:
    // - Unpaid requests get HTTP 402 + payment instructions
    // - Paid requests get the signals below
    return NextResponse.json(
        {
            agentId: id,
            signalCount: signals.length,
            signals: signals.slice(0, 10), // Latest 10 signals
        },
        { headers }
    );
}
