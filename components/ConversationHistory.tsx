"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/hooks/useVoiceConversation";
import { Volume2, Copy, Check, Terminal, Cpu } from "lucide-react";

interface ConversationHistoryProps {
  messages: Message[];
  onReplay: (text: string) => void;
  onClear: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  onReplay,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplay = (id: string, text: string) => {
    setActiveAudioId(id);
    onReplay(text);
    setTimeout(() => setActiveAudioId(null), 4000);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-4 font-sans">
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-900 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-zinc-500" />
          <span className="uppercase tracking-wider text-zinc-400">
            Transcript Inspector ({messages.length} Events)
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear Log
        </button>
      </div>

      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto space-y-3 py-3 px-1 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const turnNumber = Math.floor(idx / 2) + 1;
          const timeStr = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "";

          return (
            <div
              key={msg.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isUser
                  ? "bg-zinc-950/60 border-zinc-900 ml-6"
                  : "bg-zinc-900/40 border-zinc-800/80 mr-6"
              }`}
            >
              {/* Header Meta */}
              <div className="flex items-center justify-between text-[11px] font-mono mb-2 pb-1.5 border-b border-zinc-900/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      isUser ? "text-zinc-400" : "text-zinc-200"
                    }`}
                  >
                    {isUser ? "USER // INPUT" : "BASHA // AGENT"}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-500">#{turnNumber.toString().padStart(2, "0")}</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-500">
                  {!isUser && msg.latencyMs && (
                    <span className="text-zinc-400">
                      ⚡ {msg.latencyMs}ms
                    </span>
                  )}
                  {!isUser && msg.model && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-zinc-500">
                      <Cpu className="w-2.5 h-2.5" />
                      {msg.model.replace("models/", "")}
                    </span>
                  )}
                  <span className="text-zinc-600">{timeStr}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Footer Action Strip */}
              <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-zinc-900/40 text-[11px] font-mono text-zinc-500">
                <div className="text-[10px] text-zinc-600">
                  {isUser ? "VOICE/TEXT INGESTED" : "SYNTHESIZED VOCAL OUTPUT"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="inline-flex items-center gap-1 p-1 hover:text-zinc-200 transition-colors"
                    title="Copy to clipboard"
                    aria-label="Copy text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span className="text-[10px]">
                      {copiedId === msg.id ? "COPIED" : "COPY"}
                    </span>
                  </button>

                  {!isUser && (
                    <button
                      onClick={() => handleReplay(msg.id, msg.content)}
                      className={`inline-flex items-center gap-1 p-1 transition-colors ${
                        activeAudioId === msg.id
                          ? "text-emerald-400"
                          : "hover:text-zinc-200"
                      }`}
                      title="Replay TTS output"
                      aria-label="Replay speech"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span className="text-[10px]">
                        {activeAudioId === msg.id ? "PLAYING..." : "REPLAY"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
