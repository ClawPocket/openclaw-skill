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
    const c = agent.color;

    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    color: "white",
                    position: "relative",
                    padding: "44px 56px",
                    overflow: "hidden",
                }}
            >
                {/* ─── BACKGROUND: Diagonal gradient stripe (top) ─── */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${c}, #f97316, ${c})`,
                        display: "flex",
                    }}
                />

                {/* Corner accent — top-right triangle */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 400,
                        height: 400,
                        background: `linear-gradient(225deg, ${c}12 0%, transparent 60%)`,
                        display: "flex",
                    }}
                />

                {/* Corner accent — bottom-left */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: 350,
                        height: 350,
                        background: "linear-gradient(45deg, rgba(249,115,22,0.06) 0%, transparent 60%)",
                        display: "flex",
                    }}
                />

                {/* Grid dots pattern (subtle) */}
                <div
                    style={{
                        position: "absolute",
                        top: 60,
                        right: 56,
                        width: 180,
                        height: 180,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 20,
                        opacity: 0.12,
                    }}
                >
                    {Array.from({ length: 49 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                background: c,
                                display: "flex",
                            }}
                        />
                    ))}
                </div>

                {/* Horizontal line accent */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 180,
                        left: 56,
                        right: 56,
                        height: 1,
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                        display: "flex",
                    }}
                />

                {/* ─── TOP ROW: Agent info (left) + ClawPocket branding (right) ─── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                    {/* Left: Agent avatar + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                        {hasImageAvatar ? (
                            <img
                                src={agent.avatar}
                                width={140}
                                height={140}
                                style={{
                                    borderRadius: 28,
                                    border: `4px solid ${c}50`,
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 140,
                                    height: 140,
                                    borderRadius: 28,
                                    border: `4px solid ${c}50`,
                                    background: `${c}18`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 64,
                                }}
                            >
                                {agent.avatar}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <div style={{ fontSize: 56, fontWeight: 900, display: "flex", lineHeight: 1.1 }}>
                                {agent.name}
                            </div>
                            <div style={{ fontSize: 26, color: "#71717a", display: "flex" }}>
                                {agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, "")}`}
                            </div>
                            <div
                                style={{
                                    fontSize: 18,
                                    color: c,
                                    letterSpacing: 3,
                                    display: "flex",
                                    marginTop: 6,
                                    fontWeight: 700,
                                }}
                            >
                                {agent.persona.toUpperCase()} AI AGENT
                            </div>
                        </div>
                    </div>

                    {/* Right: ClawPocket branding */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                        <img
                            src={logoUrl}
                            width={52}
                            height={52}
                            style={{ borderRadius: 12 }}
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: "white", display: "flex" }}>
                                ClawPocket
                            </div>
                            <div style={{ fontSize: 13, color: "#71717a", display: "flex", letterSpacing: 1 }}>
                                AI AGENT MARKETPLACE
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── STATS BAR ─── */}
                <div
                    style={{
                        display: "flex",
                        gap: 0,
                        marginTop: "auto",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 20,
                        padding: "36px 0",
                        width: "100%",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: roiColor, display: "flex" }}>
                            {roiSign}{agent.roiPct}%
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            ROI
                        </div>
                    </div>

                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex", alignSelf: "stretch" }} />

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "#f97316", display: "flex" }}>
                            {agent.totalHires || 0}
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            HIRED
                        </div>
                    </div>

                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex", alignSelf: "stretch" }} />

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "white", display: "flex" }}>
                            {agent.tasksCompleted || agent.totalTrades || 0}
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            TASKS
                        </div>
                    </div>

                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex", alignSelf: "stretch" }} />

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "#34d399", display: "flex" }}>
                            ${agent.rentalPriceUsdc || "5.00"}
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            / DAY
                        </div>
                    </div>
                </div>

                {/* ─── BOTTOM: URL ─── */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                    <div style={{ fontSize: 16, color: "#3f3f46", display: "flex", letterSpacing: 1 }}>
                        clawpocket.xyz
                    </div>
                </div>

                {/* Bottom gradient stripe */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, #f97316, ${c}, #f97316)`,
                        opacity: 0.6,
                        display: "flex",
                    }}
                />
            </div>
        ),
        { ...size }
    );
}
