import test from "node:test";
import assert from "node:assert/strict";
import { runGemmaAudit } from "../src/lib/gemma.ts";

test("Schema & Fact Fidelity: OutOfStock availability is preserved accurately in generated JSON-LD", async () => {
  const origGemini = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const outOfStockProduct = {
      title: "Sold Out Trail Runner",
      brand: "Allbirds",
      price: "115.00",
      currency: "USD",
      availability: "OutOfStock",
      sku: "TR-OOS-01",
      gtin: "",
      microdataPresent: true,
      description: "Sold out seasonal variant.",
      images: ["https://cdn.allbirds.com/shoe.jpg"],
      url: "https://www.allbirds.com/products/oos-shoe",
      detectedIssues: [],
    };

    const audit = await runGemmaAudit(outOfStockProduct);
    const schema = audit.generatedJsonLd;

    assert.equal(schema.offers.availability, "https://schema.org/OutOfStock", "OutOfStock source availability must map to https://schema.org/OutOfStock");
    assert.equal(schema.offers.price, "115.00");
    assert.equal(schema.offers.priceCurrency, "USD");
    assert.equal(schema.offers.url, "https://www.allbirds.com/products/oos-shoe");
  } finally {
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
  }
});

test("Schema.org Specification Conformance: Generated JSON-LD conforms to Google Merchant Schema.org standards", async () => {
  const origGemini = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const product = {
      title: "Standard Running Shoe",
      brand: "EcoBrand",
      price: "85.00",
      currency: "USD",
      availability: "InStock",
      sku: "ECO-RUN-85",
      gtin: "0194644111111",
      microdataPresent: true,
      description: "High performance eco sneaker.",
      images: ["https://cdn.ecobrand.com/shoe-1.jpg"],
      url: "https://ecobrand.com/products/running-shoe",
      detectedIssues: [],
    };

    const audit = await runGemmaAudit(product);
    const jsonLd = audit.generatedJsonLd;

    // Google Merchant / Schema.org Product Requirements
    assert.equal(jsonLd["@context"], "https://schema.org/");
    assert.equal(jsonLd["@type"], "Product");
    assert.ok(jsonLd.name && typeof jsonLd.name === "string", "Product must have name");
    assert.ok(jsonLd.brand && (jsonLd.brand.name || typeof jsonLd.brand === "string"), "Product must have brand");
    assert.ok(jsonLd.offers && jsonLd.offers["@type"] === "Offer", "Product must have Offer node");
    assert.ok(jsonLd.offers.price, "Offer must have price");
    assert.ok(jsonLd.offers.priceCurrency, "Offer must have priceCurrency");
    assert.ok(jsonLd.offers.availability.startsWith("https://schema.org/"), "Availability must use Schema.org URI");
    assert.ok(jsonLd.offers.itemCondition === "https://schema.org/NewCondition", "Condition must use Schema.org URI");
    assert.equal(jsonLd.gtin13, "0194644111111", "GTIN13 must match source if provided");
  } finally {
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
  }
});
