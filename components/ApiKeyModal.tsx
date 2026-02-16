"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, Eye } from "lucide-react";
import { showToast } from "@/components/Toast";

export function ApiKeyModal({ agentId, agentName, ownerWallet }: { agentId: string, agentName: string, ownerWallet: string }) {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Only show button if connected wallet is owner
    if (!address || address.toLowerCase() !== ownerWallet.toLowerCase()) {
        return null;
    }

    async function fetchKey() {
        if (!address) return;
        setLoading(true);
        try {
            // 1. Create Message
            const timestamp = Date.now();
            const message = `View API Key for Agent ${agentId} at ${timestamp}`;

            // 2. Sign Message
            const signature = await signMessageAsync({ message });

            // 3. Fetch with Signature
            const res = await fetch(`/api/agents/${agentId}/key?wallet=${address}&timestamp=${timestamp}&signature=${signature}`);

            if (!res.ok) {
                let errorMsg = "Unauthorized";
                try {
                    const err = await res.json();
                    errorMsg = err.error || errorMsg;
                } catch {
                    errorMsg = await res.text() || res.statusText;
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();
            setApiKey(data.apiKey);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch API Key. Signature rejected.", "error");
        } finally {
            setLoading(false);
        }
    }

    const copyToClipboard = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            showToast("API Key copied!", "success");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-orange-500/20 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" onClick={() => fetchKey()}>
                    <Key className="h-3.5 w-3.5" />
                    API Key
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#18181b] border-white/10">
                <DialogHeader>
                    <DialogTitle>API Key for {agentName}</DialogTitle>
                    <DialogDescription className="text-sm text-zinc-400">
                        Use this key to authenticate your external bot (`x-api-key` header).
                        <br />
                        <span className="text-red-400/80 text-xs">Do not share this key with anyone.</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">

                    <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-sm break-all relative group">
                        {loading ? (
                            <span className="text-zinc-500 animate-pulse">Revealing...</span>
                        ) : (
                            <span className="text-zinc-200">{apiKey || "Error loading key"}</span>
                        )}

                        {apiKey && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/10 text-zinc-400 hover:text-white"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>

                    <div className="bg-zinc-900/50 p-3 rounded-lg text-xs space-y-2 border border-white/5">
                        <p className="font-semibold text-zinc-300">Example Usage:</p>
                        <code className="block text-emerald-400/90 font-mono bg-black/30 p-2 rounded overflow-x-auto">
                            curl -X POST \<br />
                            &nbsp;&nbsp;https://clawpocket.vercel.app/api/signals/webhook \<br />
                            &nbsp;&nbsp;-H "x-api-key: {apiKey ? apiKey.slice(0, 8) + "..." : "YOUR_KEY"}" \<br />
                            &nbsp;&nbsp;-d '{"{"} "action": "buy", "tokenSymbol": "ETH", ... {"}"}'
                        </code>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
