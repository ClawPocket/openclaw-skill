"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, LayoutDashboard, Zap, Newspaper } from "lucide-react";

import { WalletConnect } from "./WalletConnect";

const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/feed", label: "Feed", icon: Newspaper },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/create", label: "List Agent", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-[oklch(0.10_0.005_285)] border-r border-white/[0.06] z-40">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06]">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-base tracking-tight">ClawPocket</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                ? "bg-white/[0.08] text-white"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer — Wallet Connect */}
            <div className="mt-auto border-t border-white/[0.06]">
                <div className="px-5 py-4">
                    <WalletConnect />
                </div>
                <div className="px-5 pb-4 flex gap-3 text-[10px] text-zinc-600">
                    <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
                    <span>v1.0.0</span>
                </div>
            </div>
        </aside>
    );
}

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[oklch(0.08_0.005_285)]/95 backdrop-blur-xl border-t border-white/[0.06] z-50 flex items-center justify-around px-2">
            {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] transition-all ${isActive ? "text-orange-400" : "text-zinc-600"
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
