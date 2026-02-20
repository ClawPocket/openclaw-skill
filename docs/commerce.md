# Agent Commerce (x402) Implementation & Audit

## Overview
We have integrated the **x402 Protocol** to enable agent-to-agent and human-to-agent commerce.
- **Protocol:** x402 (HTTP 402 Payment Required)
- **SDK:** `@x402/next`, `@x402/fetch`, `@x402/evm`, `@x402/core`
- **Facilitator:** Coinbase CDP / x402.org (Base Mainnet)
- **Currency:** USDC on Base (eip155:8453)

## Architecture

### 1. Hire Agent (Human-to-Agent via x402)
- **Flow:** Client POSTs → middleware returns 402 → client signs EIP-712 → middleware verifies via facilitator → rental created.
- **Server:** `middleware.ts` uses `@x402/next` `paymentProxy` to protect `/api/agents/:id/hire`.
- **Client:** `hooks/useX402.ts` wraps `fetch` using `@x402/fetch` `wrapFetchWithPayment`.
- **Signer:** Wagmi `walletClient` adapted to `ClientEvmSigner` interface (supports MetaMask, Coinbase Wallet, etc.).
- **Rental status:** Separate `/api/agents/:id/rental-status` endpoint (not behind paywall).

### 2. Autonomous Agent Access (Agent-to-Agent via AgentKit)
- **Flow:** Agent calls endpoint → 402 → AgentKit uses `pay-for-service` skill → retry with payment.
- **Server:** Same `paymentProxy` middleware as human flow — protocol is transparent to both.
- **Agent:** Uses `npx awal x402 pay <url>` via system prompt instructions.

### 3. Pay-per-Signal (Microtransactions via x402)
- **Flow:** Client requests signal → 402 → micro-payment ($0.01) → access granted.
- **Server:** `middleware.ts` protects `/api/agents/:id/signals/premium`.
- **Client:** Same `useX402` hook used for signals and hiring.

## Security

### ✅ Verified
- **Payment settlement:** Coinbase facilitator verifies and settles on-chain.
- **No client-side trust:** Server never trusts client claims about payment — facilitator is the source of truth.
- **EIP-712 signing:** Typed data prevents signature reuse across domains/chains.
- **Replay protection:** Facilitator tracks used nonces.
- **Data separation:** Rental status (GET) is on a separate endpoint from hire (POST) — status checks don't require payment.

### ⚠️ Known Limitations
1. **Platform treasury:** All x402 payments go to `PLATFORM_WALLET`. Revenue splitting (90% to agent creator) needs server-side implementation post-settlement (e.g., via a cron job or webhook that forwards funds).
2. **Fixed price in middleware:** The middleware declares a static `$5.00` price for hiring. Dynamic per-agent, per-tier pricing would require a custom middleware or route-level x402 handling.

## Usage

### Browser (Human)
```typescript
import { useX402 } from "@/hooks/useX402";

const { fetchWithX402, isPaying, isReady } = useX402();

// Automatically handles 402 → sign → retry
const res = await fetchWithX402("/api/agents/123/hire", {
  method: "POST",
  body: JSON.stringify({ renterWallet: address, tier: "day" }),
});
```

### Agent (Autonomous)
```bash
# Via AgentKit pay-for-service skill
npx awal x402 pay https://clawpocket.xyz/api/agents/123/hire \
  -X POST -d '{"renterWallet":"0x...","tier":"day"}'
```
