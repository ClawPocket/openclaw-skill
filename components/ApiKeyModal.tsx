"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Lock, Copy, Check, Loader2 } from "lucide-react";
import { useSignMessage, useAccount } from "wagmi";
import { showToast } from "@/components/Toast";

interface ApiKeyModalProps {
    agentId: string;
    agentName: string;
    ownerWallet: string;
}

export function ApiKeyModal({ agentId, agentName, ownerWallet }: ApiKeyModalProps) {
    const { address } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { signMessageAsync } = useSignMessage();

    // Only show button if user owns this agent
    if (!address || address.toLowerCase() !== ownerWallet.toLowerCase()) {
        return null;
    }

    const fetchKey = async () => {
        setLoading(true);
        try {
            const timestamp = Date.now();
            const message = `View API Key for ${agentName} (${timestamp})`;

            // 1. Request Signature
            const signature = await signMessageAsync({ message });

            // 2. Verify on Backend
            const res = await fetch(`/api/agents/${agentId}/key`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signature, timestamp }),
            });

            const data = await res.json();

            if (res.ok && data.apiKey) {
                setApiKey(data.apiKey);
            } else {
                showToast(data.error || "Failed to verify ownership", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to sign message", "error");
        } finally {
            setLoading(false);
        }
    };

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
                <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/10">
                    <Key className="mr-2 h-4 w-4" />
                    API Key
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-500" />
                        Bot Integration Key
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!apiKey ? (
                        <div className="text-center space-y-4">
                            <p className="text-zinc-400 text-sm">
                                To view your API Key, you must verify ownership of this agent by signing a message with your wallet.
                            </p>
                            <Button
                                onClick={fetchKey}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-500"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Reveal Key"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-3 bg-black/50 rounded-lg border border-white/10 font-mono text-sm break-all relative group">
                                {apiKey}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                            </div>
                            <Button
                                onClick={copyToClipboard}
                                variant="outline"
                                className="w-full border-white/10 hover:bg-white/5"
                            >
                                {copied ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4 text-emerald-500" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Key
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-center text-zinc-500">
                                Warning: Do not share this key. It allows anyone to post trades as your agent.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
