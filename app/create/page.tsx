"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { WalletStatus } from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Rocket } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { showToast } from "@/components/Toast";

const personas = [
    { id: "moonboy", label: "Moonboy", emoji: "🚀", desc: "Aggressive. Chases pumps & volume spikes.", color: "#06b6d4" },
    { id: "boomer", label: "Boomer", emoji: "🛡️", desc: "Conservative. ETH/USDC only. DCA strategy.", color: "#10b981" },
    { id: "news", label: "News Junkie", emoji: "📰", desc: "Data-driven. Only trades on clear signals.", color: "#7c3aed" },
    { id: "custom", label: "Custom", emoji: "⚡", desc: "Define your own strategy and rules.", color: "#f59e0b" },
];

export default function CreatePage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [persona, setPersona] = useState("moonboy");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("0.01");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Auto-generate handle from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!handle || handle === name.toLowerCase().replace(/\s+/g, "")) {
            // Only allow lowercase alphanumeric, dot, underscore
            setHandle(newName.toLowerCase().replace(/[^a-z0-9._]/g, ""));
        }
    };

    const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Enforce allowed characters: a-z, 0-9, ., _
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "");
        setHandle(val);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !handle.trim() || !isConnected) return;

        // Frontend validation
        if (handle.length < 4) {
            setError("Handle must be at least 4 characters long");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    handle: handle.startsWith("@") ? handle : `@${handle}`,
                    persona,
                    description,
                    signalPriceUsdc: price,
                    ownerWallet: address,
                }),
            });
            // ... (rest of logic same) ...

            const data = await res.json();

            if (res.ok) {
                showToast(`${name} created successfully!`, "success");
                router.push(`/agent/${data.id}`);
            } else {
                setError(data.error || "Failed to create agent");
                showToast(data.error || "Failed to create agent", "error");
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to create agent:", error);
            setError("Network error");
            showToast("Network error — please try again", "error");
            setLoading(false);
        }
    };

    return (
        <MarketplaceLayout>
            <div className="max-w-xl mx-auto space-y-8">
                {/* Header */}
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-orange-400" />
                        <h1 className="text-2xl font-bold tracking-tight">List Your Agent</h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Create an AI trading agent and list it on the marketplace. Other users will pay USDC to copy your signals.
                    </p>
                </div>

                {/* Wallet Gate */}
                {!isConnected && (
                    <div className="animate-fade-in-up-delay-1">
                        <WalletStatus />
                    </div>
                )}
                <div className="space-y-6 animate-fade-in-up-delay-1">
                    {/* Name & Handle */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                                Agent Name
                            </label>
                            <Input
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g. AlphaSeeker"
                                className="bg-white/[0.03] border-white/[0.06] focus:border-orange-500/30 h-12"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                                Handle (Unique)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                                <Input
                                    value={handle}
                                    onChange={handleHandleChange}
                                    placeholder="alphaseeker"
                                    className="bg-white/[0.03] border-white/[0.06] focus:border-orange-500/30 h-12 pl-7"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Persona */}
                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-3 block">
                            Trading Persona
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {personas.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPersona(p.id)}
                                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${persona === p.id
                                        ? "border-white/20 bg-white/[0.06]"
                                        : "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{p.emoji}</span>
                                        <span className="text-sm font-semibold" style={{ color: persona === p.id ? p.color : undefined }}>
                                            {p.label}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-600">{p.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your agent's strategy..."
                            rows={3}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-orange-500/30 transition-colors resize-none"
                        />
                    </div>

                    {/* Signal Price */}
                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                            Signal Price (USDC per signal)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                            <Input
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                type="number"
                                step="0.01"
                                min="0"
                                className="bg-white/[0.03] border-white/[0.06] focus:border-orange-500/30 h-12 pl-8"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-xs text-red-400 text-center animate-pulse">{error}</p>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !handle.trim() || !isConnected || loading}
                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="animate-pulse">Creating...</span>
                        ) : (
                            <>
                                <Rocket className="mr-2 h-4 w-4" />
                                Create & List Agent
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
