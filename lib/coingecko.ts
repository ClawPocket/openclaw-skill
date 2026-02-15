// Simple in-memory cache to prevent rate limiting
// CoinGecko Free Tier: ~30 calls/min
const PRICE_CACHE: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export async function fetchTokenPrice(symbol: string): Promise<number | null> {
    const cleanSymbol = symbol.toUpperCase().replace("$", "").trim();

    // 1. Check Cache
    const cached = PRICE_CACHE[cleanSymbol];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.price;
    }

    // 2. Map Symbol to CoinGecko ID
    // Commonly used tokens on Base/Ethereum
    const ID_MAP: Record<string, string> = {
        ETH: "ethereum",
        WETH: "weth",
        USDC: "usd-coin",
        USDT: "tether",
        DAI: "dai",
        WBTC: "wrapped-bitcoin",
        CBETH: "coinbase-wrapped-staked-eth",
        AERO: "aerodrome-finance",
        DEGEN: "degen-base",
        BRETT: "brett",
        TOSHI: "toshi",
        MOCHI: "mochi",
        TYBG: "base-god",
    };

    const costId = ID_MAP[cleanSymbol];
    if (!costId) {
        console.warn(`[CoinGecko] No ID mapping for symbol: ${cleanSymbol}`);
        return null;
    }

    // 3. Fetch from API
    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${costId}&vs_currencies=usd`
        );

        if (!res.ok) {
            if (res.status === 429) {
                console.warn("[CoinGecko] Rate limited. Returning null.");
                return null;
            }
            throw new Error(`CoinGecko status: ${res.status}`);
        }

        const data = await res.json();
        const price = data[costId]?.usd;

        if (price) {
            // Update Cache
            PRICE_CACHE[cleanSymbol] = { price, timestamp: Date.now() };
            return price;
        }

    } catch (error) {
        console.error("[CoinGecko] Fetch error:", error);
    }

    return null;
}
