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
    const { subscriberWallet } = body;

    if (!subscriberWallet) {
        return NextResponse.json({ error: "Missing subscriberWallet" }, { status: 400 });
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
