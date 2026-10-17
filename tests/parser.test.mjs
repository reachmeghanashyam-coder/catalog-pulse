import test from "node:test";
import assert from "node:assert/strict";
import { parseProductHtml } from "../src/lib/parser.ts";

test("Parser: extracts full Schema.org JSON-LD product data accurately", () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Men's Tree Runner - Allbirds</title>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Men's Tree Runner",
            "brand": { "@type": "Brand", "name": "Allbirds" },
            "description": "Breathable eucalyptus tree fiber sneaker.",
            "sku": "TR3MMWW080",
            "gtin13": "0194644000000",
            "image": ["https://cdn.allbirds.com/tree-runners-main.jpg"],
            "offers": {
              "@type": "Offer",
              "price": "98.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          }
        </script>
      </head>
      <body></body>
    </html>
  `;

  const parsed = parseProductHtml(html, "https://www.allbirds.com/products/mens-tree-runners");

  assert.equal(parsed.title, "Men's Tree Runner");
  assert.equal(parsed.brand, "Allbirds");
  assert.equal(parsed.sku, "TR3MMWW080");
  assert.equal(parsed.gtin, "0194644000000");
  assert.equal(parsed.price, "98.00");
  assert.equal(parsed.currency, "USD");
  assert.equal(parsed.availability, "InStock");
  assert.equal(parsed.microdataPresent, true);
  assert.equal(parsed.images[0], "https://cdn.allbirds.com/tree-runners-main.jpg");
  assert.equal(parsed.url, "https://www.allbirds.com/products/mens-tree-runners");
});

test("Parser: missing GTIN is preserved as empty (missing identifiers stay missing)", () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Crest Hoodie",
            "brand": "Gymshark",
            "sku": "GS-CREST-01",
            "offers": { "price": "45.00", "priceCurrency": "USD" }
          }
        </script>
      </head>
      <body></body>
    </html>
  `;

  const parsed = parseProductHtml(html, "https://www.gymshark.com/products/crest-hoodie");

  assert.equal(parsed.gtin, "");
  assert.ok(parsed.detectedIssues.some(issue => issue.includes("GTIN/UPC barcode")));
});

test("Parser: handles malformed JSON-LD gracefully without throwing", () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Fallback Product Title" />
        <meta property="og:site_name" content="Fallback Brand" />
        <script type="application/ld+json">
          { invalid json ld syntax here ...
        </script>
      </head>
      <body></body>
    </html>
  `;

  const parsed = parseProductHtml(html, "https://example.com/item");

  assert.equal(parsed.title, "Fallback Product Title");
  assert.equal(parsed.brand, "Fallback Brand");
  assert.ok(parsed.detectedIssues.some(issue => issue.includes("Malformed JSON-LD")));
});

test("Parser: falls back to OpenGraph meta tags when no JSON-LD is present", () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Super Clean Sneaker" />
        <meta property="og:site_name" content="SneakerCo" />
        <meta property="og:description" content="Comfortable casual shoes" />
        <meta property="og:image" content="https://sneakerco.com/shoe.png" />
        <meta property="product:price:amount" content="120.00" />
      </head>
      <body></body>
    </html>
  `;

  const parsed = parseProductHtml(html, "https://sneakerco.com/shoe");

  assert.equal(parsed.title, "Super Clean Sneaker");
  assert.equal(parsed.brand, "SneakerCo");
  assert.equal(parsed.price, "120.00");
  assert.equal(parsed.microdataPresent, false);
  assert.equal(parsed.images[0], "https://sneakerco.com/shoe.png");
  assert.ok(parsed.detectedIssues.some(issue => issue.includes("Missing root Schema.org/Product")));
});
