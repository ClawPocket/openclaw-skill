"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, Wallet } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { showToast } from "@/components/Toast";
import { parseUnits } from "viem";

// USDC on Base Mainnet (6 decimals)
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// Platform treasury — receives 10% fee
const PLATFORM_WALLET = "0x1D8FC785C126064cA0E2de2273C278B4215560b2" as const;
const PLATFORM_FEE_BPS = 1000; // 10% in basis points (1000 / 10000)

// Minimal ERC20 ABI
const ERC20_ABI = [
    {
        name: "transfer",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
] as const;

type Status = "idle" | "paying_agent" | "confirming_agent" | "paying_platform" | "confirming_platform" | "subscribing" | "success" | "error";

export function CopyButton({
    agentId,
    agentName,
    price,
    agentWallet,
}: {
    agentId: string;
    agentName: string;
    price: string;
    agentWallet: string;
}) {
    const { address, isConnected } = useAccount();
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");
    const [agentTxHash, setAgentTxHash] = useState<`0x${string}` | undefined>();

    // Calculate split amounts
    const totalUsdc = parseUnits(price, 6);
    const platformFee = (totalUsdc * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
    const agentAmount = totalUsdc - platformFee;

    // ── Transfer hook ──
    const {
        writeContract,
        data: currentTxHash,
        isPending: isWriting,
        error: writeError,
        reset: resetWrite,
    } = useWriteContract();

    const {
        isSuccess: isTxConfirmed,
        error: confirmError,
    } = useWaitForTransactionReceipt({ hash: currentTxHash });

    // Handle write errors
    useEffect(() => {
        if (writeError) {
            const msg = writeError.message?.includes("User rejected")
                ? "Transaction cancelled"
                : "Payment failed";
            setStatus("error");
            setMessage(msg);
            showToast(msg, "error");
            setTimeout(() => { setStatus("idle"); resetWrite(); }, 3000);
        }
    }, [writeError, resetWrite]);

    // Handle confirm errors
    useEffect(() => {
        if (confirmError) {
            setStatus("error");
            setMessage("Transaction failed on-chain");
            showToast("Transaction failed on-chain", "error");
            setTimeout(() => { setStatus("idle"); resetWrite(); }, 3000);
        }
    }, [confirmError, resetWrite]);

    // Track pending state
    useEffect(() => {
        if (isWriting && status === "idle") setStatus("paying_agent");
        if (isWriting && status === "confirming_agent") setStatus("paying_platform");
    }, [isWriting, status]);

    // Track tx hash emission
    useEffect(() => {
        if (currentTxHash && status === "paying_agent") {
            setStatus("confirming_agent");
        }
        if (currentTxHash && status === "paying_platform") {
            setStatus("confirming_platform");
        }
    }, [currentTxHash, status]);

    // When agent tx confirms, send platform fee
    useEffect(() => {
        if (isTxConfirmed && status === "confirming_agent" && currentTxHash) {
            setAgentTxHash(currentTxHash);

            if (platformFee > BigInt(0)) {
                // Small delay to let wagmi reset
                setTimeout(() => {
                    resetWrite();
                    setStatus("paying_platform");
                    writeContract({
                        address: USDC_ADDRESS,
                        abi: ERC20_ABI,
                        functionName: "transfer",
                        args: [PLATFORM_WALLET, platformFee],
                    });
                }, 500);
            } else {
                // No platform fee, go straight to subscription
                createSubscription(currentTxHash);
            }
        }
    }, [isTxConfirmed, status, currentTxHash]);

    // When platform tx confirms, create subscription
    useEffect(() => {
        if (isTxConfirmed && status === "confirming_platform" && agentTxHash) {
            createSubscription(agentTxHash);
        }
    }, [isTxConfirmed, status, agentTxHash]);

    const createSubscription = useCallback(async (paymentTxHash: string) => {
        setStatus("subscribing");
        try {
            const res = await fetch(`/api/agents/${agentId}/copy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriberWallet: address,
                    type: "signal",
                    paymentTxHash,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                showToast(`Subscribed to ${agentName}!`, "success");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to subscribe");
                showToast(data.error || "Subscription failed", "error");
            }
        } catch {
            setStatus("error");
            setMessage("Network error");
            showToast("Network error", "error");
        }
    }, [agentId, agentName, address]);

    const handleCopy = () => {
        if (!isConnected || !address) return;
        resetWrite();
        setStatus("paying_agent");

        // Step 1: Send 90% to agent wallet
        writeContract({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [agentWallet as `0x${string}`, agentAmount],
        });
    };

    // ── UI ──

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

    const labels: Record<Status, string> = {
        idle: `Copy This Agent — $${price} USDC`,
        paying_agent: "Approve payment to agent...",
        confirming_agent: "Confirming agent payment...",
        paying_platform: "Approve platform fee...",
        confirming_platform: "Confirming platform fee...",
        subscribing: "Activating subscription...",
        success: "Subscribed!",
        error: message || "Try again",
    };

    const isLoading = !["idle", "error", "success"].includes(status);
    const displayTxHash = currentTxHash || agentTxHash;

    return (
        <div className="flex-1 space-y-1">
            <Button
                onClick={handleCopy}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20"
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : status === "error" ? (
                    <Wallet className="mr-2 h-4 w-4" />
                ) : (
                    <Copy className="mr-2 h-4 w-4" />
                )}
                {labels[status]}
            </Button>

            {/* Fee breakdown */}
            {status === "idle" && (
                <p className="text-[10px] text-zinc-600 text-center">
                    90% to agent · 10% platform fee
                </p>
            )}

            {/* TX link */}
            {isLoading && displayTxHash && (
                <a
                    href={`https://basescan.org/tx/${displayTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[10px] text-orange-500 hover:text-orange-400 text-center"
                >
                    View on BaseScan ↗
                </a>
            )}

            {status === "error" && (
                <p className="text-xs text-red-400 text-center">{message}</p>
            )}
        </div>
    );
}
