export interface GemmaAuditResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  criticalFlaws: string[];
  recommendations: string[];
  generatedJsonLd: object;
  modelUsed?: string;
}

export async function runGemmaAudit(
  productData: any,
  serpContext?: any
): Promise<GemmaAuditResult> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;

  const systemPrompt = `You are CatalogPulse, an expert AI-Commerce & Agentic Shopping Linter specializing in Schema.org, Google Merchant standards, and AI-agent discoverability (ChatGPT Search, Perplexity, Google Shopping).
Analyze the provided product telemetry. Calculate an AI Agent Discoverability Score (0-100), identify catalog drift/omissions, and generate a 100% compliant, validated Schema.org Product JSON-LD snippet.
Respond ONLY with a valid JSON object matching this schema:
{
  "score": number,
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": "1-2 sentence executive assessment",
  "criticalFlaws": ["string"],
  "recommendations": ["string"],
  "generatedJsonLd": { ... }
}`;

  const userPrompt = `Product Telemetry to Audit:
Title: ${productData.title}
Brand: ${productData.brand}
Price: ${productData.price} ${productData.currency}
Availability: ${productData.availability}
SKU: ${productData.sku}
GTIN: ${productData.gtin || "MISSING"}
Existing Microdata Present: ${productData.microdataPresent}
Detected Issues: ${JSON.stringify(productData.detectedIssues)}
SerpApi Google Shopping Signals: ${JSON.stringify(serpContext || {})}

Perform deep forensic analysis and return the JSON response.`;

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const groundJsonLd = (rawSchema: any) => {
    const base = typeof rawSchema === "object" && rawSchema !== null ? rawSchema : {};
    const offers = typeof base.offers === "object" && !Array.isArray(base.offers) && base.offers !== null ? base.offers : {};
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.title || base.name || "Product",
      "description": productData.description && productData.description !== "No description detected."
        ? productData.description
        : (base.description || `${productData.title} by ${productData.brand}`),
      ...(productData.images?.length ? { "image": productData.images } : base.image && !String(base.image).includes("example.com") ? { "image": base.image } : {}),
      "brand": {
        "@type": "Brand",
        "name": productData.brand || base.brand?.name || "Brand",
      },
      "sku": productData.sku && productData.sku !== "SKU-UNKNOWN" ? productData.sku : (base.sku || "SKU-PRIMARY"),
      ...(productData.gtin ? { "gtin13": productData.gtin } : {}),
      "offers": {
        "@type": "Offer",
        ...(productData.url ? { "url": productData.url } : {}),
        "priceCurrency": productData.currency || offers.priceCurrency || "USD",
        "price": productData.price && productData.price !== "0.00" ? productData.price : (offers.price || "0.00"),
        "itemCondition": "https://schema.org/NewCondition",
        "availability": productData.availability === "InStock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    };
  };

  // 1. Primary: Google Official Hosted Gemma (gemma-4-26b-a4b-it / gemma-4-31b-it) via Native REST API
  if (geminiApiKey) {
    const marketSummary = serpContext?.marketItems?.length
      ? serpContext.marketItems
          .slice(0, 4)
          .map((i: any) => `${String(i.price || "").replace(/\$/g, "")} USD (${i.source})`)
          .join(", ")
      : "No external listings";

    const gemmaPrompt = `You are CatalogPulse, an expert AI-Commerce & Agentic Shopping Linter. Audit this product and return ONLY a JSON object with keys: score (0-100), grade (A-F), summary (1 sentence), criticalFlaws (array of 2-3 strings), recommendations (array of 2-3 strings). Product: ${productData.title} by ${productData.brand}, Price: ${productData.price} ${productData.currency}, SKU: ${productData.sku}, GTIN: ${productData.gtin || "MISSING"}, Microdata: ${productData.microdataPresent}, Issues: ${(productData.detectedIssues || []).join(" ") || "None"}. SerpApi Market: ${serpContext?.totalResultsFound || 0} listings found (${marketSummary}).`;

    const gemmaModels = ["gemma-4-26b-a4b-it", "gemma-4-31b-it"];
    for (const gemmaModel of gemmaModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${gemmaModel}:generateContent?key=${geminiApiKey}`,
          {
            signal: controller.signal,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: gemmaPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.1,
              },
            }),
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const answerParts = parts.filter((p: any) => !p.thought && typeof p.text === "string");
          const content = (answerParts.length ? answerParts : parts)
            .map((p: any) => p.text || "")
            .join("\n");

          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (typeof parsed.score === "number") {
                parsed.generatedJsonLd = groundJsonLd(parsed.generatedJsonLd);
                parsed.modelUsed = `Google Gemma 4 (${gemmaModel})`;
                return parsed;
              }
            }
          }
        }
      } catch (e) {
        console.error(`Google AI Studio ${gemmaModel} inference error:`, e);
      }
    }
  }

  // 2. Secondary: Groq Open-Weights Inference (Fast fallback)
  if (groqApiKey) {
    const modelsToTry = [
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
    ];

    for (const modelId of modelsToTry) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (typeof parsed.score === "number") {
              parsed.generatedJsonLd = groundJsonLd(parsed.generatedJsonLd);
              parsed.modelUsed = `Groq Open-Weights (${modelId})`;
              return parsed;
            }
          }
        }
      } catch (e) {
        console.error(`Groq ${modelId} inference error:`, e);
      }
    }
  }

  // 3. Try Hugging Face Inference API for Google Gemma / open weights
  if (hfApiKey) {
    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/google/gemma-2-9b-it",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `<start_of_turn>user\n${systemPrompt}\n\n${userPrompt}<end_of_turn>\n<start_of_turn>model\n`,
            parameters: { max_new_tokens: 1500, temperature: 0.2 },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
        const jsonMatch = raw?.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Hugging Face Gemma inference error:", e);
    }
  }

  // 3. Robust Grounded Fallback if model API unavailable
  const flaws = [...productData.detectedIssues];
  let calculatedScore = 85;
  if (!productData.microdataPresent) calculatedScore -= 35;
  if (!productData.gtin) calculatedScore -= 20;
  if (!productData.price || productData.price === "0.00") calculatedScore -= 20;

  const grade = calculatedScore >= 90 ? "A" : calculatedScore >= 75 ? "B" : calculatedScore >= 60 ? "C" : "D";

  return {
    score: Math.max(calculatedScore, 20),
    grade,
    summary: productData.microdataPresent 
      ? `Product ${productData.title} by ${productData.brand} exposes basic metadata, but missing standardized GTIN identifiers limits cross-catalog verification for AI shopping agents.`
      : `Critical visibility deficit: Missing root Schema.org/Product JSON-LD causes AI agents to drop secondary sizes and variant pricing.`,
    criticalFlaws: flaws.length ? flaws : ["Missing structured variant specifications in OpenGraph headers."],
    recommendations: [
      "Inject verified JSON-LD into your store template to expose full variant arrays.",
      "If your product has an official barcode (UPC/EAN/GTIN), declare it to improve cross-catalog matching.",
      "Ensure currency code and availability reflect real-time inventory state.",
    ],
    modelUsed: "Deterministic Schema Engine",
    generatedJsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productData.title,
      "image": productData.images?.length ? productData.images : ["https://yourstore.com/product-image.jpg"],
      "description": productData.description,
      "brand": {
        "@type": "Brand",
        "name": productData.brand,
      },
      "sku": productData.sku || "PROD-SKU",
      ...(productData.gtin ? { "gtin13": productData.gtin } : {}),
      "offers": {
        "@type": "Offer",
        "url": productData.url || "https://yourstore.com/products/item",
        "priceCurrency": productData.currency,
        "price": productData.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": productData.availability === "InStock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    },
  };
}
