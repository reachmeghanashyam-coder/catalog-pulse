import test from "node:test";
import assert from "node:assert/strict";
import { runGemmaAudit } from "../src/lib/gemma.ts";

test("Gemma Inference: Successfully routes to Google Gemma 4 and identifies model in telemetry", async () => {
  const origGemini = process.env.GEMINI_API_KEY;
  const origFetch = globalThis.fetch;

  process.env.GEMINI_API_KEY = "mock_gemini_key";
  delete process.env.GROQ_API_KEY;

  let gemmaEndpointHit = false;
  let modelRequested = "";

  globalThis.fetch = async (url, options) => {
    const urlStr = url.toString();
    if (urlStr.includes("generativelanguage.googleapis.com")) {
      gemmaEndpointHit = true;
      if (urlStr.includes("gemma-4-26b-a4b-it")) {
        modelRequested = "gemma-4-26b-a4b-it";
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      score: 92,
                      grade: "A",
                      summary: "Excellent schema fidelity with minor taxonomy opportunities.",
                      criticalFlaws: ["Missing color variant microdata."],
                      recommendations: ["Expose color and size in hasVariant."],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      };
    }
    throw new Error(`Unexpected endpoint: ${urlStr}`);
  };

  try {
    const productData = {
      title: "Men's Tree Runner",
      brand: "Allbirds",
      price: "98.00",
      currency: "USD",
      availability: "InStock",
      sku: "TR3MMWW080",
      gtin: "0194644000000",
      microdataPresent: true,
      images: ["https://cdn.allbirds.com/tree-runners-main.jpg"],
      url: "https://www.allbirds.com/products/mens-tree-runners",
      detectedIssues: [],
    };

    const audit = await runGemmaAudit(productData);

    assert.ok(gemmaEndpointHit, "Expected Google Generative Language API to be hit");
    assert.equal(modelRequested, "gemma-4-26b-a4b-it");
    assert.equal(audit.modelUsed, "Google Gemma 4 (gemma-4-26b-a4b-it)");
    assert.equal(audit.score, 92);
    assert.equal(audit.grade, "A");
    assert.ok(audit.summary.includes("Excellent schema fidelity"));
    assert.equal(audit.generatedJsonLd.name, "Men's Tree Runner");
    assert.equal(audit.generatedJsonLd.brand.name, "Allbirds");
  } finally {
    globalThis.fetch = origFetch;
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    else delete process.env.GEMINI_API_KEY;
  }
});

test("Gemma Inference: Transparently falls back to Groq when Google Gemma endpoint errors", async () => {
  const origGemini = process.env.GEMINI_API_KEY;
  const origGroq = process.env.GROQ_API_KEY;
  const origFetch = globalThis.fetch;

  process.env.GEMINI_API_KEY = "mock_gemini_key";
  process.env.GROQ_API_KEY = "mock_groq_key";

  let gemmaAttempted = false;
  let groqHit = false;

  globalThis.fetch = async (url) => {
    const urlStr = url.toString();
    if (urlStr.includes("generativelanguage.googleapis.com")) {
      gemmaAttempted = true;
      return {
        ok: false,
        status: 503,
        json: async () => ({ error: "Service Temporarily Unavailable" }),
      };
    }
    if (urlStr.includes("api.groq.com")) {
      groqHit = true;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 75,
                  grade: "B",
                  summary: "Valid microdata with baseline agent readability.",
                  criticalFlaws: ["Missing GTIN barcode."],
                  recommendations: ["Declare GTIN13."],
                }),
              },
            },
          ],
        }),
      };
    }
    throw new Error(`Unexpected endpoint: ${urlStr}`);
  };

  try {
    const productData = {
      title: "Crest Hoodie",
      brand: "Gymshark",
      price: "45.00",
      currency: "USD",
      availability: "InStock",
      sku: "GS-CREST-BLK",
      gtin: "",
      microdataPresent: true,
      images: ["https://cdn.gymshark.com/hoodie.jpg"],
      url: "https://www.gymshark.com/products/crest-hoodie",
      detectedIssues: ["No GTIN/UPC barcode declared."],
    };

    const audit = await runGemmaAudit(productData);

    assert.ok(gemmaAttempted, "Google Gemma should have been attempted first");
    assert.ok(groqHit, "Groq should have been invoked after Gemma failed");
    assert.ok(audit.modelUsed.startsWith("Groq Open-Weights"), "Telemetry must disclose Groq when Groq handled the request");
    assert.equal(audit.score, 75);
    assert.equal(audit.grade, "B");
  } finally {
    globalThis.fetch = origFetch;
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    else delete process.env.GEMINI_API_KEY;
    if (origGroq) process.env.GROQ_API_KEY = origGroq;
    else delete process.env.GROQ_API_KEY;
  }
});

test("Gemma Inference: Supports Local Ollama Gemma (gemma4:e4b) for zero-cost offline execution", async () => {
  const origOllamaUrl = process.env.OLLAMA_BASE_URL;
  const origFetch = globalThis.fetch;

  process.env.OLLAMA_BASE_URL = "http://localhost:11434";

  let ollamaHit = false;
  globalThis.fetch = async (url, options) => {
    const urlStr = url.toString();
    if (urlStr.includes("localhost:11434/api/generate")) {
      ollamaHit = true;
      const body = JSON.parse(options.body);
      assert.equal(body.model, "gemma4:e4b");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          response: JSON.stringify({
            score: 88,
            grade: "B",
            summary: "Local Gemma 4 verified product microdata offline.",
            criticalFlaws: ["No GTIN barcode."],
            recommendations: ["Add GTIN13."],
          }),
        }),
      };
    }
    throw new Error(`Unexpected endpoint: ${urlStr}`);
  };

  try {
    const productData = {
      title: "Local Artisan Mug",
      brand: "ClayWorks",
      price: "32.00",
      currency: "USD",
      availability: "InStock",
      sku: "MUG-01",
      gtin: "",
      microdataPresent: true,
      images: ["https://clayworks.com/mug.jpg"],
      url: "https://clayworks.com/products/mug",
      detectedIssues: [],
    };

    const audit = await runGemmaAudit(productData);
    assert.ok(ollamaHit, "Local Ollama endpoint should be invoked when OLLAMA_BASE_URL is configured");
    assert.equal(audit.modelUsed, "Local Ollama Gemma (gemma4:e4b)");
    assert.equal(audit.score, 88);
    assert.equal(audit.generatedJsonLd.name, "Local Artisan Mug");
  } finally {
    globalThis.fetch = origFetch;
    if (origOllamaUrl) process.env.OLLAMA_BASE_URL = origOllamaUrl;
    else delete process.env.OLLAMA_BASE_URL;
  }
});

