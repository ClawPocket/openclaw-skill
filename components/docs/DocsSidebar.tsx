"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function DocsSidebar({ nested = false }: { nested?: boolean }) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "h-full overflow-y-auto hidden md:block",
            nested ? "w-full border-none bg-transparent" : "w-64 flex-shrink-0 border-r border-border bg-card/50"
        )}>
            <div className={cn("py-4", nested ? "p-0" : "p-6")}>
                <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                    Documentation
                </h4>
                <nav className="space-y-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "block px-4 py-2 rounded-md text-sm transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-dashed border-border">
                    <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                        Resources
                    </h4>
                    <Link
                        href="/llms.txt"
                        target="_blank"
                        className="block px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                        llms.txt 🤖
                    </Link>
                </div>
            </div>
        </div>
    );
}
