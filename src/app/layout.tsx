import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CatalogPulse — Open-Source AI Commerce & Schema Linter",
  description:
    "Audit e-commerce product catalogs for AI-agent discoverability (ChatGPT Search, Perplexity, Gemini) powered by Google Gemma 2 & SerpApi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
