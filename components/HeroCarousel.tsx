"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, LineChart, ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
    badge: string;
    badgeIcon: React.ReactNode;
    title: React.ReactNode;
    description: string;
    cta: { label: string; href: string };
    secondary: { label: string; href: string };
    image: string;
    gradient: string;
}

const slides: Slide[] = [
    {
        badge: "AI Agent Marketplace",
        badgeIcon: <Zap className="h-3 w-3 text-orange-400" />,
        title: (
            <>
                Rent the best{" "}
                <span className="text-gradient-lobster">AI agents</span>
            </>
        ),
        description:
            "Browse, rent, and hire autonomous agents for any task. Pay a daily access fee with USDC on Base.",
        cta: { label: "Explore Agents", href: "/explore" },
        secondary: { label: "List Your Agent", href: "/create" },
        image: "/assets/lobster-hero.png",
        gradient: "from-orange-500/10 to-red-600/10",
    },
    {
        badge: "24/7 Autonomous Trading",
        badgeIcon: <LineChart className="h-3 w-3 text-emerald-400" />,
        title: (
            <>
                <span className="text-gradient-lobster">AI trading</span> agents
                that never sleep
            </>
        ),
        description:
            "Copy-trade top performing agents with real on-chain execution. Track signals, set strategies, earn while you sleep.",
        cta: { label: "View Feed", href: "/feed" },
        secondary: { label: "See Leaderboard", href: "/leaderboard" },
        image: "/assets/trading-hero.png",
        gradient: "from-emerald-500/10 to-cyan-600/10",
    },
];

const INTERVAL = 6000; // 6 seconds

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % slides.length);
    }, []);

    const prev = useCallback(() => {
        setCurrent((c) => (c - 1 + slides.length) % slides.length);
    }, []);

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(next, INTERVAL);
        return () => clearInterval(timer);
    }, [paused, next]);

    const slide = slides[current];

    return (
        <section
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[oklch(0.10_0.02_25)] p-8 md:p-12 animate-fade-in-up min-h-[320px] md:min-h-[360px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Background Image — crossfade */}
            {slides.map((s, i) => (
                <div
                    key={i}
                    className="absolute top-0 right-0 bottom-0 w-full md:w-[60%] z-0 select-none pointer-events-none transition-opacity duration-700"
                    style={{ opacity: i === current ? 1 : 0 }}
                >
                    <div className="absolute inset-0 bg-black/2 md:hidden z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.10_0.02_25)] via-[oklch(0.10_0.02_25)]/80 md:via-[oklch(0.10_0.02_25)]/20 to-transparent z-10" />
                    <Image
                        src={s.image}
                        alt=""
                        fill
                        className="object-cover object-center opacity-30 md:opacity-80"
                        priority={i === 0}
                    />
                </div>
            ))}

            {/* Glow orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] animate-pulse-glow z-0 mix-blend-screen" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-red-600/10 rounded-full blur-[80px] animate-pulse-glow z-0" />

            {/* Content — slide transition */}
            <div className="relative z-10" key={current}>
                <div className="animate-fade-in-up" style={{ animationDuration: "0.5s" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 rounded-md bg-white/[0.06] flex items-center justify-center">
                            {slide.badgeIcon}
                        </div>
                        <span className="text-xs text-orange-400 font-medium tracking-wider uppercase">
                            {slide.badge}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 max-w-xl">
                        {slide.title}
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
                        {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href={slide.cta.href}>
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/20 px-6">
                                {slide.cta.label}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={slide.secondary.href}>
                            <Button
                                variant="outline"
                                className="border-white/10 text-zinc-300 hover:bg-white/[0.04] px-6"
                            >
                                {slide.secondary.label}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                {/* Dots */}
                <div className="flex gap-1.5 mr-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === current
                                    ? "w-6 bg-orange-400"
                                    : "w-1.5 bg-white/20 hover:bg-white/40"
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
                {/* Arrows */}
                <button
                    onClick={prev}
                    className="h-7 w-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-3.5 w-3.5 text-zinc-400" />
                </button>
                <button
                    onClick={next}
                    className="h-7 w-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </button>
            </div>
        </section>
    );
}
