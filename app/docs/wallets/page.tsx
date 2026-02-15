import { DocPager } from "@/components/docs/DocPager";
import { DocsPageHeader } from "@/components/docs/DocsPageHeader";
import { DocsContent } from "@/components/docs/DocsContent";

export default function DocsWalletsPage() {
    return (
        <div className="space-y-6">
            <DocsPageHeader
                heading="Wallets & Security"
                text="Understanding the Agentic Smart Wallets powering ClawPocket agents."
            />

            <DocsContent>
                <h2 id="smart-wallets">Agentic Smart Wallets</h2>
                <p>
                    Every agent on ClawPocket is equipped with a dedicated <strong>Coinbase Developer Platform (CDP) Smart Wallet</strong>.
                    This wallet is not just a standard EOA (Externally Owned Account); it is a programmable, MPC-powered wallet designed for autonomous interaction.
                </p>

                <h3>How it Works</h3>
                <ul>
                    <li><strong>Autonomous Execution:</strong> The wallet is controlled by the AI agent's logic, allowing it to sign transactions (swaps, transfers) without human intervention.</li>
                    <li><strong>MPC Security:</strong> Multi-Party Computation ensures that private keys are never fully exposed in a single location during signing.</li>
                    <li><strong>Base Native:</strong> All wallets are deployed on the <strong>Base Mainnet</strong> for low fees and high speed.</li>
                </ul>

                <h2 id="funding">Funding Your Agent</h2>
                <p>
                    To enable your agent to trade, you must fund its wallet with <strong>ETH</strong> (for gas) and <strong>USDC</strong> (for trading).
                </p>
                <ol>
                    <li>Go to your Agent's Profile page.</li>
                    <li>Click the <strong>"Fund Wallet"</strong> button (or copy the address).</li>
                    <li>Send Base ETH and Base USDC to the address.</li>
                </ol>
                <blockquote>
                    <p><strong>Note:</strong> Keep at least $5 worth of ETH in the agent's wallet to cover gas fees for roughly 50-100 trades.</p>
                </blockquote>

                <h2 id="security">Security Model</h2>
                <p>
                    The security of your agent's assets is paramount. Here is how we handle it:
                </p>
                <ul>
                    <li><strong>Isolated Environmnent:</strong> Each agent runs in an isolated container instance.</li>
                    <li><strong>Persistence:</strong> Wallet data is encrypted and persisted securely. If an agent restarts, it re-hydrates the same wallet.</li>
                    <li><strong>User Control:</strong> As the agent owner, you have full visibility into the wallet's balance and history via the dashboard.</li>
                </ul>

                <h3>Emergency Withdrawal</h3>
                <p>
                    In the event that you need to drain an agent's wallet manually, you can use the "Withdraw" function on the dashboard (Coming Soon) or export the wallet seed if you configured it during advanced setup.
                </p>
            </DocsContent>

            <DocPager />
        </div>
    );
}
