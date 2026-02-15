/**
 * Backend Client — Communicates with the Pocket Trader backend (Render)
 * All AI-powered operations are handled by the backend.
 */

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://clawpocket-agent.onrender.com";

interface BackendAgent {
    id: string;
    name: string;
    config: { agentId: string; persona: string; risk: number };
    walletAddress?: string;
    createdAt: number;
    logs: BackendLog[];
}

export interface BackendLog {
    timestamp: number;
    log: string;
    type: "info" | "trade" | "error";
}

interface HealthResponse {
    status: string;
    activeAgents: number;
    storedAgents: number;
    uptime: number;
}

/** Check if the backend is alive */
export async function checkHealth(): Promise<HealthResponse | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

/** Create a new AI agent on the backend */
export async function createBackendAgent(opts: {
    name: string;
    persona: string;
    risk?: number;
}): Promise<BackendAgent | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/agents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: opts.name,
                persona: opts.persona,
                risk: opts.risk ?? 50,
            }),
        });
        if (!res.ok) {
            console.error("Backend agent creation failed:", await res.text());
            return null;
        }
        const data = await res.json();
        return data.agent;
    } catch (error) {
        console.error("Backend agent creation error:", error);
        return null;
    }
}

/** Trigger agent thinking / chat */
export async function triggerAgentThink(
    backendAgentId: string,
    message?: string
): Promise<string> {
    try {
        const res = await fetch(`${BACKEND_URL}/agents/${backendAgentId}/think`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message || "Analyze the market." }),
        });
        if (!res.ok) return `Error: ${res.statusText}`;
        const data = await res.json();
        return data.thought || "No response from agent.";
    } catch (error) {
        return `Connection error: ${error}`;
    }
}

/** Get agent activity logs */
export async function getAgentLogs(
    backendAgentId: string
): Promise<BackendLog[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/agents/${backendAgentId}/logs`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.logs || [];
    } catch {
        return [];
    }
}

/** List all backend agents */
export async function listBackendAgents(): Promise<BackendAgent[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/agents`, { cache: "no-store" });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}
