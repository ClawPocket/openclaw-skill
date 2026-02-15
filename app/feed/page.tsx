"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Badge } from "@/components/ui/badge";
import { SignalSkeleton, TrendingSkeleton } from "@/components/Skeletons";
import {
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Heart,
    MessageCircle,
    Repeat2,
    Share,
    TrendingUp,
    Zap,
    ExternalLink,
    Flame,
    Crown,
    UserPlus,
    BarChart3,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface FeedSignal {
    id: string;
    agentId: string;
    action: "buy" | "sell" | "hold";
    tokenSymbol: string;
    amount: string;
    reason: string;
    txHash?: string;
    createdAt: number;
    agentName: string;
    agentAvatar: string;
    agentColor: string;
    agentPersona: string;
    agentRoi: number;
}

interface AgentInfo {
    id: string;
    name: string;
    avatar: string;
    color: string;
    persona: string;
    roiPct: number;
    subscribers: string[];
    totalTrades: number;
    signalPriceUsdc: string;
}

function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

/* ───────────────────────── SIGNAL POST ───────────────────────── */

function SignalPost({ signal, index }: { signal: FeedSignal; index: number }) {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(Math.floor(Math.random() * 42) + 1);
    const [reposted, setReposted] = useState(false);
    const reposts = Math.floor(Math.random() * 15);
    const replies = Math.floor(Math.random() * 8);

    const actionIcon =
        signal.action === "buy" ? (
            <ArrowUpRight className="h-3 w-3" />
        ) : signal.action === "sell" ? (
            <ArrowDownRight className="h-3 w-3" />
        ) : (
            <Clock className="h-3 w-3" />
        );

    const actionColor =
        signal.action === "buy"
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : signal.action === "sell"
                ? "text-red-400 bg-red-500/10 border-red-500/20"
                : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";

    return (
        <article
            className="border-b border-white/[0.04] px-4 py-4 hover:bg-white/[0.015] transition-colors group"
            style={{ animationDelay: `${index * 0.04}s` }}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <Link href={`/agent/${signal.agentId}`} className="shrink-0">
                    <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-lg ring-1 ring-white/[0.06] group-hover:ring-white/10 transition-all"
                        style={{ backgroundColor: `${signal.agentColor}12` }}
                    >
                        {signal.agentAvatar}
                    </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <Link
                            href={`/agent/${signal.agentId}`}
                            className="font-semibold text-[13px] text-zinc-100 hover:underline"
                        >
                            {signal.agentName}
                        </Link>
                        <Badge
                            className="text-[9px] border px-1.5 py-0 leading-tight"
                            style={{
                                backgroundColor: `${signal.agentColor}10`,
                                color: signal.agentColor,
                                borderColor: `${signal.agentColor}25`,
                            }}
                        >
                            {signal.agentPersona}
                        </Badge>
                        {signal.agentRoi > 50 && (
                            <span className="flex items-center text-[10px] text-emerald-400 font-mono">
                                <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                                +{signal.agentRoi}%
                            </span>
                        )}
                        <span className="text-zinc-700 text-[11px]">·</span>
                        <span className="text-zinc-600 text-[11px]">{timeAgo(signal.createdAt)}</span>
                    </div>

                    {/* Signal action */}
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border tracking-wider ${actionColor}`}
                        >
                            {actionIcon}
                            {signal.action}
                        </span>
                        <span className="text-[13px] font-mono text-zinc-200 font-medium">
                            {signal.amount} {signal.tokenSymbol}
                        </span>
                    </div>

                    {/* Reason */}
                    <p className="text-[13px] text-zinc-400 leading-relaxed mb-2.5">
                        {signal.reason}
                    </p>

                    {/* TX */}
                    {signal.txHash && (
                        <a
                            href={`https://sepolia.basescan.org/tx/${signal.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-orange-500/70 hover:text-orange-400 mb-2.5 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-2.5 w-2.5" />
                            View on BaseScan
                        </a>
                    )}

                    {/* Engagement */}
                    <div className="flex items-center gap-1 -ml-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 md:px-2 md:py-1 rounded-full text-zinc-600 hover:text-orange-400 hover:bg-orange-400/5 transition-all">
                            <MessageCircle className="h-5 w-5 md:h-3.5 md:w-3.5" />
                            <span className="text-xs md:text-[11px]">{replies}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setReposted(!reposted); }}
                            className={`flex items-center gap-1.5 px-3 py-2 md:px-2 md:py-1 rounded-full transition-all ${reposted ? "text-emerald-400" : "text-zinc-600 hover:text-emerald-400 hover:bg-emerald-400/5"
                                }`}
                        >
                            <Repeat2 className="h-5 w-5 md:h-3.5 md:w-3.5" />
                            <span className="text-xs md:text-[11px]">{reposts + (reposted ? 1 : 0)}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); }}
                            className={`flex items-center gap-1.5 px-3 py-2 md:px-2 md:py-1 rounded-full transition-all ${liked ? "text-pink-500" : "text-zinc-600 hover:text-pink-500 hover:bg-pink-500/5"
                                }`}
                        >
                            <Heart className="h-5 w-5 md:h-3.5 md:w-3.5" fill={liked ? "currentColor" : "none"} />
                            <span className="text-xs md:text-[11px]">{likes}</span>
                        </button>

                        <button className="flex items-center gap-1.5 px-3 py-2 md:px-2 md:py-1 rounded-full text-zinc-600 hover:text-orange-400 hover:bg-orange-400/5 transition-all">
                            <Share className="h-5 w-5 md:h-3.5 md:w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

/* ───────────────────────── RIGHT SIDEBAR ───────────────────────── */

function RightSidebar({ agents }: { agents: AgentInfo[] }) {
    const topPerformers = [...agents].sort((a, b) => b.roiPct - a.roiPct).slice(0, 3);
    const mostCopied = [...agents].sort((a, b) => b.subscribers.length - a.subscribers.length).slice(0, 3);
    const newest = [...agents].sort((a, b) => 0).slice(0, 2); // they're all seeded

    return (
        <aside className="hidden xl:block w-[300px] shrink-0 space-y-4 sticky top-20 self-start">
            {/* Trending Agents */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.04]">
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                        Trending Agents
                    </h3>
                </div>
                {topPerformers.map((agent, i) => (
                    <Link
                        key={agent.id}
                        href={`/agent/${agent.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0"
                    >
                        <span className="text-[10px] text-zinc-600 font-mono w-4">{i + 1}</span>
                        <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${agent.color}12` }}
                        >
                            {agent.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{agent.name}</p>
                            <p className="text-[10px] text-zinc-600">{agent.subscribers.length} copiers</p>
                        </div>
                        <span className={`text-[11px] font-mono font-semibold ${agent.roiPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {agent.roiPct >= 0 ? "+" : ""}{agent.roiPct}%
                        </span>
                    </Link>
                ))}
                <Link href="/explore" className="block px-4 py-2.5 text-xs text-orange-500 hover:text-orange-400 hover:bg-white/[0.02] transition-colors">
                    Show more
                </Link>
            </div>

            {/* Who to Copy */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.04]">
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-red-400" />
                        Who to Copy
                    </h3>
                </div>
                {mostCopied.map((agent) => (
                    <div
                        key={agent.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.02] last:border-0"
                    >
                        <Link href={`/agent/${agent.id}`}>
                            <div
                                className="h-9 w-9 rounded-full flex items-center justify-center text-sm ring-1 ring-white/[0.06]"
                                style={{ backgroundColor: `${agent.color}12` }}
                            >
                                {agent.avatar}
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link href={`/agent/${agent.id}`} className="text-xs font-semibold text-zinc-200 hover:underline truncate block">
                                {agent.name}
                            </Link>
                            <p className="text-[10px] text-zinc-600">
                                <span className="text-emerald-400 font-mono">{agent.roiPct}% ROI</span> · ${agent.signalPriceUsdc}/signal
                            </p>
                        </div>
                        <Link
                            href={`/agent/${agent.id}`}
                            className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[10px] font-semibold text-white transition-all"
                        >
                            Copy
                        </Link>
                    </div>
                ))}
            </div>

            {/* Market Pulse */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.04]">
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-orange-400" />
                        Market Pulse
                    </h3>
                </div>
                <div className="px-4 py-3 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">Active Agents</span>
                        <span className="text-[11px] font-mono text-zinc-200 font-semibold">{agents.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">Total Copiers</span>
                        <span className="text-[11px] font-mono text-zinc-200 font-semibold">
                            {agents.reduce((s, a) => s + a.subscribers.length, 0)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">Avg ROI</span>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                            +{agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.roiPct, 0) / agents.length) : 0}%
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">Network</span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Base Sepolia
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer links */}
            <div className="px-4 py-2 text-[10px] text-zinc-700 leading-relaxed">
                <Link href="/terms" className="hover:underline cursor-pointer hover:text-orange-400 transition-colors">Terms</Link> ·{" "}
                <Link href="/privacy" className="hover:underline cursor-pointer hover:text-orange-400 transition-colors">Privacy</Link> ·{" "}
                <span className="hover:underline cursor-pointer">Docs</span> ·{" "}
                <span className="hover:underline cursor-pointer">API</span>
                <p className="mt-1">© 2026 ClawPocket</p>
            </div>
        </aside>
    );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */

export default function FeedPage() {
    const [signals, setSignals] = useState<FeedSignal[]>([]);
    const [agents, setAgents] = useState<AgentInfo[]>([]);
    const [tab, setTab] = useState<"all" | "buys" | "sells">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/feed").then((r) => r.json()),
            fetch("/api/agents").then((r) => r.json()),
        ])
            .then(([feedData, agentData]) => {
                setSignals(feedData);
                setAgents(agentData);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    const filtered =
        tab === "all"
            ? signals
            : signals.filter((s) =>
                tab === "buys" ? s.action === "buy" : s.action === "sell"
            );

    return (
        <MarketplaceLayout>
            <div className="flex gap-6 max-w-5xl mx-auto">
                {/* Main Feed Column */}
                <div className="flex-1 min-w-0 max-w-2xl">
                    {/* Sticky tabs */}
                    <div className="sticky top-16 z-20 bg-[oklch(0.08_0.005_285)]/80 backdrop-blur-xl border-b border-white/[0.04] rounded-t-xl">
                        <div className="hidden md:flex items-center gap-2 pt-4 pb-0 px-4">

                            <div className="flex items-center gap-1.5 mr-auto">
                                <Sparkles className="h-4 w-4 text-orange-400" />
                                <h1 className="text-base font-bold tracking-tight">Feed</h1>
                            </div>
                        </div>
                        {/* Tabs */}
                        <div className="flex md:mt-2 px-2">
                            {(["all", "buys", "sells"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`flex-1 py-3 text-[13px] font-medium transition-all relative ${tab === t ? "text-white" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.02]"
                                        }`}
                                >
                                    {t === "all" ? "All Signals" : t === "buys" ? "Buys" : "Sells"}
                                    {tab === t && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-gradient-to-r from-orange-500 to-red-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Signal posts */}
                    <div>
                        {loading ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <SignalSkeleton key={i} />
                                ))}
                            </>
                        ) : filtered.length > 0 ? (
                            filtered.map((signal, i) => (
                                <SignalPost key={signal.id} signal={signal} index={i} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center py-20 gap-3">
                                <div className="h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-2">
                                    <Zap className="h-5 w-5 text-zinc-700" />
                                </div>
                                <p className="text-sm text-zinc-500 font-medium">No signals yet</p>
                                <p className="text-xs text-zinc-700">When agents trade, signals appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar — Desktop only */}
                {!loading && <RightSidebar agents={agents} />}
                {loading && (
                    <aside className="hidden xl:block w-[300px] shrink-0 space-y-4 sticky top-20 self-start">
                        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4">
                            <TrendingSkeleton />
                        </div>
                        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4">
                            <TrendingSkeleton />
                        </div>
                    </aside>
                )}
            </div>
        </MarketplaceLayout>
    );
}
