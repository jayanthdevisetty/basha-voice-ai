import { describe, it, expect } from "vitest";
import { PERSONAL_KNOWLEDGE_BASE } from "../lib/knowledge-base";
import { cleanSpokenText } from "../lib/chat-service";
import { globalRateLimiter } from "../lib/rate-limiter";

describe("Personal Knowledge Base Verification", () => {
  it("has the verified identity for Shaik Rameez Basha", () => {
    expect(PERSONAL_KNOWLEDGE_BASE.identity.fullName).toBe("Shaik Rameez Basha");
    expect(PERSONAL_KNOWLEDGE_BASE.identity.title).toContain("AI/ML");
    expect(PERSONAL_KNOWLEDGE_BASE.education.institution).toContain("Narasaraopeta Engineering College");
    expect(PERSONAL_KNOWLEDGE_BASE.education.duration).toBe("2022 – 2026");
  });

  it("contains all three core projects: RotorDyn, AfterQuery, and Astra AI Innovation", () => {
    const projectNames = PERSONAL_KNOWLEDGE_BASE.projects.map((p) => p.name);
    expect(projectNames).toContain("RotorDyn");
    expect(projectNames).toContain("AfterQuery");
    expect(projectNames).toContain("Astra AI Innovation");

    const rotordyn = PERSONAL_KNOWLEDGE_BASE.projects.find((p) => p.name === "RotorDyn");
    expect(rotordyn?.technologies).toContain("FastAPI");
    expect(rotordyn?.technologies).toContain("Supabase/Postgres");
  });

  it("defines the exact superpower, growth areas, and misconceptions", () => {
    expect(PERSONAL_KNOWLEDGE_BASE.superpower.title).toContain("Ambiguity");
    expect(PERSONAL_KNOWLEDGE_BASE.growthAreas.length).toBeGreaterThanOrEqual(3);
    expect(PERSONAL_KNOWLEDGE_BASE.coworkerMisconceptions.misconception).toBeDefined();
    expect(PERSONAL_KNOWLEDGE_BASE.boundaryPushing.approach).toBeDefined();
  });

  it("defines team motivation and engineering approach", () => {
    expect(PERSONAL_KNOWLEDGE_BASE.teamMotivation.why).toContain("autonomous AI agents");
    expect(PERSONAL_KNOWLEDGE_BASE.workStyle.debugging).toContain("root cause");
    expect(PERSONAL_KNOWLEDGE_BASE.workStyle.testing).toBeDefined();
    expect(PERSONAL_KNOWLEDGE_BASE.workStyle.prioritization).toBeDefined();
  });

  it("enforces strict anti-hallucination guardrails", () => {
    expect(PERSONAL_KNOWLEDGE_BASE.strictGuardrails.rule).toContain("NEVER hallucinate");
  });
});

describe("Spoken Text Cleaner for Voice TTS", () => {
  it("removes markdown headers, bolding, and bullet points", () => {
    const raw = "### Here is my answer:\n* I worked on **RotorDyn** with `FastAPI`.\n* It was high performance.";
    const cleaned = cleanSpokenText(raw);

    expect(cleaned).not.toContain("###");
    expect(cleaned).not.toContain("**");
    expect(cleaned).not.toContain("`");
    expect(cleaned).not.toContain("*");
    expect(cleaned).toContain("I worked on RotorDyn with FastAPI");
  });

  it("strips robotic boilerplate openings", () => {
    const raw1 = "That's a great question! My biggest strength is execution.";
    expect(cleanSpokenText(raw1)).toBe("My biggest strength is execution.");

    const raw2 = "Certainly! I push my boundaries by taking on unfamiliar problems.";
    expect(cleanSpokenText(raw2)).toBe("I push my boundaries by taking on unfamiliar problems.");

    const raw3 = "Sure thing! When building AfterQuery, we debugged race conditions.";
    expect(cleanSpokenText(raw3)).toBe("When building AfterQuery, we debugged race conditions.");
  });

  it("handles markdown links cleanly", () => {
    const raw = "Check out my work on [RotorDyn](https://example.com/rotordyn) where I built the backend.";
    expect(cleanSpokenText(raw)).toBe("Check out my work on RotorDyn where I built the backend.");
  });
});

describe("Rate Limiter Verification", () => {
  it("allows normal request rates and tracks remaining requests", () => {
    const testIp = "test-user-" + Date.now();
    const result1 = globalRateLimiter.check(testIp);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBeGreaterThan(0);
  });
});
