# CatalogPulse ⚡

> Open-Source AI-Commerce & Agentic Schema Linter powered by **Google Gemma 2** and **SerpApi**.  
> Built for the **DEV Hacktoberfest 2026: Side Hustle Challenge** (`#devchallenge`, `#hf26challenge`).

---

## 🎯 The Problem

When consumers ask **ChatGPT Search, Perplexity, or Gemini** to recommend and buy products (e.g., *"Find me waterproof trail running shoes under $150"*), AI shopping agents crawl product pages to read structured metadata.

However, over **74% of independent e-commerce stores and small merchants suffer from silent catalog dropouts**:
1. Client-side JavaScript variant selectors hide secondary size/color SKUs from AI bots.
2. Missing **GTIN/barcode identifiers** cause AI search engines to demote or flag products as "unverified".
3. Malformed or missing Schema.org `Product` and `Offer` nodes make direct 1-click agentic purchases impossible.

Large enterprises pay thousands of dollars for enterprise SEO/observability tools. **Small merchants and indie side hustlers cannot afford this.**

---

## 💡 The Solution: CatalogPulse

**CatalogPulse** is a lightweight, zero-install open-source tool that:
1. Takes any product URL (Shopify, WooCommerce, custom D2C).
2. Extracts live DOM metadata and existing Schema microdata.
3. Queries **SerpApi Google Shopping** to cross-reference market pricing and detect competitor displacement.
4. Uses **Google Gemma 2 (open-weights)** to run a deep forensic audit, score the product's AI Agent Discoverability (0–100), and generate a 100% compliant, copy-pasteable **Schema.org Product JSON-LD** snippet.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       ARCHITECTURE                          │
│                                                             │
│   [User enters Product URL]                                 │
│                 │                                           │
│                 ▼                                           │
│   [Cheerio HTML & Microdata Parser]                         │
│   Extracts OpenGraph, existing JSON-LD, GTINs, and prices   │
│                 │                                           │
│        ┌────────┴────────────────────┐                      │
│        ▼                             ▼                      │
│  [Google Gemma 2-9B]        [SerpApi Google Shopping]      │
│  • Computes health score    • Live market pricing check    │
│  • Flags variant dropouts   • Competitor displacement check│
│  • Generates clean JSON-LD                                  │
│        └────────┬────────────────────┘                      │
│                 ▼                                           │
│   [Interactive Audit Dashboard & 1-Click Code Exporter]     │
└─────────────────────────────────────────────────────────────┘
```

* **Frontend & Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons.
* **AI Engine:** Google Gemma 2 (`google/gemma-2-9b-it`) via Groq / Hugging Face Inference API.
* **Market Telemetry:** SerpApi Google Shopping API.
* **Extraction:** Cheerio server-side HTML parser.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/reachmeghanashyam-coder/catalog-pulse.git
cd catalog-pulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file:
```env
SERPAPI_API_KEY="your_serpapi_key"
GROQ_API_KEY="your_groq_api_key"
HF_TOKEN="your_hf_token_optional"
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ License

MIT License. Open-source and free for developers and merchants worldwide.
