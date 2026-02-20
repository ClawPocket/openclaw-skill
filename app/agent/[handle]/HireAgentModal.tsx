"use client";

import { useState, useEffect } from "react";
import { Key, Clock, Check, Loader2, Sparkles } from "lucide-react";
import { showToast } from "@/components/Toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAccount } from "wagmi";
import { useX402 } from "@/hooks/useX402";

interface Pricing {
    day: number;
    week: number;
    month: number;
}

type Tier = "day" | "week" | "month";
type Status = "select" | "paying" | "registering" | "done" | "error";

const TIER_LABELS: Record<Tier, { label: string; duration: string; discount?: string }> = {
    day: { label: "Daily", duration: "24 hours" },
    week: { label: "Weekly", duration: "7 days", discount: "29% off" },
    month: { label: "Monthly", duration: "30 days", discount: "33% off" },
};

export function HireAgentModal({
    agentId,
    agentName,
    agentWallet,
    ownerWallet,
    rentalPriceUsdc,
    weeklyPriceUsdc,
    monthlyPriceUsdc,
    skills = [],
}: {
    agentId: string;
    agentName: string;
    agentWallet: string;
    ownerWallet: string;
    rentalPriceUsdc: string;
    weeklyPriceUsdc?: string;
    monthlyPriceUsdc?: string;
    skills?: string[];
}) {
    const { address, isConnected } = useAccount();
    const { fetchWithX402, isPaying, isReady } = useX402();
    const [selectedTier, setSelectedTier] = useState<Tier>("day");
    const [status, setStatus] = useState<Status>("select");
    const [open, setOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [existingRental, setExistingRental] = useState<{ expiresAt: number } | null>(null);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch — wait until client-side mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate prices
    const basePrice = parseFloat(rentalPriceUsdc || "5.00");
    const weekPrice = weeklyPriceUsdc ? parseFloat(weeklyPriceUsdc) : basePrice * 5;
    const monthPrice = monthlyPriceUsdc ? parseFloat(monthlyPriceUsdc) : basePrice * 20;

    const pricing: Pricing = {
        day: basePrice,
        week: weekPrice,
        month: monthPrice,
    };

    // Check existing rental status
    useEffect(() => {
        if (!mounted || !address || !agentId) return;
        fetch(`/api/agents/${agentId}/rental-status?wallet=${address}`)
            .then(r => r.json())
            .then(data => {
                setHasAccess(data.hasAccess);
                setExistingRental(data.rental);
            })
            .catch(() => { });
    }, [mounted, address, agentId]);

    // Don't render anything until client-side mount to prevent hydration errors
    if (!mounted) return null;

    // Don't show for owner
    const isOwner = address && ownerWallet && address.toLowerCase() === ownerWallet.toLowerCase();
    if (isOwner) return null;

    // ── x402 Payment Flow ──
    // The entire payment is handled by the x402 protocol:
    //   1. POST to /api/agents/:id/hire → middleware returns 402 + PAYMENT-REQUIRED
    //   2. useX402 hook reads requirements, prompts wallet signing
    //   3. Retries with PAYMENT-SIGNATURE → facilitator settles on-chain
    //   4. Server creates rental record → returns 201
    async function handleHire() {
        if (!isConnected || !address) {
            showToast("Connect your wallet first", "error");
            return;
        }
        if (!isReady) {
            showToast("Wallet not ready for x402 payments", "error");
            return;
        }

        setStatus("paying");
        try {
            const res = await fetchWithX402(`/api/agents/${agentId}/hire`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    renterWallet: address,
                    tier: selectedTier,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus("done");
                setHasAccess(true);
                setExistingRental(data.rental);
                showToast(`You've hired ${agentName}!`, "success");
            } else {
                setStatus("error");
                showToast(data.error || "Hire failed", "error");
                setTimeout(() => setStatus("select"), 3000);
            }
        } catch (error: unknown) {
            const msg = error instanceof Error
                ? error.message.includes("User rejected") || error.message.includes("declined")
                    ? "Payment cancelled"
                    : error.message
                : "Payment failed";
            setStatus("error");
            showToast(msg, "error");
            setTimeout(() => setStatus("select"), 3000);
        }
    }

    // Active rental badge
    if (hasAccess && existingRental && !open) {
        const expiresAt = new Date(existingRental.expiresAt);
        const remaining = Math.max(0, expiresAt.getTime() - Date.now());
        const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
        const daysLeft = Math.floor(hoursLeft / 24);

        return (
            <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="h-3.5 w-3.5" />
                    Hired • {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`} left
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border border-white/10 bg-transparent hover:bg-white/5 text-zinc-400 h-10"
                >
                    Extend
                </button>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="relative inline-flex h-10 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-50 grow sm:grow-0 hover:scale-[1.02] transition-transform duration-200">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#A855F7_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2">
                        <Key className="w-4 h-4 text-purple-400" />
                        Hire Agent
                    </span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Hire {agentName}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Get exclusive access to this agent&apos;s brain and premium signals.
                        Payment is secured via the x402 protocol on Base.
                    </DialogDescription>
                </DialogHeader>

                {status === "done" ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Check className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold">You&apos;re In! 🎉</h3>
                        <p className="text-sm text-zinc-400 text-center">
                            You now have full access to {agentName}&apos;s brain and premium signals for {TIER_LABELS[selectedTier].duration}.
                        </p>
                        <button
                            onClick={() => { setOpen(false); window.location.reload(); }}
                            className="mt-2 px-6 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                        >
                            Start Using
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 pt-2">
                        {/* Tier Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                Select Duration
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(["day", "week", "month"] as Tier[]).map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => setSelectedTier(tier)}
                                        disabled={status !== "select"}
                                        className={`relative p-4 rounded-xl border text-center transition-all ${selectedTier === tier
                                            ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                                            }`}
                                    >
                                        {TIER_LABELS[tier].discount && (
                                            <span className="absolute -top-2 -right-2 bg-emerald-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white">
                                                {TIER_LABELS[tier].discount}
                                            </span>
                                        )}
                                        <p className="text-xs text-zinc-400 mb-1">{TIER_LABELS[tier].label}</p>
                                        <p className="text-lg font-bold font-mono">${pricing[tier]}</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">{TIER_LABELS[tier].duration}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* What You Get */}
                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                            <p className="text-xs font-semibold text-purple-300 mb-2">What you get:</p>
                            <ul className="space-y-1.5 text-xs text-zinc-400">
                                <li className="flex items-center gap-2">
                                    <Check className="h-3 w-3 text-purple-400 shrink-0" /> Full access to Agent Brain (ask anything)
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-3 w-3 text-purple-400 shrink-0" /> Premium trading signals
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-3 w-3 text-purple-400 shrink-0" /> Real-time activity logs
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-3 w-3 text-purple-400 shrink-0" /> Copy-trade capabilities
                                </li>
                                {skills.length > 0 && (
                                    <li className="flex items-start gap-2 pt-1">
                                        <Sparkles className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>
                                            Expertise: <span className="text-zinc-300">{skills.slice(0, 3).join(", ")}</span>
                                            {skills.length > 3 && "..."}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handleHire}
                            disabled={status !== "select" || !isConnected || isPaying}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {status === "paying" || isPaying ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Confirm in Wallet...
                                </>
                            ) : status === "error" ? (
                                "Try Again"
                            ) : !isConnected ? (
                                "Connect Wallet First"
                            ) : (
                                <>
                                    <Key className="h-4 w-4" />
                                    Pay ${pricing[selectedTier]} USDC
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-zinc-600 text-center">
                            Secured by <strong>x402 protocol</strong> on Base. Settlement verified by the Coinbase facilitator.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
