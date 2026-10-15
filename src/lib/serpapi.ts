export interface SerpApiShoppingResult {
  source: string;
  query: string;
  totalResultsFound: number;
  marketItems: Array<{
    title: string;
    price: string;
    source: string;
    link?: string;
  }>;
  priceSpread?: {
    min: string;
    max: string;
  };
}

export async function fetchShoppingTelemetry(productTitle: string): Promise<SerpApiShoppingResult> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey || !productTitle) {
    return {
      source: "SerpApi Google Shopping (Simulated / Key Missing)",
      query: productTitle,
      totalResultsFound: 0,
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
      price: item.price || item.extracted_price?.toString() || "N/A",
      source: item.source || "Google Merchant",
      link: item.link,
    }));

    return {
      source: "SerpApi Google Shopping Engine",
      query: productTitle,
      totalResultsFound: shoppingResults.length,
      marketItems: items,
    };
  } catch (error) {
    console.error("SerpApi query failed:", error);
    return {
      source: "SerpApi Google Shopping (Fallback)",
      query: productTitle,
      totalResultsFound: 0,
      marketItems: [],
    };
  }
}
