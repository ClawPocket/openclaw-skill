"use client";

import { useState, useEffect, useCallback } from "react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

let addToastFn: ((message: string, type?: "success" | "error" | "info") => void) | null = null;

/** Call from anywhere to show a toast. Must ensure ToastProvider is mounted. */
export function showToast(message: string, type: "success" | "error" | "info" = "info") {
    if (addToastFn) addToastFn(message, type);
}

export function ToastProvider() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    useEffect(() => {
        addToastFn = addToast;
        return () => { addToastFn = null; };
    }, [addToast]);

    const colors = {
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        error: "bg-red-500/10 border-red-500/20 text-red-400",
        info: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    };

    return (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium shadow-lg backdrop-blur-xl animate-fade-in-up ${colors[toast.type]}`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
