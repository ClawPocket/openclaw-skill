import { NextResponse } from "next/server";
import { getAgent, getSignals } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const agent = await getAgent(id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const signals = await getSignals(id);
    return NextResponse.json({ ...agent, signals });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const { signature, wallet } = body;

    if (!signature || !wallet) {
        return NextResponse.json({ error: "Missing signature or wallet" }, { status: 400 });
    }

    const { getAgent, deleteAgent } = await import("@/lib/db");
    const agent = await getAgent(id);

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    // Verify ownership
    if (agent.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
        return NextResponse.json({ error: "Unauthorized: Wallet mismatch" }, { status: 401 });
    }

    // Verify signature
    try {
        const { publicClient } = await import("@/lib/viem");
        const valid = await publicClient.verifyMessage({
            address: wallet as `0x${string}`,
            message: `Delete Agent: ${agent.name} (${agent.id})`,
            signature: signature as `0x${string}`,
        });

        if (!valid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    } catch (error) {
        console.error("Signature verification failed:", error);
        return NextResponse.json({ error: "Signature verification failed" }, { status: 500 });
    }

    // Delete agent
    const success = await deleteAgent(id);
    if (!success) {
        return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
