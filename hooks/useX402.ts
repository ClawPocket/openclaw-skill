"use client";

import { useCallback, useMemo, useState } from "react";
import { useWalletClient } from "wagmi";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";

/**
 * x402 payment hook for browser wallets (MetaMask, Coinbase Wallet, etc.)
 *
 * Uses the official @x402/fetch SDK with the connected wagmi wallet as signer.
 * Flow:
 *   1. Client calls fetchWithX402(url, opts)
 *   2. If server returns 402 + PAYMENT-REQUIRED header:
 *      - SDK reads payment requirements (price, payTo, network)
 *      - Prompts user to sign EIP-712 typed data via their wallet
 *      - Retries the request with PAYMENT-SIGNATURE header
 *   3. Facilitator verifies and settles on-chain
 *   4. Server returns the resource
 *
 * Compatible with both human users (browser wallet popup) and
 * AI agents (AgentKit MPC wallet via pay-for-service skill).
 */
export function useX402() {
    const { data: walletClient } = useWalletClient();
    const [isPaying, setIsPaying] = useState(false);

    // Create the x402 client with the connected wallet as signer
    const x402 = useMemo(() => {
        if (!walletClient?.account) return null;

        // Adapt wagmi walletClient to ClientEvmSigner interface
        const signer = {
            address: walletClient.account.address,
            signTypedData: async (msg: {
                domain: Record<string, unknown>;
                types: Record<string, unknown>;
                primaryType: string;
                message: Record<string, unknown>;
            }) => {
                return walletClient.signTypedData({
                    account: walletClient.account,
                    domain: msg.domain as Parameters<typeof walletClient.signTypedData>[0]["domain"],
                    types: msg.types as Parameters<typeof walletClient.signTypedData>[0]["types"],
                    primaryType: msg.primaryType,
                    message: msg.message,
                });
            },
        };

        const client = new x402Client();
        // Register Base Mainnet (eip155:8453) with our wallet signer
        client.register("eip155:8453", new ExactEvmScheme(signer));

        return client;
    }, [walletClient]);

    // Wrapped fetch that auto-handles 402 payment flows
    const fetchWithX402 = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            if (!x402) {
                throw new Error("Wallet not connected");
            }

            setIsPaying(true);
            try {
                const payFetch = wrapFetchWithPayment(fetch, x402);
                const res = await payFetch(url, options);
                return res;
            } finally {
                setIsPaying(false);
            }
        },
        [x402],
    );

    return { fetchWithX402, isPaying, isReady: !!x402 };
}
