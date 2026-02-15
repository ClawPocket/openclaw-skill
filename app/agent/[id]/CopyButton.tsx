"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, Wallet } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { showToast } from "@/components/Toast";
import { parseUnits } from "viem";

// USDC on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// Minimal ERC20 ABI for transfer
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
    const [status, setStatus] = useState<"idle" | "paying" | "confirming" | "subscribing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // Wagmi write contract hook
    const {
        writeContract,
        data: txHash,
        isPending: isWriting,
        error: writeError,
    } = useWriteContract();

    // Wait for transaction confirmation
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Handle write error
    useEffect(() => {
        if (writeError) {
            const msg = writeError.message?.includes("User rejected")
                ? "Transaction cancelled"
                : "Payment failed";
            setStatus("error");
            setMessage(msg);
            showToast(msg, "error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    }, [writeError]);

    // Handle confirmation error
    useEffect(() => {
        if (confirmError) {
            setStatus("error");
            setMessage("Transaction failed on-chain");
            showToast("Transaction failed on-chain", "error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    }, [confirmError]);

    // When TX is confirmed, create subscription
    useEffect(() => {
        if (isConfirmed && txHash && status === "confirming") {
            createSubscription(txHash);
        }
    }, [isConfirmed, txHash, status]);

    // Track status transitions
    useEffect(() => {
        if (isWriting) setStatus("paying");
    }, [isWriting]);

    useEffect(() => {
        if (txHash && !isConfirmed) setStatus("confirming");
    }, [txHash, isConfirmed]);

    async function createSubscription(paymentTxHash: string) {
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
    }

    const handleCopy = () => {
        if (!isConnected || !address) return;

        // Convert price to USDC amount (6 decimals)
        const usdcAmount = parseUnits(price, 6);

        // Initiate USDC transfer to the agent's own wallet
        writeContract({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [agentWallet as `0x${string}`, usdcAmount],
        });
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

    const buttonLabel = {
        idle: `Copy This Agent — $${price} USDC`,
        paying: "Approve in wallet...",
        confirming: "Confirming tx...",
        subscribing: "Activating subscription...",
        error: message || "Try again",
    };

    const isLoading = status === "paying" || status === "confirming" || status === "subscribing";

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
                {buttonLabel[status]}
            </Button>
            {status === "confirming" && txHash && (
                <a
                    href={`https://basescan.org/tx/${txHash}`}
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
