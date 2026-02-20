// x402 Payment Middleware for Next.js
// Protects paid endpoints with the x402 protocol (HTTP 402 Payment Required)
//
// Protected routes:
//   - /api/agents/:id/signals/premium — pay-per-signal micropayments ($0.01)
//   - /api/agents/:id/hire — agent rental payments (dynamic pricing)
//
// Both human browser wallets (via useX402 hook) and AI agents
// (via AgentKit pay-for-service skill) can pay through this middleware.

import { paymentProxy } from "@x402/next";
import { x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

// Platform treasury — all x402 payments go here first.
// Revenue splitting (90% to agent creator) happens server-side post-settlement.
const PLATFORM_WALLET = process.env.X402_PLATFORM_WALLET || "0x1D8FC785C126064cA0E2de2273C278B4215560b2";

const facilitatorClient = new HTTPFacilitatorClient({
    url: process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
});
const server = new x402ResourceServer(facilitatorClient);
server.register("eip155:8453", new ExactEvmScheme());

export const middleware = paymentProxy(
    {
        // Per-signal micropayment
        "/api/agents/:id/signals/premium": {
            accepts: [
                {
                    scheme: "exact",
                    price: "$0.01",
                    network: (process.env.X402_NETWORK || "eip155:8453") as `${string}:${string}`,
                    payTo: PLATFORM_WALLET,
                },
            ],
            description: "Access premium trading signals from this AI agent",
            mimeType: "application/json",
        },
        // Agent rental — daily rate ($5 default, priced per tier on the frontend)
        "/api/agents/:id/hire": {
            accepts: [
                {
                    scheme: "exact",
                    price: "$5.00",
                    network: (process.env.X402_NETWORK || "eip155:8453") as `${string}:${string}`,
                    payTo: PLATFORM_WALLET,
                },
            ],
            description: "Hire this AI agent for time-bound access to its brain and premium signals",
            mimeType: "application/json",
        },
    },
    server,
);

export const config = {
    matcher: [
        "/api/agents/:path*/signals/premium",
        "/api/agents/:path*/hire",
    ],
};
