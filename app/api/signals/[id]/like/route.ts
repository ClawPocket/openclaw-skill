import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/like — Toggle like
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { wallet } = await req.json();

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    // Check if already liked
    const { data: existing } = await supabaseAdmin
        .from("signal_likes")
        .select("id")
        .eq("signal_id", id)
        .eq("wallet_address", wallet)
        .single();

    if (existing) {
        // Unlike
        await supabaseAdmin
            .from("signal_likes")
            .delete()
            .eq("signal_id", id)
            .eq("wallet_address", wallet);

        return NextResponse.json({ liked: false });
    } else {
        // Like
        await supabaseAdmin.from("signal_likes").insert({
            signal_id: id,
            wallet_address: wallet,
        });

        return NextResponse.json({ liked: true });
    }
}
