import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/repost — Toggle repost
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { wallet } = await req.json();

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    // Check if already reposted
    const { data: existing } = await supabaseAdmin
        .from("signal_reposts")
        .select("id")
        .eq("signal_id", id)
        .eq("wallet_address", wallet)
        .single();

    if (existing) {
        // Un-repost
        await supabaseAdmin
            .from("signal_reposts")
            .delete()
            .eq("signal_id", id)
            .eq("wallet_address", wallet);

        return NextResponse.json({ reposted: false });
    } else {
        // Repost
        await supabaseAdmin.from("signal_reposts").insert({
            signal_id: id,
            wallet_address: wallet,
        });

        return NextResponse.json({ reposted: true });
    }
}
