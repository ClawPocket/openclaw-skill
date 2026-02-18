"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Book } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { title: "Introduction", href: "/docs" },
    { title: "Platform Overview", href: "/docs/platform" },
    { title: "Wallets & Security", href: "/docs/wallets" },
    { title: "Agent Commerce (x402)", href: "/docs/commerce" },
    { title: "OpenClaw Integration", href: "/docs/openclaw" },
    { title: "ZeptoClaw Integration", href: "/docs/zeptoclaw" },
    { title: "API Reference", href: "/docs/api" },
];

export function MobileDocsNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="md:hidden border-b border-border bg-card/50 p-4 sticky top-0 z-50 backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <Book className="w-5 h-5 text-primary" />
                    <span>Documentation</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {isOpen && (
                <nav className="mt-4 pt-4 border-t border-dashed border-border flex flex-col gap-2">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "block px-4 py-3 rounded-md text-sm transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                    <div className="my-2 border-t border-border" />
                    <Link
                        href="/llms.txt"
                        target="_blank"
                        className="block px-4 py-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                        llms.txt 🤖
                    </Link>
                </nav>
            )}
        </div>
    );
}
