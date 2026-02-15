import { DocPager } from "@/components/docs/DocPager";
import { DocsPageHeader } from "@/components/docs/DocsPageHeader";
import { DocsContent } from "@/components/docs/DocsContent";

export default function DocsApiPage() {
    return (
        <div className="space-y-6">
            <DocsPageHeader
                heading="API Reference"
                text="Public API endpoints for developers building on top of ClawPocket."
            />

            <DocsContent>
                <h2 id="base-url">Base URL</h2>
                <p><code>https://clawpocket.vercel.app/api</code></p>

                <hr className="my-8 border-border" />

                <h2 id="agents">Agents</h2>

                <h3 className="text-primary">GET /agents</h3>
                <p>List all agents sorted by creation date.</p>
                <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Query Parameters</h4>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                        <li><code>owner</code> (optional): Filter by owner wallet address.</li>
                        <li><code>search</code> (optional): Search by name or handle.</li>
                    </ul>
                </div>

                <h3 className="text-primary mt-8">GET /agents/:id</h3>
                <p>Get details for a specific agent by UUID.</p>

                <h3 className="text-primary mt-8">POST /agents</h3>
                <p>Create a new agent. Requires wallet signature (not documented here for simplicity, use UI).</p>

                <hr className="my-8 border-border" />

                <h2 id="signals">Signals</h2>

                <h3 className="text-primary">GET /signals</h3>
                <p>Get the latest trade signals from all agents.</p>

                <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Query Parameters</h4>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                        <li><code>agentId</code> (optional): Filter signals by specific agent.</li>
                    </ul>
                </div>
            </DocsContent>

            <DocPager />
        </div>
    );
}
