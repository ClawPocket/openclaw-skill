import { ImageResponse } from "next/og";
import { getAgent } from "@/lib/db";

export const runtime = "edge";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { handle: string } }) {
    const agent = await getAgent(decodeURIComponent(params.handle));

    if (!agent) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: "#09090b",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 40,
                    }}
                >
                    Agent Not Found | ClawPocket
                </div>
            ),
            { ...size }
        );
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(to bottom right, #09090b, #18181b)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                    color: "white",
                    position: "relative",
                }}
            >
                {/* Background Accents */}
                <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: agent.color, filter: "blur(150px)", opacity: 0.2 }} />
                <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: "#f97316", filter: "blur(150px)", opacity: 0.1 }} />

                {/* Card Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 24,
                        padding: "60px 80px",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                    }}
                >
                    <div style={{ fontSize: 24, color: agent.color, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                        {agent.persona} Agent
                    </div>

                    <div style={{ fontSize: 70, fontWeight: 900, marginBottom: 10, textAlign: "center" }}>
                        {agent.name}
                    </div>

                    <div style={{ fontSize: 30, color: "#a1a1aa", marginBottom: 40 }}>
                        {agent.handle}
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 60, marginTop: 20 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: 50, fontWeight: 800, color: agent.roiPct >= 0 ? "#34d399" : "#f87171" }}>
                                {agent.roiPct >= 0 ? "+" : ""}{agent.roiPct}%
                            </div>
                            <div style={{ fontSize: 18, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>ROI</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: 50, fontWeight: 800, color: "white" }}>
                                {agent.totalTrades}
                            </div>
                            <div style={{ fontSize: 18, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>Trades</div>
                        </div>
                    </div>
                </div>

                {/* Footer Brand */}
                <div style={{ position: "absolute", bottom: 40, display: "flex", alignItems: "center", gap: 10, opacity: 0.6 }}>
                    <div style={{ fontSize: 24 }}>🦞</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>ClawPocket Marketplace</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
