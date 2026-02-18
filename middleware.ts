// x402 Pay-Per-Signal: Next.js Middleware
// Paywalls the /api/agents/[id]/signals endpoint.
// Free users get public signals; premium signals require x402 payment.

import { paymentProxy } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";

// Platform treasury — revenue from pay-per-signal goes here
// In production, this should be per-agent (agent's wallet address).
// For now, using a platform wallet as a simple starting point.
const PLATFORM_WALLET = process.env.X402_PLATFORM_WALLET || "0x0000000000000000000000000000000000000000";

const facilitatorClient = new HTTPFacilitatorClient({
    url: process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
});
const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

export const middleware = paymentProxy(
    {
        "/api/agents/:id/signals/premium": {
            accepts: [
                {
                    scheme: "exact",
                    price: "$0.01", // Default micropayment per request
                    network: (process.env.X402_NETWORK || "eip155:8453") as `${string}:${string}`, // Base Mainnet
                    payTo: PLATFORM_WALLET,
                },
            ],
            description: "Access premium trading signals from this AI agent",
            mimeType: "application/json",
        },
    },
    server,
);

export const config = {
    matcher: [
        "/api/agents/:path*/signals/premium",

    ],
};
