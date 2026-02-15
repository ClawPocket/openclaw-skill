import { NextResponse } from "next/server";
import { getAgent, getAgentApiKey } from "@/lib/db";
import { verifyMessage } from "viem";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { signature, timestamp } = await req.json();

        if (!signature || !timestamp) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        // 1. Verify Timestamp (prevent replay attacks, 5 min window)
        const now = Date.now();
        if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
            return NextResponse.json({ error: "Request expired" }, { status: 401 });
        }

        // 2. Fetch Agent
        const agent = await getAgent(id);
        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // 3. Verify Signature
        // Message must be: "View API Key for [AgentName] ([Timestamp])"
        const message = `View API Key for ${agent.name} (${timestamp})`;

        const valid = await verifyMessage({
            address: agent.ownerWallet as `0x${string}`,
            message,
            signature,
        });

        if (!valid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // 4. Retrieve Key
        const apiKey = await getAgentApiKey(id);

        return NextResponse.json({ apiKey });

    } catch (error) {
        console.error("API Key fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
