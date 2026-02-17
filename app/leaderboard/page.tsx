"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Skeleton } from "@/components/Skeletons";
import { Badge } from "@/components/ui/badge";
import {
    Trophy, TrendingUp, Users, BarChart3, ArrowUpRight,
    ChevronUp, ChevronDown, Flame, Crown, Medal,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { AgentListing } from "@/lib/types";
import { AgentAvatar } from "@/components/AgentAvatar";

type SortKey = "roi" | "trades" | "subscribers" | "revenue";

const rankIcons = [
    <Crown key="1" className="h-4 w-4 text-amber-400" />,
    <Medal key="2" className="h-4 w-4 text-zinc-300" />,
    <Medal key="3" className="h-4 w-4 text-orange-600" />,
];

export default function LeaderboardPage() {
    const [agents, setAgents] = useState<AgentListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>("roi");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        fetch("/api/agents")
            .then((r) => r.json())
            .then((data) => {
                setAgents(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    const toggleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortBy(key);
            setSortDir("desc");
        }
    };

    const sorted = useMemo(() => {
        const arr = [...agents];
        const dir = sortDir === "desc" ? -1 : 1;
        arr.sort((a, b) => {
            switch (sortBy) {
                case "roi": return (a.roiPct - b.roiPct) * dir;
                case "trades": return (a.totalTrades - b.totalTrades) * dir;
                case "subscribers": return (a.subscribers.length - b.subscribers.length) * dir;
                case "revenue":
                    return (
                        (a.subscribers.length * parseFloat(a.signalPriceUsdc) -
                            b.subscribers.length * parseFloat(b.signalPriceUsdc)) * dir
                    );
                default: return 0;
            }
        });
        return arr;
    }, [agents, sortBy, sortDir]);

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortBy !== col) return null;
        return sortDir === "desc"
            ? <ChevronDown className="h-3 w-3 ml-0.5" />
            : <ChevronUp className="h-3 w-3 ml-0.5" />;
    };

    // Top 3 stats summary
    const topAgent = sorted[0];
    const totalTrades = agents.reduce((s, a) => s + a.totalTrades, 0);
    const totalCopiers = agents.reduce((s, a) => s + a.subscribers.length, 0);

    return (
        <MarketplaceLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
                    </div>
                    <p className="text-xs text-zinc-600">Top performing AI agents ranked by performance</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 animate-fade-in-up-delay-1">
                    <div className="glass-card rounded-xl p-4 text-center">
                        <Flame className="h-4 w-4 mx-auto mb-1.5 text-amber-400" />
                        <p className="text-lg font-bold font-mono">
                            {loading ? "—" : topAgent?.name || "—"}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">#1 Agent</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <BarChart3 className="h-4 w-4 mx-auto mb-1.5 text-emerald-400" />
                        <p className="text-lg font-bold font-mono">
                            {loading ? "—" : totalTrades.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Total Trades</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <Users className="h-4 w-4 mx-auto mb-1.5 text-red-400" />
                        <p className="text-lg font-bold font-mono">
                            {loading ? "—" : totalCopiers.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Total Copiers</p>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up-delay-2">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-600 border-b border-white/[0.04] bg-white/[0.01]">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4 md:col-span-3">Agent</div>
                        <div className="col-span-2 hidden md:block">Persona</div>
                        <button
                            onClick={() => toggleSort("roi")}
                            className="col-span-2 flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            ROI <SortIcon col="roi" />
                        </button>
                        <button
                            onClick={() => toggleSort("trades")}
                            className="col-span-2 hidden md:flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Trades <SortIcon col="trades" />
                        </button>
                        <button
                            onClick={() => toggleSort("subscribers")}
                            className="col-span-2 flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Copiers <SortIcon col="subscribers" />
                        </button>
                        <button
                            onClick={() => toggleSort("revenue")}
                            className="col-span-3 md:col-span-2 flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Revenue <SortIcon col="revenue" />
                        </button>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                    <Skeleton className="col-span-1 h-4 w-6" />
                                    <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="col-span-2 hidden md:block h-4 w-14" />
                                    <Skeleton className="col-span-2 h-4 w-12" />
                                    <Skeleton className="col-span-2 hidden md:block h-4 w-10" />
                                    <Skeleton className="col-span-2 h-4 w-10" />
                                    <Skeleton className="col-span-3 md:col-span-2 h-4 w-14" />
                                </div>
                            ))}
                        </div>
                    ) : sorted.length > 0 ? (
                        sorted.map((agent, i) => {
                            const revenue = agent.subscribers.length * parseFloat(agent.signalPriceUsdc);
                            return (
                                <Link
                                    key={agent.id}
                                    href={`/agent/${agent.id}`}
                                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0 group"
                                >
                                    {/* Rank */}
                                    <div className="col-span-1 flex items-center">
                                        {i < 3 ? (
                                            rankIcons[i]
                                        ) : (
                                            <span className="text-xs font-mono text-zinc-600">{i + 1}</span>
                                        )}
                                    </div>

                                    {/* Agent */}
                                    <div className="col-span-4 md:col-span-3 flex items-center gap-2.5 min-w-0">
                                        <div
                                            className="h-8 w-8 rounded-lg flex items-center justify-center text-sm shrink-0 ring-1 ring-white/[0.06] group-hover:ring-white/10 transition-all overflow-hidden relative"
                                            style={{ backgroundColor: `${agent.color}12` }}
                                        >
                                            <AgentAvatar
                                                avatar={agent.avatar}
                                                name={agent.name}
                                                size={32}
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                                                {agent.name}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 font-mono truncate">
                                                {agent.handle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Persona */}
                                    <div className="col-span-2 hidden md:block">
                                        <Badge
                                            className="text-[9px] border px-1.5 py-0"
                                            style={{
                                                backgroundColor: `${agent.color}10`,
                                                color: agent.color,
                                                borderColor: `${agent.color}25`,
                                            }}
                                        >
                                            {agent.persona}
                                        </Badge>
                                    </div>

                                    {/* ROI */}
                                    <div className="col-span-2">
                                        <span className={`text-xs font-mono font-semibold flex items-center ${agent.roiPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            {agent.roiPct >= 0 && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                                            {agent.roiPct >= 0 ? "+" : ""}{agent.roiPct}%
                                        </span>
                                    </div>

                                    {/* Trades */}
                                    <div className="col-span-2 hidden md:block">
                                        <span className="text-xs font-mono text-zinc-300">{agent.totalTrades}</span>
                                    </div>

                                    {/* Subscribers */}
                                    <div className="col-span-2">
                                        <span className="text-xs font-mono text-zinc-300">{agent.subscribers.length}</span>
                                    </div>

                                    {/* Revenue */}
                                    <div className="col-span-3 md:col-span-2">
                                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                                            ${revenue.toFixed(2)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center py-16 gap-3">
                            <div className="h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-zinc-700" />
                            </div>
                            <p className="text-sm text-zinc-500 font-medium">No agents on the leaderboard yet</p>
                            <Link href="/create" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                                Create the first agent →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </MarketplaceLayout>
    );
}
