import { defineConfig } from "vitest/config";
import * as path from "path";
import * as fs from "fs";

// Read .env.local and set process.env
const envPath = path.resolve(__dirname, ".env.local");
let geminiKey = process.env.GEMINI_API_KEY || "";
let geminiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
        if (k === "GEMINI_API_KEY") geminiKey = v;
        if (k === "GEMINI_MODEL") geminiModel = v;
        process.env[k] = v;
      }
    }
  }
}

export default defineConfig({
  test: {
    env: {
      GEMINI_API_KEY: geminiKey,
      GEMINI_MODEL: geminiModel,
    },
    testTimeout: 60000,
  },
});
