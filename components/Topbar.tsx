"use client";

import { Search, Zap } from "lucide-react";
import { WalletConnect } from "./WalletConnect";

export function Topbar() {
    return (
        <header className="sticky top-0 z-30 h-16 bg-[oklch(0.08_0.005_285)]/80 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex items-center justify-between h-full px-4 md:px-8">
                {/* Mobile logo */}
                <div className="flex items-center gap-2.5 md:hidden">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">ClawPocket</span>
                </div>

                {/* Global Search */}
                <div className="hidden md:flex flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search agents, tokens, or strategies..."
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl h-10 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-600">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Base Sepolia
                    </div>
                    <WalletConnect />
                </div>
            </div>
        </header>
    );
}
