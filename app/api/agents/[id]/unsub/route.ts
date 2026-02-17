import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE /api/agents/[id]/copy
// Unsubscribe from an agent
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const { subscriberWallet, signature, message } = body;

    if (!subscriberWallet || !signature || !message) {
        return NextResponse.json({ error: "Missing authentication params" }, { status: 400 });
    }

    // Verify Message Content
    if (message !== `Unsubscribe from agent ${id}`) {
        return NextResponse.json({ error: "Invalid message content" }, { status: 400 });
    }

    // Verify Signature
    try {
        const { publicClient } = await import("@/lib/viem");
        const valid = await publicClient.verifyMessage({
            address: subscriberWallet as `0x${string}`,
            message: message,
            signature: signature as `0x${string}`,
        });

        if (!valid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    } catch (error) {
        console.error("Signature verification failed:", error);
        return NextResponse.json({ error: "Signature verification failed" }, { status: 500 });
    }

    // Remove from agent's subscribers array
    const { data: agent } = await supabaseAdmin
        .from("agents")
        .select("subscribers")
        .eq("id", id)
        .single();

    if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updatedSubscribers = (agent.subscribers || []).filter(
        (w: string) => w.toLowerCase() !== subscriberWallet.toLowerCase()
    );

    // ... continue with update ...
    await supabaseAdmin
        .from("agents")
        .update({ subscribers: updatedSubscribers })
        .eq("id", id);

    // Deactivate subscription record
    await supabaseAdmin
        .from("subscriptions")
        .update({ active: false })
        .eq("agent_id", id)
        .eq("subscriber_wallet", subscriberWallet);

    console.log(`🚫 Unsubscribed: ${subscriberWallet} ✕ agent ${id}`);

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
}
