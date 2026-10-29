"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/hooks/useVoiceConversation";
import { Volume2, Copy, Check, User, Sparkles } from "lucide-react";

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
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

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

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 text-xs text-zinc-400">
        <span className="font-mono tracking-wider uppercase text-[10px] text-zinc-500">
          Session Transcript ({messages.length})
        </span>
        <button
          onClick={onClear}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-[11px]"
        >
          Reset Session
        </button>
      </div>

      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto space-y-4 py-4 px-3 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-zinc-500">
                {isUser ? (
                  <>
                    <span>You</span>
                    <User className="w-3 h-3 text-zinc-400" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span className="text-zinc-300">Basha</span>
                  </>
                )}
              </div>

              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
                  isUser
                    ? "bg-zinc-800/90 text-zinc-100 rounded-tr-none border border-zinc-700/60"
                    : "bg-zinc-900/90 text-zinc-200 rounded-tl-none border border-zinc-800 shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Message Action Utilities */}
                <div className="mt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                    title="Copy to clipboard"
                    aria-label="Copy message text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  {!isUser && (
                    <button
                      onClick={() => onReplay(msg.content)}
                      className="p-1 text-zinc-500 hover:text-indigo-400 rounded transition-colors"
                      title="Replay spoken audio"
                      aria-label="Listen again"
                    >
                      <Volume2 className="w-3 h-3" />
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
