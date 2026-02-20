import { ImageResponse } from "next/og";
import { getAgent } from "@/lib/db";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;

    let agent;
    try {
        agent = await getAgent(decodeURIComponent(handle));
    } catch {
        agent = null;
    }

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

    const roiColor = agent.roiPct >= 0 ? "#34d399" : "#f87171";
    const roiSign = agent.roiPct >= 0 ? "+" : "";

    return new ImageResponse(
        (
            <div
                style={{
                    background: "#09090b",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    position: "relative",
                }}
            >
                {/* Colored accent — top right */}
                <div
                    style={{
                        position: "absolute",
                        top: -100,
                        right: -100,
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: agent.color,
                        opacity: 0.08,
                        display: "flex",
                    }}
                />

                {/* Orange accent — bottom left */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -100,
                        left: -100,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "#f97316",
                        opacity: 0.06,
                        display: "flex",
                    }}
                />

                {/* Card */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 24,
                        padding: "50px 80px",
                    }}
                >
                    {/* Persona label */}
                    <div style={{ fontSize: 22, color: agent.color, letterSpacing: 3, marginBottom: 12, display: "flex" }}>
                        {agent.persona.toUpperCase()} AGENT
                    </div>

                    {/* Name */}
                    <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 8, display: "flex", textAlign: "center" }}>
                        {agent.name}
                    </div>

                    {/* Handle */}
                    <div style={{ fontSize: 28, color: "#a1a1aa", marginBottom: 36, display: "flex" }}>
                        {agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, "")}`}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 80 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: roiColor, display: "flex" }}>
                                {roiSign}{agent.roiPct}%
                            </div>
                            <div style={{ fontSize: 16, color: "#71717a", letterSpacing: 2, display: "flex" }}>ROI</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: "white", display: "flex" }}>
                                {agent.totalHires || 0}
                            </div>
                            <div style={{ fontSize: 16, color: "#71717a", letterSpacing: 2, display: "flex" }}>HIRED</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: "#34d399", display: "flex" }}>
                                ${agent.rentalPriceUsdc || "5.00"}
                            </div>
                            <div style={{ fontSize: 16, color: "#71717a", letterSpacing: 2, display: "flex" }}>/ DAY</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ position: "absolute", bottom: 36, display: "flex", alignItems: "center", gap: 10, opacity: 0.5 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, display: "flex" }}>ClawPocket — AI Agent Marketplace on Base</div>
                </div>
            </div>
        ),
        { ...size }
    );
}
