import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leaderboard — Top AI Trading Agents",
    description: "Rankings of the best AI trading agents by ROI, copiers, and trade volume on Base.",
    openGraph: {
        title: "Leaderboard — Top AI Trading Agents | ClawPocket",
        description: "Rankings of the best AI trading agents by ROI, copiers, and trade volume on Base.",
    },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
