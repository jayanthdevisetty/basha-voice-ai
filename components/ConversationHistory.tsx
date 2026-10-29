"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/hooks/useVoiceConversation";
import { Play, Pause, Copy, Check, Terminal, Cpu } from "lucide-react";

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
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);

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

  const handlePlaySegment = (id: string, text: string) => {
    if (activePlaybackId === id) {
      window.speechSynthesis.cancel();
      setActivePlaybackId(null);
      return;
    }
    setActivePlaybackId(id);
    onReplay(text);

    // Approximate duration estimate based on 150 words per minute
    const wordCount = text.split(/\s+/).length;
    const durationMs = Math.max(3000, (wordCount / 2.5) * 1000);
    setTimeout(() => {
      setActivePlaybackId((curr) => (curr === id ? null : curr));
    }, durationMs);
  };

  if (messages.length === 0) {
    return null;
  }

  // Pre-generate bar heights for scrubber aesthetic
  const scrubberPattern = [6, 12, 18, 10, 15, 22, 14, 8, 16, 20, 11, 17, 9, 13, 5];

  return (
    <div className="w-full max-w-3xl mx-auto my-4 font-sans">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-surface-container-high text-[11px] font-mono text-tertiary">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="uppercase tracking-wider font-semibold text-on-surface">
            Editorial Transcript Axis ({messages.length} Exchanges)
          </span>
        </div>
        <button
          onClick={onClear}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Clear History
        </button>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[500px] overflow-y-auto space-y-6 py-4 px-1"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLatest = idx === messages.length - 1;
          const isPrior = !isLatest && idx < messages.length - 2;

          const timeStr = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "10:42 AM";

          if (isUser) {
            return (
              <div
                key={msg.id}
                className={`flex flex-col items-end self-end ml-auto max-w-[88%] transition-opacity duration-300 ${
                  isPrior ? "opacity-55 hover:opacity-100" : "opacity-100"
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[11px]">
                  <span className="uppercase tracking-widest text-on-surface-variant font-medium">
                    YOU
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-tertiary">{timeStr}</span>
                </div>

                {/* User Bubble */}
                <div className="bg-surface-container px-4 py-3 rounded-2xl text-on-surface shadow-xs">
                  <p className="font-sans text-sm sm:text-base font-medium leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          }

          // Agent Turn
          const isPlayingThis = activePlaybackId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col items-start self-start w-full transition-opacity duration-300 ${
                isPrior ? "opacity-60 hover:opacity-100" : "opacity-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full mb-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-widest text-primary font-bold">
                    BASHA
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant" />
                  <span className="text-tertiary">Shaik Rameez Basha Engine</span>
                  {msg.latencyMs && (
                    <>
                      <span className="text-outline-variant">•</span>
                      <span className="text-on-surface font-medium">
                        {msg.latencyMs}ms
                      </span>
                    </>
                  )}
                  {msg.model && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-tertiary">
                      <Cpu className="w-3 h-3 text-primary" />
                      {msg.model.replace("models/", "")}
                    </span>
                  )}
                </div>
                <span className="text-tertiary">{timeStr}</span>
              </div>

              {/* Content Card with Architectural Contrast Line (from Stitch conversation.html) */}
              <div className="relative w-full bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container-high/60 pl-6">
                {/* Terracotta left accent hairline bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />

                <p className="font-quote-transcript text-on-surface leading-relaxed text-[17px] sm:text-[18px] font-normal whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* In-line Mini Audio Scrubber for Previous Utterance Playback */}
                <div className="mt-4 pt-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2 rounded-lg select-none">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handlePlaySegment(msg.id, msg.content)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 ${
                        isPlayingThis
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-lowest text-on-surface hover:text-primary"
                      }`}
                      title={isPlayingThis ? "Stop Playback" : "Replay Voice Segment"}
                      type="button"
                    >
                      {isPlayingThis ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                      )}
                    </button>
                    <span
                      onClick={() => handlePlaySegment(msg.id, msg.content)}
                      className="font-mono text-[11px] text-tertiary hover:text-on-surface font-medium cursor-pointer"
                    >
                      {isPlayingThis ? "Playing Voice Audio..." : "Voice Segment Playback"}
                    </span>
                  </div>

                  {/* Discrete interactive animated audio bar representation */}
                  <div
                    onClick={() => handlePlaySegment(msg.id, msg.content)}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="flex items-end gap-[3px] h-6 px-1.5">
                      {scrubberPattern.map((h, i) => (
                        <div
                          key={i}
                          className={`w-[3px] rounded-full transition-all duration-150 ${
                            isPlayingThis
                              ? "bg-primary animate-pulse"
                              : i < 6
                              ? "bg-primary"
                              : "bg-outline-variant group-hover:bg-primary/50"
                          }`}
                          style={{
                            height: isPlayingThis ? `${Math.floor(Math.random() * 16) + 6}px` : `${h}px`,
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(msg.id, msg.content);
                      }}
                      className="ml-2 p-1 text-tertiary hover:text-on-surface transition-colors"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
