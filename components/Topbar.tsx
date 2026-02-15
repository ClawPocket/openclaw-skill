"use client";

import { Search, Zap } from "lucide-react";
import Image from "next/image";
import { WalletConnect } from "./WalletConnect";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Topbar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search agents, tokens, or strategies..."
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl h-10 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
                    />
                </form>

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
                        Base Sepolia
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
