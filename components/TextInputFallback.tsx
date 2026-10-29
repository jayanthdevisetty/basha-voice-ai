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
    <div className="w-full max-w-2xl mx-auto my-3 font-sans">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-xs pointer-events-none">
            &gt;
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or query (or speak naturally above)..."
            disabled={disabled || state === "thinking"}
            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 text-xs rounded-lg pl-7 pr-10 py-3 border border-zinc-800 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || disabled || state === "thinking"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 rounded transition-colors"
            title="Send query (Enter)"
            aria-label="Send query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Continuous Voice Loop Toggle */}
        <button
          type="button"
          onClick={onToggleContinuous}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-[11px] font-mono transition-all ${
            continuousMode
              ? "bg-zinc-900 border-zinc-700 text-zinc-200"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
          title={
            continuousMode
              ? "Mode: Auto-Listen Active"
              : "Mode: Manual Push-To-Talk"
          }
        >
          {continuousMode ? (
            <>
              <Mic className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">AUTO-LOOP</span>
            </>
          ) : (
            <>
              <MicOff className="w-3 h-3 text-zinc-500" />
              <span className="hidden sm:inline">MANUAL</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
