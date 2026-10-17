import test from "node:test";
import assert from "node:assert/strict";
import { runGemmaAudit } from "../src/lib/gemma.ts";

test("Grounding: Generated Schema.org JSON-LD adheres strictly to source product facts", async () => {
  // Clear API keys to test the deterministic groundJsonLd engine
  const origGemini = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.HUGGINGFACE_API_KEY;

  try {
    const productData = {
      title: "Tree Runner Go",
      brand: "Allbirds",
      price: "120.00",
      currency: "USD",
      availability: "InStock",
      sku: "TRG-BLK-10",
      gtin: "", // Intentionally missing
      microdataPresent: true,
      description: "Everyday travel shoe with responsive foam cushioning.",
      images: ["https://cdn.allbirds.com/trg-main.jpg", "https://cdn.allbirds.com/trg-side.jpg"],
      url: "https://www.allbirds.com/products/mens-tree-runner-go",
      detectedIssues: ["No GTIN/UPC barcode declared."],
    };

    const audit = await runGemmaAudit(productData);
    const jsonLd = audit.generatedJsonLd;

    // 1. Schema.org context and type
    assert.equal(jsonLd["@context"], "https://schema.org/");
    assert.equal(jsonLd["@type"], "Product");

    // 2. Fact fidelity
    assert.equal(jsonLd.name, "Tree Runner Go");
    assert.equal(jsonLd.brand.name, "Allbirds");
    assert.equal(jsonLd.sku, "TRG-BLK-10");
    assert.equal(jsonLd.description, "Everyday travel shoe with responsive foam cushioning.");

    // 3. Images must be real source images, NOT example.com or fabricated
    assert.deepEqual(jsonLd.image, ["https://cdn.allbirds.com/trg-main.jpg", "https://cdn.allbirds.com/trg-side.jpg"]);
    assert.ok(!JSON.stringify(jsonLd.image).includes("example.com"));

    // 4. Missing GTIN must stay omitted (no fabricated gtin or gtin13)
    assert.equal(jsonLd.gtin13, undefined);
    assert.equal(jsonLd.gtin, undefined);

    // 5. Offer grounding
    assert.equal(jsonLd.offers["@type"], "Offer");
    assert.equal(jsonLd.offers.price, "120.00");
    assert.equal(jsonLd.offers.priceCurrency, "USD");
    assert.equal(jsonLd.offers.availability, "https://schema.org/InStock");
    assert.equal(jsonLd.offers.url, "https://www.allbirds.com/products/mens-tree-runner-go");
  } finally {
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
  }
});
