"use client";

import { Sidebar, MobileNav } from "./Sidebar";
import { Topbar } from "./Topbar";

export function MarketplaceLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <MobileNav />
            <main className="md:ml-[240px] min-h-screen pb-20 md:pb-0 safe-area-left safe-area-right">
                <Topbar />
                <div className="px-4 md:px-8 py-6 md:py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
