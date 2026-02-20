import { ImageResponse } from "next/og";
import { getAgent } from "@/lib/db";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

const DOMAIN = "https://clawpocket.xyz";

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
    const hasImageAvatar = agent.avatar?.startsWith("http");
    const logoUrl = `${DOMAIN}/icon-512.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    background: "#09090b",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    color: "white",
                    position: "relative",
                    padding: "50px 60px",
                }}
            >
                {/* Background accents */}
                <div
                    style={{
                        position: "absolute",
                        top: -150,
                        right: -150,
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: agent.color,
                        opacity: 0.1,
                        display: "flex",
                    }}
                />
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

                {/* Top row: Agent avatar + info */}
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    {/* Agent avatar */}
                    {hasImageAvatar ? (
                        <img
                            src={agent.avatar}
                            width={120}
                            height={120}
                            style={{
                                borderRadius: 24,
                                border: `3px solid ${agent.color}40`,
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 24,
                                border: `3px solid ${agent.color}40`,
                                background: `${agent.color}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 56,
                            }}
                        >
                            {agent.avatar}
                        </div>
                    )}

                    {/* Agent name + handle + persona */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontSize: 52, fontWeight: 900, display: "flex", lineHeight: 1.1 }}>
                            {agent.name}
                        </div>
                        <div style={{ fontSize: 24, color: "#a1a1aa", display: "flex" }}>
                            {agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, "")}`}
                        </div>
                        <div
                            style={{
                                fontSize: 16,
                                color: agent.color,
                                letterSpacing: 2,
                                display: "flex",
                                marginTop: 4,
                            }}
                        >
                            {agent.persona.toUpperCase()} AI AGENT
                        </div>
                    </div>
                </div>

                {/* Description */}
                {agent.description && (
                    <div
                        style={{
                            fontSize: 20,
                            color: "#a1a1aa",
                            marginTop: 28,
                            lineHeight: 1.5,
                            display: "flex",
                            maxWidth: 900,
                        }}
                    >
                        {agent.description.length > 120
                            ? agent.description.slice(0, 120) + "..."
                            : agent.description}
                    </div>
                )}

                {/* Stats bar */}
                <div
                    style={{
                        display: "flex",
                        gap: 50,
                        marginTop: "auto",
                        marginBottom: 20,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 16,
                        padding: "24px 40px",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: roiColor, display: "flex" }}>
                            {roiSign}{agent.roiPct}%
                        </div>
                        <div style={{ fontSize: 13, color: "#71717a", letterSpacing: 2, display: "flex" }}>ROI</div>
                    </div>

                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex" }} />

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: "#f97316", display: "flex" }}>
                            {agent.totalHires || 0}
                        </div>
                        <div style={{ fontSize: 13, color: "#71717a", letterSpacing: 2, display: "flex" }}>HIRED</div>
                    </div>

                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex" }} />

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: "white", display: "flex" }}>
                            {agent.tasksCompleted || agent.totalTrades || 0}
                        </div>
                        <div style={{ fontSize: 13, color: "#71717a", letterSpacing: 2, display: "flex" }}>TASKS</div>
                    </div>

                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex" }} />

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: "#34d399", display: "flex" }}>
                            ${agent.rentalPriceUsdc || "5.00"}
                        </div>
                        <div style={{ fontSize: 13, color: "#71717a", letterSpacing: 2, display: "flex" }}>/ DAY</div>
                    </div>
                </div>

                {/* Footer: ClawPocket branding */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                            src={logoUrl}
                            width={36}
                            height={36}
                            style={{ borderRadius: 8 }}
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "white", display: "flex" }}>
                                ClawPocket
                            </div>
                            <div style={{ fontSize: 12, color: "#71717a", display: "flex" }}>
                                AI Agent Marketplace on Base
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#52525b", display: "flex" }}>
                        clawpocket.xyz
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
