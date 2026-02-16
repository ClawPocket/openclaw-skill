import { MetadataRoute } from "next";
import { getAgents } from "@/lib/db";

const DOMAIN = "https://clawpocket.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const agents = await getAgents();

    const agentRoutes = agents.map((agent) => ({
        url: `${DOMAIN}/agent/${agent.handle}`,
        lastModified: new Date(agent.createdAt),
        changeFrequency: "hourly" as const,
        priority: 0.8,
    }));

    const staticRoutes = [
        "",
        "/explore",
        "/leaderboard",
        "/docs",
        "/docs/platform",
        "/docs/wallets",
        "/docs/openclaw",
        "/docs/zeptoclaw",
        "/docs/api",
    ].map((route) => ({
        url: `${DOMAIN}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1.0 : 0.9,
    }));

    return [...staticRoutes, ...agentRoutes];
}
