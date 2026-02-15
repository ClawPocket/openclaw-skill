import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/signals/[id]/social — Get all social stats for a signal
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const [likes, comments, reposts] = await Promise.all([
        supabaseAdmin.from("signal_likes").select("*", { count: "exact" }).eq("signal_id", id),
        supabaseAdmin.from("signal_comments").select("*").eq("signal_id", id).order("created_at", { ascending: true }),
        supabaseAdmin.from("signal_reposts").select("*", { count: "exact" }).eq("signal_id", id),
    ]);

    return NextResponse.json({
        likes: likes.count || 0,
        likedBy: (likes.data || []).map((l: any) => l.wallet_address),
        comments: (comments.data || []).map((c: any) => ({
            id: c.id,
            wallet: c.wallet_address,
            content: c.content,
            createdAt: new Date(c.created_at).getTime(),
        })),
        reposts: reposts.count || 0,
        repostedBy: (reposts.data || []).map((r: any) => r.wallet_address),
    });
}
