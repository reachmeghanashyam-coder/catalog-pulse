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

  assert.ok(data.serpContext, "SerpApi telemetry must be present");
  assert.ok(typeof data.serpContext.totalResultsFound === "number");

  assert.ok(data.audit, "Gemma audit result must be present");
  assert.ok(typeof data.audit.score === "number");
  assert.ok(["A", "B", "C", "D", "F"].includes(data.audit.grade));
  assert.ok(data.audit.modelUsed, "Audit must provide modelUsed telemetry");
  console.log(`\n>>> LIVE PRODUCTION VERIFICATION SUCCESS <<<`);
  console.log(`Product: ${data.product.title} (${data.product.brand})`);
  console.log(`Live Model Identified: ${data.audit.modelUsed}`);
  console.log(`Score: ${data.audit.score} / Grade: ${data.audit.grade}`);
  console.log(`SerpApi Results Found: ${data.serpContext?.totalResultsFound}`);
  console.log(`Generated JSON-LD Context: ${data.audit.generatedJsonLd["@context"]}, Type: ${data.audit.generatedJsonLd["@type"]}\n`);

  // Verify Schema.org grounding
  assert.equal(data.audit.generatedJsonLd["@type"], "Product");
  assert.equal(data.audit.generatedJsonLd.brand?.name || data.audit.generatedJsonLd.brand, "Allbirds");
});
