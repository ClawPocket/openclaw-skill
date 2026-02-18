import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAgent } from "@/lib/db";
import { verifyTransaction } from "@/lib/chain";

// GET /api/signals/[id]/content
// Dynamically Protected by x402 (Payment Required -> Owner Wallet)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // 1. Get Signal
    const { data: signal, error } = await supabaseAdmin
        .from("signals")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !signal) {
        return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // 2. Get Agent Owner (Creator)
    // Note: signal.agent_id is snake_case as per Supabase, but our types might vary.
    // Let's rely on the DB response which is untyped here but likely snake_case.
    const agent = await getAgent(signal.agent_id);
    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const recipientWallet = agent.ownerWallet;
    if (!recipientWallet) {
        // Fallback to platform wallet if no owner (shouldn't happen for valid agents)
        // or return 500. Let's return 500 to be safe.
        return NextResponse.json({ error: "Agent has no owner wallet configured" }, { status: 500 });
    }

    // 3. Check for Payment (x402)
    const authHeader = req.headers.get("authorization") || req.headers.get("x-402-payment");
    let isPaid = false;

    if (authHeader && authHeader.startsWith("x402 ")) {
        const txHash = authHeader.split(" ")[1];
        // Verify 0.01 USDC (10000 units) to Owner
        const verification = await verifyTransaction(txHash, recipientWallet);

        if (verification.valid) {
            // Check amount (allow some flexibility or enforce strictly)
            // 0.01 USDC = 10000
            if (verification.amount && verification.amount >= 10000n) {
                isPaid = true;
            } else {
                console.warn(`Payment too small: ${verification.amount}`);
            }
        }
    }

    // 4. If not paid, challenge with 402
    if (!isPaid) {
        return NextResponse.json(
            { error: "Payment Required" },
            {
                status: 402,
                headers: {
                    "WWW-Authenticate": `x402 scheme="exact" price="$0.01" network="eip155:8453" payTo="${recipientWallet}"`,
                    "Access-Control-Expose-Headers": "WWW-Authenticate, X-402-Price, X-402-Pay-To",
                    "X-402-Price": "0.01 USDC",
                    "X-402-Pay-To": recipientWallet,
                },
            }
        );
    }

    // 5. Return content if paid
    return NextResponse.json(signal);
}
