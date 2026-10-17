import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");

test("Security: .gitignore explicitly ignores local environment files", () => {
  const gitignorePath = path.join(ROOT_DIR, ".gitignore");
  assert.ok(fs.existsSync(gitignorePath), ".gitignore must exist");
  const content = fs.readFileSync(gitignorePath, "utf-8");
  assert.ok(content.includes(".env*.local") || content.includes(".env.local"), ".gitignore must ignore .env.local");
});

test("Security: Client-facing source files never reference private backend API keys", () => {
  const pagePath = path.join(ROOT_DIR, "src", "app", "page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  // Private keys must never appear in client component code
  assert.ok(!content.includes("SERPAPI_API_KEY"), "page.tsx must not reference SERPAPI_API_KEY");
  assert.ok(!content.includes("GEMINI_API_KEY"), "page.tsx must not reference GEMINI_API_KEY");
  assert.ok(!content.includes("GROQ_API_KEY"), "page.tsx must not reference GROQ_API_KEY");
  assert.ok(!content.includes("HUGGINGFACE_API_KEY"), "page.tsx must not reference HUGGINGFACE_API_KEY");
});

test("Security: Git tracking confirms .env.local is NOT tracked", () => {
  try {
    const trackedFiles = execSync("git ls-files .env.local", { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
    assert.equal(trackedFiles, "", ".env.local must not be tracked in git repository");
  } catch (e) {
    // If git fails, fail the test
    assert.fail(`Git command failed: ${e.message}`);
  }
});
