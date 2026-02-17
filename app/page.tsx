import Image from "next/image";
import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/AgentCard";
import { getAgents } from "@/lib/db";
import { Zap, TrendingUp, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AgentListing } from "@/lib/types";

export default async function HomePage() {
  const agents = await getAgents();
  const topAgents = [...agents].sort((a: AgentListing, b: AgentListing) => b.roiPct - a.roiPct).slice(0, 6);

  const stats = {
    totalAgents: agents.length,
    totalTrades: agents.reduce((sum: number, a: AgentListing) => sum + a.totalTrades, 0),
    totalCopiers: agents.reduce((sum: number, a: AgentListing) => sum + a.subscribers.length, 0),
  };

  return (
    <MarketplaceLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ClawPocket",
            "url": "https://clawpocket.xyz",
            "description": "The premier AI Agent Marketplace on Base. Copy-trade top performing autonomous agents.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://clawpocket.xyz/explore?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <div className="space-y-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[oklch(0.10_0.02_25)] p-8 md:p-12 animate-fade-in-up">
          {/* Background Image - Right aligned with fade */}
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[60%] z-0 select-none pointer-events-none">
            {/* Dark overlay for mobile to make text pop */}
            <div className="absolute inset-0 bg-black/2 md:hidden z-10" />

            {/* Gradient mask to fade image into background on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.10_0.02_25)] via-[oklch(0.10_0.02_25)]/80 md:via-[oklch(0.10_0.02_25)]/20 to-transparent z-10" />
            <Image
              src="/assets/lobster-hero.png"
              alt="Lobster Agent Background"
              fill
              className="object-cover object-center opacity-30 md:opacity-80"
              priority
            />
          </div>

          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] animate-pulse-glow z-0 mix-blend-screen" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-red-600/10 rounded-full blur-[80px] animate-pulse-glow z-0" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-md bg-orange-400/20 flex items-center justify-center">
                <Zap className="h-3 w-3 text-orange-400" />
              </div>
              <span className="text-xs text-orange-400 font-medium tracking-wider uppercase">AI Agent Marketplace</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 max-w-xl">
              Rent the best{" "}
              <span className="text-gradient-lobster">AI trading agents</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
              Browse, copy, and deploy autonomous agents that trade 24/7.
              Pay a one-time access fee with USDC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/explore">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20 px-6">
                  Explore Agents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/[0.04] px-6">
                  List Your Agent
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="animate-fade-in-up-delay-1">
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
            {[
              { label: "Active Agents", value: stats.totalAgents, icon: Zap, color: "text-orange-400" },
              { label: "Total Trades", value: stats.totalTrades.toLocaleString(), icon: TrendingUp, color: "text-emerald-400" },
              { label: "Active Copiers", value: stats.totalCopiers.toLocaleString(), icon: Users, color: "text-red-400" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 text-center min-w-[140px] flex-1 snap-center border-white/[0.08]">
                <stat.icon className={`h-4 w-4 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl md:text-2xl font-bold font-mono">{stat.value}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Agents */}
        <section className="animate-fade-in-up-delay-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold tracking-tight">Top Performing Agents</h2>
            <Link href="/explore" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topAgents.map((agent: AgentListing, i: number) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </section>
      </div>
    </MarketplaceLayout>
  );
}
