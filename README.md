# CatalogPulse ⚡

> Open-Source AI-Commerce & Agentic Schema Linter powered by **Google Gemma 4** and **SerpApi**.  
> Built for the **DEV Hacktoberfest 2026: Side Hustle Challenge** (`#devchallenge`, `#hf26challenge`).

---

## 🎯 The Problem

When consumers ask **ChatGPT Search, Perplexity, or Gemini** to recommend and buy products (e.g., *"Find me waterproof trail running shoes under $150"*), AI shopping agents crawl product pages to read structured metadata.

However, over **74% of independent e-commerce stores and small merchants suffer from silent catalog dropouts**:
1. Client-side JavaScript variant selectors hide secondary size/color SKUs from AI bots.
2. Missing **GTIN/barcode identifiers** cause AI search engines to demote or flag products as "unverified".
3. Malformed or missing Schema.org `Product` and `Offer` nodes make direct 1-click agentic purchases impossible.

*(Methodology: Based on an exploratory benchmark audit of 50 independent Shopify & WooCommerce product pages, where 37 of 50 (74%) suffered from silent variant omissions, missing GTIN/UPC barcodes, or absent root Schema.org/Product JSON-LD when crawled via raw HTTP without executing client-side JavaScript bundles).*

Large enterprises pay thousands of dollars for enterprise SEO/observability tools. **Small merchants and indie side hustlers cannot afford this.**

---

## 💡 The Solution: CatalogPulse

**CatalogPulse** is a lightweight, zero-install open-source tool that:
1. Takes any product URL (Shopify, WooCommerce, custom D2C) and transparently labels extraction provenance (`Live Storefront HTML` vs `Verified Sample Snapshot`).
2. Extracts live DOM metadata and existing Schema microdata.
3. Queries **SerpApi Google Shopping** to cross-reference live market pricing, calculate deterministic **Market Floor / Median / Ceiling spreads**, detect secondary reseller undercuts (`-44% on Poshmark`), and expose direct merchant verification links.
4. Uses **Google Gemma 4** (`gemma-4-26b-a4b-it` / `gemma-4-31b-it` hosted on Google AI Studio, or **Local Self-Hosted Ollama `gemma4:e4b`** for zero-cost agency runs) to perform a deep forensic audit, score the product's AI Agent Discoverability (0–100), and generate a standards-compliant, fact-grounded **Schema.org Product JSON-LD** snippet + **1-Click Client Audit Report (`.md`)**.

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
│  [Google Gemma 4]           [SerpApi Google Shopping]      │
│  • Cloud AI Studio or       • Live market pricing check    │
│    Local Ollama (gemma4)    • Deterministic price spread   │
│  • Computes health score    • Reseller undercut detection  │
│  • Fact-grounded JSON-LD    • Direct merchant source links │
│        └────────┬────────────────────┘                      │
│                 ▼                                           │
│   [Interactive Audit Dashboard & 1-Click Client Report]     │
│                 │                                           │
│                 ▼                                           │
│   [Automated Test Suite: 20 unit + live integration tests]  │
└─────────────────────────────────────────────────────────────┘
```

* **Frontend & Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons.
* **AI Engine:** Google Gemma 4 (`gemma-4-26b-a4b-it` / `gemma-4-31b-it` via Google AI Studio), **Local Self-Hosted Ollama** (`gemma4:e4b`), with open-weights fallback via Groq / Hugging Face.
* **Market Telemetry:** SerpApi Google Shopping API + deterministic price spread & undercut calculator.
* **Extraction:** Cheerio server-side HTML parser with explicit extraction provenance tracking.

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
GEMINI_API_KEY="your_google_ai_studio_key"
OLLAMA_BASE_URL="http://localhost:11434" # Optional: run 100% locally via Ollama
OLLAMA_MODEL="gemma4:e4b"                # Optional: local Gemma 4 model tag
GROQ_API_KEY="your_groq_api_key_optional"
HUGGINGFACE_API_KEY="your_hf_token_optional"
```

### 4. Run tests
```bash
npm test          # Runs 20 automated unit & security tests
npm run test:live # Runs live production integration test against Vercel
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ License

MIT License. Open-source and free for developers and merchants worldwide.

