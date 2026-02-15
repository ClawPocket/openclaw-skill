"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { AgentCard } from "@/components/AgentCard";
import { AgentCardSkeleton } from "@/components/Skeletons";
import { WalletConnect } from "@/components/WalletConnect";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/Toast";
import {
    Plus,
    Zap,
    Wallet,
    TrendingUp,
    Users,
    Activity,
    DollarSign,
    Shield,
    RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { AgentListing } from "@/lib/types";
import Link from "next/link";

interface BackendHealth {
    status: string;
    activeAgents: number;
    storedAgents: number;
    uptime: number;
}

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [agents, setAgents] = useState<AgentListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState<BackendHealth | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        fetch("/api/agents")
            .then((r) => r.json())
            .then((data) => {
                setAgents(data);
                setLoading(false);
            })
            .catch(console.error);

        // Fetch backend health
        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "https://clawpocket-agent.onrender.com";
        fetch(`${backendUrl}/health`)
            .then((r) => r.json())
            .then(setHealth)
            .catch(() => setHealth(null));
    }, []);

    // Filter agents owned by connected wallet
    const myAgents = isConnected && address
        ? agents.filter((a) => a.ownerWallet.toLowerCase() === address.toLowerCase())
        : [];

    // Agents I'm subscribed to
    const subscribedAgents = isConnected && address
        ? agents.filter((a) => a.subscribers.includes(address))
        : [];

    // Stats
    const totalRevenue = myAgents.reduce(
        (sum, a) => sum + a.subscribers.length * parseFloat(a.signalPriceUsdc),
        0
    );
    const totalSubscribers = myAgents.reduce((sum, a) => sum + a.subscribers.length, 0);
    const avgRoi = myAgents.length > 0
        ? Math.round(myAgents.reduce((sum, a) => sum + a.roiPct, 0) / myAgents.length)
        : 0;

    // Not connected state
    if (mounted && !isConnected) {
        return (
            <MarketplaceLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in-up">
                    <div className="h-20 w-20 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <Shield className="h-10 w-10 text-orange-400" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight mb-2">Connect Wallet</h1>
                        <p className="text-sm text-zinc-500 max-w-sm">
                            Connect your Coinbase Smart Wallet to view your agents,
                            subscriptions, and revenue.
                        </p>
                    </div>
                    <WalletConnect />
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <ErrorBoundary>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-xs text-zinc-600 mt-0.5">
                                {mounted && address
                                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                                    : "Loading..."}
                            </p>
                        </div>
                        <Link href="/create">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20 text-xs h-9 px-4">
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                New Agent
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up-delay-1">
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-3.5 w-3.5 text-orange-400" />
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">My Agents</span>
                            </div>
                            <p className="text-2xl font-bold font-mono">{loading ? "—" : myAgents.length}</p>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-3.5 w-3.5 text-red-400" />
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Subscribers</span>
                            </div>
                            <p className="text-2xl font-bold font-mono">{loading ? "—" : totalSubscribers}</p>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Revenue</span>
                            </div>
                            <p className="text-2xl font-bold font-mono text-emerald-400">
                                {loading ? "—" : `$${totalRevenue.toFixed(2)}`}
                            </p>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Avg ROI</span>
                            </div>
                            <p className={`text-2xl font-bold font-mono ${avgRoi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {loading ? "—" : `${avgRoi >= 0 ? "+" : ""}${avgRoi}%`}
                            </p>
                        </div>
                    </div>

                    {/* Backend Status */}
                    <div className="glass-card rounded-xl p-4 animate-fade-in-up-delay-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-orange-400" />
                                <span className="text-xs font-semibold">Agent Cloud Status</span>
                            </div>
                            {health ? (
                                <div className="flex items-center gap-2 text-[10px]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-emerald-400 font-mono">Online</span>
                                    <span className="text-zinc-600">
                                        · {health.activeAgents} active · uptime {Math.floor(health.uptime / 60)}m
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[10px]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                                    <span className="text-zinc-500 font-mono">Offline / Sleeping</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Agents */}
                    <section className="animate-fade-in-up-delay-2">
                        <h2 className="text-sm font-semibold tracking-tight mb-3 text-zinc-400">My Agents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {loading ? (
                                [...Array(3)].map((_, i) => <AgentCardSkeleton key={i} />)
                            ) : myAgents.length > 0 ? (
                                myAgents.map((agent, i) => (
                                    <AgentCard key={agent.id} agent={agent} index={i} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center py-12 gap-3">
                                    <div className="h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-zinc-700" />
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium">No agents yet</p>
                                    <p className="text-xs text-zinc-700">Create your first agent to start earning</p>
                                    <Link href="/create">
                                        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 text-xs h-8 mt-2">
                                            <Plus className="mr-1.5 h-3 w-3" />
                                            Create Agent
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* My Subscriptions */}
                    <section className="animate-fade-in-up-delay-2">
                        <h2 className="text-sm font-semibold tracking-tight mb-3 text-zinc-400">
                            My Subscriptions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {loading ? (
                                [...Array(2)].map((_, i) => <AgentCardSkeleton key={i} />)
                            ) : subscribedAgents.length > 0 ? (
                                subscribedAgents.map((agent, i) => (
                                    <AgentCard key={agent.id} agent={agent} index={i} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center py-10 gap-2">
                                    <div className="h-10 w-10 rounded-full bg-white/[0.03] flex items-center justify-center">
                                        <RefreshCw className="h-4 w-4 text-zinc-700" />
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium">No subscriptions</p>
                                    <p className="text-xs text-zinc-700">Copy an agent to start receiving signals</p>
                                    <Link href="/explore">
                                        <Button variant="outline" className="border-white/10 text-zinc-400 text-xs h-8 mt-2">
                                            Explore Agents
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </ErrorBoundary>
        </MarketplaceLayout>
    );
}
