"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { AgentCard } from "@/components/AgentCard";
import { AgentCardSkeleton } from "@/components/Skeletons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Zap } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AgentListing } from "@/lib/types";

const personas = ["All", "Moonboy", "Boomer", "News"];
const sorts = ["Top ROI", "Most Copied", "Newest", "Cheapest"];

export default function ExplorePage() {
    return (
        <Suspense>
            <ExploreContent />
        </Suspense>
    );
}

function ExploreContent() {
    const searchParams = useSearchParams();
    const [agents, setAgents] = useState<AgentListing[]>([]);
    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [activePersona, setActivePersona] = useState("All");
    const [activeSort, setActiveSort] = useState("Top ROI");
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

    const filtered = agents
        .filter((a) => {
            if (activePersona !== "All" && a.persona !== activePersona.toLowerCase()) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!a.name.toLowerCase().includes(q) && !(a.handle || "").toLowerCase().includes(q)) return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (activeSort) {
                case "Top ROI": return b.roiPct - a.roiPct;
                case "Most Copied": return b.subscribers.length - a.subscribers.length;
                case "Newest": return b.createdAt - a.createdAt;
                case "Cheapest": return parseFloat(a.signalPriceUsdc) - parseFloat(b.signalPriceUsdc);
                default: return 0;
            }
        });

    return (
        <MarketplaceLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                        <Search className="h-4 w-4 text-orange-400" />
                        <h1 className="text-xl font-bold tracking-tight">Explore</h1>
                    </div>
                    <p className="text-xs text-zinc-600">Discover top-performing AI agents</p>
                </div>

                {/* Search */}
                <div className="relative animate-fade-in-up-delay-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="bg-white/[0.03] border-white/[0.06] focus:border-orange-500/30 h-10 pl-9 text-sm"
                    />
                </div>

                {/* Filters */}
                <div className="space-y-3 animate-fade-in-up-delay-2">
                    {/* Personas */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <SlidersHorizontal className="h-3 w-3 text-zinc-600 shrink-0" />
                        {personas.map((p) => (
                            <button
                                key={p}
                                onClick={() => setActivePersona(p)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${activePersona === p
                                    ? "bg-white/[0.1] text-white border border-white/[0.1]"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] border border-transparent"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {sorts.map((s) => (
                            <Badge
                                key={s}
                                onClick={() => setActiveSort(s)}
                                className={`cursor-pointer text-[10px] px-2.5 py-1 transition-all ${activeSort === s
                                    ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 text-white border-orange-500/20"
                                    : "bg-transparent text-zinc-600 border-white/[0.06] hover:text-zinc-400"
                                    }`}
                            >
                                {s}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                        [...Array(6)].map((_, i) => <AgentCardSkeleton key={i} />)
                    ) : filtered.length > 0 ? (
                        filtered.map((agent, i) => (
                            <AgentCard key={agent.id} agent={agent} index={i} />
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center py-16 gap-3">
                            <div className="h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center">
                                <Zap className="h-5 w-5 text-zinc-700" />
                            </div>
                            <p className="text-sm text-zinc-500 font-medium">No agents found</p>
                            <p className="text-xs text-zinc-700">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </MarketplaceLayout>
    );
}
