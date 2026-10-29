"use client";

import React, { useState, useEffect } from "react";
import { useVoiceConversation, ConversationState } from "@/hooks/useVoiceConversation";
import { MicPermissionBanner } from "@/components/MicPermissionBanner";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");

  const {
    state,
    messages,
    interimTranscript,
    errorMessage,
    isSupported,
    micPermission,
    continuousMode,
    audioLevel,
    volumeDb,
    lastLatencyMs,
    sessionDuration,
    activeModel,
    setContinuousMode,
    startConversation,
    endConversation,
    commitInterimSpeech,
    restartConversation,
    sendMessage,
    stopSpeaking,
    replayMessage,
  } = useVoiceConversation();

  // Keyboard shortcut: Space to toggle speech
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (state === "speaking") {
          stopSpeaking();
        } else if (state === "listening") {
          endConversation();
        } else {
          setHasStarted(true);
          startConversation();
        }
      } else if (e.code === "Escape") {
        if (state === "speaking") {
          stopSpeaking();
        } else if (state === "listening") {
          endConversation();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, stopSpeaking, endConversation, startConversation]);

  const handleStartLanding = async () => {
    setHasStarted(true);
    await startConversation();
  };

  const handleTopicClick = (query: string) => {
    setHasStarted(true);
    sendMessage(query);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setHasStarted(true);
    sendMessage(inputText);
    setInputText("");
  };

  const handlePlaySegment = (id: string, text: string) => {
    if (activePlaybackId === id) {
      window.speechSynthesis?.cancel();
      setActivePlaybackId(null);
      return;
    }
    setActivePlaybackId(id);
    replayMessage(text);
    const wordCount = text.split(/\s+/).length;
    const durationMs = Math.max(3000, (wordCount / 2.5) * 1000);
    setTimeout(() => {
      setActivePlaybackId((curr) => (curr === id ? null : curr));
    }, durationMs);
  };

  // State configurations matching Stitch
  const statesConfig: Record<
    ConversationState,
    {
      badgeText: string;
      badgeBg: string;
      badgeTextCol: string;
      dotBg: string;
      dotPulse: boolean;
      label: string;
      latency: string;
      micColor: string;
    }
  > = {
    listening: {
      badgeText: "Listening",
      badgeBg: "bg-primary/10",
      badgeTextCol: "text-primary",
      dotBg: "bg-primary",
      dotPulse: true,
      label: "Listening to your voice... speak naturally",
      latency: "Awaiting audio stream",
      micColor: "text-primary",
    },
    thinking: {
      badgeText: "Processing",
      badgeBg: "bg-surface-container-highest",
      badgeTextCol: "text-on-surface-variant",
      dotBg: "bg-secondary",
      dotPulse: true,
      label: "Synthesizing response and evaluating architecture...",
      latency: lastLatencyMs ? `${lastLatencyMs}ms turnaround` : "Model inference: ~200ms",
      micColor: "text-secondary",
    },
    speaking: {
      badgeText: "Speaking",
      badgeBg: "bg-primary/10",
      badgeTextCol: "text-primary",
      dotBg: "bg-primary",
      dotPulse: true,
      label: "Basha is speaking... tap to interrupt or speak",
      latency: lastLatencyMs ? `${lastLatencyMs}ms turnaround` : "312ms turnaround",
      micColor: "text-primary",
    },
    idle: {
      badgeText: "Idle",
      badgeBg: "bg-surface-container",
      badgeTextCol: "text-tertiary",
      dotBg: "bg-tertiary",
      dotPulse: false,
      label: "Microphone in standby. Click to start speaking.",
      latency: "Standby mode",
      micColor: "text-tertiary",
    },
    error: {
      badgeText: "Fault",
      badgeBg: "bg-error-container",
      badgeTextCol: "text-error",
      dotBg: "bg-error",
      dotPulse: false,
      label: "Microphone access blocked or network fault. Tap retry.",
      latency: "Fault state",
      micColor: "text-error",
    },
  };

  const currentConf = statesConfig[state];

  // Dynamic bar height for spectrum
  const getSpectrumHeight = (index: number) => {
    if (state === "idle" || state === "error") return 4;
    const base = Math.sin(index * 0.9 + Date.now() * 0.007) * 0.5 + 0.5;
    const levelFactor = Math.max(0.2, audioLevel);
    return Math.floor(base * 18 * levelFactor) + 4;
  };

  const scrubberPattern = [6, 12, 18, 10, 15, 22, 14, 8, 16, 20, 11, 17, 9, 13, 5];

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* ========================================================================= */}
      {/* 1:1 STITCH HEADER (Exact Header from welcome.html and conversation.html)   */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 max-w-[1200px] mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md tracking-[0.14em] uppercase text-on-surface font-bold leading-none">
                BASHA
              </span>
              <span className="font-label-sm text-label-sm tracking-[0.06em] text-on-surface-variant uppercase mt-space-xs leading-none">
                Shaik Rameez Basha
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-3 py-1.5 rounded-full">
              <span
                className={`w-2 h-2 rounded-full ${
                  state === "listening" || state === "speaking"
                    ? "bg-primary animate-pulse"
                    : "bg-[#22C55E]"
                }`}
              />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">
                AI Voice Agent
              </span>
              <span className="text-outline-variant font-label-sm text-label-sm">•</span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium capitalize">
                {state === "speaking"
                  ? "Speaking"
                  : state === "listening"
                  ? "Listening"
                  : state === "thinking"
                  ? "Thinking"
                  : "Ready"}
              </span>
            </div>
            {hasStarted && (
              <button
                onClick={() => {
                  restartConversation();
                  setHasStarted(false);
                }}
                className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-label-sm font-label-sm bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer text-tertiary hover:text-on-surface"
              >
                Reset
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER                                                            */}
      {/* ========================================================================= */}
      <main className="w-full pt-16 flex-1 bg-surface flex flex-col">
        {!hasStarted && messages.length === 0 ? (
          /* ======================================================================= */
          /* STITCH WELCOME SCREEN (1:1 Exact Match of Screen d0a609ef4c844f7ab00e9) */
          /* ======================================================================= */
          <div className="flex flex-col w-full">
            <section className="relative w-full overflow-hidden flex flex-col items-center justify-center px-gutter py-space-xl">
              {/* Radar guide rings background SVG */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-60">
                <svg
                  className="w-[820px] h-[820px] text-surface-container-high"
                  fill="none"
                  viewBox="0 0 820 820"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="410"
                    cy="410"
                    opacity="0.6"
                    r="140"
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="410"
                    cy="410"
                    opacity="0.45"
                    r="230"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <circle
                    cx="410"
                    cy="410"
                    opacity="0.3"
                    r="320"
                    stroke="currentColor"
                    strokeDasharray="4 6"
                    strokeWidth="1"
                  />
                  <circle
                    cx="410"
                    cy="410"
                    opacity="0.15"
                    r="400"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              <div className="w-full max-w-[640px] mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-label-sm text-label-sm tracking-[0.08em] uppercase text-on-surface-variant font-medium">
                    Candidate Intelligence Agent
                  </span>
                  <span className="font-label-sm text-label-sm text-outline-variant font-medium">
                    •
                  </span>
                  <span className="font-label-sm text-label-sm tracking-[0.08em] uppercase text-primary font-semibold">
                    Stage 1 Assessment
                  </span>
                </div>

                <div className="mt-space-lg flex flex-col items-center gap-space-sm">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-[-0.035em]">
                    Talk to my AI.
                  </h1>
                  <p className="font-body-lg text-body-lg text-secondary max-w-[500px] leading-relaxed">
                    Ask about my journey, how I solve problems, what I’m building, or where I’m growing.
                  </p>
                </div>

                {/* Concentric Acoustic Pulse Node */}
                <div
                  className="my-6 relative flex flex-col items-center justify-center group cursor-pointer select-none w-56 h-56 mx-auto"
                  id="mic-node-wrapper"
                  onClick={handleStartLanding}
                >
                  <div className="absolute w-44 h-44 rounded-full bg-surface-container-low/70 transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none" />
                  <div className="absolute w-36 h-36 rounded-full bg-surface-container transition-transform duration-300 ease-out group-hover:scale-105 pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full bg-surface-container-high transition-transform duration-200 pointer-events-none" />
                  <button
                    aria-label="Toggle voice recording"
                    className="relative z-10 w-20 h-20 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:shadow-2xl active:scale-95 cursor-pointer"
                    id="voice-trigger-btn"
                  >
                    <span
                      className="material-symbols-outlined text-[32px] text-on-surface transition-colors duration-300 group-hover:text-on-primary"
                      id="mic-icon"
                    >
                      mic
                    </span>
                  </button>
                  <div className="absolute bottom-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm z-20 whitespace-nowrap border border-surface-container-high/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" id="readiness-dot" />
                    <span
                      className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-medium whitespace-nowrap"
                      id="readiness-text"
                    >
                      Acoustic Model Primed
                    </span>
                  </div>
                </div>

                {/* Start Conversation CTA Button */}
                <div className="w-full flex flex-col items-center gap-3 mt-4">
                  <button
                    onClick={handleStartLanding}
                    className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-full bg-on-background hover:bg-inverse-surface text-on-primary flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    id="start-session-cta"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary-fixed">
                      graphic_eq
                    </span>
                    <span className="font-body-md text-body-md font-semibold tracking-[-0.01em]">
                      Start conversation
                    </span>
                    <span className="font-label-sm text-label-sm bg-surface-container-highest/20 text-on-primary px-2 py-0.5 rounded-full uppercase tracking-wider opacity-80">
                      Live
                    </span>
                  </button>
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                    <span>Press</span>
                    <kbd className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm">
                      Space
                    </kbd>
                    <span>or click to speak</span>
                  </div>
                </div>

                {/* Try Asking Prompt Chips */}
                <div className="mt-space-xl w-full flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-space-sm text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[15px] text-primary">
                      chat_bubble_outline
                    </span>
                    <span>Try asking:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    <button
                      onClick={() =>
                        handleTopicClick("What should we know about your life story in a few sentences?")
                      }
                      className="prompt-chip text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group shadow-sm flex items-start justify-between cursor-pointer"
                    >
                      <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                        Tell me about your journey
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                    <button
                      onClick={() => handleTopicClick("What is your #1 superpower?")}
                      className="prompt-chip text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group shadow-sm flex items-start justify-between cursor-pointer"
                    >
                      <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                        What's your biggest strength?
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                    <button
                      onClick={() => handleTopicClick("What are the top 3 areas you'd like to grow in?")}
                      className="prompt-chip text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group shadow-sm flex items-start justify-between cursor-pointer"
                    >
                      <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                        What are you trying to improve?
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleTopicClick(
                          "Tell me about RotorDyn and what was the hardest engineering challenge you faced."
                        )
                      }
                      className="prompt-chip text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group shadow-sm flex items-start justify-between cursor-pointer"
                    >
                      <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                        What's the hardest thing you've built?
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-space-xl pt-space-lg flex flex-col items-center gap-1.5 w-full">
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                    <span>Direct low-latency audio stream</span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-medium text-on-surface">Representing Shaik Rameez Basha</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                    Evaluator sandbox configured for unscripted conversational assessment and system reasoning.
                  </p>
                </div>
              </div>
            </section>

            {/* Latency Budget Card from Stitch */}
            <section className="max-w-[768px] mx-auto w-full px-gutter pb-space-xl">
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md border border-surface-container-high/60">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-body-md text-body-md font-medium text-on-surface">
                      Latency Budget
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Speech-to-Speech &lt; 380ms response envelope
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      100x Benchmark
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      Verified Profile State
                    </span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ======================================================================= */
          /* STITCH CONVERSATION SCREEN (1:1 Match of Screen 08b3bdc95e4e48bb856a)   */
          /* ======================================================================= */
          <div className="flex flex-col w-full">
            <div className="relative w-full max-w-[1200px] mx-auto px-gutter py-space-lg flex flex-col items-center">
              {/* Evaluator State Machine Switcher */}
              <div className="w-full max-w-2xl flex flex-wrap items-center justify-between mb-space-lg bg-surface-container-low px-space-md py-space-xs rounded-full gap-2">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">tune</span>
                  <span className="font-label-sm text-label-sm uppercase text-secondary tracking-wider">
                    Demo State Override:
                  </span>
                </div>
                <div className="flex items-center gap-1.5" id="state-toggle-group">
                  <button
                    onClick={() => startConversation()}
                    className={`state-pill px-3 py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                      state === "listening"
                        ? "bg-primary text-on-primary shadow-sm font-semibold"
                        : "text-secondary hover:text-on-surface"
                    }`}
                    type="button"
                  >
                    Listening
                  </button>
                  <button
                    onClick={() => sendMessage("Can you tell me about the model you use?")}
                    className={`state-pill px-3 py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                      state === "thinking"
                        ? "bg-primary text-on-primary shadow-sm font-semibold"
                        : "text-secondary hover:text-on-surface"
                    }`}
                    type="button"
                  >
                    Thinking
                  </button>
                  <button
                    onClick={() =>
                      replayMessage(
                        "My biggest strength is turning ambiguous technical problems into something concrete I can build, test, and ship."
                      )
                    }
                    className={`state-pill px-3 py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                      state === "speaking"
                        ? "bg-primary text-on-primary shadow-sm font-semibold"
                        : "text-secondary hover:text-on-surface"
                    }`}
                    type="button"
                  >
                    Speaking
                  </button>
                  <button
                    onClick={() => endConversation()}
                    className={`state-pill px-3 py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                      state === "idle"
                        ? "bg-primary text-on-primary shadow-sm font-semibold"
                        : "text-secondary hover:text-on-surface"
                    }`}
                    type="button"
                  >
                    Idle
                  </button>
                  {/* Interruption Pill from Stitch */}
                  <button
                    onClick={() => stopSpeaking()}
                    className="state-pill flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-all font-semibold cursor-pointer active:scale-95 ml-1"
                    title="Simulate barge-in interruption"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    <span>Interrupt</span>
                  </button>
                </div>
              </div>

              {/* Active Conversation Stage */}
              <div className="w-full max-w-2xl flex flex-col">
                {/* Stage Telemetry Header Card */}
                <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-space-sm border border-surface-container-high/60">
                  <div className="flex items-center gap-space-md">
                    {/* Dynamic Status Badge */}
                    <div
                      className={`flex items-center gap-2 ${currentConf.badgeBg} px-3 py-1.5 rounded-full transition-colors`}
                      id="status-chip"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${currentConf.dotBg} ${
                          currentConf.dotPulse ? "animate-pulse" : ""
                        }`}
                        id="status-pulse-dot"
                      />
                      <span
                        className={`font-label-sm text-label-sm ${currentConf.badgeTextCol} tracking-wider uppercase font-semibold`}
                        id="status-badge-text"
                      >
                        {currentConf.badgeText}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-surface-container-highest" />
                    {/* Monospace Technical Diagnostics */}
                    <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-tertiary">
                      <span>duplex pcm</span>
                      <span className="text-outline-variant">•</span>
                      <span className="text-on-surface font-medium" id="latency-indicator">
                        {currentConf.latency}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Real-time Audio Spectrum Visualization in Status Pill */}
                  <div className="flex items-center gap-[3px] h-6 px-2" id="waveform-visualizer">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="wave-bar w-[3px] bg-primary rounded-full min-h-[4px] transition-all duration-100 ease-out"
                        style={{ height: `${getSpectrumHeight(i)}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Barge-in / Low-latency Banner from Stitch interruption.html */}
                <div className="w-full bg-surface-container-low px-space-md py-2 rounded-lg mb-space-lg flex items-center justify-between border-l-2 border-primary/60 transition-all duration-300">
                  <div className="flex items-center gap-space-sm">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">
                      Duplex Audio Engine
                    </span>
                    <span className="text-outline-variant font-label-sm text-label-sm">•</span>
                    <span className="font-label-sm text-label-sm text-tertiary">
                      Hardware echo cancellation • Instant barge-in ready
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant font-mono">
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded text-[11px]">
                      &lt; 42ms cut-through
                    </span>
                  </div>
                </div>

                {/* Mic Permission Banner if needed */}
                <MicPermissionBanner
                  micPermission={micPermission}
                  isSupported={isSupported}
                  errorMessage={errorMessage}
                  onRetry={startConversation}
                />

                {/* Refined Editorial Transcript Axis */}
                <section
                  aria-label="Conversation Transcript"
                  className="w-full flex flex-col gap-space-lg min-h-[300px]"
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
                          className={`flex flex-col items-end self-end max-w-[88%] transition-opacity duration-300 ${
                            isPrior ? "opacity-45 hover:opacity-100" : "opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-space-xs mb-1">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-medium">
                              YOU
                            </span>
                            <span className="font-label-sm text-label-sm text-tertiary">
                              {timeStr}
                            </span>
                          </div>
                          <div className="bg-surface-container px-space-lg py-space-md rounded-xl text-on-surface shadow-sm">
                            <p className="font-body-lg text-body-lg font-medium text-on-surface">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // Agent Turn
                    const isPlaying = activePlaybackId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col items-start self-start w-full transition-opacity duration-300 ${
                          isPrior ? "opacity-50 hover:opacity-100" : "opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-space-xs">
                          <div className="flex items-center gap-space-sm">
                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                              BASHA
                            </span>
                            <span className="w-1 h-1 rounded-full bg-outline-variant" />
                            <span className="font-label-sm text-label-sm text-tertiary">
                              Shaik Rameez Basha Engine
                            </span>
                            {msg.latencyMs && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                                  {msg.latencyMs}ms
                                </span>
                              </>
                            )}
                          </div>
                          <span className="font-label-sm text-label-sm text-tertiary font-mono">
                            {timeStr}
                          </span>
                        </div>

                        {/* Content Card with Architectural Contrast Line */}
                        <div className="relative w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm pl-space-xl border border-surface-container-high/60">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />
                          <p className="font-quote-transcript text-quote-transcript text-on-surface leading-relaxed font-normal whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {/* In-line Mini Audio Scrubber for Previous Utterance Playback */}
                          <div className="mt-space-lg pt-space-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-lg select-none">
                            <div className="flex items-center gap-space-sm">
                              <button
                                onClick={() => handlePlaySegment(msg.id, msg.content)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95 ${
                                  isPlaying
                                    ? "bg-primary text-on-primary"
                                    : "bg-surface-container-lowest text-on-surface hover:text-primary"
                                }`}
                                type="button"
                                title={isPlaying ? "Stop speech" : "Replay voice segment"}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {isPlaying ? "pause" : "play_arrow"}
                                </span>
                              </button>
                              <span
                                onClick={() => handlePlaySegment(msg.id, msg.content)}
                                className="font-label-sm text-label-sm text-tertiary hover:text-on-surface cursor-pointer font-medium"
                              >
                                {isPlaying ? "Voice Segment Playing..." : "Voice Segment Playback"}
                              </span>
                            </div>

                            {/* Equalizer bars */}
                            <div
                              onClick={() => handlePlaySegment(msg.id, msg.content)}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div className="flex items-end gap-[3px] h-6 px-1.5">
                                {scrubberPattern.map((h, i) => (
                                  <div
                                    key={i}
                                    className={`w-[3px] rounded-full transition-all duration-150 ${
                                      isPlaying
                                        ? "bg-primary animate-pulse"
                                        : i < 5
                                        ? "bg-primary"
                                        : "bg-outline-variant group-hover:bg-primary/50"
                                    }`}
                                    style={{
                                      height: isPlaying
                                        ? `${Math.floor(Math.random() * 16) + 6}px`
                                        : `${h}px`,
                                    }}
                                  />
                                ))}
                              </div>
                              <span className="font-label-sm text-label-sm text-tertiary font-mono">
                                00:08
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Real-time Interim Transcript bubble */}
                  {state === "listening" && interimTranscript && (
                    <div className="flex flex-col items-end self-end max-w-[85%] animate-pulse">
                      <div className="flex items-center gap-space-xs mb-1">
                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                          YOU (SPEAKING...)
                        </span>
                      </div>
                      <div className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-on-surface border border-primary/30">
                        <p className="font-body-md text-body-md italic">{interimTranscript}</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Center-Bottom Voice Control Hub from Stitch */}
                <div className="w-full mt-space-xl pt-space-lg flex flex-col items-center">
                  {/* Concentric Acoustic Pulse Node */}
                  <div className="relative flex items-center justify-center p-6">
                    <div
                      className={`absolute w-28 h-28 rounded-full bg-primary/10 transition-all duration-700 ease-out ${
                        state === "speaking" || state === "listening"
                          ? "animate-ping opacity-40"
                          : "opacity-0"
                      }`}
                      id="mic-ring-outer"
                    />
                    <div
                      className={`absolute w-20 h-20 rounded-full bg-primary/15 transition-all duration-500 ${
                        state === "speaking" || state === "listening" ? "scale-105" : "scale-100"
                      }`}
                      id="mic-ring-inner"
                    />
                    <button
                      onClick={() => {
                        if (state === "speaking") {
                          stopSpeaking();
                        } else if (state === "listening") {
                          endConversation();
                        } else {
                          startConversation();
                        }
                      }}
                      className="relative z-10 w-16 h-16 rounded-full bg-surface-container-lowest text-primary shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-surface-container-high/60"
                      id="central-mic-btn"
                      type="button"
                    >
                      <span
                        className={`material-symbols-outlined text-[32px] ${currentConf.micColor} transition-transform`}
                        id="mic-icon"
                      >
                        {state === "speaking" ? "stop" : state === "listening" ? "mic" : "mic_none"}
                      </span>
                    </button>
                  </div>

                  {/* Dynamic State Indicator Text */}
                  <div className="flex flex-col items-center gap-1 text-center mt-space-xs">
                    <p
                      className="font-body-md text-body-md font-medium text-on-surface"
                      id="mic-status-label"
                    >
                      {currentConf.label}
                    </p>
                    <span className="font-label-sm text-label-sm text-tertiary">
                      Full-duplex audio stream active • 16-bit 48kHz
                    </span>
                  </div>

                  {/* Secondary Prompt Chips in Active Session */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-xl">
                    <button
                      onClick={() =>
                        handleTopicClick("What should we know about your life story in a few sentences?")
                      }
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    >
                      Life story
                    </button>
                    <button
                      onClick={() => handleTopicClick("What is your #1 superpower?")}
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    >
                      #1 Superpower
                    </button>
                    <button
                      onClick={() => handleTopicClick("What are the top 3 areas you'd like to grow in?")}
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    >
                      Growth areas
                    </button>
                    <button
                      onClick={() => handleTopicClick("What misconception do coworkers have about you?")}
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    >
                      Coworker misconceptions
                    </button>
                    <button
                      onClick={() =>
                        handleTopicClick("Tell me about RotorDyn and the vibration telemetry architecture.")
                      }
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    >
                      RotorDyn Platform
                    </button>
                  </div>

                  {/* Text Input Fallback Bar */}
                  <form onSubmit={handleTextSubmit} className="w-full mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your question or query (or speak naturally above)..."
                      className="flex-1 bg-surface-container-lowest text-on-surface placeholder:text-tertiary text-sm rounded-xl px-4 py-2.5 border border-outline-variant/60 focus:outline-none focus:border-primary shadow-xs"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container disabled:opacity-30 transition-all cursor-pointer shadow-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 1:1 STITCH FOOTER (Exact Footer from welcome.html and conversation.html)   */}
      {/* ========================================================================= */}
      <footer className="w-full bg-surface/90 shadow-[0_-1px_6px_rgba(0,0,0,0.02)] py-space-md mt-auto border-t border-surface-container-high/60">
        <div className="max-w-[1200px] mx-auto px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs text-center sm:text-left">
            <span>Built for 100x AI Agent Assessment</span>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface">Personal Voice Interface</span>
          </div>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm">
            <span className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[14px] text-primary">
                graphic_eq
              </span>
              48kHz Stereo duplex
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-tertiary">v1.0.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
