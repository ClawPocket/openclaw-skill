import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";

// USDC Contract on Base
export const USDC_ADDRESS = "0x8335891CD666354590615957240451f26748285B";

// Public RPC (fallback to default)
const client = createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
});

export interface TransactionVerification {
    valid: boolean;
    error?: string;
    sender?: string;
    amount?: bigint;
}

/**
 * Verifies that a transaction:
 * 1. Exists and is successful
 * 2. Transferred USDC
 * 3. Contains the expected recipient (agent wallet or platform)
 */
export async function verifyTransaction(
    txHash: string,
    recipientWallet: string
): Promise<TransactionVerification> {
    try {
        // 1. Get Transaction Receipt
        const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });

        if (receipt.status !== "success") {
            return { valid: false, error: "Transaction failed on-chain" };
        }

        // 2. Check logs for USDC Transfer
        // Event: Transfer(address indexed from, address indexed to, uint256 value)
        // Topic0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

        let validTransfer = false;
        let sender = "";
        let amount = 0n;

        for (const log of receipt.logs) {
            // Check if log is emitted by USDC contract (case insensitive)
            if (log.address.toLowerCase() !== USDC_ADDRESS.toLowerCase()) continue;

            try {
                // Parse "Transfer" event
                // We use parseAbiItem to safely decode
                const event = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

                // Decode log topics manually or use viem helper if available, 
                // but checking topics directly is robust for standard ERC20.
                const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

                if (log.topics[0] === transferTopic && log.topics[2]) {
                    // topics[1] = from (padded), topics[2] = to (padded)
                    const toAddress = `0x${log.topics[2].slice(26)}`; // Remove padding

                    if (toAddress.toLowerCase() === recipientWallet.toLowerCase()) {
                        validTransfer = true;
                        sender = `0x${log.topics[1]?.slice(26)}`;
                        // value is in data
                        amount = BigInt(log.data);
                        break;
                    }
                }
            } catch (err) {
                console.error("Log parse error", err);
                continue;
            }
        }

        if (!validTransfer) {
            return { valid: false, error: `No USDC transfer found to ${recipientWallet}` };
        }

        return { valid: true, sender, amount };

    } catch (error) {
        console.error("msg verification error", error);
        return { valid: false, error: "Verification process failed" };
    }
}
