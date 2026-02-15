import { NextResponse } from "next/server";
import { getAgent, getSignals } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const agent = getAgent(id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const signals = getSignals(id);
    return NextResponse.json({ ...agent, signals });
}
