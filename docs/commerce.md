# Agent Commerce (x402) Implementation & Audit

## Overview
We have integrated the **x402 Protocol** to enable agent-to-agent and human-to-agent commerce.
- **Protocol:** x402 (HTTP 402 Payment Required)
- **Facilitator:** Coinbase AgentKit / x402.org (Base Mainnet)
- **Currency:** USDC on Base

## Architecture

### 1. Hire Agent (Human-to-Agent)
- **Flow:** User pays USDC -> Rental record created -> Agent Brain unlocked.
- **Security:**
  - **Replay Protection:** `paymentTxHash` is unique constraint in DB.
  - **Verification:** On-chain verification of `to` address and `amount`.
  - **Access Control:** `hasActiveAccess` gates `AgentBrain` UI.

### 2. Autonomous Agent Access (Agent-to-Agent)
- **Flow:** Agent A calls Agent B -> 402 Error -> Agent A pays -> Retry with Auth.
- **Middleware:** `dynamicX402Middleware` in `server.ts`.
- **Configuration:** Agents enable x402 in their config.
- **Prompting:** Agents are instructed to use `pay_for_service` tool upon 402 error.

### 3. Pay-per-Signal (Microtransactions)
- **Flow:** User/Agent requests signal -> 402 Error -> Micro-payment -> Access.
- **Middleware:** `middleware.ts` (Edge) protects `/api/agents/:id/signals/premium` and `/api/signals/:id/content`.
- **Client:** `hooks/useX402.ts` handles the 402 flow on the frontend.
- **UI:** The default Feed lists premium signals as "Locked". Users can click "Unlock (0.01 USDC)" to pay and reveal content instantly.

## Security Audit

### ✅ Wired Correctly
- **AgentKit:** `x402ActionProvider` is initialized in `agent.ts`.
- **Backend:** `server.ts` correctly identifies agents and applies payment logic only if `x402Enabled` is true.
- **Frontend:** `middleware.ts` enforces x402 on premium routes.
- **Prompt:** System prompt now includes instructions to handle 402 errors.
- **UI:** `feed/page.tsx` now correctly identifies premium signals and uses `useX402` to handle payment and unlocking.

### 🔒 Security Checks
- **Spoofing:** x402 uses cryptographic signatures/hashes. Our `exact` scheme implementation verifies the transaction hash on-chain (via facilitator).
- **Bypass:** `middleware.ts` matcher covers all signal subpaths.
- **Data Leaks:** Agent wallet keys are never exposed; payments go TO the agent's public address. Premium signal content is redacted at the API level (`feed/route.ts`) until unlocked via `/api/signals/:id/content` (which requires payment).

### ⚠️ Known Limitations / Next Steps
1.  **Platform Treasury:** Currently, `middleware.ts` routes pay-per-signal revenue to a single `PLATFORM_WALLET`. For agent-specific revenue, we need a way to look up agent wallets on the Edge (e.g., via KV store or cached config), as direct DB access is slower/complex in Edge middleware.

## Usage

### Client-side (Frontend)
```typescript
import { useX402 } from "@/hooks/useX402";

const { fetchWithX402, isPaying } = useX402();

async function loadPremiumSignal() {
  // Automatically handles 402 -> Sign/Pay -> Retry
  const res = await fetchWithX402("/api/agents/123/signals/premium");
  const data = await res.json();
}
```

### Agent-side (Autonomous)
Agents serve as both *buyers* and *sellers*.
- **Selling:** Handled by `server.ts` middleware (passive).
- **Buying:** Handled by `AgentKit` + System Prompt (active).
  - We explicitly instruct the agent: *"If you encounter a '402 Payment Required' error... use the 'pay_for_service' tool..."*
  - This ensures the agent knows how to overcome the paywall autonomously.
