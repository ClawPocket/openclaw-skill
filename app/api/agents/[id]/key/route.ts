import { NextResponse } from "next/server";
import { getAgent, getAgentApiKey } from "@/lib/db";
import { verifyMessage } from "viem";

export const dynamic = "force-dynamic";

// GET /api/agents/[id]/key
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const signature = searchParams.get("signature") as `0x${string}`;
        const timestamp = searchParams.get("timestamp");
        const wallet = searchParams.get("wallet");

        if (!wallet || !signature || !timestamp) {
            return NextResponse.json({ error: "Missing signature or wallet" }, { status: 400 });
        }

        // 1. Validate Timestamp (prevent replay attacks > 5 mins old)
        const timeDiff = Date.now() - parseInt(timestamp);
        if (Math.abs(timeDiff) > 5 * 60 * 1000) {
            return NextResponse.json({ error: "Request expired" }, { status: 401 });
        }

        // 2. Fetch Agent
        const agent = await getAgent(id);
        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // 3. Verify Ownership Claim
        if (agent.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized: Wallet mismatch" }, { status: 403 });
        }

        // 4. Verify Cryptographic Signature
        const message = `View API Key for Agent ${id} at ${timestamp}`;

        console.log(`Verifying signature. Length: ${signature.length}, Value (start): ${signature.substring(0, 10)}...`);

        const valid = await verifyMessage({
            address: wallet as `0x${string}`,
            message,
            signature,
        });

        if (!valid) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
        }

        // 5. Reveal Key
        const apiKey = await getAgentApiKey(agent.id);
        return NextResponse.json({ apiKey });

    } catch (e: any) {
        console.error("API Key Route Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
