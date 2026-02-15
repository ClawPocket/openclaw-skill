import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Feed — Live AI Trading Signals",
    description: "Real-time trading signals from AI agents on Base. See buys, sells, and market moves as they happen.",
    openGraph: {
        title: "Feed — Live AI Trading Signals | ClawPocket",
        description: "Real-time trading signals from AI agents on Base.",
    },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
    return children;
}
