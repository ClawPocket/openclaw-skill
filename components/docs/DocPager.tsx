"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
    { title: "Introduction", href: "/docs" },
    { title: "Platform Overview", href: "/docs/platform" },
    { title: "Wallets & Security", href: "/docs/wallets" },
    { title: "OpenClaw Integration", href: "/docs/openclaw" },
    { title: "API Reference", href: "/docs/api" },
];

export function DocPager() {
    const pathname = usePathname();
    const currentIndex = items.findIndex((item) => item.href === pathname);

    if (currentIndex === -1) return null;

    const prev = items[currentIndex - 1];
    const next = items[currentIndex + 1];

    return (
        <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
            {prev ? (
                <Link
                    href={prev.href}
                    className="group flex flex-col items-start gap-1 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors w-[45%]"
                >
                    <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                        <ArrowLeft size={12} /> Previous
                    </span>
                    <span className="font-medium">{prev.title}</span>
                </Link>
            ) : <div />}

            {next ? (
                <Link
                    href={next.href}
                    className="group flex flex-col items-end gap-1 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors w-[45%]"
                >
                    <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                        Next <ArrowRight size={12} />
                    </span>
                    <span className="font-medium">{next.title}</span>
                </Link>
            ) : <div />}
        </div>
    );
}
