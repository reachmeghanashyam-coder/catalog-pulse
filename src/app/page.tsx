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
  Loader2,
  Check,
  Bot,
  SlidersHorizontal
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [codeTab, setCodeTab] = useState<"liquid" | "jsonld">("liquid");

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

  const getLiquidSnippet = (jsonLd: any) => {
    return `{%- comment -%}
  CatalogPulse • Google Gemma Validated Schema.org Product Inject
  Paste directly into layout/theme.liquid right before </head>
{%- endcomment -%}
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`;
  };

  const renderJsonVal = (val: string): React.ReactNode => {
    if (val.startsWith('"') && (val.endsWith('",') || val.endsWith('"'))) {
      const hasComma = val.endsWith(",");
      const core = hasComma ? val.slice(0, -1) : val;
      return (
        <>
          <span className="text-emerald-300">{core}</span>
          {hasComma && <span className="text-slate-500">,</span>}
        </>
      );
    }
    if (/^(true|false|null),?$/.test(val)) {
      return <span className="text-purple-400 font-semibold">{val}</span>;
    }
    if (/^-?\d+(\.\d+)?,?$/.test(val)) {
      return <span className="text-amber-300 font-semibold">{val}</span>;
    }
    return <span className="text-slate-300">{val}</span>;
  };

  const renderLineTokens = (content: string): React.ReactNode => {
    if (content.startsWith("{%-") || content.startsWith("<!--") || content.startsWith("//") || content.startsWith("*")) {
      return <span className="text-slate-500 italic">{content}</span>;
    }
    if (content.startsWith("<script") || content.startsWith("</script>")) {
      return <span className="text-indigo-400 font-bold">{content}</span>;
    }
    const kv = content.match(/^("[\w@\-_.]+"):(\s*)(.*)$/);
    if (kv) {
      const [, key, space, rest] = kv;
      return (
        <>
          <span className="text-cyan-300 font-semibold">{key}</span>
          <span className="text-slate-400">:</span>
          {space}
          {renderJsonVal(rest)}
        </>
      );
    }
    return renderJsonVal(content);
  };

  const renderHighlightedCode = (code: string) => {
    const lines = code.split("\n");
    return (
      <div className="font-mono text-[11px] leading-relaxed select-text overflow-x-auto">
        {lines.map((line, idx) => {
          const leadingMatch = line.match(/^(\s*)/);
          const leading = leadingMatch ? leadingMatch[1] : "";
          const content = line.slice(leading.length);

          return (
            <div key={idx} className="flex hover:bg-white/[0.04] transition-colors py-0.5 px-2">
              <span className="w-7 shrink-0 text-slate-600 text-right pr-3 select-none text-[10px] font-mono">
                {idx + 1}
              </span>
              <span className="flex-1 whitespace-pre">
                {leading}
                {renderLineTokens(content)}
              </span>
            </div>
          );
        })}
      </div>
    );
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

        {/* Default State: Interactive Value Proposition Canvas */}
        {!result && !loading && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setUrl("https://www.allbirds.com/products/mens-tree-runners")}
              className="text-left p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/[0.08] hover:border-cyan-500/40 backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-[0.98] shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 font-mono text-xs group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="font-semibold text-sm text-white mb-1 group-hover:text-cyan-300 transition-colors">
                  Detect Variant Drops
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Client-side size/color selectors hide secondary variants from AI bots. We extract and expose every SKU.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Load Allbirds Sample</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUrl("https://www.gymshark.com/products/gymshark-crest-hoodie-black-aw23")}
              className="text-left p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/[0.08] hover:border-indigo-500/40 backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-[0.98] shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 font-mono text-xs group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="font-semibold text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  SerpApi Market Radar
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Real-time Google Shopping cross-check identifies competitor price undercutting and catalog drift.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Load Gymshark Sample</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUrl("https://www.allbirds.com/products/mens-tree-runners")}
              className="text-left p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/[0.08] hover:border-emerald-500/40 backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-[0.98] shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 font-mono text-xs group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="font-semibold text-sm text-white mb-1 group-hover:text-emerald-300 transition-colors">
                  Gemma Schema Fix
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Google Gemma synthesizes validated Schema.org Product JSON-LD ready to inject into Shopify Liquid in 1 click.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Load Gemma Ready Store</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
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

        {/* Audit Results Presentation: Apple & Alexa+ Grade Visual Studio */}
        {result && (
          <div className="mt-12 space-y-6 animate-fade-in">
            {/* Top Product Score Hero Card with Radial SVG Gauge & Sub-Metric Telemetry */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
              {/* Dynamic ambient background glow */}
              <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-25 ${
                result.audit.grade === 'A' ? 'bg-emerald-500' :
                result.audit.grade === 'B' ? 'bg-cyan-500' :
                'bg-amber-500'
              }`} />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                {/* Left: Animated Radial Score Gauge & Product Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Glowing Circular SVG Dial */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - (result.audit.score || 0) / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className={`transition-all duration-1000 ease-out ${
                          result.audit.score >= 80 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]' :
                          result.audit.score >= 60 ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]' :
                          'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                        }`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black tracking-tight text-white leading-none">
                        {result.audit.score}
                      </span>
                      <span className={`text-[9px] font-bold font-mono uppercase mt-1 px-1.5 py-0.5 rounded-full ${
                        result.audit.grade === 'A' ? 'bg-emerald-500/20 text-emerald-300' :
                        result.audit.grade === 'B' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        Grade {result.audit.grade}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-cyan-400 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Audit Complete</span>
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

                {/* Right: Sub-Metric Progress Telemetry Bars */}
                <div className="w-full lg:w-72 shrink-0 p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Microdata Fidelity</span>
                      <span className={result.audit.criticalFlaws.some((f: string) => f.toLowerCase().includes('schema') || f.toLowerCase().includes('microdata') || f.toLowerCase().includes('variant')) ? "text-amber-400" : "text-emerald-400"}>
                        {result.audit.criticalFlaws.some((f: string) => f.toLowerCase().includes('schema') || f.toLowerCase().includes('microdata') || f.toLowerCase().includes('variant')) ? "45% • Flawed" : "95% • Optimal"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          result.audit.criticalFlaws.some((f: string) => f.toLowerCase().includes('schema') || f.toLowerCase().includes('microdata') || f.toLowerCase().includes('variant'))
                            ? "w-[45%] bg-amber-400"
                            : "w-[95%] bg-emerald-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Barcode / GTIN</span>
                      <span className={result.product.gtin ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {result.product.gtin ? "100% • Verified" : "0% • Missing"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          result.product.gtin ? "w-full bg-emerald-400" : "w-[12%] bg-rose-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Price Shield</span>
                      <span className={result.priceIntegrity?.undercutDetected ? "text-amber-400" : "text-cyan-400"}>
                        {result.priceIntegrity?.undercutDetected ? "Undercut Risk" : "Parity Intact"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          result.priceIntegrity?.undercutDetected ? "w-[50%] bg-amber-400" : "w-full bg-cyan-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Diagnostic Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Flaws Card with High-Impact Diagnostic Bento */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Discoverability Flaws ({result.audit.criticalFlaws.length})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    High Priority
                  </span>
                </div>

                <div className="space-y-2.5">
                  {result.audit.criticalFlaws.map((flaw: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-rose-500/[0.04] border border-rose-500/15 flex items-start gap-3 transition-all hover:bg-rose-500/[0.07]">
                      <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold">
                        !
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{flaw}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-rose-400/80">
                          <span>Blocks Agentic Checkout</span>
                          <span>•</span>
                          <span className="text-emerald-400">Fixed in Gemma Spec</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{result.audit.modelUsed ? `${result.audit.modelUsed} Fix Strategy` : "Google Gemma Fix Strategy"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Autonomous Synthesis</span>
                  </div>
                  <div className="space-y-2">
                    {result.audit.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-cyan-500/[0.03] border border-cyan-500/15 flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-sans">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SerpApi Market Intelligence & Shield */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
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

                  {/* Visual Market Price Spectrum Track */}
                  {result.priceIntegrity?.minMarketPrice && result.priceIntegrity?.maxMarketPrice && (
                    <div className="mb-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                        <span className="text-slate-400">Google Shopping Price Spread</span>
                        <span className="text-cyan-300 font-semibold">Store: ${result.product.price}</span>
                      </div>

                      {/* Visual Gradient Progress Bar */}
                      <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden my-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-75" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase block">Lowest Comp</span>
                          <span className="text-cyan-400 font-semibold">${result.priceIntegrity.minMarketPrice}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-slate-500 text-[9px] uppercase block">Market Median</span>
                          <span className="text-white font-semibold">${result.priceIntegrity.medianMarketPrice}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[9px] uppercase block">Highest Comp</span>
                          <span className="text-slate-300 font-semibold">${result.priceIntegrity.maxMarketPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reseller Comps List */}
                  {result.serpContext.marketItems?.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                        Active Reseller Comps ({result.serpContext.marketItems.length})
                      </span>
                      {result.serpContext.marketItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                          <span className="truncate max-w-[190px] text-slate-300 font-medium" title={item.title}>{item.title}</span>
                          <div className="flex items-center gap-2.5 font-mono shrink-0">
                            <span className="text-cyan-400 font-bold">{item.price}</span>
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
                              >
                                <span>{item.source}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/[0.02]">{item.source}</span>
                            )}
                          </div>
                        </div>
                      ))}
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

            {/* Agent Behavior Simulation: Alexa+ & ChatGPT Conversational Simulator */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-white/[0.1] backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Autonomous Agent Simulation</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Alexa+ &amp; ChatGPT Voice Commerce Simulator</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono self-start sm:self-auto">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>AI Agent Real-Time Behavior</span>
                </div>
              </div>

              {/* Simulated Prompt Context Header */}
              <div className="mb-4 p-3 rounded-2xl bg-black/50 border border-white/[0.06] flex items-center gap-3 text-xs font-mono">
                <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 text-[10px] uppercase tracking-wider shrink-0">
                  Shopper Voice Query
                </span>
                <span className="text-slate-300 truncate">
                  "Alexa, order {result.product.title} in my size right now"
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Store State: Without Fix */}
                <div className="p-5 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-rose-500/15">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span>Storefront Today (Without Fix)</span>
                      </div>
                      <span className="text-[10px] font-mono bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/20">
                        Sale Dropped
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/10 text-slate-300 font-mono leading-relaxed">
                        <span className="text-rose-400 font-bold block mb-1 text-[11px]">AI Agent Response:</span>
                        "I located {result.product.title}, but cannot verify if size options or real-time merchant stock are available. Recommending alternative store from Amazon."
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-500/10 flex items-center justify-between text-[10px] font-mono text-rose-400">
                    <span>Cart Abandonment</span>
                    <span>Zero Voice Discoverability</span>
                  </div>
                </div>

                {/* Post-Fix State: With CatalogPulse Fix */}
                <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-emerald-500/15">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>With CatalogPulse Fix (AI Ready)</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                        1-Click Checkout
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/10 text-slate-200 font-mono leading-relaxed">
                        <span className="text-emerald-400 font-bold block mb-1 text-[11px]">AI Agent Response:</span>
                        "Verified! Authentic {result.product.title} is confirmed in stock at {result.product.price} {result.product.currency} directly from official store. Placing order now."
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                    <span>100% Discoverability</span>
                    <span>Direct Channel Margin Retained</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Code Studio: Apple / Linear-Grade IDE */}
            <div className="rounded-3xl bg-[#080b12] border border-white/[0.12] shadow-2xl overflow-hidden">
              {/* IDE Top Window Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/90 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  {/* Mac Traffic Lights */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>

                  {/* Segmented Code Tabs */}
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setCodeTab("liquid")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        codeTab === "liquid"
                          ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      theme.liquid (Shopify Server Inject)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeTab("jsonld")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        codeTab === "jsonld"
                          ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Schema.org JSON-LD Spec
                    </button>
                  </div>
                </div>

                {/* Actions: Export Markdown Report & Copy Code */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadClientReport}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Export Report (.md)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(
                      codeTab === "liquid"
                        ? getLiquidSnippet(result.audit.generatedJsonLd)
                        : JSON.stringify(result.audit.generatedJsonLd, null, 2)
                    )}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-white flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Viewer Body with Syntax Highlighting & Line Numbers */}
              <div className="p-4 bg-black/60 max-h-96 overflow-y-auto">
                {renderHighlightedCode(
                  codeTab === "liquid"
                    ? getLiquidSnippet(result.audit.generatedJsonLd)
                    : JSON.stringify(result.audit.generatedJsonLd, null, 2)
                )}
              </div>
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
