"use client";

import { Search, Zap } from "lucide-react";
import Image from "next/image";
import { WalletConnect } from "./WalletConnect";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Topbar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchResults = async () => {
            if (query.trim().length === 0) {
                // Fetch recommendations (all agents, sort by ROI client side for now)
                try {
                    const res = await fetch(`/api/agents`);
                    const data = await res.json();
                    if (active && Array.isArray(data)) {
                        // Show top 5 by ROI
                        const top = data.sort((a, b) => b.roiPct - a.roiPct).slice(0, 5);
                        setResults(top);
                    }
                } catch {
                    if (active) setResults([]);
                }
                return;
            }

            if (query.length > 0) {
                try {
                    const res = await fetch(`/api/agents?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (active) setResults(Array.isArray(data) ? data : []);
                } catch {
                    if (active) setResults([]);
                }
            }
        };

        const timer = setTimeout(fetchResults, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
            setMobileSearchOpen(false);
        }
    }

    return (
        <header className="sticky top-0 z-30 bg-[oklch(0.08_0.005_285)]/80 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex items-center justify-between h-16 px-4 md:px-8">
                {/* Mobile logo */}
                <div className="flex items-center gap-2.5 md:hidden">
                    <Image src="/logo.svg" alt="ClawPocket Logo" width={28} height={28} className="rounded-lg" />
                    <span className="font-bold text-base tracking-tight">ClawPocket</span>
                </div>

                {/* Desktop Search */}
                <div className="relative flex-1 max-w-md hidden md:block">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="Search agents, tokens, or strategies..."
                            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl h-10 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
                        />
                    </form>

                    {/* Results Dropdown */}
                    {results.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="max-h-[300px] overflow-y-auto">
                                {results.map((agent: any) => (
                                    <button
                                        key={agent.id}
                                        onClick={() => {
                                            router.push(`/agent/${agent.handle.replace('@', '')}`);
                                            setQuery("");
                                            setResults([]);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                    >
                                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${agent.color}20` }}>
                                            {agent.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{agent.name}</p>
                                            <p className="text-xs text-zinc-500">{agent.handle}</p>
                                        </div>
                                        <div className="ml-auto text-xs font-mono text-emerald-400">
                                            {agent.roiPct > 0 ? "+" : ""}{agent.roiPct}%
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="md:hidden h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                        <Search className="h-4 w-4" />
                    </button>

                    <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-600">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Base Mainnet
                    </div>
                    <WalletConnect />
                </div>
            </div>

            {/* Mobile Search Drawer */}
            {mobileSearchOpen && (
                <div className="md:hidden px-4 pb-3 animate-fade-in-up">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search agents..."
                            autoFocus
                            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl h-10 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
                        />
                    </form>
                </div>
            )}
        </header>
    );
}
