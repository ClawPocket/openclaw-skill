"use client";

import { useState, useEffect } from "react";
import { Brain, Send, Terminal, AlertCircle, TrendingUp, Info } from "lucide-react";

interface LogEntry {
    timestamp: number;
    log: string;
    type: "info" | "trade" | "error";
}

export function AgentBrain({ agentId }: { agentId: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [message, setMessage] = useState("");
    const [thinking, setThinking] = useState(false);
    const [thought, setThought] = useState("");
    const [loadingLogs, setLoadingLogs] = useState(true);

    // Fetch logs on mount
    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch(`/api/agents/${agentId}/logs`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                }
            } catch {
                // Backend may be sleeping
            } finally {
                setLoadingLogs(false);
            }
        }
        fetchLogs();
        // Poll every 30s
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [agentId]);

    async function handleAsk() {
        if (!message.trim() || thinking) return;
        setThinking(true);
        setThought("");
        try {
            const res = await fetch(`/api/agents/${agentId}/think`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            setThought(data.thought || "No response.");
        } catch {
            setThought("Failed to connect to agent brain.");
        } finally {
            setThinking(false);
            setMessage("");
        }
    }

    const logIcon = (type: string) => {
        switch (type) {
            case "trade": return <TrendingUp className="h-3 w-3 text-emerald-400" />;
            case "error": return <AlertCircle className="h-3 w-3 text-red-400" />;
            default: return <Info className="h-3 w-3 text-zinc-500" />;
        }
    };

    const logColor = (type: string) => {
        switch (type) {
            case "trade": return "border-emerald-500/20 bg-emerald-500/5";
            case "error": return "border-red-500/20 bg-red-500/5";
            default: return "border-white/[0.04] bg-white/[0.02]";
        }
    };

    return (
        <div className="space-y-6">
            {/* Ask Agent */}
            <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Brain className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <h3 className="text-sm font-semibold">Ask Agent</h3>
                    <span className="text-[10px] text-zinc-600 ml-auto">Powered by Groq + AgentKit</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                        placeholder="Ask about market conditions, strategy, or trigger analysis..."
                        className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl h-10 px-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
                        disabled={thinking}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={thinking || !message.trim()}
                        className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-40"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>

                {/* Agent Response */}
                {(thinking || thought) && (
                    <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        {thinking ? (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                                Agent is thinking...
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{thought}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Activity Logs */}
            <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-semibold">Agent Activity</h3>
                    <span className="text-[10px] text-zinc-600 ml-auto">
                        {logs.length} log{logs.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {loadingLogs ? (
                    <div className="text-sm text-zinc-600 text-center py-6">Loading agent activity...</div>
                ) : logs.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {logs.slice().reverse().map((log, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-lg border ${logColor(log.type)}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {logIcon(log.type)}
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {log.log.length > 300 ? log.log.substring(0, 300) + "..." : log.log}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-zinc-600 text-center py-6">
                        No activity yet. The agent brain will log its autonomous actions here.
                    </div>
                )}
            </div>
        </div>
    );
}
