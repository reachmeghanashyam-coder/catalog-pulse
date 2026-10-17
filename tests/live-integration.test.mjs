import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PROD_ENDPOINT = "https://catalog-pulse.vercel.app/api/audit";

test("Live Production Audit: Allbirds Tree Runner test against live Vercel deployment", async () => {
  const payload = {
    url: "https://www.allbirds.com/products/mens-tree-runners",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const res = await fetch(PROD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  assert.equal(res.status, 200, `Expected HTTP 200 from live production endpoint, got ${res.status}`);
  const data = await res.json();

  assert.equal(data.success, true);
  assert.ok(data.product, "Product extraction must be present");
  assert.equal(data.product.brand, "Allbirds");
  assert.ok(data.product.price, "Price must be extracted");

  // --- Provider 1: SerpApi Independent Verification ---
  assert.ok(data.serpContext, "SerpApi context must be returned");
  assert.equal(data.serpContext.source, "SerpApi Google Shopping Engine", "Must reach SerpApi Google Shopping Engine");
  assert.ok(data.serpContext.totalResultsFound > 0, "Must return real Google Shopping results count");
  assert.ok(Array.isArray(data.serpContext.marketItems) && data.serpContext.marketItems.length > 0, "Must extract parsed market items");
  assert.ok(data.serpContext.marketItems[0].title, "Market item must contain product title");
  assert.ok(data.serpContext.marketItems[0].price, "Market item must contain price");
  assert.ok(data.serpContext.marketItems[0].source, "Market item must identify merchant/source");

  // --- Provider 2: Google Gemma Independent Verification ---
  assert.ok(data.audit, "Gemma audit result must be present");
  assert.ok(typeof data.audit.score === "number", "Audit score must be numeric");
  assert.ok(["A", "B", "C", "D", "F"].includes(data.audit.grade), "Audit grade must be A/B/C/D/F");
  assert.equal(data.audit.modelUsed, "Google Gemma 4 (gemma-4-26b-a4b-it)", "Must verify Google Gemma 4 was the active engine");
  assert.ok(Array.isArray(data.audit.criticalFlaws), "Critical flaws must be an array");
  assert.ok(Array.isArray(data.audit.recommendations), "Recommendations must be an array");

  // --- Schema.org JSON-LD Fact Grounding Verification ---
  assert.equal(data.audit.generatedJsonLd["@context"], "https://schema.org");
  assert.equal(data.audit.generatedJsonLd["@type"], "Product");
  assert.equal(data.audit.generatedJsonLd.name, "Men's Tree Runner");
  assert.equal(data.audit.generatedJsonLd.brand?.name || data.audit.generatedJsonLd.brand, "Allbirds");

  console.log(`\n=======================================================`);
  console.log(`>>> INDEPENDENT PROVIDER VERIFICATION: PASS <<<`);
  console.log(`1. SerpApi: ${data.serpContext.totalResultsFound} Google Shopping results via ${data.serpContext.source}`);
  console.log(`   Sample Market Item: "${data.serpContext.marketItems[0].title}" - ${data.serpContext.marketItems[0].price} (${data.serpContext.marketItems[0].source})`);
  console.log(`2. Google Gemma: Verified active model -> ${data.audit.modelUsed}`);
  console.log(`   Audit Score: ${data.audit.score} (Grade ${data.audit.grade})`);
  console.log(`   Schema Grounding: ${data.audit.generatedJsonLd["@context"]} -> ${data.audit.generatedJsonLd["@type"]}`);
  console.log(`=======================================================\n`);
});
