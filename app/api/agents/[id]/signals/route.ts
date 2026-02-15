import { NextResponse } from "next/server";
import { getSignals } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const signals = await getSignals(id);
    const sortedSignals = signals.sort((a, b) => b.createdAt - a.createdAt);

    // x402 payment metadata (ready for middleware integration)
    const headers = new Headers();
    headers.set("X-Payment-Required", "true");
    headers.set("X-Payment-Asset", "USDC");
    headers.set("X-Payment-Network", "base-mainnet");
    headers.set("X-Payment-Amount", "0.01");

    return NextResponse.json(
        {
            agentId: id,
            signalCount: sortedSignals.length,
            signals: sortedSignals.slice(0, 10),
        },
        { headers }
    );
}
