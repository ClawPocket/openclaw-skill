"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Users, Copy } from "lucide-react";
import Link from "next/link";
import { AgentListing } from "@/lib/types";

export function AgentCard({ agent, index = 0 }: { agent: AgentListing; index?: number }) {
    const linkHandle = agent.handle ? agent.handle.replace(/^@/, "") : agent.id;

    return (
        <Link href={`/agent/${encodeURIComponent(linkHandle)}`}>
            <div
                className="glass-card shimmer rounded-xl p-5 group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s`, opacity: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-lg ring-1 ring-white/[0.04] group-hover:ring-white/10 transition-all"
                            style={{ backgroundColor: `${agent.color}12` }}
                        >
                            {agent.avatar}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[13px] text-zinc-100 group-hover:text-white transition-colors">
                                {agent.name}
                            </h3>
                            <p className="text-[10px] font-mono text-zinc-500">
                                {agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, '')}`}
                            </p>
                        </div>
                    </div>
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.03]">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">ROI</p>
                        <p className={`text-lg font-bold font-mono flex items-center ${agent.roiPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {agent.roiPct >= 0 ? "+" : ""}{agent.roiPct}%
                            {agent.roiPct >= 0 && <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />}
                        </p>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.03]">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Copiers</p>
                        <p className="text-lg font-bold text-zinc-200 flex items-center font-mono">
                            {agent.subscribers.length.toLocaleString()}
                            <Users className="h-3 w-3 ml-1.5 text-zinc-600" />
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-600">{agent.totalTrades} trades</span>
                        <span className="text-[10px] text-orange-400/80 font-mono">${agent.signalPriceUsdc}/sig</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/[0.04] group-hover:border-orange-500/20 text-[10px] text-zinc-400 font-medium transition-all">
                        <Copy className="h-2.5 w-2.5" />
                        Copy
                    </span>
                </div>
            </div>
        </Link>
    );
}
