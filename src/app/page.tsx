"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Zap,
  Globe2,
  Cpu,
  Loader2
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let stepTimer1: NodeJS.Timeout;
    let stepTimer2: NodeJS.Timeout;
    let stepTimer3: NodeJS.Timeout;

    if (loading) {
      setElapsedSeconds(0);
      setLoadingStep(0);

      // Increment elapsed timer every second
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Stage 1: Domestic parsing (0s)
      setLoadingStep(1);

      // Stage 2: SerpApi Google Shopping Market Telemetry (~2.5s)
      stepTimer1 = setTimeout(() => {
        setLoadingStep(2);
      }, 2500);

      // Stage 3: Google Gemma 4 Neural Synthesis (~6s)
      stepTimer2 = setTimeout(() => {
        setLoadingStep(3);
      }, 6000);

      // Stage 4: Fact Grounding & Formatting (~12s)
      stepTimer3 = setTimeout(() => {
        setLoadingStep(4);
      }, 12000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
    };
  }, [loading]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to inspect catalog URL.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadClientReport = () => {
    if (!result) return;
    const { product, serpContext, priceIntegrity, audit, extractionMode, auditedAt } = result;
    const marketRows = (serpContext?.marketItems || [])
      .map((item: any) => {
        const merchantCell = item.link ? `[${item.source}](${item.link})` : item.source;
        return `| ${item.title} | ${item.price} | ${merchantCell} |`;
      })
      .join("\n");

    const spreadSummary = priceIntegrity?.minMarketPrice
      ? `$${priceIntegrity.minMarketPrice} – $${priceIntegrity.maxMarketPrice} (Median: $${priceIntegrity.medianMarketPrice}) — ${priceIntegrity.statusLabel}`
      : "No external market listings compared";

    const reportMd = `# CatalogPulse — AI Search & Agentic Commerce Audit Report

**Product:** ${product.title}  
**Brand:** ${product.brand}  
**Inspected URL:** ${product.url || url}  
**Audited Timestamp (UTC):** ${auditedAt || serpContext?.fetchedAt || new Date().toISOString()}  
**Extraction Provenance:** ${extractionMode || "Live Storefront HTML"}  
**Official Price:** ${product.price} ${product.currency}  
**GTIN / Barcode:** ${product.gtin || "MISSING (Critical Warning)"}  
**AI Discoverability Score:** **${audit.score} / 100 (Grade ${audit.grade})**  
**Inference Engine:** ${audit.modelUsed || "Google Gemma 4"}

---

## 1. Executive Summary
${audit.summary}

## 2. Critical Discoverability Flaws
${(audit.criticalFlaws || []).map((f: string) => `- ❌ ${f}`).join("\n")}

## 3. Recommended Remediation Strategy
${(audit.recommendations || []).map((r: string) => `- ✅ ${r}`).join("\n")}

## 4. Live Google Shopping Market Telemetry (via SerpApi)
- **Telemetry Source:** ${serpContext?.source || "SerpApi Google Shopping Engine"}
- **Total Listings Indexed:** ${serpContext?.totalResultsFound || 0}
- **Deterministic Price Spread:** ${spreadSummary}

| Listing Title | Price | Merchant / Source |
| :--- | :--- | :--- |
${marketRows || "| No external listings found | - | - |"}

## 5. Ready-to-Paste Shopify \`theme.liquid\` Schema.org Fix
Paste this snippet inside your \`<head>\` or product template:

\`\`\`html
<script type="application/ld+json">
${JSON.stringify(audit.generatedJsonLd, null, 2)}
</script>
\`\`\`
`;

    const blob = new Blob([reportMd], { type: "text/markdown;charset=utf-8" });
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (product.title || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = dlUrl;
    a.download = `catalogpulse-audit-${slug}.md`;
    a.click();
    URL.revokeObjectURL(dlUrl);
  };

  const sampleUrls = [
    { label: "Shopify Store", url: "https://www.allbirds.com/products/mens-tree-runners" },
    { label: "Gymshark Activewear", url: "https://www.gymshark.com/products/gymshark-crest-hoodie-black-aw23" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Apple-grade subtle ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-1/4 w-[350px] h-[350px] bg-cyan-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Clean Modern Navigation Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#07090e]/80 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-sm shadow-cyan-500/30">
              <Activity className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">CatalogPulse</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google Gemma • Ready</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area with Generous Apple Spacing (Compresses smoothly during loading) */}
      <main className={`max-w-4xl mx-auto px-4 pb-20 w-full flex-1 transition-all duration-300 ${
        loading ? "pt-6 sm:pt-10" : "pt-14 sm:pt-20"
      }`}>
        {/* Hero Section */}
        <div className={`text-center max-w-2xl mx-auto transition-all duration-300 ${
          loading ? "mb-6" : "mb-12"
        }`}>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-300 text-xs font-mono mb-4 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>AI Search Visibility Scanner</span>
          </div>

          <h1 className={`font-extrabold tracking-tight text-white leading-[1.08] transition-all duration-300 ${
            loading ? "text-3xl sm:text-4xl mb-2" : "text-4xl sm:text-6xl mb-4"
          }`}>
            Your products. <br />
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
              Recommended by AI.
            </span>
          </h1>

          {!loading && (
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg mx-auto font-normal animate-fade-in">
              ChatGPT, Perplexity, and Gemini skip catalogs with broken microdata. Audit your product in 10 seconds and generate 1-click JSON-LD fixes.
            </p>
          )}
        </div>

        {/* Apple Spotlight / Raycast Style Command Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <form 
            onSubmit={handleAudit} 
            className="group relative flex items-center rounded-full bg-slate-900/90 backdrop-blur-3xl border border-white/[0.12] hover:border-cyan-400/50 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/15 p-1.5 shadow-[0_12px_45px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.08)] transition-all duration-300"
          >
            <div className="flex items-center flex-1 px-3.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center mr-2.5 shrink-0 group-hover:bg-cyan-500/10 transition-colors">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourstore.com/products/item..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-normal tracking-tight"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-white to-slate-100 hover:from-white hover:to-white text-slate-950 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-cyan-400/30 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Run Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Clean One-Line Micro Row */}
          <div className="flex items-center justify-between px-3 mt-3 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-sans">Sample stores:</span>
              {sampleUrls.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setUrl(s.url)}
                  className="px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-cyan-300 transition text-[11px] cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-sans">
              <Zap className="w-3 h-3 text-cyan-400" />
              Real-Time Catalog Scan
            </span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 mb-8 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Default State: The Value Proposition Canvas (When no result is loaded) */}
        {!result && !loading && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/30 border border-white/[0.06] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 font-mono text-xs">
                01
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Detect Variant Drops</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client-side size/color selectors hide secondary variants from AI bots. We extract and expose every SKU.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/30 border border-white/[0.06] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 font-mono text-xs">
                02
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">SerpApi Market Radar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time Google Shopping cross-check identifies competitor price undercutting and catalog drift.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/30 border border-white/[0.06] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 font-mono text-xs">
                03
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Gemma Schema Fix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Gemma synthesizes validated Schema.org Product JSON-LD ready to inject into Shopify Liquid in 1 click.
              </p>
            </div>
          </div>
        )}

        {/* Live Loading State: Dynamic Multi-Stage Radar with Live Progress */}
        {loading && (
          <div className="mt-6 max-w-lg mx-auto p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/[0.14] backdrop-blur-2xl text-center shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.12)] animate-fade-in relative overflow-hidden">
            {/* Ambient scanning laser light */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

            {/* Pulsing center radar orb with real-time timer */}
            <div className="relative w-14 h-14 mx-auto mb-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
              <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/10">
                <span className="font-mono text-sm font-bold text-cyan-300 leading-none">{elapsedSeconds}s</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">elapsed</span>
              </div>
            </div>

            <h4 className="font-bold text-sm sm:text-base text-white mb-0.5 tracking-tight">
              Executing Forensic Catalog Audit
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono mb-4">
              Simulating autonomous shopping agent crawlers...
            </p>

            {/* Dynamic Step-by-Step Telemetry Pipeline */}
            <div className="space-y-1.5 text-left font-mono text-[11px] bg-black/50 p-3 sm:p-3.5 rounded-2xl border border-white/[0.06]">
              {/* Step 1: DOM & Microdata Extraction */}
              <div className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                loadingStep > 1 ? "bg-emerald-500/10 text-emerald-300" :
                loadingStep === 1 ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30" : "text-slate-600"
              }`}>
                <div className="flex items-center gap-2.5">
                  {loadingStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : loadingStep === 1 ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>1. DOM &amp; Schema.org JSON-LD Extraction</span>
                </div>
                <span className="text-[10px] font-sans">
                  {loadingStep > 1 ? "Parsed" : loadingStep === 1 ? "Active..." : "Pending"}
                </span>
              </div>

              {/* Step 2: SerpApi Live Google Shopping Cross-Check */}
              <div className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                loadingStep > 2 ? "bg-emerald-500/10 text-emerald-300" :
                loadingStep === 2 ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30" : "text-slate-600"
              }`}>
                <div className="flex items-center gap-2.5">
                  {loadingStep > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : loadingStep === 2 ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>2. SerpApi Google Shopping Market Telemetry</span>
                </div>
                <span className="text-[10px] font-sans">
                  {loadingStep > 2 ? "Verified" : loadingStep === 2 ? "Querying..." : "Pending"}
                </span>
              </div>

              {/* Step 3: Google Gemma 4 AI Forensic Audit */}
              <div className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                loadingStep > 3 ? "bg-emerald-500/10 text-emerald-300" :
                loadingStep === 3 ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30" : "text-slate-600"
              }`}>
                <div className="flex items-center gap-2.5">
                  {loadingStep > 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : loadingStep === 3 ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>3. Google Gemma 4 Neural Synthesis</span>
                </div>
                <span className="text-[10px] font-sans">
                  {loadingStep > 3 ? "Complete" : loadingStep === 3 ? "Synthesizing..." : "Pending"}
                </span>
              </div>

              {/* Step 4: Strict Fact-Grounding & Liquid Generation */}
              <div className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                loadingStep >= 4 ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30" : "text-slate-600"
              }`}>
                <div className="flex items-center gap-2.5">
                  {loadingStep >= 4 ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>4. Fact-Grounding &amp; Liquid Fix Compiler</span>
                </div>
                <span className="text-[10px] font-sans">
                  {loadingStep >= 4 ? "Finalizing..." : "Pending"}
                </span>
              </div>
            </div>

            {/* Reassuring Live Status Micro-Message */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {loadingStep <= 1 && "Connecting to remote storefront..."}
                {loadingStep === 2 && "Scanning Google Shopping for reseller pricing..."}
                {loadingStep === 3 && "Google Gemma 4 evaluating Schema microdata fidelity..."}
                {loadingStep >= 4 && "Compiling standards-compliant JSON-LD deliverable..."}
              </span>
            </div>
          </div>
        )}

        {/* Audit Results Presentation (Apple Card Grid) */}
        {result && (
          <div className="mt-12 space-y-5 animate-fade-in">
            {/* Top Product Score Hero Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/[0.1] backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black border shadow-lg ${
                  result.audit.grade === 'A' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' :
                  result.audit.grade === 'B' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                }`}>
                  <span className="text-2xl leading-none">{result.audit.score}</span>
                  <span className="text-[10px] uppercase font-mono mt-0.5">Grade {result.audit.grade}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-cyan-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Catalog Audit Complete</span>
                    {result.audit.modelUsed && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400 font-mono">{result.audit.modelUsed}</span>
                      </>
                    )}
                    {result.extractionMode && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[10px]">
                          {result.extractionMode}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-white leading-snug">{result.product.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{result.audit.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-xs font-mono border-t sm:border-t-0 sm:border-l border-white/[0.08] pt-4 sm:pt-0 sm:pl-6 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Price</span>
                  <span className="text-white font-semibold">{result.product.price} {result.product.currency}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Barcode GTIN</span>
                  <span className={result.product.gtin ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                    {result.product.gtin || "MISSING"}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Diagnostic Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Flaws Card */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/[0.08] backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Discoverability Flaws ({result.audit.criticalFlaws.length})</span>
                </div>

                <div className="space-y-3">
                  {result.audit.criticalFlaws.map((flaw: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{flaw}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <span className="text-[11px] font-mono text-slate-400 block mb-2.5 uppercase tracking-wider">
                    {result.audit.modelUsed ? `${result.audit.modelUsed} Strategy` : "Google Gemma Fix Strategy"}
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.audit.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SerpApi Market Intelligence & Shield */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4" />
                      <span>SerpApi Market Telemetry</span>
                    </div>
                    {result.priceIntegrity?.undercutDetected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/25">
                        <AlertTriangle className="w-3 h-3" />
                        {result.priceIntegrity.statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        {result.priceIntegrity?.statusLabel || "Price Parity Verified"}
                      </span>
                    )}
                  </div>

                  {result.priceIntegrity?.minMarketPrice && (
                    <div className="grid grid-cols-3 gap-2 mb-3 p-2.5 rounded-xl bg-black/40 border border-white/[0.05] font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block">Lowest Comp</span>
                        <span className="text-cyan-400 font-semibold">${result.priceIntegrity.minMarketPrice}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block">Market Median</span>
                        <span className="text-white font-semibold">${result.priceIntegrity.medianMarketPrice}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block">Highest Comp</span>
                        <span className="text-slate-300 font-semibold">${result.priceIntegrity.maxMarketPrice}</span>
                      </div>
                    </div>
                  )}

                  {result.serpContext.marketItems?.length > 0 ? (
                    <div className="space-y-2.5">
                      {result.serpContext.marketItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/40 border border-white/[0.04]">
                          <span className="truncate max-w-[190px] text-slate-300" title={item.title}>{item.title}</span>
                          <div className="flex items-center gap-2 font-mono shrink-0">
                            <span className="text-cyan-400 font-semibold">{item.price}</span>
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 underline decoration-white/20"
                              >
                                <span>{item.source}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-500">{item.source}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">
                        *Note: Secondary marketplace listings (Poshmark, eBay, Mercari) may reflect clearance, pre-owned condition, or single-size variants.
                      </p>
                    </div>
                  ) : (
                    <div className="py-6 px-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 text-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                      <h5 className="font-semibold text-xs text-white mb-1">Zero Third-Party Undercuts Detected</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                        No rogue 3rd-party sellers are currently undercutting your official price on Google Shopping.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                  <span>{result.serpContext.source || "SerpApi Google Shopping"}</span>
                  <span className="text-emerald-400">
                    {result.serpContext.fetchedAt
                      ? `Verified ${new Date(result.serpContext.fetchedAt).toISOString().slice(11, 19)} UTC`
                      : "Live Cross-Reference Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Apple-Grade Visual Transformation: The AI Shopping Simulation */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.1] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Agent Behavior Simulation: Before vs After</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.06]">
                  Illustrative Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Without Fix */}
                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-rose-500/10 text-rose-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>✕</span> Without Complete Microdata
                    </span>
                    <span className="text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full">Simulated Risk</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-sans text-xs">
                    <strong className="text-slate-300 font-mono">LLM Agent Parsing:</strong> "Found multiple sneaker alternatives. Note: {result.product.title} catalog emits incomplete variant microdata; secondary sizes and current stock confidence cannot be independently validated."
                  </p>
                </div>

                {/* With Fix */}
                <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-500/10 text-emerald-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>✓</span> With Validated JSON-LD
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Machine-Verified</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs">
                    <strong className="text-emerald-400 font-mono">LLM Agent Parsing:</strong> "Recommended: {result.product.title} by {result.product.brand}. Structured Schema.org Offer node validates in-stock status at {result.product.price} {result.product.currency}."
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Code Section */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#080b12] border border-white/[0.1] shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                  <Code2 className="w-4 h-4" />
                  <span>Schema.org/Product JSON-LD ({result.audit.modelUsed || "Google Gemma Generated"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadClientReport}
                    className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Export Client Report (.md)</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result.audit.generatedJsonLd, null, 2))}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-white flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-black/60 border border-white/[0.05] overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-72">
                {JSON.stringify(result.audit.generatedJsonLd, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Apple-grade Minimal Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-xs text-slate-500 max-w-4xl mx-auto px-4 w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>CatalogPulse</span>
          <span>•</span>
          <span>Open-Source AI Commerce</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Google Gemma</span>
          <span>•</span>
          <span>SerpApi</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
