"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    title: string;
    level: number;
}

export function TOC() {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    const pathname = usePathname();

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll(".prose h2, .prose h3"))
            .map((elem) => ({
                id: elem.id,
                title: elem.textContent || "",
                level: Number(elem.tagName.substring(1)),
            }))
            .filter((item) => item.id); // Only include items with IDs

        setHeadings(elements);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        elements.forEach((item) => {
            const elem = document.getElementById(item.id);
            if (elem) observer.observe(elem);
        });

        return () => observer.disconnect();
    }, [pathname]);

    if (headings.length === 0) return null;

    return (
        <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground mb-4">On This Page</h4>
            <ul className="space-y-2 text-sm">
                {headings.map((item) => (
                    <li
                        key={item.id}
                        style={{ paddingLeft: (item.level - 2) * 12 }}
                    >
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                "block transition-colors hover:text-foreground",
                                activeId === item.id
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                const elem = document.getElementById(item.id);
                                if (elem) {
                                    const top = elem.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for header
                                    window.scrollTo({ top, behavior: "smooth" });
                                    setActiveId(item.id);
                                }
                            }}
                        >
                            {item.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
