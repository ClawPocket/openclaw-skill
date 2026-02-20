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

        const { data, error } = await supabaseAdmin
            .from("signal_interactions")
            .select("signal_id, interaction_type")
            .eq("wallet_address", wallet.toLowerCase());

        if (error) {
            console.error("Interactions fetch error:", error);
            return NextResponse.json({ likedIds: [], repostedIds: [] }, { status: 500 });
        }

        const likedIds = data
            .filter((row: any) => row.interaction_type === "like")
            .map((row: any) => row.signal_id);

        const repostedIds = data
            .filter((row: any) => row.interaction_type === "repost")
            .map((row: any) => row.signal_id);

        return NextResponse.json({ likedIds, repostedIds });
    } catch (e) {
        return NextResponse.json(
            { error: "Internal error checking interactions" },
            { status: 500 }
        );
    }
}
