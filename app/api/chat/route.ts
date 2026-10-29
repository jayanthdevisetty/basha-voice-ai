import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatService } from "@/lib/chat-service";
import { globalRateLimiter } from "@/lib/rate-limiter";

export const runtime = "nodejs";

const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1500),
      })
    )
    .optional()
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Identify client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwarded?.split(",")[0]?.trim() || realIp || "127.0.0.1";

    const rateLimit = globalRateLimiter.check(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please take a brief breath before asking another question.",
          retryAfterMs: rateLimit.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2. Parse and validate JSON body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message, conversationHistory } = validation.data;

    // 3. Generate response using ChatService
    const result = await chatService.generateReply(message, conversationHistory);

    return NextResponse.json(
      {
        reply: result.reply,
        model: result.modelUsed,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (err: unknown) {
    console.error("Unhandled error in /api/chat:", err);
    return NextResponse.json(
      {
        error: "I ran into a temporary technical issue processing that. Please try asking again.",
      },
      { status: 500 }
    );
  }
}
