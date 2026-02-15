import fs from "fs";
import path from "path";
import { AgentListing, Signal, Subscription } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readJSON<T>(filename: string): T[] {
    ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, "[]");
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(filepath, "utf-8"));
    } catch {
        return [];
    }
}

function writeJSON<T>(filename: string, data: T[]) {
    ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// --- Agents ---
export function getAgents(): AgentListing[] {
    return readJSON<AgentListing>("agents.json");
}

export function getAgent(id: string): AgentListing | undefined {
    return getAgents().find((a) => a.id === id);
}

export function saveAgent(agent: AgentListing) {
    const agents = getAgents();
    const index = agents.findIndex((a) => a.id === agent.id);
    if (index >= 0) {
        agents[index] = agent;
    } else {
        agents.push(agent);
    }
    writeJSON("agents.json", agents);
}

// --- Signals ---
export function getSignals(agentId?: string): Signal[] {
    const signals = readJSON<Signal>("signals.json");
    if (agentId) return signals.filter((s) => s.agentId === agentId);
    return signals;
}

export function addSignal(signal: Signal) {
    const signals = getSignals();
    signals.push(signal);
    writeJSON("signals.json", signals);
}

// --- Subscriptions ---
export function getSubscriptions(agentId?: string): Subscription[] {
    const subs = readJSON<Subscription>("subscriptions.json");
    if (agentId) return subs.filter((s) => s.agentId === agentId);
    return subs;
}

export function addSubscription(sub: Subscription) {
    const subs = getSubscriptions();
    subs.push(sub);
    writeJSON("subscriptions.json", subs);
}
