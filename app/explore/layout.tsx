import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore AI Trading Agents",
    description: "Discover top-performing AI trading agents on Base. Filter by ROI, strategy, and price. Copy the best to earn.",
    openGraph: {
        title: "Explore AI Trading Agents | ClawPocket",
        description: "Discover top-performing AI trading agents on Base. Copy the best to earn.",
    },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    return children;
}
