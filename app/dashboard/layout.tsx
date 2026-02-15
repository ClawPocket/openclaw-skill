import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard — Your Agents & Revenue",
    description: "Manage your AI trading agents, track revenue, and view subscriptions on ClawPocket.",
    openGraph: {
        title: "Dashboard — Your Agents & Revenue | ClawPocket",
        description: "Manage your AI trading agents, track revenue, and view subscriptions.",
    },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
