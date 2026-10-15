import * as cheerio from "cheerio";

export interface ExtractedProductData {
  title: string;
  description: string;
  brand: string;
  price: string;
  currency: string;
  availability: string;
  sku: string;
  gtin: string;
  images: string[];
  rawJsonLd: any[];
  microdataPresent: boolean;
  detectedIssues: string[];
}

export function parseProductHtml(html: string, pageUrl: string): ExtractedProductData {
  const $ = cheerio.load(html);
  const detectedIssues: string[] = [];

  // 1. Check for existing Schema.org JSON-LD
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const rawJsonLd: any[] = [];

  jsonLdScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          rawJsonLd.push(...parsed);
        } else {
          rawJsonLd.push(parsed);
        }
      }
    } catch {
      detectedIssues.push("Malformed JSON-LD script found in raw HTML.");
    }
  });

  // Extract from JSON-LD if available
  let title = "";
  let description = "";
  let brand = "";
  let price = "";
  let currency = "USD";
  let availability = "InStock";
  let sku = "";
  let gtin = "";
  const images: string[] = [];

  const productNode = rawJsonLd.find(
    (node) => node["@type"] === "Product" || node["@type"]?.includes("Product")
  );

  if (productNode) {
    title = productNode.name || "";
    description = productNode.description || "";
    brand = typeof productNode.brand === "object" ? productNode.brand?.name : productNode.brand || "";
    sku = productNode.sku || "";
    gtin = productNode.gtin13 || productNode.gtin || productNode.gtin8 || productNode.gtin12 || productNode.barcode || "";

    if (productNode.image) {
      if (Array.isArray(productNode.image)) images.push(...productNode.image);
      else images.push(productNode.image);
    }

    if (productNode.offers) {
      const offer = Array.isArray(productNode.offers) ? productNode.offers[0] : productNode.offers;
      price = offer?.price || "";
      currency = offer?.priceCurrency || "USD";
      availability = offer?.availability?.includes("InStock") ? "InStock" : offer?.availability || "InStock";
    }
  }

  // Fallbacks: OpenGraph / Meta tags
  if (!title) {
    title = $('meta[property="og:title"]').attr("content") || $("title").text().trim() || "";
  }
  if (!description) {
    description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "";
  }
  if (!brand) {
    brand = $('meta[property="og:site_name"]').attr("content") || "";
  }
  if (!price) {
    price = $('meta[property="product:price:amount"]').attr("content") || 
            $('meta[property="og:price:amount"]').attr("content") || 
            $('[data-product-price]').text().trim() || "";
  }
  if (!images.length) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) images.push(ogImage);
  }

  // Heuristic Diagnostics
  if (!rawJsonLd.length) {
    detectedIssues.push("Missing root Schema.org/Product JSON-LD. AI crawlers cannot parse structured pricing or variants reliably.");
  }
  if (!gtin) {
    detectedIssues.push("No GTIN/UPC barcode declared. Harder for AI agents to uniquely verify and match this item.");
  }
  if (!sku) {
    detectedIssues.push("No explicit SKU found in structured headers.");
  }

  return {
    title: title || "Unidentified Product",
    description: description || "No description detected.",
    brand: brand || "Generic Brand",
    price: price || "0.00",
    currency: currency || "USD",
    availability,
    sku: sku || "SKU-UNKNOWN",
    gtin,
    images: images.filter(Boolean),
    rawJsonLd,
    microdataPresent: rawJsonLd.length > 0,
    detectedIssues,
  };
}
