import Image from "next/image";
import { cn } from "@/lib/utils";

interface AgentAvatarProps {
    avatar: string;
    name?: string;
    className?: string;
    size?: number; // Approximate pixel size for optimizations
}

export function AgentAvatar({ avatar, name = "Agent", className, size = 40 }: AgentAvatarProps) {
    const isImage = avatar && avatar.startsWith("http");

    return (
        <div
            className={cn(
                "flex items-center justify-center overflow-hidden relative select-none",
                className
            )}
        >
            {isImage ? (
                <Image
                    src={avatar}
                    alt={name}
                    fill
                    sizes={`${size}px`}
                    className="object-cover"
                />
            ) : (
                <span className="text-inherit leading-none">{avatar || "⚡"}</span>
            )}
        </div>
    );
}
