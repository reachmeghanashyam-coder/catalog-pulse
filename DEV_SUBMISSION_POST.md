---
title: "74% of Indie Stores Are Invisible to ChatGPT Shopping. I Built an Open-Source Linter to Fix It (Google Gemma + SerpApi)"
published: true
tags: devchallenge, hf26challenge, opensource, ai
canonical_url: false
cover_image: 
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

---

## What I Built

Here is a quiet shift happening in e-commerce right now: buyers are stopping at ten blue links and asking **ChatGPT Search, Perplexity, and Gemini** directly:
> *"Find me breathable eucalyptus running shoes in US 10.5 under $120 in stock right now."*

When an AI shopping agent crawls a big brand like Nike or Amazon, it reads pristine, server-rendered **Schema.org JSON-LD** microdata.

When that same AI agent crawls an independent Shopify store or D2C side hustle, it frequently hits a brick wall:
1. **Silent Variant Dropouts:** Client-side JavaScript size/color pickers hide secondary SKUs from non-browser crawlers. The store has Size 10.5 in stock, but the root HTML only exposes Size 8.
2. **Missing Global Identifiers:** Missing **GTIN/UPC barcodes** prevent AI agents from cross-verifying product authenticity across merchant registries.
3. **Price & Catalog Drift:** Secondary reseller sites (Poshmark, eBay, Depop) outrank the official merchant on Google Shopping with outdated or undercut pricing.

*(Methodology: Based on an exploratory benchmark audit of 50 independent Shopify & WooCommerce product pages, where 37 of 50 (74%) suffered from silent variant omissions, missing GTIN/UPC barcodes, or absent root Schema.org/Product JSON-LD when crawled via raw HTTP without executing client-side JavaScript bundles).*

Enterprise brands pay **$2,000+/month** for catalog observability platforms to catch these issues. **Indie merchants and solo founders can't afford that.**

So I built **CatalogPulse** — a fast, zero-install, open-source AI Commerce Linter that lets any merchant, freelancer, or agency audit a product URL in 10 seconds, cross-reference live market listings via **SerpApi Google Shopping**, and generate a validated, copy-pasteable **Schema.org Product JSON-LD** fix powered by **Google Gemma**.

---

## Demo

🚀 **Try the Live App (No login required):** **[https://catalog-pulse.vercel.app](https://catalog-pulse.vercel.app)**

*(Click either the **Shopify Store (Allbirds)** or **Gymshark Activewear** sample pills right below the search bar for an instant 10-second live telemetry scan!)*

### What happens when you run an audit:

1. **Deterministic DOM & Microdata Extraction:**  
   CatalogPulse fetches the raw store HTML (just like an LLM crawler does without executing heavy client-side JS bundles) and inspects existing `<script type="application/ld+json">` and OpenGraph tags.
2. **Live Market Telemetry via SerpApi:**  
   Before scoring the product, CatalogPulse queries the **SerpApi Google Shopping Engine** in real time to see how the product actually appears across the open web—surfacing active reseller prices, variant naming drift, and competitor listings.
3. **Forensic Audit & 1-Click Schema Fix:**  
   Our open-weight AI pipeline evaluates the extracted DOM data against the live SerpApi market signals, calculates an **AI Agent Discoverability Score (0–100)**, lists concrete discoverability flaws, and synthesizes a clean, standards-compliant `Schema.org/Product` JSON-LD snippet ready to paste into Shopify's `theme.liquid`.

---

## Code

The full codebase is open-source under the MIT License:

{% github reachmeghanashyam-coder/catalog-pulse %}

### Architecture at a Glance

```
[Merchant Product URL]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 1. Deterministic DOM Parser (src/lib/parser.ts)        │
│    • Cheerio server-side HTML extraction               │
│    • Parses JSON-LD Product/Offer nodes & OpenGraph    │
│    • Flags missing GTINs, SKUs, and variant omissions  │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────────────────┐   ┌─────────────────────────────────┐
│ 2. SerpApi Google Shopping   │   │ 3. Open-Weight AI Auditor       │
│    (src/lib/serpapi.ts)      │   │    (src/lib/gemma.ts)           │
│    • Brand-aware live query  │──▶│    • Cross-checks DOM vs Market │
│    • Extracts top 5 market   │   │    • Computes 0-100 Score       │
│      listings & price spread │   │    • Synthesizes valid JSON-LD  │
└──────────────────────────────┘   └─────────────────────────────────┘
```

---

## How I Built It

CatalogPulse is built as a hybrid **Deterministic + Open-Weight AI** system so that the model never invents facts:

* **Open-Weight AI Core (`src/lib/gemma.ts`):** Powered natively by **Google Gemma 4** (`gemma-4-26b-a4b-it` / `gemma-4-31b-it` via Google AI Studio), **Local Ollama Gemma** (`OLLAMA_BASE_URL` with `gemma4:e4b` for 100% offline/zero-cost execution), and high-speed open-weights fallback via Groq / HuggingFace. Instead of asking an LLM to "guess" what is on a webpage, we feed it strictly structured telemetry from our parser plus live market context from SerpApi, constraining its output to a strict JSON schema (`score`, `grade`, `criticalFlaws`, `recommendations`, and `generatedJsonLd`) enforced by deterministic fact-grounding (`groundJsonLd`).
* **Real-Time Market Grounding (`src/lib/serpapi.ts`):** Uses the **SerpApi Google Shopping API** (`engine=google_shopping`). We automatically construct a brand-prefixed query (`${brand} ${title}`) so the telemetry pulls exact-brand comparisons, reseller prices (e.g. Poshmark, Mercari, Nordstrom), and feeds them directly into Gemma's reasoning prompt.
* **1-Click Freelancer Deliverable Exporter (`src/app/page.tsx`):** Includes an **Export Client Report (`.md`)** action alongside 1-click JSON-LD copy, allowing SEO freelancers and agencies to generate a complete, client-ready technical audit deliverable in seconds.
* **Automated Verification Suite (`tests/`):** Backed by **17 automated unit & live integration tests** (`node --test`) verifying DOM parsing, Schema.org specification conformance, SerpApi resilience, Gemma 4 routing, and zero-hallucination grounding.
* **Frontend Interface (`src/app/page.tsx`):** Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Lucide Icons**—designed with a clean, dark-mode diagnostic aesthetic inspired by Linear and Raycast.

---

## Why Does Open Innovation Matter?

When building a micro-SaaS or freelance auditing tool for small e-commerce sellers, **open-weight models aren't just a philosophical choice—they are the only reason the unit economics work**:

1. **Near-Zero Marginal Cost for High-Volume Catalogs:**  
   An independent merchant doesn't just have 1 product URL; they have 200 to 2,000 SKUs. Running continuous daily schema audits and JSON-LD generation across 2,000 pages using frontier proprietary APIs destroys the margin of a $9/month side hustle. Open-weight models allow us to run structured JSON synthesis at near-zero cost—or completely free on local hardware.
2. **Data Sovereignty for Unreleased Inventory:**  
   Merchants and agencies frequently audit staging storefronts containing embargoed product drops, wholesale margin structures, and internal SKU mappings. Because Gemma weights are open, an agency can run CatalogPulse against a local Ollama or vLLM endpoint so client catalog data never touches a third-party cloud.
3. **Deterministic Guardrails Without API Lock-In:**  
   Proprietary models silently change behavior or deprecate endpoints. Combining a deterministic Cheerio parser + live SerpApi grounding + open-weight JSON synthesis gives small businesses a predictable tool they actually own.

---

## My First User

I tested CatalogPulse with a friend who runs an independent D2C apparel and footwear store on Shopify.

* **What We Found:** When we audited his flagship product page, CatalogPulse scored it a **65 (Grade C)**. Even though his store had 6 sizes in stock, his Shopify theme was only emitting the default variant in the root `Schema.org/Offer` node and had no `gtin13` property declared. Meanwhile, the SerpApi panel showed secondary resellers on Poshmark listing used versions of his item at half price.
* **The Fix:** He copied the generated JSON-LD block from CatalogPulse directly into his theme header. Within two minutes, his page validated cleanly with complete `Brand`, `SKU`, and `Offer` properties—without paying an SEO agency a $500 retainer.
* **What He Asked For Next:** *"Can you make this crawl my entire `/sitemap.xml` every Sunday night and email me if a theme update breaks my schema?"* (That is next on the roadmap!)

---

## Prize Categories

I am submitting **CatalogPulse** for consideration in the following categories:

* **Featured Category — Best Use of Gemma:** Uses Google's open-weight Gemma architecture as a grounded semantic commerce auditor and Schema.org JSON-LD code generator.
* **Partner Category — Best Use of SerpApi:** Integrates the **SerpApi Google Shopping Engine** in real time to ground every product audit against live market pricing, reseller listings, and catalog drift.

---

### 💬 Let's Chat!
If you run a Shopify store, build e-commerce sites for clients, or have a side project with products—drop a link or test it on **[catalog-pulse.vercel.app](https://catalog-pulse.vercel.app)**! What score did your product page get? 👇
