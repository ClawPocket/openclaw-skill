"use client";

import { Wallet, Copy, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/Toast";
import { useState } from "react";

export function WalletAddressCard({ address }: { address: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        showToast("Address copied to clipboard!", "success");
    };

    return (
        <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Wallet className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                            Agent Wallet
                            <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                                Base
                            </span>
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5 break-all">
                            {address}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex-1 sm:flex-none bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] text-zinc-300"
                    >
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Copy
                    </Button>
                    <a
                        href={`https://basescan.org/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] text-zinc-300"
                        >
                            <ExternalLink className="h-3.5 w-3.5 mr-2" />
                            Scan
                        </Button>
                    </a>
                </div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500 bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                <strong>💡 How to fund:</strong> Send <strong>ETH</strong> (for gas) and <strong>USDC</strong> (for trading) to this address on the <strong>Base</strong> network. Minimum recommended: 0.005 ETH + 10 USDC.
            </div>
        </div>
    );
}
