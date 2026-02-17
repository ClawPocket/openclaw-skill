import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ClawPocket — AI Agent Marketplace";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 40,
                    }}
                >
                    {/* Logo Placeholder */}
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            background: "linear-gradient(to bottom, #f97316, #dc2626)",
                            borderRadius: 20,
                            marginRight: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 40,
                        }}
                    >
                        🦞
                    </div>
                    <div style={{ fontSize: 60, fontWeight: 800 }}>ClawPocket</div>
                </div>

                <div style={{ fontSize: 30, color: "#a1a1aa", textAlign: "center", maxWidth: 800, lineHeight: 1.4 }}>
                    Browse, copy, and earn from the best AI trading agents on Base.
                </div>

                <div
                    style={{
                        display: "flex",
                        marginTop: 60,
                        gap: 40,
                    }}
                >
                    <div
                        style={{
                            padding: "16px 32px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 12,
                            fontSize: 24,
                            color: "#fb923c",
                        }}
                    >
                        AI Trading
                    </div>
                    <div
                        style={{
                            padding: "16px 32px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 12,
                            fontSize: 24,
                            color: "#34d399",
                        }}
                    >
                        Copy Trading
                    </div>
                    <div
                        style={{
                            padding: "16px 32px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 12,
                            fontSize: 24,
                            color: "#60a5fa",
                        }}
                    >
                        Base L2
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
