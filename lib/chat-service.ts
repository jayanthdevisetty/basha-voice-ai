import { getSystemPrompt } from "./system-prompt";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  modelUsed: string;
}

/**
 * Clean spoken output so speech synthesis speaks naturally
 * without pronouncing markdown tokens, asterisks, hashes, or robotic openers.
 */
export function cleanSpokenText(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Remove markdown code blocks & inline code
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Remove markdown headers (# Header)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic markdown (**text**, *text*, __text__, _text_)
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove bullet points and list numbers at start of lines
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Replace multiple newlines or spaces with single space
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Strip robotic canned openers if generated
  const roboticOpeners = [
    /^that'?s a great question[.,!]?\s*/i,
    /^great question[.,!]?\s*/i,
    /^certainly[.,!]?\s*/i,
    /^sure thing[.,!]?\s*/i,
    /^absolutely[.,!]?\s*/i,
    /^i'd be happy to answer that[.,!]?\s*/i,
    /^thanks for asking[.,!]?\s*/i,
  ];

  for (const opener of roboticOpeners) {
    cleaned = cleaned.replace(opener, "");
  }

  // Capitalize the first letter if needed
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

export class ChatService {
  private apiKey?: string;
  private model?: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private getApiKey(): string {
    return this.apiKey || process.env.GEMINI_API_KEY || "";
  }

  private getModel(): string {
    return this.model || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  }

  public async generateReply(
    userMessage: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    const key = this.getApiKey();
    const primaryModel = this.getModel();

    if (!key) {
      throw new Error(
        "Server configuration error: GEMINI_API_KEY is not configured on the server."
      );
    }

    // 1. Sanitize user input
    const sanitizedInput = userMessage.trim().slice(0, 1000);
    if (!sanitizedInput) {
      return {
        reply: "I didn't catch that. Could you say it again?",
        modelUsed: primaryModel,
      };
    }

    // 2. Prepare conversation history (last 10 turns for bounded context)
    const recentHistory = history
      .slice(-10)
      .filter((msg) => msg.content && typeof msg.content === "string");

    // Format for Gemini REST API: alternating user and model
    const contents: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];

    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim().slice(0, 1000) }],
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: sanitizedInput }],
    });

    // 3. Assemble Gemini REST payload with system_instruction
    const systemInstruction = getSystemPrompt();
    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        topP: 0.95,
      },
    };

    // Candidate fallback models
    const candidateModels = Array.from(
      new Set([primaryModel, "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"])
    );

    let lastError: Error | null = null;

    for (const modelToTry of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        modelToTry
      )}:generateContent?key=${key}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.text();
          console.warn(`Model ${modelToTry} returned status ${response.status}:`, errorData);

          // If rate limit or temporary server error, try next candidate model
          if (response.status === 429 || response.status === 503 || response.status === 404) {
            continue;
          }

          throw new Error(`LLM provider returned status ${response.status}`);
        }

        const data = await response.json();
        const rawText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm reflecting on that, but couldn't formulate a clear answer just now. Could you rephrase your question?";

        const cleanedReply = cleanSpokenText(rawText);

        return {
          reply: cleanedReply,
          modelUsed: modelToTry,
        };
      } catch (err: unknown) {
        clearTimeout(timeout);
        lastError = err instanceof Error ? err : new Error(String(err));
        // Continue to next fallback model
      }
    }

    return {
      reply:
        "I'm having a brief connection hiccup reaching my thought process. Please take a breath and try asking again.",
      modelUsed: primaryModel,
    };
  }
}

export const chatService = new ChatService();
