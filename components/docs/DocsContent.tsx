import { cn } from "@/lib/utils";

interface DocsContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DocsContent({ className, ...props }: DocsContentProps) {
    return (
        <div
            className={cn(
                "prose prose-invert max-w-none w-full",
                "prose-headings:font-semibold prose-headings:tracking-tight",
                "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
                "prose-p:leading-7 prose-p:text-muted-foreground",
                "prose-ul:text-muted-foreground prose-li:my-2",
                "prose-code:text-primary prose-code:font-mono prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm",
                "prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border",
                className
            )}
            {...props}
        />
    );
}
