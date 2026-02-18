import { useState, useCallback } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { showToast } from "@/components/Toast";

// USDC on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const ERC20_ABI = [
    {
        name: "transfer",
        type: "function",
        inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
        outputs: [{ name: "", type: "bool" }],
    },
] as const;

export function useX402() {
    const { address } = useAccount();
    const { sendTransactionAsync } = useSendTransaction();
    const [isPaying, setIsPaying] = useState(false);

    const fetchWithX402 = useCallback(async (url: string, options: RequestInit = {}) => {
        // 1. Initial Request
        let res = await fetch(url, options);

        // 2. If 402 Payment Required
        if (res.status === 402) {
            const authHeader = res.headers.get("WWW-Authenticate");
            if (!authHeader || !authHeader.startsWith("x402")) {
                throw new Error("Missing or invalid WWW-Authenticate header");
            }

            // Parse header: x402 scheme="exact" price="$0.01" network="eip155:8453" payTo="0x..."
            // Simple regex parser for demo purposes
            const priceMatch = authHeader.match(/price="([^"]+)"/);
            const payToMatch = authHeader.match(/payTo="([^"]+)"/);
            const schemeMatch = authHeader.match(/scheme="([^"]+)"/);

            if (!priceMatch || !payToMatch || !schemeMatch) {
                console.error("Failed to parse x402 header:", authHeader);
                throw new Error("Invalid x402 payment request");
            }

            const price = priceMatch[1]; // e.g. "$0.01"
            const payTo = payToMatch[1];
            const scheme = schemeMatch[1];

            if (scheme !== "exact") {
                throw new Error(`Unsupported x402 scheme: ${scheme}`);
            }

            // Confirm with user
            const confirmPayment = window.confirm(`This resource requires a payment of ${price}. Pay now?`);
            if (!confirmPayment) {
                throw new Error("Payment declined by user");
            }

            setIsPaying(true);
            try {
                // Parse amount (assuming $0.01 = 0.01 USDC for simplicity in this demo)
                // In a real app, you'd fetch the USDC price or use a rigorous parser
                // specific to the "exact" scheme's currency definition.
                // For now, removing '$' and parsing as USDC (6 decimals)
                const numericPrice = parseFloat(price.replace("$", ""));
                const amount = parseUnits(numericPrice.toString(), 6);

                // Send TX
                const hash = await sendTransactionAsync({
                    to: USDC_ADDRESS as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: "transfer",
                        args: [payTo as `0x${string}`, amount],
                    }),
                });

                showToast("Payment sent! Verifying...", "info");

                // Note: In a real app, we might wait for confirmation here,
                // but for speed we can try sending the hash immediately if the server supports pending txs
                // or just wait a minimal amount. The server middleware uses @x402/core which usually checks on-chain.
                // We'll trust the user to wait a moment or implement robust waiting.
                // For now, let's wait 2s to allow propagation.
                await new Promise(r => setTimeout(r, 2000));

                // 3. Retry with Authorization
                const retryOptions = {
                    ...options,
                    headers: {
                        ...options.headers,
                        "Authorization": `x402 ${hash}`, // Standard Bearer-like token for Exact scheme
                    },
                };

                res = await fetch(url, retryOptions);

                if (res.ok) {
                    showToast("Payment verified! Access granted.", "success");
                } else {
                    showToast("Payment verification failed. Please try again in a moment.", "error");
                }

            } catch (error) {
                console.error("x402 payment failed:", error);
                showToast("Payment failed", "error");
                throw error;
            } finally {
                setIsPaying(false);
            }
        }

        return res;
    }, [sendTransactionAsync]);

    return { fetchWithX402, isPaying };
}
