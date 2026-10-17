import test from "node:test";
import assert from "node:assert/strict";
import { runGemmaAudit } from "../src/lib/gemma.ts";

test("Scoring: Deterministic fallback calculates correct score penalties and letter grade", async () => {
  // Clear API keys to force deterministic fallback
  const origGemini = process.env.GEMINI_API_KEY;
  const origGoogle = process.env.GOOGLE_API_KEY;
  const origGroq = process.env.GROQ_API_KEY;
  const origHf = process.env.HUGGINGFACE_API_KEY;

  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.HUGGINGFACE_API_KEY;

  try {
    // 1. Missing microdata (-35), missing GTIN (-20) => Base 85 - 35 - 20 = 30 (Grade D)
    const product1 = {
      title: "Test Sneaker",
      brand: "TestBrand",
      price: "100.00",
      currency: "USD",
      availability: "InStock",
      sku: "SKU-1",
      gtin: "",
      microdataPresent: false,
      detectedIssues: ["Missing root Schema.org/Product JSON-LD.", "No GTIN/UPC barcode declared."],
      images: ["https://test.com/img.jpg"],
      url: "https://test.com/sneaker",
    };

    const audit1 = await runGemmaAudit(product1);
    assert.equal(audit1.score, 30);
    assert.equal(audit1.grade, "D");
    assert.equal(audit1.modelUsed, "Deterministic Schema Engine");

    // 2. Full microdata, valid GTIN, valid price => 85 (Grade B)
    const product2 = {
      title: "Full Product",
      brand: "TopBrand",
      price: "150.00",
      currency: "USD",
      availability: "InStock",
      sku: "SKU-2",
      gtin: "1234567890123",
      microdataPresent: true,
      detectedIssues: [],
      images: ["https://test.com/img2.jpg"],
      url: "https://test.com/product",
    };

    const audit2 = await runGemmaAudit(product2);
    assert.equal(audit2.score, 85);
    assert.equal(audit2.grade, "B");

    // 3. Worst-case scenario hits the Math.max(score, 20) floor
    const productWorst = {
      title: "Broken Product",
      brand: "BadBrand",
      price: "0.00",
      currency: "USD",
      availability: "InStock",
      sku: "",
      gtin: "",
      microdataPresent: false,
      detectedIssues: ["No price", "No microdata", "No GTIN"],
      images: [],
    };

    const auditWorst = await runGemmaAudit(productWorst);
    assert.equal(auditWorst.score, 20); // 85 - 35 - 20 - 20 = 10, floored to 20
    assert.equal(auditWorst.grade, "D");
  } finally {
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    if (origGoogle) process.env.GOOGLE_API_KEY = origGoogle;
    if (origGroq) process.env.GROQ_API_KEY = origGroq;
    if (origHf) process.env.HUGGINGFACE_API_KEY = origHf;
  }
});
