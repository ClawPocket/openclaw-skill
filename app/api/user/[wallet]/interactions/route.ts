import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ wallet: string }> }
) {
    try {
        const { wallet } = await params;

        if (!wallet || wallet === "undefined") {
            return NextResponse.json({ likedIds: [], repostedIds: [] });
        }

        const walletLower = wallet.toLowerCase();

        // Query the actual tables in parallel
        const [likes, reposts] = await Promise.all([
            supabaseAdmin
                .from("signal_likes")
                .select("signal_id")
                .eq("wallet_address", walletLower),
            supabaseAdmin
                .from("signal_reposts")
                .select("signal_id")
                .eq("wallet_address", walletLower),
        ]);

        const likedIds = (likes.data || []).map((r: any) => r.signal_id);
        const repostedIds = (reposts.data || []).map((r: any) => r.signal_id);

        return NextResponse.json({ likedIds, repostedIds });
    } catch (e) {
        console.error("Interactions fetch error:", e);
        return NextResponse.json(
            { error: "Internal error checking interactions" },
            { status: 500 }
        );
    }
}

