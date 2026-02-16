"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeleteAgentButtonProps {
    agentId: string;
    agentName: string;
    ownerWallet: string;
}

export function DeleteAgentButton({ agentId, agentName, ownerWallet }: DeleteAgentButtonProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const router = useRouter();

    const isOwner = isConnected && address && address.toLowerCase() === ownerWallet.toLowerCase();

    if (!isOwner) return null;

    const handleDelete = async () => {
        if (!address) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            setIsDeleting(true);

            // 1. Sign Message to verify ownership
            const signature = await signMessageAsync({
                message: `Delete Agent: ${agentName} (${agentId})`,
            });

            // 2. Call API
            const response = await fetch(`/api/agents/${agentId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet: address,
                    signature,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete agent");
            }

            toast.success("Agent deleted successfully");
            setOpen(false);

            // Redirect to home
            router.push("/");
            router.refresh();

        } catch (error: any) {
            console.error("Delete error:", error);
            if (error?.name === "UserRejectedRequestError") {
                toast.error("User rejected signature");
            } else {
                toast.error(error.message || "Failed to delete agent");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-12 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-mono"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Agent
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-red-500/20 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Agent
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 pt-2">
                        Are you sure you want to delete <span className="text-white font-semibold">{agentName}</span>?
                        <br /><br />
                        This action cannot be undone. All stats, signals, and subscriptions will be permanently removed.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-xs text-red-200/80 mb-4">
                    <p>⚠️ You will be asked to sign a message to confirm ownership.</p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isDeleting}
                        className="hover:bg-white/5 hover:text-white dark:text-zinc-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500/80 hover:bg-red-500 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Forever"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
