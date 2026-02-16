"use client";

import { Wallet, Copy, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/Toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useState } from "react";

import { useAccount, useBalance } from "wagmi";

export function FundAgentModal({
    address,
    agentName,
    ownerWallet
}: {
    address: string;
    agentName: string;
    ownerWallet: string;
}) {
    const { address: userAddress, isConnected } = useAccount();

    // Strict visibility check:
    // 1. Must be connected
    // 2. Must have an address
    // 3. Must have owner info
    // 4. Address must match owner
    if (!isConnected || !userAddress || !ownerWallet) return null;

    const isOwner = userAddress.toLowerCase() === ownerWallet.toLowerCase();
    if (!isOwner) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        showToast("Address copied to clipboard!", "success");
    };

    if (!isOwner) return null;

    // Fetch ETH balance
    const { data: ethBalance } = useBalance({
        address: address as `0x${string}`,
    });

    // Fetch USDC balance
    const { data: usdcBalance } = useBalance({
        address: address as `0x${string}`,
        token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <DialogTrigger asChild>
                    <button className="relative inline-flex h-10 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 grow sm:grow-0 hover:scale-[1.02] transition-transform duration-200">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFF7ED_0%,#F97316_50%,#FFF7ED_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2">
                            <Wallet className="w-4 h-4 text-orange-400" />
                            Fund Wallet
                        </span>
                    </button>
                </DialogTrigger>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Wallet className="h-5 w-5 text-blue-400" />
                        Fund {agentName}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Manage your agent's wallet funds.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-6">

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white/[0.05] rounded-xl p-3 border border-white/10 text-center">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">ETH (Gas)</p>
                            <p className="text-lg font-mono font-bold text-white">
                                {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : "0.0000"}
                            </p>
                        </div>
                        <div className="bg-white/[0.05] rounded-xl p-3 border border-white/10 text-center">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">USDC (Trade)</p>
                            <p className="text-lg font-mono font-bold text-blue-400">
                                {usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : "0.00"}
                            </p>
                        </div>
                    </div>
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl">
                        <QRCode value={address} size={180} />
                    </div>

                    {/* Address & Copy */}
                    <div className="w-full space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            Agent Wallet Address (Base)
                        </label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white/[0.05] rounded-lg px-3 py-2 text-sm font-mono text-zinc-300 break-all select-all border border-white/10">
                                {address}
                            </code>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={handleCopy}
                                className="bg-white/[0.05] border-white/10 hover:bg-white/10 hover:text-white shrink-0"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200 space-y-2">
                        <p className="flex items-start gap-2">
                            <span className="bg-blue-500/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                            <span>Send <strong>ETH</strong> for gas fees (~$5-10 recommended).</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="bg-blue-500/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                            <span>Send <strong>USDC</strong> for trading capital.</span>
                        </p>
                        <div className="pt-2">
                            <a
                                href={`https://basescan.org/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <ExternalLink className="h-3 w-3" />
                                View on BaseScan
                            </a>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
