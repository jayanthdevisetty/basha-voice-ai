"use client";

import React from "react";
import { ConversationState } from "@/hooks/useVoiceConversation";
import { Mic, Volume2, Loader2, AlertCircle, Square, ArrowUp } from "lucide-react";

interface VoiceVisualizerProps {
  state: ConversationState;
  interimTranscript: string;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
  onInterrupt: () => void;
  onCommitSpeech: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  interimTranscript,
  audioLevel,
  onStart,
  onStop,
  onInterrupt,
  onCommitSpeech,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-8">
      {/* Central Visual Orb */}
      <div className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56 my-4">
        {/* Ambient Glow Rings */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 blur-2xl opacity-40 ${
            state === "listening"
              ? "bg-emerald-500 scale-110"
              : state === "speaking"
              ? "bg-indigo-500 scale-125"
              : state === "thinking"
              ? "bg-purple-500 scale-105 animate-pulse"
              : state === "error"
              ? "bg-amber-500 scale-95"
              : "bg-zinc-700 scale-90"
          }`}
        />

        {/* Outer Ring */}
        <div
          className={`absolute inset-2 rounded-full border transition-all duration-500 flex items-center justify-center ${
            state === "listening"
              ? "border-emerald-500/50 scale-105"
              : state === "speaking"
              ? "border-indigo-500/60 scale-110"
              : state === "thinking"
              ? "border-purple-500/40 animate-spin"
              : state === "error"
              ? "border-amber-500/40"
              : "border-zinc-800"
          }`}
        />

        {/* Core Interactive Center Button / Display */}
        <div
          className={`relative z-10 w-36 h-36 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
            state === "listening"
              ? "bg-gradient-to-b from-zinc-900 to-emerald-950/40 border border-emerald-500/50 shadow-emerald-500/20"
              : state === "speaking"
              ? "bg-gradient-to-b from-zinc-900 to-indigo-950/40 border border-indigo-500/50 shadow-indigo-500/20"
              : state === "thinking"
              ? "bg-gradient-to-b from-zinc-900 to-purple-950/40 border border-purple-500/50 shadow-purple-500/20"
              : state === "error"
              ? "bg-gradient-to-b from-zinc-900 to-amber-950/40 border border-amber-500/50 shadow-amber-500/20"
              : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-black/40"
          }`}
        >
          {state === "idle" && (
            <button
              onClick={onStart}
              className="flex flex-col items-center justify-center w-full h-full text-zinc-300 hover:text-white transition-colors group"
              aria-label="Start Conversation"
            >
              <Mic className="w-9 h-9 mb-2 text-zinc-400 group-hover:text-white transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">
                Start
              </span>
            </button>
          )}

          {state === "listening" && (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 h-8 mb-2">
                {[0.4, 0.8, 1, 0.7, 0.5].map((scale, i) => (
                  <span
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(6, (audioLevel * scale * 32) + 4)}px`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-emerald-400 animate-pulse">
                Listening...
              </span>
            </div>
          )}

          {state === "thinking" && (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
              <span className="text-xs font-medium text-purple-300">
                Thinking...
              </span>
            </div>
          )}

          {state === "speaking" && (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 h-8 mb-2">
                {[0.6, 1, 0.8, 0.9, 0.5, 0.7].map((scale, i) => (
                  <span
                    key={i}
                    className="w-1 bg-indigo-400 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(6, (audioLevel * scale * 28) + 6)}px`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-indigo-400">
                Speaking...
              </span>
            </div>
          )}

          {state === "error" && (
            <button
              onClick={onStart}
              className="flex flex-col items-center justify-center text-amber-400 hover:text-amber-300 transition-colors"
              aria-label="Retry conversation"
            >
              <AlertCircle className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">Try Again</span>
            </button>
          )}
        </div>
      </div>

      {/* State Label & Subtext */}
      <div className="text-center mt-2 min-h-[56px] px-4 max-w-md">
        {state === "idle" && (
          <div>
            <h3 className="text-base font-medium text-zinc-200">Ready to talk</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Click the microphone or press Start Conversation to begin.
            </p>
          </div>
        )}

        {state === "listening" && (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Listening... Speak naturally
            </div>
            {interimTranscript ? (
              <p className="text-sm text-zinc-300 italic font-sans break-words bg-zinc-900/60 py-1.5 px-3 rounded-lg border border-zinc-800">
                &ldquo;{interimTranscript}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-zinc-400">
                I am listening. Ask me about my projects, superpower, or growth areas.
              </p>
            )}
          </div>
        )}

        {state === "thinking" && (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              Reflecting on my knowledge base...
            </div>
          </div>
        )}

        {state === "speaking" && (
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Speaking...
            </div>
            <button
              onClick={onInterrupt}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md border border-zinc-700 transition-colors"
            >
              <Square className="w-3 h-3 text-red-400 fill-red-400" />
              Interrupt
            </button>
          </div>
        )}

        {state === "error" && (
          <div>
            <p className="text-sm text-amber-300 font-medium">
              I couldn&apos;t hear that clearly.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Click Try Again or send your question using the text box below.
            </p>
          </div>
        )}
      </div>

      {/* Immediate Commit Button when speech is captured */}
      {state === "listening" && interimTranscript && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onCommitSpeech}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Send Now
          </button>
        </div>
      )}

      {/* Quick Controls Bar */}
      {state !== "idle" && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={onStop}
            className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
          >
            Pause Conversation
          </button>
        </div>
      )}
    </div>
  );
};
