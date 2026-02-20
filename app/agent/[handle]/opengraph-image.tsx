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
                    padding: "44px 56px",
                }}
            >
                {/* Background accent circles */}
                <div
                    style={{
                        position: "absolute",
                        top: -200,
                        right: -100,
                        width: 600,
                        height: 600,
                        borderRadius: "50%",
                        background: agent.color,
                        opacity: 0.08,
                        display: "flex",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -150,
                        left: -150,
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: "#f97316",
                        opacity: 0.05,
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
                                    border: `4px solid ${agent.color}50`,
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 140,
                                    height: 140,
                                    borderRadius: 28,
                                    border: `4px solid ${agent.color}50`,
                                    background: `${agent.color}18`,
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
                                    color: agent.color,
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

                    {/* Right: ClawPocket logo + branding */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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

                {/* ─── STATS BAR (fills remaining space) ─── */}
                <div
                    style={{
                        display: "flex",
                        gap: 0,
                        marginTop: "auto",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 20,
                        padding: "36px 0",
                        width: "100%",
                    }}
                >
                    {/* ROI */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: roiColor, display: "flex" }}>
                            {roiSign}{agent.roiPct}%
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            ROI
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex", alignSelf: "stretch" }} />

                    {/* Hired */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "#f97316", display: "flex" }}>
                            {agent.totalHires || 0}
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            HIRED
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex", alignSelf: "stretch" }} />

                    {/* Tasks */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "white", display: "flex" }}>
                            {agent.tasksCompleted || agent.totalTrades || 0}
                        </div>
                        <div style={{ fontSize: 16, color: "#52525b", letterSpacing: 3, display: "flex", marginTop: 4 }}>
                            TASKS
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)", display: "flex", alignSelf: "stretch" }} />

                    {/* Price */}
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
            </div>
        ),
        { ...size }
    );
}
