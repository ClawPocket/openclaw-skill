import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MobileDocsNav } from "@/components/docs/MobileDocsNav";
import { MarketplaceLayout } from "@/components/MarketplaceLayout";
import { TOC } from "@/components/docs/TOC";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <MarketplaceLayout>
            <div className="flex flex-col md:flex-row gap-8 relative items-start min-w-0">
                <div className="md:hidden w-full sticky top-0 z-30">
                    <MobileDocsNav />
                </div>

                <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4">
                    <DocsSidebar nested />
                </aside>

                <main className="flex-1 min-w-0 pb-24 md:pb-12">
                    <div className="container max-w-4xl mx-auto overflow-x-hidden">
                        {children}
                    </div>
                </main>

                <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pl-4">
                    <TOC />
                </aside>
            </div>
        </MarketplaceLayout>
    );
}
