import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/signals/[id]/content
// Protected by x402 Middleware (Payment Required)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data: signal, error } = await supabaseAdmin
        .from("signals")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !signal) {
        return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Return the full signal content
    return NextResponse.json(signal);
}
