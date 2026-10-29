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
    <div className="w-full max-w-3xl mx-auto my-3 font-sans">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or query (or speak naturally via microphone)..."
            disabled={disabled || state === "thinking"}
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-tertiary text-xs sm:text-sm rounded-xl pl-4 pr-11 py-3 border border-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || disabled || state === "thinking"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-on-primary bg-primary hover:bg-primary-container disabled:opacity-30 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
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
          className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-[11px] font-mono transition-all shadow-xs cursor-pointer ${
            continuousMode
              ? "bg-surface-container-lowest border-primary/50 text-primary font-semibold"
              : "bg-surface-container border-surface-container-high text-tertiary hover:text-on-surface"
          }`}
          title={
            continuousMode
              ? "Continuous Voice Mode: Auto-rearms microphone after speaking"
              : "Manual Mode: Push-to-talk per turn"
          }
        >
          {continuousMode ? (
            <>
              <Mic className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">AUTO-LOOP ON</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-tertiary" />
              <span className="hidden sm:inline">MANUAL</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
