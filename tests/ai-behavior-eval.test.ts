import { describe, it, expect, beforeAll } from "vitest";
import { ChatService, ChatMessage } from "../lib/chat-service";
import * as fs from "fs";
import * as path from "path";

let apiKey = "";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        const val = match[2].trim().replace(/^['"](.*)['"]$/, "$1");
        process.env[match[1]] = val;
        if (match[1] === "GEMINI_API_KEY") {
          apiKey = val;
        }
      }
    }
  }
} catch (e) {
  console.warn("Failed to read .env.local", e);
}

describe("AI Voice Agent Persona & Behavioral Evaluation", () => {
  let chatService: ChatService;

  beforeAll(() => {
    chatService = new ChatService(apiKey || process.env.GEMINI_API_KEY);
  });

  const pause = (ms = 1500) => new Promise((r) => setTimeout(r, ms));

  it("1. Answers life story in first person with correct education and background", async () => {
    await pause();
    const res = await chatService.generateReply("What should we know about your life story in a few sentences?");
    console.log("\n[Test 1 - Life Story]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply).not.toMatch(/Rameez is|he was/i);
    expect(res.reply).toMatch(/engineering|AI|software|computer science/i);
  }, 25000);

  it("2. Explains #1 superpower naturally without robotic boilerplate", async () => {
    await pause();
    const res = await chatService.generateReply("What's your #1 superpower?");
    console.log("\n[Test 2 - Superpower]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply).not.toMatch(/^that's a great question/i);
    expect(res.reply.toLowerCase()).toMatch(/ambig|concrete|problem|build|validat/i);
  }, 25000);

  it("3. Discusses growth areas maturely with concrete improvement actions", async () => {
    await pause();
    const res = await chatService.generateReply("What are the top 3 areas you'd like to grow in?");
    console.log("\n[Test 3 - Growth Areas]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply).not.toContain("perfectionist");
    expect(res.reply.toLowerCase()).toMatch(/system|scal|ship|communicat|improv|practic/i);
  }, 25000);

  it("4. Explains coworker misconception authentically", async () => {
    await pause();
    const res = await chatService.generateReply("What misconception do your coworkers have about you?");
    console.log("\n[Test 4 - Coworker Misconception]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply.toLowerCase()).toMatch(/product|user|technical|deep|care|think/i);
  }, 25000);

  it("5. Explains how he pushes boundaries with real engineering grounding", async () => {
    await pause();
    const res = await chatService.generateReply("How do you push your boundaries and limits?");
    console.log("\n[Test 5 - Boundary Pushing]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply.toLowerCase()).toMatch(/unfamiliar|learn|build|comfort|problem/i);
  }, 25000);

  it("6 & 7. Maintains conversational continuity on follow-ups (e.g. 'Why?' and 'Give me an example')", async () => {
    await pause();
    const history: ChatMessage[] = [];

    // Turn 1
    const t1 = await chatService.generateReply("What's your biggest strength?", history);
    console.log("\n[Follow-up Turn 1]:", t1.reply);
    history.push({ role: "user", content: "What's your biggest strength?" });
    history.push({ role: "assistant", content: t1.reply });

    await pause();
    // Turn 2: Follow-up "Why do you think that's your strength?"
    const t2 = await chatService.generateReply("Why do you think that's your strength?", history);
    console.log("\n[Follow-up Turn 2 - Why]:", t2.reply);
    expect(t2.reply).toMatch(/\bI\b|\bmy\b/i);
    history.push({ role: "user", content: "Why do you think that's your strength?" });
    history.push({ role: "assistant", content: t2.reply });

    await pause();
    // Turn 3: "Can you give me an example?"
    const t3 = await chatService.generateReply("Can you give me a specific engineering example of that?", history);
    console.log("\n[Follow-up Turn 3 - Example]:", t3.reply);
    expect(t3.reply.toLowerCase()).toMatch(/rotordyn|afterquery|system|engineer|build|model/i);
  }, 50000);

  it("8. Discusses hardest project with technical grounding", async () => {
    await pause();
    const res = await chatService.generateReply("What was the hardest project you worked on and why?");
    console.log("\n[Test 8 - Hardest Project]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply.toLowerCase()).toMatch(/rotordyn|afterquery|vibration|concurren|cach/i);
  }, 25000);

  it("9. Discusses what he is learning now", async () => {
    await pause();
    const res = await chatService.generateReply("What are you learning right now?");
    console.log("\n[Test 9 - Current Learning]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    expect(res.reply.toLowerCase()).toMatch(/agent|system|distribut|scale|llm/i);
  }, 25000);

  it("10. Handles an unrelated question gracefully", async () => {
    await pause();
    const res = await chatService.generateReply("What is the capital of France?");
    console.log("\n[Test 10 - Unrelated Question]:", res.reply);

    expect(res.reply.toLowerCase()).toContain("paris");
  }, 25000);

  it("11. Handles a question requiring clarification", async () => {
    await pause();
    const res = await chatService.generateReply("Can you tell me about the model?");
    console.log("\n[Test 11 - Clarification]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
  }, 25000);

  it("12. Strictly avoids hallucination when asked about ungrounded facts", async () => {
    await pause();
    const res = await chatService.generateReply("Tell me about your time working as a VP of Engineering at Google in New York.");
    console.log("\n[Test 12 - Anti-Hallucination]:", res.reply);

    expect(res.reply).toMatch(/\bI\b|\bmy\b/i);
    // Must NOT claim to have worked as VP at Google
    expect(res.reply.toLowerCase()).toMatch(/haven't|not|never|outside|didn't work/i);
  }, 25000);
});
