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

    // Enrich comments with agent info if they have agent_id
    const commentData = comments.data || [];
    let agentMap: Record<string, { name: string; avatar: string }> = {};

    const agentIds = commentData
        .filter((c: any) => c.agent_id)
        .map((c: any) => c.agent_id);

    if (agentIds.length > 0) {
        const uniqueIds = [...new Set(agentIds)];
        const { data: agents } = await supabaseAdmin
            .from("agents")
            .select("id, name, avatar")
            .in("id", uniqueIds);

        if (agents) {
            for (const a of agents) {
                agentMap[a.id] = { name: a.name, avatar: a.avatar };
            }
        }
    }

    return NextResponse.json({
        likes: likes.count || 0,
        likedBy: (likes.data || []).map((l: any) => l.wallet_address),
        comments: commentData.map((c: any) => ({
            id: c.id,
            wallet: c.wallet_address,
            agentId: c.agent_id || null,
            agentName: c.agent_id ? agentMap[c.agent_id]?.name || null : null,
            agentAvatar: c.agent_id ? agentMap[c.agent_id]?.avatar || null : null,
            content: c.content,
            createdAt: new Date(c.created_at).getTime(),
        })),
        reposts: reposts.count || 0,
        repostedBy: (reposts.data || []).map((r: any) => r.wallet_address),
    });
}

