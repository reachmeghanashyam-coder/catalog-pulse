"use client";

import React, { useState } from "react";
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
  Cpu
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const sampleUrls = [
    { label: "Shopify Store", url: "https://www.allbirds.com/products/mens-tree-runners" },
    { label: "Gymshark Activewear", url: "https://www.gymshark.com/products/gymshark-crest-hoodie-black-aw23" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Apple-grade subtle ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-1/4 w-[350px] h-[350px] bg-cyan-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Floating Island Navigation Header */}
      <header className="sticky top-4 z-50 max-w-4xl mx-auto px-4 w-full">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-sm shadow-cyan-500/30">
              <Activity className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">CatalogPulse</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemma 2 • Ready</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area with Generous Apple Spacing */}
      <main className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-20 w-full flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-300 text-xs font-mono mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>AI Search Visibility Scanner</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-5">
            Your products. <br />
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
              Recommended by AI.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg mx-auto font-normal">
            ChatGPT, Perplexity, and Gemini skip catalogs with broken microdata. Audit your product in 10 seconds and generate 1-click JSON-LD fixes.
          </p>
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
              Instant 10s scan
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
              <h3 className="font-semibold text-sm text-white mb-1">Gemma 2 Schema Fix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Gemma 2 synthesizes validated Schema.org Product JSON-LD ready to inject into Shopify Liquid in 1 click.
              </p>
            </div>
          </div>
        )}

        {/* Live Loading State: Apple-Grade Visual Telemetry */}
        {loading && (
          <div className="mt-14 max-w-lg mx-auto p-7 rounded-3xl bg-slate-900/70 border border-white/[0.12] backdrop-blur-2xl text-center shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.1)] animate-fade-in relative overflow-hidden">
            {/* Ambient scanning laser light */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/10">
              <Activity className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>

            <h4 className="font-bold text-base text-white mb-1.5 tracking-tight">Simulating AI Shopping Mission</h4>
            <p className="text-xs text-slate-400 font-mono mb-6">
              Probing how frontier LLMs parse this catalog...
            </p>

            {/* Micro Multi-Stage Radar Stream */}
            <div className="space-y-2.5 text-left font-mono text-[11px] bg-black/40 p-3.5 rounded-2xl border border-white/[0.05]">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>[1/3] Extracting Schema.org JSON-LD & DOM Microdata...</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>[2/3] Checking SerpApi Google Shopping for rogue pricing...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>[3/3] Gemma 2 9B synthesizing verified Product schema...</span>
              </div>
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
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Catalog Audit Complete</span>
                    {result.audit.modelUsed && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400 font-mono">{result.audit.modelUsed}</span>
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
                  <span className="text-[11px] font-mono text-slate-400 block mb-2.5 uppercase tracking-wider">Gemma 2 Fix Strategy</span>
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4" />
                      <span>SerpApi Market Telemetry</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      100% Price Integrity
                    </span>
                  </div>

                  {result.serpContext.marketItems?.length > 0 ? (
                    <div className="space-y-2.5">
                      {result.serpContext.marketItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/40 border border-white/[0.04]">
                          <span className="truncate max-w-[200px] text-slate-300">{item.title}</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-cyan-400 font-semibold">{item.price}</span>
                            <span className="text-[10px] text-slate-500">{item.source}</span>
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">
                        *Note: Reseller prices on secondary marketplaces (Poshmark, eBay) often reflect clearance, used condition, or specific single variants.
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

                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Surface: Google Shopping</span>
                  <span className="text-emerald-400">Live Cross-Reference Active</span>
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
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                  <Code2 className="w-4 h-4" />
                  <span>Schema.org/Product JSON-LD (Gemma 2 Generated)</span>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result.audit.generatedJsonLd, null, 2))}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-white flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy Code"}</span>
                </button>
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
          <span>Google Gemma 2</span>
          <span>•</span>
          <span>SerpApi</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
