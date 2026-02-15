"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { AgentCard } from "@/components/AgentCard";
import { AgentCardSkeleton } from "@/components/Skeletons";
import { WalletStatus } from "@/components/WalletConnect";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Plus, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { AgentListing } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
    const [agents, setAgents] = useState<AgentListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/agents")
            .then((r) => r.json())
            .then((data) => {
                setAgents(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    return (
        <MarketplaceLayout>
            <ErrorBoundary>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-xs text-zinc-600 mt-0.5">
                                Manage your agents and subscriptions
                            </p>
                        </div>
                        <Link href="/create">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20 text-xs h-9 px-4">
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                New Agent
                            </Button>
                        </Link>
                    </div>

                    {/* Wallet */}
                    <div className="animate-fade-in-up-delay-1">
                        <WalletStatus />
                    </div>

                    {/* Agents */}
                    <section className="animate-fade-in-up-delay-2">
                        <h2 className="text-sm font-semibold tracking-tight mb-3 text-zinc-400">All Marketplace Agents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {loading ? (
                                [...Array(6)].map((_, i) => <AgentCardSkeleton key={i} />)
                            ) : agents.length > 0 ? (
                                agents.map((agent, i) => (
                                    <AgentCard key={agent.id} agent={agent} index={i} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center py-16 gap-3">
                                    <div className="h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-zinc-700" />
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium">No agents listed yet</p>
                                    <Link href="/create">
                                        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 text-xs h-8">
                                            <Plus className="mr-1.5 h-3 w-3" />
                                            Create Your First Agent
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
