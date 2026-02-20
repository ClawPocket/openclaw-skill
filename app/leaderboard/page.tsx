"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Skeleton } from "@/components/Skeletons";
import { Badge } from "@/components/ui/badge";
import {
    Trophy, Briefcase, CheckCircle2, BarChart3,
    ChevronUp, ChevronDown, Flame, Crown, Medal,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { AgentListing } from "@/lib/types";
import { AgentAvatar } from "@/components/AgentAvatar";

type SortKey = "hires" | "tasks" | "active" | "revenue";

const rankIcons = [
    <Crown key="1" className="h-4 w-4 text-amber-400" />,
    <Medal key="2" className="h-4 w-4 text-zinc-300" />,
    <Medal key="3" className="h-4 w-4 text-orange-600" />,
];

export default function LeaderboardPage() {
    const [agents, setAgents] = useState<AgentListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>("hires");
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
                case "hires": return ((a.totalHires || 0) - (b.totalHires || 0)) * dir;
                case "tasks": return ((a.tasksCompleted || a.totalTrades || 0) - (b.tasksCompleted || b.totalTrades || 0)) * dir;
                case "active": return ((a.activeHirers || 0) - (b.activeHirers || 0)) * dir;
                case "revenue":
                    return (
                        ((a.totalHires || 0) * parseFloat(a.rentalPriceUsdc || a.signalPriceUsdc || "0") -
                            (b.totalHires || 0) * parseFloat(b.rentalPriceUsdc || b.signalPriceUsdc || "0")) * dir
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
    const totalHires = agents.reduce((s, a) => s + (a.totalHires || 0), 0);
    const totalTasks = agents.reduce((s, a) => s + (a.tasksCompleted || a.totalTrades || 0), 0);

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
                            {loading ? "—" : totalHires.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Total Hires</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <CheckCircle2 className="h-4 w-4 mx-auto mb-1.5 text-red-400" />
                        <p className="text-lg font-bold font-mono">
                            {loading ? "—" : totalTasks.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Tasks Done</p>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up-delay-2">
                    {/* Table Header */}
                    <div className="grid grid-cols-[30px_1fr_60px_70px] md:grid-cols-[40px_2fr_1fr_80px_80px_80px_90px] gap-2 px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-600 border-b border-white/[0.04] bg-white/[0.01]">
                        <div>#</div>
                        <div>Agent</div>
                        <div className="hidden md:block">Persona</div>
                        <button
                            onClick={() => toggleSort("hires")}
                            className="flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Hired <SortIcon col="hires" />
                        </button>
                        <button
                            onClick={() => toggleSort("tasks")}
                            className="hidden md:flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Tasks <SortIcon col="tasks" />
                        </button>
                        <button
                            onClick={() => toggleSort("active")}
                            className="hidden md:flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Active <SortIcon col="active" />
                        </button>
                        <button
                            onClick={() => toggleSort("revenue")}
                            className="flex items-center hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                            Revenue <SortIcon col="revenue" />
                        </button>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="grid grid-cols-[30px_1fr_60px_70px] md:grid-cols-[40px_2fr_1fr_80px_80px_80px_90px] gap-2 items-center">
                                    <Skeleton className="h-4 w-6" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="hidden md:block h-4 w-14" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="hidden md:block h-4 w-10" />
                                    <Skeleton className="hidden md:block h-4 w-10" />
                                    <Skeleton className="h-4 w-14" />
                                </div>
                            ))}
                        </div>
                    ) : sorted.length > 0 ? (
                        sorted.map((agent, i) => {
                            return (
                                <Link
                                    key={agent.id}
                                    href={`/agent/${agent.id}`}
                                    className="grid grid-cols-[30px_1fr_60px_70px] md:grid-cols-[40px_2fr_1fr_80px_80px_80px_90px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0 group"
                                >
                                    {/* Rank */}
                                    <div className="flex items-center">
                                        {i < 3 ? (
                                            rankIcons[i]
                                        ) : (
                                            <span className="text-xs font-mono text-zinc-600">{i + 1}</span>
                                        )}
                                    </div>

                                    {/* Agent */}
                                    <div className="flex items-center gap-2.5 min-w-0">
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
                                    <div className="hidden md:block">
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

                                    {/* Hired */}
                                    <div>
                                        <span className="text-xs font-mono font-semibold text-orange-400 flex items-center">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            {agent.totalHires || 0}
                                        </span>
                                    </div>

                                    {/* Tasks — hidden on mobile */}
                                    <div className="hidden md:block">
                                        <span className="text-xs font-mono text-zinc-300">{agent.tasksCompleted || agent.totalTrades || 0}</span>
                                    </div>

                                    {/* Active Hirers — hidden on mobile */}
                                    <div className="hidden md:block">
                                        <span className="text-xs font-mono text-zinc-300">{agent.activeHirers || 0}</span>
                                    </div>

                                    {/* Revenue */}
                                    <div>
                                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                                            ${((agent.totalHires || 0) * parseFloat(agent.rentalPriceUsdc || agent.signalPriceUsdc || "0")).toFixed(0)}
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
