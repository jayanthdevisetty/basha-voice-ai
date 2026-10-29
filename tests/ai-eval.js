import { readFileSync } from "fs";

// Load local environment variables from .env.local
const envLocal = readFileSync(".env.local", "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
  if (match) {
    const key = match[1];
    const val = match[2].trim().replace(/^['"](.*)['"]$/, "$1");
    process.env[key] = val;
  }
}

const { chatService } = await import("../lib/chat-service.js").catch(async () => {
  // If compiled or via tsx/node
  return { chatService: null };
});
