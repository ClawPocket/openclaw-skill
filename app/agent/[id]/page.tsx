import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Badge } from "@/components/ui/badge";
import { getAgent, getSignals } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Clock, Users, ExternalLink } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { AgentBrain } from "./AgentBrain";

export default async function AgentProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const agent = await getAgent(id);
    if (!agent) notFound();

    const allSignals = await getSignals(id);
    const signals = allSignals.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);

    return (
        <MarketplaceLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Agent Header */}
                <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="h-16 w-16 rounded-xl flex items-center justify-center text-3xl"
                                style={{ backgroundColor: `${agent.color}15` }}
                            >
                                {agent.avatar}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{agent.name}</h1>
                                <p className="text-sm font-mono text-zinc-400">
                                    {agent.handle || `@${agent.name.toLowerCase().replace(/\s+/g, '')}`}
                                </p>
                            </div>
                        </div>
                        <Badge
                            className="text-xs border px-3 py-1"
                            style={{
                                backgroundColor: `${agent.color}10`,
                                color: agent.color,
                                borderColor: `${agent.color}25`,
                            }}
                        >
                            {agent.persona}
                        </Badge>
                    </div>

                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{agent.description}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-400 mb-2" />
                            <p className={`text-xl font-bold font-mono ${agent.roiPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {agent.roiPct >= 0 ? "+" : ""}{agent.roiPct}%
                            </p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">ROI</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <Wallet className="h-3.5 w-3.5 text-orange-400 mb-2" />
                            <p className="text-xl font-bold font-mono">{agent.totalTrades}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Total Trades</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <Users className="h-3.5 w-3.5 text-red-400 mb-2" />
                            <p className="text-xl font-bold font-mono">{agent.subscribers.length}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Copiers</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                            <Clock className="h-3.5 w-3.5 text-amber-400 mb-2" />
                            <p className="text-xl font-bold font-mono">${agent.signalPriceUsdc}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Per Signal</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <CopyButton agentId={agent.id} agentName={agent.name} price={agent.signalPriceUsdc} agentWallet={agent.walletAddress} />
                        <a
                            href={`https://basescan.org/address/${agent.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm text-zinc-400 border border-white/10 hover:bg-white/[0.04] transition-all"
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Wallet
                        </a>
                    </div>
                </div>

                {/* Agent Brain — Ask + Logs */}
                <section className="animate-fade-in-up-delay-1">
                    <AgentBrain agentId={agent.id} />
                </section>

                {/* Trade Feed */}
                <section className="animate-fade-in-up-delay-2">
                    <h2 className="text-lg font-semibold tracking-tight mb-4">Recent Trade Signals</h2>

                    {signals.length > 0 ? (
                        <div className="space-y-3">
                            {signals.map((signal) => (
                                <div key={signal.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                                    <div
                                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${signal.action === "buy"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : signal.action === "sell"
                                                ? "bg-red-500/10 text-red-400"
                                                : "bg-zinc-500/10 text-zinc-400"
                                            }`}
                                    >
                                        {signal.action === "buy" ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : signal.action === "sell" ? (
                                            <ArrowDownRight className="h-4 w-4" />
                                        ) : (
                                            <Clock className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-xs font-semibold uppercase ${signal.action === "buy" ? "text-emerald-400" : signal.action === "sell" ? "text-red-400" : "text-zinc-400"
                                                }`}>
                                                {signal.action}
                                            </span>
                                            <span className="text-sm font-mono text-zinc-200">
                                                {signal.amount} {signal.tokenSymbol}
                                            </span>
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
            </div>
        </MarketplaceLayout>
    );
}
