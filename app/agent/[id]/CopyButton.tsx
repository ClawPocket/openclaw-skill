"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { showToast } from "@/components/Toast";

export function CopyButton({
    agentId,
    agentName,
    price,
}: {
    agentId: string;
    agentName: string;
    price: string;
}) {
    const { address, isConnected } = useAccount();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleCopy = async () => {
        if (!isConnected || !address) return;

        setStatus("loading");
        try {
            const res = await fetch(`/api/agents/${agentId}/copy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriberWallet: address,
                    type: "signal",
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                showToast(`Subscribed to ${agentName}!`, "success");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to subscribe");
                showToast(data.error || "Failed to subscribe", "error");
            }
        } catch {
            setStatus("error");
            setMessage("Network error");
            showToast("Network error — please try again", "error");
        }

        setTimeout(() => {
            if (status !== "success") setStatus("idle");
        }, 3000);
    };

    if (!isConnected) {
        return (
            <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-zinc-500">Connect wallet to copy →</span>
                <WalletConnect />
            </div>
        );
    }

    if (status === "success") {
        return (
            <Button className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-default">
                <Check className="mr-2 h-4 w-4" />
                Subscribed to {agentName}
            </Button>
        );
    }

    return (
        <div className="flex-1 space-y-1">
            <Button
                onClick={handleCopy}
                disabled={status === "loading"}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20"
            >
                {status === "loading" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Copy className="mr-2 h-4 w-4" />
                )}
                Copy This Agent — ${price}/signal
            </Button>
            {status === "error" && (
                <p className="text-xs text-red-400 text-center">{message}</p>
            )}
        </div>
    );
}
