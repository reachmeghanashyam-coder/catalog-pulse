---
title: "CatalogPulse: The Open-Source AI Commerce Linter Powered by Gemma 2 & SerpApi"
published: true
tags: devchallenge, hf26challenge, opensource, ai
canonical_url: false
cover_image: 
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

---

## What I Built

When buyers ask **ChatGPT Search, Perplexity, or Gemini** for product recommendations (e.g., *"Best waterproof trail running shoes under $150"*), autonomous AI shopping agents crawl product pages to read structured, machine-readable metadata.

Over **74% of independent small merchants and Shopify side hustlers suffer from silent catalog dropouts**:
1. Client-side JavaScript variant pickers hide secondary sizes/colors from AI crawlers.
2. Missing **GTIN barcodes** cause AI search engines to flag products as unverified or out-of-stock.
3. Malformed Schema.org `Product` and `Offer` nodes make direct agentic purchasing impossible.

Large enterprises pay thousands of dollars per month for commercial observability platforms. **Small merchants and indie side hustlers cannot afford this.**

**CatalogPulse** is a lightweight, zero-install open-source tool that lets any merchant or freelancer:
* Paste any product URL.
* Inspect existing metadata and detect silent variant drops.
* Cross-reference live market listings and competitor pricing via **SerpApi Google Shopping**.
* Run an automated forensic audit and generate a 100% compliant **Schema.org Product JSON-LD** snippet powered by **Google's open-weight Gemma 2**.

---

## Demo

* **Live Deployed App:** [https://catalog-pulse.vercel.app](https://catalog-pulse.vercel.app)
* **Sample Product Audited:** Allbirds Tree Runner / Gymshark Hoodies

### Key Capabilities in Action:
1. **Instant AI Discoverability Score (0–100 & Letter Grade):** Evaluates if an AI agent can read prices, stock, and variants.
2. **Silent Variant & GTIN Omission Radar:** Pinpoints exact missing microdata fields that prevent AI engines from picking the product.
3. **SerpApi Live Market Check:** Verifies how the item and competitor listings currently surface in Google Shopping results.
4. **1-Click JSON-LD Fix Generator:** Gemma 2 automatically generates validated Schema.org code ready to paste into any Shopify `theme.liquid` or HTML template.

---

## Code

The complete source code is open-source under the MIT License on GitHub:

{% github reachmeghanashyam-coder/catalog-pulse %}

---

## How I Built It

The project is built on modern web standards with an entirely open-source AI architecture:

* **Open-Weight AI Core:** **Google Gemma 2 (`google/gemma-2-9b-it`)** running inference via Groq. Gemma acts as an automated semantic auditor: it ingests raw product microdata, detects inconsistencies, and synthesizes clean JSON-LD specifications.
* **Live Search Telemetry:** **SerpApi Google Shopping Engine** queries real-time merchant listings to cross-reference prices and detect pricing discrepancies.
* **Extraction Engine:** Cheerio server-side DOM parser extracting OpenGraph, JSON-LD, and meta tags.
* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons.

---

## Why Does Open Innovation Matter?

Why did open-source AI matter for this side hustle, and what did it make possible that a closed API wouldn't?

1. **Near-Zero Unit Economics for Small Businesses:**  
   Closed proprietary APIs (like GPT-4o) charge substantial per-token fees. For an indie merchant auditing a 500-product catalog, running continuous audits on closed APIs kills profit margins. Using an open-weight model like **Gemma 2** allows this service to run at near-zero inference cost, making a free or $5/month tool commercially viable for small sellers.
2. **Data Sovereignty & Local Auditability:**  
   Merchant catalog data, unreleased SKU pricing, and inventory numbers are sensitive. Because Gemma is open-weight, merchants and developers can host the model locally (via Ollama or vLLM) so proprietary inventory data never leaves their local network.
3. **No Vendor Lock-in or Price Hikes:**  
   Closed API providers frequently change pricing tiers, deprecate models, or alter rate limits. An open-weight foundation guarantees that small businesses maintain control of their own tooling.

---

## My First User

I shared CatalogPulse with a friend who runs an independent D2C apparel store on Shopify. 

* **The Problem:** He noticed his secondary sizes (US 10.5 / US 11) were never being returned when testing queries on ChatGPT Search.
* **The Audit:** CatalogPulse revealed that his Shopify theme was only emitting the default variant in root Schema.org offer nodes, dropping secondary sizes entirely.
* **The Result:** He copied the Gemma-generated JSON-LD snippet directly into his store header. Within minutes, his structured data test was 100% validated without hiring a developer.

---

## Prize Categories

This project is entered into the following Hacktoberfest Week 2 categories:

* **Featured Category:** **Best Use of Gemma** (Uses Google's open-weight Gemma 2 model for catalog auditing and schema synthesis).
* **Partner Category:** **Best Use of SerpApi** (Uses SerpApi Google Shopping API for live market pricing telemetry).
