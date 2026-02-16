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
    XCircle,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
    const [unsubbing, setUnsubbing] = useState<string | null>(null);

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
        ? agents.filter((a) => a.subscribers.some((s) => s.toLowerCase() === address.toLowerCase()))
        : [];

    // Stats — revenue is 90% (agent share after platform fee)
    const totalRevenue = myAgents.reduce(
        (sum, a) => sum + a.subscribers.length * parseFloat(a.signalPriceUsdc) * 0.9,
        0
    );
    const platformFees = myAgents.reduce(
        (sum, a) => sum + a.subscribers.length * parseFloat(a.signalPriceUsdc) * 0.1,
        0
    );
    const totalSubscribers = myAgents.reduce((sum, a) => sum + a.subscribers.length, 0);
    const avgRoi = myAgents.length > 0
        ? Math.round(myAgents.reduce((sum, a) => sum + a.roiPct, 0) / myAgents.length)
        : 0;

    // Unsubscribe handler
    const handleUnsub = useCallback(async (agentId: string, agentName: string) => {
        if (!address) return;
        setUnsubbing(agentId);

        try {
            const res = await fetch(`/api/agents/${agentId}/unsub`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriberWallet: address.toLowerCase() }),
            });
            const data = await res.json();

            if (res.ok) {
                setAgents((prev) =>
                    prev.map((a) =>
                        a.id === agentId
                            ? { ...a, subscribers: a.subscribers.filter((s) => s.toLowerCase() !== address.toLowerCase()) }
                            : a
                    )
                );
                showToast(`Unsubscribed from ${agentName}`, "success");
            } else {
                showToast(data.error || "Failed to unsubscribe", "error");
            }
        } catch {
            showToast("Network error", "error");
        } finally {
            setUnsubbing(null);
        }
    }, [address]);

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
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-zinc-600 font-mono">
                                    {mounted && address
                                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                                        : "Loading..."}
                                </span>
                                {mounted && address && (
                                    <a
                                        href={`https://basescan.org/address/${address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-orange-500 hover:text-orange-400 transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
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
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Revenue (90%)</span>
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

                    {/* Revenue Breakdown */}
                    {!loading && myAgents.length > 0 && (
                        <div className="glass-card rounded-xl p-4 animate-fade-in-up-delay-1">
                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Wallet className="h-3.5 w-3.5 text-amber-400" />
                                Revenue Breakdown
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                <div>
                                    <p className="text-sm font-bold font-mono text-emerald-400">${totalRevenue.toFixed(4)}</p>
                                    <p className="text-[9px] text-zinc-600 mt-0.5">Your Earnings (90%)</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold font-mono text-orange-400">${platformFees.toFixed(4)}</p>
                                    <p className="text-[9px] text-zinc-600 mt-0.5">Platform Fee (10%)</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold font-mono text-zinc-300">${(totalRevenue + platformFees).toFixed(4)}</p>
                                    <p className="text-[9px] text-zinc-600 mt-0.5">Total Volume</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold font-mono text-zinc-300">{totalSubscribers}</p>
                                    <p className="text-[9px] text-zinc-600 mt-0.5">Paying Subscribers</p>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    <AgentCard key={agent.id} agent={agent} index={i} source="dashboard" />
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

                    {/* My Subscriptions — with unsubscribe */}
                    <section className="animate-fade-in-up-delay-2">
                        <h2 className="text-sm font-semibold tracking-tight mb-3 text-zinc-400">
                            My Subscriptions ({subscribedAgents.length})
                        </h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[...Array(2)].map((_, i) => <AgentCardSkeleton key={i} />)}
                            </div>
                        ) : subscribedAgents.length > 0 ? (
                            <div className="space-y-2">
                                {subscribedAgents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        className="flex items-center gap-3 glass-card rounded-xl p-4 transition-colors hover:bg-white/[0.03]"
                                    >
                                        <Link href={`/agent/${agent.id}?from=dashboard`} className="shrink-0">
                                            <div
                                                className="h-10 w-10 rounded-lg flex items-center justify-center text-lg hover:ring-1 hover:ring-white/10 transition-all"
                                                style={{ backgroundColor: `${agent.color}12` }}
                                            >
                                                {agent.avatar}
                                            </div>
                                        </Link>
                                        <Link href={`/agent/${agent.id}?from=dashboard`} className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-zinc-200 hover:underline">{agent.name}</p>
                                            <p className="text-[10px] text-zinc-600">
                                                ${agent.signalPriceUsdc}/signal · {agent.totalTrades} trades · {agent.subscribers.length} copiers
                                            </p>
                                        </Link>
                                        <span className={`text-xs font-mono font-bold ${agent.roiPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            {agent.roiPct >= 0 ? "+" : ""}{agent.roiPct}%
                                        </span>
                                        <button
                                            onClick={() => handleUnsub(agent.id, agent.name)}
                                            disabled={unsubbing === agent.id}
                                            className="ml-1 p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                            title="Unsubscribe"
                                        >
                                            {unsubbing === agent.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <XCircle className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-10 gap-2">
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
                    </section>
                </div>
            </ErrorBoundary>
        </MarketplaceLayout>
    );
}
