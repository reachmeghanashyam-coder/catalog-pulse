import test from "node:test";
import assert from "node:assert/strict";
import { fetchShoppingTelemetry } from "../src/lib/serpapi.ts";

test("SerpApi: handles missing API key or product title safely without crashing", async () => {
  const origKey = process.env.SERPAPI_API_KEY;
  delete process.env.SERPAPI_API_KEY;

  try {
    const resultNoKey = await fetchShoppingTelemetry("Allbirds Tree Runner");
    assert.equal(resultNoKey.source, "SerpApi Google Shopping (Simulated / Key Missing)");
    assert.equal(resultNoKey.totalResultsFound, 0);
    assert.deepEqual(resultNoKey.marketItems, []);

    const resultNoTitle = await fetchShoppingTelemetry("");
    assert.equal(resultNoTitle.totalResultsFound, 0);
  } finally {
    if (origKey) process.env.SERPAPI_API_KEY = origKey;
  }
});

test("SerpApi: handles upstream API failure gracefully", async () => {
  const origKey = process.env.SERPAPI_API_KEY;
  const origFetch = globalThis.fetch;

  process.env.SERPAPI_API_KEY = "test_key";

  // Mock fetch to simulate 500 error from SerpApi
  globalThis.fetch = async () => {
    return {
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal Server Error" }),
    };
  };

  try {
    const result = await fetchShoppingTelemetry("Test Product");
    assert.equal(result.source, "SerpApi Google Shopping (Fallback)");
    assert.equal(result.totalResultsFound, 0);
    assert.deepEqual(result.marketItems, []);
  } finally {
    globalThis.fetch = origFetch;
    if (origKey) process.env.SERPAPI_API_KEY = origKey;
    else delete process.env.SERPAPI_API_KEY;
  }
});

test("SerpApi: parses valid shopping results accurately", async () => {
  const origKey = process.env.SERPAPI_API_KEY;
  const origFetch = globalThis.fetch;

  process.env.SERPAPI_API_KEY = "test_key";

  // Mock fetch to simulate valid Google Shopping payload
  globalThis.fetch = async (url) => {
    assert.ok(url.toString().includes("engine=google_shopping"));
    assert.ok(url.toString().includes("q=Men%27s+Wool+Runner"));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        shopping_results: [
          {
            title: "Allbirds Men's Wool Runner Sneaker",
            price: "$110.00",
            source: "Nordstrom",
            link: "https://nordstrom.com/product/1",
          },
          {
            title: "Allbirds Wool Runners - Natural White",
            price: "$98.00",
            source: "REI",
            link: "https://rei.com/product/2",
          },
        ],
      }),
    };
  };

  try {
    const result = await fetchShoppingTelemetry("Men's Wool Runner");
    assert.equal(result.source, "SerpApi Google Shopping Engine");
    assert.equal(result.totalResultsFound, 2);
    assert.equal(result.marketItems.length, 2);
    assert.equal(result.marketItems[0].title, "Allbirds Men's Wool Runner Sneaker");
    assert.equal(result.marketItems[0].price, "$110.00");
    assert.equal(result.marketItems[0].source, "Nordstrom");
    assert.equal(result.marketItems[0].link, "https://nordstrom.com/product/1");
  } finally {
    globalThis.fetch = origFetch;
    if (origKey) process.env.SERPAPI_API_KEY = origKey;
    else delete process.env.SERPAPI_API_KEY;
  }
});
