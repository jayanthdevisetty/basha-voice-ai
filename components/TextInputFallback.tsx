"use client";

import React, { useState } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { ConversationState } from "@/hooks/useVoiceConversation";

interface TextInputFallbackProps {
  onSendMessage: (text: string) => void;
  state: ConversationState;
  continuousMode: boolean;
  onToggleContinuous: () => void;
  disabled?: boolean;
}

export const TextInputFallback: React.FC<TextInputFallbackProps> = ({
  onSendMessage,
  state,
  continuousMode,
  onToggleContinuous,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-3">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question here, or speak naturally..."
            disabled={disabled || state === "thinking"}
            className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-sm rounded-xl pl-4 pr-11 py-3 border border-zinc-800 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || disabled || state === "thinking"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 rounded-lg transition-colors"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Continuous Voice Loop Toggle */}
        <button
          type="button"
          onClick={onToggleContinuous}
          className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-medium transition-all ${
            continuousMode
              ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300"
              : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
          title={
            continuousMode
              ? "Continuous Voice Mode Active (auto-listens after speaking)"
              : "Manual Mode (click to speak)"
          }
        >
          {continuousMode ? (
            <>
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Auto-Listen</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Manual</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
