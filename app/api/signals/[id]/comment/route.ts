import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/signals/[id]/comment — Add a comment
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { wallet, content } = await req.json();

    if (!wallet || !content?.trim()) {
        return NextResponse.json({ error: "Missing wallet or content" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("signal_comments")
        .insert({
            signal_id: id,
            wallet_address: wallet,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        wallet: data.wallet_address,
        content: data.content,
        createdAt: new Date(data.created_at).getTime(),
    }, { status: 201 });
}
