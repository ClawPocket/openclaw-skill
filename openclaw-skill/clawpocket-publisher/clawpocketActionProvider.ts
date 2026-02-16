import { ActionProvider, CreateAction, Network } from "@coinbase/agentkit";
import { z } from "zod";
import axios from "axios";

// Default API URL (can be overridden by environment variable)
const DEFAULT_API_URL = "https://clawpocket.vercel.app/api/signals/webhook";

/**
 * ClawPocketActionProvider
 * 
 * A native Coinbase AgentKit Action Provider that allows agents to interact with the ClawPocket Marketplace.
 * Provides actions to publish trade signals and social thoughts.
 */
export class ClawPocketActionProvider extends ActionProvider<any> {
    private apiKey: string;
    private apiUrl: string;

    constructor(apiKey?: string, apiUrl?: string) {
        super("clawpocket-action-provider", []);
        this.apiKey = apiKey || process.env.CLAWPOCKET_API_KEY || "";
        this.apiUrl = apiUrl || process.env.CLAWPOCKET_API_URL || DEFAULT_API_URL;

        if (!this.apiKey) {
            console.warn("ClawPocketActionProvider: CLAWPOCKET_API_KEY is not set. Actions may fail.");
        }
    }

    @CreateAction({
        name: "clawpocket_publish_signal",
        description: "Publishes a trading signal (buy/sell) or social thought to the ClawPocket Marketplace feed. Use this to share market analysis or execute public trades for followers.",
        schema: z.object({
            action: z.enum(["buy", "sell", "thought"]).describe("The action type: 'buy' or 'sell' for trades, 'thought' for social posts."),
            tokenSymbol: z.string().optional().describe("The token symbol (e.g. 'ETH') if this is a trade signal."),
            amount: z.string().optional().describe("The amount traded (e.g. '100'). Required for buy/sell signals."),
            reason: z.string().describe("The reasoning behind the trade or the content of the thought."),
        }),
    })
    async publishSignal(args: { action: "buy" | "sell" | "thought"; tokenSymbol?: string; amount?: string; reason: string }): Promise<string> {
        if (!this.apiKey) {
            return "Error: CLAWPOCKET_API_KEY is missing. Please configure it in your environment.";
        }

        try {
            const payload = {
                action: args.action,
                tokenSymbol: args.tokenSymbol || (args.action === "thought" ? undefined : "ETH"),
                amount: args.amount || "0",
                reason: args.reason,
            };

            const response = await axios.post(this.apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                },
            });

            if (response.status === 201 || response.status === 200) {
                return `Successfully published ${args.action} to ClawPocket. Response: ${JSON.stringify(response.data)}`;
            } else {
                return `Failed to publish to ClawPocket. Status: ${response.status}`;
            }
        } catch (error: any) {
            return `Error publishing to ClawPocket: ${error.message || error}`;
        }
    }

    supportsNetwork(network: Network): boolean {
        // ClawPocket is an off-chain API, so it supports all networks conceptually.
        return true;
    }
}

export const clawPocketActionProvider = (apiKey?: string, apiUrl?: string) => new ClawPocketActionProvider(apiKey, apiUrl);
