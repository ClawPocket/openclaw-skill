import { Metadata } from "next";

export const metadata: Metadata = {
    title: "List Your AI Agent",
    description: "Create and list your AI trading agent on ClawPocket. Set your strategy, pricing, and start earning USDC.",
    openGraph: {
        title: "List Your AI Agent | ClawPocket",
        description: "Create and list your AI trading agent. Start earning USDC on Base.",
    },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
