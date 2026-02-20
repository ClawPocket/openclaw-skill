"use client";

import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle2, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AgentListing } from "@/lib/types";

export function AgentCard({ agent, index = 0, source }: { agent: AgentListing; index?: number; source?: string }) {
    const linkHandle = agent.handle ? agent.handle.replace(/^@/, "") : agent.id;
    const href = source ? `/agent/${encodeURIComponent(linkHandle)}?from=${source}` : `/agent/${encodeURIComponent(linkHandle)}`;

    const totalHires = agent.totalHires || 0;
    const tasksCompleted = agent.tasksCompleted || agent.totalTrades || 0;
    const dailyPrice = agent.rentalPriceUsdc || "5.00";
    const skills = agent.skills?.slice(0, 3) || [];
    const isPopular = totalHires >= 10;

    return (
        <Link href={href}>
            <div
                className="glass-card shimmer rounded-xl p-5 group cursor-pointer animate-fade-in-up hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${index * 0.06}s`, opacity: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-11 w-11 rounded-xl flex items-center justify-center text-lg ring-1 ring-white/[0.04] group-hover:ring-white/10 transition-all overflow-hidden relative"
                            style={{ backgroundColor: `${agent.color}12` }}
                        >
                            {agent.avatar.startsWith("http") ? (
                                <Image
                                    src={agent.avatar}
                                    alt={agent.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                agent.avatar
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[13px] text-zinc-100 group-hover:text-white transition-colors flex items-center gap-1.5">
                                {agent.name}
                                {isPopular && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                                        🔥 Popular
                                    </span>
                                )}
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

                {/* Description */}
                {agent.description && (
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                        {agent.description}
                    </p>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-400 font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* Hiring Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03] text-center">
                        <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-0.5">Hired</p>
                        <p className="text-sm font-bold font-mono text-zinc-200 flex items-center justify-center gap-1">
                            <Briefcase className="h-3 w-3 text-orange-400" />
                            {totalHires}
                        </p>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03] text-center">
                        <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-0.5">Tasks</p>
                        <p className="text-sm font-bold font-mono text-zinc-200 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            {tasksCompleted}
                        </p>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03] text-center">
                        <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-0.5">From</p>
                        <p className="text-sm font-bold font-mono text-emerald-400">
                            ${dailyPrice}
                        </p>
                        <p className="text-[7px] text-zinc-600">/day</p>
                    </div>
                </div>

                {/* Footer — Hire CTA */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {agent.type === "clawpocket" ? (
                            <Badge className="text-[8px] border px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/20">
                                <Zap className="h-2 w-2 mr-0.5" /> Hosted
                            </Badge>
                        ) : agent.type === "zeptoclaw" ? (
                            <Badge className="text-[8px] border px-1.5 py-0 bg-orange-500/10 text-orange-400 border-orange-500/20">
                                ZeptoClaw
                            </Badge>
                        ) : (
                            <Badge className="text-[8px] border px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                OpenClaw
                            </Badge>
                        )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 group-hover:from-orange-500/20 group-hover:to-red-500/20 border border-orange-500/20 group-hover:border-orange-500/30 text-[10px] text-orange-400 font-semibold transition-all">
                        <Sparkles className="h-3 w-3" />
                        Hire Agent
                    </span>
                </div>
            </div>
        </Link>
    );
}
