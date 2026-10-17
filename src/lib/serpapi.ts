export interface SerpApiShoppingResult {
  source: string;
  query: string;
  totalResultsFound: number;
  fetchedAt?: string;
  marketItems: Array<{
    title: string;
    price: string;
    extractedPrice?: number;
    source: string;
    link?: string;
  }>;
  priceSpread?: {
    min: number;
    max: number;
    median: number;
  };
}

export interface PriceIntegrityAnalysis {
  officialPrice: number;
  minMarketPrice: number | null;
  maxMarketPrice: number | null;
  medianMarketPrice: number | null;
  undercutDetected: boolean;
  undercutPercent: number;
  lowestSeller: string | null;
  statusLabel: string;
}

export function computePriceIntegrity(
  officialPriceStr: string,
  marketItems: Array<{ price: string; extractedPrice?: number; source: string }>
): PriceIntegrityAnalysis {
  const officialPrice = parseFloat(String(officialPriceStr || "0").replace(/[^0-9.]/g, "")) || 0;
  const parsedItems = (marketItems || [])
    .map((item) => {
      const val =
        typeof item.extractedPrice === "number" && !Number.isNaN(item.extractedPrice)
          ? item.extractedPrice
          : parseFloat(String(item.price || "").replace(/[^0-9.]/g, ""));
      return { priceVal: val, source: item.source || "Merchant" };
    })
    .filter((i) => !Number.isNaN(i.priceVal) && i.priceVal > 0)
    .sort((a, b) => a.priceVal - b.priceVal);

  if (parsedItems.length === 0) {
    return {
      officialPrice,
      minMarketPrice: null,
      maxMarketPrice: null,
      medianMarketPrice: null,
      undercutDetected: false,
      undercutPercent: 0,
      lowestSeller: null,
      statusLabel: "No External Comps Found",
    };
  }

  const minMarketPrice = parsedItems[0].priceVal;
  const maxMarketPrice = parsedItems[parsedItems.length - 1].priceVal;
  const mid = Math.floor(parsedItems.length / 2);
  const medianMarketPrice =
    parsedItems.length % 2 !== 0
      ? parsedItems[mid].priceVal
      : Number(((parsedItems[mid - 1].priceVal + parsedItems[mid].priceVal) / 2).toFixed(2));

  const lowestSeller = parsedItems[0].source;
  const undercutDetected = officialPrice > 0 && minMarketPrice < officialPrice;
  const undercutPercent =
    undercutDetected && officialPrice > 0
      ? Math.round(((officialPrice - minMarketPrice) / officialPrice) * 100)
      : 0;

  const statusLabel = undercutDetected
    ? `Reseller Undercut (-${undercutPercent}% on ${lowestSeller})`
    : "Price Parity Verified";

  return {
    officialPrice,
    minMarketPrice,
    maxMarketPrice,
    medianMarketPrice,
    undercutDetected,
    undercutPercent,
    lowestSeller,
    statusLabel,
  };
}

export async function fetchShoppingTelemetry(productTitle: string): Promise<SerpApiShoppingResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  const fetchedAt = new Date().toISOString();

  if (!apiKey || !productTitle) {
    return {
      source: "SerpApi Google Shopping (Simulated / Key Missing)",
      query: productTitle,
      totalResultsFound: 0,
      fetchedAt,
      marketItems: [],
    };
  }

  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_shopping");
    url.searchParams.set("q", productTitle);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("num", "5");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`SerpApi responded with status: ${res.status}`);
    }

    const data = await res.json();
    const shoppingResults = data.shopping_results || [];

    const items = shoppingResults.slice(0, 5).map((item: any) => ({
      title: item.title,
      price: item.price || (item.extracted_price ? `$${item.extracted_price}` : "N/A"),
      extractedPrice: typeof item.extracted_price === "number" ? item.extracted_price : undefined,
      source: item.source || "Google Merchant",
      link: item.link || item.product_link,
    }));

    const numericPrices = items
      .map((i: any) => i.extractedPrice ?? parseFloat(String(i.price || "").replace(/[^0-9.]/g, "")))
      .filter((n: number) => !Number.isNaN(n) && n > 0)
      .sort((a: number, b: number) => a - b);

    const priceSpread =
      numericPrices.length > 0
        ? {
            min: numericPrices[0],
            max: numericPrices[numericPrices.length - 1],
            median:
              numericPrices.length % 2 !== 0
                ? numericPrices[Math.floor(numericPrices.length / 2)]
                : Number(
                    (
                      (numericPrices[Math.floor(numericPrices.length / 2) - 1] +
                        numericPrices[Math.floor(numericPrices.length / 2)]) /
                      2
                    ).toFixed(2)
                  ),
          }
        : undefined;

    return {
      source: "SerpApi Google Shopping Engine",
      query: productTitle,
      totalResultsFound: shoppingResults.length,
      fetchedAt,
      marketItems: items,
      priceSpread,
    };
  } catch (error) {
    console.error("SerpApi query failed:", error);
    return {
      source: "SerpApi Google Shopping (Fallback)",
      query: productTitle,
      totalResultsFound: 0,
      fetchedAt,
      marketItems: [],
    };
  }
}
