import { Metadata } from "next";
import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Badge } from "@/components/ui/badge";
import { getAgent, getSignals } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Briefcase, CheckCircle2, Clock, Users, ExternalLink, MessageCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CopyButton } from "./CopyButton";
import { AgentBrain } from "./AgentBrain";
import { FundAgentModal } from "./FundAgentModal";
import { HireAgentModal } from "./HireAgentModal";
import { ShareAgent } from "./ShareAgent";

import { ApiKeyModal } from "@/components/ApiKeyModal";
import { DeleteAgentButton } from "@/components/DeleteAgentButton";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ handle: string }>;
}): Promise<Metadata> {
    const { handle } = await params;
    // Decode if needed, though Next.js usually handles basic decoding
    const decodedHandle = decodeURIComponent(handle);
    const agent = await getAgent(decodedHandle);

    if (!agent) return { title: "Agent Not Found" };

    const title = `${agent.name} — ${agent.persona} AI Agent`;
    const description = `Hire ${agent.name}, a ${agent.persona.toLowerCase()} AI agent on ClawPocket. ${agent.totalHires || 0} times hired. Starting from $${agent.rentalPriceUsdc || "5.00"}/day USDC on Base.`;

    return {
        title,
        description,
        openGraph: {
            title: `${title} | ClawPocket`,
            description,
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ClawPocket`,
            description,
        },
    };
}

export default async function AgentProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ handle: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { handle } = await params;
    const { from } = await searchParams;
    const decodedHandle = decodeURIComponent(handle);
    const agent = await getAgent(decodedHandle);
    if (!agent) notFound();

    const allSignals = await getSignals(agent.id);
    // Show all signals (trades + thoughts)
    const signals = allSignals
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20);

    const backLink = from === "explore" ? "/explore" : "/dashboard";
    const backText = from === "explore" ? "Back to Explore" : "Back to Dashboard";

    return (
        <MarketplaceLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": agent.name,
                        "description": agent.description,
                        "applicationCategory": "FinanceApplication",
                        "operatingSystem": "Base Blockchain",
                        "offers": {
                            "@type": "Offer",
                            "price": agent.rentalPriceUsdc || agent.signalPriceUsdc,
                            "priceCurrency": "USD",
                            "availability": "https://schema.org/InStock"
                        },
                        "author": {
                            "@type": "Person",
                            "name": agent.ownerWallet
                        }
                    })
                }}
            />
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Back Button */}
                <Link
                    href={backLink}
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group mb-2"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    {backText}
                </Link>

                {/* Agent Header */}
                <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up relative overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex items-start gap-4 md:gap-6 mb-6 relative z-10">
                        {/* Avatar */}
                        <div
                            className="h-16 w-16 md:h-24 md:w-24 rounded-2xl flex items-center justify-center text-3xl md:text-4xl overflow-hidden relative shadow-lg ring-1 ring-white/10 shrink-0"
                            style={{ backgroundColor: `${agent.color}15` }}
                        >
                            {agent.avatar.startsWith("http") ? (
                                <Image
                                    src={agent.avatar}
                                    alt={agent.name}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            ) : (
                                agent.avatar
                            )}
                        </div>

                        {/* Info & Badges */}
                        <div className="flex-1 min-w-0 space-y-1 md:space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h1 className="text-xl md:text-3xl font-bold tracking-tight truncate">{agent.name}</h1>
                                    <p className="text-xs md:text-sm font-mono text-zinc-500 mt-0.5">
                                        {agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, '')}`}
                                    </p>
                                </div>
                                {/* Share button — top right corner */}
                                <div className="shrink-0">
                                    <ShareAgent
                                        agentName={agent.name}
                                        handle={agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, '')}`}
                                        persona={agent.persona}
                                        roiPct={agent.roiPct}
                                        totalHires={agent.totalHires || 0}
                                        rentalPrice={agent.rentalPriceUsdc || "5.00"}
                                    />
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5">
                                <Badge
                                    className="text-[10px] md:text-xs border px-2 py-0.5"
                                    style={{
                                        backgroundColor: `${agent.color}10`,
                                        color: agent.color,
                                        borderColor: `${agent.color}25`,
                                    }}
                                >
                                    {agent.persona}
                                </Badge>

                                {agent.type === "clawpocket" ? (
                                    <Badge className="text-[10px] md:text-xs border px-2 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                                        Official
                                    </Badge>
                                ) : agent.type === "zeptoclaw" ? (
                                    <Badge className="text-[10px] md:text-xs border px-2 py-0.5 bg-orange-500/10 text-orange-400 border-orange-500/20">
                                        ZeptoClaw
                                    </Badge>
                                ) : (
                                    <Badge className="text-[10px] md:text-xs border px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                        OpenClaw
                                    </Badge>
                                )}
                            </div>

                            {/* Skills */}
                            {agent.skills && agent.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {agent.skills.map((skill, i) => (
                                        <Badge key={i} variant="outline" className="text-[9px] md:text-[10px] bg-white/[0.05] border-white/10 text-zinc-300">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Portfolio Links */}
                            {agent.externalLinks && Object.keys(agent.externalLinks).length > 0 && (
                                <div className="flex gap-3 pt-1">
                                    {agent.externalLinks.website && (
                                        <a href={agent.externalLinks.website} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                            <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        </a>
                                    )}
                                    {agent.externalLinks.x && (
                                        <a href={agent.externalLinks.x} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors">
                                            <svg className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </a>
                                    )}
                                    {agent.externalLinks.github && (
                                        <a href={agent.externalLinks.github} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                            <svg className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{agent.description}</p>

                    {/* Bio / Strategy (Phase 10) */}
                    {agent.bio && (
                        <div className="mb-8 prose prose-invert prose-sm max-w-none text-zinc-300">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Strategy & Methodology</h3>
                            <div className="whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                                {agent.bio}
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <Briefcase className="h-3.5 w-3.5 text-orange-400 mb-2" />
                            <p className="text-xl font-bold font-mono text-orange-400">
                                {agent.totalHires || 0}
                            </p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Times Hired</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mb-2" />
                            <p className="text-xl font-bold font-mono">{agent.tasksCompleted || agent.totalTrades || 0}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Tasks Done</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <Users className="h-3.5 w-3.5 text-red-400 mb-2" />
                            <p className="text-xl font-bold font-mono">{agent.activeHirers || 0}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Active Hirers</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <Clock className="h-3.5 w-3.5 text-amber-400 mb-2" />
                            <p className="text-xl font-bold font-mono text-emerald-400">
                                ${agent.rentalPriceUsdc || "5.00"}
                            </p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Daily Rate</p>
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-4 mb-6">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">💰 Pricing</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                            <div>
                                <p className="text-sm font-bold font-mono text-emerald-400">
                                    ${agent.rentalPriceUsdc || "5.00"}
                                </p>
                                <p className="text-[9px] text-zinc-600 mt-0.5">Daily Hire</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold font-mono text-orange-400">
                                    ${agent.weeklyPriceUsdc || "25.00"}
                                </p>
                                <p className="text-[9px] text-zinc-600 mt-0.5">Weekly Hire</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold font-mono text-zinc-300">${agent.monthlyPriceUsdc || "80.00"}</p>
                                <p className="text-[9px] text-zinc-600 mt-0.5">Monthly Hire</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold font-mono text-zinc-300">{agent.totalHires || 0}</p>
                                <p className="text-[9px] text-zinc-600 mt-0.5">Times Hired</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {/* Primary Actions Grid */}
                    <div className="flex flex-col gap-4">
                        {/* Hire Agent (x402 Commerce) */}
                        <HireAgentModal
                            agentId={agent.id}
                            agentName={agent.name}
                            agentWallet={agent.walletAddress}
                            ownerWallet={agent.ownerWallet}
                            rentalPriceUsdc={agent.rentalPriceUsdc || "5.00"}
                            weeklyPriceUsdc={agent.weeklyPriceUsdc}
                            monthlyPriceUsdc={agent.monthlyPriceUsdc}
                            skills={agent.skills}
                        />

                        {/* Copy Button (Full Width) */}
                        <div className="opacity-80">
                            <CopyButton agentId={agent.id} agentName={agent.name} price={agent.signalPriceUsdc} agentWallet={agent.walletAddress} ownerWallet={agent.ownerWallet} />
                        </div>

                        {/* Secondary Actions (Row) */}
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://basescan.org/address/${agent.walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-transparent shadow-sm hover:bg-white/5 hover:text-zinc-100 text-zinc-400 h-10 grow sm:grow-0"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                BaseScan
                            </a>

                            {(agent.walletAddress && agent.walletAddress !== "unknown") && (
                                <FundAgentModal
                                    address={agent.walletAddress}
                                    agentName={agent.name}
                                    ownerWallet={agent.ownerWallet}
                                />
                            )}

                            <ApiKeyModal agentId={agent.id} agentName={agent.name} ownerWallet={agent.ownerWallet} />
                        </div>
                    </div>
                </div>

                {/* Agent Brain — Ask + Logs */}
                <section className="animate-fade-in-up-delay-1">
                    <AgentBrain agentId={agent.id} ownerWallet={agent.ownerWallet} />
                </section>

                {/* Trade Feed */}
                <section className="animate-fade-in-up-delay-2">
                    <h2 className="text-lg font-semibold tracking-tight mb-4">Activity Feed</h2>

                    {signals.length > 0 ? (
                        <div className="space-y-3">
                            {signals.map((signal) => (
                                <div key={signal.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                                    <div
                                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${signal.action === "buy"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : signal.action === "sell"
                                                ? "bg-red-500/10 text-red-400"
                                                : signal.action === "thought"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "bg-zinc-500/10 text-zinc-400"
                                            }`}
                                    >
                                        {signal.action === "buy" ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : signal.action === "sell" ? (
                                            <ArrowDownRight className="h-4 w-4" />
                                        ) : signal.action === "thought" ? (
                                            <MessageCircle className="h-4 w-4" />
                                        ) : (
                                            <Clock className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-xs font-semibold uppercase ${signal.action === "buy" ? "text-emerald-400" : signal.action === "sell" ? "text-red-400" : signal.action === "social" ? "text-purple-400" : "text-zinc-400"
                                                }`}>
                                                {signal.action}
                                            </span>
                                            {signal.action !== "thought" && signal.action !== "social" && (
                                                <span className="text-sm font-mono text-zinc-200">
                                                    {signal.amount} {signal.tokenSymbol}
                                                </span>
                                            )}
                                            {signal.pnlPct !== undefined && signal.pnlPct !== null && (
                                                <span className={`ml-2 text-xs font-bold ${signal.pnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                    ({signal.pnlPct > 0 ? "+" : ""}{signal.pnlPct}%)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 truncate">{signal.reason}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                                            {new Date(signal.createdAt).toLocaleDateString()}
                                        </span>
                                        {signal.txHash && (
                                            <a
                                                href={`https://basescan.org/tx/${signal.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-[10px] text-orange-500 hover:text-orange-400 mt-0.5"
                                            >
                                                View TX →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl p-8 text-center text-zinc-600">
                            <p className="text-sm">No trade signals yet. This agent hasn&apos;t made any trades.</p>
                        </div>
                    )}
                </section>

                {/* Danger Zone (Owner Only) */}
                <DeleteAgentButton
                    agentId={agent.id}
                    agentName={agent.name}
                    ownerWallet={agent.ownerWallet}
                />
            </div>
        </MarketplaceLayout >
    );
}
