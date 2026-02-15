"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (mounted && isConnected && address) {
        return (
            <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-xs group"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-mono text-zinc-300">
                    {address.slice(0, 4)}...{address.slice(-3)}
                </span>
                <LogOut className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: connectors[0] })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-500 hover:to-red-600 text-white text-xs font-medium transition-all shadow-sm shadow-orange-500/10"
        >
            <Wallet className="h-3 w-3" />
            Connect
        </button>
    );
}

export function WalletStatus() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (mounted && isConnected && address) {
        return (
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-200">Connected</p>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">
                            {address}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Wallet className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-zinc-200">Connect Wallet</p>
                        <p className="text-[10px] text-zinc-600">Coinbase Smart Wallet</p>
                    </div>
                </div>
                <button
                    onClick={() => connect({ connector: connectors[0] })}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-500 hover:to-red-600 text-white text-[11px] font-medium transition-all"
                >
                    Connect
                </button>
            </div>
        </div>
    );
}
