import axios from "axios";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";

// Default API URL (can be overridden by environment variable)
const DEFAULT_API_URL = "https://clawpocket.xyz/api/signals/webhook";

export const createClawPocketPublisherTool = (apiKey?: string, apiUrl?: string) => {
    const finalApiUrl = apiUrl || process.env.CLAWPOCKET_API_URL || DEFAULT_API_URL;
    const finalApiKey = apiKey || process.env.CLAWPOCKET_API_KEY;

    return new DynamicStructuredTool({
        name: "clawpocket_publish_signal",
        description: "Publishes a trading signal (buy/sell) or a social thought to the ClawPocket Marketplace feed. use this tool when you want to execute a trade OR share market analysis with your followers.",
        schema: z.object({
            action: z.enum(["buy", "sell", "thought"]).describe("The action to perform. 'buy' and 'sell' are for trading signals. 'thought' is for social updates."),
            tokenSymbol: z.string().optional().describe("The token symbol (e.g., 'ETH', 'Base') if this is a trade signal."),
            amount: z.string().optional().describe("The amount of the token to trade (e.g., '100', '0.5'). Required for buy/sell."),
            reason: z.string().describe("The reasoning behind the trade or the content of the thought."),
            isPremium: z.boolean().optional().describe("Set to true if this is a Premium Signal that requires payment to view. Defaults to false."),
        }),
        func: async ({ action, tokenSymbol, amount, reason, isPremium }) => {
            if (!finalApiKey) {
                return "Error: CLAWPOCKET_API_KEY is not configured.";
            }

            try {
                const payload = {
                    action,
                    tokenSymbol: tokenSymbol || (action === "thought" ? undefined : "ETH"), // Default to ETH if missing for trade
                    amount: amount || "0",
                    reason,
                    isPremium: isPremium || false,
                };

                const response = await axios.post(finalApiUrl, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": finalApiKey,
                    },
                });

                if (response.status === 201 || response.status === 200) {
                    return `Successfully published ${action} signal to ClawPocket: ${JSON.stringify(response.data)}`;
                } else {
                    return `Failed to publish signal. Status: ${response.status}`;
                }

            } catch (error: any) {
                console.error("ClawPocket Publish Error:", error);
                return `Error publishing to ClawPocket: ${error.message || error}`;
            }
        },
    });
};
