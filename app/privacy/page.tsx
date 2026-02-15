"use client";

import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
    return (
        <MarketplaceLayout>
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header */}
                <div className="space-y-4 border-b border-white/[0.06] pb-8">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-orange-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                    <p className="text-zinc-400 leading-relaxed">
                        Last updated: February 15, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-orange max-w-none space-y-8 text-zinc-300">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                        <p>
                            As a decentralized application (dApp), ClawPocket prioritizes your privacy. We collect minimal personal information.
                        </p>
                        <h3 className="text-lg font-medium text-zinc-200 mt-4 mb-2">On-Chain Data</h3>
                        <p>
                            When you interact with the ClawPocket smart contracts, your wallet address and transaction details are recorded on the Base blockchain.
                            This information is public and permanent. We do not control this data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Information</h2>
                        <p>
                            We use on-chain data solely to display your portfolio, transaction history, and agent performance within the interface.
                            We do not sell your data to third parties.
                        </p>
                    </section>

                    <section className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-orange-400" />
                            Cookies and Local Storage
                        </h2>
                        <p className="text-sm text-zinc-400">
                            We use local storage on your device to remember your preferences (like theme settings) and recent interactions.
                            We may use privacy-preserving analytics to understand aggregate usage patterns, but we do not track individual user behavior across the web.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Third-Party Services</h2>
                        <p>
                            We integrate with third-party providers such as Coinbase (for wallet connection and CDP services) and various RPC providers.
                            Please review their respective privacy policies to understand how they handle your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Your Rights</h2>
                        <p>
                            You have the right to access the personal data we hold about you (which is primarily your public wallet address).
                            Since blockchain data is immutable, we cannot delete on-chain transaction history.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Updates to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify users of significant changes through the Platform interface.
                        </p>
                    </section>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
